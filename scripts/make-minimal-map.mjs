// 最小可玩测试地图生成脚本（M2 开局验证用）
// 用 map-editor 默认阶段代码 + 8 格闭环 + 1 角色 + 内置参数，序列化为 .fpmap
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import protobuf from "protobufjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");
const DEFAULT_CODE_DIR = join(
  PROJECT_ROOT,
  "apps/map-editor/src/views/map-editor/components/manager/process-manager/default-code",
);

const readTxt = (name) => readFileSync(join(DEFAULT_CODE_DIR, name), "utf8");

const SYSTEM_PHASE_IDS = {
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

// 与 map-editor getInitPhase() 同构的阶段装配
function getInitPhase() {
  const phase = (id, name, description, mark, code) => ({ id, name, description, from: "系统", mark, initEventCode: code });
  const playerRound = [
    phase(SYSTEM_PHASE_IDS.PLAYER_ROUND_START, "玩家回合开始", "玩家回合开始阶段", "PlayerRoundStart", readTxt("player-round-start-phase.txt")),
    phase(SYSTEM_PHASE_IDS.ROLL_DICE, "玩家操作", "玩家操作阶段", "RollDice", readTxt("roll-dice-phase.txt")),
    phase(SYSTEM_PHASE_IDS.PLAYER_MOVE, "玩家移动", "玩家移动阶段", "PlayerMove", readTxt("player-move-phase.txt")),
    phase(SYSTEM_PHASE_IDS.ARRIVED_EVENT, "到达事件", "到达事件阶段", "ArrivedEvent", readTxt("arrived-event-phase.txt")),
    phase(SYSTEM_PHASE_IDS.PLAYER_ROUND_END, "玩家回合结束", "玩家回合结束阶段", "PlayerRoundEnd", readTxt("player-round-end-phase.txt")),
  ];
  return {
    gameOverRule: [phase(SYSTEM_PHASE_IDS.GAME_OVER_RULE, "游戏结束判定规则", "游戏结束判定规则, 返回 false 表示游戏继续", "GameRoundStart", readTxt("game-over-rule.txt"))],
    gameInited: [phase(SYSTEM_PHASE_IDS.GAME_INITED, "游戏初始化结束", "游戏初始化结束阶段", "GameRoundStart", readTxt("game-inited-phase.txt"))],
    playerPreInit: [{ id: SYSTEM_PHASE_IDS.PLAYER_PRE_INIT, name: "玩家预初始化", description: "玩家预初始化阶段（在玩家初始化之前运行）", from: "系统", initEventCode: readTxt("player-pre-init-phase.txt") }],
    propertyPreInit: [{ id: SYSTEM_PHASE_IDS.PROPERTY_PRE_INIT, name: "地皮预初始化", description: "地皮预初始化阶段（在地皮初始化之前运行）", from: "系统", initEventCode: readTxt("property-pre-init-phase.txt") }],
    gameRoundStart: [phase(SYSTEM_PHASE_IDS.GAME_ROUND_START, "轮次开始", "轮次开始阶段", "GameRoundStart", readTxt("game-round-start-phase.txt"))],
    playerRound,
    gameRoundEnd: [phase(SYSTEM_PHASE_IDS.GAME_ROUND_END, "轮次结束", "轮次结束阶段", "GameRoundEnd", readTxt("game-round-end-phase.txt"))],
    postRestore: [{ id: SYSTEM_PHASE_IDS.POST_RESTORE, name: "存档恢复后", description: "存档恢复后阶段", from: "系统", initEventCode: readTxt("post-restore-phase.txt") }],
  };
}

const TYPE_ID = "type-normal";
const MODEL_ID = "model-empty"; // 指向 modelFiles 中的最小 GLB，供 GameRenderer.initMapItems 加载
const ITEM_COUNT = 8;

const mapItems = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}`,
  type: { id: TYPE_ID, color: "#4f83ff", name: "普通地块", modelId: MODEL_ID, size: 1 },
  x: 0,
  y: 0,
  rotation: 0,
  // item-3 挂付费事件（到达扣款），用于验证双轨现金模式"已支付"确认浮层
  ...(i === 3 ? { mapEventId: "evt-fee" } : {}),
}));

const mapItemTypes = [{ id: TYPE_ID, color: "#4f83ff", name: "普通地块", modelId: MODEL_ID, size: 1 }];

const mapPaths = Array.from({ length: ITEM_COUNT }, (_, i) => ({
  id: `item-${i}-item-${(i + 1) % ITEM_COUNT}`,
  fromMapItemId: `item-${i}`,
  toMapItemId: `item-${(i + 1) % ITEM_COUNT}`,
  initEnable: true,
}));

const mapData = {
  serverMapId: "",
  id: "map-test-minimal-8",
  info: {
    name: "离线测试地图-8格",
    author: "M2 验证",
    version: "0.0.1",
    editorVersion: "1.3.3",
    description: "M2 出口验证用最小可玩地图：8 格闭环 + 1 角色 + 系统默认阶段",
    pendingChangelog: "",
    changelog: [],
    backgroundImageId: "",
    coverImageId: "cover-test",
  },
  mapItems,
  startMapItemId: "item-0",
  chanceCards: [],
  mapEvents: [
    {
      id: "evt-fee",
      name: "付费格",
      type: "ArrivedEvent",
      effectCode: `((player, gameProcess) => { player.cost(500, "费用"); })`,
    },
  ],
  mapItemTypes,
  mapPaths,
  pathMapItemTypeIds: [TYPE_ID],
  mapIndex: Array.from({ length: ITEM_COUNT }, (_, i) => `item-${i}`),
  roles: [
    {
      id: "role-test",
      name: "测试侠",
      description: "M2 验证角色",
      color: "#4f83ff",
      imageId: "cover-test",
      initCode: `((player, gameProcess) => {\n})`,
    },
  ],
  inUse: false,
  phases: getInitPhase(),
  buildingModelIdList: ["", "", ""],
  uiTemplates: [],
  modifierTemplates: [],
  customUIs: [],
  gameSettingForm: [
    { id: "gs-init-money", key: "initMoney", type: "number-input", label: "初始金钱", defaultValue: 10000, builtIn: true },
    { id: "gs-turn-timeout", key: "turnTimeout", type: "number-input", label: "回合倒计时(秒)", defaultValue: 15, min: 5, max: 120, builtIn: true },
  ],
  extraLibs: "",
};

// 与 dataToProtoBuffer 同构的序列化（无模型/图片附件）
// 地图封面资源：从 cover-b64.txt 读取可见封面（client 加载要求 coverImageId 在资源库中存在）
import { readFileSync as _readFileSync } from "node:fs";
const _coverB64Path = join(PROJECT_ROOT, "scripts/cover-b64.txt");
const _coverB64 = _readFileSync(_coverB64Path, "utf8").trim();
const COVER_PNG = Buffer.from(_coverB64, "base64");

// 最小合法 GLB（glTF 2.0，空场景），作为 MapItem 模型资源（client 渲染要求 mapItem.type.modelId 可解析）
const EMPTY_GLB = Buffer.from(
  "Z2xURgIAAACsAAAAmAAAAEpTT057ImFzc2V0Ijp7InZlcnNpb24iOiIyLjAiLCJnZW5lcmF0b3IiOiJtaW5pbWFsLW1hcC10ZXN0In0sInNjZW5lIjowLCJzY2VuZXMiOlt7Im5vZGVzIjpbMF19XSwibm9kZXMiOlt7Im5hbWUiOiJlbXB0eS1tYXAtaXRlbSIsInRyYW5zbGF0aW9uIjpbMCwwLDBdfV19IA==",
  "base64",
);

const protoRoot = await protobuf.load(join(PROJECT_ROOT, "packages/utils/protos/game-map.proto"));
const GameMapType = protoRoot.lookupType("GameMap");
const message = GameMapType.create({
  id: mapData.id,
  jsonData: JSON.stringify({ ...mapData, pathMapItemTypeIds: mapData.pathMapItemTypeIds ?? [] }),
  modelFiles: [{ id: MODEL_ID, name: "empty-map-item.glb", filetype: "glb", content: EMPTY_GLB }],
  imageFiles: [{ id: "cover-test", name: "cover.png", filetype: "png", content: COVER_PNG }],
  serverMapId: "",
});
const buffer = GameMapType.encode(message).finish();

const outDir = join(PROJECT_ROOT, "test-assets");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "minimal-map-8.fpmap");
writeFileSync(outPath, buffer);

// 同时输出到 client public/offline-maps（内置离线地图）
const publicMapDir = join(PROJECT_ROOT, "apps/client/public/offline-maps");
mkdirSync(publicMapDir, { recursive: true });
writeFileSync(join(publicMapDir, "minimal-map-8.fpmap"), buffer);

console.log("地图 JSON 字节数:", JSON.stringify(mapData).length);
console.log("fpmap 字节数:", buffer.byteLength);
console.log("输出:", outPath);
console.log("内置地图:", join(publicMapDir, "minimal-map-8.fpmap"));
