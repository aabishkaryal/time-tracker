use crate::error::DatabaseError;
use crate::utils::db_path;
use rusqlite::{params, Connection};
use tauri::AppHandle;

const DB_VERSION: i32 = 2;

pub fn init_db(app: &AppHandle) -> Result<(), DatabaseError> {
    let mut conn = Connection::open(db_path(app))?;

    create_tables(&mut conn).map_err(DatabaseError::from)?;

    check_and_update_db_schema(app)?;
    Ok(())
}

pub fn check_and_update_db_schema(app: &AppHandle) -> Result<(), DatabaseError> {
    let mut conn = Connection::open(db_path(app))?;
    let db_version: i32 =
        conn.query_row("SELECT version FROM version WHERE id = 1", [], |row| {
            row.get(0)
        })?;

    if db_version > DB_VERSION {
        return Err(DatabaseError::VersionNotSupported(db_version));
    }

    let migrations: Vec<fn(&mut Connection) -> Result<(), rusqlite::Error>> =
        vec![migrate_from_0_to_1, migrate_from_1_to_2];

    for (_, migrate) in migrations.iter().enumerate().skip(db_version as usize) {
        migrate(&mut conn).map_err(DatabaseError::from)?;
    }

    Ok(())
}

fn create_tables(conn: &mut Connection) -> Result<(), rusqlite::Error> {
    let tx = conn.transaction()?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS category (
      uuid TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      icon_name TEXT NOT NULL,
      archived INTEGER DEFAULT 0,
      current INTEGER DEFAULT 0
      )",
        [],
    )?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS timer (
      category_uuid TEXT NOT NULL,
      start_time INTEGER NOT NULL,
      duration INTEGER NOT NULL,
      FOREIGN KEY (category_uuid) REFERENCES category(uuid)
      )",
        [],
    )?;

    // Create version table to track the schema version
    tx.execute(
        "CREATE TABLE IF NOT EXISTS version (
      id INTEGER PRIMARY KEY,
      version INTEGER NOT NULL
      )",
        [],
    )?;

    // Insert the current schema version into the version table
    tx.execute(
        "INSERT INTO version (id, version)
      SELECT 1, ?1
      WHERE NOT EXISTS (SELECT 1 FROM version WHERE id = 1)",
        params![DB_VERSION],
    )?;

    tx.commit()?;
    Ok(())
}

fn migrate_from_0_to_1(conn: &mut Connection) -> Result<(), rusqlite::Error> {
    println!("Migrating from version 0 to 1");
    let tx = conn.transaction()?;
    tx.execute(
        "ALTER TABLE category ADD COLUMN archived INTEGER DEFAULT 0;",
        [],
    )?;
    tx.execute(
        "ALTER TABLE category ADD COLUMN current INTEGER DEFAULT 0;",
        [],
    )?;
    tx.execute("UPDATE version SET version = 1 WHERE id = 1;", [])?;
    tx.commit()?;
    Ok(())
}

fn migrate_from_1_to_2(conn: &mut Connection) -> Result<(), rusqlite::Error> {
    println!("Migrating from version 1 to 2");
    let tx = conn.transaction()?;

    // Disable foreign key constraints
    tx.execute("PRAGMA foreign_keys = OFF;", [])?;

    // Add the new uuid column to the category table
    tx.execute("ALTER TABLE category ADD COLUMN uuid TEXT;", [])?;

    // Generate UUIDs for all existing entries
    {
        let mut update_stmt = tx.prepare("UPDATE category SET uuid = ?1 WHERE name = ?2")?;
        let category_names: Vec<String> = tx
            .prepare("SELECT name FROM category")?
            .query_map([], |row| row.get(0))?
            .collect::<Result<_, _>>()?;

        for name in category_names {
            let uuid = uuidv7::create();
            update_stmt.execute(params![uuid, name])?;
        }
    }

    // Create a temporary table to migrate data
    tx.execute(
        "CREATE TABLE temp_timer (
          category_uuid TEXT NOT NULL,
          start_time INTEGER NOT NULL,
          duration INTEGER NOT NULL
      );",
        [],
    )?;

    // Copy data from the old timer table to the temporary table
    tx.execute(
        "INSERT INTO temp_timer (category_uuid, start_time, duration)
       SELECT category.uuid, start_time, duration
       FROM timer
       JOIN category ON timer.category_name = category.name;",
        [],
    )?;

    // Drop the old timer table
    tx.execute("DROP TABLE timer;", [])?;

    // Create a new_category table with the correct schema
    tx.execute(
        "CREATE TABLE new_category (
          uuid TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          icon_name TEXT NOT NULL,
          archived INTEGER DEFAULT 0,
          current INTEGER DEFAULT 0
      );",
        [],
    )?;

    // Copy data from the old category table to the new_category table
    tx.execute(
        "INSERT INTO new_category (uuid, name, icon_name, archived, current)
       SELECT uuid, name, icon_name, archived, current FROM category;",
        [],
    )?;

    // Drop the old category table
    tx.execute("DROP TABLE category;", [])?;

    // Rename new_category to category
    tx.execute("ALTER TABLE new_category RENAME TO category;", [])?;

    // Create a new timer table with the foreign key constraint
    tx.execute(
        "CREATE TABLE timer (
            category_uuid TEXT NOT NULL,
            start_time INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            FOREIGN KEY (category_uuid) REFERENCES category(uuid)
        );",
        [],
    )?;

    // Copy data from the temporary table to the new timer table
    tx.execute(
        "INSERT INTO timer (category_uuid, start_time, duration)
         SELECT category_uuid, start_time, duration FROM temp_timer;",
        [],
    )?;

    // Drop the temporary timer table
    tx.execute("DROP TABLE temp_timer;", [])?;

    // 13. Re-enable foreign key constraints
    tx.execute("PRAGMA foreign_keys = ON;", [])?;

    // 14. Update the version number
    tx.execute("UPDATE version SET version = 2 WHERE id = 1;", [])?;

    tx.commit()?;
    Ok(())
}
