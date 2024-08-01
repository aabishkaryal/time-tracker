use tauri::command;

use crate::db::{
    add_category, add_timer, archive_category, get_active_categories_info, get_all_categories_info,
    get_archived_categories_info, get_current_category, get_timers, update_current_category,
};
use crate::model::{Category, Timer};

#[command]
pub fn add_category_command(
    app: tauri::AppHandle,
    name: String,
    icon: String,
) -> Result<(), String> {
    match add_category(&app, &name, &icon) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to add category: {}", e)),
    }
}

#[command]
pub fn get_all_categories_info_command(
    app: tauri::AppHandle,
    date: &str,
) -> Result<Vec<Category>, String> {
    match get_all_categories_info(&app, date) {
        Ok(categories) => Ok(categories),
        Err(e) => Err(format!("Failed to get all categories info: {}", e)),
    }
}

#[command]
pub fn add_timer_command(
    app: tauri::AppHandle,
    category_name: String,
    start_time: i64,
    duration: i64,
) -> Result<(), String> {
    match add_timer(&app, &category_name, start_time, duration) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to add timer: {}", e)),
    }
}

#[command]
pub fn get_timers_command(app: tauri::AppHandle) -> Result<Vec<Timer>, String> {
    match get_timers(&app) {
        Ok(timers) => Ok(timers),
        Err(e) => Err(format!("Failed to get timers: {}", e)),
    }
}

#[command]
pub fn get_current_category_command(app: tauri::AppHandle) -> Result<Option<Category>, String> {
    match get_current_category(&app) {
        Ok(category) => Ok(category),
        Err(e) => Err(format!("Failed to get current category: {}", e)),
    }
}

#[command]
pub fn update_current_category_command(app: tauri::AppHandle, name: String) -> Result<(), String> {
    match update_current_category(&app, &name) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to update current category: {}", e)),
    }
}

#[command]
pub fn get_active_categories_info_command(
    app: tauri::AppHandle,
    date: &str,
) -> Result<Vec<Category>, String> {
    match get_active_categories_info(&app, date) {
        Ok(categories) => Ok(categories),
        Err(e) => Err(format!("Failed to get active categories info: {}", e)),
    }
}

#[command]
pub fn get_archived_categories_info_command(
    app: tauri::AppHandle,
    date: &str,
) -> Result<Vec<Category>, String> {
    match get_archived_categories_info(&app, date) {
        Ok(categories) => Ok(categories),
        Err(e) => Err(format!("Failed to get archived categories info: {}", e)),
    }
}

#[command]
pub fn archive_category_command(app: tauri::AppHandle, name: String) -> Result<(), String> {
    match archive_category(&app, &name) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to archive category: {}", e)),
    }
}
