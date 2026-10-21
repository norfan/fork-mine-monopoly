// 盛世大唐地图生成器（入口）
// 组装：程序化 GLB 模型 + 封面 PNG + 地图 JSON → protobuf 序列化 → .fpmap
// 用法：node scripts/generate-tang-map.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import protobuf from "protobufjs";

import { buildTangModels } from "./lib/tang-models.mjs";
import { buildDistrictHouses } from "./lib/tang-houses.mjs";
import { buildSpriteHouses, buildSpriteSigns } from "./lib/theme-sprite.mjs";
import { buildTangTopArt } from "./lib/art-top-tang.mjs";
import { buildRoleAvatars } from "./lib/make-role-avatars.mjs";
import { buildTangMapData } from "./lib/tang-map-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

const OUT_FPMAP = join(PROJECT_ROOT, "apps/client/public/offline-maps/tang-dynasty.fpmap");
const OUT_JSON = join(PROJECT_ROOT, "test-assets/tang-map.json");

// 俯视 2D 插画与圆地标
const TANG_TOP_ART = buildTangTopArt();
const SPRITE_SIGNS = buildSpriteSigns();
// 角标/机会/命运/赋税 → 水平圆地标（原 3D 宫殿/牌坊/灯笼/城墙俯视不成立）
const SIGN_MODEL_MAP = {
	"t-corner-gong": "m-start",
	"t-corner-yu": "m-jail",
	"t-corner-chi": "m-free",
	"t-corner-zhou": "m-goto",
	"t-chance": "m-chance",
	"t-fate": "m-fate",
	"t-tax": "m-tax",
};

function main() {
	// 1. 模型与图片资产：地产 → 俯视贴片；act 街头小景与 deco 装饰 → 保留 3D 立体（俯视有层次）
	const keys = ["guannei", "jingji", "henan", "hedong", "hebei", "huainan", "jiangnan", "jiannan"];
	const acts = buildDistrictHouses().filter((m) => m.id.startsWith("act-"));
	const models = [...buildSpriteHouses(TANG_TOP_ART, keys), ...acts, ...SPRITE_SIGNS, ...buildTangModels()];
	const cover = readFileSync(join(PROJECT_ROOT, "apps/client/public/offline-maps/cover-tang.png"));
	const background = readFileSync(join(PROJECT_ROOT, "apps/client/public/offline-maps/background-tang.png"));
	const avatars = buildRoleAvatars();

	// 2. 地图数据（角标/特殊格换成圆地标模型）
	const mapData = buildTangMapData();
	for (const t of mapData.mapItemTypes) {
		if (SIGN_MODEL_MAP[t.id]) t.modelId = SIGN_MODEL_MAP[t.id];
	}

	// 3. protobuf 序列化
	const protoRoot = protobuf.loadSync(join(PROJECT_ROOT, "packages/utils/protos/game-map.proto"));
	const GameMapType = protoRoot.lookupType("GameMap");
	const message = GameMapType.create({
		id: mapData.id,
		jsonData: JSON.stringify(mapData),
		modelFiles: models.map((m) => ({ id: m.id, name: m.name, filetype: m.filetype, content: m.glb })),
		imageFiles: [
			{ id: "image-tang-cover", name: "cover-tang.png", filetype: "png", content: cover },
			{ id: "image-tang-bg", name: "background-tang.png", filetype: "png", content: background },
			...avatars.map((a) => ({ id: a.id, name: a.name, filetype: a.filetype, content: a.content })),
		],
		serverMapId: "",
	});
	const buffer = GameMapType.encode(message).finish();

	// 4. 输出
	mkdirSync(dirname(OUT_FPMAP), { recursive: true });
	mkdirSync(dirname(OUT_JSON), { recursive: true });
	writeFileSync(OUT_FPMAP, buffer);
	writeFileSync(OUT_JSON, JSON.stringify(mapData, null, 1));

	// 5. 回读校验
	const decoded = GameMapType.toObject(GameMapType.decode(readFileSync(OUT_FPMAP)), { defaults: false, bytes: Buffer });
	const roundTrip = JSON.parse(decoded.jsonData);
	if (roundTrip.id !== mapData.id) throw new Error("回读校验失败：id 不一致");
	if (roundTrip.mapItems.length !== mapData.mapItems.length) throw new Error("回读校验失败：地图项数量不一致");
	const decodedModelIds = new Set(decoded.modelFiles.map((m) => m.id));
	const decodedImageIds = new Set(decoded.imageFiles.map((m) => m.id));
	for (const t of roundTrip.mapItemTypes) {
		if (!decodedModelIds.has(t.modelId)) throw new Error(`回读校验失败：模型 ${t.modelId} 未打包`);
	}
	if (!decodedImageIds.has(roundTrip.info.coverImageId)) throw new Error("回读校验失败：封面未打包");
	if (!decodedImageIds.has(roundTrip.info.backgroundImageId)) throw new Error("回读校验失败：背景图未打包");
	for (const r of roundTrip.roles) {
		if (!decodedImageIds.has(r.imageId)) throw new Error(`回读校验失败：角色 ${r.id} 图片未打包`);
	}
	for (const item of roundTrip.mapItems) {
		for (const modelId of item.property?.buildingModelIdList ?? []) {
			if (!decodedModelIds.has(modelId)) throw new Error(`回读校验失败：建造模型 ${modelId} 未打包`);
		}
	}
	// 角色头像唯一性
	const roleImageIds = roundTrip.roles.map((r) => r.imageId);
	if (new Set(roleImageIds).size !== roleImageIds.length) throw new Error("回读校验失败：角色头像存在重复");

	// 6. 汇总
	const fileNames = decoded.modelFiles.map((m) => m.name).join(", ");
	const houseCount = decoded.modelFiles.filter((m) => m.id.startsWith("house-")).length;
	const actCount = decoded.modelFiles.filter((m) => m.id.startsWith("act-")).length;
	console.log("=== 盛世大唐地图生成完成 ===");
	console.log(`地图: ${roundTrip.info.name} (${roundTrip.id})`);
	console.log(`格子: ${roundTrip.mapItems.length}（外环 40 + 地产展示 24 + 装饰 ${roundTrip.mapItems.length - 64}）`);
	console.log(`地产: 8 道 × 3 格 | 特殊格: 机会 6 / 命运 4 / 赋税 2`);
	console.log(`机会卡: ${roundTrip.chanceCards.length} | 角色: ${roundTrip.roles.length}（专属头像 ${roundTrip.roles.length} 张） | 路径: ${roundTrip.mapPaths.length}`);
	console.log(`模型: ${decoded.modelFiles.length} 个 GLB（通用 ${decoded.modelFiles.length - houseCount - actCount} + 八道建筑 ${houseCount} + 街头小景 ${actCount}）`);
	console.log(`图片: ${decoded.imageFiles.length} 张（封面 / 背景 / 角色头像 ${avatars.length}）`);
	console.log(`fpmap: ${OUT_FPMAP} (${(buffer.length / 1024).toFixed(1)} KB)`);
	console.log(`JSON: ${OUT_JSON}`);
}

main();
