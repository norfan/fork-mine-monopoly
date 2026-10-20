// 主题一：现代都市（神州大地 · 大富翁4 中国大陆主题重构）
// 8 组 × (5 级建筑 + 1 街头小景) + 机会/命运/税 + 4 角格 + 8 装饰（分文件追加）
import { box, shade, C, model, row, lanternString, tree, fence } from "./theme-common.mjs";

/** 8 个组团（键名与 classic-maps.mjs 的 GROUPS 对应） */
export const DISTRICTS = [
	{
		key: "cbd", name: "商务CBD",
		wall: [0.78, 0.8, 0.83], glass: C.glassBlue, roof: C.darkGray, accent: C.cyan,
		deco: (y) => [
			box([0, y + 0.16, 0], [0.02, 0.32, 0.02], C.darkGray),
			box([0, y + 0.34, 0], [0.08, 0.04, 0.08], C.red),
			box([0.16, y + 0.05, 0], [0.17, 0.03, 0.17], shade(C.darkGray, 0.8)),
			box([0.16, y + 0.065, 0], [0.07, 0.012, 0.012], C.white),
		],
	},
	{
		key: "mall", name: "商贸广场",
		wall: C.cream, glass: C.amber, roof: C.gray, accent: C.red,
		deco: (y) => [
			box([0, y + 0.18, 0.03], [0.34, 0.26, 0.03], C.red, { alpha: 0.92 }),
			box([0, y + 0.18, 0.045], [0.28, 0.2, 0.012], C.amber),
			...lanternString(-0.14, y + 0.1, 0.05, 3, C.gold),
			...lanternString(0.14, y + 0.1, 0.05, 3, C.gold),
		],
	},
	{
		key: "hotel", name: "星级酒店",
		wall: [0.93, 0.9, 0.82], glass: C.gold, roof: C.darkGray, accent: C.red,
		deco: (y) => [
			box([0, y + 0.14, 0], [0.05, 0.28, 0.05], C.darkGray),
			box([0, y + 0.3, 0], [0.12, 0.07, 0.12], C.red),
			box([-0.1, y + 0.1, 0.06], [0.07, 0.16, 0.01], C.gold),
			box([0.1, y + 0.1, 0.06], [0.07, 0.16, 0.01], C.gold),
		],
	},
	{
		key: "resident", name: "幸福住宅",
		wall: [0.9, 0.86, 0.78], glass: C.lightBlue, roof: C.darkRed, accent: C.orange,
		deco: (y) => [
			box([-0.12, y + 0.06, 0], [0.12, 0.05, 0.12], C.glassDark),
			box([0.12, y + 0.06, 0], [0.12, 0.05, 0.12], C.glassDark),
			box([0, y + 0.04, 0.16], [0.14, 0.05, 0.05], C.lightGray),
		],
	},
	{
		key: "culture", name: "文创街区",
		wall: C.lightGray, glass: C.orange, roof: C.darkGray, accent: C.purple,
		deco: (y) => [
			box([0, y + 0.12, 0.16], [0.2, 0.22, 0.02], C.purple),
			box([-0.09, y + 0.16, 0.165], [0.05, 0.07, 0.01], C.orange),
			box([0.02, y + 0.08, 0.165], [0.05, 0.07, 0.01], C.cyan),
			box([0.13, y + 0.2, 0.165], [0.05, 0.07, 0.01], C.gold),
		],
	},
	{
		key: "finance", name: "金融大道",
		wall: [0.62, 0.7, 0.8], glass: C.glassBlue, roof: C.darkGray, accent: C.gold,
		deco: (y) => [
			box([0, y + 0.08, 0], [0.13, 0.16, 0.13], C.glassBlue),
			box([0, y + 0.22, 0], [0.06, 0.14, 0.06], C.glassBlue),
			box([0, y + 0.3, 0], [0.02, 0.08, 0.02], C.gold),
			box([0.12, y + 0.06, 0.08], [0.05, 0.03, 0.05], C.gold),
		],
	},
	{
		key: "tech", name: "科技园区",
		wall: C.white, glass: C.cyan, roof: C.darkGray, accent: C.cyan,
		deco: (y) => [
			box([-0.08, y + 0.04, 0], [0.18, 0.025, 0.16], C.glassDark),
			box([0.14, y + 0.04, 0], [0.18, 0.025, 0.16], C.glassDark),
			box([0, y + 0.12, -0.08], [0.03, 0.24, 0.03], C.lightGray),
			box([0, y + 0.26, -0.05], [0.03, 0.12, 0.14], C.lightGray, { rotY: 0.5 }),
		],
	},
	{
		key: "leisure", name: "活力商圈",
		wall: C.pink, glass: C.amber, roof: C.darkGray, accent: C.purple,
		deco: (y) => [
			box([0, y + 0.14, 0.03], [0.26, 0.22, 0.03], C.purple, { alpha: 0.9 }),
			box([0, y + 0.14, 0.045], [0.2, 0.16, 0.012], C.amber),
			...lanternString(-0.11, y + 0.1, 0.06, 3, C.purple),
			...lanternString(0.11, y + 0.1, 0.06, 3, C.purple),
		],
	},
];

/** 层数规格随等级增长 */
const MTIERS = [
	{ w: 0.5, d: 0.46, h: 0.22 },
	{ w: 0.56, d: 0.5, h: 0.24 },
	{ w: 0.62, d: 0.54, h: 0.26 },
	{ w: 0.68, d: 0.58, h: 0.28 },
	{ w: 0.74, d: 0.62, h: 0.3 },
];

function modernHouse(d, lv) {
	const p = [];
	let y = 0;
	for (let t = 0; t <= lv; t++) {
		const tier = MTIERS[t];
		p.push(box([0, y + tier.h / 2, 0], [tier.w, tier.h, tier.d], d.wall, t === 0 ? { name: "color-wall" } : {}));
		p.push(box([0, y + tier.h * 0.64, tier.d / 2 + 0.006], [tier.w - 0.08, tier.h * 0.34, 0.018], d.glass));
		p.push(box([0, y + tier.h * 0.28, tier.d / 2 + 0.006], [tier.w - 0.08, tier.h * 0.2, 0.018], shade(d.glass, 0.8)));
		p.push(box([0, y + tier.h + 0.015, 0], [tier.w + 0.04, 0.03, tier.d + 0.04], d.roof));
		y += tier.h + 0.03;
	}
	p.push(box([0, 0.1, MTIERS[0].d / 2 + 0.012], [0.1, 0.2, 0.02], C.glassDark));
	p.push(box([0, 0.23, MTIERS[0].d / 2 + 0.06], [0.18, 0.028, 0.1], d.accent));
	p.push(...d.deco(y));
	return p;
}

export function buildDistrictHouses() {
	const out = [];
	for (const d of DISTRICTS) {
		for (let lv = 0; lv < 5; lv++) {
			out.push(model(`house-${d.key}-${lv}`, `${d.name}·${lv}级`, modernHouse(d, lv)));
		}
	}
	return out;
}

/** 8 个街头小景（行动格底座） */
const ACTS = {
	cbd: () => [
		box([0, 0.34, 0], [0.05, 0.68, 0.05], C.darkGray),
		box([0, 0.64, 0], [0.17, 0.3, 0.13], C.black),
		box([0, 0.73, 0.07], [0.045, 0.045, 0.02], C.red),
		box([0, 0.64, 0.07], [0.045, 0.045, 0.02], C.amber),
		box([0, 0.55, 0.07], [0.045, 0.045, 0.02], C.green),
		box([0.04, 0.02, 0.1], [0.3, 0.015, 0.36], C.white),
	],
	mall: () => [
		box([0, 0.22, 0], [0.05, 0.44, 0.05], C.darkGray),
		box([0, 0.52, 0], [0.3, 0.42, 0.12], C.darkGray),
		box([0, 0.52, 0.065], [0.24, 0.34, 0.02], C.amber, { alpha: 0.95 }),
		box([0, 0.76, 0], [0.34, 0.05, 0.15], C.red),
	],
	hotel: () => [
		box([0, 0.18, 0], [0.05, 0.36, 0.05], C.darkGray),
		box([0, 0.4, 0], [0.24, 0.06, 0.24], C.red),
		box([0, 0.19, 0], [0.14, 0.32, 0.14], C.cream),
		...row(8, (i) => box([-0.1 + (i % 4) * 0.065, 0.26 + Math.floor(i / 4) * 0.08, 0.075], [0.045, 0.045, 0.02], C.gold)),
	],
	resident: () => [
		box([0, 0.3, 0], [0.34, 0.6, 0.24], C.darkGray),
		...row(6, (i) => box([-0.12 + (i % 3) * 0.12, 0.45 + Math.floor(i / 3) * 0.24, 0.125], [0.09, 0.14, 0.01], C.lightBlue)),
		box([0, 0.63, 0], [0.38, 0.05, 0.28], C.orange),
	],
	culture: () => [
		box([0, 0.18, 0], [0.26, 0.36, 0.26], C.lightGray),
		box([0, 0.42, 0], [0.3, 0.06, 0.3], C.darkGray),
		box([0, 0.28, 0.14], [0.16, 0.18, 0.02], C.purple),
		box([0, 0.28, 0.15], [0.1, 0.1, 0.01], C.orange),
	],
	finance: () => [
		box([0, 0.1, 0], [0.34, 0.2, 0.22], C.gold),
		box([0, 0.24, 0], [0.2, 0.1, 0.14], C.darkGold),
		box([0.06, 0.15, 0.1], [0.03, 0.07, 0.03], C.darkGold),
		box([-0.06, 0.15, 0.1], [0.03, 0.07, 0.03], C.darkGold),
		box([0.08, 0.16, -0.08], [0.02, 0.05, 0.02], C.black),
	],
	tech: () => [
		box([0, 0.3, 0], [0.04, 0.6, 0.04], C.lightGray),
		box([0, 0.62, 0], [0.16, 0.06, 0.06], C.darkGray),
		box([0, 0.55, 0], [0.1, 0.03, 0.03], C.cyan),
		box([0, 0.48, 0], [0.12, 0.03, 0.03], C.cyan),
		box([0, 0.41, 0], [0.14, 0.03, 0.03], C.cyan),
	],
	leisure: () => [
		box([0, 0.08, 0], [0.3, 0.16, 0.4], C.pink),
		box([-0.1, 0.06, 0.14], [0.05, 0.12, 0.05], C.black),
		box([0.1, 0.06, 0.14], [0.05, 0.12, 0.05], C.black),
		box([0, 0.2, 0], [0.26, 0.08, 0.24], C.white),
		box([0, 0.44, 0], [0.04, 0.32, 0.04], C.darkGray),
		box([0, 0.62, 0], [0.3, 0.1, 0.3], C.purple),
	],
};

export function buildActs() {
	return DISTRICTS.map((d) => model(`act-${d.key}`, `街景_${d.name}`, ACTS[d.key]()));
}

/** 8 个装饰物（棋盘内环布景） */
export function buildDecos() {
	const wheel = [];
	for (let i = 0; i < 8; i++) {
		const a = (i / 8) * Math.PI * 2;
		wheel.push(box([Math.cos(a) * 0.15, 0.78 + Math.sin(a) * 0.15, 0], [0.3, 0.025, 0.025], C.cyan, { rotY: a + Math.PI / 2 }));
	}
	return [
		model("d-0", "装饰_电视塔", [
			box([0, 0.1, 0], [0.3, 0.2, 0.3], C.lightGray),
			box([0, 0.36, 0], [0.12, 0.32, 0.12], C.white),
			box([0, 0.6, 0], [0.22, 0.18, 0.22], C.lightBlue),
			box([0, 0.84, 0], [0.06, 0.32, 0.06], C.darkGray),
			box([0, 1.03, 0], [0.05, 0.06, 0.05], C.red),
		]),
		model("d-1", "装饰_摩天轮", [
			box([-0.1, 0.14, 0], [0.05, 0.28, 0.05], C.darkGray),
			box([0.1, 0.14, 0], [0.05, 0.28, 0.05], C.darkGray),
			box([0, 0.78, 0], [0.07, 0.07, 0.07], C.gold),
			...wheel,
			...row(4, (i) => {
				const a = (i / 4) * Math.PI * 2 + 0.4;
				return box([Math.cos(a) * 0.3, 0.78 + Math.sin(a) * 0.3, 0], [0.07, 0.08, 0.07], C.orange);
			}),
		]),
		model("d-2", "装饰_广场喷泉", [
			box([0, 0.06, 0], [0.5, 0.12, 0.5], C.lightGray),
			box([0, 0.13, 0], [0.42, 0.04, 0.42], C.water, { alpha: 0.85 }),
			box([0, 0.26, 0], [0.08, 0.24, 0.08], C.lightGray),
			box([0, 0.4, 0], [0.2, 0.05, 0.2], C.lightGray),
			box([0, 0.45, 0], [0.14, 0.03, 0.14], C.water, { alpha: 0.9 }),
		]),
		model("d-3", "装饰_过街天桥", [
			box([0, 0.4, 0], [0.9, 0.06, 0.26], C.gray),
			...fence(-0.42, -0.06, 0.14, C.darkGray, 3),
			...fence(0.06, 0.42, 0.14, C.darkGray, 3),
			...row(3, (i) => box([-0.3 + i * 0.05, 0.34 - i * 0.07, 0], [0.24, 0.05, 0.24], C.gray)),
			...row(3, (i) => box([0.06 + i * 0.05, 0.4 - i * 0.07, 0], [0.24, 0.05, 0.24], C.gray)),
		]),
		model("d-4", "装饰_城市钟楼", [
			box([0, 0.2, 0], [0.3, 0.4, 0.3], C.cream),
			box([0, 0.44, 0], [0.36, 0.08, 0.36], C.darkGray),
			box([0, 0.6, 0], [0.22, 0.24, 0.22], C.cream),
			box([0, 0.6, 0.115], [0.14, 0.14, 0.02], C.white),
			box([0, 0.6, 0.125], [0.02, 0.1, 0.01], C.black),
			box([0, 0.6, 0.125], [0.1, 0.02, 0.01], C.black),
			box([0, 0.76, 0], [0.26, 0.06, 0.26], C.darkGray),
			box([0, 0.84, 0], [0.12, 0.08, 0.12], C.darkGray),
			box([0, 0.92, 0], [0.03, 0.1, 0.03], C.gold),
		]),
		model("d-5", "装饰_街心花坛", [
			box([0, 0.1, 0], [0.44, 0.2, 0.44], C.red),
			box([0, 0.22, 0], [0.38, 0.06, 0.38], C.earth),
			...row(4, (i) => box([-0.1 + (i % 2) * 0.2, 0.28, -0.1 + Math.floor(i / 2) * 0.2], [0.06, 0.06, 0.06], i % 2 ? C.pink : C.gold)),
			...tree(-0.14, 0.14, 0.5, C.darkGreen),
			...tree(0.16, -0.12, 0.44, C.green),
		]),
		model("d-6", "装饰_地铁入口", [
			box([0, 0.06, 0], [0.4, 0.12, 0.5], C.darkGray),
			box([0, 0.16, -0.1], [0.26, 0.14, 0.2], C.black),
			...row(3, (i) => box([0, 0.16 - i * 0.05, -0.05 + i * 0.08], [0.26, 0.04, 0.08], C.lightGray)),
			...fence(-0.22, -0.05, 0.24, C.lightGray, 3),
			...fence(0.05, 0.22, 0.24, C.lightGray, 3),
			box([0, 0.42, 0.24], [0.03, 0.6, 0.03], C.darkGray),
			box([0, 0.62, 0.24], [0.14, 0.14, 0.02], C.red),
			box([0, 0.62, 0.25], [0.05, 0.09, 0.01], C.white),
		]),
		model("d-7", "装饰_公园凉亭", [
			...row(6, (i) => {
				const a = (i / 6) * Math.PI * 2;
				return box([Math.cos(a) * 0.2, 0.18, Math.sin(a) * 0.2], [0.04, 0.36, 0.04], C.darkWood);
			}),
			box([0, 0.4, 0], [0.6, 0.05, 0.6], C.wood),
			box([0, 0.48, 0], [0.44, 0.06, 0.44], C.darkRed),
			box([0, 0.56, 0], [0.2, 0.06, 0.2], C.darkRed),
			box([0, 0.62, 0], [0.05, 0.06, 0.05], C.gold),
		]),
	];
}

/** 特殊格模型：机会 / 命运 / 赋税 */
export function buildSpecials() {
	return [
		model("m-chance", "幸运大转盘", [
			box([0, 0.08, 0], [0.34, 0.16, 0.34], C.lightGray),
			box([0, 0.2, 0], [0.1, 0.3, 0.1], C.gray),
			box([0, 0.36, 0], [0.42, 0.06, 0.42], C.gold),
			box([0, 0.4, 0], [0.34, 0.04, 0.34], C.white),
			...row(4, (i) => box([(i % 2) * 0.14 - 0.07, 0.43, Math.floor(i / 2) * 0.14 - 0.07], [0.13, 0.015, 0.13], i % 2 ? C.red : C.cyan)),
			box([0.24, 0.44, 0], [0.02, 0.14, 0.03], C.darkGray, { rotY: 0.6 }),
			box([0, 0.5, 0], [0.04, 0.04, 0.04], C.red),
		]),
		model("m-fate", "风云气象站", [
			box([0, 0.26, 0], [0.05, 0.52, 0.05], C.lightGray),
			...row(3, (i) => box([0, 0.1 + i * 0.06, 0], [0.16, 0.05, 0.14], C.lightGray)),
			box([0, 0.56, 0], [0.24, 0.03, 0.05], C.darkGray, { rotY: 0.7 }),
			box([0.1, 0.58, 0], [0.08, 0.08, 0.02], C.orange),
			box([-0.11, 0.56, 0], [0.1, 0.06, 0.06], C.red),
			box([0, 0.66, 0], [0.04, 0.12, 0.04], C.darkGray),
			box([0, 0.73, 0], [0.06, 0.03, 0.06], C.gold),
		]),
		model("m-tax", "税务大厅", [
			box([0, 0.24, 0], [0.44, 0.48, 0.36], C.white),
			box([0, 0.5, 0], [0.5, 0.06, 0.42], C.blue),
			box([0, 0.34, 0.19], [0.16, 0.18, 0.02], C.gold),
			box([0, 0.34, 0.2], [0.1, 0.12, 0.01], C.white),
			...row(2, (i) => box([-0.1 + i * 0.2, 0.2, 0.19], [0.12, 0.24, 0.02], C.glassBlue)),
			box([0, 0.6, 0], [0.05, 0.2, 0.05], C.darkGray),
			box([0, 0.72, 0], [0.14, 0.09, 0.1], C.red),
		]),
	];
}

/** 四角格模型 */
export function buildCorners() {
	return [
		model("m-start", "人民广场", [
			box([0, 0.1, 0], [0.6, 0.2, 0.6], C.lightGray),
			box([0, 0.26, 0], [0.3, 0.12, 0.3], C.concrete),
			box([0, 0.46, 0], [0.24, 0.28, 0.24], C.white),
			box([0, 0.46, 0.125], [0.16, 0.16, 0.02], C.gold),
			box([0, 0.46, 0.135], [0.02, 0.12, 0.01], C.black),
			box([0, 0.46, 0.135], [0.12, 0.02, 0.01], C.black),
			box([0, 0.65, 0], [0.28, 0.05, 0.28], C.darkRed),
			box([0, 0.8, 0], [0.04, 0.24, 0.04], C.lightGray),
			box([0, 0.94, 0], [0.16, 0.1, 0.1], C.red),
		]),
		model("m-jail", "警务站", [
			box([0, 0.24, 0], [0.44, 0.48, 0.36], C.white),
			box([0, 0.5, 0], [0.5, 0.06, 0.42], C.blue),
			box([-0.12, 0.24, 0.19], [0.12, 0.24, 0.02], C.glassDark),
			box([0.12, 0.24, 0.19], [0.12, 0.24, 0.02], C.glassDark),
			box([0, 0.62, 0], [0.1, 0.08, 0.1], C.darkGray),
			box([0, 0.68, 0], [0.07, 0.05, 0.07], C.red),
			box([0.04, 0.75, 0], [0.05, 0.05, 0.05], C.blue),
			box([-0.22, 0.14, 0.24], [0.04, 0.28, 0.04], C.darkGray),
			box([-0.22, 0.3, 0.24], [0.12, 0.1, 0.02], C.blue),
		]),
		model("m-free", "环湖公园", [
			...row(6, (i) => {
				const a = (i / 6) * Math.PI * 2;
				return box([Math.cos(a) * 0.18, 0.16, Math.sin(a) * 0.18], [0.04, 0.32, 0.04], C.darkWood);
			}),
			box([0, 0.36, 0], [0.52, 0.04, 0.52], C.wood),
			box([0, 0.42, 0], [0.38, 0.05, 0.38], C.darkGreen),
			box([0, 0.48, 0], [0.16, 0.05, 0.16], C.darkGreen),
			box([0, 0.53, 0], [0.04, 0.05, 0.04], C.gold),
			box([0, 0.04, 0], [0.6, 0.08, 0.6], C.water, { alpha: 0.7 }),
			...tree(-0.28, 0.2, 0.5, C.green),
			...tree(0.26, -0.22, 0.44, C.darkGreen),
			box([-0.2, 0.12, -0.2], [0.2, 0.04, 0.06], C.wood),
			box([-0.2, 0.24, -0.2], [0.2, 0.04, 0.06], C.wood),
		]),
		model("m-goto", "安全检查站", [
			box([-0.3, 0.18, 0], [0.08, 0.36, 0.08], C.white),
			box([-0.24, 0.18, 0], [0.08, 0.36, 0.08], C.white),
			box([0.3, 0.18, 0], [0.08, 0.36, 0.08], C.white),
			box([0.24, 0.18, 0], [0.08, 0.36, 0.08], C.white),
			box([-0.27, 0.38, 0], [0.1, 0.06, 0.1], C.red),
			box([0.27, 0.38, 0], [0.1, 0.06, 0.1], C.red),
			box([0, 0.3, 0], [0.6, 0.06, 0.05], C.white, { rotY: 0.12 }),
			...row(6, (i) => box([-0.24 + i * 0.1, 0.32, 0], [0.05, 0.06, 0.01], C.red)),
			box([-0.42, 0.5, 0], [0.04, 0.5, 0.04], C.darkGray),
			box([-0.42, 0.78, 0], [0.1, 0.08, 0.12], C.darkGray),
			box([-0.42, 0.78, 0.07], [0.04, 0.04, 0.02], C.glassBlue),
		]),
	];
}
