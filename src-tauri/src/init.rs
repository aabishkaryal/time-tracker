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

    let migrations: Vec<fn(&mut Connection) -> Result<(), rusqlite::Error>> = vec![];

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
      current INTEGER DEFAULT 0,
      daily_target INTEGER DEFAULT 0
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
