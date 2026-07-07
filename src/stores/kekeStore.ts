import { create } from 'zustand';

export type KekeState = 
  | 'idle' | 'walking' | 'climbing' | 'watchingMouse'
  | 'sleeping' | 'petting' | 'held' | 'eating'
  | 'chasingCursor' | 'organizingDesk' | 'supervisorMode'
  | 'slackerWarning' | 'giftDelivery';

export type Mood = 'happy' | 'sleepy' | 'grumpy' | 'lonely' | 'scared' | 'excited';

interface KekeData {
  state: KekeState;
  mood: Mood;
  bubbleText: string;
  emoji: string;
  affection: number;
  idleSeconds: number;
}

interface Stats {
  affection: number;
  petCount: number;
  feedCount: number;
  totalMinutes: number;
  streakDays: number;
}

interface KekeStore {
  // 可可状态
  keke: KekeData;
  // 统计数据
  stats: Stats;
  // 设置
  settings: {
    autoStart: boolean;
    soundEnabled: boolean;
    animationSpeed: string;
    windowOpacity: number;
  };
  // 鼠标位置
  mousePos: { x: number; y: number };
  mouseNear: boolean;
  // 面板状态
  activePanel: string | null;
  // 临时状态
  animating: boolean;
  holdingFood: boolean;

  // Actions
  setKekeState: (data: Partial<KekeData>) => void;
  setMood: (mood: Mood, bubbleText: string, emoji: string) => void;
  setStats: (stats: Stats) => void;
  setMousePos: (x: number, y: number) => void;
  setMouseNear: (near: boolean) => void;
  openPanel: (panel: string | null) => void;
  closePanel: () => void;
  setAnimating: (v: boolean) => void;
  setHoldingFood: (v: boolean) => void;
  interact: (action: string) => void;
}

export const useKekeStore = create<KekeStore>((set, get) => ({
  keke: {
    state: 'idle',
    mood: 'happy',
    bubbleText: '喵~',
    emoji: '😊',
    affection: 0,
    idleSeconds: 0,
  },
  stats: {
    affection: 0,
    petCount: 0,
    feedCount: 0,
    totalMinutes: 0,
    streakDays: 0,
  },
  settings: {
    autoStart: false,
    soundEnabled: true,
    animationSpeed: 'normal',
    windowOpacity: 1.0,
  },
  mousePos: { x: 0, y: 0 },
  mouseNear: false,
  activePanel: null,
  animating: false,
  holdingFood: false,

  setKekeState: (data) => set((s) => ({ keke: { ...s.keke, ...data } })),
  setMood: (mood, bubbleText, emoji) => set((s) => ({ keke: { ...s.keke, mood, bubbleText, emoji } })),
  setStats: (stats) => set({ stats }),
  setMousePos: (x, y) => set((s) => {
    const dx = x - s.mousePos.x;
    const dy = y - s.mousePos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const near = dist < 120;
    return { mousePos: { x, y }, mouseNear: near };
  }),
  setMouseNear: (near) => set({ mouseNear: near }),
  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),
  setAnimating: (v) => set({ animating: v }),
  setHoldingFood: (v) => set({ holdingFood: v }),
  interact: (action) => {
    const state = get().keke.state;
    switch (action) {
      case 'click':
        set((s) => ({ keke: { ...s.keke, state: 'petting' }, animating: true }));
        setTimeout(() => {
          set((s) => ({ keke: { ...s.keke, state: 'idle' }, animating: false }));
        }, 1500);
        break;
      case 'feed':
        set((s) => ({ keke: { ...s.keke, state: 'eating' }, holdingFood: true }));
        setTimeout(() => {
          set((s) => ({ keke: { ...s.keke, state: 'idle' }, holdingFood: false }));
        }, 2000);
        break;
    }
  },
}));
