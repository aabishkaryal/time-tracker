use rusqlite::{params, Connection, Result};
use tauri::AppHandle;

use crate::error::DatabaseError;
use crate::model::Category;
use crate::utils::db_path;

fn map_category(row: &rusqlite::Row) -> Result<Category, rusqlite::Error> {
    Ok(Category {
        uuid: row.get(0)?,
        name: row.get(1)?,
        icon: row.get(2)?,
        time: row.get(3)?,
    })
}

fn query_categories(
    conn: &Connection,
    condition: Option<&str>,
    date: &str,
) -> Result<Vec<Category>, DatabaseError> {
    let mut query = String::from(
        "SELECT c.uuid, c.name, c.icon_name, IFNULL(SUM(t.duration), 0) AS total_time
       FROM category c
       LEFT JOIN timer t ON c.uuid = t.category_uuid AND date(?) = date(t.start_time, 'unixepoch')",
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
    let uuid = uuidv7::create();
    conn.execute(
        "INSERT INTO category (uuid, name, icon_name) VALUES (?1, ?2)",
        params![uuid, name, icon_name],
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

pub fn update_current_category(app: &AppHandle, category_uuid: &str) -> Result<(), DatabaseError> {
    let mut conn = Connection::open(db_path(app))?;
    let tx = conn.transaction()?;

    tx.execute("UPDATE category SET current = 0;", [])?;
    tx.execute(
        "UPDATE category SET current = 1 WHERE uuid = ?1;",
        params![category_uuid],
    )?;

    tx.commit()?;
    Ok(())
}

pub fn add_timer(
    app: &AppHandle,
    category_uuid: &str,
    start_time: i64,
    duration: i64,
) -> Result<(), DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    conn.execute(
        "INSERT INTO timer (category_uuid, start_time, duration) VALUES (?1, ?2, ?3)",
        params![category_uuid, start_time, duration],
    )?;
    Ok(())
}

pub fn archive_category(app: &AppHandle, category_uuid: &str) -> Result<(), DatabaseError> {
    let mut conn = Connection::open(db_path(app))?;
    let tx = conn.transaction()?;
    tx.execute(
        "UPDATE category SET current = 0 WHERE uuid = ?1;",
        params![category_uuid],
    )?;
    tx.execute(
        "UPDATE category SET archived = 1 WHERE uuid = ?1;",
        params![category_uuid],
    )?;
    tx.commit()?;
    Ok(())
}

pub fn restore_category(app: &AppHandle, category_uuid: &str) -> Result<(), DatabaseError> {
    let conn = Connection::open(db_path(app))?;
    conn.execute(
        "UPDATE category SET archived = 0 WHERE uuid = ?1",
        params![category_uuid],
    )?;
    Ok(())
}
