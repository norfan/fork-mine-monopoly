import type { GameMapInDb } from "@mine-monopoly/types";

/**
 * 客户端默认内置的离线「官方」地图清单。
 *
 * 这些 .fpmap / 封面文件随客户端一起打包在 public/offline-maps/ 下，
 * 选图、换图都不需要访问服务器，完全离线也能开局。
 * 清单只收录官方地图；联网时也只会把服务器上的其它官方地图合并进来
 * （见 mergeOfflineWithServerMaps）。
 */
export interface OfflineMapEntry {
	/** 选图列表使用的唯一 ID，同时作为房间 mapInfo 的 ID */
	id: string;
	/** .fpmap 文件内部记录的地图 ID，用于与存档里的 mapId 匹配 */
	mapId: string;
	name: string;
	author: string;
	version: string;
	description: string;
	fileName: string;
	cover: string;
}

export const OFFLINE_MAP_ID_PREFIX = "offline-map-";

export const OFFLINE_MAPS: OfflineMapEntry[] = [
	{
		id: "offline-map-official-0pag1wbqsgbrbsqy",
		mapId: "map-islvxuc8a15j",
		name: "非常好地图",
		author: "Fat_Paper",
		version: "1.0.0",
		description: "官方地图，客户端内置，离线可玩",
		fileName: "official-0PaG1WBqSGBRbsQY.fpmap",
		cover: "official-cover-0PaG1WBqSGBRbsQY.png",
	},
	{
		id: "offline-map-official-y30bnxhmm5v1v3rk",
		mapId: "map-islvxuc8a15j",
		name: "非常好地图-测试版",
		author: "Fat_Paper",
		version: "1.0.0",
		description: "官方地图，客户端内置，离线可玩",
		fileName: "official-Y30BnxhMM5v1V3rK.fpmap",
		cover: "official-cover-Y30BnxhMM5v1V3rK.png",
	},
	{
		id: "offline-map-official-71rlqvcqytfo5a5a",
		mapId: "map-d0d3403454ddf",
		name: "非常好地图·疯狂扩张版-双环方城",
		author: "梦游人海",
		version: "1.0.0",
		description: "官方地图，客户端内置，离线可玩",
		fileName: "official-71RLqVCQYtFO5a5A.fpmap",
		cover: "official-cover-71RLqVCQYtFO5a5A.png",
	},
	{
		id: "offline-map-official-x59ipnqzqgobfr9q",
		mapId: "map-ggepxbpkmbw4",
		name: "霓虹不夜城",
		author: "Sato",
		version: "1.0.0",
		description: "官方地图，客户端内置，离线可玩",
		fileName: "official-x59ipNQzQgObfR9q.fpmap",
		cover: "official-cover-x59ipNQzQgObfR9q.png",
	},
	{
		id: "offline-map-official-tfoopnzcfuir6itc",
		mapId: "map-xiz60yyw1elt",
		name: "玩具箱",
		author: "三季蜉蝣",
		version: "1.0.0",
		description: "官方地图，客户端内置，离线可玩",
		fileName: "official-tFoOPnzCfuir6ITc.fpmap",
		cover: "official-cover-tFoOPnzCfuir6ITc.jpg",
	},
];

/**
 * 生成内置资源的 URL。
 * Vite 保证 BASE_URL 以斜杠结尾：web 子路径部署为 "/monopoly/"，
 * Capacitor / Electron 为 "./"，直接拼接即可同时兼容 http(s) 与 file://。
 */
export function offlineAssetUrl(relativePath: string): string {
	const base = import.meta.env.BASE_URL as string;
	const path = `offline-maps/${relativePath.replace(/^\/+/, "")}`;
	return `${base}${path}`;
}

export function isOfflineMapId(id: string | undefined | null): boolean {
	return !!id && id.startsWith(OFFLINE_MAP_ID_PREFIX);
}

export function findOfflineMap(id: string): OfflineMapEntry | undefined {
	return OFFLINE_MAPS.find((map) => map.id === id);
}

/**
 * 存档里保存的是 .fpmap 内部 ID，用它反查内置地图，让读档也能离线完成。
 * 注意：部分官方地图存在同 ID 的不同版本文件（例如「非常好地图」与它的测试版），
 * 此时按清单顺序回退到第一张，属于预期行为，不影响存档的可玩性。
 */
export function findOfflineMapByMapId(mapId: string): OfflineMapEntry | undefined {
	return OFFLINE_MAPS.find((map) => map.mapId === mapId);
}

export function getOfflineMapList(): GameMapInDb[] {
	return OFFLINE_MAPS.map((map) => ({
		id: map.id,
		name: map.name,
		author: map.author,
		version: Number(map.version.split(".")[0]) || 1,
		description: map.description,
		pendingChangelog: null,
		changelog: [],
		hash: `offline-${map.id}`,
		coverUrl: offlineAssetUrl(map.cover),
		mapUrl: offlineAssetUrl(map.fileName),
		inuse: true,
		creatorId: null,
		isOfficial: true,
		status: "published",
		rejectReason: null,
		pendingUrl: null,
		pendingSourceUrl: null,
		sourceUrl: null,
		pendingHash: null,
		pendingVersion: map.version,
	}));
}

/**
 * 内置官方地图优先展示；联网成功时只把服务器上的其它「官方」地图追加在后面
 * （按名称去重，避免同名重复）。非官方地图不会进入选图列表。
 * 服务器不可用或报错时不影响内置列表。
 */
export function mergeOfflineWithServerMaps(serverMaps: GameMapInDb[] | undefined | null): GameMapInDb[] {
	const offline = getOfflineMapList();
	if (!serverMaps?.length) return offline;
	const knownNames = new Set(offline.map((map) => map.name));
	const extra = serverMaps.filter(
		(map) => map.isOfficial === true && !knownNames.has(map.name) && !isOfflineMapId(map.id),
	);
	return [...offline, ...extra];
}

/** 读取内置 .fpmap 的原始字节，交给现有的 from:"custom" 文件加载链路解析。 */
export async function loadOfflineMapBytes(id: string): Promise<Uint8Array> {
	const entry = findOfflineMap(id);
	if (!entry) throw new Error(`找不到内置地图: ${id}`);
	// 首选 Vite 注入的 base；后两项用于兼容自定义 base / 直接以域名根部署的情况。
	const candidates = [
		...new Set([
			offlineAssetUrl(entry.fileName),
			`./offline-maps/${entry.fileName}`,
			`/offline-maps/${entry.fileName}`,
		]),
	];
	let lastError: unknown;
	for (const url of candidates) {
		try {
			const response = await fetch(url);
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			return new Uint8Array(await response.arrayBuffer());
		} catch (error) {
			lastError = error;
		}
	}
	throw new Error(`读取内置地图失败: ${entry.name}（${lastError instanceof Error ? lastError.message : "未知错误"}）`);
}
