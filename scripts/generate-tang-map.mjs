// 盛世大唐地图生成器（入口）
// 组装：程序化 GLB 模型 + 封面 PNG + 地图 JSON → protobuf 序列化 → .fpmap
// 用法：node scripts/generate-tang-map.mjs

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import protobuf from "protobufjs";

import { buildTangModels } from "./lib/tang-models.mjs";
import { buildTangMapData } from "./lib/tang-map-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

const OUT_FPMAP = join(PROJECT_ROOT, "apps/client/public/offline-maps/tang-dynasty.fpmap");
const OUT_JSON = join(PROJECT_ROOT, "test-assets/tang-map.json");

function main() {
	// 1. 模型与封面、背景
	const models = buildTangModels();
	const cover = readFileSync(join(PROJECT_ROOT, "apps/client/public/offline-maps/cover-tang.png"));
	const background = readFileSync(join(PROJECT_ROOT, "apps/client/public/offline-maps/background-tang.png"));

	// 2. 地图数据
	const mapData = buildTangMapData();

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

	// 6. 汇总
	const fileNames = decoded.modelFiles.map((m) => m.name).join(", ");
	console.log("=== 盛世大唐地图生成完成 ===");
	console.log(`地图: ${roundTrip.info.name} (${roundTrip.id})`);
	console.log(`格子: ${roundTrip.mapItems.length}（外环 40 + 地产展示 24 + 装饰 ${roundTrip.mapItems.length - 64}）`);
	console.log(`地产: 8 道 × 3 格 | 特殊格: 机会 ${roundTrip.mapEvents.filter((e) => e.id === "evt-chance").length ? 6 : 0} / 命运 4 / 赋税 2`);
	console.log(`机会卡: ${roundTrip.chanceCards.length} | 角色: ${roundTrip.roles.length} | 路径: ${roundTrip.mapPaths.length}`);
	console.log(`模型: ${decoded.modelFiles.length} 个 GLB (${fileNames})`);
	console.log(`封面: ${decoded.imageFiles.length} 张 (${decoded.imageFiles[0].name})`);
	console.log(`fpmap: ${OUT_FPMAP} (${(buffer.length / 1024).toFixed(1)} KB)`);
	console.log(`JSON: ${OUT_JSON}`);
}

main();
