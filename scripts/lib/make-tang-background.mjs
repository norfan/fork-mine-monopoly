// 程序化绘制盛世大唐 3D 场景背景（960×540，16:9）
// 主题：黄昏长安——暮蓝天幕、夕日、祥云、大雁塔与宫殿剪影、群山大雁、太液池波光
// 输出：apps/client/public/offline-maps/background-tang.png
// 该图以 image-tang-bg 身份打入 fpmap 的 imageFiles，info.backgroundImageId 指向它，
// GameRenderer.initBackground() 会把它设为 scene.background（缺少它曾导致地图容器不进场景 → 白屏）

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Canvas } from "./png-painter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");

const W = 960;
const H = 540;
const HORIZON = 322; // 地平线

const INK = [38, 26, 30]; // 剪影墨色
const GOLD = [232, 188, 96];
const GOLD_PALE = [246, 220, 150];
const RED = [150, 44, 40];

/** 一朵祥云（三瓣云头 + 云底） */
function drawCloud(c, cx, cy, s, color) {
	c.fillEllipse(cx, cy, 1.6 * s, 0.6 * s, color);
	c.fillEllipse(cx - 1.1 * s, cy + 0.14 * s, 0.9 * s, 0.44 * s, color);
	c.fillEllipse(cx + 1.1 * s, cy + 0.14 * s, 0.9 * s, 0.44 * s, color);
	c.fillEllipse(cx + 0.4 * s, cy - 0.4 * s, 0.72 * s, 0.4 * s, color);
	c.fillRect(cx - 1.9 * s, cy, cx + 1.9 * s, cy + 0.36 * s, color);
}

/** 一座塔剪影：cx 中心、baseY 底部、scale 像素/单位 */
function drawPagoda(c, cx, baseY, scale, color, roofColor) {
	for (let i = 0; i < 5; i++) {
		const w = (0.72 - 0.09 * i) * scale;
		const h = (0.28 - 0.02 * i) * scale;
		const y = baseY - i * (h + 0.09 * scale);
		const bw = Math.max(6, w);
		c.fillRect(cx - bw / 2, y - h, cx + bw / 2, y, color);
		const rw = bw + 0.15 * scale;
		const rh = 0.045 * scale;
		c.fillTrapezoid(cx - rw / 2, cx + rw / 2, cx - rw / 2 + 0.1 * scale, cx + rw / 2 - 0.1 * scale, y - h - rh, y - h, roofColor);
	}
	// 塔尖
	const topY = baseY - 5 * (0.3 * scale + 0.09 * scale) + 0.05 * scale;
	c.fillRect(cx - 2, topY - 0.26 * scale, cx + 2, topY, color);
	c.fillCircle(cx, topY - 0.28 * scale, 3.5, color);
}

/** 宫殿剪影：基座 + 双层庑殿顶（梯形檐） */
function drawPalace(c, cx, baseY, scale, color, roofColor) {
	const bw = 1.5 * scale;
	const bh = 0.5 * scale;
	// 台基
	c.fillRect(cx - bw * 0.62, baseY - 0.08 * scale, cx + bw * 0.62, baseY, color);
	// 殿身
	c.fillRect(cx - bw / 2, baseY - 0.08 * scale - bh, cx + bw / 2, baseY - 0.08 * scale, color);
	// 庑殿顶（两层收分）
	const roofW = bw * 1.28;
	const roofH = 0.3 * scale;
	c.fillTrapezoid(cx - roofW / 2, cx + roofW / 2, cx - bw * 0.34, cx + bw * 0.34, baseY - 0.08 * scale - bh - roofH, baseY - 0.08 * scale - bh, roofColor);
	const roof2H = 0.22 * scale;
	const topW = bw * 0.62;
	c.fillTrapezoid(cx - topW / 2, cx + topW / 2, cx - bw * 0.14, cx + bw * 0.14, baseY - 0.08 * scale - bh - roofH - roof2H, baseY - 0.08 * scale - bh - roofH, roofColor);
	// 脊端起翘
	c.fillRect(cx - roofW / 2 - 4, baseY - 0.08 * scale - bh - roofH - 3, cx - roofW / 2 + 3, baseY - 0.08 * scale - bh - roofH, color);
	c.fillRect(cx + roofW / 2 - 3, baseY - 0.08 * scale - bh - roofH - 3, cx + roofW / 2 + 4, baseY - 0.08 * scale - bh - roofH, color);
}

/** 一只大雁（人字斜线） */
function drawGoose(c, cx, cy, s, color) {
	for (const dir of [-1, 1]) {
		for (let i = 0; i < 6; i++) {
			c.setPx(cx + dir * i, cy + dir === 1 ? 0 : i * 0.35, color);
			c.setPx(cx + dir * (i + 1), cy + (dir === 1 ? i * 0.35 : 0), color);
		}
	}
}

function paintBackground() {
	const c = new Canvas(W, H);

	// 1. 暮蓝天幕：深蓝紫 → 暖橘
	c.vGradient(0, W, 0, HORIZON, [44, 52, 104], [206, 138, 96]);

	// 2. 夕日与光晕（右上）
	const sunX = 706;
	const sunY = 158;
	c.strokeCircle(sunX, sunY, 66, 3, [236, 196, 130]); // 外晕
	c.strokeCircle(sunX, sunY, 56, 2, [240, 206, 148]);
	c.fillCircle(sunX, sunY, 44, [248, 224, 158]);
	c.fillCircle(sunX, sunY, 36, [250, 232, 178]);

	// 3. 祥云（半透明观感用暗色亮色叠两层）
	drawCloud(c, 170, 96, 24, [122, 108, 148]);
	drawCloud(c, 470, 62, 16, [138, 118, 158]);
	drawCloud(c, 860, 210, 18, [150, 116, 138]);
	drawCloud(c, 300, 170, 12, [160, 128, 158]);

	// 4. 远山（两层：远岭雾蓝、近山沉稳）
	const far = [96, 104, 138];
	const near = [62, 66, 96];
	c.fillEllipse(140, HORIZON + 6, 230, 54, far);
	c.fillEllipse(430, HORIZON + 10, 300, 62, far);
	c.fillEllipse(800, HORIZON + 6, 260, 52, far);
	c.fillEllipse(60, HORIZON + 26, 260, 60, near);
	c.fillEllipse(560, HORIZON + 30, 330, 66, near);
	c.fillEllipse(940, HORIZON + 24, 240, 56, near);

	// 5. 天际剪影：大雁塔（主景）+ 两侧宫殿（呼应地图内建筑）
	drawPagoda(c, 250, HORIZON + 8, 96, INK, [58, 40, 40]);
	drawPalace(c, 90, HORIZON + 10, 60, INK, [58, 40, 40]);
	drawPalace(c, 402, HORIZON + 12, 44, INK, [58, 40, 40]);
	drawPalace(c, 700, HORIZON + 10, 52, INK, [58, 40, 40]);
	drawPagoda(c, 890, HORIZON + 12, 56, INK, [58, 40, 40]);

	// 6. 大雁三两只
	drawGoose(c, 520, 120, 1, [58, 52, 78]);
	drawGoose(c, 566, 142, 1, [58, 52, 78]);
	drawGoose(c, 610, 106, 1, [58, 52, 78]);

	// 7. 太液池水面：暖色倒影渐变 + 波光
	c.vGradient(0, W, HORIZON + 34, H, [96, 84, 110], [48, 44, 68]);
	// 夕阳倒影光路
	for (let i = 0; i < 26; i++) {
		const y = HORIZON + 40 + i * 7;
		const spread = 10 + i * 6;
		const cx = sunX + Math.sin(i * 1.7) * 14;
		const len = Math.min(spread, 120) * (0.6 + 0.4 * Math.abs(Math.sin(i)));
		c.hLine(cx - len / 2, cx + len / 2, y, [214, 168, 116]);
		if (i % 3 === 0) c.hLine(cx - len / 4, cx + len / 4, y + 3, [238, 206, 152]);
	}
	// 岸边暗线
	c.hLine(0, W, HORIZON + 34, [70, 62, 88]);

	// 8. 底部轻微压暗，突出中部棋盘
	c.vGradient(0, W, H - 70, H, [40, 38, 60], [26, 24, 42]);

	return c.toPng();
}

const png = paintBackground();
const outPath = join(PROJECT_ROOT, "apps/client/public/offline-maps/background-tang.png");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, png);
writeFileSync(join(PROJECT_ROOT, "test-assets/background-tang.png"), png);
console.log("背景已生成:", outPath, "| bytes:", png.length);
