// 八道特色建筑：每道 5 个建造等级（level 0..4）+ 1 个街头小景
// 用法：buildDistrictHouses() → [{ id, name, filetype, glb }]
// 约定：外接 <= 1×1 格，底部贴地；主墙节点命名 "color-wall"，被房主染色
import { buildGlb } from "./glb-builder.mjs";

// ---- 唐风配色（0..1）----
const STONE = [0.55, 0.53, 0.5]; // 台基石
const VERMILION = [0.62, 0.17, 0.16]; // 朱红（柱/门窗）
const TILE = [0.29, 0.29, 0.32]; // 瓦灰
const WHITE = [0.91, 0.88, 0.82]; // 白墙
const GOLD = [0.72, 0.55, 0.18]; // 琉璃金
const WOOD = [0.54, 0.35, 0.23]; // 原木
const DARK = [0.16, 0.13, 0.12]; // 门/灶膛
const GREEN = [0.35, 0.5, 0.3]; // 茶/桑
const RICE = [0.76, 0.66, 0.38]; // 稻草
const CLOTH = [0.72, 0.3, 0.42]; // 绸缎

function box(cx, base, cz, sx, sy, sz, color, opts = {}) {
	const part = { c: [cx, base + sy / 2, cz], s: [sx, sy, sz], color };
	if (opts.rotY) part.rotY = opts.rotY;
	if (opts.name) part.name = opts.name;
	return part;
}

/** 庑殿顶：檐口两级收分 + 正脊 */
function roofHip(p, cx, base, cz, w, d, color, ridge) {
	p.push(box(cx, base, cz, w + 0.2, 0.05, d + 0.2, color));
	p.push(box(cx, base + 0.05, cz, w + 0.08, 0.05, d + 0.08, color));
	p.push(box(cx, base + 0.1, cz, w - 0.06, 0.05, d - 0.06, color));
	p.push(box(cx, base + 0.16, cz, Math.max(0.06, w * 0.16), 0.05, d - 0.06, ridge));
	return base + 0.21;
}

/** 歇山顶：三级收分 + 小脊 */
function roofGable(p, cx, base, cz, w, d, color, ridge) {
	p.push(box(cx, base, cz, w + 0.18, 0.05, d + 0.18, color));
	p.push(box(cx, base + 0.05, cz, w + 0.04, 0.05, d + 0.04, color));
	p.push(box(cx, base + 0.1, cz, w - 0.1, 0.05, d - 0.1, color));
	p.push(box(cx, base + 0.15, cz, Math.max(0.06, w * 0.2), 0.05, d - 0.08, ridge));
	return base + 0.2;
}

/** 囤顶（粮仓/窑）：圆顶感（逐层收方）+ 顶珠 */
function roofRound(p, cx, base, cz, w, d, color, ridge) {
	p.push(box(cx, base, cz, w, 0.06, d, color));
	p.push(box(cx, base + 0.06, cz, w * 0.8, 0.06, d * 0.8, color));
	p.push(box(cx, base + 0.12, cz, w * 0.58, 0.06, d * 0.58, color));
	p.push(box(cx, base + 0.18, cz, w * 0.3, 0.05, d * 0.3, ridge));
	return base + 0.23;
}

/** 单坡长屋（桑蚕）：向一侧递降的三段 */
function roofShed(p, cx, base, cz, w, d, color) {
	p.push(box(cx, base, cz, w + 0.16, 0.05, d + 0.16, color));
	p.push(box(cx + 0.06, base + 0.05, cz, w, 0.05, d + 0.06, color));
	p.push(box(cx + 0.12, base + 0.1, cz, w * 0.7, 0.05, d - 0.04, color));
	return base + 0.15;
}

/** 标准屋身：台基 + 四墙(color-wall) + 角柱 + 门 + 槛窗 */
function houseBody(p, { w, d, h, wallColor, column = VERMILION, door = true, window = true, base = 0.06 }) {
	p.push(box(0, 0, 0, w + 0.18, 0.06, d + 0.18, STONE)); // 台基
	// 四墙（命名 color-wall → 房主染色）
	p.push(box(0, base, -d / 2, w, h, 0.05, wallColor, { name: "color-wall" }));
	p.push(box(0, base, d / 2, w, h, 0.05, wallColor, { name: "color-wall" }));
	p.push(box(-w / 2, base, 0, 0.05, h, d, wallColor, { name: "color-wall" }));
	p.push(box(w / 2, base, 0, 0.05, h, d, wallColor, { name: "color-wall" }));
	// 角柱
	for (const [cx, cz] of [[-w / 2, -d / 2], [w / 2, -d / 2], [-w / 2, d / 2], [w / 2, d / 2]]) {
		p.push(box(cx, base, cz, 0.07, h + 0.04, 0.07, column));
	}
	if (door) p.push(box(0, base, d / 2 + 0.01, 0.18, h * 0.62, 0.03, DARK));
	if (window) {
		p.push(box(-w * 0.24, base + h * 0.5, d / 2 + 0.01, 0.14, 0.12, 0.03, DARK));
		p.push(box(w * 0.24, base + h * 0.5, d / 2 + 0.01, 0.14, 0.12, 0.03, DARK));
	}
	return base + h;
}

/** 二层腰檐 + 二层墙身（楼阁用） */
function upperFloor(p, { w, d, h, wallColor, base }) {
	p.push(box(0, base, 0, w + 0.14, 0.05, d + 0.14, TILE));
	p.push(box(0, base + 0.05, -d / 2, w - 0.06, h, 0.05, wallColor, { name: "color-wall" }));
	p.push(box(0, base + 0.05, d / 2, w - 0.06, h, 0.05, wallColor, { name: "color-wall" }));
	p.push(box(-(w - 0.06) / 2, base + 0.05, 0, 0.05, h, d, wallColor, { name: "color-wall" }));
	p.push(box((w - 0.06) / 2, base + 0.05, 0, 0.05, h, d, wallColor, { name: "color-wall" }));
	for (const [cx, cz] of [[-(w - 0.06) / 2, -d / 2], [(w - 0.06) / 2, -d / 2], [-(w - 0.06) / 2, d / 2], [(w - 0.06) / 2, d / 2]]) {
		p.push(box(cx, base + 0.05, cz, 0.06, h + 0.03, 0.06, VERMILION));
	}
	return base + 0.05 + h;
}

/** 悬挂灯笼一对 */
function lanterns(p, y, halfW, cz = 0.3) {
	for (const s of [-1, 1]) {
		p.push(box(s * halfW, y, cz, 0.03, 0.1, 0.03, WOOD));
		p.push(box(s * halfW, y + 0.1, cz, 0.1, 0.1, 0.1, [0.72, 0.13, 0.13]));
		p.push(box(s * halfW, y + 0.08, cz, 0.05, 0.02, 0.05, GOLD));
	}
}

/** 酒旗/幡：杆 + 旗面 */
function flag(p, cx, base, cz, color, height = 0.55) {
	p.push(box(cx, base, cz, 0.03, height, 0.03, WOOD));
	p.push(box(cx + 0.09, base + height - 0.16, cz, 0.16, 0.2, 0.02, color));
}

/** 华表：柱 + 云盘 + 承露盘 */
function huabiao(p, cx, base, cz, scale = 1) {
	const h = 0.62 * scale;
	p.push(box(cx, base, cz, 0.16 * scale, 0.05, 0.16 * scale, STONE));
	p.push(box(cx, base + 0.05, cz, 0.05, h, 0.05, WHITE));
	p.push(box(cx, base + 0.05 + h * 0.6, cz, 0.14 * scale, 0.04, 0.14 * scale, GOLD));
	p.push(box(cx, base + h, cz, 0.2 * scale, 0.04, 0.2 * scale, GOLD));
}

/** —— 各道主题装饰（按等级递进）—— */

function decoGuannei(p, lv, base) {
	huabiao(p, -0.42, 0, 0.3, 0.8);
	if (lv >= 2) huabiao(p, 0.42, 0, 0.3, 0.8);
	if (lv >= 1) lanterns(p, base, 0.36);
	if (lv >= 3) p.push(box(0, base + 0.24, 0, 0.06, 0.18, 0.06, GOLD)); // 宝顶
}

function decoJingji(p, lv, base) {
	flag(p, -0.42, 0, 0.32, [0.72, 0.2, 0.2], 0.6);
	if (lv >= 1) p.push(box(0.3, base - 0.1, 0.36, 0.24, 0.1, 0.03, WOOD)); // 酒招
	if (lv >= 2) lanterns(p, base, 0.38);
	if (lv >= 3) flag(p, 0.42, 0, -0.32, GOLD, 0.5);
}

function decoHenan(p, lv, base) {
	// 桑垛：交叉叠木
	for (let i = 0; i < 3; i++) {
		p.push(box(-0.4, 0.04 + i * 0.1, 0.34, 0.2, 0.08, 0.14, i % 2 ? WOOD : [0.6, 0.46, 0.3]));
	}
	if (lv >= 1) p.push(box(0.36, 0.04, 0.34, 0.22, 0.05, 0.16, [0.45, 0.6, 0.35])); // 蚕匾
	if (lv >= 2) p.push(box(-0.36, 0.04, -0.34, 0.22, 0.05, 0.16, [0.45, 0.6, 0.35]));
	if (lv >= 3) lanterns(p, base, 0.38);
}

function decoHedong(p, lv, base) {
	// 盐井架：双柱 + 交叉撑 + 辘轳
	p.push(box(-0.38, 0, 0.3, 0.05, 0.5, 0.05, WOOD));
	p.push(box(-0.24, 0, 0.3, 0.05, 0.5, 0.05, WOOD));
	p.push(box(-0.31, 0.12, 0.3, 0.16, 0.04, 0.04, WOOD, { rotY: Math.PI / 4 }));
	p.push(box(-0.31, 0.26, 0.3, 0.16, 0.04, 0.04, WOOD, { rotY: -Math.PI / 4 }));
	p.push(box(-0.31, 0.5, 0.3, 0.22, 0.04, 0.05, WOOD));
	if (lv >= 1) p.push(box(0.34, 0, 0.32, 0.16, 0.14, 0.14, WHITE)); // 盐袋
	if (lv >= 2) {
		p.push(box(0.4, 0, -0.3, 0.12, 0.3, 0.12, TILE)); // 烟囱
		p.push(box(0.4, 0.3, -0.3, 0.16, 0.05, 0.16, [0.3, 0.28, 0.26]));
	}
	if (lv >= 3) lanterns(p, base, 0.4);
}

function decoHebei(p, lv, base) {
	// 瓷窑：圆包窑 + 窑门 + 陶瓮
	const kx = -0.34;
	const kz = 0.3;
	p.push(box(kx, 0, kz, 0.3, 0.12, 0.3, [0.6, 0.42, 0.3]));
	p.push(box(kx, 0.12, kz, 0.24, 0.1, 0.24, [0.66, 0.47, 0.33]));
	p.push(box(kx, 0.22, kz, 0.16, 0.08, 0.16, [0.72, 0.52, 0.36]));
	p.push(box(kx, 0.06, kz + 0.15, 0.1, 0.12, 0.03, DARK)); // 窑门
	if (lv >= 1) p.push(box(0.36, 0, 0.32, 0.12, 0.14, 0.12, [0.55, 0.62, 0.68])); // 陶瓮
	if (lv >= 2) p.push(box(0.2, 0, 0.34, 0.1, 0.1, 0.1, WHITE));
	if (lv >= 3) lanterns(p, base, 0.4);
}

function decoHuainan(p, lv, base) {
	// 粮囤：草圆锥 + 谷袋
	const gx = -0.36;
	const gz = 0.3;
	p.push(box(gx, 0, gz, 0.26, 0.1, 0.26, STONE));
	p.push(box(gx, 0.1, gz, 0.22, 0.1, 0.22, RICE));
	p.push(box(gx, 0.2, gz, 0.15, 0.08, 0.15, [0.82, 0.72, 0.42]));
	p.push(box(gx, 0.28, gz, 0.07, 0.06, 0.07, [0.86, 0.78, 0.5]));
	if (lv >= 1) p.push(box(0.34, 0, 0.32, 0.14, 0.12, 0.12, RICE));
	if (lv >= 2) p.push(box(0.44, 0, 0.18, 0.12, 0.1, 0.12, RICE));
	if (lv >= 3) lanterns(p, base, 0.4);
}

function decoJiangnan(p, lv, base) {
	// 绣坊晾杆：高杆 + 横杆 + 垂绸
	p.push(box(-0.4, 0, 0.32, 0.04, 0.56, 0.04, WOOD));
	p.push(box(-0.24, 0.54, 0.32, 0.36, 0.03, 0.03, WOOD));
	p.push(box(-0.3, 0.4, 0.32, 0.1, 0.14, 0.02, CLOTH));
	p.push(box(-0.16, 0.4, 0.32, 0.1, 0.14, 0.02, [0.35, 0.55, 0.7]));
	if (lv >= 1) p.push(box(0.38, 0, 0.32, 0.12, 0.1, 0.12, CLOTH)); // 缎卷
	if (lv >= 2) p.push(box(0.38, 0, 0.1, 0.12, 0.1, 0.12, [0.6, 0.75, 0.55]));
	if (lv >= 3) lanterns(p, base, 0.4);
}

function decoJiannan(p, lv, base) {
	// 茶垄：梯田条 + 茶篓
	for (let i = 0; i < 3; i++) {
		p.push(box(-0.34 - i * 0.02, 0.03 + i * 0.05, 0.3 + i * 0.05, 0.16 - i * 0.02, 0.05, 0.5 - i * 0.08, i === 2 ? GREEN : [0.4, 0.58, 0.32]));
	}
	if (lv >= 1) p.push(box(0.36, 0, 0.3, 0.13, 0.12, 0.13, [0.62, 0.48, 0.28])); // 茶篓
	if (lv >= 2) p.push(box(0.36, 0.12, 0.3, 0.1, 0.04, 0.1, GREEN));
	if (lv >= 3) lanterns(p, base, 0.4);
}

/** 等级规格 */
const LEVELS = [
	{ w: 0.5, d: 0.46, h: 0.3, tiers: 1 },
	{ w: 0.58, d: 0.52, h: 0.38, tiers: 1 },
	{ w: 0.66, d: 0.58, h: 0.44, tiers: 2 },
	{ w: 0.74, d: 0.64, h: 0.5, tiers: 2 },
	{ w: 0.82, d: 0.7, h: 0.46, tiers: 3 },
];

/** 各道主题配置 */
const DISTRICTS = [
	{
		key: "guannei", roof: GOLD, ridge: [0.8, 0.66, 0.25], wall: WHITE, style: "hip",
		deco: decoGuannei,
	},
	{
		key: "jingji", roof: TILE, ridge: VERMILION, wall: [0.83, 0.76, 0.64], style: "hip",
		deco: decoJingji,
	},
	{
		key: "henan", roof: [0.62, 0.55, 0.36], ridge: [0.5, 0.44, 0.3], wall: [0.85, 0.78, 0.62], style: "shed",
		deco: decoHenan,
	},
	{
		key: "hedong", roof: TILE, ridge: [0.4, 0.4, 0.44], wall: [0.86, 0.84, 0.8], style: "gable",
		deco: decoHedong,
	},
	{
		key: "hebei", roof: [0.6, 0.42, 0.3], ridge: [0.5, 0.35, 0.25], wall: [0.9, 0.85, 0.75], style: "round",
		deco: decoHebei,
	},
	{
		key: "huainan", roof: RICE, ridge: [0.66, 0.56, 0.3], wall: [0.82, 0.7, 0.52], style: "round",
		deco: decoHuainan,
	},
	{
		key: "jiangnan", roof: [0.35, 0.45, 0.42], ridge: [0.28, 0.36, 0.34], wall: WHITE, style: "hip",
		deco: decoJiangnan,
	},
	{
		key: "jiannan", roof: [0.38, 0.46, 0.44], ridge: [0.3, 0.38, 0.36], wall: WHITE, style: "hip",
		deco: decoJiannan,
	},
];

/** 生成一道某一等级的盒组 */
function houseParts(dist, lv) {
	const spec = LEVELS[lv];
	const p = [];
	let top = houseBody(p, { w: spec.w, d: spec.d, h: spec.h, wallColor: dist.wall });

	if (spec.tiers >= 2) {
		// 二层腰檐
		p.push(box(0, top, 0, spec.w + 0.14, 0.05, spec.d + 0.14, TILE));
		top = upperFloor(p, { w: spec.w - 0.08, d: spec.d - 0.08, h: spec.h * 0.55, wallColor: dist.wall, base: top + 0.05 });
	}
	if (spec.tiers >= 3) {
		p.push(box(0, top, 0, spec.w - 0.02, 0.05, spec.d - 0.02, TILE));
		top = upperFloor(p, { w: spec.w - 0.16, d: spec.d - 0.16, h: spec.h * 0.45, wallColor: dist.wall, base: top + 0.05 });
	}

	if (dist.style === "hip") roofHip(p, 0, top, 0, spec.w, spec.d, dist.roof, dist.ridge);
	else if (dist.style === "gable") roofGable(p, 0, top, 0, spec.w, spec.d, dist.roof, dist.ridge);
	else if (dist.style === "round") roofRound(p, 0, top, 0, spec.w, spec.d, dist.roof, dist.ridge);
	else roofShed(p, 0, top, 0, spec.w, spec.d, dist.roof);

	dist.deco(p, lv, top + 0.24);
	return p;
}

/** 街头小景：每道一个 compact 地标（行动格用） */
const STREET_PROPS = {
	guannei: (p) => {
		huabiao(p, 0, 0, 0, 1);
		p.push(box(0, 0, 0, 0.4, 0.04, 0.4, STONE));
	},
	jingji: (p) => {
		p.push(box(0, 0, 0, 0.5, 0.04, 0.4, WOOD));
		p.push(box(0, 0.04, 0, 0.5, 0.06, 0.05, WOOD)); // 案
		p.push(box(0, 0.1, -0.06, 0.44, 0.05, 0.2, [0.72, 0.2, 0.2])); // 布招
		p.push(box(-0.16, 0.1, 0.1, 0.1, 0.08, 0.1, [0.6, 0.75, 0.55]));
		p.push(box(0.14, 0.1, 0.1, 0.1, 0.08, 0.1, [0.85, 0.7, 0.3]));
	},
	henan: (p) => {
		for (let i = 0; i < 4; i++) p.push(box(0, 0.04 + i * 0.09, 0, 0.3 - i * 0.04, 0.08, 0.3 - i * 0.04, i % 2 ? WOOD : [0.62, 0.48, 0.32]));
	},
	hedong: (p) => {
		p.push(box(-0.08, 0, 0, 0.05, 0.42, 0.05, WOOD));
		p.push(box(0.08, 0, 0, 0.05, 0.42, 0.05, WOOD));
		p.push(box(0, 0.1, 0, 0.14, 0.04, 0.04, WOOD, { rotY: Math.PI / 4 }));
		p.push(box(0, 0.22, 0, 0.14, 0.04, 0.04, WOOD, { rotY: -Math.PI / 4 }));
		p.push(box(0, 0.42, 0, 0.18, 0.04, 0.05, WOOD));
	},
	hebei: (p) => {
		p.push(box(0, 0, 0, 0.3, 0.1, 0.3, [0.6, 0.42, 0.3]));
		p.push(box(0, 0.1, 0, 0.22, 0.09, 0.22, [0.68, 0.49, 0.34]));
		p.push(box(0, 0.19, 0, 0.12, 0.07, 0.12, [0.75, 0.55, 0.38]));
		p.push(box(0, 0.05, 0.15, 0.09, 0.1, 0.03, DARK));
	},
	huainan: (p) => {
		p.push(box(0, 0, 0, 0.3, 0.1, 0.3, STONE));
		p.push(box(0, 0.1, 0, 0.26, 0.1, 0.26, RICE));
		p.push(box(0, 0.2, 0, 0.18, 0.08, 0.18, [0.82, 0.72, 0.42]));
		p.push(box(0, 0.28, 0, 0.08, 0.06, 0.08, [0.88, 0.8, 0.55]));
	},
	jiangnan: (p) => {
		p.push(box(-0.1, 0, 0, 0.04, 0.5, 0.04, WOOD));
		p.push(box(0.04, 0.48, 0, 0.3, 0.03, 0.03, WOOD));
		p.push(box(0.02, 0.36, 0, 0.09, 0.12, 0.02, CLOTH));
		p.push(box(0.13, 0.36, 0, 0.09, 0.12, 0.02, [0.35, 0.55, 0.7]));
	},
	jiannan: (p) => {
		p.push(box(0, 0, 0, 0.34, 0.05, 0.34, STONE));
		p.push(box(-0.1, 0.05, 0, 0.06, 0.3, 0.06, WOOD));
		p.push(box(0.1, 0.05, 0, 0.06, 0.3, 0.06, WOOD));
		p.push(box(0, 0.35, 0, 0.44, 0.05, 0.44, [0.38, 0.46, 0.44]));
		p.push(box(0, 0.4, 0, 0.3, 0.04, 0.3, [0.42, 0.5, 0.4]));
		p.push(box(0.16, 0, 0.16, 0.12, 0.1, 0.12, [0.62, 0.48, 0.28]));
	},
};

/** 构建全部八道建筑，返回 protobuf modelFiles 条目 */
export function buildDistrictHouses() {
	const out = [];
	for (const dist of DISTRICTS) {
		for (let lv = 0; lv < 5; lv++) {
			const id = `house-${dist.key}-${lv}`;
			out.push({ id, name: `${id}.glb`, filetype: "glb", glb: buildGlb(houseParts(dist, lv)) });
		}
		const streetId = `act-${dist.key}`;
		const parts = [];
		STREET_PROPS[dist.key](parts);
		out.push({ id: streetId, name: `${streetId}.glb`, filetype: "glb", glb: buildGlb(parts) });
	}
	return out;
}
