pub mod rule_engine;

// ===========================================
// AI 抽象层（预留 — 供后续接入大模型）
// ===========================================

/// AI 意图类型
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub enum AIIntent {
    Chat,
    GenerateJournal,
    BehaviorSuggestion,
    NameGeneration,
}

/// AI 请求
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AIRequest {
    pub intent: AIIntent,
    pub user_input: Option<String>,
    pub context: AIContext,
}

/// AI 上下文
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AIContext {
    pub current_mood: String,
    pub affection_level: u32,
    pub time_of_day: String,
    pub recent_events: Vec<String>,
    pub user_name: Option<String>,
}

/// AI 响应
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct AIResponse {
    pub text: Option<String>,
    pub suggested_mood: Option<String>,
    pub suggested_behavior: Option<String>,
    pub data: Option<serde_json::Value>,
}

// ===========================================
// AI 管理器
// ===========================================
pub struct AIManager {
    /// 是否启用 AI（默认 false = 规则引擎）
    enabled: bool,
}

impl AIManager {
    pub fn new() -> Self {
        Self { enabled: false }
    }

    pub fn set_enabled(&mut self, enabled: bool) {
        self.enabled = enabled;
    }

    pub fn process(&self, request: AIRequest) -> AIResponse {
        if !self.enabled {
            return rule_engine::RuleEngine::generate_response(&request);
        }
        // AI 远程调用预留（后续接入）
        rule_engine::RuleEngine::generate_response(&request)
    }
}
