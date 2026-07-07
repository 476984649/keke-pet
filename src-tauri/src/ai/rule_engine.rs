use super::{AIRequest, AIResponse, AIIntent};

/// 规则引擎 — 无需 AI 模型即可运行，作为 Fallback
pub struct RuleEngine;

impl RuleEngine {
    pub fn generate_response(request: &AIRequest) -> AIResponse {
        match request.intent {
            AIIntent::Chat => Self::chat_response(request),
            AIIntent::GenerateJournal => Self::journal_response(request),
            AIIntent::BehaviorSuggestion => Self::behavior_suggestion(request),
            AIIntent::NameGeneration => Self::name_suggestion(request),
        }
    }

    fn chat_response(request: &AIRequest) -> AIResponse {
        let ctx = &request.context;
        let text = match (ctx.current_mood.as_str(), ctx.affection_level) {
            ("happy", _) => "喵~今天好开心呀！",
            ("sleepy", _) => "好困哦...想睡觉了 zzz",
            ("grumpy", _) => "哼！我现在不想说话",
            ("lonely", l) if l > 50 => "你去哪了...好想你",
            ("scared", _) => "呜...有声音！",
            ("excited", _) => "好耶好耶！！",
            _ if ctx.affection_level < 30 => "...喵",
            _ => "喵~摸摸头吗？",
        };
        AIResponse {
            text: Some(text.into()),
            suggested_mood: None,
            suggested_behavior: None,
            data: None,
        }
    }

    fn journal_response(request: &AIRequest) -> AIResponse {
        let ctx = &request.context;
        AIResponse {
            text: Some(format!(
                "今天我和主人在一起度过了愉快的时光！\n\
                 被摸头了好多次，好开心~\n\
                 喂了她/他几次，小鱼干最好吃啦！\n\
                 好感度现在是 {}。\n\
                 明天也要一起玩哦！🐱",
                ctx.affection_level,
            )),
            suggested_mood: Some("happy".into()),
            suggested_behavior: None,
            data: None,
        }
    }

    fn behavior_suggestion(request: &AIRequest) -> AIResponse {
        let ctx = &request.context;
        let suggestion = if ctx.affection_level < 30 {
            "多摸摸我，我就开心了~"
        } else if ctx.affection_level < 100 {
            "给我吃小鱼干吧！"
        } else {
            "想爬到你肩膀上坐一会儿~"
        };
        AIResponse {
            text: Some(suggestion.into()),
            suggested_mood: None,
            suggested_behavior: Some("idle".into()),
            data: None,
        }
    }

    fn name_suggestion(_request: &AIRequest) -> AIResponse {
        AIResponse {
            text: Some("叫它『小可爱』怎么样？".into()),
            suggested_mood: None,
            suggested_behavior: None,
            data: None,
        }
    }
}
