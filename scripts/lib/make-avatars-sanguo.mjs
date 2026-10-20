// 三国群雄头像（三国风云）：曹操/刘备/孙权/诸葛亮/吕布/貂蝉
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
/** 长须 */
function beard(c, color, len = 46) {
	c.fillEllipse(128, 128 + len * 0.3, 16, len * 0.55, color);
	c.fillRect(112, 118, 144, 124, color);
}
/** 冕冠/梁冠 */
function guan(c, w = 34) {
	c.fillRect(128 - w, 40, 128 + w, 52, INK);
	c.fillRect(128 - w * 0.7, 26, 128 + w * 0.7, 40, shade(INK, 1.3));
	c.fillRect(118, 16, 138, 26, GOLD);
}

function caocao() {
	const c = new RgbCanvas(S, S);
	base(c, [0.24, 0.36, 0.56]);
	robe(c, [0.16, 0.24, 0.42], GOLD);
	face(c);
	beard(c, [0.2, 0.2, 0.24], 40);
	guan(c, 32);
	c.fillCircle(108, 88, 3, INK); c.fillCircle(148, 88, 3, INK);
	// 倚天剑（斜背）
	c.fillRect(58, 210, 180, 222, [0.72, 0.74, 0.78]);
	c.fillRect(168, 204, 196, 214, GOLD);
	c.fillCircle(180, 196, 6, GOLD_L);
	return c.toPng();
}

function liubei() {
	const c = new RgbCanvas(S, S);
	base(c, [0.28, 0.5, 0.36]);
	robe(c, [0.32, 0.55, 0.38], [0.85, 0.7, 0.3]);
	face(c); smile(c);
	// 耳垂肩
	c.fillEllipse(84, 106, 12, 22, SKIN);
	c.fillEllipse(172, 106, 12, 22, SKIN);
	// 双股剑（左右佩剑）
	for (const [x, flip] of [[44, 1], [212, -1]]) {
		c.fillRect(x - 5 + (flip < 0 ? 10 : 0), 180, x + 5 + (flip < 0 ? 10 : 0), 236, [0.7, 0.72, 0.76]);
		c.fillRect(x - 8 + (flip < 0 ? 16 : 0), 170, x + 8 + (flip < 0 ? 16 : 0), 180, GOLD);
	}
	// 冠
	c.fillRect(104, 40, 152, 50, [0.5, 0.35, 0.22]);
	c.fillRect(112, 28, 144, 40, [0.45, 0.3, 0.18]);
	c.fillCircle(128, 24, 5, GOLD_L);
	return c.toPng();
}

function sunquan() {
	const c = new RgbCanvas(S, S);
	base(c, [0.55, 0.2, 0.2]);
	robe(c, [0.6, 0.22, 0.24], GOLD);
	face(c);
	// 紫髯
	beard(c, [0.42, 0.3, 0.5], 38);
	// 碧眼（孙权特征）
	c.fillCircle(112, 94, 5, [0.35, 0.55, 0.7]);
	c.fillCircle(144, 94, 5, [0.35, 0.55, 0.7]);
	c.fillCircle(112, 94, 2, INK);
	c.fillCircle(144, 94, 2, INK);
	// 王冠
	c.fillRect(102, 46, 154, 56, GOLD);
	for (let i = 0; i < 4; i++) c.fillRect(104 + i * 14, 34, 110 + i * 14, 46, GOLD_L);
	c.fillCircle(128, 30, 5, [0.85, 0.2, 0.2]);
	// 江东大旗
	c.fillRect(196, 150, 202, 232, [0.45, 0.3, 0.2]);
	c.fillRect(202, 156, 240, 200, [0.85, 0.2, 0.2]);
	c.fillCircle(222, 178, 9, GOLD_L);
	return c.toPng();
}

function zhugeliang() {
	const c = new RgbCanvas(S, S);
	base(c, [0.35, 0.35, 0.62]);
	robe(c, [0.42, 0.42, 0.68], [0.9, 0.9, 0.88]);
	face(c); smile(c);
	beard(c, [0.85, 0.85, 0.82], 34);
	// 纶巾
	c.fillRect(94, 44, 162, 62, [0.9, 0.9, 0.86]);
	c.fillRect(104, 32, 152, 44, [0.82, 0.82, 0.78]);
	c.fillRect(92, 46, 164, 52, [0.75, 0.75, 0.72]);
	// 羽扇（鹅毛扇）
	for (let i = 0; i < 5; i++) {
		const a = -0.5 + i * 0.25;
		c.fillEllipse(200 + Math.cos(a) * 26, 205 + Math.sin(a) * 26, 7, 20, [0.93, 0.93, 0.9], );
	}
	c.fillRect(192, 214, 206, 240, [0.5, 0.35, 0.22]);
	c.fillCircle(199, 214, 5, GOLD);
	return c.toPng();
}

function lvbu() {
	const c = new RgbCanvas(S, S);
	base(c, [0.75, 0.4, 0.15]);
	robe(c, [0.7, 0.25, 0.18], GOLD);
	face(c);
	// 束发金冠 + 双翎
	c.fillRect(100, 46, 156, 58, GOLD);
	c.fillRect(108, 34, 148, 46, GOLD_L);
	c.fillCircle(128, 30, 6, [0.85, 0.2, 0.2]);
	for (const [x, dy] of [[100, 4], [156, 4]]) {
		c.fillEllipse(x, 26 + dy, 5, 18, [0.85, 0.25, 0.2]);
	}
	// 方天画戟（长杆 + 月牙）
	c.fillRect(52, 120, 60, 244, [0.45, 0.32, 0.2]);
	c.fillRect(42, 150, 72, 162, [0.72, 0.74, 0.78]);
	c.fillEllipse(56, 138, 14, 6, [0.72, 0.74, 0.78]);
	c.fillEllipse(56, 174, 14, 6, [0.72, 0.74, 0.78]);
	c.fillCircle(56, 244, 6, GOLD);
	c.fillCircle(57, 112, 5, [0.85, 0.2, 0.2]);
	return c.toPng();
}

function diaochan() {
	const c = new RgbCanvas(S, S);
	base(c, [0.83, 0.45, 0.6]);
	robe(c, [0.88, 0.5, 0.65], GOLD_L);
	face(c); smile(c);
	// 垂鬟髻
	c.fillEllipse(128, 44, 46, 30, INK);
	c.fillEllipse(92, 74, 12, 24, INK);
	c.fillEllipse(164, 74, 12, 24, INK);
	c.fillCircle(92, 96, 6, GOLD_L); c.fillCircle(164, 96, 6, GOLD_L);
	// 面靥花钿
	for (const [x, y] of [[104, 110], [152, 110]]) c.fillCircle(x, y, 3, [0.85, 0.3, 0.35]);
	// 琵琶
	c.fillEllipse(188, 200, 26, 34, [0.72, 0.5, 0.3]);
	c.fillRect(176, 190, 200, 212, [0.6, 0.4, 0.24]);
	c.fillRect(196, 158, 208, 186, [0.5, 0.35, 0.22]);
	for (let i = 0; i < 4; i++) c.vLine(198 + i * 3, 160, 184, [0.9, 0.85, 0.7]);
	return c.toPng();
}

const AVATARS = [
	{ id: "caocao", name: "曹操", paint: caocao },
	{ id: "liubei", name: "刘备", paint: liubei },
	{ id: "sunquan", name: "孙权", paint: sunquan },
	{ id: "zhugeliang", name: "诸葛亮", paint: zhugeliang },
	{ id: "lvbu", name: "吕布", paint: lvbu },
	{ id: "diaochan", name: "貂蝉", paint: diaochan },
];

/** 构建三国头像，返回 protobuf imageFiles 条目 */
export function buildSanguoAvatars() {
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
		writeFileSync(join(dir, `sanguo-${a.id}.png`), png);
		console.log(`三国头像预览: sanguo-${a.id}.png (${png.length}B)`);
	}
}
