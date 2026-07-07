import { useKekeStore, KekeState } from '../stores/kekeStore';

// 文件名映射到可视化状态
const stateAnimations: Record<KekeState, string> = {
  idle: '待机',
  walking: '走路',
  climbing: '爬窗',
  watchingMouse: '看鼠标',
  sleeping: '睡觉 zzz',
  petting: '摸摸~',
  held: '被拎起',
  eating: '吃饭中...',
  chasingCursor: '抓光标！',
  organizingDesk: '整理桌面',
  supervisorMode: '监工中',
  slackerWarning: '别摸鱼！',
  giftDelivery: '叼礼物~',
};

export class InputHandler {
  private canvas: HTMLCanvasElement;
  private dragStart: { x: number; y: number } | null = null;
  private isDragging = false;
  private clickTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.setup();
  }

  private setup() {
    const store = useKekeStore;

    // 鼠标移动 → 追踪位置
    document.addEventListener('mousemove', (e) => {
      store.getState().setMousePos(e.clientX, e.clientY);

      if (this.isDragging && this.dragStart) {
        const dx = e.clientX - this.dragStart.x;
        const dy = e.clientY - this.dragStart.y;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          store.getState().interact('drag');
        }
      }
    });

    // 点击 → 摸头
    this.canvas.addEventListener('click', (e) => {
      e.stopPropagation();
      
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
        // 双击
        store.getState().interact('double_click');
        store.getState().setKekeState({ state: 'slackerWarning', bubbleText: '呜哇！' });
        setTimeout(() => store.getState().setKekeState({ state: 'idle', bubbleText: '喵~' }), 1500);
        return;
      }

      this.clickTimer = setTimeout(() => {
        this.clickTimer = null;
        // 单击
        store.getState().interact('click');
      }, 250);
    });

    // 右键 → 打开菜单（阻止默认）
    this.canvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const panel = store.getState().activePanel;
      store.getState().openPanel(panel === 'menu' ? null : 'menu');
    });

    // 拖拽
    this.canvas.addEventListener('mousedown', (e) => {
      this.dragStart = { x: e.clientX, y: e.clientY };
    });

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.dragStart = null;
        store.getState().setKekeState({ state: 'idle', bubbleText: '呜...' });
        setTimeout(() => store.getState().setKekeState({ bubbleText: '喵~' }), 2000);
      }
    });
  }

  public destroy() {
    // Cleanup
  }
}
