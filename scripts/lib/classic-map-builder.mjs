// 经典复刻地图通用构建器（神州大地/三国风云/江南水乡共用）
// 结构：40 格经典外环（11×11 网格周长）+ 8 组 × 3 地产 + 机会/命运/赋税 + 四角格
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { getInitPhase } from "./tang-map-data.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const CELL_COUNT = 40;

/** 11×11 网格周长第 i 格（0=起点，顺时针） */
export function cellPos(i) {
	if (i <= 10) return { x: i, y: 0, side: "bottom" };
	if (i <= 20) return { x: 10, y: i - 10, side: "right" };
	if (i <= 30) return { x: 30 - i, y: 10, side: "top" };
	return { x: 0, y: 40 - i, side: "left" };
}

export function sideRotation(side) {
	return side === "bottom" ? 0 : side === "right" ? 1 : side === "top" ? 2 : 3;
}

/** 地产展示格（property 载体）外移一格 */
export function holderPos(i) {
	const { x, y, side } = cellPos(i);
	if (side === "bottom") return { x, y: -1 };
	if (side === "right") return { x: 11, y };
	if (side === "top") return { x, y: 11 };
	return { x: -1, y };
}

const GROUP_CELLS = [
	[2, 3, 4], [6, 7, 8],
	[12, 13, 14], [16, 17, 18],
	[22, 23, 24], [26, 27, 28],
	[32, 33, 34], [36, 37, 38],
];

const CHANCE_CELLS = [1, 11, 15, 21, 31, 35];
const FATE_CELLS = [5, 19, 25, 39];
const TAX_CELLS = [9, 29];

const ROUND10 = (n) => Math.round(n / 10) * 10;
const costListOf = (sell) => [0.08, 0.18, 0.4, 0.8, 1.35].map((r) => ROUND10(sell * r));
const buildCostOf = (sell) => ROUND10(sell * 0.55);

const card = (body) => `(async (sourcePlayer: IPlayer, target: IPlayer, gameProcess: IGameProcess) => { ${body} });`;

/** 装饰布局（内环 8 处） */
const DECO_LAYOUT = [
	["d-0", 5, 5],
	["d-1", 2, 2], ["d-2", 8, 2], ["d-3", 2, 8], ["d-4", 8, 8],
	["d-5", 1, 4], ["d-6", 6, 1], ["d-7", 9, 6],
];

/**
 * 构建一张经典复刻地图
 * cfg: { id, name, description, initMoney, groups, roles, cards, corners, specialLabels,
 *        fate: [good, bad, stop] 三段文案, taxLabel, salaryName, moneyName }
 */
export function buildClassicMap(cfg) {
	const mapItemTypes = [];
	const mapItems = [];
	const addType = (id, name, modelId, color) => {
		mapItemTypes.push({ id, name, modelId, color, size: 1 });
		return id;
	};

	const cornerModel = { start: "m-start", jail: "m-jail", free: "m-free", goto: "m-goto" };
	addType("t-start", `起点·${cfg.corners.start}`, cornerModel.start, "#d4af37");
	addType("t-jail", `禁地·${cfg.corners.jail}`, cornerModel.jail, "#5f5e5a");
	addType("t-free", `驻留·${cfg.corners.free}`, cornerModel.free, "#3a7ca5");
	addType("t-goto", `险地·${cfg.corners.goto}`, cornerModel.goto, "#7a2e2e");
	addType("t-chance", cfg.specialLabels.chance, "m-chance", "#b03a2e");
	addType("t-fate", cfg.specialLabels.fate, "m-fate", "#8e6bb8");
	addType("t-tax", cfg.specialLabels.tax, "m-tax", "#8a5a3b");
	for (const g of cfg.groups) {
		addType(`t-act-${g.key}`, `行动格_${g.name}`, `act-${g.key}`, g.color);
		addType(`t-disp-${g.key}`, `地产展示_${g.name}`, `house-${g.key}-0`, g.color);
	}
	DECO_LAYOUT.forEach(([modelId], i) => {
		addType(`t-d${i}`, `装饰_${modelId}`, modelId, "#6b6b6b");
	});

	// ---- 40 格外环 ----
	const propertyByCell = new Map();
	cfg.groups.forEach((g, gi) => {
		GROUP_CELLS[gi].forEach((cell, n) => propertyByCell.set(cell, { group: g, index: n }));
	});
	const ringIds = [];
	for (let i = 0; i < CELL_COUNT; i++) {
		const { x, y, side } = cellPos(i);
		const id = `item-${i}`;
		ringIds.push(id);
		const rotation = sideRotation(side);
		if (i === 0) {
			mapItems.push({ id, x, y, rotation, type: mapItemTypes.find((t) => t.id === "t-start"), mapEventId: "evt-salary" });
			continue;
		}
		if (CORNERS_IDS[i] === "jail" || CORNERS_IDS[i] === "free" || CORNERS_IDS[i] === "goto") {
			const item = { id, x, y, rotation, type: mapItemTypes.find((t) => t.id === `t-${CORNERS_IDS[i]}`) };
			if (CORNERS_IDS[i] === "goto") item.mapEventId = "evt-goto";
			mapItems.push(item);
			continue;
		}
		const prop = propertyByCell.get(i);
		if (prop) {
			mapItems.push({ id, x, y, rotation, type: mapItemTypes.find((t) => t.id === `t-act-${prop.group.key}`), linkto: `disp-${prop.group.key}-${prop.index}` });
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

	// ---- 24 个地产展示格 ----
	const districtBuildModels = (key) => [0, 1, 2, 3, 4].map((lv) => `house-${key}-${lv}`);
	cfg.groups.forEach((g, gi) => {
		GROUP_CELLS[gi].forEach((cell, n) => {
			const { x, y } = holderPos(cell);
			const { side } = cellPos(cell);
			mapItems.push({
				id: `disp-${g.key}-${n}`,
				x,
				y,
				rotation: sideRotation(side),
				type: mapItemTypes.find((t) => t.id === `t-disp-${g.key}`),
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
						effectCode: '((property: IProperty, gameProcess: IGameProcess) => { property.commandBus.setHandler("property.arrived", async (payload: any) => { await clsArrive(gameProcess, property, payload.arrivedPlayer); return payload; }); });',
						description: `${g.name}地皮：到达后可购置、建造与收取租金`,
					},
				},
			});
		});
	});

	// ---- 装饰 ----
	DECO_LAYOUT.forEach(([modelId, x, y], i) => {
		mapItems.push({ id: `deco-d${i}`, x, y, rotation: 0, type: mapItemTypes.find((t) => t.id === `t-d${i}`) });
		void modelId;
	});

	// ---- 路径 ----
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
			name: cfg.specialLabels.chance,
			type: "ArrivedEvent",
			description: "抽一张机会卡，阅读后执行。",
			effectCode: "(async (player: IPlayer, gameProcess: IGameProcess) => { await clsDraw(gameProcess, player); });",
		},
		{
			id: "evt-fate",
			name: cfg.specialLabels.fate,
			type: "ArrivedEvent",
			description: cfg.fate[3],
			effectCode: `(async (player: IPlayer, gameProcess: IGameProcess) => { const r = Math.random(); if (r < 0.34) { await player.gain(1500, "cls_fate"); gameProcess.messageNotify([player.id], { type: "success", content: "${cfg.fate[0]}" }); } else if (r < 0.67) { await player.cost(1000, "cls_fate"); gameProcess.messageNotify([player.id], { type: "warning", content: "${cfg.fate[1]}" }); } else { await player.setStop(1); gameProcess.messageNotify([player.id], { type: "info", content: "${cfg.fate[2]}" }); } gameProcess.gameDataBroadcast(); });`,
		},
		{
			id: "evt-tax",
			name: cfg.specialLabels.tax,
			type: "ArrivedEvent",
			description: `缴纳${cfg.taxLabel}（现金的 10%，不低于 100）。`,
			effectCode: `((player: IPlayer, gameProcess: IGameProcess) => { const tax = Math.max(100, Math.floor(player.money * 0.1)); player.cost(tax, "cls_tax"); gameProcess.messageNotify([player.id], { type: "warning", content: \`缴纳${cfg.taxLabel} \${tax}\` }); gameProcess.gameDataBroadcast(); });`,
		},
		{
			id: "evt-salary",
			name: cfg.salaryName,
			type: "PassedEvent",
			description: `经过起点领取${cfg.moneyName} ${cfg.salary}。`,
			effectCode: `((player: IPlayer, gameProcess: IGameProcess) => { player.gain(${cfg.salary}, "cls_salary"); gameProcess.messageNotify([player.id], { type: "success", content: "路过${cfg.corners.start}，领取${cfg.moneyName} ${cfg.salary}" }); });`,
		},
		{
			id: "evt-goto",
			name: `押入${cfg.corners.jail}`,
			type: "ArrivedEvent",
			description: `触犯禁例，押入${cfg.corners.jail}候审。`,
			effectCode: `(async (player: IPlayer, gameProcess: IGameProcess) => { gameProcess.messageNotify([player.id], { type: "warning", content: "触犯禁例！押入${cfg.corners.jail}" }); await player.tpToMapItem("item-10"); });`,
		},
	];

	// ---- 机会卡 ----
	const chanceCards = cfg.cards.map((c) => ({
		id: c.id,
		name: c.name,
		type: "ToSelf",
		description: c.description,
		color: c.color,
		effectCode: c.effect
			? card(c.effect)
			: card(`await clsCash(gameProcess, sourcePlayer, ${c.gain}, "${c.name}");`),
	}));

	const roles = cfg.roles.map((r) => ({
		id: r.id,
		name: r.name,
		description: r.description,
		color: r.color,
		imageId: r.avatar,
		initCode: "((player: IPlayer, gameProcess: IGameProcess) => {});",
	}));

	const walkableTypeIds = [
		...cfg.groups.map((g) => `t-act-${g.key}`),
		"t-chance", "t-fate", "t-tax",
		"t-start", "t-jail", "t-free", "t-goto",
	];

	return {
		serverMapId: "",
		id: cfg.id,
		info: {
			name: cfg.name,
			author: "AI 生成",
			version: "1.0.0",
			editorVersion: "1.3.3",
			description: cfg.description,
			pendingChangelog: "",
			changelog: [],
			backgroundImageId: cfg.backgroundImageId,
			coverImageId: cfg.coverImageId,
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
		buildingModelIdList: cfg.groups[0] ? districtBuildModels(cfg.groups[0].key) : [],
		uiTemplates: [],
		modifierTemplates: [],
		customUIs: [],
		gameSettingForm: [
			{ id: "gs-init-money", key: "initMoney", type: "number-input", label: `初始${cfg.moneyName}`, defaultValue: cfg.initMoney, min: 0, max: 1000000, builtIn: true },
			{ id: "gs-turn-timeout", key: "turnTimeout", type: "number-input", label: "回合倒计时(秒)", defaultValue: 15, min: 5, max: 120, builtIn: true },
			{ id: "gs-chance-timeout", key: "chanceTimeout", type: "number-input", label: "机会卡阅读时限(秒)", defaultValue: 20, min: 5, max: 120 },
		],
		extraLibs: readFileSync(join(__dirname, "classic-extra-libs.txt"), "utf8"),
	};
}

const CORNERS_IDS = { 10: "jail", 20: "free", 30: "goto" };
