use rusqlite::{params, Connection, Result};
use std::path::PathBuf;
use tauri::AppHandle;

use crate::model::{Category, Timer};

pub fn db_path(app: &AppHandle) -> PathBuf {
    app.path_resolver()
        .app_data_dir()
        .unwrap_or_else(|| PathBuf::new())
        .join("app.db")
}

pub fn init_db(app: &AppHandle) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(db_path(app))?;

    // Create the category table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS category (
            name TEXT PRIMARY KEY,
            icon_name TEXT NOT NULL
        )",
        [],
    )?;

    // Create the timer table
    conn.execute(
        "CREATE TABLE IF NOT EXISTS timer (
            category_name TEXT NOT NULL,
            start_time INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            FOREIGN KEY (category_name) REFERENCES category(name)
        )",
        [],
    )?;

    // Create the version table if it doesn't exist
    conn.execute(
        "CREATE TABLE IF NOT EXISTS version (
              id INTEGER PRIMARY KEY,
              version TEXT NOT NULL
          )",
        [],
    )?;

    // Insert the initial version if not set
    conn.execute(
          "INSERT INTO version (id, version) SELECT 1, '1.0' WHERE NOT EXISTS (SELECT 1 FROM version WHERE id = 1)",
          [],
      )?;

    check_and_update_db_schema(app)?;
    Ok(())
}

pub fn add_category(app: &AppHandle, name: &str, icon_name: &str) -> Result<()> {
    let conn = Connection::open(db_path(app))?;
    conn.execute(
        "INSERT INTO category (name, icon_name) VALUES (?1, ?2)",
        params![name, icon_name],
    )?;
    Ok(())
}

pub fn get_all_categories(app: &AppHandle) -> Result<Vec<Category>, rusqlite::Error> {
    let conn = Connection::open(db_path(app))?;
    let mut stmt = conn.prepare(
      "SELECT c.name, c.icon_name, IFNULL(SUM(t.duration), 0) AS total_time
       FROM category c
       LEFT JOIN timer t ON c.name = t.category_name AND date('now') = date(t.start_time, 'unixepoch')
       GROUP BY c.name",
  )?;

    let categories = stmt
        .query_map((), |row| {
            Ok(Category {
                name: row.get(0)?,
                icon: row.get(1)?,
                time: row.get(2)?,
            })
        })?
        .collect();

    categories
}

pub fn check_and_update_db_schema(app: &AppHandle) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(db_path(app))?;
    let mut stmt = conn.prepare("SELECT version FROM version WHERE id = 1")?;
    let _db_version: String = stmt.query_row([], |row| row.get(0))?;

    // if db_version != "1.0" { // Assume "1.0" is your current app version
    // }

    Ok(())
}

pub fn add_timer(
    app: &AppHandle,
    category_name: &str,
    start_time: i64,
    duration: i64,
) -> Result<(), rusqlite::Error> {
    let conn = Connection::open(db_path(app))?;
    conn.execute(
        "INSERT INTO timer (category_name, start_time, duration) VALUES (?1, ?2, ?3)",
        params![category_name, start_time, duration],
    )?;
    Ok(())
}

pub fn get_timers(app: &AppHandle) -> Result<Vec<Timer>, rusqlite::Error> {
    let conn = Connection::open(db_path(app))?;
    let mut stmt = conn.prepare(
        "SELECT category_name, start_time, duration FROM timer WHERE date('now') = date(start_time, 'unixepoch')",
    )?;
    let timers = stmt
        .query_map([], |row| {
            Ok(Timer {
                category_name: row.get(0)?,
                start_time: row.get(1)?,
                duration: row.get(2)?,
            })
        })?
        .collect();
    timers
}
