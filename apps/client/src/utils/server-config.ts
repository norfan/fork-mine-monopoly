/**
 * 运行时服务器地址配置
 *
 * 构建期：@mine-monopoly/env 的 Vite 插件把 env("X") 替换为 .env 字面量，
 * 打包进 APK 后无法更改。本模块在其之上增加一层运行时覆盖：
 *  - 用户在登录页输入服务器地址（如局域网 IP）后存入 localStorage
 *  - 所有 API 基址 / PeerJS 信令地址均改为运行时读取，切换后无需重新打包
 *  - 未设置覆盖时回退到构建期默认值（.env 的 MONOPOLY_DOMAIN）
 */
import { env } from "@mine-monopoly/env";

// ============ 构建期默认值（由 vite-plugin-env 在构建时替换） ============
const BUILD_PROTOCOL = env("PROTOCOL", "http");
const BUILD_DOMAIN = env("MONOPOLY_DOMAIN");
const BUILD_API_PREFIX = env("API_BASE_PREFIX", "");
const BUILD_API_PORT = env<number>("SERVER_PORT", 81);
const BUILD_ICE_PREFIX = env("ICE_BASE_PREFIX", "") || BUILD_API_PREFIX;
const BUILD_ICE_PORT = env<number>("ICE_SERVER_PORT", 82);

const STORAGE_KEY = "mm-server-domain";
export const SERVER_CONFIG_CHANGED_EVENT = "mm:server-config-changed";

/** 规范化用户输入：去掉协议前缀、路径与首尾空白，仅保留 host[:port] */
export function normalizeServerDomain(input: string): string {
	let value = (input || "").trim();
	value = value.replace(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//, "");
	value = value.replace(/\/+$/, "");
	const slashIndex = value.indexOf("/");
	if (slashIndex >= 0) value = value.slice(0, slashIndex);
	return value;
}

function readOverride(): string {
	try {
		return normalizeServerDomain(localStorage.getItem(STORAGE_KEY) || "");
	} catch {
		return "";
	}
}

/** 构建期默认域名（.env 的 MONOPOLY_DOMAIN） */
export function getBuildDomain(): string {
	return BUILD_DOMAIN;
}

/** 当前生效的服务器域名：运行时覆盖优先，否则用构建期默认值 */
export function getServerDomain(): string {
	return readOverride() || BUILD_DOMAIN;
}

/** 是否由用户自定义了服务器地址 */
export function isUsingCustomServer(): boolean {
	return !!readOverride();
}

/** 按指定域名构建 API 基址（domain 为空时取当前生效域名） */
export function buildApiBaseUrl(domain?: string): string {
	const target = normalizeServerDomain(domain ?? "") || getServerDomain();
	if (BUILD_API_PREFIX) {
		return `${BUILD_PROTOCOL}://${target}${BUILD_API_PREFIX}`;
	}
	return `${BUILD_PROTOCOL}://${target}:${BUILD_API_PORT}`;
}

/** API 基址（与旧 getApiBaseUrl 逻辑一致，域名改为运行时读取） */
export function getApiBaseUrl(): string {
	return buildApiBaseUrl();
}

// ============ ICE / PeerJS 信令（默认与 API 同主机：API :81 / 信令 :82） ============
export function getIceHost(): string {
	return getServerDomain();
}

export function getIcePort(): number {
	return BUILD_ICE_PORT;
}

export function getIcePath(): string {
	return BUILD_ICE_PREFIX || "/peerjs";
}

export function getIceUsePrefix(): boolean {
	return !!BUILD_ICE_PREFIX;
}

function emitChanged(detail: { domain: string; previous: string }): void {
	try {
		window.dispatchEvent(new CustomEvent(SERVER_CONFIG_CHANGED_EVENT, { detail }));
	} catch {
		// 非浏览器环境忽略
	}
}

/** 设置自定义服务器地址；返回是否发生变化 */
export function setServerDomain(input: string): { changed: boolean; domain: string; previous: string } {
	const previous = getServerDomain();
	const domain = normalizeServerDomain(input) || BUILD_DOMAIN;
	if (domain === previous) return { changed: false, domain, previous };
	try {
		localStorage.setItem(STORAGE_KEY, domain);
	} catch {
		// 隐私模式等场景下写入失败时忽略
	}
	emitChanged({ domain, previous });
	return { changed: true, domain, previous };
}

/** 恢复构建期默认服务器地址；返回是否发生变化 */
export function resetServerDomain(): { changed: boolean; domain: string; previous: string } {
	const previous = getServerDomain();
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch {
		// ignore
	}
	if (previous !== BUILD_DOMAIN) emitChanged({ domain: BUILD_DOMAIN, previous });
	return { changed: previous !== BUILD_DOMAIN, domain: BUILD_DOMAIN, previous };
}
