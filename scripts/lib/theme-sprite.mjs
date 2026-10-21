// 2D 贴片模型生成（俯视 2D 场景）：插画 PNG → 水平贴片（rotX -90° 躺平）+ 房主染色小房
// - buildSpriteHouses：每地产 5 级（俯视插画 + N 个染色小房，N=等级）
// - buildSpriteSigns：四角格 + 机会/命运/赋税 的水平圆地标
// 输出条目 { id, name, filetype:"glb", glb } 与原 theme-houses 同结构，可直接替换
import { buildSpriteGlb } from "./sprite-glb.mjs";
import { dim, lit } from "./art-2d.mjs";
import { Canvas } from "./png-painter.mjs";

const SZ = 256;
// 俯视贴片尺寸：格心为原点，平铺在 y≈0.02，占格 90%
const SPRITE_SIZE = 0.9;
const SPRITE_Y = 0.02;
const HOUSE_CUBE = 0.09;

const spriteModel = (id, name, parts) => ({ id, name, filetype: "glb", glb: buildSpriteGlb(parts) });

/** 俯视水平贴片 part */
const flatSprite = (png) => ({
	kind: "sprite",
	tex: { png, w: SZ, h: SZ },
	c: [0, SPRITE_Y, 0],
	s: [SPRITE_SIZE, SPRITE_SIZE],
	rotX: -Math.PI / 2,
});

/** 一个染色小房（Cube），name 含 color → 引擎染房主色 */
function houseCube(x) {
	return { kind: "cube", c: [x, 0.06, 0.12], s: [HOUSE_CUBE, HOUSE_CUBE, HOUSE_CUBE], color: [1, 1, 1], name: "color-house" };
}

/** 地产 5 级：俯视插画 + (lv+1) 个染色小房 */
export function buildSpriteHouses(art, keys) {
	const out = [];
	for (const key of keys) {
		const png = art[`${key}-built`];
		if (!png) throw new Error(`buildSpriteHouses: 缺少插画 ${key}-built`);
		for (let lv = 0; lv < 5; lv++) {
			const parts = [flatSprite(png)];
			for (let n = 0; n <= lv; n++) {
				const total = 5; // 每行最多 5 个，居中排布
				const span = (total - 1) * 0.13;
				const x = -span / 2 + n * 0.13;
				parts.push(houseCube(x));
			}
			out.push(spriteModel(`house-${key}-${lv}`, `2D地产_${key}_${lv}级`, parts));
		}
	}
	return out;
}

/** 俯视水平圆地标（四角格/机会/命运/赋税）：圆形底盘 + 图标 */
function drawSign(c, d) {
	const cx = 128, cy = 128;
	// 底座阴影圈 + 石盘
	c.fillCircle(cx, cy + 3, 92, dim(d.stone, 0.55));
	c.fillCircle(cx, cy, 92, d.stone);
	c.strokeCircle(cx, cy, 92, 5, dim(d.stone, 0.65));
	c.strokeCircle(cx, cy, 82, 2, lit(d.stone, 0.3));
	// 中央徽章
	c.fillCircle(cx, cy, 52, d.badge);
	c.strokeCircle(cx, cy, 52, 4, dim(d.badge, 0.55));
	d.icon(c, cx, cy, d);
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
		out.push(spriteModel(`m-${s.id}`, `2D地标_${s.iconName}`, [flatSprite(c.toPng())]));
	}
	return out;
}
