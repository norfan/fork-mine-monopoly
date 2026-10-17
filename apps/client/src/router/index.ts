import { createRouter, createWebHashHistory, createWebHistory } from "vue-router";
import { useLoading, useRoomInfo, useUserInfo } from "@src/store";
import { MonopolyClient, destoryMonopolyClient } from "@src/core/monopoly-client/MonopolyClient";

function componentLoadedInterceptor(loader: () => Promise<any>) {
	return async () => {
		const loadingStore = useLoading();
		loadingStore.text = "加载中";
		loadingStore.loading = true;
		try {
			return await loader();
		} finally {
			loadingStore.loading = false;
		}
	};
}

import { getPlatformType } from "@src/utils/platform";

const routes = [
	{ path: "/", name: "login", component: componentLoadedInterceptor(() => import("@src/views/login/login.vue")) },
	{
		path: "/room-router",
		name: "room-router",
		component: componentLoadedInterceptor(() => import("@src/views/room_router/room_router.vue")),
	},
	{ path: "/room", name: "room", component: componentLoadedInterceptor(() => import("@src/views/room/room.vue")) },
	{ path: "/game", name: "game", component: componentLoadedInterceptor(() => import("@src/views/game/game.vue")) },
];

const router = createRouter({
	// Electron 必须用 Hash (file:// 协议)，其他平台用 History
	history: getPlatformType() === "electron"
		? createWebHashHistory()
		: createWebHistory(import.meta.env.BASE_URL),
	routes,
});

router.beforeEach((to, form) => {
	switch (to.name) {
		case "room-router":
			destoryMonopolyClient();
			break;
		case "game":
		case "room":
			// 房间/游戏页依赖 MonopolyClient 单例：经过房间选择页时单例会被销毁，
			// 若此时通过浏览器前进/后退等历史导航回到本页，实例已不存在，
			// 房间组件会拿到 undefined 的 socketClient 导致全面崩溃，直接弹回重新进入。
			if (!useRoomInfo().roomId || !MonopolyClient.getInstance()) {
				return { name: "room-router" };
			}
			break;
		default:
			if (
				// 检查用户是否已登录
				!localStorage.getItem("token") &&
				!localStorage.getItem("user") &&
				//  避免无限重定向
				to.name !== "login"
			) {
				// 将用户重定向到登录页面
				return { name: "login" };
			}
			break;
	}
});

export default router;
