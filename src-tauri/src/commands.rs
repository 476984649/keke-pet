use crate::AppState;
use crate::behavior_fsm::KekeState;
use crate::mood::Mood;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Serialize, Deserialize)]
pub struct KekeFullState {
    pub state: KekeState,
    pub mood: Mood,
    pub bubble_text: String,
    pub emoji: String,
    pub affection: u32,
    pub idle_seconds: u64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Stats {
    pub affection: u32,
    pub pet_count: u32,
    pub feed_count: u32,
    pub total_minutes: u32,
    pub streak_days: u32,
}

/// 获取完整状态（前端轮询用）
#[tauri::command]
pub fn get_state(state: State<AppState>) -> KekeFullState {
    let fsm = state.fsm.lock().unwrap();
    let mood_engine = state.mood.lock().unwrap();
    KekeFullState {
        state: fsm.current_state.clone(),
        mood: mood_engine.current.clone(),
        bubble_text: mood_engine.get_bubble_text().into(),
        emoji: mood_engine.emoji().into(),
        affection: 72, // TODO: 从数据库读取
        idle_seconds: fsm.idle_seconds,
    }
}

/// 获取情绪
#[tauri::command]
pub fn get_mood(state: State<AppState>) -> (String, String, String) {
    let mood_engine = state.mood.lock().unwrap();
    (
        format!("{:?}", mood_engine.current),
        mood_engine.get_bubble_text().into(),
        mood_engine.emoji().into(),
    )
}

/// 状态转移（前端通知）
#[tauri::command]
pub fn transition_state(state: State<AppState>, new_state: String, mouse_near: bool) -> KekeState {
    let mut fsm = state.fsm.lock().unwrap();
    match new_state.as_str() {
        "sleep" => fsm.current_state = KekeState::Sleeping,
        "idle" => fsm.reset_to_idle(),
        _ => fsm.tick(mouse_near),
    }
    fsm.current_state.clone()
}

/// 处理互动
#[tauri::command]
pub fn handle_interaction(state: State<AppState>, action: String) -> KekeState {
    let mut fsm = state.fsm.lock().unwrap();
    fsm.interact(&action)
}

/// 获取好感度
#[tauri::command]
pub fn get_affection() -> Stats {
    // TODO: 从 SQLite 读取
    Stats {
        affection: 72,
        pet_count: 47,
        feed_count: 12,
        total_minutes: 2160,
        streak_days: 3,
    }
}

/// 保存好感度（预留）
#[tauri::command]
pub fn save_affection(_affection: u32) -> String {
    format!("好感度已保存: {}", _affection)
}

/// 获取日记
#[tauri::command]
pub fn get_journal() -> serde_json::Value {
    serde_json::json!({
        "date": chrono::Local::now().format("%Y年%m月%d日").to_string(),
        "content": "今天我和主人在一起度过了愉快的时光！\n被摸头了几次，好开心~\n主人今天工作很认真，我也很乖没有捣乱。\n明天也要一起玩哦！🐱",
        "mood": "😊",
        "affection_before": 72,
        "affection_after": 85,
    })
}

/// 获取统计数据
#[tauri::command]
pub fn get_stats() -> Stats {
    get_affection()
}

/// 截图分享（预留）
#[tauri::command]
pub fn capture_screenshot() -> String {
    "screenshot_ready".into()
}

/// 获取当前活动窗口信息（预留 - Windows 平台）
#[tauri::command]
pub fn get_active_window_info() -> serde_json::Value {
    serde_json::json!({
        "title": "",
        "process": "",
        "is_fullscreen": false,
    })
}

/// 设置配置项
#[tauri::command]
pub fn set_setting(key: String, value: String) -> String {
    format!("{} 已设置为 {}", key, value)
}

/// 获取配置项
#[tauri::command]
pub fn get_setting(_key: String) -> String {
    String::new()
}
