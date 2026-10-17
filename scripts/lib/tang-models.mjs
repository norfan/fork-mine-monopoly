// 唐代风格模型库：全部由盒组拼装，经 glb-builder 输出 GLB
// 尺寸约定：所有模型外接不超过约 1×1 格（scale 1），底部贴地（y=0）

import { buildGlb } from "./glb-builder.mjs";

// 唐风配色（0..1）
const C = {
	vermilion: [0.62, 0.17, 0.16], // 朱红
	ochre: [0.54, 0.35, 0.23], // 赭石
	earth: [0.78, 0.66, 0.42], // 土黄
	tile: [0.29, 0.29, 0.32], // 瓦灰
	wall: [0.91, 0.88, 0.82], // 白墙
	gold: [0.79, 0.64, 0.15], // 金
	pine: [0.23, 0.42, 0.26], // 松绿
	willow: [0.42, 0.6, 0.35], // 柳绿
	lantern: [0.72, 0.13, 0.13], // 灯笼红
};

/** 便捷函数：角柱给中心坐标 */
function box(cx, cy, cz, sx, sy, sz, color, rotY) {
	return { c: [cx, cy, cz], s: [sx, sy, sz], color, rotY };
}

/** 以底部角形式书写：base 为盒体底部 y */
function boxFromBase(cx, base, cz, sx, sy, sz, color, rotY) {
	return box(cx, base + sy / 2, cz, sx, sy, sz, color, rotY);
}

// ---- 12 个模型 ----

function tangPlot() {
	return [
		boxFromBase(0, 0, 0, 0.9, 0.04, 0.9, C.ochre),
		boxFromBase(0.28, 0.04, 0.3, 0.05, 0.22, 0.05, C.ochre),
		boxFromBase(0.28, 0.26, 0.3, 0.26, 0.12, 0.02, C.earth),
	];
}

function tangShop() {
	return [
		boxFromBase(0, 0, 0, 0.7, 0.36, 0.7, C.wall),
		boxFromBase(0, 0.05, 0.42, 0.6, 0.1, 0.14, C.ochre),
		boxFromBase(0, 0.4, 0.18, 0.9, 0.05, 0.5, C.vermilion),
		boxFromBase(-0.35, 0.28, 0.4, 0.04, 0.12, 0.04, C.vermilion),
		boxFromBase(0.35, 0.28, 0.4, 0.04, 0.12, 0.04, C.vermilion),
		boxFromBase(0.3, 0.45, 0, 0.03, 0.28, 0.03, C.ochre),
		boxFromBase(0.36, 0.6, 0, 0.16, 0.1, 0.01, C.vermilion),
	];
}

function tangLouge() {
	return [
		boxFromBase(0, 0, 0, 0.72, 0.3, 0.72, C.wall),
		boxFromBase(0, 0.3, 0, 0.58, 0.3, 0.58, C.wall),
		boxFromBase(-0.25, 0, 0.25, 0.06, 0.3, 0.06, C.vermilion),
		boxFromBase(0.25, 0, 0.25, 0.06, 0.3, 0.06, C.vermilion),
		boxFromBase(-0.25, 0, -0.25, 0.06, 0.3, 0.06, C.vermilion),
		boxFromBase(0.25, 0, -0.25, 0.06, 0.3, 0.06, C.vermilion),
		boxFromBase(0, 0.62, 0, 0.95, 0.06, 0.95, C.tile),
		boxFromBase(0, 0.7, 0, 0.85, 0.04, 0.06, C.vermilion),
		boxFromBase(0, 0.92, 0, 0.78, 0.06, 0.78, C.tile),
		boxFromBase(0, 1.0, 0, 0.7, 0.04, 0.05, C.vermilion),
	];
}

function tangPalace() {
	return [
		boxFromBase(0, 0, 0, 1.0, 0.16, 1.0, C.earth),
		boxFromBase(-0.34, 0.16, -0.34, 0.07, 0.4, 0.07, C.vermilion),
		boxFromBase(0.34, 0.16, -0.34, 0.07, 0.4, 0.07, C.vermilion),
		boxFromBase(-0.34, 0.16, 0.34, 0.07, 0.4, 0.07, C.vermilion),
		boxFromBase(0.34, 0.16, 0.34, 0.07, 0.4, 0.07, C.vermilion),
		boxFromBase(0, 0.56, 0, 0.86, 0.06, 0.86, C.wall),
		boxFromBase(0, 0.62, 0.44, 0.5, 0.26, 0.06, C.vermilion),
		boxFromBase(0, 0.4, 0, 0.78, 0.4, 0.78, C.wall),
		boxFromBase(0, 0.82, 0, 1.05, 0.05, 1.05, C.tile),
		boxFromBase(0, 0.89, 0, 0.9, 0.04, 0.06, C.vermilion),
		boxFromBase(0, 0.95, 0, 0.6, 0.3, 0.6, C.wall),
		boxFromBase(0, 1.27, 0, 0.85, 0.05, 0.85, C.tile),
		boxFromBase(0, 1.34, 0, 0.5, 0.05, 0.05, C.gold),
	];
}

function tangPagoda() {
	const parts = [];
	let base = 0;
	for (let i = 0; i < 5; i++) {
		const w = 0.72 - 0.09 * i;
		const h = 0.3 - 0.02 * i;
		parts.push(boxFromBase(0, base, 0, w, h, w, i % 2 === 0 ? C.wall : C.earth));
		parts.push(boxFromBase(0, base + h, 0, w + 0.22, 0.05, w + 0.22, C.tile));
		parts.push(boxFromBase(0, base + h + 0.05, 0, w - 0.06, 0.03, 0.04, C.vermilion));
		base += h + 0.1;
	}
	parts.push(boxFromBase(0, base - 0.1, 0, 0.05, 0.3, 0.05, C.gold));
	parts.push(boxFromBase(0, base + 0.2 - 0.1, 0, 0.14, 0.04, 0.14, C.gold));
	return parts;
}

function tangPaifang() {
	return [
		boxFromBase(-0.28, 0, -0.1, 0.07, 0.56, 0.07, C.vermilion),
		boxFromBase(0.28, 0, -0.1, 0.07, 0.56, 0.07, C.vermilion),
		boxFromBase(-0.28, 0, 0.1, 0.07, 0.56, 0.07, C.vermilion),
		boxFromBase(0.28, 0, 0.1, 0.07, 0.56, 0.07, C.vermilion),
		boxFromBase(0, 0.5, 0, 0.75, 0.07, 0.14, C.vermilion),
		boxFromBase(0, 0.62, 0, 0.85, 0.06, 0.12, C.vermilion),
		boxFromBase(0, 0.56, 0.08, 0.3, 0.14, 0.02, C.gold),
		boxFromBase(0, 0.72, 0, 0.95, 0.07, 0.3, C.tile),
		boxFromBase(-0.38, 0.66, 0, 0.28, 0.05, 0.3, C.tile),
		boxFromBase(0.38, 0.66, 0, 0.28, 0.05, 0.3, C.tile),
	];
}

function tangLiu() {
	return [
		boxFromBase(0, 0, 0, 0.08, 0.4, 0.08, C.ochre),
		boxFromBase(0, 0.4, 0, 0.5, 0.34, 0.5, C.willow),
		boxFromBase(0.1, 0.6, 0.05, 0.3, 0.18, 0.3, C.willow),
	];
}

function tangSong() {
	return [
		boxFromBase(0, 0, 0, 0.09, 0.36, 0.09, C.ochre),
		boxFromBase(0, 0.36, 0, 0.42, 0.24, 0.42, C.pine),
		boxFromBase(0.12, 0.52, 0.05, 0.26, 0.16, 0.26, C.pine),
	];
}

function tangLantern() {
	return [
		boxFromBase(0, 0, 0, 0.05, 0.56, 0.05, C.tile),
		boxFromBase(0, 0.58, 0, 0.14, 0.03, 0.14, C.gold),
		boxFromBase(0, 0.36, 0, 0.2, 0.22, 0.2, C.lantern),
		boxFromBase(0, 0.34, 0, 0.12, 0.03, 0.12, C.gold),
		boxFromBase(0, 0.22, 0, 0.03, 0.12, 0.03, C.gold),
	];
}

function tangWall() {
	const parts = [
		boxFromBase(0, 0, 0, 0.95, 0.5, 0.14, C.wall),
		boxFromBase(0, 0.5, 0, 0.95, 0.05, 0.18, C.tile),
	];
	for (let i = -2; i <= 2; i++) {
		parts.push(boxFromBase(i * 0.2, 0.55, 0, 0.1, 0.07, 0.14, C.tile));
	}
	return parts;
}

function tangTing() {
	return [
		boxFromBase(-0.3, 0, -0.3, 0.07, 0.2, 0.07, C.ochre),
		boxFromBase(0.3, 0, -0.3, 0.07, 0.2, 0.07, C.ochre),
		boxFromBase(-0.3, 0, 0.3, 0.07, 0.2, 0.07, C.ochre),
		boxFromBase(0.3, 0, 0.3, 0.07, 0.2, 0.07, C.ochre),
		boxFromBase(0, 0.2, 0, 0.85, 0.06, 0.85, C.ochre),
		boxFromBase(-0.32, 0.26, -0.32, 0.06, 0.4, 0.06, C.vermilion),
		boxFromBase(0.32, 0.26, -0.32, 0.06, 0.4, 0.06, C.vermilion),
		boxFromBase(-0.32, 0.26, 0.32, 0.06, 0.4, 0.06, C.vermilion),
		boxFromBase(0.32, 0.26, 0.32, 0.06, 0.4, 0.06, C.vermilion),
		boxFromBase(0, 0.68, 0, 0.95, 0.06, 0.95, C.tile),
		boxFromBase(0, 0.76, 0, 0.8, 0.05, 0.06, C.vermilion),
	];
}

function tangBoat() {
	return [
		boxFromBase(0, 0, 0, 0.75, 0.12, 0.34, C.ochre),
		boxFromBase(0, 0.12, -0.02, 0.42, 0.2, 0.24, C.wall),
		boxFromBase(0, 0.34, -0.02, 0.55, 0.05, 0.32, C.vermilion),
		boxFromBase(0.22, 0.39, 0, 0.03, 0.24, 0.03, C.ochre),
		boxFromBase(-0.3, 0.02, 0, 0.1, 0.06, 0.3, C.gold),
	];
}

/** 模型注册表：id → 盒组（延迟求值） */
export const TANG_MODELS = {
	"tang-plot": tangPlot,
	"tang-shop": tangShop,
	"tang-louge": tangLouge,
	"tang-palace": tangPalace,
	"tang-pagoda": tangPagoda,
	"tang-paifang": tangPaifang,
	"tang-liu": tangLiu,
	"tang-song": tangSong,
	"tang-lantern": tangLantern,
	"tang-wall": tangWall,
	"tang-ting": tangTing,
	"tang-boat": tangBoat,
};

/** 构建全部模型，返回 [{ id, name, filetype, glb }] */
export function buildTangModels() {
	return Object.entries(TANG_MODELS).map(([id, factory]) => ({
		id,
		name: `${id}.glb`,
		filetype: "glb",
		glb: buildGlb(factory()),
	}));
}
