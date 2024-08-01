use rusqlite::{params, Connection, Result};
use tauri::AppHandle;

use crate::error::DatabaseError;
use crate::model::{Category, Timer};
use crate::utils::db_path;

fn map_category(row: &rusqlite::Row) -> Result<Category, rusqlite::Error> {
    Ok(Category {
        name: row.get(0)?,
        icon: row.get(1)?,
        time: row.get(2)?,
    })
}

fn query_categories(
    conn: &Connection,
    condition: Option<&str>,
    date: &str,
) -> Result<Vec<Category>, DatabaseError> {
    let mut query = String::from(
        "SELECT c.name, c.icon_name, IFNULL(SUM(t.duration), 0) AS total_time
       FROM category c
       LEFT JOIN timer t ON c.name = t.category_name AND date(?) = date(t.start_time, 'unixepoch')",
    );

    if let Some(cond) = condition {
        query.push_str(&format!(" WHERE {}", cond));
    }

    query.push_str(" GROUP BY c.name");

    let mut stmt = conn.prepare(&query)?;
    let categories_iter = stmt.query_map([date], |row| map_category(row))?;

    // Collect the results into a Vec<Category>
    let categories: Result<Vec<Category>, _> = categories_iter.collect();
    let categories = categories?; // Convert to DatabaseError if needed

    Ok(categories)
}

pub fn add_category(app: &AppHandle, name: &str, icon_name: &str) -> Result<(), DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    conn.execute(
        "INSERT INTO category (name, icon_name) VALUES (?1, ?2)",
        params![name, icon_name],
    )?;
    Ok(())
}

pub fn get_all_categories_info(
    app: &AppHandle,
    date: &str,
) -> Result<Vec<Category>, DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    query_categories(&conn, None, date)
}

pub fn get_active_categories_info(
    app: &AppHandle,
    date: &str,
) -> Result<Vec<Category>, DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    query_categories(&conn, Some("c.archived = 0"), date)
}

pub fn get_archived_categories_info(
    app: &AppHandle,
    date: &str,
) -> Result<Vec<Category>, DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    query_categories(&conn, Some("c.archived = 1"), date)
}

pub fn get_current_category(app: &AppHandle) -> Result<Option<Category>, DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    let categories = query_categories(&conn, Some("c.current = 1"), "now")?;
    if let Some(category) = categories.into_iter().next() {
        Ok(Some(category))
    } else {
        Ok(None)
    }
}

pub fn update_current_category(app: &AppHandle, category_name: &str) -> Result<(), DatabaseError> {
    let mut conn = Connection::open(db_path(app))?;
    let tx = conn.transaction()?;

    tx.execute("UPDATE category SET current = 0;", [])?;
    tx.execute(
        "UPDATE category SET current = 1 WHERE name = ?1;",
        params![category_name],
    )?;

    tx.commit()?;
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

    let timers = timers_iter.collect::<Result<Vec<Timer>, _>>()?;
    Ok(timers)
}

pub fn archive_category(app: &AppHandle, category_name: &str) -> Result<(), DatabaseError> {
    let mut conn = Connection::open(db_path(app))?;
    let tx = conn.transaction()?;
    tx.execute(
        "UPDATE category SET current = 0 WHERE name = ?1;",
        params![category_name],
    )?;
    tx.execute(
        "UPDATE category SET archived = 1 WHERE name = ?1;",
        params![category_name],
    )?;
    tx.commit()?;
    Ok(())
}
