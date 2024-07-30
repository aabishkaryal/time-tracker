// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod db;
mod error;
mod init;
mod model;
mod utils;

use std::{fs, path::PathBuf};

use tauri::{
    generate_context, generate_handler, AppHandle, Builder, CustomMenuItem, Manager, SystemTray,
    SystemTrayEvent, SystemTrayMenu, Window, WindowEvent,
};

use commands::{
    add_category_command, add_timer_command, archive_category_command,
    get_active_categories_info_command, get_all_categories_info_command,
    get_archived_categories_info_command, get_current_category_command, get_timers_command,
    update_current_category_command,
};

use init::init_db;

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("Cmd+Q");
    let system_tray_menu = SystemTrayMenu::new().add_item(quit);
    Builder::default()
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
        .invoke_handler(generate_handler![
            add_category_command,
            archive_category_command,
            add_timer_command,
            get_all_categories_info_command,
            get_timers_command,
            get_current_category_command,
            get_active_categories_info_command,
            get_archived_categories_info_command,
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
