// 主题一·现代都市 2D 插画（神州大地）：8 组团 × (空地/建成) = 16 张 256×256
// 导出 buildModernArt() → { "cbd-empty": png, "cbd-built": png, ... }
import { Canvas } from "./png-painter.mjs";
import { GROUND, dim, lit, mix, foundation, glassGrid, shadow, signStrip, windowLights } from "./art-2d.mjs";

const SZ = 256;
const GROUND_H = SZ - GROUND; // 地面带高度

function base() {
	const c = new Canvas(SZ, SZ, [0, 0, 0, 0]);
	return c;
}

/** 新绘一张：天空渐变 + 地面 */
function scene() {
	const c = base();
	c.vGradient(0, SZ, 0, GROUND, [198, 226, 245, 255], [160, 205, 232, 255]);
	c.fillRect(0, GROUND, SZ, SZ, [176, 178, 172, 255]);
	c.fillRect(0, GROUND, SZ, GROUND + 4, [198, 200, 194, 255]);
	return c;
}

function tower(c, { cx, w, top, base: b, glass, accent, stripes }) {
	const h = GROUND - top;
	c.fillRect(cx - w / 2, top, cx + w / 2, GROUND, b);
	glassGrid(c, cx - w / 2 + 4, cx + w / 2 - 4, top + 8, GROUND - 10, stripes ? 3 : 4, Math.max(3, Math.floor(h / 26)), glass, dim(b, 0.6));
	windowLights(c, cx - w / 2 + 4, cx + w / 2 - 4, top + 10, GROUND - 12, 4, Math.max(3, Math.floor(h / 30)), [255, 236, 170, 255]);
	// 侧墙暗面
	c.fillRect(cx - w / 2, top, cx - w / 2 + 5, GROUND, dim(b, 0.72));
	c.fillRect(cx + w / 2 - 5, top, cx + w / 2, GROUND, lit(b, 0.18));
	// 腰线
	for (let y = top + 30; y < GROUND - 12; y += 34) c.hLine(cx - w / 2, cx + w / 2, y, dim(b, 0.62));
	// 顶部招牌条
	signStrip(c, cx - w / 2 + 6, cx + w / 2 - 6, top + 3, 8, dim(accent, 0.9), [255, 244, 214, 255], 4);
	// 楼顶设备
	c.fillRect(cx - 8, top - 12, cx + 8, top, dim(b, 0.5));
	c.vLine(cx, top - 26, top - 12, [90, 90, 96, 255]);
	c.fillCircle(cx, top - 27, 2.5, [220, 60, 60, 255]);
}

function emptyLot(c, cx) {
	// 空地 + 围栏 + 待建牌
	c.fillRect(cx - 80, GROUND - 4, cx + 80, GROUND + 10, dim([196, 190, 172, 255], 0.9));
	for (let i = 0; i < 9; i++) {
		const x = cx - 76 + i * 19;
		c.vLine(x, GROUND - 30, GROUND - 4, [120, 96, 66, 255]);
		c.fillRect(x - 2, GROUND - 34, x + 2, GROUND - 30, [140, 112, 74, 255]);
	}
	c.hLine(cx - 78, cx + 78, GROUND - 22, [150, 126, 88, 255]);
	c.fillRect(cx - 12, GROUND - 52, cx + 12, GROUND - 38, [230, 220, 190, 255]);
	c.strokeRect(cx - 12, GROUND - 52, cx + 12, GROUND - 38, 2, [120, 96, 66, 255]);
	c.fillRect(cx - 7, GROUND - 49, cx + 7, GROUND - 41, [90, 110, 130, 255]); // 示意图
	c.vLine(cx + 20, GROUND - 60, cx + 34, [120, 96, 66, 255]);
	c.fillRect(cx + 20, GROUND - 60, cx + 40, GROUND - 44, [196, 60, 48, 255]); // 小旗
	shadow(c, cx, 70);
}

const D = [
	{ key: "cbd", wall: [206, 214, 222], glass: [52, 84, 116], accent: [46, 132, 182], form: "twin" },
	{ key: "mall", wall: [232, 214, 178], glass: [214, 156, 60], accent: [196, 62, 54], form: "wide" },
	{ key: "hotel", wall: [238, 230, 210], glass: [206, 162, 74], accent: [150, 36, 36], form: "classic" },
	{ key: "resident", wall: [226, 218, 198], glass: [150, 186, 210], accent: [206, 128, 54], form: "two" },
	{ key: "culture", wall: [214, 216, 220], glass: [96, 132, 154], accent: [122, 84, 158], form: "studio" },
	{ key: "finance", wall: [178, 196, 214], glass: [70, 108, 148], accent: [198, 160, 66], form: "sharp" },
	{ key: "tech", wall: [226, 232, 236], glass: [64, 140, 160], accent: [52, 160, 178], form: "spire" },
	{ key: "leisure", wall: [232, 196, 206], glass: [196, 140, 172], accent: [136, 82, 172], form: "dome" },
];

function built(c, d) {
	const cx = 128;
	if (d.form === "twin") {
		tower(c, { cx: cx - 26, w: 52, top: 44, base: d.wall, glass: d.glass, accent: d.accent, stripes: true });
		tower(c, { cx: cx + 26, w: 46, top: 74, base: lit(d.wall, 0.06), glass: d.glass, accent: d.accent });
		c.fillRect(cx - 46, 86, cx + 46, 96, dim(d.wall, 0.8)); // 连廊
	} else if (d.form === "wide") {
		tower(c, { cx, w: 130, top: 96, base: d.wall, glass: d.glass, accent: d.accent, stripes: true });
		tower(c, { cx: cx - 22, w: 60, top: 58, base: lum(d.wall, 0.9), glass: d.glass, accent: d.accent });
	} else if (d.form === "classic") {
		tower(c, { cx, w: 120, top: 70, base: d.wall, glass: d.glass, accent: d.accent, stripes: true });
		c.fillRect(cx - 40, 60, cx + 40, 72, dim(d.wall, 0.75));
		c.fillTriangleLike(cx, 40, cx - 40, 62, cx + 40, 62, dim(d.accent, 0.85));
	} else if (d.form === "two") {
		tower(c, { cx: cx - 30, w: 52, top: 78, base: d.wall, glass: d.glass, accent: d.accent });
		tower(c, { cx: cx + 32, w: 56, top: 56, base: lit(d.wall, 0.05), glass: d.glass, accent: d.accent, stripes: true });
	} else if (d.form === "studio") {
		c.fillRect(cx - 78, 100, cx + 78, GROUND, d.wall);
		glassGrid(c, cx - 70, cx + 70, 108, GROUND - 10, 4, 4, d.glass, dim(d.wall, 0.55));
		signStrip(c, cx - 70, cx + 70, 104, 8, d.accent, [240, 240, 240, 255], 5);
		tower(c, { cx, w: 40, top: 70, base: d.wall, glass: d.glass, accent: d.accent, stripes: true });
	} else if (d.form === "sharp") {
		tower(c, { cx, w: 96, top: 60, base: d.wall, glass: d.glass, accent: d.accent, stripes: true });
		for (let i = 0; i < 3; i++) c.fillTriangleLike(cx, 20 + i * 8, cx - 30 + i * 12, 62 + i * 8, cx + 30 - i * 12, 62 + i * 8, lit(d.wall, 0.1));
	} else if (d.form === "spire") {
		tower(c, { cx, w: 70, top: 66, base: d.wall, glass: d.glass, accent: d.accent, stripes: true });
		c.fillTriangleLike(cx, 26, cx - 8, 66, cx + 8, 66, [230, 232, 236, 255]);
		c.vLine(cx, 22, 30, [240, 240, 240, 255]);
		c.fillCircle(cx, 21, 3, [255, 120, 90, 255]);
	} else {
		c.fillRect(cx - 86, 96, cx + 86, GROUND, d.wall);
		glassGrid(c, cx - 78, cx + 78, 104, GROUND - 10, 5, 3, d.glass, dim(d.wall, 0.55));
		c.fillEllipse(cx, 96, 86, 26, d.wall); // 圆顶座
		c.fillEllipse(cx, 78, 44, 20, d.accent);
		c.fillRect(cx - 4, 54, cx + 4, 80, dim(d.wall, 0.7));
		c.fillCircle(cx, 52, 5, [240, 210, 120, 255]);
	}
	foundation(c, cx, 96, 168, [196, 198, 202], [150, 152, 154]);
	shadow(c, cx, 86);
}

function lum(cc, k) {
	return [cc[0] * k, cc[1] * k, cc[2] * k];
}

export function buildModernArt() {
	const out = {};
	for (const d of D) {
		const e = scene();
		emptyLot(e, 128);
		out[`${d.key}-empty`] = e.toPng();

		const b = scene();
		built(b, d);
		out[`${d.key}-built`] = b.toPng();
	}
	return out;
}
