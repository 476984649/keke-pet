use serde::{Deserialize, Serialize};
use std::path::PathBuf;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AffectionData {
    pub total_affection: u32,
    pub pet_count: u32,
    pub feed_count: u32,
    pub total_minutes: u32,
    pub last_interaction: String,
    pub streak_days: u32,
}

impl Default for AffectionData {
    fn default() -> Self {
        Self {
            total_affection: 0,
            pet_count: 0,
            feed_count: 0,
            total_minutes: 0,
            last_interaction: String::new(),
            streak_days: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JournalEntry {
    pub date: String,
    pub content: String,
    pub mood: String,
    pub affection_before: u32,
    pub affection_after: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppSettings {
    pub auto_start: bool,
    pub sound_enabled: bool,
    pub mouse_interact_enabled: bool,
    pub window_opacity: f64,
    pub animation_speed: String,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            auto_start: false,
            sound_enabled: true,
            mouse_interact_enabled: true,
            window_opacity: 1.0,
            animation_speed: "normal".into(),
        }
    }
}

/// 初始化数据库
pub fn init_database() -> Result<(), String> {
    // 预留：后续用 tauri-plugin-sql 初始化 SQLite
    Ok(())
}
