// 盛世唐朝地图内容（纯数据，无副作用）
// 结构：40 格经典外环（11×11 网格周长）+ 8 道 × 3 地产 + 12 特殊格 + 12 机会卡 + 6 角色
// 事件效果代码依赖 tang-extra-libs.txt（游戏启动时随地图注入编译）

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..", "..");

export const CELL_COUNT = 40;

/** 11×11 网格周长上的第 i 格坐标（0=起点大明宫，顺时针） */
export function cellPos(i) {
	if (i <= 10) return { x: i, y: 0, side: "bottom" };
	if (i <= 20) return { x: 10, y: i - 10, side: "right" };
	if (i <= 30) return { x: 30 - i, y: 10, side: "top" };
	return { x: 0, y: 40 - i, side: "left" };
}

/** 所属边旋转角：底 0 / 右 1 / 顶 2 / 左 3 */
export function sideRotation(side) {
	return side === "bottom" ? 0 : side === "right" ? 1 : side === "top" ? 2 : 3;
}

/** 地产展示格（property 载体）位置：向外侧偏移一格 */
export function holderPos(i) {
	const { x, y, side } = cellPos(i);
	if (side === "bottom") return { x, y: -1 };
	if (side === "right") return { x: 11, y };
	if (side === "top") return { x, y: 11 };
	return { x: -1, y };
}

/** 8 个「道」：每组 3 格地产，价格递增 */
const GROUPS = [
	{ key: "guannei", name: "关内道·苑囿", color: "#c9a227", sell: 800, names: ["上林苑", "禁苑桃林", "芙蓉园"] },
	{ key: "jingji", name: "京畿道·市坊", color: "#b03a2e", sell: 1000, names: ["东市金市", "西市胡商", "崇仁坊"] },
	{ key: "henan", name: "河南道·桑蚕", color: "#c76b98", sell: 1200, names: ["陈留桑林", "许昌蚕坊", "汴州绸行"] },
	{ key: "hedong", name: "河东道·盐铁", color: "#5d7a9e", sell: 1400, names: ["解县盐井", "蒲州铁坊", "安邑盐屯"] },
	{ key: "hebei", name: "河北道·瓷陶", color: "#7fb3c8", sell: 1600, names: ["邢窑白瓷", "定窑刻花", "井陉陶坊"] },
	{ key: "huainan", name: "淮南道·稻渔", color: "#c9a84a", sell: 1800, names: ["广陵稻浪", "漕运粮仓", "洪泽渔浦"] },
	{ key: "jiangnan", name: "江南道·绫绣", color: "#5d9e5d", sell: 2000, names: ["金陵织坊", "苏州绣庄", "余杭桑陌"] },
	{ key: "jiannan", name: "剑南道·锦茶", color: "#8e6bb8", sell: 2400, names: ["成都锦官城", "蒙顶茶山", "浣花溪坊"] },
];

/** 每组占据的环上格号（每侧 2 组 × 3 格） */
const GROUP_CELLS = [
	[2, 3, 4], [6, 7, 8],
	[12, 13, 14], [16, 17, 18],
	[22, 23, 24], [26, 27, 28],
	[32, 33, 34], [36, 37, 38],
];

/** 特殊格 */
const CHANCE_CELLS = [1, 11, 15, 21, 31, 35];
const FATE_CELLS = [5, 19, 25, 39];
const TAX_CELLS = [9, 29];

/** 4 个角格 */
const CORNERS = {
	0: { type: "t-corner-gong", name: "起点·大明宫" },
	10: { type: "t-corner-yu", name: "大理寺" },
	20: { type: "t-corner-chi", name: "曲江池" },
	30: { type: "t-corner-zhou", name: "贬谪崖州" },
};

const ROUND10 = (n) => Math.round(n / 10) * 10;
const costListOf = (sell) => [0.08, 0.18, 0.4, 0.8, 1.35].map((r) => ROUND10(sell * r));
const buildCostOf = (sell) => ROUND10(sell * 0.55);

/** 系统默认阶段（与 map-editor getInitPhase 同构） */
function readDefaultCode(name) {
	const dir = join(
		PROJECT_ROOT,
		"apps/map-editor/src/views/map-editor/components/manager/process-manager/default-code",
	);
	return readFileSync(join(dir, name), "utf8");
}

function getInitPhase() {
	const phase = (id, name, description, mark, code) => ({ id, name, description, from: "系统", mark, initEventCode: code });
	const P = {
		GAME_OVER_RULE: "sys-phase-game-over-rule",
		GAME_INITED: "sys-phase-game-inited",
		GAME_ROUND_START: "sys-phase-game-round-start",
		PLAYER_ROUND_START: "sys-phase-player-round-start",
		ROLL_DICE: "sys-phase-roll-dice",
		PLAYER_MOVE: "sys-phase-player-move",
		ARRIVED_EVENT: "sys-phase-arrived-event",
		PLAYER_ROUND_END: "sys-phase-player-round-end",
		GAME_ROUND_END: "sys-phase-game-round-end",
		PLAYER_PRE_INIT: "sys-phase-player-pre-init",
		PROPERTY_PRE_INIT: "sys-phase-property-pre-init",
		POST_RESTORE: "sys-phase-post-restore",
	};
	const playerRound = [
		phase(P.PLAYER_ROUND_START, "玩家回合开始", "玩家回合开始阶段", "PlayerRoundStart", readDefaultCode("player-round-start-phase.txt")),
		phase(P.ROLL_DICE, "玩家操作", "玩家操作阶段", "RollDice", readDefaultCode("roll-dice-phase.txt")),
		phase(P.PLAYER_MOVE, "玩家移动", "玩家移动阶段", "PlayerMove", readDefaultCode("player-move-phase.txt")),
		phase(P.ARRIVED_EVENT, "到达事件", "到达事件阶段", "ArrivedEvent", readDefaultCode("arrived-event-phase.txt")),
		phase(P.PLAYER_ROUND_END, "玩家回合结束", "玩家回合结束阶段", "PlayerRoundEnd", readDefaultCode("player-round-end-phase.txt")),
	];
	return {
		gameOverRule: [phase(P.GAME_OVER_RULE, "游戏结束判定规则", "游戏结束判定规则, 返回 false 表示游戏继续", "GameRoundStart", readDefaultCode("game-over-rule.txt"))],
		gameInited: [phase(P.GAME_INITED, "游戏初始化结束", "游戏初始化结束阶段", "GameRoundStart", readDefaultCode("game-inited-phase.txt"))],
		playerPreInit: [{ id: P.PLAYER_PRE_INIT, name: "玩家预初始化", description: "玩家预初始化阶段（在玩家初始化之前运行）", from: "系统", initEventCode: readDefaultCode("player-pre-init-phase.txt") }],
		propertyPreInit: [{ id: P.PROPERTY_PRE_INIT, name: "地皮预初始化", description: "地皮预初始化阶段（在地皮初始化之前运行）", from: "系统", initEventCode: readDefaultCode("property-pre-init-phase.txt") }],
		gameRoundStart: [phase(P.GAME_ROUND_START, "轮次开始", "轮次开始阶段", "GameRoundStart", readDefaultCode("game-round-start-phase.txt"))],
		playerRound,
		gameRoundEnd: [phase(P.GAME_ROUND_END, "轮次结束", "轮次结束阶段", "GameRoundEnd", readDefaultCode("game-round-end-phase.txt"))],
		postRestore: [{ id: P.POST_RESTORE, name: "存档恢复后", description: "存档恢复后阶段", from: "系统", initEventCode: readDefaultCode("post-restore-phase.txt") }],
	};
}

/** 机会卡效果代码片段 */
const card = (body) => `(async (sourcePlayer: IPlayer, target: IPlayer, gameProcess: IGameProcess) => { ${body} });`;

const CHANCE_CARDS = [
	{ id: "card-keju", name: "科举中第", color: "#b03a2e", gain: 2000, description: "春闱高中，皇榜赐钱 2000。" },
	{ id: "card-fushi", name: "赋诗夺魁", color: "#c76b98", gain: 1500, description: "曲江宴上赋诗夺魁，得赏钱 1500。" },
	{ id: "card-silu", name: "丝路贩商", color: "#c9a227", gain: 1800, description: "胡商队丝绸贸易获利 1800。" },
	{ id: "card-wanbang", name: "万邦来朝", color: "#5d7a9e", gain: 1200, description: "万邦来朝，市利分红 1200。" },
	{ id: "card-mazei", name: "遭遇马贼", color: "#5f5e5a", gain: -1000, description: "陇右道上遭遇马贼，损失 1000。" },
	{ id: "card-caoliang", name: "漕粮霉变", color: "#5f5e5a", gain: -800, description: "漕粮霉变，亏折 800。" },
	{ id: "card-tanmo", name: "贪墨获罪", color: "#5f5e5a", gain: -1500, description: "贪墨获罪，罚没 1500。" },
	{ id: "card-guifei", name: "贵妃赏赐", color: "#d4537e", gain: 1000, description: "贵妃赏赐锦缎，折算 1000。" },
];

const ROLES = [
	{ id: "role-libai", name: "李白", color: "#7f77dd", description: "诗仙，自称谪仙人。" },
	{ id: "role-dufu", name: "杜甫", color: "#5d9e5d", description: "诗圣，沉郁顿挫。" },
	{ id: "role-xuanzang", name: "玄奘", color: "#c9a84a", description: "高僧，西行取经。" },
	{ id: "role-yangguifei", name: "杨玉环", color: "#d4537e", description: "贵妃，擅霓裳羽衣。" },
	{ id: "role-guozeyi", name: "郭子仪", color: "#b03a2e", description: "名将，再造唐室。" },
	{ id: "role-gongsun", name: "公孙大娘", color: "#3a7d6e", description: "剑器舞冠绝一时。" },
];
/** 组装完整地图 JSON（jsonData） */
export function buildTangMapData() {
	const mapItemTypes = [];
	const mapItems = [];

	const addType = (id, name, modelId, color) => {
		mapItemTypes.push({ id, name, modelId, color, size: 1 });
		return id;
	};

	// ---- 类型 ----
	for (const [i, corner] of Object.entries(CORNERS)) {
		const color = corner.type === "t-corner-gong" ? "#d4af37"
			: corner.type === "t-corner-yu" ? "#6b6b6b"
			: corner.type === "t-corner-chi" ? "#3a7ca5"
			: "#7a2e2e";
		addType(corner.type, corner.name, "tang-palace", color);
		void i;
	}
	addType("t-chance", "机会·皇榜", "tang-paifang", "#b03a2e");
	addType("t-fate", "命运·风云", "tang-lantern", "#8e6bb8");
	addType("t-tax", "赋税·户部", "tang-wall", "#8a5a3b");
	for (const g of GROUPS) {
		addType(`t-act-${g.key}`, `行动格_${g.name}`, `act-${g.key}`, g.color);
		addType(`t-disp-${g.key}`, `地产展示_${g.name}`, `house-${g.key}-0`, g.color);
	}
	for (const [deco, name, model, color] of [
		["t-deco-palace", "装饰_大明宫", "tang-palace", "#d4af37"],
		["t-deco-pagoda", "装饰_大雁塔", "tang-pagoda", "#c9a227"],
		["t-deco-paifang", "装饰_牌坊", "tang-paifang", "#b03a2e"],
		["t-deco-ting", "装饰_水榭", "tang-ting", "#8a5a3b"],
		["t-deco-boat", "装饰_画舫", "tang-boat", "#c9a227"],
		["t-deco-song", "装饰_松树", "tang-song", "#3b6d11"],
		["t-deco-liu", "装饰_柳树", "tang-liu", "#639922"],
		["t-deco-lantern", "装饰_灯笼", "tang-lantern", "#a32d2d"],
		["t-deco-wall", "装饰_宫墙", "tang-wall", "#e8e0d0"],
		["t-deco-plot", "装饰_地契牌", "tang-plot", "#8a5a3b"],
	]) {
		addType(deco, name, model, color);
	}

	// ---- 40 格外环 ----
	const propertyByCell = new Map();
	GROUPS.forEach((g, gi) => {
		GROUP_CELLS[gi].forEach((cell, n) => propertyByCell.set(cell, { group: g, index: n }));
	});

	const ringIds = [];
	for (let i = 0; i < CELL_COUNT; i++) {
		const { x, y, side } = cellPos(i);
		const id = `item-${i}`;
		ringIds.push(id);
		const rotation = sideRotation(side);

		if (CORNERS[i]) {
			const item = { id, x, y, rotation, type: mapItemTypes.find((t) => t.id === CORNERS[i].type) };
			if (i === 30) item.mapEventId = "evt-exile";
			if (i === 0) item.mapEventId = "evt-salary";
			mapItems.push(item);
			continue;
		}

		const prop = propertyByCell.get(i);
		if (prop) {
			const actType = mapItemTypes.find((t) => t.id === `t-act-${prop.group.key}`);
			mapItems.push({ id, x, y, rotation, type: actType, linkto: `disp-${prop.group.key}-${prop.index}` });
			continue;
		}

		if (CHANCE_CELLS.includes(i)) {
			mapItems.push({ id, x, y, rotation, type: mapItemTypes.find((t) => t.id === "t-chance"), mapEventId: "evt-chance" });
		} else if (FATE_CELLS.includes(i)) {
			mapItems.push({ id, x, y, rotation, type: mapItemTypes.find((t) => t.id === "t-fate"), mapEventId: "evt-fate" });
		} else if (TAX_CELLS.includes(i)) {
			mapItems.push({ id, x, y, rotation, type: mapItemTypes.find((t) => t.id === "t-tax"), mapEventId: "evt-tax" });
		} else {
			throw new Error(`格号 ${i} 未分类`);
		}
	}

	// ---- 24 个地产展示格（property 载体） ----
	// 每道独立的五级建造序列（level 0..4）；房主染色作用于命名 color-wall 的主墙
	const districtBuildModels = (key) => [0, 1, 2, 3, 4].map((lv) => `house-${key}-${lv}`);
	GROUPS.forEach((g, gi) => {
		GROUP_CELLS[gi].forEach((cell, n) => {
			const { x, y } = holderPos(cell);
			const { side } = cellPos(cell);
			const dispType = mapItemTypes.find((t) => t.id === `t-disp-${g.key}`);
			mapItems.push({
				id: `disp-${g.key}-${n}`,
				x,
				y,
				rotation: sideRotation(side),
				type: dispType,
				beLinked: `item-${cell}`,
				property: {
					id: `prop-${g.key}-${n}`,
					name: `${g.name}\n${g.names[n]}`,
					sellCost: g.sell,
					buildCost: buildCostOf(g.sell),
					level: 0,
					maxLevel: 4,
					costList: costListOf(g.sell),
					buildingModelIdList: districtBuildModels(g.key),
					custom: {
						effectCode: '((property: IProperty, gameProcess: IGameProcess) => { property.commandBus.setHandler("property.arrived", async (payload: any) => { await tangArrive(gameProcess, property, payload.arrivedPlayer); return payload; }); });',
						description: `${g.name}地皮：到达后可购置、建造与收取租银`,
					},
				},
			});
		});
	});

	// ---- 装饰 ----
	const addDeco = (x, y, typeId) => {
		mapItems.push({
			id: `deco-${mapItems.length}`,
			x,
			y,
			rotation: 0,
			type: mapItemTypes.find((t) => t.id === typeId),
		});
	};
	// 内环灯笼（隔一格）
	for (const [x, y] of [
		[1, 1], [3, 1], [5, 1], [7, 1], [9, 1],
		[9, 3], [9, 5], [9, 7], [9, 9],
		[7, 9], [5, 9], [3, 9], [1, 9],
		[1, 7], [1, 5], [1, 3],
	]) addDeco(x, y, "t-deco-lantern");
	// 四角松树
	for (const [x, y] of [[2, 2], [8, 2], [2, 8], [8, 8]]) addDeco(x, y, "t-deco-song");
	// 柳树
	for (const [x, y] of [[4, 4], [6, 4], [4, 6], [6, 6]]) addDeco(x, y, "t-deco-liu");
	// 水榭与中央大雁塔
	addDeco(3, 3, "t-deco-ting");
	addDeco(7, 7, "t-deco-ting");
	addDeco(5, 5, "t-deco-pagoda");
	// 四角外侧布景
	addDeco(0, -1, "t-deco-palace"); // 大明宫
	addDeco(10, -1, "t-deco-paifang"); // 大理寺门楼
	addDeco(10, 11, "t-deco-ting"); // 曲江池水榭
	addDeco(9, 11, "t-deco-boat"); // 画舫
	addDeco(0, 11, "t-deco-boat"); // 崖州渡船
	addDeco(1, 11, "t-deco-song");

	// ---- 路径图（V2 有向闭环） ----
	const mapPaths = ringIds.map((id, i) => ({
		id: `path-${i}`,
		fromMapItemId: id,
		toMapItemId: ringIds[(i + 1) % CELL_COUNT],
		initEnable: true,
		name: `${i} → ${(i + 1) % CELL_COUNT}`,
	}));

	// ---- 事件 ----
	const mapEvents = [
		{
			id: "evt-chance",
			name: "皇榜机会",
			type: "ArrivedEvent",
			description: "抽一张机会卡，阅读后执行。",
			effectCode: "(async (player: IPlayer, gameProcess: IGameProcess) => { await tangDraw(gameProcess, player); });",
		},
		{
			id: "evt-fate",
			name: "风云变幻",
			type: "ArrivedEvent",
			description: "命运未知：获赠程仪 / 遭遇盗匪 / 染风寒休整。",
			effectCode: "(async (player: IPlayer, gameProcess: IGameProcess) => { const r = Math.random(); if (r < 0.34) { await player.gain(1500, \"tang_fate\"); gameProcess.messageNotify([player.id], { type: \"success\", content: \"驿站遇故人，获赠程仪 1500\" }); } else if (r < 0.67) { await player.cost(1000, \"tang_fate\"); gameProcess.messageNotify([player.id], { type: \"warning\", content: \"途中遇盗匪，破财 1000\" }); } else { await player.setStop(1); gameProcess.messageNotify([player.id], { type: \"info\", content: \"途中染风寒，休整一回合\" }); } gameProcess.gameDataBroadcast(); });",
		},
		{
			id: "evt-tax",
			name: "户部赋税",
			type: "ArrivedEvent",
			description: "缴纳身户税（现金的 10%，不低于 100）。",
			effectCode: "((player: IPlayer, gameProcess: IGameProcess) => { const tax = Math.max(100, Math.floor(player.money * 0.1)); player.cost(tax, \"tang_tax\"); gameProcess.messageNotify([player.id], { type: \"warning\", content: `缴纳户税 ${tax}` }); gameProcess.gameDataBroadcast(); });",
		},
		{
			id: "evt-salary",
			name: "皇城俸禄",
			type: "PassedEvent",
			description: "经过大明宫领取俸禄 1200。",
			effectCode: "((player: IPlayer, gameProcess: IGameProcess) => { player.gain(1200, \"tang_salary\"); gameProcess.messageNotify([player.id], { type: \"success\", content: \"路过皇城，领俸禄 1200\" }); });",
		},
		{
			id: "evt-exile",
			name: "贬谪崖州",
			type: "ArrivedEvent",
			description: "贬谪崖州，押入大理寺候审。",
			effectCode: "(async (player: IPlayer, gameProcess: IGameProcess) => { gameProcess.messageNotify([player.id], { type: \"warning\", content: \"贬谪崖州！押入大理寺候审\" }); await player.tpToMapItem(\"item-10\"); });",
		},
	];

	const chanceCards = CHANCE_CARDS.map((c) => ({
		id: c.id,
		name: c.name,
		type: "ToSelf",
		description: c.description,
		color: c.color,
		effectCode: c.gain >= 0
			? card(`await tangCash(gameProcess, sourcePlayer, ${c.gain}, "${c.name}");`)
			: card(`await tangCash(gameProcess, sourcePlayer, ${c.gain}, "${c.name}");`),
	}));
	chanceCards.push(
		{
			id: "card-dali",
			name: "得罪权贵",
			type: "ToSelf",
			description: "得罪权贵，押入大理寺。",
			color: "#5f5e5a",
			effectCode: card("await sourcePlayer.tpToMapItem(\"item-10\"); gameProcess.msgNotifyBroadcast(\"info\", sourcePlayer.name + \" 得罪权贵，押入大理寺\");"),
		},
		{
			id: "card-wuqi",
			name: "误期退后",
			type: "ToSelf",
			description: "旅途误期，退后三格。",
			color: "#5f5e5a",
			effectCode: card("await sourcePlayer.walk(-3); gameProcess.messageNotify([sourcePlayer.id], { type: \"info\", content: \"旅途误期，退后三格\" });"),
		},
		{
			id: "card-fofa",
			name: "聆听佛法",
			type: "ToSelf",
			description: "聆听玄奘讲法，驻足一回合。",
			color: "#c9a84a",
			effectCode: card("await sourcePlayer.setStop(1); gameProcess.messageNotify([sourcePlayer.id], { type: \"info\", content: \"聆听佛法，驻足一回合\" });"),
		},
		{
			id: "card-qujiang",
			name: "曲江流饮",
			type: "ToSelf",
			description: "赴曲江池流饮宴，前进至曲江池。",
			color: "#3a7ca5",
			effectCode: card("await sourcePlayer.tpToMapItem(\"item-20\"); gameProcess.messageNotify([sourcePlayer.id], { type: \"success\", content: \"赴曲江池流饮宴\" });"),
		},
	);

	const roles = ROLES.map((r) => ({
		id: r.id,
		name: r.name,
		description: r.description,
		color: r.color,
		imageId: `image-role-${r.id.replace(/^role-/, "")}`,
		initCode: "((player: IPlayer, gameProcess: IGameProcess) => {});",
	}));

	// ---- 可行走类型 ----
	const walkableTypeIds = [
		...GROUPS.map((g) => `t-act-${g.key}`),
		"t-chance", "t-fate", "t-tax",
		...Object.values(CORNERS).map((c) => c.type),
	];

	return {
		serverMapId: "",
		id: "tang-dynasty-1",
		info: {
			name: "盛世大唐",
			author: "AI 生成",
			version: "1.0.0",
			editorVersion: "1.3.3",
			description: "唐朝主题 40 格经典闭环：八道地产廿四格、皇榜机会、风云命运、户部赋税，十二机会卡与六位唐人角色，系统默认阶段开箱即玩。四角为大明宫（起点）、大理寺、曲江池与贬谪崖州。",
			pendingChangelog: "",
			changelog: [],
			backgroundImageId: "image-tang-bg",
			coverImageId: "image-tang-cover",
		},
		mapItems,
		startMapItemId: "item-0",
		chanceCards,
		mapItemTypes,
		mapPaths,
		pathMapItemTypeIds: walkableTypeIds,
		mapIndex: ringIds,
		roles,
		inUse: false,
		mapEvents,
		phases: getInitPhase(),
		buildingModelIdList: GROUPS[0] ? districtBuildModels(GROUPS[0].key) : [],
		uiTemplates: [],
		modifierTemplates: [],
		customUIs: [],
		gameSettingForm: [
			{ id: "gs-init-money", key: "initMoney", type: "number-input", label: "初始开元通宝", defaultValue: 10000, min: 0, max: 1000000, builtIn: true },
			{ id: "gs-turn-timeout", key: "turnTimeout", type: "number-input", label: "回合倒计时(秒)", defaultValue: 15, min: 5, max: 120, builtIn: true },
			{ id: "gs-chance-timeout", key: "chanceTimeout", type: "number-input", label: "机会卡阅读时限(秒)", defaultValue: 20, min: 5, max: 120 },
		],
		extraLibs: readFileSync(join(__dirname, "tang-extra-libs.txt"), "utf8"),
	};
}
