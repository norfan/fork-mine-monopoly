import apiClient from "./index";
import { getApiBaseUrl } from "@src/utils/server-config";

export async function joinRoomApi(roomId: string) {
	const response = await apiClient.get<{
		hostPeerId: string;
		needCreate: boolean;
		deleteIntervalMs: number;
		heartbeatIntervalMs?: number;
		iceServers: RTCIceServer[];
		hostLeaseToken: string;
		hostEpoch: number;
	}>(`/room-router/join`, { params: { roomId }, silent: true });
	return response;
}

export async function emitHostPeerId(
	roomId: string,
	hostPeerId: string,
	hostName: string,
	hostId: string,
	hostLeaseToken: string,
): Promise<void> {
	await apiClient.post("/room-router/emit-host", {
		roomId,
		hostPeerId,
		hostName,
		hostId,
		hostLeaseToken,
	}, { silent: true });
}

export async function emitRoomHeart(roomId: string, hostLeaseToken: string): Promise<void> {
	await apiClient.get("/room-router/heart", { params: { roomId, hostLeaseToken }, silent: true });
}

/**
 * 房主夺回房间：租约失效/服务端重启导致注册丢失时，用旧 token 重新激活房间并获取新 token
 */
export async function reclaimHostRoom(
	roomId: string,
	hostPeerId: string,
	hostName: string,
	hostId: string,
	hostLeaseToken: string,
): Promise<{ hostLeaseToken: string; hostEpoch: number }> {
	const response = await apiClient.post<{ hostLeaseToken: string; hostEpoch: number }>(
		"/room-router/reclaim-host",
		{ roomId, hostPeerId, hostName, hostId, hostLeaseToken },
		{ silent: true },
	);
	return response.data;
}

export function deleteRoom(roomId: string, hostLeaseToken?: string) {
	// 使用 sendBeacon 在页面卸载时清理房间 - 不使用 apiClient
	// 基址运行时读取（支持登录页切换服务器地址，见 server-config.ts）
	const params = new URLSearchParams({ roomId });
	if (hostLeaseToken) params.set("hostLeaseToken", hostLeaseToken);
	const query = params.toString();

	navigator.sendBeacon(`${getApiBaseUrl()}/room-router/delete?${query}`);
}

export async function getRoomSessionStatus(roomId: string) {
	return apiClient.get<{ status: "active" | "grace" | "closed" | "expired"; hostEpoch: number }>("/room-router/status", { params: { roomId }, silent: true });
}

export async function getRandomPublicRoom() {
	const response = await apiClient.get<{ roomId: string }>("/room-router/random-public-room");
	return response;
}

export async function setRoomPrivate(roomId: string, isPrivate: boolean) {
	const response = await apiClient.post<{ roomId: string; isPrivate: boolean }>("/room-router/set-private", {
		roomId,
		isPrivate,
	});
	return response;
}

export async function setRoomStarted(
	roomId: string,
	isStarted: boolean,
	mapId?: string | null,
	mapName?: string | null,
) {
	const response = await apiClient.post<{ roomId: string; isStarted: boolean }>("/room-router/set-started", {
		roomId,
		isStarted,
		mapId,
		mapName,
	});
	return response;
}
