// 验证官方地图 fpmap 里 info.coverImageId 是否存在于 imageFiles 中
import protobuf from "protobufjs";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const DIR = join(PROJECT_ROOT, "apps/client/public/offline-maps");

const pb = await protobuf.load(join(PROJECT_ROOT, "packages/utils/protos/game-map.proto"));
const T = pb.lookupType("GameMap");

let ok = true;
for (const f of readdirSync(DIR).filter((n) => n.startsWith("official-") && n.endsWith(".fpmap"))) {
	const buf = readFileSync(join(DIR, f));
	const msg = T.decode(buf);
	const data = JSON.parse(msg.jsonData);
	const coverId = data.info.coverImageId;
	const modelIds = data.mapItems.map((i) => i.type?.modelId || i.type || "");
	const itemModelIds = [...new Set(data.mapItemTypes?.map((t) => t.modelId).filter(Boolean) || [])];
	const hasCover = msg.imageFiles.some((img) => img.id === coverId);
	const missingModel = itemModelIds.filter((mid) => !msg.modelFiles.some((m) => m.id === mid));

	console.log(`\n${f} => ${data.info.name}`);
	console.log(`  coverImageId: ${coverId}  |  imageFiles 匹配: ${hasCover ? "✅" : "❌ MISSING"}`);
	console.log(`  mapItemTypes.modelIds: ${itemModelIds.join(", ") || "(none)"}`);
	console.log(`  modelFiles 数量: ${msg.modelFiles.length}  |  缺失: ${missingModel.length ? missingModel.join(", ") : "无"}`);
	console.log(`  roles: ${data.roles.length}  |  items: ${data.mapItems.length}  |  cards: ${data.chanceCards.length}`);
	if (!hasCover || missingModel.length) ok = false;
}

console.log(ok ? "\n✅ 所有地图资源完整" : "\n❌ 有地图资源缺失");
