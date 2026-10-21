// 四张地图的桌游桌面背景（960×540）：俯视 2D 场景的"桌沿+桌布"质感
// 神州（米白宣纸）/ 三国（牛皮纸）/ 江南（青灰纺）/ 大唐（赤金暗纹）
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { Canvas } from "./png-painter.mjs";
import { tabletopDesk, lit, dim } from "./art-2d.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");
const W = 960;
const H = 540;

const THEMES = {
	cn: { base: [238, 232, 218], edge: [96, 104, 118], line: [214, 206, 190] },
	sanguo: { base: [232, 216, 188], edge: [122, 88, 58], line: [214, 194, 160] },
	jiangnan: { base: [226, 232, 230], edge: [72, 92, 96], line: [204, 214, 210] },
	tang: { base: [240, 228, 206], edge: [128, 52, 40], line: [222, 202, 172] },
};

/** 主题角饰：中央区域会被地图盖住，只在四角加主题小纹样 */
function cornerMotive(c, key) {
	const t = THEMES[key];
	const gold = [214, 178, 96];
	for (const [cx, cy, sx, sy] of [[150, 120, 1, 1], [W - 150, 120, -1, 1], [150, H - 120, 1, -1], [W - 150, H - 120, -1, -1]]) {
		// 祥云角饰：三连弧 + 宝珠
		for (let i = 0; i < 3; i++) {
			c.strokeCircle(cx + sx * (i * 22), cy + sy * (i % 2) * 8, 12 - i * 3, 2, dim(t.edge, 1.05));
		}
		c.fillCircle(cx + sx * 66, cy + sy * 20, 4, gold);
		c.fillCircle(cx + sx * 66, cy + sy * 20, 2, lit(gold, 0.4));
	}
}

function paint(key) {
	const c = new Canvas(W, H);
	tabletopDesk(c, W, H, THEMES[key]);
	cornerMotive(c, key);
	return c.toPng();
}

const BACKGROUNDS = [
	{ key: "cn", id: "image-shenzhou-bg", name: "background-cn.png" },
	{ key: "sanguo", id: "image-sanguo-bg", name: "background-sanguo.png" },
	{ key: "jiangnan", id: "image-jiangnan-bg", name: "background-jiangnan.png" },
	{ key: "tang", id: "image-tang-bg", name: "background-tang.png" },
];

export function buildBackgrounds() {
	return BACKGROUNDS.map((b) => ({ id: b.id, name: b.name, filetype: "png", content: paint(b.key) }));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
	const dir = join(PROJECT_ROOT, "apps/client/public/offline-maps");
	mkdirSync(dir, { recursive: true });
	for (const b of BACKGROUNDS) {
		const png = paint(b.key);
		writeFileSync(join(dir, b.name), png);
		console.log(`背景: ${b.name} (${png.length}B)`);
	}
}
