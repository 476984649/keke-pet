pub mod behavior_fsm;
pub mod mood;
pub mod db;
pub mod ai;
pub mod commands;

use std::sync::Mutex;

pub struct AppState {
    pub fsm: Mutex<behavior_fsm::BehaviorFSM>,
    pub mood: Mutex<mood::MoodEngine>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let builder = tauri::Builder::default()
        .manage(AppState {
            fsm: Mutex::new(behavior_fsm::BehaviorFSM::new()),
            mood: Mutex::new(mood::MoodEngine::new()),
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_state,
            commands::get_mood,
            commands::transition_state,
            commands::handle_interaction,
            commands::get_affection,
            commands::save_affection,
            commands::get_journal,
            commands::get_stats,
            commands::capture_screenshot,
            commands::get_active_window_info,
            commands::set_setting,
            commands::get_setting,
        ]);

    let builder = builder.plugin(tauri_plugin_shell::init());
    let builder = builder.plugin(tauri_plugin_dialog::init());
    let builder = builder.plugin(tauri_plugin_clipboard_manager::init());
    let builder = builder.plugin(tauri_plugin_notification::init());

    builder
        .setup(|_app| {
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
