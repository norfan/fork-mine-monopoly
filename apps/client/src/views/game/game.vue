<script setup lang="ts">
	import {
		onMounted,
		computed,
		onUnmounted,
		ref,
		onBeforeMount,
		onBeforeUnmount,
		h,
		VNode,
		isVNode,
		render,
		Fragment,
		watch,
	} from "vue";
	import { GameRenderer } from "@src/core/renderer/GameRenderer";
	import { useLoading, useRoomInfo, useUtil } from "@src/store";
	import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
	import router from "@src/router/index";
	import { MonopolyClient, useMonopolyClient, destoryMonopolyClient } from "@src/core/monopoly-client/MonopolyClient";
	import Dices from "./components/dices.vue";
	import ChanceCardContainer from "./components/chance-card-container.vue";
	import CountdownTimer from "./components/countdown-timer.vue";
	import scoreboard from "./components/scoreboard.vue";
	import PlayerContainer from "./components/player-container.vue";
	import GameButtonsPanel from "./components/game-buttons-panel.vue";
import LocalPartyTurnHandoff from "./components/local-party-turn-handoff.vue";
	import { useGameData, useMapData } from "@src/store/game";
	import { useLocalParty, getCurrentClientPlayerId } from "@src/store/local-party";
	import { CustomUI, GameMap, UISchema, MapEventChangedData } from "@mine-monopoly/types";
	import { compileTsToJs } from "@src/utils";
	import { useAudioManager } from "@src/utils/audio/AudioManager";
	import { SoundName } from "@src/utils/audio/types";
	import useEventBus from "@src/utils/event-bus";
	import { FPMessage } from "@mine-monopoly/ui";
	import { FPMessageBox } from "@src/components/utils/fp-message-box";
	import { buildGameInitDiagnostics, wrapGameInitError } from "@src/utils/game-init-diagnostics";
	import { ErrorCategory, logErrorWithOptions } from "@src/utils/log";
	import { storeToRefs } from "pinia";
	import UiRenderer from "@src/components/utils/ui-renderer/ui-renderer.vue";
	import FpErrorBoundary from "@src/components/utils/fp-error-boundary/index.vue";
	import FpDialog from "@src/components/utils/fp-dialog/fp-dialog.vue";
	import { CollapsiblePanel } from "@src/components/collapsible-panel";
	//pinia仓库
	const mapDataStore = useMapData();
	const localPartyStore = useLocalParty();
	const roomInfoStore = useRoomInfo();
	const gameDataStore = useGameData();

	const windowWidth = computed(() => window.innerWidth);
	const windowHeight = computed(() => window.innerHeight);
	const amISpectator = computed(() => roomInfoStore.amISpectator);
	const utilStore = useUtil();

	function handleLocalPartyHandoff() {
		localPartyStore.dismissHandoff();
		utilStore.changeTurn(localPartyStore.activePlayerId === localPartyStore.currentTurnPlayerId);
	}

	// 暂停弹窗可见性：只读投影 gamePaused，禁止通过关闭按钮/遮罩点击关闭（只能点"继续游戏"）
	const pauseDialogVisible = computed({
		get: () => utilStore.gamePaused,
		set: () => {},
	});

	// 暂停弹窗上的"继续游戏"：房主直接恢复，其他玩家请求房主代为恢复
	function handleResumeGame() {
		socketClient?.resumeGame();
	}

	const currentPlayerId = computed(() => getCurrentClientPlayerId());
	const gameDataState = computed(() => gameDataStore.$state);

	/** host-message-handlers 统一现金事件负载（双轨模式"已支付"确认） */
	interface CashEventPayload {
		playerId: string;
		playerName: string;
		amount: number;
		counterparty?: string;
		isCost: boolean;
	}

	let socketClient: MonopolyClient;
	let gameRenderer: GameRenderer | null;
	const islockingCamera = ref(true);
	const lockCameraIcon = computed(() => (islockingCamera.value ? "fa-video" : "fa-video-slash"));

	function handleToggleLockCamera() {
		if (gameRenderer) islockingCamera.value = gameRenderer.toggleLockCamera();
	}

	function handleRollDice() {
		if (socketClient) {
			// 实体骰子模式：弹出点数输入面板，由玩家输入实体骰子总点数(2-12)
			if (localPartyStore.isActive && localPartyStore.tabletop.diceMode === "manual") {
				manualDiceVisible.value = true;
				return;
			}
			socketClient.rollDice();
		}
	}

	// ---- 实体骰子输入（桌游档 manual 模式）----
	const manualDiceVisible = ref(false);
	const manualDiceValue = ref(7);

	function submitManualDice() {
		if (!socketClient) return;
		const value = Math.round(manualDiceValue.value);
		if (value < 2 || value > 12) {
			manualDiceValue.value = Math.max(2, Math.min(12, value));
		}
		socketClient.rollDice(Math.max(2, Math.min(12, Math.round(manualDiceValue.value))));
		manualDiceVisible.value = false;
	}

	function closeManualDice() {
		manualDiceVisible.value = false;
	}

	// ---- 桌游档实体动作确认（已支付/已移动）与回合内撤销 ----
	/** 钞票双轨（cashMode=cash）：支付发生时要求玩家当面交付实体钞票后点"已支付"确认 */
	const payConfirmVisible = ref(false);
	const payConfirmInfo = ref<{ payer: string; target: string; amount: number; isGain: boolean } | null>(null);
	/** 桌游档（mode=board）：玩家在实体棋盘移动棋子后点"已移动"确认 */
	const moveConfirmVisible = ref(false);
	const moveConfirmInfo = ref<{ player: string; mapItemName: string } | null>(null);
	/** 当前是否处于可操作的真人回合（交接确认后解锁，AI 回合锁定） */
	const canUndoThisTurn = computed(() => localPartyStore.isActive && !!localPartyStore.activePlayerId);

	function handlePayConfirmed() {
		payConfirmVisible.value = false;
		payConfirmInfo.value = null;
	}

	function handleMoveConfirmed() {
		moveConfirmVisible.value = false;
		moveConfirmInfo.value = null;
	}

	/** 操作条"确认移动"：真人回合内可点；有待确认移动浮层则完成确认，否则提示无待确认项 */
	function handleConfirmMoveAction() {
		if (!localPartyStore.activePlayerId) return;
		if (moveConfirmVisible.value) {
			handleMoveConfirmed();
			return;
		}
		FPMessage({ type: "info", message: "当前没有待确认的移动，请先在手机上掷骰并结算移动" });
	}

	/** 操作条"确认支付"：真人回合内可点；有待确认支付浮层则完成确认，否则提示无待确认项 */
	function handleConfirmPayAction() {
		if (!localPartyStore.activePlayerId) return;
		if (payConfirmVisible.value) {
			handlePayConfirmed();
			return;
		}
		FPMessage({ type: "info", message: "当前没有待确认的支付，请先完成游戏内支付流程" });
	}

	/** 撤销上一步：仅当前回合内，关闭未提交的确认浮层/重开骰子输入；回合结束锁定 */
	function handleUndoLastStep() {
		if (!canUndoThisTurn.value) return;
		if (payConfirmVisible.value) {
			payConfirmVisible.value = false;
			payConfirmInfo.value = null;
			FPMessage({ type: "info", message: "已撤销本次支付确认，请核对实体钞票后重新确认" });
			return;
		}
		if (moveConfirmVisible.value) {
			moveConfirmVisible.value = false;
			moveConfirmInfo.value = null;
			FPMessage({ type: "info", message: "已撤销本次移动确认，请重新移动实体棋子" });
			return;
		}
		if (manualDiceVisible.value) {
			manualDiceVisible.value = false;
			FPMessage({ type: "info", message: "已撤销本次骰子输入，可重新掷骰" });
			return;
		}
		FPMessage({ type: "info", message: "当前没有可撤销的上一步操作" });
	}

	// ---- 桌游档实体动作确认的事件监听（注册/注销于 onMounted/onBeforeUnmount）----
	/** 双轨现金模式：真人玩家发生支付/收款时，弹"请当面交付实体钞票"确认浮层 */
	function handleCashEventForPayConfirm(payload: CashEventPayload) {
		if (!localPartyStore.isActive) return;
		if (localPartyStore.tabletop.cashMode !== "cash") return;
		// 只对当前持机真人（已确认交接）的现金变动要求确认；AI 内部记账不打断
		if (payload.playerId !== localPartyStore.activePlayerId) return;
		payConfirmInfo.value = {
			payer: payload.isCost ? payload.playerName : payload.counterparty || "银行",
			target: payload.isCost ? payload.counterparty || "银行" : payload.playerName,
			amount: payload.amount,
			isGain: !payload.isCost,
		};
		payConfirmVisible.value = true;
	}

	/** 本真人回合是否已弹过移动确认（一次掷骰移动可能被 worker 拆成多个移动事件广播，每回合只提示一次） */
	let moveConfirmShownThisTurn = false;

	/** 桌游档：真人玩家移动棋子后，弹"请在实体棋盘移动棋子"确认浮层。仅当前回合真人，且本回合未弹过 */
	function handleWalkForBoardConfirm(
		walkPlayerId: string,
		_step: number,
		_walkId: string,
		_totalSteps?: number,
		startStep?: number,
	) {
		if (!localPartyStore.isActive) return;
		if (localPartyStore.tabletop.mode !== "board") return;
		if (walkPlayerId !== localPartyStore.activePlayerId) return;
		// 移动广播晚于回合切换到达时（currentTurnPlayerId 已切走）不再弹，避免 AI 回合残留确认浮层
		if (walkPlayerId !== localPartyStore.currentTurnPlayerId) return;
		if (moveConfirmShownThisTurn) return;
		if (startStep !== undefined && startStep > 1) return;
		moveConfirmShownThisTurn = true;
		moveConfirmInfo.value = { player: walkPlayerId, mapItemName: "" };
		moveConfirmVisible.value = true;
	}

	/** 离开真人回合（含交接前）关闭待确认浮层并允许下回合重新提示。本地派对 GameData 不触发 game-currentPlayerIdInRound，改用 currentTurnPlayerId 监听。
	 *  移动确认与骰子输入随回合走；"实体钞票·已支付"是账实核对，跨回合保留直到玩家确认，避免超时静默丢失。 */
	function closePendingConfirmOnTurnLeave(newPlayerId: string) {
		if (!localPartyStore.isActive) return;
		if (newPlayerId !== localPartyStore.activePlayerId) {
			moveConfirmVisible.value = false;
			moveConfirmShownThisTurn = false;
		}
	}

	watch(
		() => localPartyStore.currentTurnPlayerId,
		(newPlayerId) => closePendingConfirmOnTurnLeave(newPlayerId || ""),
	);

	/** 回合切换：进入真人回合时无额外动作（移动确认由移动首段触发）；离开真人回合时关闭待确认浮层（双保险，事件通道若可用也会触发） */
	function handleRoundChangeLockUndo(newPlayerId: string) {
		closePendingConfirmOnTurnLeave(newPlayerId);
	}

	function renderInitFailureDialog(lines: string[]) {
		return h("div", { style: "max-width: 44rem;" }, [
			h(
				"div",
				{
					style: "margin-bottom: 0.75rem; font-weight: 600; color: var(--fp-color-primary, #333);",
				},
				"初始化失败。请截图下面完整内容发给开发者。",
			),
			h(
				"pre",
				{
					style: [
						"margin: 0",
						"padding: 0.9rem 1rem",
						"border-radius: 0.5rem",
						"background: rgba(0, 0, 0, 0.06)",
						"white-space: pre-wrap",
						"word-break: break-word",
						"overflow-wrap: anywhere",
						"font-size: 0.92rem",
						"line-height: 1.55",
					].join("; "),
				},
				lines.join("\n"),
			),
		]);
	}

	onMounted(async () => {
		try {
			socketClient = useMonopolyClient();
			useLoading().showLoading("加载数据中...");

			// 暂停心跳检测，避免加载期间误判断连
			socketClient.sendLoadingStarted();
			socketClient.pauseHeartBeat();

			const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;
			const container = document.getElementsByClassName("game-page")[0] as HTMLDivElement;
			if (!canvas || !container) {
				throw wrapGameInitError("game-page-mounted", new Error("游戏画布元素未找到"));
			}
			const mapData = JSON.parse(JSON.stringify(mapDataStore.$state)) as GameMap;
			gameRenderer = new GameRenderer(canvas, container, mapData);
			await gameRenderer.init();

				// 注册金钱粒子系统
			// 恢复心跳检测
			socketClient.resumeHeartBeat();

			useEventBus().on("game:init", () => {
				if (!amISpectator.value) void socketClient.gameInitFinished();
			});

			if (amISpectator.value) {
				useLoading().hideLoading();
			} else {
				useLoading().showLoading("数据加载完成，等待其他玩家加载...");
				socketClient.gameInitFinished();
			}

			// 监听玩家金钱变化事件
			const audioManager = useAudioManager();
			const eventBus = useEventBus();
			eventBus.on("player-money", (playerId: string, oldMoney: number, newMoney: number) => {
				if (newMoney > oldMoney) {
					audioManager.playSound(SoundName.GAIN_MONEY);
				} else if (newMoney < oldMoney) {
					audioManager.playSound(SoundName.LOSE_MONEY);
				}
			});

			// 监听动态地图事件变更
			eventBus.on("map-event-changed", (data: MapEventChangedData) => {
				if (!gameRenderer) return;
				switch (data.action) {
					case "link":
						if (data.mapEvent && data.mapItemId) {
							gameRenderer.addEventIcon(data.mapItemId, data.mapEvent);
							gameRenderer.setMapItemEventUserData(data.mapItemId, data.mapEvent);
						}
						break;
					case "add":
						if (data.mapEvent) {
							const linkedItem = mapDataStore.mapItems.find((m) => m.mapEventId === data.mapEvent!.id);
							if (linkedItem) {
								gameRenderer.addEventIcon(linkedItem.id, data.mapEvent);
								gameRenderer.setMapItemEventUserData(linkedItem.id, data.mapEvent);
							}
						}
						break;
					case "remove":
						if (data.mapEventId) {
							// 移除所有关联此事件的地块上的图标
							for (const item of mapDataStore.mapItems) {
								if (item.mapEventId === data.mapEventId) {
									gameRenderer.removeEventIcon(item.id);
									gameRenderer.setMapItemEventUserData(item.id, null);
								}
							}
						}
						break;
					case "unlink":
						if (data.mapItemId) {
							gameRenderer.removeEventIcon(data.mapItemId);
							gameRenderer.setMapItemEventUserData(data.mapItemId, null);
						}
						break;
				}
			});

			// ---- 桌游档实体动作确认（双轨现金"已支付"/桌游档"已移动"）----
			eventBus.on("game:cash-event", handleCashEventForPayConfirm);
			eventBus.on("player-walk", handleWalkForBoardConfirm);
			eventBus.on("player-tp", handleWalkForBoardConfirm);
			eventBus.on("game-currentPlayerIdInRound", handleRoundChangeLockUndo);
		} catch (e: any) {
			// 异常时也要恢复心跳，防止永久暂停
			socketClient?.resumeHeartBeat();
			const diagnostics = buildGameInitDiagnostics(e, {
				mapName: mapDataStore.info?.name || "unknown",
				route: window.location.pathname,
			});
			void socketClient?.gameInitFailed(diagnostics.rawMessage);
			console.error("[GameInitFailure]", diagnostics, e);
			logErrorWithOptions({
				category: ErrorCategory.UI_RENDER,
				type: diagnostics.errorCode,
				message: diagnostics.logMessage,
				error:
					e instanceof Error
						? e
						: diagnostics.logStack
							? ({ message: diagnostics.rawMessage, stack: diagnostics.logStack } as Error)
							: undefined,
				extraInfo: diagnostics.extraInfo,
				context: diagnostics.context,
			});
			useLoading().hideLoading();
			await FPMessageBox({
				title: "游戏初始化失败",
				content: renderInitFailureDialog(diagnostics.lines),
				confirmText: "返回房间",
				showCancel: false,
			}).catch(() => {});
			router.replace({ name: "room-router" });
		}
	});

	onBeforeUnmount(() => {
		if (gameRenderer) gameRenderer.destroy();
		gameRenderer = null;
		// 清理桌游档确认浮层的全局事件监听
		const eventBus = useEventBus();
		eventBus.remove("game:cash-event", handleCashEventForPayConfirm);
		eventBus.remove("player-walk", handleWalkForBoardConfirm);
		eventBus.remove("player-tp", handleWalkForBoardConfirm);
		eventBus.remove("game-currentPlayerIdInRound", handleRoundChangeLockUndo);
		// 只有在真正离开房间时才销毁 MonopolyClient（安全模式回房间时不销毁）
		const nextRoute = router.currentRoute.value.name;
		if (nextRoute !== "room") {
			destoryMonopolyClient();
		}
	});

	function getUiTemplateById(id: string) {
		return (
			useMapData().getUITempolateById(id)?.template || { id: "404", type: "text", content: `找不到ID为: ${id} 的UI组件` }
		);
	}
</script>

<template>
	<FpErrorBoundary>
		<div class="game-page">
			<!-- 桌游档：隐藏数字棋盘渲染，提示玩家在实体棋盘操作 -->
			<div v-if="localPartyStore.isActive && localPartyStore.tabletop.mode === 'board'" class="tabletop-board-mask">
				<div class="tabletop-board-tip">
					<FontAwesomeIcon icon="chess-board" />
					<span>桌游档 · 请在实体棋盘上移动棋子</span>
				</div>
			</div>
			<canvas v-show="!(localPartyStore.isActive && localPartyStore.tabletop.mode === 'board')" id="game-canvas" :width="windowWidth" :height="windowHeight"></canvas>
			<div class="ui-container">
				<CollapsiblePanel
					v-for="ui in mapDataStore.customUIs"
					:key="ui.id"
					mode="slide"
					edge="auto"
					grip-side="inside"
					z-index="var(--z-ui)"
					class="custom-ui-collapsible"
					:style="{
						gridArea: `${ui.layout.y + 1} / ${ui.layout.x + 1} / span ${ui.layout.height} / span ${ui.layout.width}`,
					}"
				>
					<UiRenderer
						:schema="getUiTemplateById(ui.uiSchema)"
						:context="{
							...gameDataState,
							currentPlayer: gameDataStore.myGameInfo
						}"
					/>
				</CollapsiblePanel>

				<PlayerContainer />

				<div class="tool-bar ui-item">
					<button class="border-button lock-camera" @click="handleToggleLockCamera">
						<FontAwesomeIcon :icon="lockCameraIcon" />
					</button>
				</div>

				<ChanceCardContainer />

				<!-- 游戏按钮面板：包含骰子按钮和动态按钮 -->
				<GameButtonsPanel
					:player-id="currentPlayerId"
					title="操作面板"
					:spectator-message="amISpectator ? '你正在旁观本局，游戏操作将完全由 AI 自行完成。' : ''"
					@rollDice="handleRollDice"
				/>

				<!-- 桌游档实体动作操作条：仅在本地派对显示；[确认移动] 桌游档、[确认支付] 双轨钞票、[撤销] 回合内 -->
				<div v-if="localPartyStore.isActive && !amISpectator" class="tabletop-action-bar">
					<button
						v-if="localPartyStore.tabletop.mode === 'board'"
						class="border-button tabletop-action-btn"
						:disabled="!localPartyStore.activePlayerId"
						@click="handleConfirmMoveAction"
					>
						<FontAwesomeIcon icon="chess-board" />
						确认移动
					</button>
					<button
						v-if="localPartyStore.tabletop.cashMode === 'cash'"
						class="border-button tabletop-action-btn"
						:disabled="!localPartyStore.activePlayerId"
						@click="handleConfirmPayAction"
					>
						<FontAwesomeIcon icon="hand-holding-dollar" />
						确认支付
					</button>
					<button class="border-button tabletop-action-btn" :disabled="!localPartyStore.activePlayerId" @click="handleUndoLastStep">
						<FontAwesomeIcon icon="rotate-left" />
						撤销
					</button>
				</div>

				<teleport to="body">
					<CountdownTimer />
				</teleport>
			</div>

			<LocalPartyTurnHandoff
				v-if="localPartyStore.isActive"
				:visible="localPartyStore.handoffVisible"
				:player-name="localPartyStore.activePlayerName"
				@continue="handleLocalPartyHandoff"
			/>

			<!-- 实体骰子输入：玩家在实体棋盘掷骰后，把总点数(2-12)输入手机结算 -->
			<FpDialog v-model:visible="manualDiceVisible" title="输入实体骰子点数" hidden-footer>
				<div class="manual-dice-content">
					<p class="manual-dice-desc">请将实体骰子掷出的总点数输入（2-12），手机将按该点数结算移动。</p>
					<div class="manual-dice-grid">
						<button
							v-for="n in [2,3,4,5,6,7,8,9,10,11,12]"
							:key="n"
							class="manual-dice-num"
							:class="{ active: manualDiceValue === n }"
							@click="manualDiceValue = n"
						>{{ n }}</button>
					</div>
					<div class="manual-dice-actions">
						<button class="manual-dice-cancel" @click="closeManualDice">取消</button>
						<button class="manual-dice-confirm" @click="submitManualDice">确认</button>
					</div>
				</div>
			</FpDialog>

			<!-- 双轨钞票"已支付"确认：真人玩家当面交付实体钞票后确认，手机同步记账。置顶（z-index 高于交接弹窗），跨回合保留直到确认 -->
			<FpDialog v-model:visible="payConfirmVisible" title="实体钞票 · 确认支付" :closable="false" hidden-footer :wrapper-style="{ zIndex: 10001 }">
				<div class="tabletop-confirm-content">
					<p class="tabletop-confirm-desc">
						{{ payConfirmInfo ? (payConfirmInfo.isGain ? `${payConfirmInfo.payer} 向 ${payConfirmInfo.target} 交付` : `${payConfirmInfo.payer} 支付给 ${payConfirmInfo.target}`) : "" }}
						<b>{{ payConfirmInfo?.amount ?? 0 }}</b> 元。
					</p>
					<p class="tabletop-confirm-tip">请当面交付实体钞票，交付完成后点击"已支付"确认，手机将同步记账。</p>
					<div class="tabletop-confirm-actions">
						<button class="tabletop-confirm-cancel" @click="handleUndoLastStep">撤销</button>
						<button class="tabletop-confirm-ok" @click="handlePayConfirmed">已支付</button>
					</div>
				</div>
			</FpDialog>

			<!-- 桌游档"已移动"确认：玩家亲手在实体棋盘移动棋子后确认。置顶（z-index 高于交接弹窗） -->
			<FpDialog v-model:visible="moveConfirmVisible" title="实体棋盘 · 确认移动" :closable="false" hidden-footer :wrapper-style="{ zIndex: 10001 }">
				<div class="tabletop-confirm-content">
					<p class="tabletop-confirm-desc">请在实体棋盘上移动棋子到目标格位。</p>
					<p class="tabletop-confirm-tip">移动完成后点击"已移动"确认，手机将继续结算。</p>
					<div class="tabletop-confirm-actions">
						<button class="tabletop-confirm-cancel" @click="handleUndoLastStep">撤销</button>
						<button class="tabletop-confirm-ok" @click="handleMoveConfirmed">已移动</button>
					</div>
				</div>
			</FpDialog>

			<!-- 金钱粒子系统：放在 ui-container 外部，避免 pointer-events 冲突 -->

			<scoreboard />

			<!-- 游戏暂停弹窗：使用 fp-dialog 统一样式，暂停期间不可关闭，只能点"继续游戏" -->
			<FpDialog v-model:visible="pauseDialogVisible" :closable="false" hidden-footer title="游戏已暂停">
				<div class="pause-dialog-content">
					<FontAwesomeIcon icon="pause" class="pause-dialog-icon" />
					<p class="pause-dialog-desc">处理完其他事情后，点击下方按钮即可继续游戏</p>
					<button class="pause-resume-btn" @click="handleResumeGame">
						<FontAwesomeIcon icon="play" style="margin-right: 0.4rem" />
						继续游戏
					</button>
				</div>
			</FpDialog>
		</div>
	</FpErrorBoundary>
</template>

<style lang="scss" scoped>
/* 桌游档：实体棋盘提示遮罩 */
.tabletop-board-mask {
	position: absolute;
	inset: 0;
	z-index: var(--z-ui, 100);
	display: flex;
	align-items: flex-start;
	justify-content: center;
	pointer-events: none;
}

.tabletop-board-tip {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	margin-top: 1.2rem;
	padding: 0.6rem 1.2rem;
	background: rgba(255, 255, 255, 0.92);
	border: 0.15rem solid var(--fp-color-primary, #2563eb);
	border-radius: 0.8rem;
	box-shadow: 0 0.3rem 0.8rem rgba(0, 0, 0, 0.18);
	color: var(--fp-color-primary, #2563eb);
	font-size: 0.95rem;
	font-weight: 600;
}

/* 实体骰子输入 */
.manual-dice-content {
	display: flex;
	flex-direction: column;
	gap: 1rem;
	user-select: none;
}

.manual-dice-desc {
	margin: 0;
	font-size: 0.92rem;
	color: var(--fp-color-tertiary);
	line-height: 1.6;
}

.manual-dice-grid {
	display: grid;
	grid-template-columns: repeat(6, 1fr);
	gap: 0.5rem;
}

.manual-dice-num {
	height: 2.6rem;
	border: 1px solid #d1d5db;
	border-radius: 0.5rem;
	background: #fff;
	color: #4b5563;
	font-size: 1.1rem;
	font-weight: 600;
	cursor: pointer;
	transition: all 0.15s ease;
}

.manual-dice-num.active {
	background: var(--fp-color-primary, #2563eb);
	border-color: var(--fp-color-primary, #2563eb);
	color: #fff;
}

.manual-dice-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.6rem;
}

.manual-dice-cancel,
.manual-dice-confirm {
	padding: 0.5rem 1.4rem;
	border-radius: 0.5rem;
	font-size: 0.95rem;
	cursor: pointer;
	border: none;
}

.manual-dice-cancel {
	background: #e5e7eb;
	color: #374151;
}

.manual-dice-confirm {
	background: var(--fp-color-primary, #2563eb);
	color: #fff;
}

/* 暂停弹窗内容（fp-dialog 内） */
.pause-dialog-content {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.9rem;
	text-align: center;
	user-select: none;
}

.pause-dialog-icon {
	font-size: 2.2rem;
	color: var(--fp-color-primary);
}

.pause-dialog-desc {
	margin: 0;
	font-size: 1rem;
	color: var(--fp-color-tertiary);
}

.pause-resume-btn {
	padding: 0.6rem 1.8rem;
	border: none;
	border-radius: 0.6rem;
	background: var(--fp-color-primary);
	color: #fff;
	font-size: 1.05rem;
	font-weight: 600;
	cursor: pointer;
	transition: opacity 0.2s;
}

.pause-resume-btn:hover {
	opacity: 0.9;
}

.game-page {
	position: relative;
	width: 100%;
	height: 100%;
	background-color: #ffffff;
	user-select: none;
}

.border-button {
	border-style: solid;
	border-color: rgba($color: #ffffff, $alpha: 0.5);
	border-radius: 0.8rem;

	&.lock-camera {
		border-width: 0.25rem;
		font-size: 1.2em;
		width: 4rem;
		height: 4rem;
	}
}

.ui-container,
#game-canvas {
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
}

#game-canvas {
	z-index: var(--z-game);
	display: block;
}

.ui-container {
	pointer-events: none;
	display: grid;
	grid-template-columns: repeat(32, 1fr);
	grid-template-rows: repeat(20, 1fr);

	/* 自定义 UI 收放容器：grid item 定位上下文（把手 absolute 相对它）；
	   显式 height: 100% 让面板高度固定为网格单元（grid item 百分比高相对网格区域），
	   保证内部 height: 100% 链路生效、内容不撑破单元格 */
	.custom-ui-collapsible {
		position: relative;
		height: 100%;
	}

	.ui-item {
		position: absolute;

		&.tool-bar {
			position: absolute;
			right: 0;
			top: 0;
			display: none;
			justify-content: space-between;
			pointer-events: none;
		}
	}

	& * {
		pointer-events: initial;
	}
}

/* 桌游档实体动作操作条：置于右下操作面板上方 */
.tabletop-action-bar {
	position: absolute;
	right: 1rem;
	bottom: 12.5rem;
	z-index: var(--z-ui, 100);
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	align-items: stretch;
}

.tabletop-action-btn {
	padding: 0.55rem 1.1rem;
	border: 0.15rem solid rgba(255, 255, 255, 0.5);
	border-radius: 0.8rem;
	background-color: rgba(255, 255, 255, 0.92);
	box-shadow: var(--fp-shadow-depth, 0 0.3rem 0.8rem rgba(0, 0, 0, 0.15));
	color: var(--fp-color-primary, #2563eb);
	font-size: 0.92rem;
	font-weight: 600;
	white-space: nowrap;
	cursor: pointer;
	transition: opacity 0.15s ease;

	&:disabled {
		opacity: 0.45;
		cursor: not-allowed;
	}

	&:not(:disabled):hover {
		opacity: 0.85;
	}

	svg {
		margin-right: 0.35rem;
	}
}

/* 实体动作确认浮层内容（双轨已支付 / 桌游已移动） */
.tabletop-confirm-content {
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
	user-select: none;
}

.tabletop-confirm-desc {
	margin: 0;
	font-size: 1.02rem;
	color: var(--fp-color-tertiary);
	line-height: 1.6;

	b {
		color: var(--fp-color-primary, #2563eb);
		font-size: 1.15rem;
	}
}

.tabletop-confirm-tip {
	margin: 0;
	font-size: 0.9rem;
	color: var(--fp-color-text-secondary, #6b7280);
	line-height: 1.6;
}

.tabletop-confirm-actions {
	display: flex;
	justify-content: flex-end;
	gap: 0.6rem;
	margin-top: 0.2rem;
}

.tabletop-confirm-cancel,
.tabletop-confirm-ok {
	padding: 0.5rem 1.4rem;
	border: none;
	border-radius: 0.5rem;
	font-size: 0.95rem;
	cursor: pointer;
}

.tabletop-confirm-cancel {
	background: #e5e7eb;
	color: #374151;
}

.tabletop-confirm-ok {
	background: var(--fp-color-primary, #2563eb);
	color: #fff;
	font-weight: 600;
}

</style>
