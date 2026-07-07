use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Mood {
    Happy,
    Sleepy,
    Grumpy,
    Lonely,
    Scared,
    Excited,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoodEngine {
    pub current: Mood,
    pub start_time: i64,
    duration_secs: u32,
}

impl MoodEngine {
    pub fn new() -> Self {
        Self {
            current: Mood::Happy,
            start_time: chrono::Utc::now().timestamp(),
            duration_secs: 1800,
        }
    }

    pub fn update(&mut self, affection: u32, idle_seconds: u64, hour: u32) {
        let now = chrono::Utc::now().timestamp();
        if now - self.start_time < self.duration_secs as i64 {
            return; // 情绪未到期
        }

        // 根据上下文计算新情绪
        self.current = self.compute_next(affection, idle_seconds, hour);
        self.start_time = now;
        self.duration_secs = 600 + rand::random::<u32>() % 1800;
    }

    fn compute_next(&self, affection: u32, idle_seconds: u64, hour: u32) -> Mood {
        // 深夜 → sleepy
        if hour >= 22 || hour <= 5 {
            return Mood::Sleepy;
        }
        // 下午2-3点经常困
        if hour >= 13 && hour <= 15 && idle_seconds > 120 {
            return Mood::Sleepy;
        }
        // 长时间未互动 → lonely
        if idle_seconds > 3600 && affection > 50 {
            return Mood::Lonely;
        }
        // 好感度低 → grumpy
        if affection < 30 {
            return Mood::Grumpy;
        }
        // 默认开心
        Mood::Happy
    }

    pub fn get_bubble_text(&self) -> &'static str {
        match self.current {
            Mood::Happy => "喵~今天好开心！",
            Mood::Sleepy => "好困哦 zzz...",
            Mood::Grumpy => "哼！不理你了！",
            Mood::Lonely => "你去哪了...好想你呀",
            Mood::Scared => "有声音！害怕...",
            Mood::Excited => "好耶好耶！",
        }
    }

    pub fn emoji(&self) -> &'static str {
        match self.current {
            Mood::Happy => "😊",
            Mood::Sleepy => "😴",
            Mood::Grumpy => "😤",
            Mood::Lonely => "🥺",
            Mood::Scared => "😰",
            Mood::Excited => "🎉",
        }
    }
}
