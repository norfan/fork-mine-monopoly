// 主题三·江南水乡 2D 插画（江南水乡）：8 组团 × (空地/建成) = 16 张 256×256
import { Canvas } from "./png-painter.mjs";
import { GROUND, dim, lit, mix, horseGable, tileRoof, banner, lantern, cloud, shadow } from "./art-2d.mjs";

const SZ = 256;

function scene() {
	const c = new Canvas(SZ, SZ, [0, 0, 0, 0]);
	c.vGradient(0, SZ, 0, GROUND, [222, 234, 238, 255], [200, 220, 226, 255]); // 烟雨天色
	cloud(c, 56, 44, 1.2, [232, 240, 243, 255]);
	cloud(c, 200, 62, 0.9, [232, 240, 243, 255]);
	c.fillRect(0, GROUND, SZ, SZ, [186, 200, 204, 255]);
	// 水岸：下部画水纹
	for (let y = GROUND + 8; y < SZ; y += 7) {
		const t = (y - GROUND) / (SZ - GROUND);
		for (let i = 0; i < 5; i++) {
			const x = 16 + i * 56 + ((y * 13) % 17);
			c.hLine(x, x + 22, y, mix([150, 178, 192, 255], [110, 140, 156, 255], t));
		}
	}
	c.hLine(0, SZ, GROUND, [206, 218, 222, 255]);
	return c;
}

/** 枕水民居：白墙 + 黛瓦马头墙 + 木门木板窗 + 灯笼 + 石板桥 */
function waterHouse(c, d) {
	const cx = 128;
	// 主体两层白墙
	c.fillRect(cx - 72, 74, cx + 72, GROUND, d.wall);
	c.strokeRect(cx - 72, 74, cx + 72, GROUND, 2, dim(d.wall, 0.72));
	// 二层木板条窗
	for (let i = 0; i < 4; i++) {
		const x = cx - 60 + i * 32;
		c.fillRect(x, 92, x + 22, 116, d.wood);
		c.strokeRect(x, 92, x + 22, 116, 1, dim(d.wood, 0.6));
		c.vLine(x + 11, 92, 116, dim(d.wood, 0.55));
		c.hLine(x, x + 22, 104, dim(d.wood, 0.55));
	}
	// 一层大门
	c.fillRect(cx - 16, 150, cx + 16, GROUND, d.door);
	c.strokeRect(cx - 16, 150, cx + 16, GROUND, 2, dim(d.door, 0.5));
	c.vLine(cx, 150, GROUND, dim(d.door, 0.45));
	for (const sx of [-1, 1]) c.fillCircle(cx + sx * 6, 168, 2.5, [214, 186, 120, 255]);
	// 黛瓦屋顶
	tileRoof(c, cx - 78, cx + 78, 66, 16, d.tile, dim(d.tile, 0.7));
	// 马头墙
	horseGable(c, cx - 72, 40, 16, 30, d.wall, d.tile);
	horseGable(c, cx + 72, 40, 16, 30, d.wall, d.tile);
	// 灯笼
	lantern(c, cx - 46, 138, 7, [186, 52, 44, 255], [190, 160, 90, 255]);
	lantern(c, cx + 46, 138, 7, [186, 52, 44, 255], [190, 160, 90, 255]);
	// 匾额
	c.fillRect(cx - 14, 128, cx + 14, 142, dim(d.wood, 0.8));
	c.strokeRect(cx - 14, 128, cx + 14, 142, 1, dim(d.wood, 0.5));
	c.fillRect(cx - 10, 132, cx + 10, 137, [206, 178, 116, 255]);
	// 水边石阶
	for (let i = 0; i < 3; i++) c.fillRect(cx - 26 - i * 6, GROUND + i * 4, cx + 26 + i * 6, GROUND + 4 + i * 4, [168, 176, 178, 255]);
	// 倒影
	for (let y = GROUND + 10; y < SZ - 4; y += 3) {
		const t = (y - GROUND) / (SZ - GROUND);
		c.hLine(cx - 60 + t * 20, cx + 60 - t * 20, y, mix(d.wall, [120, 146, 158, 255], 0.45 + t * 0.3));
	}
	shadow(c, cx, 84);
}

function emptyGarden(c, d) {
	const cx = 128;
	// 石板院
	c.fillRect(cx - 76, GROUND - 6, cx + 76, GROUND + 8, [186, 190, 186, 255]);
	for (let i = 0; i < 6; i++) {
		c.vLine(cx - 76 + i * 26, GROUND - 6, GROUND + 8, [160, 164, 162, 255]);
	}
	c.hLine(cx - 76, GROUND, cx + 76, [206, 210, 206, 255]);
	// 竹篱
	for (let i = 0; i < 9; i++) {
		const x = cx - 72 + i * 18;
		c.vLine(x, GROUND - 46, GROUND, [150, 132, 92, 255]);
	}
	c.hLine(cx - 74, GROUND - 36, cx + 74, [168, 148, 104, 255]);
	c.hLine(cx - 74, GROUND - 24, cx + 74, [168, 148, 104, 255]);
	// 菜地畦
	for (let i = 0; i < 4; i++) {
		const x = cx - 56 + i * 30;
		c.fillRect(x, GROUND - 30, x + 22, GROUND - 12, [122, 140, 92, 255]);
		for (const [dx, dy] of [[5, -4], [12, -2], [8, -8]]) c.fillCircle(x + dx, GROUND - 30 + dy, 3, [92, 116, 70, 255]);
	}
	// 待建石碑
	c.fillRect(cx - 8, GROUND - 56, cx + 8, GROUND - 40, [196, 198, 196, 255]);
	c.strokeRect(cx - 8, GROUND - 56, cx + 8, GROUND - 40, 1, [150, 152, 150, 255]);
	c.fillRect(cx - 4, GROUND - 52, cx + 4, GROUND - 46, d.door);
	shadow(c, cx, 78);
}

const D = [
	{ key: "shuixiang", wall: [244, 242, 236], tile: [62, 66, 74], wood: [124, 92, 58], door: [96, 60, 40] },
	{ key: "qiaobang", wall: [240, 238, 232], tile: [58, 62, 70], wood: [118, 88, 54], door: [92, 58, 40] },
	{ key: "huhu", wall: [246, 244, 238], tile: [66, 70, 78], wood: [128, 96, 60], door: [98, 62, 42] },
	{ key: "canfang", wall: [242, 240, 234], tile: [60, 64, 72], wood: [120, 90, 56], door: [94, 60, 40] },
	{ key: "mingcha", wall: [238, 240, 236], tile: [56, 60, 68], wood: [114, 86, 52], door: [90, 56, 38] },
	{ key: "jiuxiang", wall: [244, 242, 238], tile: [64, 68, 76], wood: [126, 94, 58], door: [96, 62, 40] },
	{ key: "yuyuan", wall: [246, 244, 238], tile: [60, 64, 72], wood: [122, 92, 56], door: [94, 60, 40] },
	{ key: "qinhuai", wall: [242, 240, 234], tile: [58, 62, 70], wood: [116, 88, 54], door: [92, 58, 40] },
];

export function buildJiangnanArt() {
	const out = {};
	for (const d of D) {
		const e = scene();
		emptyGarden(e, d);
		out[`${d.key}-empty`] = e.toPng();
		const b = scene();
		waterHouse(b, d);
		out[`${d.key}-built`] = b.toPng();
	}
	return out;
}
