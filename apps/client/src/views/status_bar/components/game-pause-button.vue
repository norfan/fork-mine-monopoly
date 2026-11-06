<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { useUtil } from "@src/store";
import { useMonopolyClient } from "@src/core/monopoly-client/MonopolyClient";

const route = useRoute();
const utilStore = useUtil();

// 只在游戏中显示，与 3D / 2D 视图切换按钮保持一致
const visible = computed(() => route.name === "game");
const isPaused = computed(() => utilStore.gamePaused);
const title = computed(() =>
	isPaused.value
		? "游戏已暂停（点击继续游戏）"
		: "暂停游戏（方便查看棋盘、地块详情与游戏记录）",
);

/** 复用已有暂停协议：房主直接执行，其他玩家的请求由房主代为执行 */
function togglePause() {
	const socketClient = useMonopolyClient();
	if (!socketClient) return;
	if (isPaused.value) {
		socketClient.resumeGame();
	} else {
		socketClient.pauseGame();
	}
}
</script>

<template>
	<button
		v-if="visible"
		class="game-pause-button btn-small"
		:class="{ 'is-paused': isPaused }"
		:title="title"
		:aria-label="title"
		@click="togglePause"
	>
		<FontAwesomeIcon :icon="isPaused ? 'play' : 'pause'" />
	</button>
</template>

<style lang="scss" scoped>
.game-pause-button {
	height: 2.5rem;
	width: 2.5rem;
	border-radius: 0.5rem;
	font-size: 1.1rem;
	display: flex;
	justify-content: center;
	align-items: center;

	// 暂停中保持高亮，让用户一眼看出当前状态与「继续」入口
	&.is-paused {
		--btn-bg: var(--fp-color-primary);
		box-shadow:
			0 0.15rem 0 color-mix(in srgb, var(--btn-bg), black 20%),
			0 0 0 0.1875rem rgba(255, 255, 255, 0.55);
	}
}
</style>
