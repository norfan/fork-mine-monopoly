// 主题二·三国城池 俯视插画（2D 模式）：8 州 × (空地/建成) = 16 张 256×256
// 俯视构图：回字城墙 + 四角角楼 + 中心城主楼 + 旗杆/演武场
import { Canvas } from "./png-painter.mjs";
import { dim, lit, courtyard, topPole } from "./art-2d.mjs";

const SZ = 256;

/** 回字城墙（外墙 + 内墙 + 四角角楼） */
function ringWall(c, x0, x1, y0, y1, d, withTowers) {
	// 外墙（夯土）
	c.strokeRect(x0, y0, x1, y1, 10, d.wall);
	c.strokeRect(x0 + 10, y0 + 10, x1 - 10, y1 - 10, 1, dim(d.wall, 0.6));
	// 内院
	c.fillRect(x0 + 14, y0 + 14, x1 - 14, y1 - 14, [176, 160, 128, 255]);
	// 四角角楼
	if (withTowers) {
		for (const [tx, ty] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
			c.fillRect(tx - 12, ty - 12, tx + 12, ty + 12, dim(d.wall, 0.85));
			c.strokeRect(tx - 12, ty - 12, tx + 12, ty + 12, 2, dim(d.wall, 0.55));
			c.fillRect(tx - 7, ty - 7, tx + 7, ty + 7, d.roof);
			c.fillCircle(tx, ty, 3, lit(d.roof, 0.3));
		}
	}
}

/** 城主楼俯视（重檐屋顶可见层面） */
function keepTop(c, cx, cy, w, d) {
	c.fillRect(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2, [196, 182, 154, 255]);
	c.strokeRect(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2, 2, dim([196, 182, 154, 255], 0.6));
	// 重檐：两层收分屋顶
	c.strokeRect(cx - w / 2 + 8, cy - d / 2 + 8, cx + w / 2 - 8, cy + d / 2 - 8, 5, [92, 80, 68, 255]);
	c.fillRect(cx - 12, cy - 12, cx + 12, cy + 12, [110, 96, 80, 255]);
	c.fillCircle(cx, cy, 4, [214, 186, 120, 255]); // 宝顶
}

function emptyCamp(c, d) {
	const gx = courtyard(c, 14, 242, 14, 242, [190, 176, 148, 255], [116, 92, 60, 255]);
	void gx;
	// 营地帐篷 ×3
	for (const [tx, ty] of [[80, 110], [128, 96], [172, 118]]) {
		c.fillRect(tx - 20, ty - 14, tx + 20, ty + 14, [176, 160, 120, 255]);
		c.strokeRect(tx - 20, ty - 14, tx + 20, ty + 14, 2, [146, 130, 94, 255]);
		c.fillRect(tx - 5, ty - 4, tx + 5, ty + 14, [88, 72, 48, 255]);
	}
	// 栅栏 + 旗杆
	topPole(c, 60, 190, 6, d.flag, [110, 88, 58, 255]);
	topPole(c, 200, 190, 6, d.flag, [110, 88, 58, 255]);
}

function built(c, d) {
	const gx = courtyard(c, 14, 242, 14, 242, [180, 168, 140, 255], [116, 92, 60, 255]);
	void gx;
	ringWall(c, 34, 222, 40, 210, d, true);
	// 中心城主楼
	keepTop(c, 128, 126, 66, 52);
	// 两侧偏殿
	for (const sx of [-1, 1]) {
		c.fillRect(128 + sx * 76 - 16, 126 - 14, 128 + sx * 76 + 16, 126 + 14, [186, 172, 144, 255]);
		c.strokeRect(128 + sx * 76 - 16, 126 - 14, 128 + sx * 76 + 16, 126 + 14, 2, [156, 142, 116, 255]);
	}
	// 演武场（中心圆场）
	c.fillCircle(128, 176, 18, [168, 152, 120, 255]);
	c.strokeCircle(128, 176, 18, 2, [140, 124, 94, 255]);
	// 旗杆 + 灯笼
	topPole(c, 56, 56, 7, d.flag, [110, 88, 58, 255]);
	topPole(c, 200, 56, 7, d.flag, [110, 88, 58, 255]);
	c.fillCircle(66, 200, 6, d.lamp);
	c.fillCircle(190, 200, 6, d.lamp);
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

export function buildSanguoTopArt() {
	const out = {};
	for (const d of D) {
		const e = new Canvas(SZ, SZ, [0, 0, 0, 0]);
		e.fillRect(0, 0, SZ, SZ, [222, 206, 180, 255]);
		emptyCamp(e, d);
		out[`${d.key}-empty`] = e.toPng();
		const b = new Canvas(SZ, SZ, [0, 0, 0, 0]);
		b.fillRect(0, 0, SZ, SZ, [222, 206, 180, 255]);
		built(b, d);
		out[`${d.key}-built`] = b.toPng();
	}
	return out;
}
