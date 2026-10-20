// 三张经典地图封面（960×540）：神州大地（都市黄昏）/ 三国风云（大漠烽烟）/ 江南水乡（烟雨江南）
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Canvas } from "./png-painter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const W = 960;
const H = 540;

/** 金框（封面收边） */
function frame(c, gold, goldL) {
	c.strokeRect(26, 26, W - 26, H - 26, 2, gold);
	c.strokeRect(36, 36, W - 36, H - 36, 1, goldL);
	for (const [x, y] of [[26, 26], [W - 26, 26], [26, H - 26], [W - 26, H - 26]]) {
		c.strokeRect(x - 9, y - 9, x + 9, y + 9, 2, gold);
	}
}

/** 楼群剪影 + 亮窗 */
function skyline(c, baseY, seed, body, lit, hMax) {
	let x = 20;
	let i = 0;
	while (x < W - 30) {
		const w = 26 + ((seed * (i + 3) * 37) % 46);
		const h = hMax * (0.45 + (((seed * (i + 1) * 53) % 100) / 100) * 0.55);
		const top = baseY - h;
		c.fillRect(x, top, x + w, baseY, body);
		// 亮窗
		for (let wy = top + 8; wy < baseY - 8; wy += 14) {
			for (let wx = x + 6; wx < x + w - 6; wx += 12) {
				if (((wx * 7 + wy * 13 + seed * i) % 10) < 4) c.fillRect(wx, wy, wx + 5, wy + 7, lit);
			}
		}
		x += w + 8;
		i++;
	}
}

/** 水面倒影条 */
function reflection(c, y0, y1, colors) {
	c.vGradient(0, W, y0, y1, colors[0], colors[1]);
	for (let i = 0; i < 60; i++) {
		const x = (i * 97) % W;
		const y = y0 + ((i * 53) % Math.max(1, y1 - y0 - 4));
		c.hLine(x, x + 12 + (i % 5) * 8, y, colors[2] ?? colors[0]);
	}
}

function shenzhou() {
	const c = new Canvas(W, H);
	c.vGradient(0, W, 0, H, [22, 26, 58], [92, 48, 70]);
	// 落日
	c.fillCircle(700, 220, 78, [242, 186, 120]);
	c.fillCircle(700, 220, 60, [246, 210, 150]);
	c.fillCircle(700, 220, 40, [250, 228, 175]);
	// 祥云
	for (const [x, y, s] of [[160, 130, 1], [430, 90, 0.7], [120, 260, 0.8], [820, 320, 0.6]]) {
		c.fillEllipse(x, y, 52 * s, 14 * s, [238, 190, 150]);
		c.fillEllipse(x + 26 * s, y + 6 * s, 34 * s, 10 * s, [238, 190, 150]);
	}
	// 楼群三层
	skyline(c, 400, 3, [18, 22, 40], [250, 208, 130], 190);
	skyline(c, 430, 9, [12, 15, 28], [255, 226, 160], 240);
	// 江面
	reflection(c, 430, H, [[58, 40, 70], [18, 16, 34], [120, 90, 110]]);
	// 霓虹倒影
	for (const [x, y] of [[300, 470], [520, 500], [700, 460]]) {
		c.vLine(x, y, y + 60, [255, 220, 150]);
	}
	frame(c, [212, 175, 55], [238, 214, 120]);
	return c.toPng();
}

function sanguo() {
	const c = new Canvas(W, H);
	c.vGradient(0, W, 0, H, [58, 24, 22], [150, 78, 40]);
	// 残阳
	c.fillCircle(260, 200, 86, [214, 120, 60]);
	c.fillCircle(260, 200, 64, [232, 152, 82]);
	// 雁阵
	for (const [x, y] of [[520, 120], [560, 100], [600, 128], [640, 108]]) {
		c.hLine(x - 9, x, y, [30, 20, 18]);
		c.hLine(x, x + 9, y + 3, [30, 20, 18]);
	}
	// 远山
	for (const [x, w, h] of [[120, 260, 120], [400, 300, 150], [660, 280, 110]]) {
		c.fillTrapezoid(x, x + w, x + w * 0.7, x + w * 0.3, 400 - h, 400, [70, 44, 34]);
	}
	// 城墙与烽燧
	c.fillRect(0, 330, W, 400, [58, 40, 30]);
	for (let x = 0; x < W; x += 26) c.fillRect(x, 318, x + 14, 330, [44, 30, 22]);
	for (const x of [180, 480, 760]) {
		c.fillRect(x - 14, 300, x + 14, 330, [44, 30, 22]);
		c.fillRect(x - 18, 292, x + 18, 300, [58, 40, 30]);
	}
	// 战旗
	for (const [x, y, col] of [[340, 210, [178, 34, 34]], [600, 240, [40, 46, 70]], [90, 260, [150, 120, 40]]]) {
		c.vLine(x, y, 400, [30, 22, 18]);
		c.fillRect(x, y, x + 26, y + 34, col);
		c.fillRect(x, y, x + 26, y + 8, col.map((v) => Math.min(255, v + 40)));
	}
	// 土地
	c.fillRect(0, 400, W, H, [96, 66, 40]);
	for (let i = 0; i < 40; i++) c.hLine((i * 71) % W, (i * 71) % W + 40, 430 + (i % 6) * 18, [120, 88, 54]);
	frame(c, [212, 175, 55], [238, 214, 120]);
	return c.toPng();
}

function jiangnan() {
	const c = new Canvas(W, H);
	c.vGradient(0, W, 0, H, [176, 196, 200], [232, 236, 228]);
	// 烟雨远山三层
	for (const [y, col] of [[300, [150, 168, 170]], [330, [120, 142, 140]], [360, [96, 120, 116]]]) {
		for (let x = -40; x < W + 80; x += 160) {
			c.fillEllipse(x, y, 120, 46, col);
		}
	}
	// 屋舍：白墙黑瓦
	for (const [x, y, w] of [[80, 400, 150], [300, 390, 190], [560, 405, 160], [760, 395, 170]]) {
		c.fillRect(x, y, x + w, y + 96, [244, 242, 234]);
		c.fillRect(x, y, x + w, y + 16, [44, 48, 52]);
		c.fillRect(x, y - 6, x + w, y + 6, [36, 40, 44]);
		for (const wx of [x + 18, x + w - 38]) c.fillRect(wx, y + 34, wx + 20, y + 62, [70, 80, 84]);
	}
	// 石拱桥
	c.strokeCircle(470, 500, 60, 0, [0, 0, 0]);
	for (let t = 0; t <= 1; t += 0.02) {
		const a = Math.PI * (1 - t);
		c.fillCircle(470 - Math.cos(a) * 62, 500 - Math.sin(a) * 62, 5, [120, 124, 126]);
	}
	c.hLine(400, 540, 498, [120, 124, 126]);
	// 乌篷船
	for (const [x, y] of [[240, 512], [700, 520]]) {
		c.fillEllipse(x, y, 46, 10, [58, 44, 34]);
		c.fillEllipse(x, y - 8, 24, 8, [44, 34, 26]);
		c.vLine(x + 30, y - 16, y + 4, [60, 46, 34]);
	}
	// 垂柳
	for (const [x, y] of [[60, 420], [900, 430]]) {
		c.vLine(x, y - 90, y, [70, 56, 40]);
		for (let i = 0; i < 6; i++) c.vLine(x - 24 + i * 9, y - 60, y + (i % 3) * 22, [126, 158, 110]);
	}
	// 水波
	for (let y = 470; y < H; y += 16) {
		for (let i = 0; i < 22; i++) c.hLine((i * 97 + y * 13) % W, (i * 97 + y * 13) % W + 46, y, [196, 210, 208]);
	}
	frame(c, [180, 160, 110], [222, 206, 160]);
	return c.toPng();
}

const COVERS = [
	{ id: "image-shenzhou-cover", name: "cover-cn.png", paint: shenzhou },
	{ id: "image-sanguo-cover", name: "cover-sanguo.png", paint: sanguo },
	{ id: "image-jiangnan-cover", name: "cover-jiangnan.png", paint: jiangnan },
];

export function buildCovers() {
	return COVERS.map((c) => ({ id: c.id, name: c.name, filetype: "png", content: c.paint() }));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
	const dir = join(PROJECT_ROOT, "apps/client/public/offline-maps");
	mkdirSync(dir, { recursive: true });
	for (const c of COVERS) {
		const png = c.paint();
		writeFileSync(join(dir, c.name), png);
		console.log(`封面: ${c.name} (${png.length}B)`);
	}
}
