use crate::error::DatabaseError;
use crate::utils::db_path;
use rusqlite::{params, Connection};
use tauri::AppHandle;

const DB_VERSION: i32 = 1;

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

    let migrations: Vec<fn(&mut Connection) -> Result<(), rusqlite::Error>> = vec![
        migrate_from_0_to_1,
        // Add more migrations as needed, e.g., migrate_from_1_to_2
    ];

    for (index, migrate) in migrations.iter().enumerate().skip(db_version as usize) {
        println!("Migrating from version {} to {}", index, index + 1);
        migrate(&mut conn).map_err(DatabaseError::from)?;
    }

    Ok(())
}

fn create_tables(conn: &mut Connection) -> Result<(), rusqlite::Error> {
    let tx = conn.transaction()?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS category (
        name TEXT PRIMARY KEY,
        icon_name TEXT NOT NULL,
        archived INTEGER DEFAULT 0,
        current INTEGER DEFAULT 0
        )",
        [],
    )?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS timer (
        category_name TEXT NOT NULL,
        start_time INTEGER NOT NULL,
        duration INTEGER NOT NULL,
        FOREIGN KEY (category_name) REFERENCES category(name)
        )",
        [],
    )?;

    tx.execute(
        "CREATE TABLE IF NOT EXISTS version (
        id INTEGER PRIMARY KEY,
        version INTEGER NOT NULL
        )",
        [],
    )?;

    tx.execute(
        "INSERT INTO version (id, version)
        SELECT 1, ?1
        WHERE NOT EXISTS (SELECT 1 FROM version WHERE id = 1
        )",
        params![DB_VERSION],
    )?;

    tx.commit()?;
    Ok(())
}

fn migrate_from_0_to_1(conn: &mut Connection) -> Result<(), rusqlite::Error> {
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
