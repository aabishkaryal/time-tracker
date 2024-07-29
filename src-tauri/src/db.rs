use rusqlite::{params, Connection, Result};
use std::path::PathBuf;
use tauri::AppHandle;

use crate::error::DatabaseError;
use crate::model::{Category, Timer};

const DB_VERSION: i32 = 1;

pub fn db_path(app: &AppHandle) -> PathBuf {
    app.path_resolver()
        .app_data_dir()
        .unwrap_or_else(|| PathBuf::new())
        .join("app.db")
}

pub fn init_db(app: &AppHandle) -> Result<(), DatabaseError> {
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
              version INTEGER NOT NULL
          )",
        [],
    )?;

    // Insert the initial version if not set
    conn.execute(
          "INSERT INTO version (id, version) SELECT 1, 0 WHERE NOT EXISTS (SELECT 1 FROM version WHERE id = 1)",
          [],
      )?;

    check_and_update_db_schema(app)?;
    Ok(())
}

pub fn check_and_update_db_schema(app: &AppHandle) -> Result<(), DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    let mut stmt = conn.prepare("SELECT version FROM version WHERE id = 1")?;
    let mut db_version: i32 = stmt.query_row([], |row| row.get(0))?;

    while db_version <= DB_VERSION {
        match db_version {
            0 => {
                // Run migration from version 0 to version 1
                conn.execute(
                    "ALTER TABLE category ADD COLUMN archived INTEGER DEFAULT 0;",
                    [],
                )?;
                conn.execute(
                    "ALTER TABLE category ADD COLUMN current INTEGER DEFAULT 0;",
                    [],
                )?;
                // Update the version number in the database to 1
                conn.execute("UPDATE version SET version = 1 WHERE id = 1;", [])?;
                println!("Migrated database from version 0 to 1");
                db_version = 1;
            }
            DB_VERSION => {
                println!("Database schema is up to date");
                break;
            }
            _ => {
                // Return the VersionNotSupported error
                return Err(DatabaseError::VersionNotSupported(db_version));
            }
        }
    }

    Ok(())
}

pub fn add_category(app: &AppHandle, name: &str, icon_name: &str) -> Result<(), DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    conn.execute(
        "INSERT INTO category (name, icon_name) VALUES (?1, ?2)",
        params![name, icon_name],
    )?;
    Ok(())
}

pub fn get_all_categories_info(app: &AppHandle) -> Result<Vec<Category>, DatabaseError> {
    let conn = Connection::open(db_path(app))?;

    let mut stmt = conn.prepare(
      "SELECT c.name, c.icon_name, IFNULL(SUM(t.duration), 0) AS total_time
       FROM category c
       LEFT JOIN timer t ON c.name = t.category_name AND date('now') = date(t.start_time, 'unixepoch')
       GROUP BY c.name",
  )?;

    let categories_iter = stmt.query_map(params![], |row| {
        Ok(Category {
            name: row.get(0)?,
            icon: row.get(1)?,
            time: row.get(2)?,
        })
    })?;

    // Collect the results into a Vec<Category>
    let categories: Result<Vec<Category>, _> = categories_iter.collect();
    let categories = categories?; // Convert to DatabaseError if needed

    Ok(categories)
}

pub fn get_current_category(app: &AppHandle) -> Result<Option<Category>, DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    let mut stmt = conn.prepare(
      "SELECT c.name, c.icon_name, IFNULL(SUM(t.duration), 0) AS total_time
       FROM category c
       LEFT JOIN timer t ON c.name = t.category_name AND date('now') = date(t.start_time, 'unixepoch')
       WHERE c.current = 1
       GROUP BY c.name",
  )?;

    // Execute the query and map the result
    let mut rows = stmt.query([])?;
    if let Some(row) = rows.next()? {
        let category = Category {
            name: row.get(0)?,
            icon: row.get(1)?,
            time: row.get(2)?,
        };
        Ok(Some(category))
    } else {
        Ok(None)
    }
}

pub fn update_current_category(app: &AppHandle, category_name: &str) -> Result<(), DatabaseError> {
    let conn = Connection::open(db_path(app))?;

    // Start a transaction to ensure atomicity
    conn.execute("BEGIN TRANSACTION;", [])?;

    // Set all categories' current status to 0
    conn.execute("UPDATE category SET current = 0;", [])?;

    // Set the specified category's current status to 1
    conn.execute(
        "UPDATE category SET current = 1 WHERE name = ?1;",
        params![category_name],
    )?;

    // Commit the transaction
    conn.execute("COMMIT;", [])?;

    Ok(())
}

pub fn add_timer(
    app: &AppHandle,
    category_name: &str,
    start_time: i64,
    duration: i64,
) -> Result<(), DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    conn.execute(
        "INSERT INTO timer (category_name, start_time, duration) VALUES (?1, ?2, ?3)",
        params![category_name, start_time, duration],
    )?;
    Ok(())
}

pub fn get_timers(app: &AppHandle) -> Result<Vec<Timer>, DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    let mut stmt = conn.prepare(
        "SELECT category_name, start_time, duration FROM timer WHERE date('now') = date(start_time, 'unixepoch')",
    )?;
    let timers_iter = stmt.query_map([], |row| {
        Ok(Timer {
            category_name: row.get(0)?,
            start_time: row.get(1)?,
            duration: row.get(2)?,
        })
    })?;

    // Collect the reults into a Vec<Timer>
    let timers: Result<Vec<Timer>, _> = timers_iter.collect();
    let timers = timers?;

    Ok(timers)
}
