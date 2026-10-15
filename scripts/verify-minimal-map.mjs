// 解码回读验证：确认生成的 .fpmap 可被客户端同构解码
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import protobuf from "protobufjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

const protoRoot = await protobuf.load(join(PROJECT_ROOT, "packages/utils/protos/game-map.proto"));
const GameMapType = protoRoot.lookupType("GameMap");
const buffer = readFileSync(join(PROJECT_ROOT, "test-assets/minimal-map-8.fpmap"));
const decoded = GameMapType.decode(buffer);
const mapData = JSON.parse(decoded.jsonData);

const checks = [
  ["id", decoded.id],
  ["mapItems 数量", mapData.mapItems?.length],
  ["mapPaths 数量", mapData.mapPaths?.length],
  ["pathMapItemTypeIds", JSON.stringify(mapData.pathMapItemTypeIds)],
  ["startMapItemId", mapData.startMapItemId],
  ["roles 数量", mapData.roles?.length],
  ["phases.playerRound 数量", mapData.phases?.playerRound?.length],
  ["gameSettingForm 数量", mapData.gameSettingForm?.length],
  ["imageFiles 数量", decoded.imageFiles?.length],
  ["modelFiles 数量", decoded.modelFiles?.length],
  ["modelFiles[0] id", decoded.modelFiles?.[0]?.id],
  ["modelFiles[0] filetype", decoded.modelFiles?.[0]?.filetype],
  ["mapItems[0].type.modelId", mapData.mapItems?.[0]?.type?.modelId],
  ["mapItemTypes[0].modelId", mapData.mapItemTypes?.[0]?.modelId],
  ["coverImageId", mapData.info?.coverImageId],
];
for (const [k, v] of checks) console.log(`${k}:`, v);
