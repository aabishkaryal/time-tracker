use std::path::PathBuf;

use tauri::AppHandle;

pub fn db_path(app: &AppHandle) -> PathBuf {
    app.path_resolver()
        .app_data_dir()
        .unwrap_or_else(|| PathBuf::new())
        .join("app.db")
}
