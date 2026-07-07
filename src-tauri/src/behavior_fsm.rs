use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum KekeState {
    Idle,
    Walking { direction: String },
    Climbing,
    WatchingMouse,
    Sleeping,
    Petting,
    Held,
    Eating { food: String },
    ChasingCursor,
    OrganizingDesk,
    SupervisorMode,
    SlackerWarning,
    GiftDelivery,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BehaviorFSM {
    pub current_state: KekeState,
    pub idle_seconds: u64,
    pub last_interaction: i64,
    pub mouse_x: f64,
    pub mouse_y: f64,
}

impl BehaviorFSM {
    pub fn new() -> Self {
        Self {
            current_state: KekeState::Idle,
            idle_seconds: 0,
            last_interaction: chrono::Utc::now().timestamp(),
            mouse_x: 0.0,
            mouse_y: 0.0,
        }
    }

    pub fn tick(&mut self, mouse_near: bool) {
        self.idle_seconds += 1;

        if mouse_near && self.current_state == KekeState::Idle {
            self.current_state = KekeState::WatchingMouse;
            self.idle_seconds = 0;
            return;
        }

        if self.idle_seconds > 5 && self.current_state == KekeState::Idle {
            let roll: u32 = {
                use rand::Rng;
                let mut rng = rand::thread_rng();
                rng.gen_range(0..100)
            };
            self.current_state = match roll {
                0..=30 => KekeState::Walking { direction: "random".into() },
                31..=45 => KekeState::WatchingMouse,
                46..=55 => KekeState::Climbing,
                56..=65 => KekeState::OrganizingDesk,
                66..=75 => KekeState::Eating { food: "fish".into() },
                76..=85 => KekeState::ChasingCursor,
                _ => KekeState::Idle,
            };
            self.idle_seconds = 0;
            return;
        }

        if self.idle_seconds > 300 && self.current_state != KekeState::Sleeping {
            self.current_state = KekeState::Sleeping;
        }

        if self.current_state == KekeState::Sleeping && mouse_near {
            self.current_state = KekeState::Petting;
            self.idle_seconds = 0;
        }
    }

    pub fn interact(&mut self, action: &str) -> KekeState {
        self.idle_seconds = 0;
        self.last_interaction = chrono::Utc::now().timestamp();
        self.current_state = match action {
            "click" => KekeState::Petting,
            "double_click" => KekeState::SlackerWarning,
            "drag" => KekeState::Held,
            "feed_fish" => KekeState::Eating { food: "fish".into() },
            "feed_can" => KekeState::Eating { food: "can".into() },
            "feed_catnip" => KekeState::Eating { food: "catnip".into() },
            _ => KekeState::Idle,
        };
        self.current_state.clone()
    }

    pub fn reset_to_idle(&mut self) {
        self.current_state = KekeState::Idle;
        self.idle_seconds = 0;
    }
}
