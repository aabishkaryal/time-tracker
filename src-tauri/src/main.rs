// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    generate_context, AppHandle, Builder, CustomMenuItem, Manager, SystemTray, SystemTrayEvent,
    SystemTrayMenu, Window, WindowEvent,
};

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("Cmd+Q");
    let system_tray_menu = SystemTrayMenu::new().add_item(quit);
    Builder::default()
        .system_tray(SystemTray::new().with_menu(system_tray_menu))
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
        // .setup(|app| Ok(app.set_activation_policy(ActivationPolicy::Accessory)))
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
