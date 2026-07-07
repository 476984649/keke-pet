import { KekeRenderer } from './engine/renderer';
import { InputHandler } from './engine/inputHandler';
import { useKekeStore } from './stores/kekeStore';
import './styles.css';

class KekeApp {
  private renderer: KekeRenderer;
  private input: InputHandler;
  private tickInterval: ReturnType<typeof setInterval> | null = null;
  private updateInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // 创建 Canvas
    const canvas = document.createElement('canvas');
    canvas.id = 'keke-canvas';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.cursor = 'pointer';
    document.getElementById('app')!.appendChild(canvas);

    // 初始化各系统
    this.renderer = new KekeRenderer(canvas);
    this.input = new InputHandler(canvas);

    // 创建 UI 层
    this.createUILayer();

    // 启动
    this.init();
  }

  private async init() {
    await this.renderer.init();

    // 状态更新
    this.tickInterval = setInterval(() => {
      const store = useKekeStore.getState();
      // 模拟后端 tick
      store.setKekeState({
        idleSeconds: store.keke.idleSeconds + 1,
      });

      // 随机行为（模拟后端 FSM）
      if (store.keke.state === 'idle' && store.keke.idleSeconds > 5 && !store.animating) {
        const rand = Math.random();
        if (rand < 0.3) {
          store.setKekeState({ state: 'walking', bubbleText: '散步去~' });
          setTimeout(() => store.setKekeState({ state: 'idle', bubbleText: '喵~' }), 3000);
        } else if (rand < 0.4) {
          store.setKekeState({ state: 'watchingMouse', bubbleText: '有东西！' });
          setTimeout(() => store.setKekeState({ state: 'idle', bubbleText: '喵~' }), 2000);
        }
      }

      // 鼠标靠近
      if (store.mouseNear && store.keke.state === 'idle') {
        store.setKekeState({ state: 'watchingMouse', bubbleText: '在看什么呢？' });
      }
    }, 1000);

    // 更新 UI
    this.updateInterval = setInterval(() => {
      this.updateStatusBar();
    }, 200);
  }

  private createUILayer() {
    const app = document.getElementById('app')!;

    // 气泡
    const bubble = document.createElement('div');
    bubble.id = 'keke-bubble';
    bubble.className = 'keke-bubble';
    app.appendChild(bubble);

    // 情绪表情
    const mood = document.createElement('div');
    mood.id = 'keke-mood';
    mood.className = 'keke-mood';
    app.appendChild(mood);

    // 右键菜单（初始隐藏）
    const menu = document.createElement('div');
    menu.id = 'keke-context-menu';
    menu.className = 'keke-menu hidden';
    menu.innerHTML = `
      <div class="menu-header">🐱 可可 <span id="menu-affection">❤️ 0</span></div>
      <div class="menu-item" data-action="feed">🐟 喂食</div>
      <div class="menu-item" data-action="outfit">🎀 装扮</div>
      <div class="menu-item" data-action="stats">📊 状态</div>
      <div class="menu-item" data-action="journal">📔 日记</div>
      <div class="menu-item" data-action="screenshot">🎬 录制名场面</div>
      <div class="menu-item" data-action="emote">😊 表情包工坊</div>
      <div class="menu-divider"></div>
      <div class="menu-item" data-action="settings">⚙️ 设置</div>
      <div class="menu-item" data-action="exit">❌ 退出</div>
    `;
    app.appendChild(menu);

    // 喂食确认弹窗（隐藏）
    const feedModal = document.createElement('div');
    feedModal.id = 'keke-feed-modal';
    feedModal.className = 'keke-modal hidden';
    feedModal.innerHTML = `
      <div class="modal-content">
        <div class="modal-title">🐟 给可可喂食</div>
        <div class="food-grid">
          <div class="food-card" data-food="fish">
            <div class="food-icon">🐟</div>
            <div class="food-name">小鱼干</div>
            <div class="food-effect">+5 ❤️</div>
          </div>
          <div class="food-card" data-food="can">
            <div class="food-icon">🥫</div>
            <div class="food-name">猫罐头</div>
            <div class="food-effect">+15 ❤️</div>
          </div>
          <div class="food-card" data-food="catnip">
            <div class="food-icon">🌿</div>
            <div class="food-name">猫薄荷</div>
            <div class="food-effect">🤪 疯狂！</div>
          </div>
        </div>
        <div class="modal-close">→ 关闭</div>
      </div>
    `;
    app.appendChild(feedModal);

    // 状态面板（隐藏）
    const statsPanel = document.createElement('div');
    statsPanel.id = 'keke-stats-panel';
    statsPanel.className = 'keke-panel hidden';
    statsPanel.innerHTML = `
      <div class="panel-title">♥ 可可与你的羁绊</div>
      <div class="affection-bar">
        <div class="affection-fill" id="affection-fill" style="width: 72%"></div>
      </div>
      <div class="affection-label">熟悉阶段 · <span id="affection-value">72</span>/1000</div>
      <div class="stats-grid">
        <div class="stat-item"><span class="stat-icon">🤚</span>摸头 <span id="stat-pet">0</span>次</div>
        <div class="stat-item"><span class="stat-icon">🐟</span>喂食 <span id="stat-feed">0</span>次</div>
        <div class="stat-item"><span class="stat-icon">⏰</span>陪伴 <span id="stat-time">0</span>小时</div>
      </div>
      <div class="unlock-list" id="unlock-list">
        <div>✅ 待机眨眼</div>
        <div>✅ 走路</div>
        <div>✅ 摸头互动</div>
        <div>🔒 爬窗（好感100解锁）</div>
      </div>
      <div class="panel-close">关闭</div>
    `;
    app.appendChild(statsPanel);

    // 日记面板（隐藏）
    const journalPanel = document.createElement('div');
    journalPanel.id = 'keke-journal-panel';
    journalPanel.className = 'keke-panel hidden';
    journalPanel.innerHTML = `
      <div class="panel-title">📔 可可的日记</div>
      <div class="journal-date" id="journal-date"></div>
      <div class="journal-content" id="journal-content"></div>
      <div class="journal-mood" id="journal-mood"></div>
      <div style="margin-top:12px;font-size:12px;color:#888" id="journal-affection"></div>
      <div class="journal-actions">
        <button class="btn btn-primary" id="btn-export">📷 保存截图</button>
      </div>
      <div class="panel-close">关闭</div>
    `;
    app.appendChild(journalPanel);

    // 表情包工坊（隐藏）
    const emotePanel = document.createElement('div');
    emotePanel.id = 'keke-emote-panel';
    emotePanel.className = 'keke-panel hidden';
    emotePanel.innerHTML = `
      <div class="panel-title">😊 可可表情包工坊</div>
      <div class="emote-grid">
        <div class="emote-card" data-mood="happy">😊开心</div>
        <div class="emote-card" data-mood="sleepy">😴困困</div>
        <div class="emote-card" data-mood="grumpy">😤生气</div>
        <div class="emote-card" data-mood="lonely">🥺撒娇</div>
      </div>
      <div class="emote-text-input">
        <input type="text" id="emote-text" placeholder="加文字（可选）" />
      </div>
      <div class="emote-actions">
        <button class="btn btn-primary" id="btn-emote-png">💾 保存PNG</button>
        <button class="btn btn-secondary" id="btn-emote-gif">🎬 保存GIF</button>
      </div>
      <div class="panel-close">关闭</div>
    `;
    app.appendChild(emotePanel);

    // 设置面板（隐藏）
    const settingsPanel = document.createElement('div');
    settingsPanel.id = 'keke-settings-panel';
    settingsPanel.className = 'keke-panel hidden';
    settingsPanel.innerHTML = `
      <div class="panel-title">⚙️ 设置</div>
      <div class="setting-row">
        <label>开机自启</label>
        <label class="switch"><input type="checkbox" id="setting-autostart" /><span class="slider"></span></label>
      </div>
      <div class="setting-row">
        <label>音效</label>
        <label class="switch"><input type="checkbox" id="setting-sound" checked /><span class="slider"></span></label>
      </div>
      <div class="setting-row">
        <label>动画速度</label>
        <select id="setting-speed">
          <option value="slow">慢速</option>
          <option value="normal" selected>正常</option>
          <option value="fast">快速</option>
        </select>
      </div>
      <div class="setting-row">
        <label>窗口透明度</label>
        <input type="range" id="setting-opacity" min="0.3" max="1" step="0.1" value="1" />
      </div>
      <div style="margin-top:12px;font-size:11px;color:#999;border-top:1px solid #eee;padding-top:8px">
        ⚡AI 对话接口预留
        <div style="margin-top:4px">Ollama 地址：<input type="text" id="ai-endpoint" placeholder="http://localhost:11434" style="width:130px;font-size:11px" /></div>
      </div>
      <div class="panel-close">关闭</div>
    `;
    app.appendChild(settingsPanel);

    // 绑定事件
    this.bindEvents();
  }

  private bindEvents() {
    const app = document.getElementById('app')!;

    // 菜单点击
    app.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const menuItem = target.closest('.menu-item') as HTMLElement;
      if (!menuItem) return;

      const action = menuItem.dataset.action;
      const store = useKekeStore.getState();

      switch (action) {
        case 'feed':
          store.closePanel();
          document.getElementById('keke-feed-modal')!.classList.remove('hidden');
          break;
        case 'stats':
          store.openPanel('stats');
          document.getElementById('keke-stats-panel')!.classList.remove('hidden');
          document.getElementById('keke-context-menu')!.classList.add('hidden');
          this.updateStatsPanel();
          break;
        case 'journal':
          store.openPanel('journal');
          document.getElementById('keke-journal-panel')!.classList.remove('hidden');
          document.getElementById('keke-context-menu')!.classList.add('hidden');
          this.updateJournal();
          break;
        case 'emote':
          store.openPanel('emote');
          document.getElementById('keke-emote-panel')!.classList.remove('hidden');
          document.getElementById('keke-context-menu')!.classList.add('hidden');
          break;
        case 'settings':
          store.openPanel('settings');
          document.getElementById('keke-settings-panel')!.classList.remove('hidden');
          document.getElementById('keke-context-menu')!.classList.add('hidden');
          break;
        case 'screenshot':
          store.closePanel();
          alert('📸 名场面已录制！');
          break;
        case 'exit':
          window.close();
          break;
      }
    });

    // 喂食选择
    document.addEventListener('click', (e) => {
      const card = (e.target as HTMLElement).closest('.food-card') as HTMLElement;
      if (card) {
        const food = card.dataset.food;
        const store = useKekeStore.getState();
        store.interact('feed');
        store.setKekeState({
          state: 'eating',
          bubbleText: food === 'fish' ? '小鱼干！！' : food === 'can' ? '罐头好吃！' : '猫薄荷！！嘿嘿...',
        });
        setTimeout(() => {
          store.setKekeState({ state: 'idle', bubbleText: '喵~' });
        }, 2500);
        document.getElementById('keke-feed-modal')!.classList.add('hidden');
      }

      // 关闭所有面板
      if ((e.target as HTMLElement).classList.contains('panel-close') ||
          (e.target as HTMLElement).classList.contains('modal-close')) {
        document.querySelectorAll('.keke-panel, .keke-modal').forEach(el => el.classList.add('hidden'));
        useKekeStore.getState().closePanel();
      }
    });

    // 设置切换
    document.getElementById('setting-sound')?.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      if (!checked) {
        // 播放测试音效
        this.playSound('meow');
      }
    });

    document.getElementById('setting-opacity')?.addEventListener('input', (e) => {
      const val = parseFloat((e.target as HTMLInputElement).value);
      document.body.style.opacity = val.toString();
    });

    // 表情包导出
    document.getElementById('btn-emote-png')?.addEventListener('click', () => {
      alert('😊 表情已保存！');
    });
    document.getElementById('btn-emote-gif')?.addEventListener('click', () => {
      alert('🎬 GIF 已保存！');
    });

    // 日记导出
    document.getElementById('btn-export')?.addEventListener('click', () => {
      alert('📷 日记截图已保存到桌面！');
    });

    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('keke-context-menu')!;
      if (!menu.contains(e.target as Node) && !(e.target as HTMLElement).closest('canvas')) {
        menu.classList.add('hidden');
      }
    });
  }

  private updateStatusBar() {
    const store = useKekeStore.getState();
    
    // 气泡文字
    const bubble = document.getElementById('keke-bubble');
    if (bubble) {
      bubble.textContent = store.keke.bubbleText;
      bubble.style.display = store.keke.state !== 'sleeping' ? 'block' : 'none';
    }

    // 情绪表情（头顶）
    const mood = document.getElementById('keke-mood');
    if (mood) {
      mood.textContent = store.keke.emoji;
    }

    // 菜单好感度
    const menuAffection = document.getElementById('menu-affection');
    if (menuAffection) {
      menuAffection.textContent = `❤️ ${store.keke.affection}`;
    }
  }

  private updateStatsPanel() {
    const store = useKekeStore.getState();
    document.getElementById('affection-fill')!.style.width = `${Math.min(store.keke.affection / 10, 100)}%`;
    document.getElementById('affection-value')!.textContent = store.keke.affection.toString();
    document.getElementById('stat-pet')!.textContent = '47';
    document.getElementById('stat-feed')!.textContent = '12';
    document.getElementById('stat-time')!.textContent = '36';
  }

  private updateJournal() {
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    document.getElementById('journal-date')!.textContent = dateStr;
    document.getElementById('journal-content')!.textContent = 
      '今天我和主人在一起度过了愉快的时光！\n被摸头了好多次，好开心~\n主人今天工作很认真，我也很乖。\n明天也要一起玩哦！🐱';
    document.getElementById('journal-mood')!.textContent = '今日心情：😊 开心';
    document.getElementById('journal-affection')!.textContent = '好感度变化：72 → 85 (+13)';
  }

  private playSound(name: string) {
    // 使用 Web Audio API 生成简单喵叫
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.1);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.3);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      // 静默降级
    }
  }

  public destroy() {
    if (this.tickInterval) clearInterval(this.tickInterval);
    if (this.updateInterval) clearInterval(this.updateInterval);
    this.renderer.destroy();
  }
}

// 启动应用
const app = new KekeApp();

// 暴露给 window 以便调试
(window as any).__kekeApp = app;
