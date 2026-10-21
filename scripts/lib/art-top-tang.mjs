// 主题四·盛世大唐 俯视插画（2D 模式）：8 道 × (空地/建成) = 16 张 256×256
// 俯视构图：宫苑院落 + 重檐大殿（台基/腰檐/庑殿顶/宝顶）+ 回廊/拴马桩
import { Canvas } from "./png-painter.mjs";
import { dim, lit, courtyard, topTree, topPole } from "./art-2d.mjs";

const SZ = 256;

/** 重檐大殿俯视：台基 + 外墙 + 双层檐口 + 宝顶 */
function palaceTop(c, cx, cy, w, d, style) {
	// 台基（须弥座）
	c.fillRect(cx - w / 2 - 8, cy - d / 2 - 8, cx + w / 2 + 8, cy + d / 2 + 8, [168, 164, 156, 255]);
	c.strokeRect(cx - w / 2 - 8, cy - d / 2 - 8, cx + w / 2 + 8, cy + d / 2 + 8, 2, dim([168, 164, 156, 255], 0.6));
	// 殿身
	c.fillRect(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2, style.wall);
	c.strokeRect(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2, 2, dim(style.wall, 0.6));
	// 柱础（俯视点阵）
	for (let i = 0; i < 4; i++) {
		c.fillCircle(cx - w / 2 + 8 + i * ((w - 16) / 3), cy - d / 2 + 6, 2.5, dim(style.wall, 0.7));
		c.fillCircle(cx - w / 2 + 8 + i * ((w - 16) / 3), cy + d / 2 - 6, 2.5, dim(style.wall, 0.7));
	}
	// 腰檐（内收一层）
	c.strokeRect(cx - w / 2 + 10, cy - d / 2 + 10, cx + w / 2 - 10, cy + d / 2 - 10, 6, style.roof);
	// 大檐（外收一层，四角起翘）
	c.strokeRect(cx - w / 2 - 2, cy - d / 2 - 2, cx + w / 2 + 2, cy + d / 2 + 2, 4, lit(style.roof, 0.15));
	for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
		c.fillCircle(cx + sx * (w / 2 + 2), cy + sy * (d / 2 + 2), 4, lit(style.roof, 0.4)); // 角铃
	}
	// 正脊宝顶
	const core = style.round ? 26 : 18;
	c.fillRect(cx - core, cy - core, cx + core, cy + core, style.roof);
	c.strokeRect(cx - core, cy - core, cx + core, cy + core, 2, dim(style.roof, 0.55));
	if (style.round) {
		c.fillCircle(cx, cy, 12, lit(style.roof, 0.25));
	} else {
		c.fillRect(cx - 9, cy - 9, cx + 9, cy + 9, lit(style.roof, 0.2));
	}
	c.fillCircle(cx, cy, 4, style.ridge); // 宝珠
}

function emptyLot(c, style) {
	const gx = courtyard(c, 14, 242, 14, 242, [196, 192, 176, 255], [150, 132, 92, 255]);
	void gx;
	// 待建地基
	c.strokeRect(74, 84, 182, 172, 2, [150, 140, 118, 255]);
	for (const [x, y] of [[74, 84], [182, 84], [74, 172], [182, 172]]) c.fillCircle(x, y, 3.5, [128, 118, 96, 255]);
	// 拴马桩 + 木料
	topPole(c, 60, 200, 5, style.ridge, [120, 96, 60, 255]);
	c.fillRect(190, 190, 214, 200, dim(style.wall, 0.85));
	c.strokeRect(190, 190, 214, 200, 1, [120, 104, 72, 255]);
}

function built(c, style) {
	const gx = courtyard(c, 14, 242, 14, 242, [188, 190, 172, 255], [150, 132, 92, 255]);
	void gx;
	palaceTop(c, 128, 118, 92, 66, style);
	// 两侧回廊（厢房）
	for (const sx of [-1, 1]) {
		const x0 = sx < 0 ? 36 : 152;
		c.fillRect(x0, 150, x0 + 52, 196, lit(style.wall, 0.08));
		c.strokeRect(x0, 150, x0 + 52, 196, 2, dim(style.wall, 0.6));
		c.strokeRect(x0 + 6, 156, x0 + 46, 190, 4, style.roof);
	}
	// 宫灯柱 + 树
	topPole(c, 56, 56, 6, [186, 52, 44, 255], [120, 96, 60, 255]);
	topPole(c, 200, 56, 6, [186, 52, 44, 255], [120, 96, 60, 255]);
	topTree(c, 224, 130, 12, [110, 140, 96, 255]);
	topTree(c, 32, 130, 12, [110, 140, 96, 255]);
}

const D = [
	{ key: "guannei", roof: [212, 176, 76], ridge: [196, 60, 48], wall: [240, 236, 226], round: false },
	{ key: "jingji", roof: [72, 82, 96], ridge: [168, 44, 40], wall: [212, 194, 164], round: false },
	{ key: "henan", roof: [158, 140, 92], ridge: [128, 112, 76], wall: [216, 198, 158], round: false },
	{ key: "hedong", roof: [72, 82, 96], ridge: [102, 102, 112], wall: [220, 214, 204], round: false },
	{ key: "hebei", roof: [152, 108, 76], ridge: [128, 90, 64], wall: [228, 218, 192], round: true },
	{ key: "huainan", roof: [186, 160, 96], ridge: [168, 142, 76], wall: [208, 178, 132], round: true },
	{ key: "jiangnan", roof: [88, 114, 106], ridge: [72, 92, 86], wall: [240, 236, 226], round: false },
	{ key: "jiannan", roof: [96, 118, 112], ridge: [76, 96, 90], wall: [240, 236, 226], round: false },
];

export function buildTangTopArt() {
	const out = {};
	for (const d of D) {
		const e = new Canvas(SZ, SZ, [0, 0, 0, 0]);
		e.fillRect(0, 0, SZ, SZ, [214, 210, 196, 255]);
		emptyLot(e, d);
		out[`${d.key}-empty`] = e.toPng();
		const b = new Canvas(SZ, SZ, [0, 0, 0, 0]);
		b.fillRect(0, 0, SZ, SZ, [214, 210, 196, 255]);
		built(b, d);
		out[`${d.key}-built`] = b.toPng();
	}
	return out;
}
