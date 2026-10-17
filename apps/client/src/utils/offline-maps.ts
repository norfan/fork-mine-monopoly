// 离线内置地图注册表（方案1）
// 本地派对离线模式（拉不到服务器官方地图列表）时，直接展示这里注册的内置地图，
// 玩家点选即可加载，无需导入本地文件、不依赖服务器。
import type { GameMapChangelogEntry, GameMapInDb } from "@mine-monopoly/types";
import { OFFICIAL_OFFLINE_MAPS } from "./official-maps.generated";

/** 静态资源基础路径（dev 为 /monopoly/，生产与 base 一致） */
const BASE = import.meta.env.BASE_URL;

/** public 资源完整路径 */
function assetUrl(relativePath: string): string {
	return `${BASE}${relativePath.replace(/^\//, "")}`;
}

export interface OfflineMapMeta {
	/** 内置地图唯一标识（本地生成，仅用于选中定位） */
	id: string;
	/** 地图名称（展示用） */
	name: string;
	/** 作者（展示用） */
	author: string;
	/** 展示版本号 */
	version: string;
	/** 描述（完整 Markdown） */
	description: string;
	/** public 下的 .fpmap 文件路径（相对 /monopoly/） */
	fileName: string;
	/** public 下的封面图片路径（相对 /monopoly/） */
	coverUrl: string;
	/** 更新日志（可选，API 返回的 changelog） */
	changelog?: GameMapChangelogEntry[];
}

/** 内置离线地图清单：在此追加新地图即可出现在离线选择列表 */
const BUILT_IN_MAPS: OfflineMapMeta[] = [
	{
		id: "offline-map-minimal-8",
		name: "离线测试地图-8格",
		author: "离线内置",
		version: "0.0.1",
		description: "离线桌游内置地图：8 格闭环 + 单角色 + 系统默认阶段",
		fileName: "offline-maps/minimal-map-8.fpmap",
		coverUrl: "offline-maps/cover-minimal-8.png",
	},
];

/** 全量离线地图 = 手工内置 + 官方下载（scripts/download-official-maps.mjs 维护） */
export const OFFLINE_MAPS: OfflineMapMeta[] = [...BUILT_IN_MAPS, ...OFFICIAL_OFFLINE_MAPS];

/** 将内置地图元数据转换为 MapPreviewer 可渲染的 GameMapInDb 结构 */
export function offlineMapToGameMapInDb(meta: OfflineMapMeta): GameMapInDb {
	return {
		id: meta.id,
		name: meta.name,
		author: meta.author,
		version: Number(meta.version) || 1,
		description: meta.description,
		pendingChangelog: null,
		changelog: meta.changelog ?? [],
		hash: `offline-${meta.id}`,
		coverUrl: assetUrl(meta.coverUrl),
		mapUrl: assetUrl(meta.fileName),
		inuse: true,
		creatorId: null,
		status: "published",
		rejectReason: null,
		pendingUrl: null,
		pendingSourceUrl: null,
		sourceUrl: null,
		pendingHash: null,
		pendingVersion: null,
		isOfficial: true,
	};
}

/** 根据 id 查找内置地图元数据 */
export function findOfflineMap(id: string): OfflineMapMeta | undefined {
	return OFFLINE_MAPS.find((meta) => meta.id === id);
}

/** 拉取内置地图 .fpmap 的原始字节 */
export async function fetchOfflineMapFile(meta: OfflineMapMeta): Promise<Uint8Array> {
	const response = await fetch(`${assetUrl(meta.fileName)}?t=${Date.now()}`);
	if (!response.ok) throw new Error(`读取内置地图失败: HTTP ${response.status}`);
	const buffer = await response.arrayBuffer();
	return new Uint8Array(buffer);
}
