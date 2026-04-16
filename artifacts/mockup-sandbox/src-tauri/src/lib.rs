use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_log::Builder::default()
                .level(log::LevelFilter::Info)
                .build(),
        )
        .setup(|app| {
            log::info!("m4chat2 starting up...");
            if let Some(window) = app.get_webview_window("main") {
                log::info!("Main window found");
                let _ = window.set_title("m4chat2");
            }
            log::info!("Setup complete");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
