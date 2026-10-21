// 经典复刻地图生成器（入口）：神州大地 / 三国风云 / 江南水乡
// 用法：node scripts/generate-classic-maps.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import protobuf from "protobufjs";

import { buildShenzhouMap, buildSanguoMap, buildJiangnanMap } from "./lib/classic-maps.mjs";
import * as modern from "./lib/theme-houses-modern.mjs";
import * as sanguo from "./lib/theme-houses-sanguo.mjs";
import * as jiangnan from "./lib/theme-houses-jiangnan.mjs";
import { buildSpriteHouses, buildSpriteSigns } from "./lib/theme-sprite.mjs";
import { buildModernTopArt } from "./lib/art-top-modern.mjs";
import { buildSanguoTopArt } from "./lib/art-top-sanguo.mjs";
import { buildJiangnanTopArt } from "./lib/art-top-jiangnan.mjs";
import { buildCastAvatars } from "./lib/make-avatars-cast.mjs";
import { buildSanguoAvatars } from "./lib/make-avatars-sanguo.mjs";
import { buildCovers } from "./lib/make-covers.mjs";
import { buildBackgrounds } from "./lib/make-backgrounds.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const OUT_DIR = join(PROJECT_ROOT, "apps/client/public/offline-maps");
const OUT_JSON_DIR = join(PROJECT_ROOT, "test-assets");

// 俯视 2D 插画（256×256 PNG）与圆地标贴片
const ART = { modern: buildModernTopArt(), sanguo: buildSanguoTopArt(), jiangnan: buildJiangnanTopArt() };
const SPRITE_SIGNS = buildSpriteSigns();

// 装配：地产/四角/特殊格 → 2D 贴片；行动格底座/中心装饰 → 保留 3D 小景
const THEMES = {
	modern: (m) => [
		...buildSpriteHouses(ART.modern, m.DISTRICTS.map((d) => d.key)),
		...m.buildActs(),
		...m.buildDecos(),
		...SPRITE_SIGNS,
	],
	sanguo: (m) => [
		...buildSpriteHouses(ART.sanguo, m.DISTRICTS.map((d) => d.key)),
		...m.buildActs(),
		...m.buildDecos(),
		...SPRITE_SIGNS,
	],
	jiangnan: (m) => [
		...buildSpriteHouses(ART.jiangnan, m.DISTRICTS.map((d) => d.key)),
		...m.buildActs(),
		...m.buildDecos(),
		...SPRITE_SIGNS,
	],
};

const MODULES = { modern, sanguo, jiangnan };
const COVERS = buildCovers();
const BACKGROUNDS = buildBackgrounds();
const CAST_AVATARS = buildCastAvatars();
const SANGUO_AVATARS = buildSanguoAvatars();

const MAPS = [
	{ key: "cn", name: "神州大地", theme: "modern", builder: buildShenzhouMap, cover: 0, bg: 0, avatars: CAST_AVATARS },
	{ key: "sanguo", name: "三国风云", theme: "sanguo", builder: buildSanguoMap, cover: 1, bg: 1, avatars: SANGUO_AVATARS },
	{ key: "jiangnan", name: "江南水乡", theme: "jiangnan", builder: buildJiangnanMap, cover: 2, bg: 2, avatars: CAST_AVATARS },
];

function generateOne(cfg) {
	const models = THEMES[cfg.theme](MODULES[cfg.theme]);
	const mapData = cfg.builder();

	const protoRoot = protobuf.loadSync(join(PROJECT_ROOT, "packages/utils/protos/game-map.proto"));
	const GameMapType = protoRoot.lookupType("GameMap");
	const message = GameMapType.create({
		id: mapData.id,
		jsonData: JSON.stringify(mapData),
		modelFiles: models.map((m) => ({ id: m.id, name: m.name, filetype: m.filetype, content: m.glb })),
		imageFiles: [
			{ id: COVERS[cfg.cover].id, name: COVERS[cfg.cover].name, filetype: "png", content: COVERS[cfg.cover].content },
			{ id: BACKGROUNDS[cfg.bg].id, name: BACKGROUNDS[cfg.bg].name, filetype: "png", content: BACKGROUNDS[cfg.bg].content },
			...cfg.avatars.map((a) => ({ id: a.id, name: a.name, filetype: "png", content: a.content })),
		],
		serverMapId: "",
	});
	const buffer = GameMapType.encode(message).finish();

	// 输出
	const outFpmap = join(OUT_DIR, `classic-${cfg.key}.fpmap`);
	mkdirSync(OUT_DIR, { recursive: true });
	mkdirSync(OUT_JSON_DIR, { recursive: true });
	writeFileSync(outFpmap, buffer);
	writeFileSync(join(OUT_JSON_DIR, `classic-${cfg.key}.json`), JSON.stringify(mapData, null, 1));

	// 回读校验
	const decoded = GameMapType.toObject(GameMapType.decode(readFileSync(outFpmap)), { defaults: false, bytes: Buffer });
	const roundTrip = JSON.parse(decoded.jsonData);
	if (roundTrip.id !== mapData.id) throw new Error("回读校验失败：id 不一致");
	if (roundTrip.mapItems.length !== mapData.mapItems.length) throw new Error("回读校验失败：地图项数量不一致");
	const modelIds = new Set(decoded.modelFiles.map((m) => m.id));
	const imageIds = new Set(decoded.imageFiles.map((m) => m.id));
	for (const t of roundTrip.mapItemTypes) {
		if (!modelIds.has(t.modelId)) throw new Error(`回读校验失败：模型 ${t.modelId} 未打包`);
	}
	if (!imageIds.has(roundTrip.info.coverImageId)) throw new Error("回读校验失败：封面未打包");
	if (!imageIds.has(roundTrip.info.backgroundImageId)) throw new Error("回读校验失败：背景图未打包");
	for (const r of roundTrip.roles) {
		if (!imageIds.has(r.imageId)) throw new Error(`回读校验失败：角色 ${r.id} 图片未打包`);
	}
	for (const item of roundTrip.mapItems) {
		for (const modelId of item.property?.buildingModelIdList ?? []) {
			if (!modelIds.has(modelId)) throw new Error(`回读校验失败：建造模型 ${modelId} 未打包`);
		}
	}
	const roleImageIds = roundTrip.roles.map((r) => r.imageId);
	if (new Set(roleImageIds).size !== roleImageIds.length) throw new Error("回读校验失败：角色头像存在重复");
	// 路径闭环校验
	const itemIds = new Set(roundTrip.mapItems.map((i) => i.id));
	for (const p of roundTrip.mapPaths) {
		if (!itemIds.has(p.fromMapItemId) || !itemIds.has(p.toMapItemId)) throw new Error("回读校验失败：路径端点不存在");
	}

	console.log(`=== ${cfg.name} 生成完成 ===`);
	console.log(`  格子: ${roundTrip.mapItems.length}（外环 40 + 地产 24 + 装饰 ${roundTrip.mapItems.length - 64}）`);
	console.log(`  机会卡: ${roundTrip.chanceCards.length} | 角色: ${roundTrip.roles.length}（专属头像） | 路径: ${roundTrip.mapPaths.length}`);
	console.log(`  模型: ${decoded.modelFiles.length} GLB | 图片: ${decoded.imageFiles.length} 张`);
	console.log(`  fpmap: classic-${cfg.key}.fpmap (${(buffer.length / 1024).toFixed(1)} KB)`);
}

for (const cfg of MAPS) generateOne(cfg);
console.log("三张经典地图全部生成并校验通过");
