// 2D 贴片模型生成：把 2D 插画 PNG 变成 GLB 平面（双面）+ 房主染色小房
// - buildSpriteHouses：每地产 5 级（sprite + N 个染色小房，N=等级）
// - buildSpriteSigns：四角格 + 机会/命运/赋税 的牌坊式贴片
// 输出条目 { id, name, filetype:"glb", glb } 与原 theme-houses 同结构，可直接替换
import { buildSpriteGlb } from "./sprite-glb.mjs";
import { GROUND, dim, lit, mix } from "./art-2d.mjs";
import { Canvas } from "./png-painter.mjs";

const SZ = 256;
// 立绘尺寸：格心为原点，底部贴 y=0
const SPRITE_W = 0.92;
const SPRITE_H = 1.24;
const HOUSE_CUBE = 0.09;

const spriteModel = (id, name, parts) => ({ id, name, filetype: "glb", glb: buildSpriteGlb(parts) });

/** 一个小房（染色 Cube），name 含 color → 引擎染房主色 */
function houseCube(x) {
	return { kind: "cube", c: [x, 0.055, 0.16], s: [HOUSE_CUBE, HOUSE_CUBE, HOUSE_CUBE], color: [1, 1, 1], name: "color-house" };
}

/** 地产 5 级：sprite(插画) + (lv+1) 个染色小房 */
export function buildSpriteHouses(art, keys) {
	const out = [];
	for (const key of keys) {
		const png = art[`${key}-built`];
		if (!png) throw new Error(`buildSpriteHouses: 缺少插画 ${key}-built`);
		for (let lv = 0; lv < 5; lv++) {
			const parts = [
				{ kind: "sprite", tex: { png, w: SZ, h: SZ }, c: [0, SPRITE_H / 2, 0], s: [SPRITE_W, SPRITE_H] },
			];
			for (let n = 0; n <= lv; n++) {
				const total = 5; // 每行最多 5 个，居中排布
				const span = (total - 1) * 0.14;
				const x = -span / 2 + n * 0.14;
				parts.push(houseCube(x));
			}
			out.push(spriteModel(`house-${key}-${lv}`, `2D地产_${key}_${lv}级`, parts));
		}
	}
	return out;
}

/** 牌坊式贴片插画（四角格/机会/命运/赋税共用模板） */
function drawSign(c, d) {
	// 天空与地面
	c.vGradient(0, SZ, 0, GROUND, [214, 228, 238, 255], [186, 208, 222, 255]);
	c.fillRect(0, GROUND, SZ, SZ, [150, 158, 150, 255]);
	const cx = 128;
	// 台基
	c.fillRect(cx - 70, GROUND - 10, cx + 70, GROUND + 6, [168, 168, 164, 255]);
	c.strokeRect(cx - 70, GROUND - 10, cx + 70, GROUND + 6, 2, dim([168, 168, 164, 255], 0.6));
	// 双柱
	for (const sx of [-1, 1]) {
		const x = cx + sx * 52;
		c.fillRect(x - 8, 76, x + 8, GROUND - 10, d.stone);
		c.strokeRect(x - 8, 76, x + 8, GROUND - 10, 2, dim(d.stone, 0.6));
		c.fillRect(x - 12, 68, x + 12, 78, dim(d.stone, 0.8));
		c.fillRect(x - 11, GROUND - 12, x + 11, GROUND - 4, dim(d.stone, 0.7));
	}
	// 两道横梁
	c.fillRect(cx - 74, 96, cx + 74, 106, d.stone);
	c.strokeRect(cx - 74, 96, cx + 74, 106, 2, dim(d.stone, 0.6));
	c.fillRect(cx - 68, 72, cx + 68, 82, d.stone);
	c.strokeRect(cx - 68, 72, cx + 68, 82, 2, dim(d.stone, 0.6));
	// 屋顶（梯形 + 脊）
	c.fillTrapezoid(cx - 84, cx + 84, cx - 60, cx + 60, 52, 68, d.roof);
	c.fillRect(cx - 64, 44, cx + 64, 52, d.roof);
	c.fillRect(cx - 66, 40, cx + 66, 46, lit(d.roof, 0.3));
	c.fillCircle(cx, 38, 5, lit(d.roof, 0.4));
	// 中央图标区
	c.fillRect(cx - 34, 112, cx + 34, 176, mix(d.badge, [255, 255, 255, 255], 0.08));
	c.strokeRect(cx - 34, 112, cx + 34, 176, 3, dim(d.badge, 0.55));
	d.icon(c, cx, 144, d);
	// 柱头灯
	for (const sx of [-1, 1]) c.fillCircle(cx + sx * 52, 90, 5, lit(d.roof, 0.2));
}

function drawTowerSign(c, { tint, accent }) {
	void c; void tint; void accent;
}

const SIGNS = [
	{
		id: "start", iconName: "起点",
		stone: [222, 214, 190], roof: [176, 138, 62], badge: [204, 160, 60],
		icon: (c, cx, cy, d) => {
			c.fillCircle(cx, cy, 22, lit(d.badge, 0.35));
			c.fillTriangleLike(cx - 6, cy, cx + 14, cy, cx + 4, cy - 14, [60, 48, 20, 255]);
			c.fillTriangleLike(cx - 6, cy + 2, cx + 14, cy + 2, cx + 4, cy + 16, [60, 48, 20, 255]);
			c.hLine(cx - 18, cx + 18, cy, [60, 48, 20, 255]);
		},
	},
	{
		id: "jail", iconName: "禁地",
		stone: [200, 198, 192], roof: [110, 110, 112], badge: [96, 100, 106],
		icon: (c, cx, cy, d) => {
			for (let i = 0; i < 3; i++) c.fillRect(cx - 16 + i * 12, cy - 18, cx - 10 + i * 12, cy + 18, dim(d.badge, 0.7));
			c.hLine(cx - 20, cx + 20, cy - 18, d.badge);
			c.hLine(cx - 20, cx + 20, cy + 18, d.badge);
		},
	},
	{
		id: "free", iconName: "驻留",
		stone: [206, 216, 226], roof: [70, 120, 158], badge: [58, 124, 165],
		icon: (c, cx, cy, d) => {
			c.fillEllipse(cx, cy + 2, 22, 12, dim(d.badge, 0.75));
			c.fillRect(cx - 3, cy + 10, cx + 3, cy + 24, dim(d.badge, 0.6));
		},
	},
	{
		id: "goto", iconName: "险地",
		stone: [214, 198, 192], roof: [122, 46, 46], badge: [150, 48, 44],
		icon: (c, cx, cy) => {
			c.fillCircle(cx, cy, 20, [240, 234, 220, 255]);
			c.strokeCircle(cx, cy, 20, 4, [150, 48, 44, 255]);
			c.hLine(cx - 10, cx + 10, cy - 8, [150, 48, 44, 255]);
			c.hLine(cx - 10, cx + 10, cy + 8, [150, 48, 44, 255]);
		},
	},
	{
		id: "chance", iconName: "机会",
		stone: [222, 208, 198], roof: [166, 58, 46], badge: [176, 62, 52],
		icon: (c, cx, cy, d) => {
			for (const [dx, dy] of [[-8, -6], [8, -6], [-8, 6], [8, 6], [0, 0]]) c.fillCircle(cx + dx, cy + dy, 4, [250, 246, 236, 255]);
			c.strokeRect(cx - 18, cy - 18, cx + 18, cy + 18, 3, dim(d.badge, 0.6));
		},
	},
	{
		id: "fate", iconName: "命运",
		stone: [214, 208, 224], roof: [120, 84, 156], badge: [136, 96, 172],
		icon: (c, cx, cy, d) => {
			c.fillCircle(cx + 6, cy, 16, [246, 242, 250, 255]);
			c.fillCircle(cx + 12, cy, 12, dim(d.badge, 0.35));
			c.fillTriangleLike(cx - 14, cy - 16, cx - 14, cy + 2, cx + 2, cy - 8, [246, 242, 250, 255]);
		},
	},
	{
		id: "tax", iconName: "赋税",
		stone: [220, 210, 192], roof: [138, 90, 58], badge: [150, 104, 66],
		icon: (c, cx, cy, d) => {
			c.fillEllipse(cx, cy, 22, 12, lit(d.badge, 0.25));
			c.fillEllipse(cx, cy - 6, 14, 9, lit(d.badge, 0.4));
			c.fillRect(cx - 6, cy + 10, cx + 6, cy + 20, dim(d.badge, 0.6));
		},
	},
];

/** 模型 id 与 map builder 对齐：m-{start,jail,free,goto,chance,fate,tax} */
export function buildSpriteSigns() {
	const out = [];
	for (const s of SIGNS) {
		const c = new Canvas(SZ, SZ, [0, 0, 0, 0]);
		drawSign(c, s);
		out.push(spriteModel(`m-${s.id}`, `2D牌坊_${s.iconName}`, [
			{ kind: "sprite", tex: { png: c.toPng(), w: SZ, h: SZ }, c: [0, 0.62, 0], s: [0.95, 1.24] },
		]));
	}
	return out;
}
void GROUND;
