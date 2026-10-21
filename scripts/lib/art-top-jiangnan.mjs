// 主题三·江南水乡 俯视插画（2D 模式）：8 组团 × (空地/建成) = 16 张 256×256
// 俯视构图：黛瓦建筑群 + 天井 + 水池 + 石桥 + 竹丛
import { Canvas } from "./png-painter.mjs";
import { dim, lit, courtyard, topTree } from "./art-2d.mjs";

const SZ = 256;

/** 黛瓦屋面俯视：深色方 + 瓦垄线 + 屋脊亮边 */
function tileRoofTop(c, x0, y0, x1, y1, tile, wall) {
	c.fillRect(x0, y0, x1, y1, tile);
	for (let x = x0 + 4; x < x1; x += 7) c.vLine(x, y0 + 2, y1 - 2, dim(tile, 0.7));
	for (let y = y0 + 4; y < y1; y += 7) c.hLine(x0 + 2, x1 - 2, y, dim(tile, 0.6));
	c.strokeRect(x0, y0, x1, y1, 2, lit(tile, 0.25)); // 檐口亮边
	// 一侧白墙可见
	c.fillRect(x0, y1 - 2, x1, y1 + 6, wall);
	c.strokeRect(x0, y1, x1, y1 + 6, 1, dim(wall, 0.7));
}

function emptyGarden(c) {
	const gx = courtyard(c, 14, 242, 14, 242, [196, 204, 186, 255], [150, 132, 92, 255]);
	void gx;
	// 菜畦 + 竹丛 + 待建碑
	for (let i = 0; i < 4; i++) {
		const x = 40 + i * 44;
		c.fillRect(x, 90, x + 32, 132, [150, 158, 120, 255]);
		c.strokeRect(x, 90, x + 32, 132, 1, [120, 128, 96, 255]);
		for (const [dx, dy] of [[8, 12], [20, 20], [14, 34]]) c.fillCircle(x + dx, 90 + dy, 3, [110, 122, 86, 255]);
	}
	topTree(c, 210, 190, 13, [116, 148, 92, 255]);
	topTree(c, 46, 190, 11, [116, 148, 92, 255]);
	c.fillRect(118, 168, 138, 186, [196, 198, 196, 255]);
	c.strokeRect(118, 168, 138, 186, 1, [150, 152, 150, 255]);
}

function built(c, d) {
	const gx = courtyard(c, 14, 242, 14, 242, [190, 198, 184, 255], [150, 132, 92, 255]);
	void gx;
	// 主楼 + 厢房（两进）
	tileRoofTop(c, 74, 60, 182, 130, d.tile, d.wall);
	tileRoofTop(c, 40, 140, 104, 186, d.tile, d.wall);
	tileRoofTop(c, 152, 140, 216, 186, d.tile, d.wall);
	// 天井（浅色方院）
	c.fillRect(108, 136, 148, 186, [214, 216, 208, 255]);
	c.strokeRect(108, 136, 148, 186, 1, [180, 182, 176, 255]);
	// 水池 + 石桥
	c.fillEllipse(128, 208, 46, 22, [150, 186, 200, 255]);
	c.strokeEllipse(128, 208, 46, 22, 2, [110, 146, 162, 255]);
	for (let y = 202; y < 216; y += 4) c.hLine(96, 160, y, [178, 208, 218, 255]);
	c.fillRect(88, 202, 168, 210, [186, 188, 184, 255]); // 桥
	c.strokeRect(88, 202, 168, 210, 1, [150, 152, 148, 255]);
	// 门灯 ×2 + 竹丛
	c.fillCircle(58, 128, 6, [186, 52, 44, 255]);
	c.fillCircle(198, 128, 6, [186, 52, 44, 255]);
	topTree(c, 40, 52, 12, [116, 148, 92, 255]);
	topTree(c, 216, 52, 12, [116, 148, 92, 255]);
}

const D = [
	{ key: "shuixiang", wall: [244, 242, 236], tile: [62, 66, 74] },
	{ key: "qiaobang", wall: [240, 238, 232], tile: [58, 62, 70] },
	{ key: "huhu", wall: [246, 244, 238], tile: [66, 70, 78] },
	{ key: "canfang", wall: [242, 240, 234], tile: [60, 64, 72] },
	{ key: "mingcha", wall: [238, 240, 236], tile: [56, 60, 68] },
	{ key: "jiuxiang", wall: [244, 242, 238], tile: [64, 68, 76] },
	{ key: "yuyuan", wall: [246, 244, 238], tile: [60, 64, 72] },
	{ key: "qinhuai", wall: [242, 240, 234], tile: [58, 62, 70] },
];

export function buildJiangnanTopArt() {
	const out = {};
	for (const d of D) {
		const e = new Canvas(SZ, SZ, [0, 0, 0, 0]);
		e.fillRect(0, 0, SZ, SZ, [206, 218, 222, 255]);
		emptyGarden(e);
		out[`${d.key}-empty`] = e.toPng();
		const b = new Canvas(SZ, SZ, [0, 0, 0, 0]);
		b.fillRect(0, 0, SZ, SZ, [206, 218, 222, 255]);
		built(b, d);
		out[`${d.key}-built`] = b.toPng();
	}
	return out;
}
