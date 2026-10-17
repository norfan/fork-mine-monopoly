// 六位唐人角色专属头像（256×256 Q 版古风，纯 Node PNG）
// 每位：角色色渐变底 + 交领袍 + 幞头/发髻/帅盔 + 身份道具（酒杯/书卷/念珠/牡丹/铠甲/剑）
// 输出：buildRoleAvatars() → protobuf imageFiles 条目；另写 test-assets 预览图
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Canvas } from "./png-painter.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");

const S = 256;
const SKIN = [0.96, 0.83, 0.71];
const SKIN_D = [0.88, 0.72, 0.58];
const INK = [0.13, 0.12, 0.14];
const GOLD = [0.85, 0.68, 0.28];
const GOLD_L = [0.95, 0.84, 0.55];

const shade = (c, k) => c.map((v) => Math.max(0, Math.min(1, v * k)));

/** 颜色适配：png-painter 用 0..255，本文件的主题色是 0..1 浮点 */
export class RgbCanvas extends Canvas {
	static fix(color) {
		if (!Array.isArray(color)) return color;
		return color.map((v) => (v <= 1.0001 ? Math.round(v * 255) : v));
	}
	fillAll(color) { super.fillAll(RgbCanvas.fix(color)); }
	setPx(x, y, color) { super.setPx(x, y, RgbCanvas.fix(color)); }
	fillRect(x0, y0, x1, y1, color) { super.fillRect(x0, y0, x1, y1, RgbCanvas.fix(color)); }
	strokeRect(x0, y0, x1, y1, t, color) { super.strokeRect(x0, y0, x1, y1, t, RgbCanvas.fix(color)); }
	fillCircle(cx, cy, r, color) { super.fillCircle(cx, cy, r, RgbCanvas.fix(color)); }
	strokeCircle(cx, cy, r, t, color) { super.strokeCircle(cx, cy, r, t, RgbCanvas.fix(color)); }
	fillEllipse(cx, cy, rx, ry, color) { super.fillEllipse(cx, cy, rx, ry, RgbCanvas.fix(color)); }
	vGradient(x0, x1, y0, y1, top, bottom) { super.vGradient(x0, x1, y0, y1, RgbCanvas.fix(top), RgbCanvas.fix(bottom)); }
	fillTrapezoid(x0a, x0b, x1a, x1b, y0, y1, color) { super.fillTrapezoid(x0a, x0b, x1a, x1b, y0, y1, RgbCanvas.fix(color)); }
	hLine(x0, x1, y, color) { super.hLine(x0, x1, y, RgbCanvas.fix(color)); }
	vLine(x, y0, y1, color) { super.vLine(x, y0, y1, RgbCanvas.fix(color)); }
}

/** 背景：角色色渐变 + 双圈 + 四角暗纹 */
function base(c, color) {
	const top = shade(color, 0.55);
	const bottom = shade(color, 1.05);
	c.vGradient(0, S, 0, S, top, bottom);
	// 内圈光晕
	c.strokeCircle(S / 2, S / 2 + 6, 108, 3, shade(color, 1.25));
	c.strokeCircle(S / 2, S / 2 + 6, 100, 2, shade(color, 1.1));
	// 四角回纹点
	for (const [x, y] of [[18, 18], [S - 18, 18], [18, S - 18], [S - 18, S - 18]]) {
		c.fillCircle(x, y, 3, shade(color, 1.2));
		c.strokeCircle(x, y, 7, 1, shade(color, 1.1));
	}
}

/** 衣袍（交领）：从肩部到底部 */
function robe(c, color, trim = GOLD) {
	const dark = shade(color, 0.75);
	c.fillTrapezoid(58, 198, 26, 230, 168, S, dark); // 袍身
	// 缘边
	for (let i = 0; i < 8; i++) {
		const t = i / 7;
		const y = 168 + t * (S - 168);
		const w = 70 - t * 44;
		c.hLine(S / 2 - w / 2 - 6, S / 2 + w / 2 + 6, y + 8, trim);
	}
	// 交领（右衽）
	c.fillTrapezoid(104, 152, 118, 150, 172, 204, shade(color, 0.9));
	c.fillTrapezoid(152, 104, 150, 118, 172, 204, shade(color, 1.15));
	c.fillRect(126, 196, 130, 200, trim);
	// 腰带
	c.hLine(60, 196, 210, GOLD);
	c.fillRect(124, 205, 132, 222, GOLD);
}

/** 颈 + 脸 + 耳 */
function face(c) {
	c.fillRect(114, 150, 142, 172, SKIN_D); // 颈
	c.fillEllipse(128, 118, 46, 50, SKIN);
	c.fillEllipse(84, 118, 8, 14, SKIN);
	c.fillEllipse(172, 118, 8, 14, SKIN);
	// 眉
	c.fillRect(96, 100, 122, 104, INK);
	c.fillRect(134, 100, 160, 104, INK);
	// 眼
	c.fillEllipse(108, 114, 6, 8, INK);
	c.fillEllipse(148, 114, 6, 8, INK);
	c.fillCircle(110, 112, 2, [1, 1, 1]);
	c.fillCircle(150, 112, 2, [1, 1, 1]);
	// 鼻 + 嘴
	c.vLine(128, 116, 130, SKIN_D);
	c.fillEllipse(128, 142, 10, 5, [0.72, 0.38, 0.36]);
	// 腮红
	c.fillEllipse(94, 130, 8, 5, [0.95, 0.68, 0.62]);
	c.fillEllipse(162, 130, 8, 5, [0.95, 0.68, 0.62]);
}

/** 唐代幞头（黑纱软脚幞头） */
function mohanCap(c) {
	c.fillEllipse(128, 84, 50, 30, INK); // 帽体
	c.fillRect(78, 74, 178, 86, INK);
	c.fillEllipse(128, 72, 46, 16, [0.2, 0.19, 0.22]); // 顶
	// 两脚
	c.fillRect(72, 74, 80, 96, INK);
	c.fillRect(176, 74, 184, 96, INK);
	// 额金
	c.fillRect(96, 70, 160, 76, GOLD);
}

/** 发髻（女性/道人） */
function bun(c, color = INK) {
	c.fillEllipse(128, 66, 44, 32, color);
	c.fillCircle(128, 44, 18, color);
	c.fillCircle(96, 60, 12, color);
	c.fillCircle(160, 60, 12, color);
}

/** 胡须 */
function beard(c, color = INK, len = 40) {
	c.fillRect(120, 146, 136, 150, color);
	for (let i = 0; i < 5; i++) c.fillRect(118 + i * 4, 148, 122 + i * 4, 148 + len - i * 4, color);
}

// ---- 六位角色 ----

function libai() {
	const c = new RgbCanvas(S, S);
	base(c, [0.5, 0.47, 0.87]);
	robe(c, [0.42, 0.4, 0.78]);
	face(c);
	mohanCap(c);
	// 酒杯（右手侧）
	c.fillRect(196, 150, 202, 156, GOLD);
	c.fillEllipse(199, 144, 8, 6, GOLD_L);
	c.fillRect(197, 141, 201, 146, GOLD);
	c.vLine(196, 156, 178, GOLD);
	// 青莲叶
	c.fillEllipse(62, 62, 16, 8, [0.45, 0.72, 0.4]);
	c.fillEllipse(52, 70, 10, 6, [0.5, 0.78, 0.45]);
	c.fillCircle(58, 58, 3, GOLD_L);
	// 酒香
	c.strokeCircle(199, 128, 6, 1, GOLD_L);
	c.strokeCircle(199, 120, 9, 1, GOLD);
	return c.toPng();
}

function dufu() {
	const c = new RgbCanvas(S, S);
	base(c, [0.36, 0.62, 0.62]);
	robe(c, [0.45, 0.58, 0.5]);
	face(c);
	mohanCap(c);
	beard(c, [0.2, 0.2, 0.22], 46);
	// 书卷
	c.fillRect(52, 158, 96, 168, [0.85, 0.8, 0.68]);
	c.fillRect(52, 158, 96, 161, GOLD);
	c.vLine(74, 160, 166, [0.6, 0.55, 0.45]);
	c.fillCircle(96, 163, 4, VERMILION_RED);
	return c.toPng();
}

const VERMILION_RED = [0.7, 0.2, 0.18];

function xuanzang() {
	const c = new RgbCanvas(S, S);
	base(c, [0.79, 0.66, 0.29]);
	robe(c, [0.85, 0.62, 0.2], GOLD_L);
	face(c);
	// 光头 + 戒疤
	c.fillEllipse(128, 92, 44, 40, SKIN);
	for (const [x, y] of [[108, 74], [128, 68], [148, 74]]) c.fillCircle(x, y, 3, [0.8, 0.6, 0.45]);
	// 头顶光环
	c.strokeCircle(128, 78, 58, 3, GOLD_L);
	c.strokeCircle(128, 78, 64, 1, GOLD);
	// 念珠
	for (let i = 0; i < 12; i++) {
		const a = (i / 12) * Math.PI * 2;
		c.fillCircle(128 + Math.cos(a) * 62, 190 + Math.sin(a) * 26, 4, [0.85, 0.45, 0.2]);
	}
	c.fillCircle(128, 224, 6, GOLD); // 母珠
	// 锡杖
	c.vLine(214, 120, 236, GOLD);
	c.fillCircle(214, 116, 6, GOLD_L);
	for (let i = 0; i < 3; i++) c.strokeCircle(214, 128 + i * 8, 5, 1, GOLD_L);
	return c.toPng();
}

function yangguifei() {
	const c = new RgbCanvas(S, S);
	base(c, [0.83, 0.33, 0.49]);
	robe(c, [0.88, 0.45, 0.6], GOLD_L);
	face(c);
	bun(c, [0.16, 0.14, 0.17]);
	// 金步摇
	c.vLine(96, 70, 60, GOLD);
	c.vLine(160, 70, 196, GOLD);
	c.fillCircle(96, 58, 5, GOLD_L);
	c.fillCircle(160, 58, 5, GOLD_L);
	c.fillEllipse(96, 52, 4, 8, GOLD_L);
	c.fillEllipse(160, 52, 4, 8, GOLD_L);
	// 牡丹（左鬓）
	c.fillCircle(66, 96, 10, [0.9, 0.35, 0.45]);
	for (let i = 0; i < 6; i++) {
		const a = (i / 6) * Math.PI * 2;
		c.fillCircle(66 + Math.cos(a) * 9, 96 + Math.sin(a) * 9, 6, [0.95, 0.5, 0.6]);
	}
	c.fillCircle(66, 96, 4, GOLD_L);
	// 面靥
	c.fillCircle(100, 138, 2.5, [0.75, 0.2, 0.3]);
	c.fillCircle(156, 138, 2.5, [0.75, 0.2, 0.3]);
	// 花钿
	c.fillEllipse(128, 96, 5, 3, [0.75, 0.2, 0.3]);
	return c.toPng();
}

function guozeyi() {
	const c = new RgbCanvas(S, S);
	base(c, [0.69, 0.23, 0.18]);
	// 铠甲战袍
	const dark = [0.55, 0.25, 0.2];
	c.fillTrapezoid(58, 198, 26, 230, 168, S, dark);
	for (let i = 0; i < 6; i++) {
		const t = i / 5;
		const y = 176 + t * 70;
		const w = 62 - t * 36;
		const x0 = S / 2 - w / 2;
		c.fillRect(x0, y, S / 2 + w / 2, y + 12, [0.62, 0.63, 0.66]); // 甲叶
		c.strokeRect(x0, y, S / 2 + w / 2, y + 12, 1, [0.4, 0.4, 0.44]);
	}
	// 护心镜
	c.fillCircle(128, 196, 14, GOLD_L);
	c.strokeCircle(128, 196, 14, 2, GOLD);
	// 交领
	c.fillTrapezoid(104, 152, 118, 150, 172, 200, [0.75, 0.28, 0.22]);
	c.fillTrapezoid(152, 104, 150, 118, 172, 200, [0.6, 0.22, 0.18]);
	face(c);
	// 帅盔
	c.fillEllipse(128, 76, 52, 30, [0.45, 0.47, 0.52]);
	c.fillRect(76, 66, 180, 78, [0.45, 0.47, 0.52]);
	c.fillRect(108, 34, 148, 62, [0.55, 0.57, 0.62]); // 盔顶
	c.fillCircle(128, 32, 8, GOLD);
	// 红缨
	c.fillEllipse(128, 22, 10, 14, [0.75, 0.15, 0.15]);
	c.vLine(128, 8, 22, [0.75, 0.15, 0.15]);
	// 额护
	c.fillRect(88, 74, 168, 82, GOLD);
	// 长髯
	beard(c, [0.25, 0.22, 0.2], 52);
	// 长枪
	c.vLine(210, 40, 250, WOOD_BROWN);
	c.fillTrapezoid(206, 210, 204, 212, 36, 74, [0.75, 0.78, 0.82]);
	return c.toPng();
}

const WOOD_BROWN = [0.5, 0.34, 0.22];

function gongsun() {
	const c = new RgbCanvas(S, S);
	base(c, [0.23, 0.49, 0.43]);
	robe(c, [0.2, 0.45, 0.42], GOLD_L);
	face(c);
	bun(c, [0.14, 0.13, 0.15]);
	// 剑髻：束发剑
	c.fillRect(122, 30, 134, 68, [0.7, 0.72, 0.76]);
	c.fillCircle(128, 28, 5, GOLD);
	c.vLine(128, 8, 28, [0.75, 0.15, 0.15]); // 红缨
	// 眉煞
	c.fillRect(94, 96, 122, 100, [0.2, 0.2, 0.22]);
	c.fillRect(134, 96, 162, 100, [0.2, 0.2, 0.22]);
	// 长剑（斜持）
	for (let i = 0; i < 60; i++) {
		const t = i / 59;
		c.setPx(196 - t * 26, 120 + t * 96, [0.78, 0.8, 0.84]);
		c.setPx(197 - t * 26, 121 + t * 96, [0.6, 0.62, 0.66]);
	}
	c.fillRect(166, 112, 182, 122, GOLD); // 剑格
	c.fillRect(170, 122, 178, 138, WOOD_BROWN); // 剑柄
	c.fillCircle(174, 140, 4, GOLD);
	return c.toPng();
}

const ROLES = [
	{ id: "image-role-libai", name: "role-libai.png", paint: libai },
	{ id: "image-role-dufu", name: "role-dufu.png", paint: dufu },
	{ id: "image-role-xuanzang", name: "role-xuanzang.png", paint: xuanzang },
	{ id: "image-role-yangguifei", name: "role-yangguifei.png", paint: yangguifei },
	{ id: "image-role-guozeyi", name: "role-guozeyi.png", paint: guozeyi },
	{ id: "image-role-gongsun", name: "role-gongsun.png", paint: gongsun },
];

/** 构建全部角色头像，返回 protobuf imageFiles 条目 */
export function buildRoleAvatars() {
	return ROLES.map((r) => {
		const png = r.paint();
		return { id: r.id, name: r.name, filetype: "png", content: png };
	});
}

/** 独立运行：写预览图 */
const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
	const previewDir = join(PROJECT_ROOT, "test-assets");
	mkdirSync(previewDir, { recursive: true });
	for (const r of ROLES) {
		const png = r.paint();
		writeFileSync(join(previewDir, r.name), png);
		console.log(`头像预览: ${r.name} (${png.length}B)`);
	}
}
