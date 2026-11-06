<script setup lang="ts">
import { computed, ref } from "vue";
import { __PROTOCOL__ } from "@src/../global.config";
import { MapEvent } from "@mine-monopoly/types";
import { useResourceStore } from "@src/store/game";

const props = defineProps<{ mapEvent: MapEvent | null; closable?: boolean }>();
const emit = defineEmits(["close"]);

const arrivedEvent = ref<MapEvent | null>(props.mapEvent);

// 转换 \n 为真实换行符
const formattedDescription = computed(() => {
	return arrivedEvent.value?.description.replace(/\\n/g, '\n') || "";
});

function updateArrivedEvent(newArrivedEvent: MapEvent | null) {
	arrivedEvent.value = newArrivedEvent;
}

function handleClose() {
	arrivedEvent.value = null;
	emit("close");
}

defineExpose({ updateArrivedEvent });

const iconUrl = computed(() => {
	if (!arrivedEvent.value) return "qwe";
	return useResourceStore().getRecourceById(arrivedEvent.value.iconId)?.url || "asd";
});
</script>

<template>
	<div v-if="arrivedEvent" class="map-info-popup">
		<button v-if="closable" type="button" class="map-info-close" title="关闭详情" @click.stop="handleClose">×</button>
		<div class="arrived-event-info felt-card">
			<div class="info">
				<img :src="iconUrl" alt="" />
				<span>{{ arrivedEvent.name }}</span>
			</div>
			<div class="description">
				{{ formattedDescription }}
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.map-info-popup {
	position: relative;
}

.map-info-close {
	// 放在浮层内部，避免被 CSS2DRenderer 的 overflow:hidden 裁掉；
	// 内容滚动时按钮保持固定。
	position: absolute;
	top: 0.35rem;
	right: 0.35rem;
	z-index: 3;
	width: 1.6rem;
	height: 1.6rem;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 0.0625rem solid rgba(0, 0, 0, 0.15);
	border-radius: 50%;
	background: #fff;
	color: var(--fp-color-primary);
	font-size: 1.15rem;
	line-height: 1;
	cursor: pointer;
	box-shadow: var(--fp-shadow-md, 0 0.125rem 0.5rem rgba(0, 0, 0, 0.25));

	&:hover {
		background: var(--fp-color-primary);
		color: #fff;
	}
}

.arrived-event-info {
	display: flex;
	max-width: min(30rem, 86vw);
	max-height: 70vh;
	overflow: auto;
	box-sizing: border-box;
	flex-direction: column;
	justify-content: space-around;
	align-items: center;

	.info {
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: var(--el-box-shadow);
		font-size: 1.2rem;
		font-weight: bold;
		border-radius: 0.5rem;
		color: var(--fp-color-primary);
		margin-bottom: 0.6rem;
		text-shadow:
			#fff -0.0625rem 0 0,
			#fff 0.0625rem 0 0,
			#fff 0 0.0625rem 0,
			#fff 0 -0.0625rem 0;

		$icon_size: 1.6em;

		img {
			width: $icon_size;
			height: $icon_size;
			margin-right: 0.3rem;
		}
	}

	.description {
		color: #2b2b2b;
		text-shadow:
			#fff -0.0625rem 0 0,
			#fff 0.0625rem 0 0,
			#fff 0 0.0625rem 0,
			#fff 0 -0.0625rem 0;
		white-space: pre-wrap; /* 保留换行和空格 */
	}
}
</style>
