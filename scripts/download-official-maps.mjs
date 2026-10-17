// 官方地图离线化下载脚本
// 从官方站点 API 拉取地图列表，下载 sourceUrl（.fpmap 源文件，未加密 protobuf）
// 与 coverUrl（封面图）到 client public/offline-maps/，并生成注册表 TS 文件
// 供 offline-maps.ts 合并进离线地图选择列表。可重复运行以刷新地图。
import { writeFileSync, mkdirSync, unlinkSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const OUT_DIR = join(PROJECT_ROOT, "apps/client/public/offline-maps");
const REGISTRY_OUT = join(PROJECT_ROOT, "apps/client/src/utils/official-maps.generated.ts");

/** 官方地图列表 API（page/size/inuse 可按需调整） */
const LIST_API = process.env.OFFICIAL_MAP_API ?? "https://fatpaper.site/monopoly-server/game-map/list?page=1&size=1000&inuse=true";

async function download(url) {
	const response = await fetch(url);
	if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
	return Buffer.from(await response.arrayBuffer());
}

/** 唯一稳定文件名：COS 随机串不含路径穿越风险，直接用作本地文件名 */
function cosKey(url) {
	const name = url.split("/").pop() || "";
	if (!/^[\w.-]+$/.test(name)) throw new Error(`非法资源文件名: ${url}`);
	return name.replace(/\.(fpmap|mmmap|png|jpe?g|gif|webp)$/i, "");
}

mkdirSync(OUT_DIR, { recursive: true });

console.log("拉取官方地图列表:", LIST_API);
const response = await fetch(LIST_API);
if (!response.ok) throw new Error(`拉取列表失败: HTTP ${response.status}`);
const { status, data } = await response.json();
if (status !== 200) throw new Error(`拉取列表失败: status ${status}`);

const maps = data.gameMapList ?? [];
console.log(`共 ${maps.length} 张地图`);

/** 清理本脚本历史上生成、但本次列表中已不存在的官方地图文件 */
const keepFiles = new Set();
for (const map of maps) {
	const key = cosKey(map.mapUrl);
	keepFiles.add(`official-${key}.fpmap`);
	const coverKey = cosKey(map.coverUrl);
	const coverExt = (map.coverUrl.split(".").pop() || "png").toLowerCase();
	keepFiles.add(`official-cover-${coverKey}.${coverExt}`);
}
for (const file of readdirSync(OUT_DIR)) {
	if (file.startsWith("official-") && !keepFiles.has(file)) {
		unlinkSync(join(OUT_DIR, file));
		console.log("清理过期官方地图文件:", file);
	}
}

const registry = [];
for (const map of maps) {
	const key = cosKey(map.mapUrl);
	const coverKey = cosKey(map.coverUrl);
	const fpmapName = `official-${key}.fpmap`;
	const coverExt = (map.coverUrl.split(".").pop() || "png").toLowerCase();
	const coverName = `official-cover-${coverKey}.${coverExt}`;

	process.stdout.write(`下载 ${map.name} (${map.author}) ... `);
	writeFileSync(join(OUT_DIR, fpmapName), await download(map.sourceUrl));
	writeFileSync(join(OUT_DIR, coverName), await download(map.coverUrl));
	console.log("完成");

	registry.push({
		id: `offline-map-official-${key.toLowerCase()}`,
		name: map.name,
		author: map.author,
		version: String(map.version),
		// 完整 Markdown 描述（fpmap 内嵌，但注册表保留可用于离线展示）
		description: map.description || "",
		fileName: `offline-maps/${fpmapName}`,
		coverUrl: `offline-maps/${coverName}`,
		// API 返回的 changelog 数组，保留 semver/content/version/createdAt 供 MapPreviewer 更新日志展示
		changelog: (map.changelog || []).map(({ version, semver, content, createdAt }) => ({
			version,
			semver: semver || null,
			content: content || "",
			createdAt: createdAt || null,
		})),
	});
}

// 生成注册表文件（由 offline-maps.ts 合并进 OFFLINE_MAPS）
const ts = `// 本文件由 scripts/download-official-maps.mjs 自动生成，请勿手改
// 来源: ${LIST_API}
// 生成时间: ${new Date().toISOString()}
import type { OfflineMapMeta } from "./offline-maps";

export const OFFICIAL_OFFLINE_MAPS: OfflineMapMeta[] = ${JSON.stringify(registry, null, "\t")};
`;
writeFileSync(REGISTRY_OUT, ts);

console.log(`\n已下载 ${registry.length} 张地图到 ${OUT_DIR}`);
console.log(`注册表已生成: ${REGISTRY_OUT}`);
