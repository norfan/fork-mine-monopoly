// 经典复刻地图共享盒组工具（神州大地/三国风云/江南水乡 三个主题共用）
// 单位约定：地格 1×1，模型底部贴 y=0，整体高度不超过 ~1.85
// color 为 0..1 浮点；name 含 "color" 的节点在游戏中会被染成房主颜色
import { buildGlb } from "./glb-builder.mjs";

export const box = (c, s, color, extra = {}) => ({ c, s, color, ...extra });
export const shade = (c, k) => c.map((v) => Math.max(0, Math.min(1, v * k)));

export const C = {
	white: [0.93, 0.92, 0.88],
	cream: [0.9, 0.85, 0.72],
	concrete: [0.72, 0.7, 0.66],
	lightGray: [0.8, 0.81, 0.84],
	gray: [0.55, 0.56, 0.6],
	darkGray: [0.34, 0.35, 0.38],
	wood: [0.52, 0.37, 0.22],
	darkWood: [0.36, 0.26, 0.16],
	red: [0.72, 0.2, 0.18],
	darkRed: [0.5, 0.13, 0.12],
	gold: [0.85, 0.67, 0.27],
	darkGold: [0.62, 0.47, 0.18],
	green: [0.3, 0.5, 0.3],
	darkGreen: [0.18, 0.36, 0.22],
	blue: [0.2, 0.35, 0.55],
	lightBlue: [0.55, 0.72, 0.85],
	glassBlue: [0.32, 0.5, 0.66],
	glassDark: [0.16, 0.24, 0.34],
	black: [0.11, 0.11, 0.12],
	tile: [0.28, 0.3, 0.33],
	water: [0.45, 0.65, 0.75],
	earth: [0.6, 0.46, 0.33],
	sand: [0.78, 0.68, 0.5],
	purple: [0.45, 0.3, 0.55],
	pink: [0.85, 0.6, 0.68],
	orange: [0.85, 0.5, 0.15],
	amber: [0.9, 0.72, 0.35],
	cyan: [0.3, 0.7, 0.72],
	ink: [0.15, 0.16, 0.2],
};

/** 组装一个模型条目 */
export function model(id, name, parts) {
	return { id, name, filetype: "glb", glb: buildGlb(parts) };
}

/** 一排小盒（窗户/摊位/旗串等） */
export function row(count, fn) {
	const out = [];
	for (let i = 0; i < count; i++) out.push(fn(i, i / Math.max(1, count - 1)));
	return out;
}

/** 竖直灯串（3 个小灯笼盒） */
export function lanternString(x, y, z, n, color) {
	return row(n, (i, t) => box([x, y - i * 0.07, z], [0.045, 0.05, 0.045], i % 2 ? shade(color, 0.85) : color));
}

/** 简易树（树干 + 冠） */
export function tree(x, z, h, leaf) {
	const trunk = box([x, h * 0.25, z], [0.05, h * 0.5, 0.05], C.darkWood);
	const crown = box([x, h * 0.72, z], [h * 0.52, h * 0.44, h * 0.52], leaf);
	return [trunk, crown];
}

/** 简易栏杆（一段） */
export function fence(x0, x1, z, color, posts = 4) {
	const out = [box([(x0 + x1) / 2, 0.06, z], [x1 - x0, 0.03, 0.03], color)];
	for (let i = 0; i < posts; i++) {
		const t = posts === 1 ? 0.5 : i / (posts - 1);
		out.push(box([x0 + (x1 - x0) * t, 0.11, z], [0.025, 0.19, 0.025], shade(color, 0.8)));
	}
	return out;
}
