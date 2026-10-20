// 三张经典复刻地图配置：神州大地（大富翁4·中国大陆）/ 三国风云（富甲天下3）/ 江南水乡（大富翁6·中国）
import { buildClassicMap } from "./classic-map-builder.mjs";

/** 大宇经典 cast（神州大地 + 江南水乡共用） */
const RICHMAN_ROLES = [
	{ id: "role-qianfuren", name: "钱夫人", color: "#d4537e", description: "富甲天下的女强人，口头禅是「亲爱的」。", avatar: "image-role-qianfuren" },
	{ id: "role-sunxiaomei", name: "孙小美", color: "#b03a2e", description: "杂技出身，脚踩小红鞋，运气常常不错。", avatar: "image-role-sunxiaomei" },
	{ id: "role-atubo", name: "阿土伯", color: "#8a5a3b", description: "憨厚的乡下青年，背着斗笠闯天下。", avatar: "image-role-atubo" },
	{ id: "role-shalongbasi", name: "沙隆巴斯", color: "#5d7a9e", description: "中东来的油王子，汽油桶不离身。", avatar: "image-role-shalongbasi" },
	{ id: "role-wumi", name: "乌咪", color: "#c9761a", description: "热爱舞蹈的元气少女，头戴羽毛。", avatar: "image-role-wumi" },
	{ id: "role-rentailang", name: "忍太郎", color: "#7f77dd", description: "修行的少年忍者，擅长隐身与飞镖。", avatar: "image-role-rentailang" },
];

/** 三国群雄（三国风云） */
const SANGUO_ROLES = [
	{ id: "role-caocao", name: "曹操", color: "#5d7a9e", description: "治世之能臣，乱世之奸雄。", avatar: "image-role-caocao" },
	{ id: "role-liubei", name: "刘备", color: "#5d9e5d", description: "汉室宗亲，双股剑，仁德布于四海。", avatar: "image-role-liubei" },
	{ id: "role-sunquan", name: "孙权", color: "#b03a2e", description: "承父兄基业，紫髯碧眼，据有江东。", avatar: "image-role-sunquan" },
	{ id: "role-zhugeliang", name: "诸葛亮", color: "#7f77dd", description: "卧龙先生，羽扇纶巾，算无遗策。", avatar: "image-role-zhugeliang" },
	{ id: "role-lvbu", name: "吕布", color: "#c9761a", description: "飞将，方天画戟，赤兔马，勇冠三军。", avatar: "image-role-lvbu" },
	{ id: "role-diaochan", name: "貂蝉", color: "#d4537e", description: "司徒府歌姬，一曲连环，乱世佳人。", avatar: "image-role-diaochan" },
];

/** 地图一：神州大地（大富翁4·中国大陆主题重构） */
export function buildShenzhouMap() {
	return buildClassicMap({
		id: "classic-cn-1",
		name: "神州大地",
		description:
			"致敬《大富翁4》中国大陆地图的 40 格经典闭环：八大商区廿四地产、机遇与风云、税务稽查，十二机会卡与六位经典角色（钱夫人/孙小美/阿土伯/沙隆巴斯/乌咪/忍太郎），系统默认阶段开箱即玩。四角为人民广场（起点）、警务站、环湖公园与安全检查站。",
		initMoney: 15000,
		moneyName: "元",
		salary: 1200,
		salaryName: "广场福利",
		taxLabel: "所得税",
		specialLabels: { chance: "机遇", fate: "风云", tax: "税务" },
		corners: { start: "人民广场", jail: "警务站", free: "环湖公园", goto: "安全检查站" },
		backgroundImageId: "image-shenzhou-bg",
		coverImageId: "image-shenzhou-cover",
		groups: [
			{ key: "cbd", name: "商务CBD·京沪圈", color: "#3a7ca5", sell: 800, names: ["国贸CBD", "陆家嘴", "福田中心区"] },
			{ key: "mall", name: "商贸广场·商业街", color: "#b03a2e", sell: 1000, names: ["王府井大街", "南京路步行街", "天河城"] },
			{ key: "hotel", name: "星级酒店·湖畔", color: "#c9a227", sell: 1200, names: ["西湖国宾馆", "白天鹅宾馆", "花园酒店"] },
			{ key: "resident", name: "幸福住宅·南区", color: "#5d9e5d", sell: 1400, names: ["深圳湾畔", "珠江新城", "奥体新城"] },
			{ key: "culture", name: "文创街区·艺术园", color: "#c76b98", sell: 1600, names: ["798艺术区", "田子坊", "红厂创意园"] },
			{ key: "finance", name: "金融大道·学府", color: "#5d7a9e", sell: 1800, names: ["中关村大街", "五道口", "光谷步行街"] },
			{ key: "tech", name: "科技园区·高新", color: "#3a7d6e", sell: 2000, names: ["西溪湿地软件园", "南山科技园", "张江高科"] },
			{ key: "leisure", name: "活力商圈·夜经济", color: "#8e6bb8", sell: 2400, names: ["解放碑", "春熙路", "观音桥"] },
		],
		fate: [
			"偶遇贵人引荐，获创业投资 1500",
			"遭遇理财骗局，损失 1000",
			"暴雨内涝封路，原地休整一回合",
			"商海浮沉：获得投资 / 遭遇骗局 / 被迫休整",
		],
		cards: [
			{ id: "card-caipiao", name: "彩票中奖", color: "#b03a2e", gain: 2000, description: "双色球头奖到账，收入 2000。" },
			{ id: "card-fenhong", name: "公司分红", color: "#c9a227", gain: 1500, description: "持股公司年度分红 1500。" },
			{ id: "card-fangjia", name: "房价回暖", color: "#3a7ca5", gain: 1800, description: "名下房产估值上涨，变现 1800。" },
			{ id: "card-butie", name: "政策补贴", color: "#5d9e5d", gain: 1200, description: "小微企业扶持补贴到账 1200。" },
			{ id: "card-weizhang", name: "违章罚款", color: "#5f5e5a", gain: -800, description: "违停被贴条，罚款 800。" },
			{ id: "card-chuangye", name: "创业受挫", color: "#5f5e5a", gain: -1000, description: "项目黄了，亏损 1000。" },
			{ id: "card-gushi", name: "股市暴跌", color: "#5f5e5a", gain: -1500, description: "满仓绿油油，浮亏 1500。" },
			{ id: "card-chaiqian", name: "拆迁补偿", color: "#d4537e", gain: 1000, description: "老房拆迁，补偿款 1000。" },
			{ id: "card-tingche", name: "违章停车", color: "#5f5e5a", description: "车牌被拖走，前往警务站处理。", effect: 'await sourcePlayer.tpToMapItem("item-10"); gameProcess.msgNotifyBroadcast("info", sourcePlayer.name + " 违章停车，被请去警务站");' },
			{ id: "card-wuqi", name: "误期退后", color: "#5f5e5a", description: "路上出了状况，退后三格。", effect: 'await sourcePlayer.walk(-3); gameProcess.messageNotify([sourcePlayer.id], { type: "info", content: "行程延误，退后三格" });' },
			{ id: "card-guanzhi", name: "交通管制", color: "#c9a84a", description: "全城限行，原地休整一回合。", effect: 'await sourcePlayer.setStop(1); gameProcess.messageNotify([sourcePlayer.id], { type: "info", content: "交通管制，限行一回合" });' },
			{ id: "card-gaotie", name: "高铁提速", color: "#3a7ca5", description: "坐上复兴号，直达环湖公园。", effect: 'await sourcePlayer.tpToMapItem("item-20"); gameProcess.messageNotify([sourcePlayer.id], { type: "success", content: "高铁提速，直达环湖公园" });' },
		],
		roles: RICHMAN_ROLES,
	});
}

/** 地图二：三国风云（富甲天下3 主题重构） */
export function buildSanguoMap() {
	return buildClassicMap({
		id: "classic-sanguo-1",
		name: "三国风云",
		description:
			"致敬《富甲天下3》的 40 格乱世争霸：八州廿四城、锦囊机遇、风云突变、户部税关，十二机会卡与六位三国群雄（曹操/刘备/孙权/诸葛亮/吕布/貂蝉），系统默认阶段开箱即玩。四角为宫门（起点）、天牢、练兵场与缉捕关。",
		initMoney: 12000,
		moneyName: "贯",
		salary: 1200,
		salaryName: "宫门犒赏",
		taxLabel: "军粮税",
		specialLabels: { chance: "锦囊", fate: "风云", tax: "税关" },
		corners: { start: "宫门", jail: "天牢", free: "练兵场", goto: "缉捕关" },
		backgroundImageId: "image-sanguo-bg",
		coverImageId: "image-sanguo-cover",
		groups: [
			{ key: "siliao", name: "司隶·两都", color: "#c9a227", sell: 800, names: ["洛阳城", "长安城", "许昌城"] },
			{ key: "jingbei", name: "荆北·襄樊", color: "#b03a2e", sell: 1000, names: ["襄阳城", "江陵城", "宛城"] },
			{ key: "jingnan", name: "荆南·潇湘", color: "#c76b98", sell: 1200, names: ["临湘城", "巴丘城", "泉陵城"] },
			{ key: "huainan", name: "淮南·寿春", color: "#5d7a9e", sell: 1400, names: ["寿春城", "合肥城", "舒城"] },
			{ key: "jiangdong", name: "江东·吴会", color: "#3a7d6e", sell: 1600, names: ["吴城", "会稽城", "南昌城"] },
			{ key: "hebei", name: "河北·邺城", color: "#7fb3c8", sell: 1800, names: ["邺城", "蓟城", "南皮城"] },
			{ key: "xiliang", name: "西凉·姑臧", color: "#8a5a3b", sell: 2000, names: ["姑臧城", "敦煌城", "居延城"] },
			{ key: "yizhou", name: "益州·成都", color: "#5d9e5d", sell: 2400, names: ["成都城", "江州城", "南郑城"] },
		],
		fate: [
			"援军不日而至，获军粮接济 1500",
			"遭遇敌军伏击，折损 1000",
			"大雪封山，扎营休整一回合",
			"乱世风云：获得接济 / 遭遇伏击 / 被迫休整",
		],
		cards: [
			{ id: "card-junliang", name: "军粮获赠", color: "#c9a227", gain: 2000, description: "乡民犒军，获粮草折算 2000 贯。" },
			{ id: "card-jiaohuo", name: "缴获辎重", color: "#b03a2e", gain: 1500, description: "劫了敌军辎重队，得 1500 贯。" },
			{ id: "card-shangdui", name: "商队通商", color: "#5d7a9e", gain: 1800, description: "丝路商队抽成，获利 1800 贯。" },
			{ id: "card-guiyi", name: "万民归心", color: "#5d9e5d", gain: 1200, description: "仁名远播，士绅捐输 1200 贯。" },
			{ id: "card-fubing", name: "遭遇伏兵", color: "#5f5e5a", gain: -1000, description: "山谷遭遇伏兵，折损 1000 贯。" },
			{ id: "card-liangcao", name: "粮草被劫", color: "#5f5e5a", gain: -800, description: "押运粮草被劫，亏折 800 贯。" },
			{ id: "card-bingbai", name: "兵败失地", color: "#5f5e5a", gain: -1500, description: "一仗打输了，损失 1500 贯。" },
			{ id: "card-meiren", name: "美人馈赠", color: "#d4537e", gain: 1000, description: "获赠锦缎玉环，折算 1000 贯。" },
			{ id: "card-maicheng", name: "走麦城", color: "#5f5e5a", description: "中了埋伏，押入天牢候审。", effect: 'await sourcePlayer.tpToMapItem("item-10"); gameProcess.msgNotifyBroadcast("info", sourcePlayer.name + " 走麦城，被押入天牢");' },
			{ id: "card-wuqi", name: "误期退后", color: "#5f5e5a", description: "行军误期，退后三格。", effect: 'await sourcePlayer.walk(-3); gameProcess.messageNotify([sourcePlayer.id], { type: "info", content: "行军误期，退后三格" });' },
			{ id: "card-biguan", name: "闭关休整", color: "#c9a84a", description: "整军经武，原地休整一回合。", effect: 'await sourcePlayer.setStop(1); gameProcess.messageNotify([sourcePlayer.id], { type: "info", content: "闭关休整一回合" });' },
			{ id: "card-guandu", name: "驰援官渡", color: "#3a7ca5", description: "八百里加急，疾行至练兵场。", effect: 'await sourcePlayer.tpToMapItem("item-20"); gameProcess.messageNotify([sourcePlayer.id], { type: "success", content: "八百里加急，驰援练兵场" });' },
		],
		roles: SANGUO_ROLES,
	});
}

/** 地图三：江南水乡（大富翁6·中国地图主题重构） */
export function buildJiangnanMap() {
	return buildClassicMap({
		id: "classic-jiangnan-1",
		name: "江南水乡",
		description:
			"致敬《大富翁6》中国地图的 40 格水乡之旅：八大组团廿四地段、签筒机遇、风雨突变、河泊税课，十二机会卡与六位经典角色，系统默认阶段开箱即玩。四角为渡口（起点）、县衙、湖心茶楼与河稽查卡。",
		initMoney: 12000,
		moneyName: "两",
		salary: 1200,
		salaryName: "渡口津贴",
		taxLabel: "渔课",
		specialLabels: { chance: "签筒", fate: "风雨", tax: "税课" },
		corners: { start: "渡口", jail: "县衙", free: "湖心茶楼", goto: "河稽查卡" },
		backgroundImageId: "image-jiangnan-bg",
		coverImageId: "image-jiangnan-cover",
		groups: [
			{ key: "shuixiang", name: "水巷人家", color: "#4a7fa5", sell: 800, names: ["周庄驴道", "同里三桥", "甪直老街"] },
			{ key: "qiaobang", name: "桥浜古镇", color: "#7a6a8a", sell: 1000, names: ["西塘烟雨", "南浔百间楼", "乌镇西栅"] },
			{ key: "huhu", name: "湖滨渔歌", color: "#3a8a8a", sell: 1200, names: ["鼋头渚", "西湖苏堤", "绍兴东湖"] },
			{ key: "canfang", name: "蚕桑绸乡", color: "#b06a8a", sell: 1400, names: ["盛泽绸市", "震泽蚕庙", "双林绢庄"] },
			{ key: "mingcha", name: "龙井茶村", color: "#5d9e5d", sell: 1600, names: ["狮峰山", "龙井村", "梅家坞"] },
			{ key: "jiuxiang", name: "黄酒酒巷", color: "#a5763a", sell: 1800, names: ["东浦酒坊", "咸亨酒店", "沈园酒垆"] },
			{ key: "yuyuan", name: "园林深院", color: "#8a5a9a", sell: 2000, names: ["拙政园", "留园", "网师园"] },
			{ key: "qinhuai", name: "秦淮灯火", color: "#c95a5a", sell: 2400, names: ["夫子庙", "秦淮灯会", "白鹭洲"] },
		],
		fate: [
			"龙井新茶大卖，获利 1500",
			"梅雨连绵货损，亏折 1000",
			"河埠头风浪大作，停渡一回合",
			"水乡晴雨：茶市大卖 / 梅雨货损 / 停渡休整",
		],
		cards: [
			{ id: "card-chashang", name: "龙井茶商", color: "#5d9e5d", gain: 2000, description: "明前龙井被御商包圆，得银 2000 两。" },
			{ id: "card-sichou", name: "丝绸外贸", color: "#b06a8a", gain: 1500, description: "绸缎出海贸易，获利 1500 两。" },
			{ id: "card-caoliang", name: "漕粮补贴", color: "#c9a227", gain: 1800, description: "承运漕粮，领取补贴 1800 两。" },
			{ id: "card-pingtan", name: "评弹获奖", color: "#4a7fa5", gain: 1200, description: "书场评弹夺魁，得赏银 1200 两。" },
			{ id: "card-taifeng", name: "台风受损", color: "#5f5e5a", gain: -1000, description: "台风过境，作坊受损 1000 两。" },
			{ id: "card-louchuan", name: "漕船漏水", color: "#5f5e5a", gain: -800, description: "货船触礁漏水，货损 800 两。" },
			{ id: "card-canbing", name: "蚕病蔓延", color: "#5f5e5a", gain: -1500, description: "蚕房遭了病，损失 1500 两。" },
			{ id: "card-huafang", name: "画舫赏灯", color: "#d4537e", gain: 1000, description: "画舫灯会抽了头彩，得彩银 1000 两。" },
			{ id: "card-yuba", name: "渔霸纠缠", color: "#5f5e5a", description: "惹了渔霸，被扭送县衙。", effect: 'await sourcePlayer.tpToMapItem("item-10"); gameProcess.msgNotifyBroadcast("info", sourcePlayer.name + " 被渔霸扭送县衙");' },
			{ id: "card-wuqi", name: "误期退后", color: "#5f5e5a", description: "误了船期，退后三格。", effect: 'await sourcePlayer.walk(-3); gameProcess.messageNotify([sourcePlayer.id], { type: "info", content: "误了船期，退后三格" });' },
			{ id: "card-meiyu", name: "梅雨休整", color: "#c9a84a", description: "梅雨连绵，闭门休整一回合。", effect: 'await sourcePlayer.setStop(1); gameProcess.messageNotify([sourcePlayer.id], { type: "info", content: "梅雨连绵，休整一回合" });' },
			{ id: "card-miaohui", name: "赶庙会", color: "#3a7ca5", description: "庙会人潮涌动，挤至湖心茶楼。", effect: 'await sourcePlayer.tpToMapItem("item-20"); gameProcess.messageNotify([sourcePlayer.id], { type: "success", content: "赶庙会，被人潮送到湖心茶楼" });' },
		],
		roles: RICHMAN_ROLES,
	});
}
