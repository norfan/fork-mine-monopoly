// 主题三：江南水乡（大富翁6 中国地图主题重构）
// 8 组团 × (5 级建筑 + 1 街头小景) + 机会/命运/税 + 4 角格 + 8 装饰
import { box, shade, C, model, row, lanternString, tree, fence } from "./theme-common.mjs";

export const DISTRICTS = [
	{
		key: "shuixiang", name: "水巷人家", color: "#4a7fa5",
		wall: C.white, roof: C.tile, trim: C.darkWood, accent: C.red,
		deco: (y) => [
			...row(3, (i) => box([0, 0.1 - i * 0.03, 0.3 + i * 0.04], [0.3, 0.05, 0.06], C.concrete)),
			box([-0.14, 0.04, 0.36], [0.05, 0.08, 0.05], C.wood),
			...lanternString(0.16, y + 0.06, 0.2, 2, C.red),
		],
	},
	{
		key: "qiaobang", name: "桥浜古镇", color: "#7a6a8a",
		wall: [0.95, 0.94, 0.9], roof: C.tile, trim: C.darkWood, accent: C.green,
		deco: (y) => [
			box([0, y + 0.16, -0.12], [0.36, 0.06, 0.14], C.concrete),
			box([0, y + 0.22, -0.12], [0.28, 0.04, 0.1], C.gray),
			box([-0.16, y + 0.12, -0.12], [0.05, 0.24, 0.05], C.concrete),
			box([0.16, y + 0.12, -0.12], [0.05, 0.24, 0.05], C.concrete),
		],
	},
	{
		key: "huhu", name: "湖滨渔歌", color: "#3a8a8a",
		wall: [0.94, 0.93, 0.88], roof: C.tile, trim: C.darkWood, accent: C.cyan,
		deco: (y) => [
			box([0, y + 0.08, 0.16], [0.14, 0.16, 0.14], C.wood),
			box([0, y + 0.18, 0.16], [0.16, 0.04, 0.16], C.darkWood),
			box([-0.14, y + 0.06, 0.06], [0.2, 0.03, 0.12], C.water, { alpha: 0.8 }),
			box([0.14, y + 0.06, 0.06], [0.05, 0.14, 0.05], C.darkWood),
		],
	},
	{
		key: "canfang", name: "蚕桑绸乡", color: "#b06a8a",
		wall: [0.95, 0.93, 0.9], roof: C.tile, trim: C.darkWood, accent: C.pink,
		deco: (y) => [
			box([-0.12, y + 0.08, 0], [0.16, 0.16, 0.16], C.amber),
			box([-0.12, y + 0.17, 0], [0.18, 0.04, 0.18], C.darkWood),
			box([0.12, y + 0.06, 0.06], [0.14, 0.12, 0.14], C.green),
			box([0.12, y + 0.13, 0.06], [0.16, 0.03, 0.16], C.darkWood),
			box([0, y + 0.1, -0.1], [0.04, 0.2, 0.04], C.wood),
			box([0, y + 0.22, -0.1], [0.12, 0.06, 0.08], C.white),
		],
	},
	{
		key: "mingcha", name: "龙井茶村", color: "#5d9e5d",
		wall: [0.95, 0.94, 0.9], roof: C.tile, trim: C.darkWood, accent: C.green,
		deco: (y) => [
			...row(3, (i) => box([-0.12 + i * 0.12, y + 0.05 + i * 0.005, 0.12 - i * 0.02], [0.16, 0.05 - i * 0.005, 0.16], C.darkGreen)),
			box([0.12, y + 0.08, 0], [0.12, 0.16, 0.12], C.wood),
			box([0.12, y + 0.17, 0], [0.14, 0.03, 0.14], C.darkWood),
			box([-0.12, y + 0.1, -0.06], [0.04, 0.2, 0.04], C.wood),
			box([-0.12, y + 0.22, -0.06], [0.1, 0.05, 0.06], C.amber),
		],
	},
	{
		key: "jiuxiang", name: "黄酒酒巷", color: "#a5763a",
		wall: [0.95, 0.93, 0.89], roof: C.tile, trim: C.darkWood, accent: C.orange,
		deco: (y) => [
			box([-0.1, y + 0.1, 0], [0.12, 0.2, 0.12], C.darkWood),
			box([-0.1, y + 0.22, 0], [0.13, 0.03, 0.13], C.wood),
			box([0.12, y + 0.08, 0.02], [0.1, 0.16, 0.1], C.darkWood),
			box([0.12, y + 0.18, 0.02], [0.11, 0.02, 0.11], C.wood),
			box([0, y + 0.12, -0.1], [0.05, 0.24, 0.05], C.wood),
			box([0, y + 0.25, -0.1], [0.12, 0.07, 0.06], C.cream),
		],
	},
	{
		key: "yuyuan", name: "园林深院", color: "#8a5a9a",
		wall: [0.95, 0.94, 0.9], roof: C.tile, trim: C.darkWood, accent: C.purple,
		deco: (y) => [
			box([-0.12, y + 0.12, 0], [0.14, 0.24, 0.03], C.white),
			box([-0.08, y + 0.16, 0.02], [0.04, 0.04, 0.01], C.purple),
			box([0.14, y + 0.1, 0], [0.12, 0.2, 0.12], C.darkWood),
			box([0.14, y + 0.22, 0], [0.14, 0.04, 0.14], C.green),
			...row(2, (i) => box([0 + i * 0.06, y + 0.05, 0.12], [0.05, 0.1, 0.05], C.green)),
		],
	},
	{
		key: "qinhuai", name: "秦淮灯火", color: "#c95a5a",
		wall: [0.95, 0.93, 0.9], roof: C.tile, trim: C.darkWood, accent: C.red,
		deco: (y) => [
			...lanternString(-0.14, y + 0.16, 0.08, 3, C.red),
			...lanternString(0.14, y + 0.16, 0.08, 3, C.gold),
			box([0, y + 0.1, 0.12], [0.16, 0.2, 0.02], C.red, { alpha: 0.9 }),
			box([0, y + 0.1, 0.13], [0.1, 0.12, 0.01], C.cream),
		],
	},
];

/** 白墙黛瓦：墙身 + 木构 + 瓦顶（厚檐口 + 脊） */
function tiledRoof(x, y, z, w, d, roofC, ridgeC) {
	return [
		box([x, y + 0.03, z], [w + 0.1, 0.05, d + 0.1], roofC),
		box([x, y + 0.065, z], [w + 0.06, 0.03, d + 0.06], shade(roofC, 0.85)),
		box([x, y + 0.09, z], [w * 0.4, 0.03, 0.05], ridgeC),
	];
}

function jiangnanHouse(d, lv) {
	const p = [];
	let y = 0;
	if (lv === 0) {
		// 单檐平房
		p.push(box([0, y + 0.13, 0], [0.5, 0.26, 0.46], d.wall, { name: "color-wall" }));
		p.push(box([0, y + 0.13, 0.24], [0.14, 0.16, 0.02], C.darkWood));
		y += 0.26;
		p.push(...tiledRoof(0, y, 0, 0.5, 0.46, d.roof, d.trim));
		y += 0.14;
	} else {
		// 主体两层
		const h1 = 0.22 + lv * 0.02;
		p.push(box([0, y + h1 / 2, 0], [0.52, h1, 0.48], d.wall, { name: "color-wall" }));
		p.push(...row(2, (i) => box([-0.12 + i * 0.24, y + h1 * 0.6, 0.245], [0.08, 0.1, 0.02], C.darkWood)));
		p.push(box([0, y + h1 / 2, 0.245], [0.1, h1 * 0.4, 0.02], C.darkWood));
		y += h1;
		p.push(...tiledRoof(0, y, 0, 0.52, 0.48, d.roof, d.trim));
		y += 0.14;
		if (lv >= 2) {
			// 二层水阁
			const h2 = 0.16 + lv * 0.02;
			p.push(box([0, y + h2 / 2, -0.02], [0.4, h2, 0.38], d.wall));
			p.push(box([0, y + h2 * 0.6, 0.18], [0.16, 0.08, 0.02], C.darkWood));
			p.push(...tiledRoof(0, y + h2, -0.02, 0.4, 0.38, d.roof, d.trim));
			y += h2 + 0.14;
		}
		if (lv >= 3) {
			// 侧厢 + 院墙
			p.push(box([-0.36, 0.14, 0.06], [0.2, 0.28, 0.34], d.wall));
			p.push(...tiledRoof(-0.36, 0.28, 0.06, 0.2, 0.34, d.roof, d.trim));
			p.push(box([0.34, 0.11, 0.1], [0.14, 0.22, 0.24], d.trim));
			p.push(box([0.34, 0.23, 0.1], [0.18, 0.03, 0.28], d.roof));
		}
		if (lv >= 4) {
			// 园林亭 + 假山
			p.push(...row(4, (i) => {
				const a = (i / 4) * Math.PI * 2;
				return box([0.3 + Math.cos(a) * 0.09, 0.16, -0.26 + Math.sin(a) * 0.09], [0.03, 0.32, 0.03], C.darkWood);
			}));
			p.push(...tiledRoof(0.3, 0.32, -0.26, 0.2, 0.2, d.roof, C.gold));
			p.push(box([0.3, 0.4, -0.26], [0.04, 0.05, 0.04], C.gold));
			p.push(box([-0.3, 0.11, -0.24], [0.16, 0.22, 0.14], C.gray));
			p.push(box([-0.3, 0.24, -0.24], [0.1, 0.06, 0.1], C.darkGreen));
		}
	}
	if (lv >= 1) {
		// 檐廊灯笼
		p.push(...lanternString(-0.16, y - 0.06, 0.2, 2, d.accent));
	}
	// 临水木桩
	p.push(...row(2, (i) => box([-0.14 + i * 0.28, 0.05, 0.3], [0.04, 0.1, 0.04], C.darkWood)));
	p.push(...d.deco(y));
	return p;
}

export function buildDistrictHouses() {
	const out = [];
	for (const d of DISTRICTS) {
		for (let lv = 0; lv < 5; lv++) {
			out.push(model(`house-${d.key}-${lv}`, `${d.name}·${lv}级`, jiangnanHouse(d, lv)));
		}
	}
	return out;
}

/** 8 个街头小景 */
const ACTS = {
	shuixiang: () => [
		box([0, 0.06, 0], [0.34, 0.1, 0.16], C.darkWood),
		box([0, 0.12, -0.02], [0.2, 0.03, 0.1], C.wood),
		box([0, 0.16, -0.02], [0.1, 0.05, 0.06], C.darkWood),
		box([-0.1, 0.04, 0.14], [0.05, 0.08, 0.05], C.darkWood),
		box([0.1, 0.04, 0.14], [0.05, 0.08, 0.05], C.darkWood),
		box([0, 0.05, -0.12], [0.2, 0.03, 0.06], C.water, { alpha: 0.75 }),
	],
	qiaobang: () => [
		box([0, 0.1, 0], [0.4, 0.08, 0.14], C.concrete),
		box([0, 0.15, 0], [0.32, 0.04, 0.1], C.gray),
		box([-0.14, 0.06, 0], [0.05, 0.12, 0.12], C.concrete),
		box([0.14, 0.06, 0], [0.05, 0.12, 0.12], C.concrete),
		box([0, 0.2, 0], [0.06, 0.06, 0.06], C.darkGreen),
	],
	huhu: () => [
		box([0, 0.12, 0], [0.2, 0.24, 0.18], C.wood),
		box([0, 0.26, 0], [0.24, 0.04, 0.22], C.darkWood),
		box([0, 0.12, 0.1], [0.12, 0.16, 0.02], C.water, { alpha: 0.8 }),
		box([-0.14, 0.05, 0], [0.08, 0.1, 0.08], C.cyan),
		box([0.14, 0.05, 0], [0.08, 0.1, 0.08], C.cyan),
		box([0, 0.34, 0], [0.03, 0.14, 0.03], C.wood),
	],
	canfang: () => [
		box([0, 0.16, 0], [0.26, 0.32, 0.22], C.wood),
		box([0, 0.34, 0], [0.32, 0.04, 0.28], C.darkWood),
		box([0, 0.22, 0.12], [0.14, 0.1, 0.02], C.cream),
		box([-0.12, 0.08, 0.08], [0.08, 0.16, 0.08], C.amber),
		box([0.12, 0.08, 0.08], [0.08, 0.16, 0.08], C.amber),
	],
	mingcha: () => [
		box([0, 0.1, 0], [0.2, 0.2, 0.16], C.darkWood),
		box([0, 0.22, 0], [0.24, 0.04, 0.2], C.wood),
		box([0, 0.13, 0.09], [0.12, 0.08, 0.01], C.green),
		box([-0.14, 0.05, 0], [0.1, 0.1, 0.1], C.wood),
		box([0.14, 0.05, 0], [0.1, 0.1, 0.1], C.wood),
		box([0, 0.06, 0.14], [0.3, 0.03, 0.1], C.darkGreen),
	],
	jiuxiang: () => [
		box([-0.1, 0.12, 0], [0.14, 0.24, 0.14], C.darkWood),
		box([-0.1, 0.26, 0], [0.15, 0.03, 0.15], C.wood),
		box([0.1, 0.09, 0], [0.12, 0.18, 0.12], C.darkWood),
		box([0.1, 0.2, 0], [0.13, 0.02, 0.13], C.wood),
		box([0.1, 0.32, 0], [0.1, 0.12, 0.1], C.darkWood),
		box([0.1, 0.4, 0], [0.11, 0.02, 0.11], C.wood),
	],
	yuyuan: () => [
		box([0, 0.2, 0], [0.28, 0.4, 0.06], C.white),
		box([-0.12, 0.2, 0], [0.04, 0.4, 0.04], C.darkWood),
		box([0.12, 0.2, 0], [0.04, 0.4, 0.04], C.darkWood),
		box([0, 0.44, 0], [0.36, 0.05, 0.1], C.darkWood),
		box([0, 0.5, 0], [0.2, 0.05, 0.06], C.green),
		box([-0.1, 0.1, 0.1], [0.08, 0.2, 0.08], C.purple),
		box([0.12, 0.1, 0.1], [0.08, 0.2, 0.08], C.green),
	],
	qinhuai: () => [
		box([0, 0.26, 0], [0.05, 0.52, 0.05], C.darkWood),
		box([0, 0.55, 0], [0.24, 0.04, 0.05], C.darkWood),
		...lanternString(-0.08, 0.5, 0, 4, C.red),
		...lanternString(0.08, 0.5, 0, 4, C.gold),
		box([0, 0.04, 0], [0.16, 0.08, 0.16], C.darkWood),
	],
};

export function buildActs() {
	return DISTRICTS.map((d) => model(`act-${d.key}`, `街景_${d.name}`, ACTS[d.key]()));
}

/** 8 个装饰物 */
export function buildDecos() {
	return [
		model("d-0", "装饰_大石桥", [
			box([0, 0.16, 0], [0.7, 0.32, 0.24], C.gray),
			box([0, 0.34, 0], [0.5, 0.06, 0.2], C.lightGray),
			box([0, 0.42, 0], [0.2, 0.05, 0.16], C.concrete),
			box([0, 0.08, 0], [0.4, 0.16, 0.1], C.darkGray),
			...fence(-0.3, -0.05, 0.13, C.darkGray, 3),
			...fence(0.05, 0.3, 0.13, C.darkGray, 3),
			...row(4, (i) => box([-0.3 + i * 0.2, 0.02, 0], [0.06, 0.04, 0.3], C.water, { alpha: 0.7 })),
		]),
		model("d-1", "装饰_画舫", [
			box([0, 0.08, 0], [0.44, 0.14, 0.2], C.darkWood),
			box([0, 0.16, -0.02], [0.3, 0.06, 0.14], C.wood),
			box([0, 0.24, -0.02], [0.2, 0.1, 0.1], C.cream),
			box([0, 0.32, -0.02], [0.26, 0.05, 0.14], C.darkRed),
			box([0, 0.38, -0.02], [0.12, 0.06, 0.08], C.darkRed),
			box([0, 0.46, -0.02], [0.03, 0.1, 0.03], C.wood),
			box([0, 0.52, -0.02], [0.08, 0.05, 0.02], C.red),
			box([0.22, 0.06, 0.02], [0.1, 0.1, 0.1], C.wood),
		]),
		model("d-2", "装饰_水车", [
			box([0, 0.24, 0], [0.04, 0.48, 0.04], C.darkWood),
			box([0, 0.5, 0], [0.3, 0.05, 0.05], C.wood, { rotY: 0.4 }),
			box([0, 0.12, 0.14], [0.06, 0.24, 0.06], C.darkWood),
			box([0, 0.12, -0.14], [0.06, 0.24, 0.06], C.darkWood),
			box([0, 0.06, 0], [0.16, 0.12, 0.4], C.water, { alpha: 0.7 }),
			...row(6, (i) => {
				const a = (i / 6) * Math.PI * 2;
				return box([Math.cos(a) * 0.16, 0.34 + Math.sin(a) * 0.16, 0], [0.03, 0.12, 0.03], C.wood);
			}),
		]),
		model("d-3", "装饰_垂柳", [
			box([0, 0.3, 0], [0.09, 0.6, 0.09], C.darkWood),
			box([0, 0.72, 0], [0.5, 0.24, 0.5], C.darkGreen),
			...row(5, (i) => {
				const a = (i / 5) * Math.PI * 2;
				return box([Math.cos(a) * 0.18, 0.52 - (i % 3) * 0.06, Math.sin(a) * 0.18], [0.03, 0.2, 0.03], C.green);
			}),
			box([0, 0.04, 0], [0.3, 0.08, 0.3], C.water, { alpha: 0.65 }),
		]),
		model("d-4", "装饰_古戏台", [
			box([0, 0.22, 0], [0.5, 0.44, 0.36], C.white),
			box([0, 0.46, 0], [0.58, 0.06, 0.42], C.darkRed),
			box([0, 0.32, 0.19], [0.2, 0.2, 0.02], C.darkWood),
			box([0, 0.54, 0], [0.34, 0.05, 0.26], C.tile),
			box([0, 0.6, 0], [0.2, 0.05, 0.16], C.darkGray),
			box([0, 0.66, 0], [0.05, 0.06, 0.05], C.gold),
			box([-0.3, 0.16, 0.14], [0.06, 0.32, 0.06], C.wood),
			box([0.3, 0.16, 0.14], [0.06, 0.32, 0.06], C.wood),
		]),
		model("d-5", "装饰_古井", [
			box([0, 0.07, 0], [0.34, 0.14, 0.34], C.gray),
			box([0, 0.13, 0], [0.24, 0.03, 0.24], C.black),
			box([-0.14, 0.12, 0], [0.05, 0.24, 0.05], C.darkWood),
			box([0.14, 0.12, 0], [0.05, 0.24, 0.05], C.darkWood),
			box([0, 0.25, 0], [0.28, 0.05, 0.06], C.wood),
			box([0, 0.31, 0], [0.2, 0.04, 0.04], C.darkWood),
			box([-0.1, 0.04, 0], [0.1, 0.08, 0.1], C.water, { alpha: 0.8 }),
		]),
		model("d-6", "装饰_石牌坊", [
			box([-0.2, 0.26, 0], [0.12, 0.52, 0.16], C.cream),
			box([0.2, 0.26, 0], [0.12, 0.52, 0.16], C.cream),
			box([0, 0.56, 0], [0.56, 0.08, 0.2], C.darkGray),
			box([0, 0.64, 0], [0.4, 0.05, 0.14], C.tile),
			box([0, 0.7, 0], [0.2, 0.04, 0.1], C.darkGray),
			box([-0.2, 0.38, 0.09], [0.06, 0.14, 0.02], C.gold),
			box([0.2, 0.38, 0.09], [0.06, 0.14, 0.02], C.gold),
			box([0, 0.78, 0], [0.06, 0.06, 0.06], C.gold),
		]),
		model("d-7", "装饰_湖心亭", [
			box([0, 0.06, 0], [0.44, 0.12, 0.44], C.water, { alpha: 0.7 }),
			box([0, 0.14, 0], [0.4, 0.05, 0.4], C.wood),
			...row(6, (i) => {
				const a = (i / 6) * Math.PI * 2;
				return box([Math.cos(a) * 0.15, 0.32, Math.sin(a) * 0.15], [0.04, 0.32, 0.04], C.darkWood);
			}),
			box([0, 0.52, 0], [0.44, 0.05, 0.44], C.wood),
			box([0, 0.6, 0], [0.32, 0.05, 0.32], C.darkRed),
			box([0, 0.67, 0], [0.14, 0.05, 0.14], C.darkRed),
			box([0, 0.73, 0], [0.04, 0.05, 0.04], C.gold),
			...fence(-0.22, -0.02, 0.22, C.darkWood, 3),
			...fence(0.02, 0.22, 0.22, C.darkWood, 3),
		]),
	];
}

export function buildSpecials() {
	return [
		model("m-chance", "签筒", [
			box([0, 0.14, 0], [0.22, 0.28, 0.22], C.wood),
			box([0, 0.3, 0], [0.24, 0.04, 0.24], C.darkWood),
			box([0, 0.06, 0], [0.26, 0.06, 0.26], C.darkGray),
			...row(5, (i) => box([-0.08 + i * 0.04, 0.42 + (i % 2) * 0.06, -0.02 + (i % 3) * 0.02], [0.025, 0.24, 0.025], i % 2 ? C.wood : C.red)),
			box([-0.08, 0.58, 0], [0.05, 0.05, 0.05], C.gold),
			box([0.08, 0.62, 0], [0.05, 0.05, 0.05], C.gold),
		]),
		model("m-fate", "风雨亭", [
			...row(4, (i) => box([-0.14 + (i % 2) * 0.28, 0.16, -0.14 + Math.floor(i / 2) * 0.28], [0.05, 0.32, 0.05], C.darkWood)),
			box([0, 0.36, 0], [0.44, 0.05, 0.44], C.wood),
			box([0, 0.42, 0], [0.36, 0.05, 0.36], C.tile),
			box([0, 0.48, 0], [0.2, 0.04, 0.16], C.tile),
			box([0, 0.53, 0], [0.04, 0.05, 0.04], C.gold),
			...row(3, (i) => box([-0.1 + i * 0.1, 0.2, 0.16], [0.03, 0.12, 0.03], C.cyan, { alpha: 0.85 })),
			box([0.16, 0.3, 0.16], [0.1, 0.1, 0.02], C.cyan, { alpha: 0.7 }),
		]),
		model("m-tax", "税课司", [
			box([0, 0.22, 0], [0.4, 0.44, 0.32], C.cream),
			box([0, 0.46, 0], [0.46, 0.05, 0.38], C.darkGray),
			box([0, 0.3, 0.17], [0.14, 0.14, 0.02], C.wood),
			box([0, 0.3, 0.18], [0.09, 0.08, 0.01], C.gold),
			box([-0.12, 0.1, 0.16], [0.1, 0.2, 0.02], C.darkWood),
			box([0.12, 0.1, 0.16], [0.1, 0.2, 0.02], C.darkWood),
			box([0, 0.08, 0.24], [0.3, 0.04, 0.14], C.wood),
			box([-0.08, 0.13, 0.28], [0.06, 0.09, 0.06], C.darkWood),
			box([0.08, 0.13, 0.28], [0.06, 0.09, 0.06], C.sand),
			box([0, 0.56, 0], [0.04, 0.14, 0.04], C.darkWood),
			box([0, 0.64, 0], [0.12, 0.07, 0.02], C.red),
		]),
	];
}

export function buildCorners() {
	return [
		model("m-start", "渡口", [
			box([0, 0.06, 0], [0.5, 0.12, 0.44], C.wood),
			...row(4, (i) => box([0, 0.15, -0.14 + i * 0.09], [0.44, 0.03, 0.03], C.darkWood)),
			box([-0.18, 0.3, 0.1], [0.08, 0.3, 0.08], C.wood),
			box([0.18, 0.3, 0.1], [0.08, 0.3, 0.08], C.wood),
			box([0, 0.5, 0.1], [0.44, 0.05, 0.12], C.darkRed),
			box([0, 0.56, 0.1], [0.2, 0.07, 0.08], C.tile),
			box([0, 0.63, 0.1], [0.04, 0.05, 0.04], C.gold),
			box([0, 0.1, -0.24], [0.3, 0.1, 0.12], C.water, { alpha: 0.7 }),
			box([0, 0.18, -0.28], [0.2, 0.06, 0.06], C.darkWood),
		]),
		model("m-jail", "县衙", [
			box([0, 0.26, 0], [0.46, 0.52, 0.34], C.darkRed),
			box([0, 0.54, 0], [0.54, 0.06, 0.4], C.darkGray),
			box([0, 0.28, 0.18], [0.14, 0.24, 0.02], C.black),
			box([-0.14, 0.2, 0.18], [0.06, 0.4, 0.06], C.darkWood),
			box([0.14, 0.2, 0.18], [0.06, 0.4, 0.06], C.darkWood),
			box([0, 0.6, 0], [0.26, 0.05, 0.22], C.tile),
			box([0, 0.65, 0], [0.14, 0.05, 0.14], C.darkGray),
			box([-0.26, 0.1, 0.2], [0.12, 0.2, 0.12], C.wood),
			box([-0.26, 0.22, 0.2], [0.16, 0.04, 0.16], C.cream),
		]),
		model("m-free", "湖心茶楼", [
			box([0, 0.08, 0], [0.4, 0.14, 0.4], C.water, { alpha: 0.7 }),
			box([0, 0.16, 0], [0.36, 0.05, 0.36], C.wood),
			...row(6, (i) => {
				const a = (i / 6) * Math.PI * 2;
				return box([Math.cos(a) * 0.14, 0.34, Math.sin(a) * 0.14], [0.04, 0.32, 0.04], C.darkWood);
			}),
			box([0, 0.54, 0], [0.4, 0.05, 0.4], C.wood),
			box([0, 0.61, 0], [0.3, 0.05, 0.3], C.darkRed),
			box([0, 0.67, 0], [0.14, 0.05, 0.14], C.darkRed),
			box([0, 0.72, 0], [0.04, 0.05, 0.04], C.gold),
			box([-0.24, 0.12, 0.16], [0.1, 0.24, 0.1], C.darkWood),
			box([-0.24, 0.26, 0.16], [0.12, 0.03, 0.12], C.wood),
			...fence(0.1, 0.26, 0.18, C.darkWood, 3),
		]),
		model("m-goto", "河稽查卡", [
			box([-0.24, 0.16, 0], [0.08, 0.32, 0.08], C.darkWood),
			box([0.24, 0.16, 0], [0.08, 0.32, 0.08], C.darkWood),
			box([-0.24, 0.34, 0], [0.14, 0.05, 0.14], C.tile),
			box([0.24, 0.34, 0], [0.14, 0.05, 0.14], C.tile),
			box([0, 0.26, 0], [0.54, 0.05, 0.05], C.wood),
			box([0, 0.32, 0], [0.18, 0.12, 0.02], C.cream),
			box([0, 0.32, 0.012], [0.1, 0.06, 0.01], C.black),
			box([0, 0.06, 0], [0.44, 0.12, 0.16], C.water, { alpha: 0.7 }),
			box([0.16, 0.04, 0.06], [0.12, 0.08, 0.08], C.darkWood),
		]),
	];
}
