import { Application, Container, Graphics, TextStyle, Text, AnimatedSprite, Texture, Assets } from 'pixi.js';

export class KekeRenderer {
  private app: Application;
  private container: Container;
  private kekeGraphics: Graphics;
  private direction: number = 1; // 1=right, -1=left
  private walkTarget: { x: number; y: number } | null = null;
  private animFrame = 0;
  private lastTick = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.app = new Application();
    this.container = new Container();
    this.kekeGraphics = new Graphics();
  }

  async init() {
    await this.app.init({
      canvas: document.querySelector('canvas') || undefined,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    this.app.stage.addChild(this.container);
    this.container.addChild(this.kekeGraphics);
    this.drawKeke(160, 100);

    // 呼吸动画
    this.app.ticker.add((ticker) => {
      const elapsed = ticker.elapsedMS;
      this.breathe(elapsed);
    });
  }

  private drawKeke(x: number, y: number) {
    const g = this.kekeGraphics;
    g.clear();

    const centerX = x;
    const centerY = y;

    // 身体（圆角矩形—蓝色山双布偶的身形）
    g.beginFill(0xFFF5EE);
    g.drawEllipse(centerX, centerY + 20, 25, 20);
    g.endFill();

    // 头部（圆脸）
    g.beginFill(0xFFF5EE);
    g.drawCircle(centerX, centerY - 15, 22);
    g.endFill();

    // 耳朵（蓝灰色）
    g.beginFill(0x8FA8C0);
    g.moveTo(centerX - 18, centerY - 32);
    g.lineTo(centerX - 22, centerY - 45);
    g.lineTo(centerX - 10, centerY - 35);
    g.closePath();
    g.endFill();

    g.beginFill(0x8FA8C0);
    g.moveTo(centerX + 18, centerY - 32);
    g.lineTo(centerX + 22, centerY - 45);
    g.lineTo(centerX + 10, centerY - 35);
    g.closePath();
    g.endFill();

    // 耳朵内部粉色
    g.beginFill(0xFFB8C6);
    g.moveTo(centerX - 16, centerY - 34);
    g.lineTo(centerX - 19, centerY - 42);
    g.lineTo(centerX - 12, centerY - 36);
    g.closePath();
    g.endFill();

    g.beginFill(0xFFB8C6);
    g.moveTo(centerX + 16, centerY - 34);
    g.lineTo(centerX + 19, centerY - 42);
    g.lineTo(centerX + 12, centerY - 36);
    g.closePath();
    g.endFill();

    // 额头的倒V白色区域
    g.beginFill(0xFFFFFF);
    g.moveTo(centerX, centerY - 30);
    g.lineTo(centerX - 12, centerY - 10);
    g.lineTo(centerX + 12, centerY - 10);
    g.closePath();
    g.endFill();

    // 眼睛（深蓝色）
    g.beginFill(0x4A90D9);
    g.drawCircle(centerX - 8, centerY - 18, 5);
    g.drawCircle(centerX + 8, centerY - 18, 5);
    g.endFill();

    // 瞳孔
    g.beginFill(0x1A1A2E);
    g.drawCircle(centerX - 7, centerY - 18, 2.5);
    g.drawCircle(centerX + 9, centerY - 18, 2.5);
    g.endFill();

    // 眼睛高光
    g.beginFill(0xFFFFFF);
    g.drawCircle(centerX - 9, centerY - 20, 1.5);
    g.drawCircle(centerX + 7, centerY - 20, 1.5);
    g.endFill();

    // 鼻子（粉色小三角）
    g.beginFill(0xFFB8C6);
    g.moveTo(centerX, centerY - 10);
    g.lineTo(centerX - 3, centerY - 7);
    g.lineTo(centerX + 3, centerY - 7);
    g.closePath();
    g.endFill();

    // 嘴巴
    g.lineStyle(1.5, 0x8FA8C0);
    g.moveTo(centerX, centerY - 7);
    g.quadraticCurveTo(centerX - 5, centerY - 3, centerX - 8, centerY - 5);
    g.moveTo(centerX, centerY - 7);
    g.quadraticCurveTo(centerX + 5, centerY - 3, centerX + 8, centerY - 5);
    g.lineStyle(0);

    // 倒V两侧蓝灰色毛色
    g.beginFill(0x8FA8C0, 0.3);
    g.drawCircle(centerX - 18, centerY - 12, 8);
    g.drawCircle(centerX + 18, centerY - 12, 8);
    g.endFill();

    // 面部蓝灰色区域
    g.beginFill(0x8FA8C0, 0.15);
    g.drawRoundedRect(centerX - 22, centerY - 25, 44, 20, 10);
    g.endFill();

    // 胡须
    g.lineStyle(1, 0xCCCCCC);
    g.moveTo(centerX - 8, centerY - 8);
    g.lineTo(centerX - 20, centerY - 12);
    g.moveTo(centerX - 8, centerY - 6);
    g.lineTo(centerX - 20, centerY - 6);
    g.moveTo(centerX + 8, centerY - 8);
    g.lineTo(centerX + 20, centerY - 12);
    g.moveTo(centerX + 8, centerY - 6);
    g.lineTo(centerX + 20, centerY - 6);
    g.lineStyle(0);

    // 尾巴（蓝灰色蓬松松鼠尾）
    g.beginFill(0x7EA0B8);
    g.moveTo(centerX + 25, centerY + 25);
    g.quadraticCurveTo(centerX + 40, centerY + 10, centerX + 42, centerY + 20);
    g.quadraticCurveTo(centerX + 45, centerY + 30, centerX + 35, centerY + 35);
    g.quadraticCurveTo(centerX + 25, centerY + 40, centerX + 20, centerY + 30);
    g.closePath();
    g.endFill();
  }

  private breathe(elapsed: number) {
    // 4秒周期呼吸浮动
    const breath = Math.sin(Date.now() / 2000 * Math.PI) * 3;
    const scale = 1 + Math.sin(Date.now() / 2000 * Math.PI) * 0.01;
    this.kekeGraphics.y = breath;
    this.kekeGraphics.scale.set(scale);
  }

  public setDirection(dir: number) {
    this.direction = dir;
    this.kekeGraphics.scale.x = dir * (1 + Math.sin(Date.now() / 2000 * Math.PI) * 0.01);
  }

  public getPosition() {
    return { x: this.kekeGraphics.x, y: this.kekeGraphics.y };
  }

  public destroy() {
    this.app.destroy(true);
  }
}
