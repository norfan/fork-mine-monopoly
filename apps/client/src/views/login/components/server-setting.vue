<script setup lang="ts">
import { computed, ref } from "vue";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { FPMessage } from "@mine-monopoly/ui";
import FpDialog from "@src/components/utils/fp-dialog/fp-dialog.vue";
import {
	buildApiBaseUrl,
	getBuildDomain,
	getServerDomain,
	isUsingCustomServer,
	normalizeServerDomain,
	resetServerDomain,
	setServerDomain,
} from "@src/utils/server-config";

const visible = ref(false);
const inputValue = ref("");
const testing = ref(false);

const currentDomain = computed(() => getServerDomain());
const buildDomain = computed(() => getBuildDomain());
const usingCustom = computed(() => isUsingCustomServer());

function openDialog() {
	inputValue.value = currentDomain.value;
	visible.value = true;
}

/** 清除登录态：切换服务器后原服务器的 token 已失效，避免带着旧 token 请求新服务器 */
function clearAuthState() {
	try {
		localStorage.removeItem("token");
		localStorage.removeItem("refreshToken");
		localStorage.removeItem("user");
	} catch {
		// ignore
	}
}

async function handleTest() {
	const domain = normalizeServerDomain(inputValue.value);
	const base = buildApiBaseUrl(domain);
	testing.value = true;
	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 5000);
		try {
			// 任意 HTTP 响应（含 401）都说明服务器可达
			await fetch(`${base}/game-map/list?page=1&size=1`, { signal: controller.signal });
			FPMessage({ type: "success", message: `连接成功：${base}` });
		} catch (error) {
			FPMessage({
				type: "error",
				message: `连接失败：${base}${error instanceof Error ? `（${error.message}）` : ""}`,
			});
		} finally {
			clearTimeout(timer);
		}
	} finally {
		testing.value = false;
	}
}

function handleSave() {
	const result = setServerDomain(inputValue.value);
	if (!result.changed) {
		FPMessage({ type: "info", message: "服务器地址未变化" });
		return;
	}
	clearAuthState();
	FPMessage({ type: "success", message: `已切换到服务器：${result.domain}，请重新登录` });
	window.location.reload();
}

function handleReset() {
	const result = resetServerDomain();
	if (!result.changed) {
		FPMessage({ type: "info", message: "当前已是默认服务器" });
		return;
	}
	clearAuthState();
	FPMessage({ type: "success", message: `已恢复默认服务器：${result.domain}，请重新登录` });
	window.location.reload();
}
</script>

<template>
	<div class="server-setting">
		<button type="button" class="server-setting-btn" @click="openDialog">
			<FontAwesomeIcon class="icon" icon="server" />
			<span class="server-setting-text">服务器：{{ currentDomain }}</span>
			<FontAwesomeIcon class="icon gear" icon="gear" />
		</button>

		<FpDialog
			v-model:visible="visible"
			title="服务器地址"
			confirm-text="保存并重新登录"
			cancel-text="取消"
			@submit="handleSave"
		>
			<div class="server-form">
				<p class="server-tip">输入游戏服务器的 IP 或域名（同一局域网的电脑可填其局域网 IP），端口保持构建默认。</p>
				<div class="form-item">
					<span class="label">服务器地址</span>
					<input
						v-model="inputValue"
						type="text"
						placeholder="例如 192.168.1.223"
						@keyup.enter="handleSave"
					/>
				</div>
				<div class="server-meta">
					<span>当前：{{ currentDomain }}</span>
					<span v-if="usingCustom">构建默认：{{ buildDomain }}</span>
				</div>
				<div class="server-actions">
					<button type="button" class="server-action-btn test" :disabled="testing" @click="handleTest">
						{{ testing ? "测试中…" : "测试连接" }}
					</button>
					<button v-if="usingCustom" type="button" class="server-action-btn reset" @click="handleReset">
						恢复默认
					</button>
				</div>
			</div>
		</FpDialog>
	</div>
</template>

<style lang="scss" scoped>
.server-setting {
	display: flex;
	justify-content: center;
	padding: 0.4rem 0 0.8rem;
}

.server-setting-btn {
	display: inline-flex;
	align-items: center;
	gap: 0.5rem;
	padding: 0.35rem 0.9rem;
	border: none;
	border-radius: 1rem;
	background-color: rgba(255, 255, 255, 0.45);
	color: #393939;
	font-size: 0.8rem;
	cursor: pointer;
	transition: background-color 0.2s;

	&:hover {
		background-color: rgba(255, 255, 255, 0.7);
	}

	.icon {
		font-size: 0.85rem;
	}

	.gear {
		opacity: 0.6;
	}
}

.server-form {
	display: grid;
	gap: 0.8rem;
	padding: 0 0.3rem;
	min-width: 16rem;
}

.server-tip {
	margin: 0;
	font-size: 0.75rem;
	line-height: 1.5;
	color: #6b6b6b;
}

.form-item {
	display: flex;
	align-items: center;
	gap: 0.6rem;

	.label {
		font-size: 0.85rem;
		color: #393939;
		white-space: nowrap;
	}

	input {
		flex: 1;
		height: 2rem;
		padding: 0 0.6rem;
		border: 1px solid rgba(0, 0, 0, 0.15);
		border-radius: 0.5rem;
		background: rgba(255, 255, 255, 0.8);
		font-size: 0.85rem;
		color: #393939;
		outline: none;

		&:focus {
			border-color: var(--fp-color-primary, #d4a017);
		}
	}
}

.server-meta {
	display: flex;
	justify-content: space-between;
	font-size: 0.7rem;
	color: #8a8a8a;
}

.server-actions {
	display: flex;
	gap: 0.6rem;
}

.server-action-btn {
	padding: 0.3rem 0.9rem;
	border: none;
	border-radius: 0.6rem;
	font-size: 0.75rem;
	cursor: pointer;

	&.test {
		background: rgba(212, 160, 23, 0.85);
		color: #fff;

		&:disabled {
			opacity: 0.6;
			cursor: not-allowed;
		}
	}

	&.reset {
		background: rgba(0, 0, 0, 0.08);
		color: #555;
	}
}
</style>
