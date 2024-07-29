// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod error;
mod model;

use model::{Category, Timer};
use std::{fs, path::PathBuf};

use tauri::{
    command, generate_context, generate_handler, AppHandle, Builder, CustomMenuItem, Manager,
    SystemTray, SystemTrayEvent, SystemTrayMenu, Window, WindowEvent,
};

use db::{
    add_category, add_timer, get_all_categories_info, get_current_category, get_timers, init_db,
    update_current_category,
};

#[command]
fn add_category_command(app: tauri::AppHandle, name: String, icon: String) {
    add_category(&app, &name, &icon).unwrap();
}

#[command]
fn get_all_categories_info_command(app: tauri::AppHandle) -> Vec<Category> {
    get_all_categories_info(&app).unwrap()
}

#[command]
fn add_timer_command(app: tauri::AppHandle, category_name: String, start_time: i64, duration: i64) {
    add_timer(&app, &category_name, start_time, duration).unwrap();
}

#[command]
fn get_timers_command(app: tauri::AppHandle) -> Vec<Timer> {
    get_timers(&app).unwrap()
}

#[command]
fn get_current_category_command(app: tauri::AppHandle) -> Option<Category> {
    get_current_category(&app).unwrap()
}

#[command]
fn update_current_category_command(app: tauri::AppHandle, name: String) {
    update_current_category(&app, &name).unwrap()
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("Cmd+Q");
    let system_tray_menu = SystemTrayMenu::new().add_item(quit);
    Builder::default()
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .invoke_handler(generate_handler![
            add_category_command,
            get_all_categories_info_command,
            add_timer_command,
            get_timers_command,
            get_current_category_command,
            update_current_category_command,
        ])
        .on_system_tray_event(|_, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| match event.event() {
            WindowEvent::CloseRequested { api, .. } => {
                hide_window(event.window());
                api.prevent_close();
            }
            _ => {}
        })
        .setup(|app| {
            // check if app_data_dir exists
            let app_handle = app.app_handle();
            if let Err(e) = ensure_app_data_dir_exists(&app_handle) {
                eprint!("Failed to create app_data_dir: {}", e);
                std::process::exit(1); // Exit if the database cannot be initialized
            }
            // Initialize the database
            if let Err(e) = init_db(&app_handle) {
                eprintln!("Failed to initialize database: {}", e);
                std::process::exit(1); // Exit if the database cannot be initialized
            }
            Ok(())
        })
        .run(generate_context!())
        .expect("error while running tauri application");
}

fn hide_window(window: &Window) {
    #[cfg(not(target_os = "macos"))]
    {
        window().hide().unwrap();
    }
    #[cfg(target_os = "macos")]
    {
        AppHandle::hide(&window.app_handle()).unwrap();
    }
}

/// Ensures the application data directory exists, creating it if necessary.
fn ensure_app_data_dir_exists(app: &AppHandle) -> Result<(), std::io::Error> {
    // Retrieve the application data directory path
    let app_data_dir = app
        .path_resolver()
        .app_data_dir()
        .unwrap_or_else(PathBuf::new);

    // Check if the directory exists, and create it if it does not
    if !app_data_dir.exists() {
        fs::create_dir_all(&app_data_dir)?;
    }

    // Return the path of the directory
    Ok(())
}
