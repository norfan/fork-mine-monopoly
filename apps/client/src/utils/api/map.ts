import apiClient from "./index";
import type { ApiResponse } from "@mine-monopoly/types";
import { GameMapInDb } from "@mine-monopoly/types";

export async function getGameMapList(page: number, size: number) {
	// silent: 本地派对离线降级时会主动走 catch，请求失败不弹 toast 也不写错误日志
	const response = await apiClient.get<
		ApiResponse<{ total: number; gameMapList: GameMapInDb[]; current: number }>
	>("/game-map/list", { params: { page, size, inuse: true }, silent: true });

	const { total, gameMapList, current } = (response as any).data;
	return { total, gameMapList, current };
}

export async function getGameMapById(mapId: string): Promise<GameMapInDb> {
	const response = await apiClient.get<ApiResponse<GameMapInDb>>("/game-map/info", {
		params: { id: mapId },
	});
	return (response as any).data;
}
