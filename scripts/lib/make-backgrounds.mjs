// 三张经典地图的 3D 场景背景（960×540 浅色系）：都市晨光 / 大漠残阳 / 江南烟雨
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Canvas } from "./png-painter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const W = 960;
const H = 540;

function shenzhouBg() {
	const c = new Canvas(W, H);
	c.vGradient(0, W, 0, H, [206, 226, 244], [246, 236, 218]);
	c.fillCircle(790, 130, 56, [252, 244, 214]);
	c.fillCircle(790, 130, 44, [255, 250, 232]);
	for (const [x, y, s] of [[200, 110, 1], [480, 80, 0.7], [660, 170, 0.55]]) {
		c.fillEllipse(x, y, 58 * s, 15 * s, [252, 248, 240]);
		c.fillEllipse(x + 30 * s, y + 7 * s, 36 * s, 11 * s, [252, 248, 240]);
	}
	// 远景楼群（浅灰蓝）
	let x = 30;
	let i = 0;
	while (x < W - 20) {
		const w = 34 + ((i * 47) % 40);
		const h = 120 + ((i * 61) % 120);
		c.fillRect(x, 400 - h, x + w, 400, [196, 210, 226]);
		c.fillRect(x, 400 - h, x + w, 400 - h + 6, [176, 192, 210]);
		x += w + 10;
		i++;
	}
	// 江面
	c.fillRect(0, 400, W, H, [222, 232, 238]);
	for (let y = 410; y < H; y += 14) {
		for (let k = 0; k < 14; k++) c.hLine((k * 83 + y * 7) % W, (k * 83 + y * 7) % W + 40, y, [236, 242, 246]);
	}
	return c.toPng();
}

function sanguoBg() {
	const c = new Canvas(W, H);
	c.vGradient(0, W, 0, H, [246, 214, 170], [250, 236, 206]);
	c.fillCircle(240, 180, 70, [244, 190, 120]);
	c.fillCircle(240, 180, 52, [248, 208, 148]);
	for (const [x, y] of [[520, 110], [560, 92], [600, 116], [640, 98]]) {
		c.hLine(x - 8, x, y, [90, 70, 54]);
		c.hLine(x, x + 8, y + 3, [90, 70, 54]);
	}
	for (const [x, w, h, col] of [[100, 240, 110, [214, 188, 152]], [390, 280, 140, [200, 172, 136]], [640, 260, 100, [214, 188, 152]]]) {
		c.fillTrapezoid(x, x + w, x + w * 0.72, x + w * 0.28, 400 - h, 400, col);
	}
	// 城墙
	c.fillRect(0, 336, W, 400, [188, 160, 128]);
	for (let x = 0; x < W; x += 24) c.fillRect(x, 326, x + 12, 336, [170, 142, 112]);
	for (const x of [220, 520, 780]) {
		c.fillRect(x - 12, 306, x + 12, 326, [170, 142, 112]);
		c.fillRect(x - 16, 298, x + 16, 306, [188, 160, 128]);
	}
	c.fillRect(0, 400, W, H, [226, 206, 172]);
	for (let i = 0; i < 36; i++) c.hLine((i * 73) % W, (i * 73) % W + 36, 414 + (i % 5) * 20, [236, 218, 186]);
	return c.toPng();
}

function jiangnanBg() {
	const c = new Canvas(W, H);
	c.vGradient(0, W, 0, H, [222, 234, 234], [246, 246, 240]);
	for (const [y, col] of [[290, [196, 212, 208]], [320, [176, 196, 190]], [350, [156, 180, 172]]]) {
		for (let x = -40; x < W + 80; x += 150) c.fillEllipse(x, y, 112, 40, col);
	}
	for (const [x, y, w] of [[90, 392, 130], [320, 384, 160], [600, 396, 140], [780, 388, 150]]) {
		c.fillRect(x, y, x + w, y + 84, [250, 249, 244]);
		c.fillRect(x, y, x + w, y + 14, [64, 68, 72]);
		c.fillRect(x, y - 5, x + w, y + 5, [56, 60, 64]);
	}
	c.fillRect(0, 440, W, H, [226, 234, 232]);
	for (let y = 448; y < H; y += 15) {
		for (let k = 0; k < 16; k++) c.hLine((k * 91 + y * 11) % W, (k * 91 + y * 11) % W + 44, y, [238, 244, 242]);
	}
	for (const [x, y] of [[70, 410], [905, 420]]) {
		c.vLine(x, y - 70, y, [112, 96, 74]);
		for (let i = 0; i < 5; i++) c.vLine(x - 18 + i * 9, y - 48, y + (i % 3) * 18, [178, 200, 158]);
	}
	return c.toPng();
}

const BACKGROUNDS = [
	{ id: "image-shenzhou-bg", name: "background-cn.png", paint: shenzhouBg },
	{ id: "image-sanguo-bg", name: "background-sanguo.png", paint: sanguoBg },
	{ id: "image-jiangnan-bg", name: "background-jiangnan.png", paint: jiangnanBg },
];

export function buildBackgrounds() {
	return BACKGROUNDS.map((b) => ({ id: b.id, name: b.name, filetype: "png", content: b.paint() }));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
	const dir = join(PROJECT_ROOT, "apps/client/public/offline-maps");
	mkdirSync(dir, { recursive: true });
	for (const b of BACKGROUNDS) {
		const png = b.paint();
		writeFileSync(join(dir, b.name), png);
		console.log(`背景: ${b.name} (${png.length}B)`);
	}
}
