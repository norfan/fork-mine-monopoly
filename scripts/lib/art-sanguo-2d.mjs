// 主题二·三国城池 2D 插画（三国风云）：8 州 × (空地/建成) = 16 张 256×256
import { Canvas } from "./png-painter.mjs";
import { GROUND, dim, lit, mix, brickWall, crenels, banner, lantern, cloud, shadow } from "./art-2d.mjs";

const SZ = 256;

function scene() {
	const c = new Canvas(SZ, SZ, [0, 0, 0, 0]);
	c.vGradient(0, SZ, 0, GROUND, [246, 222, 186, 255], [236, 190, 148, 255]); // 黄昏天色
	cloud(c, 60, 46, 1.1, [246, 226, 200, 255]);
	cloud(c, 196, 70, 0.9, [246, 226, 200, 255]);
	c.fillRect(0, GROUND, SZ, SZ, [170, 150, 118, 255]);
	c.fillRect(0, GROUND, SZ, GROUND + 4, [190, 172, 138, 255]);
	return c;
}

/** 歇山顶城楼（墙身上方两层收分屋顶） */
function towerRoof(c, cx, w, y, base, ridge) {
	c.fillTrapezoid(cx - w / 2, cx + w / 2, cx - w / 2 + 14, cx + w / 2 - 14, y, y + 18, base);
	c.fillTrapezoid(cx - w / 2 + 14, cx + w / 2 - 14, cx - w / 2 + 26, cx + w / 2 - 26, y + 18, y + 32, lit(base, 0.12));
	c.fillRect(cx - w / 2 - 4, y - 5, cx + w / 2 + 4, y + 1, ridge);
	c.fillRect(cx - 8, y - 12, cx + 8, y - 5, dim(ridge, 0.8)); // 宝顶座
	c.fillCircle(cx, y - 14, 4, lit(ridge, 0.3));
	// 檐下阴影
	c.fillRect(cx - w / 2 + 6, y + 30, cx + w / 2 - 6, y + 33, dim(base, 0.5));
}

function gateTower(c, cx, top, w, d) {
	// 城楼主体
	c.fillRect(cx - w / 2, top, cx + w / 2, top + 44, d.wall);
	brickWall(c, cx - w / 2 + 3, cx + w / 2 - 3, top + 3, top + 41, d.wall, dim(d.wall, 0.72), 4);
	c.fillRect(cx - 12, top + 8, cx + 12, top + 30, [46, 34, 24, 255]); // 窗
	c.strokeRect(cx - 12, top + 8, cx + 12, top + 30, 2, [30, 22, 14, 255]);
	// 垛口
	crenels(c, cx - w / 2 - 4, cx + w / 2 + 4, top - 9, 10, d.roof);
	towerRoof(c, cx, w + 26, top - 40, d.roof, dim(d.roof, 0.7));
}

function cityWall(c, d) {
	const cx = 128;
	// 主城墙
	c.fillRect(cx - 84, 118, cx + 84, GROUND, d.wall);
	brickWall(c, cx - 81, cx + 81, 121, GROUND - 4, d.wall, dim(d.wall, 0.7), 9);
	// 墙裙
	c.fillRect(cx - 84, GROUND - 22, cx + 84, GROUND, dim(d.wall, 0.78));
	// 城楼
	gateTower(c, cx, 62, 74, d);
	// 两侧旗台与旌旗
	for (const sx of [-1, 1]) {
		const x = cx + sx * 84;
		c.fillRect(x - 10, 96, x + 10, GROUND, dim(d.wall, 0.68));
		banner(c, x, 58, 96, d.flag, [70, 54, 34, 255]);
	}
	// 灯笼
	lantern(c, cx - 92, 128, 7, d.lamp, [180, 140, 60, 255]);
	lantern(c, cx + 92, 128, 7, d.lamp, [180, 140, 60, 255]);
	// 门口台阶
	for (let i = 0; i < 3; i++) c.fillRect(cx - 18 + i * 2, GROUND + i * 3, cx + 18 - i * 2, GROUND + 4 + i * 3, mix(d.wall, [120, 110, 96, 255], i * 0.25));
	shadow(c, cx, 90);
}

function emptyCamp(c) {
	const cx = 128;
	// 木栅栏
	for (let i = 0; i < 10; i++) {
		const x = cx - 78 + i * 17;
		c.vLine(x, GROUND - 44, GROUND - 2, [116, 92, 60, 255]);
		c.fillTriangle(x, GROUND - 44, x - 3, GROUND - 50, x + 3, GROUND - 50, [96, 74, 46, 255]);
	}
	c.hLine(cx - 80, cx + 80, GROUND - 30, [132, 106, 70, 255]);
	c.hLine(cx - 80, cx + 80, GROUND - 16, [132, 106, 70, 255]);
	// 帐篷
	c.fillRect(cx - 26, GROUND - 40, cx + 26, GROUND, [176, 160, 120, 255]);
	c.fillTriangleLike(cx, GROUND - 62, cx - 26, GROUND - 38, cx + 26, GROUND - 38, [146, 130, 94, 255]);
	c.fillRect(cx - 6, GROUND - 30, cx + 6, GROUND, [88, 72, 48, 255]);
	c.vLine(cx + 44, GROUND - 78, GROUND - 2, [110, 88, 58, 255]); // 旗杆
	c.fillTriangleLike(cx + 44, GROUND - 78, cx + 44, GROUND - 64, cx + 76, GROUND - 70, [150, 44, 40, 255]);
	shadow(c, cx, 80);
}

const D = [
	{ key: "siliao", wall: [176, 158, 126], roof: [96, 84, 70], flag: [178, 44, 40], lamp: [212, 84, 54] },
	{ key: "jingbei", wall: [170, 154, 124], roof: [92, 80, 68], flag: [88, 110, 158], lamp: [212, 84, 54] },
	{ key: "jingnan", wall: [174, 156, 122], roof: [98, 86, 72], flag: [58, 112, 74], lamp: [212, 84, 54] },
	{ key: "huainan", wall: [172, 152, 120], roof: [94, 82, 68], flag: [178, 138, 48], lamp: [212, 84, 54] },
	{ key: "jiangdong", wall: [176, 158, 124], roof: [100, 88, 74], flag: [136, 60, 46], lamp: [212, 84, 54] },
	{ key: "hebei", wall: [168, 150, 118], roof: [90, 78, 64], flag: [80, 96, 140], lamp: [212, 84, 54] },
	{ key: "xiliang", wall: [182, 162, 128], roof: [104, 90, 74], flag: [150, 70, 60], lamp: [212, 84, 54] },
	{ key: "yizhou", wall: [174, 156, 122], roof: [96, 84, 70], flag: [64, 116, 92], lamp: [212, 84, 54] },
];

export function buildSanguoArt() {
	const out = {};
	for (const d of D) {
		const e = scene();
		emptyCamp(e);
		out[`${d.key}-empty`] = e.toPng();
		const b = scene();
		cityWall(b, d);
		out[`${d.key}-built`] = b.toPng();
	}
	return out;
}
