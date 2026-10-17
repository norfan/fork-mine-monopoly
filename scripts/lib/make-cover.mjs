// 程序化绘制唐朝主题封面（640×360）
// 红金底色 + 大雁塔剪影 + 灯笼 + 山水，无文字（地图名由 UI 展示）
// 输出：apps/client/public/offline-maps/cover-tang.png

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Canvas } from "./png-painter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");

const W = 640;
const H = 360;

const INK = [42, 13, 13]; // 剪影墨色
const GOLD = [201, 162, 39];
const GOLD_LIGHT = [232, 205, 120];
const BEIGE = [216, 201, 168];
const HILL = [46, 74, 46];
const WATER = [94, 122, 138];

/** 画一座塔：cx 中心、baseY 底部、scale 像素/单位 */
function drawPagoda(c, cx, baseY, scale, bodyColor, roofColor, ridgeColor) {
	for (let i = 0; i < 5; i++) {
		const w = (0.72 - 0.09 * i) * scale;
		const h = (0.3 - 0.02 * i) * scale;
		const y = baseY - i * (h + 0.1 * scale);
		const bw = Math.max(6, w);
		c.fillRect(cx - bw / 2, y - h, cx + bw / 2, y, bodyColor);
		// 檐（梯形挑檐）
		const rw = bw + 0.16 * scale;
		const rh = 0.05 * scale;
		c.fillTrapezoid(cx - rw / 2, cx + rw / 2, cx - rw / 2 + 0.1 * scale, cx + rw / 2 - 0.1 * scale, y - h - rh, y - h, roofColor);
		// 脊
		c.fillRect(cx - (bw - 0.1 * scale) / 2, y - h - rh - 2, cx + (bw - 0.1 * scale) / 2, y - h - rh, ridgeColor);
	}
	// 塔尖
	const topY = baseY - 5 * (0.32 * scale + 0.1 * scale) + 0.05 * scale;
	c.fillRect(cx - 2, topY - 0.3 * scale, cx + 2, topY, GOLD);
	c.fillCircle(cx, topY - 0.32 * scale, 4, GOLD);
}

/** 画一只悬挂灯笼 */
function drawLantern(c, cx, cy, s) {
	c.vLine(cx, cy - 2.2 * s, cy - 1.5 * s, GOLD);
	c.fillRect(cx - 0.55 * s, cy - 1.5 * s, cx + 0.55 * s, cy - 1.42 * s, GOLD);
	c.fillEllipse(cx, cy - 0.85 * s, 0.72 * s, 0.78 * s, [176, 32, 32]);
	c.fillEllipse(cx, cy - 0.85 * s, 0.72 * s, 0.78 * s, [176, 32, 32]);
	c.fillRect(cx - 0.42 * s, cy - 0.5 * s, cx + 0.42 * s, cy - 0.42 * s, GOLD);
	c.fillRect(cx - 0.42 * s, cy - 1.28 * s, cx + 0.42 * s, cy - 1.2 * s, GOLD);
	c.fillEllipse(cx, cy - 0.85 * s, 0.3 * s, 0.34 * s, [232, 176, 96]);
	c.vLine(cx, cy - 0.1 * s, cy + 0.45 * s, GOLD);
	c.fillEllipse(cx, cy + 0.5 * s, 0.1 * s, 0.12 * s, GOLD);
}

/** 画一朵祥云 */
function drawCloud(c, cx, cy, s, color) {
	c.fillEllipse(cx, cy, 1.6 * s, 0.62 * s, color);
	c.fillEllipse(cx - 1.1 * s, cy + 0.14 * s, 0.9 * s, 0.45 * s, color);
	c.fillEllipse(cx + 1.1 * s, cy + 0.14 * s, 0.9 * s, 0.45 * s, color);
	c.fillEllipse(cx + 0.4 * s, cy - 0.42 * s, 0.75 * s, 0.42 * s, color);
	c.fillRect(cx - 1.9 * s, cy, cx + 1.9 * s, cy + 0.4 * s, color);
}

function paintCover() {
	const c = new Canvas(W, H);

	// 背景：朱红竖向渐变
	c.vGradient(0, W, 0, H, [122, 42, 42], [61, 20, 20]);

	// 外框：双线描金
	c.strokeRect(3, 3, W - 4, H - 4, 6, GOLD);
	c.strokeRect(18, 18, W - 19, H - 19, 2, [138, 106, 26]);

	// 日轮
	c.fillCircle(520, 78, 30, GOLD_LIGHT);
	c.strokeCircle(520, 78, 30, 4, GOLD);
	c.strokeCircle(520, 78, 38, 2, [168, 132, 44]);

	// 祥云
	drawCloud(c, 110, 74, 22, BEIGE);
	drawCloud(c, 420, 52, 16, BEIGE);
	drawCloud(c, 250, 100, 12, [190, 174, 140]);

	// 远山
	c.fillEllipse(120, 300, 190, 42, [58, 44, 44]);
	c.fillEllipse(360, 306, 230, 46, [58, 44, 44]);
	c.fillEllipse(560, 298, 160, 36, [58, 44, 44]);

	// 大雁塔剪影（主体）
	drawPagoda(c, 320, 300, 112, INK, GOLD, [150, 30, 30]);

	// 近坡
	c.fillEllipse(-40, 356, 240, 44, HILL);
	c.fillEllipse(300, 360, 280, 46, HILL);
	c.fillEllipse(640, 356, 220, 42, HILL);

	// 水面波纹
	for (let i = 0; i < 5; i++) {
		const y = 318 + i * 8;
		c.hLine(240 + i * 14, 470 - i * 10, y, WATER);
		c.hLine(250 + i * 16, 440 - i * 12, y + 3, [70, 96, 112]);
	}

	// 两侧灯笼
	drawLantern(c, 64, 250, 26);
	drawLantern(c, 576, 250, 26);

	// 底部祥云装饰线
	drawCloud(c, 120, 336, 10, [120, 74, 60]);
	drawCloud(c, 520, 336, 10, [120, 74, 60]);

	return c.toPng();
}

const png = paintCover();
const outPath = join(PROJECT_ROOT, "apps/client/public/offline-maps/cover-tang.png");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, png);
writeFileSync(join(PROJECT_ROOT, "test-assets/cover-tang.png"), png);
console.log("封面已生成:", outPath, "| bytes:", png.length);
