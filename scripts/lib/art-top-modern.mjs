// 主题一·现代都市 俯视插画（2D 模式）：8 组团 × (空地/建成) = 16 张 256×256
// 俯视构图：院落围墙 + 平顶大楼（屋顶设备可见）+ 绿化/停车
import { Canvas } from "./png-painter.mjs";
import { dim, lit, mix, courtyard, topTree, topPole } from "./art-2d.mjs";

const SZ = 256;

/** 平顶大楼俯视：楼体方 + 屋顶设备（水箱/空调/天线） */
function towerTop(c, cx, cy, w, d, { wall, glass, roof, accent }) {
	const x0 = cx - w / 2, y0 = cy - d / 2;
	c.fillRect(x0, y0, cx + w / 2, cy + d / 2, wall);
	c.strokeRect(x0, y0, cx + w / 2, cy + d / 2, 2, dim(wall, 0.6));
	// 屋顶暗部（受光面区分）
	c.fillRect(x0, y0, cx + w / 2, y0 + 6, lit(wall, 0.18));
	// 天窗玻璃带
	c.fillRect(x0 + 8, cy - 8, cx + w / 2 - 8, cy + 8, glass);
	c.hLine(x0 + 8, cx + w / 2 - 8, cy, lit(glass, 0.45));
	// 屋顶设备：水箱房 + 空调机组
	c.fillRect(cx - w * 0.3, y0 + 8, cx - w * 0.3 + 16, y0 + 22, dim(roof, 0.9));
	c.strokeRect(cx - w * 0.3, y0 + 8, cx - w * 0.3 + 16, y0 + 22, 1, dim(roof, 0.5));
	c.fillRect(cx + w * 0.1, cy + 10, cx + w * 0.1 + 22, cy + 24, dim(roof, 1.05));
	for (let i = 0; i < 3; i++) c.vLine(cx + w * 0.1 + 5 + i * 7, cy + 13, cy + 21, lit(roof, 0.2));
	// 天线 + 航空障碍灯
	c.vLine(cx, y0 - 2, y0 - 16, [110, 112, 116, 255]);
	c.fillCircle(cx, y0 - 17, 2.5, [232, 72, 60, 255]);
	// 招牌色带（楼顶裙边）
	c.fillRect(x0, cy + d / 2 - 5, cx + w / 2, cy + d / 2, accent);
}

function emptyLot(c, d) {
	const gx = courtyard(c, 14, 242, 14, 242, [188, 200, 190, 255], [150, 154, 158, 255]);
	void gx;
	// 待建空地：地基线 + 塔吊
	c.strokeRect(70, 96, 186, 176, 2, [140, 146, 152, 255]);
	for (const [x, y] of [[70, 96], [186, 96], [70, 176], [186, 176]]) c.fillCircle(x, y, 3, [120, 126, 132, 255]);
	// 塔吊
	c.vLine(150, 60, 176, [176, 138, 62, 255]);
	c.hLine(96, 210, 66, [176, 138, 62, 255]);
	c.vLine(112, 66, 88, [176, 138, 62, 255]);
	c.fillRect(108, 88, 118, 96, dim(d.accent, 0.9));
	c.fillCircle(150, 58, 4, dim(d.accent, 0.8));
}

function built(c, d) {
	const gx = courtyard(c, 14, 242, 14, 242, [178, 188, 180, 255], [150, 154, 158, 255]);
	// 主楼
	towerTop(c, 128, 120, 96, 76, d);
	// 副楼（宽基座）
	c.fillRect(48, 150, 100, 196, lit(d.wall, 0.06));
	c.strokeRect(48, 150, 100, 196, 2, dim(d.wall, 0.6));
	c.fillRect(52, 154, 96, 192, d.glass);
	c.hLine(52, 96, 173, lit(d.glass, 0.4));
	// 绿化树 + 旗杆
	topTree(c, 216, 60, 14, [96, 140, 92, 255]);
	topTree(c, 40, 60, 12, [96, 140, 92, 255]);
	topTree(c, 216, 210, 12, [96, 140, 92, 255]);
	topPole(c, 60, 210, 6, d.accent, [110, 112, 116, 255]);
	// 停车线
	for (let i = 0; i < 4; i++) c.vLine(176 + i * 14, 196, 214, [226, 228, 230, 255]);
}

const D = [
	{ key: "cbd", wall: [206, 214, 222], glass: [52, 84, 116], roof: [90, 96, 104], accent: [46, 132, 182] },
	{ key: "mall", wall: [232, 214, 178], glass: [214, 156, 60], roof: [96, 92, 88], accent: [196, 62, 54] },
	{ key: "hotel", wall: [238, 230, 210], glass: [206, 162, 74], roof: [92, 88, 84], accent: [150, 36, 36] },
	{ key: "resident", wall: [226, 218, 198], glass: [150, 186, 210], roof: [88, 86, 84], accent: [206, 128, 54] },
	{ key: "culture", wall: [214, 216, 220], glass: [96, 132, 154], roof: [94, 96, 100], accent: [122, 84, 158] },
	{ key: "finance", wall: [178, 196, 214], glass: [70, 108, 148], roof: [86, 92, 100], accent: [198, 160, 66] },
	{ key: "tech", wall: [226, 232, 236], glass: [64, 140, 160], roof: [88, 94, 98], accent: [52, 160, 178] },
	{ key: "leisure", wall: [232, 196, 206], glass: [196, 140, 172], roof: [92, 88, 92], accent: [136, 82, 172] },
];

export function buildModernTopArt() {
	const out = {};
	for (const d of D) {
		const e = new Canvas(SZ, SZ, [0, 0, 0, 0]);
		e.fillRect(0, 0, SZ, SZ, [206, 214, 220, 255]);
		emptyLot(e, d);
		out[`${d.key}-empty`] = e.toPng();
		const b = new Canvas(SZ, SZ, [0, 0, 0, 0]);
		b.fillRect(0, 0, SZ, SZ, [206, 214, 220, 255]);
		built(b, d);
		out[`${d.key}-built`] = b.toPng();
	}
	void mix;
	return out;
}
