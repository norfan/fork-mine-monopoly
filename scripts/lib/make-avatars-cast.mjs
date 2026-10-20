// 大宇经典 cast 头像（神州大地 + 江南水乡）：钱夫人/孙小美/阿土博/沙隆巴斯/乌咪/忍太郎
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { RgbCanvas } from "./make-role-avatars.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const S = 256;
const SKIN = [0.96, 0.83, 0.71];
const GOLD = [0.85, 0.68, 0.28];
const GOLD_L = [0.95, 0.84, 0.55];
const INK = [0.13, 0.12, 0.14];
const shade = (c, k) => c.map((v) => Math.max(0, Math.min(1, v * k)));

function base(c, color) {
	c.vGradient(0, S, 0, S, shade(color, 0.55), shade(color, 1.05));
	c.strokeCircle(S / 2, S / 2 + 6, 108, 3, shade(color, 1.25));
	c.strokeCircle(S / 2, S / 2 + 6, 100, 2, shade(color, 1.1));
	for (const [x, y] of [[18, 18], [S - 18, 18], [18, S - 18], [S - 18, S - 18]]) {
		c.fillCircle(x, y, 3, shade(color, 1.2));
		c.strokeCircle(x, y, 7, 1, shade(color, 1.1));
	}
}
function face(c) {
	c.fillEllipse(128, 96, 42, 46, SKIN);
	c.fillCircle(112, 94, 4, INK);
	c.fillCircle(144, 94, 4, INK);
	c.strokeCircle(113, 92, 1.5, 1, [1, 1, 1]);
	c.strokeCircle(145, 92, 1.5, 1, [1, 1, 1]);
	c.fillEllipse(128, 112, 5, 4, shade([0.85, 0.5, 0.45], 0.5));
	c.arc ? null : null;
}
function smile(c) {
	for (let i = -14; i <= 14; i += 2) c.setPx(128 + i, 118 + Math.round((14 * 14 - i * i) / 22), shade(INK, 1.4));
}
function robe(c, color, trim) {
	const dark = shade(color, 0.78);
	c.fillTrapezoid(58, 198, 26, 230, 168, S, dark);
	for (let i = 0; i < 8; i++) c.vLine(118 + i, 160, 224, shade(color, 0.7));
	c.fillRect(110, 156, 146, 178, trim);
}

function qianfuren() {
	const c = new RgbCanvas(S, S);
	base(c, [0.83, 0.33, 0.49]);
	const qipao = [0.83, 0.25, 0.42];
	robe(c, qipao, GOLD);
	face(c); smile(c);
	// 盘发 + 珠宝
	c.fillEllipse(128, 52, 46, 34, INK);
	c.fillCircle(96, 62, 9, GOLD_L); c.fillCircle(160, 62, 9, GOLD_L);
	c.strokeCircle(128, 68, 44, 2, GOLD);
	// 钻石项链
	c.strokeCircle(128, 150, 16, 2, GOLD_L);
	c.fillCircle(128, 152, 5, [0.9, 0.95, 1]);
	// 折扇
	c.fillEllipse(192, 198, 16, 26, [0.92, 0.9, 0.82], );
	for (let i = 0; i < 5; i++) c.vLine(182 + i * 5, 178, 218, shade([0.8, 0.3, 0.35], 0.9));
	return c.toPng();
}

function sunxiaomei() {
	const c = new RgbCanvas(S, S);
	base(c, [0.69, 0.23, 0.18]);
	robe(c, [0.93, 0.78, 0.25], [0.85, 0.3, 0.28]);
	face(c); smile(c);
	// 双丸子头
	c.fillCircle(96, 62, 16, INK); c.fillCircle(160, 62, 16, INK);
	c.fillCircle(96, 58, 8, [0.85, 0.25, 0.25]); c.fillCircle(160, 58, 8, [0.85, 0.25, 0.25]);
	c.fillEllipse(128, 44, 40, 26, INK);
	// 小红鞋（头顶标志）
	c.fillEllipse(128, 14, 12, 7, [0.85, 0.2, 0.2]);
	c.fillRect(120, 8, 136, 14, [0.85, 0.2, 0.2]);
	// 杂技彩球
	c.fillCircle(52, 210, 10, [0.3, 0.55, 0.85]);
	c.fillCircle(204, 210, 10, [0.9, 0.6, 0.2]);
	return c.toPng();
}

function atubo() {
	const c = new RgbCanvas(S, S);
	base(c, [0.55, 0.42, 0.25]);
	robe(c, [0.45, 0.55, 0.42], [0.6, 0.45, 0.3]);
	face(c); smile(c);
	// 憨态：眯眼 + 憨鼻
	c.fillRect(104, 92, 120, 96, INK); c.fillRect(136, 92, 152, 96, INK);
	c.fillCircle(128, 108, 7, shade(SKIN, 0.9));
	// 斗笠
	c.fillEllipse(128, 66, 66, 20, [0.82, 0.7, 0.45]);
	c.fillEllipse(128, 58, 34, 14, [0.72, 0.6, 0.38]);
	for (let i = 0; i < 4; i++) c.vLine(78 + i * 22, 50, 66, [0.6, 0.5, 0.32]);
	// 斗笠红绳
	c.strokeCircle(128, 70, 40, 1.5, [0.75, 0.25, 0.2]);
	return c.toPng();
}

function shalongbasi() {
	const c = new RgbCanvas(S, S);
	base(c, [0.9, 0.9, 0.88]);
	robe(c, [0.93, 0.93, 0.9], [0.75, 0.15, 0.15]);
	face(c); smile(c);
	// 大胡子 + 头巾
	c.fillEllipse(128, 44, 42, 28, [0.55, 0.35, 0.25]);
	c.fillEllipse(128, 128, 26, 22, [0.55, 0.35, 0.25]);
	c.fillRect(86, 44, 170, 52, [0.4, 0.35, 0.5]);
	c.fillCircle(128, 36, 6, GOLD_L);
	// 汽油桶（金桶）
	const bx = 196;
	c.fillRect(bx - 16, 160, bx + 16, 226, GOLD);
	c.fillRect(bx - 16, 168, bx + 16, 174, shade(GOLD, 0.8));
	c.fillRect(bx - 16, 196, bx + 16, 202, shade(GOLD, 0.8));
	c.fillEllipse(bx, 160, 17, 6, GOLD_L);
	c.fillCircle(bx - 6, 190, 3, INK);
	return c.toPng();
}

function wumi() {
	const c = new RgbCanvas(S, S);
	base(c, [0.87, 0.51, 0.16]);
	robe(c, [0.93, 0.6, 0.2], GOLD_L);
	face(c); smile(c);
	// 羽毛头饰
	c.fillEllipse(128, 52, 40, 26, [0.45, 0.28, 0.18]);
	for (let i = 0; i < 3; i++) {
		const a = -0.9 + i * 0.45;
		c.fillEllipse(128 + Math.cos(a) * 44, 52 + Math.sin(a) * 34, 6, 16, [0.95, 0.85, 0.65], );
	}
	c.fillCircle(96, 58, 5, [0.95, 0.85, 0.65]);
	c.fillCircle(160, 58, 5, [0.35, 0.7, 0.8]);
	// 舞姿飘带
	for (let i = 0; i < 3; i++) c.fillRect(36 - i * 3, 190 + i * 8, 76, 196 + i * 8, [0.95, 0.75, 0.4]);
	c.fillCircle(196, 182, 8, [0.95, 0.75, 0.4]);
	return c.toPng();
}

function rentailang() {
	const c = new RgbCanvas(S, S);
	base(c, [0.45, 0.4, 0.75]);
	robe(c, [0.35, 0.35, 0.6], [0.85, 0.2, 0.2]);
	face(c);
	// 忍者头巾 + 护额
	c.fillEllipse(128, 60, 44, 30, [0.32, 0.32, 0.55]);
	c.fillRect(84, 52, 172, 64, [0.85, 0.2, 0.2]);
	c.fillCircle(128, 58, 6, GOLD_L);
	for (let i = 0; i < 3; i++) c.vLine(172 + i * 3, 56, 92, [0.85, 0.2, 0.2]);
	// 手里剑
	for (const [x, y] of [[50, 76], [206, 76]]) {
		c.fillRect(x - 9, y - 3, x + 9, y + 3, [0.72, 0.74, 0.78]);
		c.fillRect(x - 3, y - 9, x + 3, y + 9, [0.72, 0.74, 0.78]);
		c.fillCircle(x, y, 2.5, INK);
	}
	return c.toPng();
}

const AVATARS = [
	{ id: "qianfuren", name: "钱夫人", paint: qianfuren },
	{ id: "sunxiaomei", name: "孙小美", paint: sunxiaomei },
	{ id: "atubo", name: "阿土伯", paint: atubo },
	{ id: "shalongbasi", name: "沙隆巴斯", paint: shalongbasi },
	{ id: "wumi", name: "乌咪", paint: wumi },
	{ id: "rentailang", name: "忍太郎", paint: rentailang },
];

/** 构建 cast 头像，返回 protobuf imageFiles 条目（id 已带 image-role- 前缀） */
export function buildCastAvatars() {
	return AVATARS.map((a) => ({
		id: `image-role-${a.id}`,
		name: `role-${a.id}.png`,
		filetype: "png",
		content: a.paint(),
	}));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
	const dir = join(PROJECT_ROOT, "test-assets");
	mkdirSync(dir, { recursive: true });
	for (const a of AVATARS) {
		const png = a.paint();
		writeFileSync(join(dir, `cast-${a.id}.png`), png);
		console.log(`cast 头像预览: cast-${a.id}.png (${png.length}B)`);
	}
}
