const { useState, useEffect, useRef } = React;

const DAYS = [
  { day:"D1", from:"成都", to:"泸定", km:280, road:"成雅高速 + G318，雅安后进入盘山段", altStart:500, altEnd:1330, altMax:1330, altMaxName:"泸定", nodes:"成都 → 雅安 → 天全 → 二郎山隧道 → 泸定", fuel:"雅安、天全", stay:"泸定县城宾馆", warn:"二郎山隧道内湿滑，出隧道后温差大，注意起雾", difficulty:1 },
  { day:"D2", from:"泸定", to:"新都桥", km:170, road:"G318 弯道密集，折多山为首个高海拔垭口", altStart:1330, altEnd:3460, altMax:4298, altMaxName:"折多山垭口", nodes:"泸定 → 康定 → 折多山 → 新都桥", fuel:"康定城区加满", stay:"新都桥镇客栈", warn:"折多山高反初期高发，下山弯多，注意制动温度", difficulty:3 },
  { day:"D3", from:"新都桥", to:"理塘", km:210, road:"高尔寺山、剪子弯山、卡子拉山连续高海拔", altStart:3460, altEnd:4014, altMax:4718, altMaxName:"卡子拉山", nodes:"新都桥 → 雅江 → 剪子弯山 → 卡子拉山 → 理塘", fuel:"雅江、理塘", stay:"理塘县城酒店", warn:"连续三个 4,000m+ 垭口，夜间温度可能降至 0°C 以下", difficulty:4 },
  { day:"D4", from:"理塘", to:"巴塘", km:170, road:"海子山垭口后长下坡，整体路况较好", altStart:4014, altEnd:2580, altMax:4685, altMaxName:"海子山", nodes:"理塘 → 海子山 → 姊妹湖 → 巴塘", fuel:"巴塘", stay:"巴塘县城", warn:"长下坡注意刹车温度和轮胎状态", difficulty:2 },
  { day:"D5", from:"巴塘", to:"左贡", km:260, road:"过金沙江入藏，跨越东达山等多座高山", altStart:2580, altEnd:3877, altMax:5130, altMaxName:"东达山", nodes:"巴塘 → 金沙江大桥 → 芒康 → 觉巴山 → 东达山 → 左贡", fuel:"芒康、左贡", stay:"左贡县城", warn:"东达山海拔高，春秋易有积雪或暗冰", difficulty:5 },
  { day:"D6", from:"左贡", to:"八宿", km:200, road:"邦达草原至怒江 72 拐，全程最险路段之一", altStart:3877, altEnd:3260, altMax:4618, altMaxName:"业拉山", nodes:"左贡 → 邦达 → 业拉山 → 怒江72拐 → 八宿", fuel:"邦达、八宿", stay:"八宿县城", warn:"72 拐急弯密集，可能伴随碎石和对向大车", difficulty:5 },
  { day:"D7", from:"八宿", to:"波密", km:220, road:"安久拉山后进入林区，景色和路况都明显改善", altStart:3260, altEnd:2750, altMax:4468, altMaxName:"安久拉山", nodes:"八宿 → 安久拉山 → 然乌湖 → 米堆冰川 → 波密", fuel:"然乌、波密", stay:"波密县城", warn:"雨季常见塌方与泥石流，需提前确认路况", difficulty:3 },
  { day:"D8", from:"波密", to:"林芝", km:230, road:"通麦桥隧已改善，色季拉山段常见浓雾", altStart:2750, altEnd:2930, altMax:4728, altMaxName:"色季拉山", nodes:"波密 → 通麦 → 鲁朗 → 色季拉山 → 林芝", fuel:"鲁朗、林芝", stay:"林芝八一镇", warn:"色季拉山云雾重，能见度差时禁止激进超车", difficulty:3 },
  { day:"D9", from:"林芝", to:"林芝", km:0, road:"休整日，车辆与人员恢复", altStart:2930, altEnd:2930, altMax:2930, altMaxName:"林芝", nodes:"车辆检查 → 物资补充 → 高反恢复", fuel:"林芝", stay:"林芝", warn:"休整日优先做轮胎、刹车、链条和机油检查", difficulty:0 },
  { day:"D10", from:"林芝", to:"工布江达", km:270, road:"林拉公路路况优异，部分区段高速化", altStart:2930, altEnd:3440, altMax:3440, altMaxName:"工布江达", nodes:"林芝 → 尼洋河风光带 → 工布江达", fuel:"沿途充足", stay:"工布江达县城", warn:"路况好时更容易超速，注意横风和测速", difficulty:1 },
  { day:"D11", from:"工布江达", to:"拉萨", km:270, road:"翻越米拉山后整体顺畅，拉萨前车流增多", altStart:3440, altEnd:3650, altMax:5013, altMaxName:"米拉山", nodes:"工布江达 → 米拉山 → 墨竹工卡 → 达孜 → 拉萨", fuel:"沿途充足", stay:"拉萨市区", warn:"进拉萨前注意疲劳驾驶和城市交通节奏变化", difficulty:2 },
];

const ROUTE_POINTS = [
  { name:"成都", day:1, lat:30.5728, lon:104.0668, alt:500 },
  { name:"雅安", day:1, lat:29.9877, lon:103.0010, alt:641 },
  { name:"泸定", day:1, lat:29.9140, lon:102.2330, alt:1330 },
  { name:"康定", day:2, lat:30.0553, lon:101.9645, alt:2560 },
  { name:"折多山", day:2, lat:30.0310, lon:101.8430, alt:4298 },
  { name:"新都桥", day:2, lat:30.0453, lon:101.5076, alt:3460 },
  { name:"雅江", day:3, lat:30.0317, lon:101.0157, alt:2640 },
  { name:"理塘", day:3, lat:29.9968, lon:100.2701, alt:4014 },
  { name:"海子山", day:4, lat:29.8150, lon:99.7320, alt:4685 },
  { name:"巴塘", day:4, lat:30.0050, lon:99.1080, alt:2580 },
  { name:"芒康", day:5, lat:29.6792, lon:98.5935, alt:3870 },
  { name:"东达山", day:5, lat:29.7250, lon:98.1700, alt:5130 },
  { name:"左贡", day:5, lat:29.6712, lon:97.8418, alt:3877 },
  { name:"邦达", day:6, lat:30.2810, lon:97.1830, alt:4120 },
  { name:"业拉山", day:6, lat:30.2050, lon:96.9190, alt:4618 },
  { name:"八宿", day:6, lat:30.0535, lon:96.9179, alt:3260 },
  { name:"然乌", day:7, lat:29.4387, lon:96.8071, alt:3850 },
  { name:"波密", day:7, lat:29.8594, lon:95.7680, alt:2750 },
  { name:"通麦", day:8, lat:30.0040, lon:95.0140, alt:2080 },
  { name:"鲁朗", day:8, lat:29.7698, lon:94.7364, alt:3380 },
  { name:"色季拉山", day:8, lat:29.7000, lon:94.6630, alt:4728 },
  { name:"林芝", day:8, lat:29.6548, lon:94.3623, alt:2930 },
  { name:"工布江达", day:10, lat:29.8854, lon:93.2465, alt:3440 },
  { name:"米拉山", day:11, lat:29.8662, lon:92.3386, alt:5013 },
  { name:"墨竹工卡", day:11, lat:29.8334, lon:91.7294, alt:3830 },
  { name:"拉萨", day:11, lat:29.6520, lon:91.1721, alt:3650 },
];

const ROUTE_SCHEMATIC_NODES = [
  { name:"成都", alt:512, dist:0, type:"city", day:1 },
  { name:"雅安", alt:641, dist:151, type:"city", day:1 },
  { name:"二郎山", alt:2170, dist:88, type:"pass", day:1 },
  { name:"泸定", alt:1330, dist:50, type:"city", day:1 },
  { name:"康定", alt:2530, dist:51, type:"city", day:2 },
  { name:"折多山", alt:4298, dist:72, type:"pass", day:2 },
  { name:"新都桥", alt:3460, dist:83, type:"city", day:2 },
  { name:"雅江", alt:2530, dist:132, type:"city", day:3 },
  { name:"卡子拉山", alt:4718, dist:132, type:"pass", day:3 },
  { name:"理塘", alt:4014, dist:132, type:"city", day:3 },
  { name:"海子山", alt:4685, dist:174, type:"pass", day:4 },
  { name:"巴塘", alt:2580, dist:174, type:"city", day:4 },
  { name:"芒康", alt:3875, dist:107, type:"city", day:5 },
  { name:"拉乌山", alt:4338, dist:49, type:"pass", day:5 },
  { name:"东达山", alt:5008, dist:44, type:"pass", day:5 },
  { name:"左贡", alt:3877, dist:114, type:"city", day:5 },
  { name:"业拉山", alt:4658, dist:109, type:"pass", day:6 },
  { name:"邦达", alt:4120, dist:97, type:"city", day:6 },
  { name:"八宿", alt:3280, dist:97, type:"city", day:6 },
  { name:"然乌", alt:3960, dist:92, type:"city", day:7 },
  { name:"波密", alt:2725, dist:131, type:"city", day:7 },
  { name:"通麦", alt:2070, dist:47, type:"pass", day:8 },
  { name:"鲁朗", alt:3285, dist:48, type:"city", day:8 },
  { name:"林芝", alt:2930, dist:75, type:"city", day:8 },
  { name:"工布江达", alt:3440, dist:130, type:"city", day:10 },
  { name:"墨竹工卡", alt:3823, dist:99, type:"city", day:11 },
  { name:"米拉山", alt:5013, dist:116, type:"pass", day:11 },
  { name:"拉萨", alt:3650, dist:69, type:"city", day:11 },
];

const SCHEMATIC_DISTANCE_LABEL_INDICES = new Set([1, 5, 7, 9, 14, 16, 19, 24, 26]);

const SCHEMATIC_LABEL_OVERRIDES = {
  成都: { city: { dx: 2, dy: 92 } },
  雅安: { city: { dx: 8, dy: 90 } },
  泸定: { city: { dx: 18, dy: 98 } },
  康定: { city: { dx: 18, dy: 88 } },
  新都桥: { city: { dx: 4, dy: 80 } },
  雅江: { city: { dx: 0, dy: 100 } },
  理塘: { city: { dx: 0, dy: 66 } },
  巴塘: { city: { dx: 0, dy: 94 } },
  芒康: { city: { dx: 6, dy: 70 } },
  左贡: { city: { dx: 4, dy: 90 } },
  邦达: { city: { dx: 0, dy: 74 } },
  八宿: { city: { dx: 8, dy: 94 } },
  然乌: { city: { dx: -10, dy: 84 } },
  波密: { city: { dx: -12, dy: 96 } },
  鲁朗: { city: { dx: 4, dy: 88 } },
  林芝: { city: { dx: 18, dy: 92 } },
  工布江达: { city: { dx: 8, dy: 94 } },
  墨竹工卡: { city: { dx: 8, dy: 86 } },
  拉萨: { city: { dx: 18, dy: 76 } },
  二郎山: { pass: { dx: 0, dy: -72, altDy: -34 } },
  折多山: { pass: { dx: 0, dy: -96, altDy: -54 } },
  卡子拉山: { pass: { dx: 0, dy: -92, altDy: -50 } },
  海子山: { pass: { dx: 0, dy: -98, altDy: -56 } },
  拉乌山: { pass: { dx: 0, dy: -68, altDy: -32 } },
  东达山: { pass: { dx: 0, dy: -112, altDy: -64 } },
  业拉山: { pass: { dx: 4, dy: -82, altDy: -40 } },
  通麦: { pass: { dx: 8, dy: -68, altDy: -36 } },
  米拉山: { pass: { dx: 8, dy: -88, altDy: -48 } },
};

const EQUIPMENT = {
  "个人骑行装备": {
    icon: "🏍️",
    items: [
      { name: "全盔/揭面盔（双镜片）", note: "ECE 或 SNELL 认证", qty: "每人1" },
      { name: "蓝牙耳机模块", note: "Cardo / Sena，≥1.6km", qty: "每人1" },
      { name: "Pinlock 防雾片", note: "", qty: "每人1" },
      { name: "拉力服套装（上衣+裤子）", note: "CE 护甲，内胆可拆", qty: "每人1套" },
      { name: "夏季透气手套", note: "", qty: "每人1双" },
      { name: "冬季防水保暖手套", note: "垭口使用", qty: "每人1双" },
      { name: "ADV 骑行靴", note: "防水 Gore-Tex 优先", qty: "每人1双" },
      { name: "分体式雨衣雨裤", note: "套在骑行服外", qty: "每人1套" },
      { name: "压缩羽绒服", note: "", qty: "每人1" },
      { name: "抓绒中间层", note: "", qty: "每人1" },
      { name: "速干内衣裤", note: "", qty: "每人3套" },
      { name: "羊毛袜", note: "", qty: "每人3双" },
      { name: "围脖/面罩", note: "", qty: "每人2" },
    ]
  },
  "车辆装备": {
    icon: "⚙️",
    items: [
      { name: "铝合金边箱 ×2", note: "35–45L", qty: "每车" },
      { name: "尾箱", note: "42–55L", qty: "每车" },
      { name: "防水驼包/油箱包", note: "贵重快取", qty: "每车" },
      { name: "发动机护杠（上+下）", note: "", qty: "每车" },
      { name: "发动机底部护板", note: "铝合金", qty: "每车" },
      { name: "车把护手", note: "防风防摔", qty: "每车" },
      { name: "辅助射灯 ×2", note: "LED", qty: "每车" },
      { name: "后雾灯/高亮尾灯", note: "", qty: "每车" },
      { name: "手机支架（防震）", note: "+12V USB", qty: "每车" },
    ]
  },
  "维修工具与备件": {
    icon: "🔧",
    items: [
      { name: "内六角套装 + 螺丝刀", note: "十字/一字", qty: "队伍1套" },
      { name: "活动扳手 + 套筒扳手", note: "", qty: "队伍1套" },
      { name: "扎带 ×20 + 铁丝", note: "", qty: "队伍" },
      { name: "电工胶带 + 强力胶", note: "JB Weld", qty: "队伍" },
      { name: "尖嘴钳 + 万用表", note: "", qty: "队伍" },
      { name: "刹车片（前后各一副）", note: "按车型", qty: "每车" },
      { name: "离合线/油门线", note: "", qty: "每车各1" },
      { name: "火花塞 ×2", note: "", qty: "每车" },
      { name: "保险丝 + 灯泡套装", note: "", qty: "每车" },
      { name: "链条油 + 备用链条接头", note: "链传动", qty: "每车" },
      { name: "机油 1L", note: "备用", qty: "队伍" },
      { name: "补胎工具套装", note: "修补条+锥子+胶水", qty: "队伍" },
      { name: "便携充气泵 + 气压表", note: "", qty: "队伍" },
    ]
  },
  "露营与生活": {
    icon: "⛺",
    items: [
      { name: "轻量帐篷", note: "三季帐以上", qty: "2人帐×2" },
      { name: "睡袋", note: "舒适温标 -10°C", qty: "每人1" },
      { name: "充气防潮垫", note: "", qty: "每人1" },
      { name: "便携气炉 + 气罐", note: "气罐路上购买", qty: "队伍" },
      { name: "头灯", note: "备用电池", qty: "每人1" },
      { name: "防晒霜 SPF50+", note: "", qty: "每人" },
      { name: "墨镜 UV400", note: "偏光款", qty: "每人1" },
      { name: "保温水壶 1L", note: "", qty: "每人1" },
      { name: "充电宝 20000mAh", note: "", qty: "每人1" },
      { name: "防水袋/密封袋", note: "", qty: "若干" },
    ]
  },
  "通讯与证件": {
    icon: "📡",
    items: [
      { name: "蓝牙对讲耳机", note: "骑行通讯", qty: "每人1" },
      { name: "手持对讲机", note: "备用通讯", qty: "至少2台" },
      { name: "卫星通讯设备", note: "inReach/北斗", qty: "队伍1" },
      { name: "行车记录仪", note: "", qty: "每车1" },
      { name: "身份证", note: "必须", qty: "每人" },
      { name: "驾驶证（D/E）", note: "", qty: "每人" },
      { name: "行驶证 + 保险单", note: "复印件", qty: "每人" },
      { name: "边防证", note: "如去珠峰/阿里", qty: "按需" },
      { name: "紧急联系人卡", note: "塑封", qty: "每人" },
      { name: "现金 ≥2000元", note: "备用", qty: "每人" },
    ]
  },
};

const EMERGENCIES = [
  { id:"altitude", title:"高原反应", icon:"🫁", color:"#E85D4A", levels:[
    { level:"轻度", symptoms:"头痛、恶心、食欲下降", steps:["原地休息，不再上升海拔","服用布洛芬缓解头痛，口服葡萄糖","观察 2–4 小时，缓解后低速继续"] },
    { level:"中度", symptoms:"持续剧烈头痛、呕吐、呼吸困难", steps:["立即停止骑行","队友护送下降至少 500m 海拔","吸氧（便携氧气瓶/制氧袋）","服用地塞米松（遵医嘱）","2小时无改善，立刻就医"] },
    { level:"重度", symptoms:"意识模糊、口唇紫绀、呼吸急促", steps:["立刻呼叫救援","用一切手段快速降低海拔","持续吸氧，半坐位","拨打 120 或卫星通讯求助","转运最近县医院"] },
  ]},
  { id:"vehicle", title:"车辆故障", icon:"🔧", color:"#D4851F", levels:[
    { level:"爆胎/漏气", symptoms:"", steps:["安全靠边，双闪 + 150m 警示","补胎工具修补","充气恢复胎压后低速骑至修理点","无法修复时联系拖车"] },
    { level:"发动机/电路", symptoms:"", steps:["检查保险丝、火花塞、电瓶接线","简单故障现场排除","复杂故障推至安全位","联系品牌服务热线或就近摩修店"] },
    { level:"链条断裂", symptoms:"链传动车型", steps:["备用接头接回","调整松紧度后低速骑行","无备件时队友拖行且不超过 20km/h"] },
  ]},
  { id:"accident", title:"交通事故", icon:"🚨", color:"#C0392B", levels:[
    { level:"处置流程", symptoms:"", steps:["双闪 + 警示牌 + 队友引导交通","检查伤员，疑似脊柱损伤勿搬动","拨打 122 和 120","拍照录像保全证据","联系保险公司报案"] },
    { level:"队友受伤急救", symptoms:"", steps:["止血：直接压迫法","骨折：夹板临时固定","意识丧失：侧卧位监测呼吸","心跳骤停：CPR 30:2"] },
  ]},
  { id:"weather", title:"恶劣天气", icon:"⛈️", color:"#2980B9", levels:[
    { level:"暴雨/冰雹", symptoms:"", steps:["就近建筑物避让","不要在树下或山崖下停留","雨后注意积水、暗坑和落石"] },
    { level:"塌方/泥石流", symptoms:"波密–通麦段高发", steps:["前方塌方立即停车","原路退至安全地带","联系道班或等待清理"] },
    { level:"大雪/暗冰", symptoms:"高海拔垭口", steps:["车速降至 20km/h 以下","安装防滑装置","跟随前车车辙","过于恶劣则等待或折返"] },
  ]},
  { id:"lost", title:"人员走失", icon:"📍", color:"#8E44AD", levels:[
    { level:"走失处置", symptoms:"", steps:["原地等待 30 分钟，对讲机呼叫","明显位置做标记","有信号时发送定位","前方队友在最近补给点等待","超 2 小时后报警或卫星通讯求助"] },
  ]},
  { id:"supply", title:"物资短缺", icon:"⛽", color:"#27AE60", levels:[
    { level:"油料不足", symptoms:"", steps:["每段留 50km 余量","备用油桶 2–3L","向过路车辆求助购油","高海拔油耗增加 15–20%"] },
    { level:"食品/饮水", symptoms:"", steps:["每人携带 1 天应急口粮 + 1.5L 水","河水必须净化处理","路过每个乡镇补充"] },
  ]},
];

const PHONES = [
  { name:"公安报警", num:"110" },
  { name:"交通事故", num:"122" },
  { name:"急救", num:"120" },
  { name:"道路救援/路政", num:"12328" },
  { name:"西藏旅游投诉", num:"0891-6834193" },
  { name:"人保道路救援", num:"95518" },
  { name:"平安道路救援", num:"95511" },
];

const CHECKLIST_VEHICLE = [
  "机油更换","冷却液检查","刹车片厚度与刹车油","轮胎花纹 ≥3mm、胎压","链条清洁润滑","全车灯光检查","电瓶电压","空气滤清器"
];

const CHECKLIST_PERSON = [
  "体检（心肺功能）","保险（意外险 + 高原附加 + 商业险）","紧急联系人互换","离线地图下载","急救知识培训（CPR）","气象预报跟踪"
];

const COST_BREAKDOWN = [
  { label:"燃油", amount:1850, note:"按 2150km 主线 + 山区油耗浮动估算" },
  { label:"住宿", amount:2200, note:"11 晚，县城和镇上混合标准" },
  { label:"餐饮", amount:1100, note:"按 12 天骑行 + 2 天机动估算" },
  { label:"门票/停车/杂费", amount:500, note:"观景点、小修小补、停车和临时采购" },
  { label:"应急预备金", amount:1500, note:"拖车、改住、补胎、药品和天气绕行" },
];

const SUPPLY_RHYTHM = [
  { title:"加油节奏", desc:"过康定后不要等亮灯再找油。芒康、左贡、邦达、然乌这些节点默认加满。" },
  { title:"补水节奏", desc:"高海拔阶段别等口渴再喝水，每次休息固定补水和补糖。" },
  { title:"餐食节奏", desc:"午饭别拖太晚，避免下午在高海拔路段空腹和低糖。" },
  { title:"现金与支付", desc:"电子支付足够覆盖大多数场景，但队内至少留一笔离线现金兜底。" },
];

const PHOTO_STORIES = [
  {
    day: "D1",
    title: "成都出发，进入山线",
    caption: "城市边界逐渐退场，雅安之后正式切入川西山线节奏。",
    sky: "linear-gradient(180deg, #9fd3ff 0%, #dff3ff 36%, #335b7a 100%)",
    terrain: "linear-gradient(180deg, #3f6d5a 0%, #243f35 100%)",
    accent: "#8ed0ff",
  },
  {
    day: "D2",
    title: "折多山第一次抬升",
    caption: "从河谷一路抬升到垭口，视野和温度同时变化，是身体真正开始适应高海拔的一天。",
    sky: "linear-gradient(180deg, #7dc2ff 0%, #d8efff 34%, #6e7d90 100%)",
    terrain: "linear-gradient(180deg, #726b58 0%, #4f4636 100%)",
    accent: "#ffd28a",
  },
  {
    day: "D3",
    title: "高原平台拉开",
    caption: "连续翻越高海拔垭口，天空更近，风更直，理塘的空旷感会非常直接。",
    sky: "linear-gradient(180deg, #6db6ff 0%, #dcecff 38%, #7d8aa2 100%)",
    terrain: "linear-gradient(180deg, #98815d 0%, #66513a 100%)",
    accent: "#ffe099",
  },
  {
    day: "D5",
    title: "跨江入藏，山势变硬",
    caption: "从巴塘过金沙江进入西藏，路感和心理感受都会明显变化。",
    sky: "linear-gradient(180deg, #8cc8ff 0%, #eef7ff 34%, #6c6f78 100%)",
    terrain: "linear-gradient(180deg, #7b6352 0%, #43352d 100%)",
    accent: "#ffb38e",
  },
  {
    day: "D6",
    title: "怒江七十二拐",
    caption: "连续发卡弯和巨大落差，是全线最有压迫感、也最考验控车的一段。",
    sky: "linear-gradient(180deg, #8abfff 0%, #d7eaff 35%, #616a76 100%)",
    terrain: "linear-gradient(180deg, #8c725c 0%, #503f34 100%)",
    accent: "#ffbb7f",
  },
  {
    day: "D7-D8",
    title: "然乌到波密，色彩回归",
    caption: "湖水、林线、云墙和潮湿空气一起回来，视觉上是全线最舒展的一段。",
    sky: "linear-gradient(180deg, #7ad0ff 0%, #daf8ff 34%, #4f7487 100%)",
    terrain: "linear-gradient(180deg, #447b61 0%, #284f40 100%)",
    accent: "#7ff0c1",
  },
  {
    day: "D11",
    title: "米拉山之后，收束进拉萨",
    caption: "翻过最后一个大垭口后，整趟旅程开始从挑战切回收官。",
    sky: "linear-gradient(180deg, #8cc6ff 0%, #edf6ff 34%, #7e7f8b 100%)",
    terrain: "linear-gradient(180deg, #8b7a5a 0%, #564833 100%)",
    accent: "#d5c084",
  },
];

const EXPERIENCE_SECTIONS = [
  {
    id: "timing",
    icon: "🗓️",
    title: "出发窗口",
    summary: "优先选 5 月中下旬到 6 月上旬，或 9 月中旬到 9 月底。",
    bullets: [
      "雨季主段通常更容易遇到塌方、泥石流和长时间交通管制。",
      "过晚进藏更容易遇到垭口降雪、暗冰和早晚极低温。",
      "如果总假期偏短，宁可减少支线和停留点，也别压缩高海拔适应时间。"
    ]
  },
  {
    id: "rhythm",
    icon: "🧭",
    title: "骑行节奏",
    summary: "别把摩旅做成赶路，高海拔路段节奏比里程更重要。",
    bullets: [
      "进入 3000 米以上区域后，爬升快的时候要主动停车休息、补水和观察状态。",
      "遇到大车、落石、浓雾、雨雪时，优先保节奏和安全，不争一口气。",
      "如果当天状态差，提前住下比硬扛到原计划终点更合理。"
    ]
  },
  {
    id: "signal",
    icon: "📶",
    title: "通讯与导航",
    summary: "不要把导航和联络都压在一台手机、一张卡上。",
    bullets: [
      "建议至少两台设备或两种运营商组合，主导航和备用导航分开。",
      "离线地图和 GPX 提前下好，遇到无网区也能继续看路。",
      "重要联系人、住宿点和救援电话保存在本地，不依赖聊天记录回查。"
    ]
  },
  {
    id: "lodging",
    icon: "🏨",
    title: "住宿判断",
    summary: "川西和藏区住宿条件波动很大，别按城市标准预期。",
    bullets: [
      "县城通常更容易找到条件稳定的住宿，临时停在村镇时要先问清热水、洗浴和停车。",
      "旺季傍晚再找房更被动，遇到合适地点可以提前收车。",
      "如果前方有交通管制或天气恶化，不要执着于一定赶到下一个大县城。"
    ]
  },
  {
    id: "packing",
    icon: "🎒",
    title: "装备取舍",
    summary: "成熟线路先做减法，少带没用过、不会用、路上不好收纳的东西。",
    bullets: [
      "这条线路补给密度不算低，真正高频使用的是保暖、防雨、补胎、充电和药品。",
      "没有明确露营计划时，重型露营装备通常只会拖慢节奏。",
      "每件装备都要问自己两遍：会不会用、坏了能不能在路上替代。"
    ]
  },
  {
    id: "safety",
    icon: "⚠️",
    title: "安全底线",
    summary: "不夜骑、不硬撑、不和大车抢线，是最有价值的三条底线。",
    bullets: [
      "过弯前完成减速和降挡，弯中不做激烈操作。",
      "落石区、临崖区、视线差路段不要久停拍照。",
      "人不舒服、车不对劲、天气变坏，任何一个触发都值得降级当天计划。"
    ]
  }
];

const STORAGE_KEYS = {
  checkedEquip: "g318-checked-equip",
  checkedVehicle: "g318-checked-vehicle",
  checkedPerson: "g318-checked-person",
  activeDay: "g318-active-day",
  tab: "g318-tab",
  rideMode: "g318-ride-mode",
  gpxTracks: "g318-gpx-tracks",
  dayPhotos: "g318-day-photos",
};

function diffColor(d) {
  if (d === 0) return { bg:"#E8F5E9", fg:"#2E7D32", label:"休整" };
  if (d <= 2) return { bg:"#E3F2FD", fg:"#1565C0", label:"轻松" };
  if (d <= 3) return { bg:"#FFF8E1", fg:"#F57F17", label:"中等" };
  if (d <= 4) return { bg:"#FFF3E0", fg:"#E65100", label:"困难" };
  return { bg:"#FFEBEE", fg:"#C62828", label:"极难" };
}

function formatKm(km) {
  return `${Math.round(km).toLocaleString()} km`;
}

function haversine(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function getTrackDistance(points) {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) total += haversine(points[i - 1], points[i]);
  return total;
}

function getBounds(points) {
  return points.reduce((acc, p) => ({
    minLat: Math.min(acc.minLat, p.lat),
    maxLat: Math.max(acc.maxLat, p.lat),
    minLon: Math.min(acc.minLon, p.lon),
    maxLon: Math.max(acc.maxLon, p.lon),
  }), { minLat: Infinity, maxLat: -Infinity, minLon: Infinity, maxLon: -Infinity });
}

function getSchematicLayout(nodes, width, height, padding) {
  const totalDistance = nodes.reduce((sum, node) => sum + node.dist, 0);
  const maxAlt = Math.max(...nodes.map((node) => node.alt));
  const minAlt = Math.min(...nodes.map((node) => node.alt));
  const chartHeight = height - padding * 2;
  let cumulative = 0;

  return nodes.map((node) => {
    cumulative += node.dist;
    const x = padding + (cumulative / totalDistance) * (width - padding * 2);
    const y = height - padding - ((node.alt - minAlt) / (maxAlt - minAlt || 1)) * chartHeight * 0.72 - chartHeight * 0.06;
    return { ...node, x, y };
  });
}

function buildSmoothPath(points) {
  return points.map((point, index) => {
    if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
    const prev = points[index - 1];
    const midX = ((prev.x + point.x) / 2).toFixed(1);
    return `C ${midX} ${prev.y.toFixed(1)}, ${midX} ${point.y.toFixed(1)}, ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
  }).join(" ");
}

function VerticalLabel({ text, x, y, color, fontSize, gap = 22 }) {
  return (
    <text x={x} y={y} textAnchor="middle" fill={color} fontSize={fontSize} fontWeight="900">
      {text.split("").map((char, index) => (
        <tspan key={`${text}-${index}`} x={x} dy={index === 0 ? 0 : gap}>
          {char}
        </tspan>
      ))}
    </text>
  );
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function getCityLabelOffset(index) {
  const pattern = [
    { dx: 0, dy: 92 },
    { dx: 0, dy: 76 },
    { dx: 0, dy: 102 },
    { dx: 0, dy: 82 },
  ];
  return pattern[index % pattern.length];
}

function getPassLabelOffset(index) {
  const pattern = [
    { dx: 0, dy: -72, altDy: -36 },
    { dx: 0, dy: -58, altDy: -24 },
    { dx: 0, dy: -84, altDy: -42 },
  ];
  return pattern[index % pattern.length];
}

function parseGpxText(text) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(text, "application/xml");
  const parseError = xml.querySelector("parsererror");
  if (parseError) throw new Error("GPX 文件解析失败");

  const trackNodes = Array.from(xml.querySelectorAll("trk"));
  const routeNodes = Array.from(xml.querySelectorAll("rte"));
  const tracks = [];

  trackNodes.forEach((trackNode, index) => {
    const pts = Array.from(trackNode.querySelectorAll("trkpt")).map((node) => ({
      lat: Number(node.getAttribute("lat")),
      lon: Number(node.getAttribute("lon")),
      ele: Number(node.querySelector("ele")?.textContent || 0),
    })).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));

    if (pts.length > 1) {
      tracks.push({
        id: `trk-${index}-${Date.now()}`,
        name: trackNode.querySelector("name")?.textContent?.trim() || `GPX Track ${index + 1}`,
        points: pts,
        distance: getTrackDistance(pts),
      });
    }
  });

  routeNodes.forEach((routeNode, index) => {
    const pts = Array.from(routeNode.querySelectorAll("rtept")).map((node) => ({
      lat: Number(node.getAttribute("lat")),
      lon: Number(node.getAttribute("lon")),
      ele: Number(node.querySelector("ele")?.textContent || 0),
    })).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));

    if (pts.length > 1) {
      tracks.push({
        id: `rte-${index}-${Date.now()}`,
        name: routeNode.querySelector("name")?.textContent?.trim() || `GPX Route ${index + 1}`,
        points: pts,
        distance: getTrackDistance(pts),
      });
    }
  });

  if (!tracks.length) throw new Error("未发现可用轨迹点，请确认 GPX 包含 trkpt 或 rtept");
  return tracks;
}

function saveLocal(key, value) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

function loadLocal(key, fallback) {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function ElevationChart({ days, activeDay, onSelect }) {
  const W = 720;
  const H = 180;
  const PAD = 36;
  const maxAlt = 5500;
  const pts = days.map((d, i) => {
    const x = PAD + (i / (days.length - 1)) * (W - PAD * 2);
    const yEnd = H - PAD - ((d.altEnd / maxAlt) * (H - PAD * 2));
    const yMax = H - PAD - ((d.altMax / maxAlt) * (H - PAD * 2));
    return { x, yEnd, yMax, day: d };
  });

  const areaPath = `M ${pts[0].x} ${H - PAD} ${pts.map((p) => `L ${p.x} ${p.yEnd}`).join(" ")} L ${pts[pts.length - 1].x} ${H - PAD} Z`;
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.yEnd}`).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", display:"block" }}>
      {[1000, 2000, 3000, 4000, 5000].map((alt) => {
        const y = H - PAD - ((alt / maxAlt) * (H - PAD * 2));
        return (
          <g key={alt}>
            <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="var(--grid)" strokeWidth="0.8" strokeDasharray="4 4" />
            <text x={PAD - 6} y={y + 4} textAnchor="end" fill="var(--label)" fontSize="10">{alt}m</text>
          </g>
        );
      })}
      <defs>
        <linearGradient id="elevGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.42" />
          <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0.03" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#elevGrad)" />
      <path d={linePath} fill="none" stroke="var(--accent)" strokeWidth="2.2" />
      {pts.map((p, i) => p.day.altMax > p.day.altEnd + 200 && (
        <g key={`peak-${i}`}>
          <line x1={p.x} x2={p.x} y1={p.yEnd} y2={p.yMax} stroke="var(--warn)" strokeWidth="1" strokeDasharray="2 3" />
          <circle cx={p.x} cy={p.yMax} r="3.5" fill="var(--warn)" />
        </g>
      ))}
      {pts.map((p, i) => (
        <g key={p.day.day} style={{ cursor:"pointer" }} onClick={() => onSelect(i)}>
          <circle cx={p.x} cy={p.yEnd} r={activeDay === i ? 7 : 4.5} fill={activeDay === i ? "var(--accent)" : "var(--dot)"} stroke={activeDay === i ? "var(--bg)" : "none"} strokeWidth="2" />
          <text x={p.x} y={H - PAD + 15} textAnchor="middle" fill={activeDay === i ? "var(--accent)" : "var(--label)"} fontSize="10" fontWeight={activeDay === i ? 800 : 500}>{p.day.day}</text>
        </g>
      ))}
    </svg>
  );
}

function RouteMap({ activeDay, importedTracks, onSelectDay }) {
  const width = 1280;
  const height = 620;
  const padding = 52;
  const cityLabelBottom = height - 118;
  const cityLabelTop = 180;
  const passLabelTop = 86;
  const points = getSchematicLayout(ROUTE_SCHEMATIC_NODES, width, height, padding);
  const officialPath = buildSmoothPath(points);

  return (
    <div style={{ background:"linear-gradient(180deg, rgba(9,16,26,0.86), rgba(9,16,26,1))", borderRadius:18, border:"1px solid var(--border)", overflow:"hidden" }}>
      <div style={{ padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:"1px solid rgba(133,155,178,0.16)" }}>
        <div>
          <div style={{ fontSize:13, color:"var(--muted)", marginBottom:4 }}>川藏路线图</div>
          <div style={{ fontSize:17, fontWeight:800 }}>成都 → 拉萨 · 示意线路图</div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"flex-end" }}>
          <span className="chip">示意图风格</span>
          {importedTracks.length > 0 && <span className="chip chip-track">GPX 已导入 {importedTracks.length} 条</span>}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} style={{ width:"100%", display:"block", background:"linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))" }}>
        <text x={padding} y="42" fill="rgba(236,243,250,0.9)" fontSize="26" fontWeight="900">《川藏南线示意图》</text>

        <path d={officialPath} fill="none" stroke="rgba(75,177,255,0.18)" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
        <path d={officialPath} fill="none" stroke="#4ba7ff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />

        {points.slice(1).map((point, index) => {
          if (!SCHEMATIC_DISTANCE_LABEL_INDICES.has(index + 1)) return null;
          const prev = points[index];
          const midX = (prev.x + point.x) / 2;
          const bend = index % 2 === 0 ? 34 : 48;
          const midY = Math.min(prev.y, point.y) - bend;
          return (
            <text key={`${prev.name}-${point.name}`} x={midX} y={midY} textAnchor="middle" fill="rgba(255,240,214,0.88)" fontSize="13" fontStyle="italic">
              {point.dist}km
            </text>
          );
        })}

        {points.map((point, index) => {
          const isPass = point.type === "pass";
          const isActive = point.day - 1 === activeDay;
          const isCity = point.type === "city";
          const labelColor = isPass ? "#8bc9ff" : "#2e96ff";
          const cityOffset = SCHEMATIC_LABEL_OVERRIDES[point.name]?.city || getCityLabelOffset(index);
          const passOffset = SCHEMATIC_LABEL_OVERRIDES[point.name]?.pass || getPassLabelOffset(index);
          const altY = isPass ? point.y + passOffset.altDy : point.y - 18;
          const unclampedNameY = isCity ? point.y + cityOffset.dy : point.y + passOffset.dy;
          const labelHeight = isCity ? Math.max(point.name.length - 1, 0) * 18 : 0;
          const nameY = isCity
            ? clamp(unclampedNameY, cityLabelTop, cityLabelBottom - labelHeight)
            : clamp(unclampedNameY, passLabelTop, point.y - 44);
          const rotation = isCity ? 0 : 0;

          return (
            <g key={point.name} style={{ cursor:"pointer" }} onClick={() => onSelectDay(Math.max(0, point.day - 1))}>
              <circle cx={point.x} cy={point.y} r={isActive ? 8 : 6} fill={isActive ? "var(--warn)" : "#f2dfd3"} stroke="#c77f59" strokeWidth="2.5" />
              {isPass && (
                <path d={`M ${point.x - 18} ${point.y + 18} L ${point.x - 6} ${point.y - 6} L ${point.x + 2} ${point.y + 10} L ${point.x + 14} ${point.y - 14} L ${point.x + 26} ${point.y + 18}`} fill="none" stroke="#2a95ff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
              )}
              <text x={point.x} y={isPass ? clamp(altY, 58, point.y - 18) : altY} textAnchor="middle" fill="rgba(236,243,250,0.92)" fontSize="12" fontWeight="700">
                {point.alt}
              </text>
              {isCity ? (
                <VerticalLabel
                  text={point.name}
                  x={point.x + cityOffset.dx}
                  y={nameY}
                  color={labelColor}
                  fontSize={17}
                  gap={18}
                />
              ) : (
                <text
                  x={point.x + passOffset.dx}
                  y={nameY}
                  textAnchor="middle"
                  fill={labelColor}
                  fontSize={14}
                  fontWeight="900"
                  transform={rotation ? `rotate(${rotation} ${point.x} ${nameY})` : undefined}
                >
                  {point.name}
                </text>
              )}
              {isActive && (
                <circle cx={point.x} cy={point.y} r="14" fill="none" stroke="rgba(245,166,35,0.42)" strokeWidth="3" />
              )}
            </g>
          );
        })}

        <text x={padding} y={height - 18} fill="rgba(157,176,196,0.88)" fontSize="13">
          按成都 → 拉萨方向绘制，参考川藏南线线路示意图样式重构；用于路书阅读，不用于精确导航。
        </text>
      </svg>
    </div>
  );
}

function Tabs({ tabs, active, onChange, rideMode, mobile }) {
  return (
    <div className={rideMode && mobile ? "tabs tabs-mobile" : "tabs"}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`tab-btn ${active === tab.id ? "tab-btn-active" : ""}`}
        >
          <span>{tab.icon}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

function DayPhotoTab({ days, photosByDay, onUpload, onPreview, onRemove }) {
  const inputRefs = useRef({});

  return (
    <div>
      <div className="section-card" style={{ marginBottom:16 }}>
        <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>每日实景</div>
        <div style={{ fontSize:24, fontWeight:900, marginBottom:8 }}>按天上传实景照片</div>
        <div style={{ fontSize:14, color:"var(--muted)", lineHeight:1.8 }}>
          图片保存在当前浏览器本地，适合你自己整理每天的路况、天气和打卡照片。支持缩略图预览和大图查看。
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px,1fr))", gap:12 }}>
        {days.map((day, index) => {
          const photos = photosByDay[day.day] || [];
          return (
            <div key={day.day} className="section-card" style={{ padding:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"flex-start", marginBottom:12 }}>
                <div>
                  <div style={{ fontSize:15, fontWeight:900 }}>{day.day} · {day.from} → {day.to}</div>
                  <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{day.km} km · {photos.length} 张图片</div>
                </div>
                <button className="btn btn-primary" onClick={() => inputRefs.current[day.day]?.click()}>
                  上传
                </button>
              </div>

              <input
                ref={(node) => { inputRefs.current[day.day] = node; }}
                type="file"
                accept="image/*"
                multiple
                style={{ display:"none" }}
                onChange={(event) => onUpload(day.day, event)}
              />

              {photos.length ? (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(2, minmax(0,1fr))", gap:8 }}>
                  {photos.map((photo) => (
                    <div key={photo.id} style={{ position:"relative", borderRadius:14, overflow:"hidden", background:"var(--card)", border:"1px solid var(--border)" }}>
                      <img
                        src={photo.dataUrl}
                        alt={photo.name}
                        style={{ width:"100%", aspectRatio:"4 / 3", objectFit:"cover", display:"block", cursor:"pointer" }}
                        onClick={() => onPreview(photo)}
                      />
                      <div style={{ position:"absolute", left:8, right:8, bottom:8, display:"flex", justifyContent:"space-between", gap:6, alignItems:"center" }}>
                        <div style={{ padding:"4px 8px", borderRadius:999, background:"rgba(7,17,28,0.68)", color:"#fff", fontSize:11, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {photo.name}
                        </div>
                        <button
                          onClick={() => onRemove(day.day, photo.id)}
                          style={{ border:"none", borderRadius:999, width:28, height:28, background:"rgba(232,93,74,0.88)", color:"#fff", cursor:"pointer", fontWeight:900 }}
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding:"26px 14px", borderRadius:14, border:"1px dashed var(--border)", color:"var(--muted)", fontSize:13, textAlign:"center", lineHeight:1.7 }}>
                  当前还没有图片
                  <br />
                  建议按天上传路况、天气、垭口和住宿实景
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PwaMeta({ onInstallReady }) {
  useEffect(() => {
    const head = document.head;
    const metaTheme = document.querySelector('meta[name="theme-color"]') || document.createElement("meta");
    metaTheme.setAttribute("name", "theme-color");
    metaTheme.setAttribute("content", "#0b1420");
    head.appendChild(metaTheme);

    const metaApple = document.querySelector('meta[name="apple-mobile-web-app-capable"]') || document.createElement("meta");
    metaApple.setAttribute("name", "apple-mobile-web-app-capable");
    metaApple.setAttribute("content", "yes");
    head.appendChild(metaApple);

    const metaStatus = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') || document.createElement("meta");
    metaStatus.setAttribute("name", "apple-mobile-web-app-status-bar-style");
    metaStatus.setAttribute("content", "black-translucent");
    head.appendChild(metaStatus);

    const metaViewport = document.querySelector('meta[name="viewport"]') || document.createElement("meta");
    metaViewport.setAttribute("name", "viewport");
    metaViewport.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");
    head.appendChild(metaViewport);

    const manifestLink = document.querySelector('link[rel="manifest"]') || document.createElement("link");
    manifestLink.setAttribute("rel", "manifest");
    manifestLink.setAttribute("href", "./manifest.webmanifest");
    head.appendChild(manifestLink);

    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') || document.createElement("link");
    appleIcon.setAttribute("rel", "apple-touch-icon");
    appleIcon.setAttribute("href", "./pwa-icon.svg");
    head.appendChild(appleIcon);

    // v1 prioritizes reliability over offline caching. Auto-remove any old
    // service workers and caches so users do not need to clear mobile cache manually.
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => (
        Promise.all(registrations.map((registration) => registration.unregister()))
      )).catch(() => {});
    }
    if ("caches" in window) {
      window.caches.keys().then((keys) => (
        Promise.all(keys.filter((key) => key.startsWith("g318-adv-pwa")).map((key) => window.caches.delete(key)))
      )).catch(() => {});
    }

    const onBeforeInstallPrompt = (event) => {
      event.preventDefault();
      onInstallReady(event);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, [onInstallReady]);

  return null;
}

function App() {
  const [tab, setTab] = useState("route");
  const [activeDay, setActiveDay] = useState(0);
  const [checkedEquip, setCheckedEquip] = useState({});
  const [checkedVehicle, setCheckedVehicle] = useState({});
  const [checkedPerson, setCheckedPerson] = useState({});
  const [openEmergency, setOpenEmergency] = useState(null);
  const [expandedCat, setExpandedCat] = useState(Object.keys(EQUIPMENT)[0]);
  const [rideMode, setRideMode] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [importedTracks, setImportedTracks] = useState([]);
  const [gpxMessage, setGpxMessage] = useState("未导入 GPX，当前显示官方建议路线");
  const [installEvent, setInstallEvent] = useState(null);
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [dayPhotos, setDayPhotos] = useState({});
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setCheckedEquip(loadLocal(STORAGE_KEYS.checkedEquip, {}));
    setCheckedVehicle(loadLocal(STORAGE_KEYS.checkedVehicle, {}));
    setCheckedPerson(loadLocal(STORAGE_KEYS.checkedPerson, {}));
    setActiveDay(loadLocal(STORAGE_KEYS.activeDay, 0));
    setTab(loadLocal(STORAGE_KEYS.tab, "route"));
    setRideMode(loadLocal(STORAGE_KEYS.rideMode, false));
    setImportedTracks(loadLocal(STORAGE_KEYS.gpxTracks, []));
    setDayPhotos(loadLocal(STORAGE_KEYS.dayPhotos, {}));
  }, []);

  useEffect(() => saveLocal(STORAGE_KEYS.checkedEquip, checkedEquip), [checkedEquip]);
  useEffect(() => saveLocal(STORAGE_KEYS.checkedVehicle, checkedVehicle), [checkedVehicle]);
  useEffect(() => saveLocal(STORAGE_KEYS.checkedPerson, checkedPerson), [checkedPerson]);
  useEffect(() => saveLocal(STORAGE_KEYS.activeDay, activeDay), [activeDay]);
  useEffect(() => saveLocal(STORAGE_KEYS.tab, tab), [tab]);
  useEffect(() => saveLocal(STORAGE_KEYS.rideMode, rideMode), [rideMode]);
  useEffect(() => saveLocal(STORAGE_KEYS.gpxTracks, importedTracks), [importedTracks]);
  useEffect(() => saveLocal(STORAGE_KEYS.dayPhotos, dayPhotos), [dayPhotos]);

  useEffect(() => {
    const updateViewport = () => setMobile(window.innerWidth <= 820);
    const updateOnline = () => setOnline(window.navigator.onLine);
    updateViewport();
    updateOnline();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);

  useEffect(() => {
    if (!importedTracks.length) return;
    const total = importedTracks.reduce((sum, track) => sum + track.distance, 0);
    setGpxMessage(`已导入 ${importedTracks.length} 条 GPX 轨迹，合计约 ${formatKm(total)}`);
  }, [importedTracks]);

  const d = DAYS[activeDay];
  const dc = diffColor(d.difficulty);
  const totalKm = DAYS.reduce((sum, day) => sum + day.km, 0);
  const totalEquip = Object.values(EQUIPMENT).reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedEquipCount = Object.values(checkedEquip).filter(Boolean).length;
  const nextDay = DAYS[Math.min(activeDay + 1, DAYS.length - 1)];
  const tabs = [
    { id:"route", icon:"🗺️", label:"路书" },
    { id:"tips", icon:"📒", label:"经验" },
    { id:"equip", icon:"🎒", label:"装备" },
    { id:"emergency", icon:"🆘", label:"应急" },
    { id:"checklist", icon:"✅", label:"出发" },
    { id:"photos", icon:"🖼️", label:"实景打卡" },
  ];

  const handleInstall = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    setInstallEvent(null);
  };

  const handleGpxImport = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const tracks = parseGpxText(text);
      setImportedTracks(tracks);
      setTab("route");
    } catch (error) {
      setGpxMessage(error.message || "GPX 导入失败");
    } finally {
      event.target.value = "";
    }
  };

  const clearGpx = () => {
    setImportedTracks([]);
    setGpxMessage("已清除 GPX，显示官方建议路线");
  };

  const handlePhotoUpload = async (dayKey, event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const readFile = (file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve({
        id: `${dayKey}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        dataUrl: reader.result,
      });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    try {
      const nextPhotos = await Promise.all(files.map(readFile));
      setDayPhotos((prev) => ({
        ...prev,
        [dayKey]: [...(prev[dayKey] || []), ...nextPhotos],
      }));
    } finally {
      event.target.value = "";
    }
  };

  const handlePhotoRemove = (dayKey, photoId) => {
    setDayPhotos((prev) => ({
      ...prev,
      [dayKey]: (prev[dayKey] || []).filter((photo) => photo.id !== photoId),
    }));
    if (previewPhoto?.id === photoId) setPreviewPhoto(null);
  };

  const toggleEquip = (key) => setCheckedEquip((prev) => ({ ...prev, [key]: !prev[key] }));
  const toggleVehicle = (key) => setCheckedVehicle((prev) => ({ ...prev, [key]: !prev[key] }));
  const togglePerson = (key) => setCheckedPerson((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div style={{
      "--bg":"#07111C",
      "--bg-2":"#0B1420",
      "--surface":"rgba(18, 28, 42, 0.88)",
      "--card":"rgba(25, 39, 58, 0.96)",
      "--border":"rgba(133, 155, 178, 0.16)",
      "--text":"#ECF3FA",
      "--muted":"#9DB0C4",
      "--label":"#72859B",
      "--accent":"#3B9EFF",
      "--accent-2":"#12DB9B",
      "--warn":"#F5A623",
      "--danger":"#E85D4A",
      "--success":"#34C759",
      "--dot":"#6E8093",
      "--grid":"rgba(141, 163, 186, 0.18)",
      fontFamily:"'Noto Sans SC', 'PingFang SC', -apple-system, BlinkMacSystemFont, sans-serif",
      background:"radial-gradient(circle at top, rgba(59,158,255,0.12), transparent 26%), linear-gradient(180deg, #08111d 0%, #07111c 42%, #050c14 100%)",
      color:"var(--text)",
      minHeight:"100vh"
    }}>
      <PwaMeta onInstallReady={setInstallEvent} />

      <style>{`
        * { box-sizing: border-box; }
        .app-shell { max-width: 1180px; margin: 0 auto; padding: 22px 16px 96px; }
        .glass { background: var(--surface); border: 1px solid var(--border); box-shadow: 0 24px 80px rgba(0,0,0,.24); }
        .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 18px; }
        .stats-card { border-radius: 16px; padding: 14px 12px; background: linear-gradient(180deg, rgba(255,255,255,.04), rgba(255,255,255,.02)); border: 1px solid var(--border); }
        .tabs { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; flex-wrap: wrap; }
        .tabs-mobile { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 40; background: rgba(6,12,20,.92); border: 1px solid rgba(255,255,255,.08); border-radius: 18px; padding: 8px; backdrop-filter: blur(14px); box-shadow: 0 20px 40px rgba(0,0,0,.35); }
        .tab-btn { border: none; background: transparent; color: var(--muted); padding: 11px 14px; border-radius: 14px; display: flex; gap: 8px; align-items: center; font: inherit; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .tab-btn-active { color: var(--text); background: linear-gradient(135deg, rgba(59,158,255,.18), rgba(18,219,155,.16)); }
        .chip { padding: 6px 10px; border-radius: 999px; background: rgba(59,158,255,.12); color: #8ac5ff; font-size: 12px; font-weight: 700; border: 1px solid rgba(59,158,255,.18); }
        .chip-track { background: rgba(245,166,35,.12); color: #ffd088; border-color: rgba(245,166,35,.18); }
        .route-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 16px; }
        .pill-row { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
        .day-pill { border: 1px solid var(--border); background: rgba(255,255,255,.03); color: var(--text); padding: 10px 14px; border-radius: 999px; font: inherit; font-weight: 700; cursor: pointer; white-space: nowrap; }
        .day-pill-active { background: linear-gradient(135deg, var(--accent), #1bb7ff); border-color: transparent; color: #fff; }
        .section-card { border-radius: 18px; padding: 18px; background: var(--surface); border: 1px solid var(--border); }
        .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; }
        .hud { display: grid; grid-template-columns: 1.2fr .8fr; gap: 14px; margin-bottom: 16px; }
        .hud-card { border-radius: 18px; padding: 16px; background: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.02)); border: 1px solid var(--border); }
        .hud-kpi { font-size: 30px; font-weight: 900; line-height: 1; margin-bottom: 8px; }
        .list-row { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; }
        .checker { width: 22px; height: 22px; border-radius: 7px; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; border: 2px solid var(--muted); }
        .checker-on { background: var(--success); border-color: var(--success); color: white; }
        .btn { border: none; border-radius: 14px; padding: 11px 14px; cursor: pointer; font: inherit; font-weight: 800; }
        .btn-primary { background: linear-gradient(135deg, var(--accent), #00c2ff); color: #fff; }
        .btn-soft { background: rgba(255,255,255,.06); color: var(--text); border: 1px solid var(--border); }
        .mode-switch { display: inline-flex; padding: 4px; border-radius: 999px; background: rgba(255,255,255,.05); border: 1px solid var(--border); gap: 4px; }
        .mode-switch button { border: none; background: transparent; color: var(--muted); border-radius: 999px; padding: 8px 12px; font: inherit; font-weight: 800; cursor: pointer; }
        .mode-switch .on { background: linear-gradient(135deg, rgba(59,158,255,.22), rgba(18,219,155,.18)); color: var(--text); }
        @media (max-width: 980px) {
          .route-grid, .hud, .detail-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 820px) {
          .app-shell { padding: 14px 12px 104px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .tabs { flex-wrap: nowrap; }
        }
        @media (max-width: 640px) {
          .section-card { padding: 14px; border-radius: 16px; }
          .hud-kpi { font-size: 26px; }
        }
      `}</style>

      <div className="app-shell">
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:20, flexWrap:"wrap" }}>
          <div>
            <div style={{ fontSize:12, letterSpacing:4, color:"var(--muted)", textTransform:"uppercase", marginBottom:8 }}>G318 Adventure Ride Book</div>
            <h1 style={{ margin:"0 0 8px", fontSize:mobile ? 28 : 38, lineHeight:1.05, fontWeight:900, letterSpacing:"-0.02em" }}>
              <span style={{ background:"linear-gradient(135deg, #ECF3FA 0%, #89D2FF 40%, #44F0BF 100%)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>
                川藏 ADV 摩旅导航
              </span>
            </h1>
            <div style={{ fontSize:14, color:"var(--muted)" }}>队友手机直接打开即可查看路线、日程、装备和应急信息</div>
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10, flexWrap:"wrap" }}>
            <div className="mode-switch">
              <button className={!rideMode ? "on" : ""} onClick={() => setRideMode(false)}>计划模式</button>
              <button className={rideMode ? "on" : ""} onClick={() => setRideMode(true)}>骑行模式</button>
            </div>
            {installEvent && <button className="btn btn-primary" onClick={handleInstall}>安装到主屏幕</button>}
            <span className="chip" style={{ color: online ? "#8ef0c4" : "#ffd088", borderColor: online ? "rgba(52,199,89,.22)" : "rgba(245,166,35,.18)" }}>
              {online ? "在线" : "离线可用"}
            </span>
          </div>
        </div>

        <div className="stats-grid">
          {[
            { label:"总里程", value:`${totalKm} km`, color:"#7CC4FF" },
            { label:"最高海拔", value:"5,130 m", color:"#FFCE7A" },
            { label:"建议天数", value:"12–14 天", color:"#7CF0BE" },
            { label:"当前模式", value:rideMode ? "骑行" : "计划", color:"#FF9B92" },
          ].map((item) => (
            <div key={item.label} className="stats-card">
              <div style={{ fontSize:28, fontWeight:900, color:item.color, marginBottom:6 }}>{item.value}</div>
              <div style={{ fontSize:12, color:"var(--muted)" }}>{item.label}</div>
            </div>
          ))}
        </div>

        {!rideMode && (
          <div className="section-card" style={{ marginBottom:18 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:10 }}>
              {[
                { title:"📱 手机打开", text:"直接用浏览器打开链接，适合导航前快速查看。" },
                { title:"🧭 骑行查看", text:"切到骑行模式后，重点展示当天路段、海拔和风险提示。" },
                { title:"📦 离线可用", text:"首次联网打开后可安装到主屏幕，后续离线重开。" },
                { title:"👥 发给队友", text:"统一链接分发，所有人看到的是同一份路书和应急信息。" },
              ].map((item) => (
                <div key={item.title} style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                  <div style={{ fontSize:15, fontWeight:900, marginBottom:6 }}>{item.title}</div>
                  <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!rideMode && (
          <div className="route-grid" style={{ marginBottom:18 }}>
            <div className="section-card">
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>费用与补给</div>
              <div style={{ fontSize:24, fontWeight:900, marginBottom:8 }}>按主线骑行准备一笔够稳的预算</div>
              <div style={{ fontSize:14, color:"var(--muted)", lineHeight:1.8, marginBottom:14 }}>
                预算不是为了精确到个位，而是为了避免你在高海拔和偏远路段因为“省这一点”而压缩休息、错过加油或硬扛车况问题。
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(150px,1fr))", gap:10 }}>
                <div style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                  <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>基础预算</div>
                  <div style={{ fontSize:22, fontWeight:900 }}>¥{COST_BREAKDOWN.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}</div>
                </div>
                <div style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                  <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>建议备用金</div>
                  <div style={{ fontSize:22, fontWeight:900 }}>¥1,500+</div>
                </div>
                <div style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                  <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>油料策略</div>
                  <div style={{ fontSize:13, lineHeight:1.7 }}>进高海拔后默认“路过能加就加”。</div>
                </div>
              </div>
            </div>

            <div className="section-card">
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>每日实景</div>
              <div style={{ fontSize:24, fontWeight:900, marginBottom:8 }}>把路线变成有地貌变化感的故事</div>
              <div style={{ fontSize:14, color:"var(--muted)", lineHeight:1.8 }}>
                这里不是照片图库，而是给骑行前快速建立“今天会看到什么、会经历什么”的视觉预期。
              </div>
            </div>
          </div>
        )}

        {rideMode && (
          <div className="hud">
            <div className="hud-card">
              <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>当前骑行日</div>
                  <div className="hud-kpi">{d.day} · {d.from} → {d.to}</div>
                  <div style={{ fontSize:14, color:"var(--muted)" }}>{d.road}</div>
                </div>
                <div style={{ background:dc.bg, color:dc.fg, borderRadius:999, padding:"7px 12px", fontSize:12, fontWeight:900 }}>{dc.label}</div>
              </div>

              <div style={{ display:"grid", gridTemplateColumns:"repeat(3, minmax(0,1fr))", gap:10, marginTop:16 }}>
                <div style={{ padding:12, borderRadius:14, background:"rgba(255,255,255,.04)" }}>
                  <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>里程</div>
                  <div style={{ fontSize:22, fontWeight:900 }}>{d.km} km</div>
                </div>
                <div style={{ padding:12, borderRadius:14, background:"rgba(255,255,255,.04)" }}>
                  <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>终点海拔</div>
                  <div style={{ fontSize:22, fontWeight:900 }}>{d.altEnd} m</div>
                </div>
                <div style={{ padding:12, borderRadius:14, background:"rgba(255,255,255,.04)" }}>
                  <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>最高点</div>
                  <div style={{ fontSize:22, fontWeight:900 }}>{d.altMax} m</div>
                </div>
              </div>
            </div>

            <div className="hud-card">
              <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>骑行提示</div>
              <div style={{ fontSize:15, fontWeight:800, marginBottom:10 }}>{d.warn}</div>
              <div style={{ fontSize:12, color:"var(--muted)", lineHeight:1.6, marginBottom:14 }}>
                下一日：{nextDay.day} · {nextDay.from} → {nextDay.to} · {nextDay.km} km
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button className="btn btn-soft" onClick={() => setActiveDay(Math.max(0, activeDay - 1))}>上一日</button>
                <button className="btn btn-primary" onClick={() => setActiveDay(Math.min(DAYS.length - 1, activeDay + 1))}>下一日</button>
              </div>
            </div>
          </div>
        )}

        {!rideMode && (
          <div className="section-card" style={{ marginBottom:18 }}>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:10 }}>
              {[
                { title:"最佳窗口", text:"建议 5–6 月初或 9 月中下旬，尽量避开雨季主段和大雪窗口。" },
                { title:"信号策略", text:"主导航、备用导航和联系人不要压在同一台设备上。" },
                { title:"住宿策略", text:"遇到天气和交通不稳时，先住下比强行赶路更值。" },
                { title:"装备原则", text:"优先带高频使用的保暖、防雨、补胎和供电装备。" },
              ].map((item) => (
                <div key={item.title} style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                  <div style={{ fontSize:15, fontWeight:900, marginBottom:6 }}>{item.title}</div>
                  <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>{item.text}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Tabs tabs={tabs} active={tab} onChange={setTab} rideMode={rideMode} mobile={mobile} />

        <div style={{ marginTop:18 }}>
          {tab === "route" && (
            <div className="route-grid">
              <div style={{ display:"grid", gap:16 }}>
                <RouteMap activeDay={activeDay} importedTracks={importedTracks} onSelectDay={setActiveDay} />

                <div className="section-card">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, flexWrap:"wrap", marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:13, color:"var(--muted)", marginBottom:6 }}>GPX 导入</div>
                      <div style={{ fontSize:16, fontWeight:800 }}>{gpxMessage}</div>
                    </div>
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                      <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>导入 GPX</button>
                      <button className="btn btn-soft" onClick={clearGpx} disabled={!importedTracks.length} style={{ opacity: importedTracks.length ? 1 : 0.45 }}>清除轨迹</button>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept=".gpx,application/gpx+xml,application/xml,text/xml" onChange={handleGpxImport} style={{ display:"none" }} />
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(160px,1fr))", gap:10 }}>
                    <div style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                      <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>官方路线</div>
                      <div style={{ fontSize:18, fontWeight:900 }}>{formatKm(totalKm)}</div>
                    </div>
                    <div style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                      <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>已导轨迹</div>
                      <div style={{ fontSize:18, fontWeight:900 }}>{importedTracks.length} 条</div>
                    </div>
                    <div style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                      <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>适配说明</div>
                      <div style={{ fontSize:13, color:"var(--text)", lineHeight:1.6 }}>支持 `trkpt` / `rtept`，导入后会叠加在路线图上。</div>
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:10 }}>海拔剖面</div>
                  <ElevationChart days={DAYS} activeDay={activeDay} onSelect={setActiveDay} />
                </div>
              </div>

              <div style={{ display:"grid", gap:16 }}>
                <div className="section-card">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:8, marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:13, color:"var(--muted)", marginBottom:6 }}>日程切换</div>
                      <div style={{ fontSize:18, fontWeight:900 }}>{d.day} · {d.from} → {d.to}</div>
                    </div>
                    <div style={{ background:dc.bg, color:dc.fg, borderRadius:999, padding:"6px 10px", fontSize:12, fontWeight:900 }}>{dc.label}</div>
                  </div>
                  <div className="pill-row">
                    {DAYS.map((day, index) => (
                      <button key={day.day} className={`day-pill ${index === activeDay ? "day-pill-active" : ""}`} onClick={() => setActiveDay(index)}>{day.day}</button>
                    ))}
                  </div>
                </div>

                <div className="section-card">
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, marginBottom:14 }}>
                    <div>
                      <div style={{ fontSize:26, fontWeight:900, marginBottom:6 }}>{d.day}</div>
                      <div style={{ fontSize:18, fontWeight:800 }}>{d.from} → {d.to}</div>
                    </div>
                    {d.km > 0 && <div style={{ borderRadius:14, padding:"10px 12px", background:"rgba(59,158,255,.12)", color:"#90d0ff", fontSize:18, fontWeight:900 }}>{d.km} km</div>}
                  </div>

                  <div className="detail-grid" style={{ marginBottom:14 }}>
                    <div style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                      <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>路况</div>
                      <div style={{ fontSize:14, lineHeight:1.7 }}>{d.road}</div>
                    </div>
                    <div style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                      <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>海拔变化</div>
                      <div style={{ fontSize:16, fontWeight:900 }}>{d.altStart.toLocaleString()} → {d.altEnd.toLocaleString()} m</div>
                      <div style={{ fontSize:12, color:"var(--warn)", marginTop:6 }}>最高点：{d.altMaxName} · {d.altMax.toLocaleString()} m</div>
                    </div>
                  </div>

                  {[
                    ["📍 关键节点", d.nodes],
                    ["⛽ 加油建议", d.fuel],
                    ["🏨 住宿建议", d.stay],
                  ].map(([label, value]) => (
                    <div key={label} className="list-row" style={{ borderTop:"1px solid var(--border)" }}>
                      <div style={{ minWidth:84, fontSize:13, color:"var(--muted)", fontWeight:800 }}>{label}</div>
                      <div style={{ fontSize:14, lineHeight:1.7 }}>{value}</div>
                    </div>
                  ))}

                  <div style={{ marginTop:14, padding:14, borderRadius:14, background:"rgba(232,93,74,.1)", border:"1px solid rgba(232,93,74,.18)" }}>
                    <div style={{ fontSize:12, color:"#ffae9c", fontWeight:900, marginBottom:6 }}>风险提示</div>
                    <div style={{ fontSize:14, lineHeight:1.7 }}>{d.warn}</div>
                  </div>

                  <div style={{ display:"flex", gap:8, marginTop:14 }}>
                    <button className="btn btn-soft" onClick={() => setActiveDay(Math.max(0, activeDay - 1))}>上一日</button>
                    <button className="btn btn-primary" onClick={() => setActiveDay(Math.min(DAYS.length - 1, activeDay + 1))}>下一日</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "tips" && (
            <div>
              <div className="route-grid" style={{ marginBottom:16 }}>
                <div className="section-card">
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>路线经验</div>
                  <div style={{ fontSize:24, fontWeight:900, marginBottom:8 }}>把路书做成能上路的决策工具</div>
                  <div style={{ fontSize:14, color:"var(--muted)", lineHeight:1.8 }}>
                    这一版把常见川藏攻略里真正高频、真正能降低失误率的信息抽出来了。重点不是堆素材，而是帮骑行中快速判断：
                    今天该不该继续赶，设备怎么备份，住哪里更稳，哪些装备其实可以不带。
                  </div>
                </div>

                <div className="section-card">
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>三条总原则</div>
                  {[
                    "高海拔先看状态，再看里程。",
                    "天气、路况、车况任一变差，就主动降级计划。",
                    "成熟线路不等于没有风险，真正的风险通常来自赶路和侥幸。"
                  ].map((item) => (
                    <div key={item} style={{ padding:"12px 14px", borderRadius:14, background:"var(--card)", marginBottom:10, fontSize:14, lineHeight:1.7 }}>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              {EXPERIENCE_SECTIONS.map((section) => (
                <div key={section.id} className="section-card" style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, flexWrap:"wrap", marginBottom:12 }}>
                    <div>
                      <div style={{ fontSize:18, fontWeight:900 }}>{section.icon} {section.title}</div>
                      <div style={{ fontSize:13, color:"var(--muted)", marginTop:6 }}>{section.summary}</div>
                    </div>
                  </div>
                  <div style={{ display:"grid", gap:10 }}>
                    {section.bullets.map((bullet) => (
                      <div key={bullet} style={{ padding:"12px 14px", borderRadius:14, background:"var(--card)", fontSize:14, lineHeight:1.7 }}>
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="route-grid" style={{ marginTop:18, marginBottom:18 }}>
                <div className="section-card">
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>费用拆分</div>
                  <div style={{ fontSize:20, fontWeight:900, marginBottom:12 }}>基础预算建议</div>
                  {COST_BREAKDOWN.map((item) => (
                    <div key={item.label} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"12px 14px", borderRadius:14, background:"var(--card)", marginBottom:10 }}>
                      <div>
                        <div style={{ fontSize:14, fontWeight:900 }}>{item.label}</div>
                        <div style={{ fontSize:12, color:"var(--muted)", marginTop:4, lineHeight:1.6 }}>{item.note}</div>
                      </div>
                      <div style={{ fontSize:18, fontWeight:900, whiteSpace:"nowrap" }}>¥{item.amount.toLocaleString()}</div>
                    </div>
                  ))}
                </div>

                <div className="section-card">
                  <div style={{ fontSize:13, color:"var(--muted)", marginBottom:8 }}>补给策略</div>
                  <div style={{ fontSize:20, fontWeight:900, marginBottom:12 }}>把节奏固定下来</div>
                  {SUPPLY_RHYTHM.map((item) => (
                    <div key={item.title} style={{ padding:"12px 14px", borderRadius:14, background:"var(--card)", marginBottom:10 }}>
                      <div style={{ fontSize:14, fontWeight:900, marginBottom:6 }}>{item.title}</div>
                      <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {tab === "photos" && (
            <DayPhotoTab
              days={DAYS}
              photosByDay={dayPhotos}
              onUpload={handlePhotoUpload}
              onPreview={setPreviewPhoto}
              onRemove={handlePhotoRemove}
            />
          )}

          {tab === "equip" && (
            <div>
              <div className="section-card" style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", gap:8, alignItems:"center", flexWrap:"wrap" }}>
                  <div>
                    <div style={{ fontSize:13, color:"var(--muted)", marginBottom:6 }}>装备完成度</div>
                    <div style={{ fontSize:18, fontWeight:900 }}>{checkedEquipCount} / {totalEquip}</div>
                  </div>
                  <div style={{ fontSize:13, color:"var(--muted)" }}>点击分类展开并勾选已准备项</div>
                </div>
              </div>

              {Object.entries(EQUIPMENT).map(([category, data]) => {
                const isOpen = expandedCat === category;
                const done = data.items.filter((_, index) => checkedEquip[`${category}-${index}`]).length;
                return (
                  <div key={category} className="section-card" style={{ marginBottom:10, padding:isOpen ? 18 : "14px 18px" }}>
                    <button onClick={() => setExpandedCat(isOpen ? null : category)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", background:"transparent", border:"none", color:"var(--text)", font:"inherit", padding:0, cursor:"pointer" }}>
                      <div style={{ fontSize:16, fontWeight:900 }}>{data.icon} {category}</div>
                      <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                        <span style={{ fontSize:12, color:done === data.items.length ? "var(--success)" : "var(--muted)", fontWeight:800 }}>{done}/{data.items.length}</span>
                        <span style={{ color:"var(--muted)" }}>{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </button>
                    {isOpen && (
                      <div style={{ marginTop:12 }}>
                        {data.items.map((item, index) => {
                          const key = `${category}-${index}`;
                          const checked = !!checkedEquip[key];
                          return (
                            <div key={key} className="list-row" style={{ borderTop:index ? "1px solid var(--border)" : "none", cursor:"pointer", opacity:checked ? 0.58 : 1 }} onClick={() => toggleEquip(key)}>
                              <span className={`checker ${checked ? "checker-on" : ""}`}>{checked ? "✓" : ""}</span>
                              <div style={{ flex:1 }}>
                                <div style={{ fontSize:14, fontWeight:700, textDecoration:checked ? "line-through" : "none" }}>{item.name}</div>
                                {item.note && <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{item.note}</div>}
                              </div>
                              <div style={{ fontSize:12, color:"var(--label)", whiteSpace:"nowrap" }}>{item.qty}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {tab === "emergency" && (
            <div>
              {EMERGENCIES.map((em) => {
                const isOpen = openEmergency === em.id;
                return (
                  <div key={em.id} className="section-card" style={{ marginBottom:10, borderColor:isOpen ? em.color : "var(--border)" }}>
                    <button onClick={() => setOpenEmergency(isOpen ? null : em.id)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", background:"transparent", border:"none", color:"var(--text)", font:"inherit", padding:0, cursor:"pointer" }}>
                      <div style={{ fontSize:16, fontWeight:900 }}>{em.icon} 预案：{em.title}</div>
                      <div style={{ color:em.color, fontWeight:900 }}>{isOpen ? "收起" : "展开"}</div>
                    </button>
                    {isOpen && (
                      <div style={{ marginTop:14 }}>
                        {em.levels.map((level, index) => (
                          <div key={`${em.id}-${level.level}`} style={{ marginTop:index ? 16 : 0, padding:14, borderRadius:14, background:"var(--card)" }}>
                            <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:8, flexWrap:"wrap" }}>
                              <span style={{ padding:"4px 10px", borderRadius:999, background:em.color, color:"#fff", fontSize:12, fontWeight:900 }}>{level.level}</span>
                              {level.symptoms && <span style={{ fontSize:12, color:"var(--muted)" }}>{level.symptoms}</span>}
                            </div>
                            {level.steps.map((step, stepIndex) => (
                              <div key={step} className="list-row" style={{ padding:"6px 0" }}>
                                <span style={{ color:em.color, width:20, fontWeight:900 }}>{stepIndex + 1}.</span>
                                <span style={{ fontSize:14, lineHeight:1.7 }}>{step}</span>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="route-grid" style={{ marginTop:16 }}>
                <div className="section-card">
                  <div style={{ fontSize:16, fontWeight:900, marginBottom:12 }}>📞 紧急电话</div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px,1fr))", gap:10 }}>
                    {PHONES.map((phone) => (
                      <div key={phone.name} style={{ padding:14, borderRadius:14, background:"var(--card)" }}>
                        <div style={{ fontSize:12, color:"var(--muted)", marginBottom:6 }}>{phone.name}</div>
                        <div style={{ fontSize:20, fontWeight:900, color:"#86c8ff" }}>{phone.num}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="section-card">
                  <div style={{ fontSize:16, fontWeight:900, marginBottom:12 }}>👥 队伍分工</div>
                  {[
                    { role:"领队（头车）", duty:"控制节奏、路线决策、危险预警", color:"#3B9EFF" },
                    { role:"技术支援（二车）", duty:"携带工具备件、故障排除", color:"#F5A623" },
                    { role:"医疗后勤（三车）", duty:"急救包和公共物资管理", color:"#34C759" },
                    { role:"殿后（尾车）", duty:"确保无人掉队，与领队通讯", color:"#E85D4A" },
                  ].map((role) => (
                    <div key={role.role} style={{ padding:"12px 14px", borderRadius:14, background:"var(--card)", borderLeft:`4px solid ${role.color}`, marginBottom:10 }}>
                      <div style={{ fontSize:14, fontWeight:900 }}>{role.role}</div>
                      <div style={{ fontSize:12, color:"var(--muted)", marginTop:4 }}>{role.duty}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "checklist" && (
            <div className="route-grid">
              <div style={{ display:"grid", gap:14 }}>
                <div className="section-card">
                  <div style={{ fontSize:16, fontWeight:900, marginBottom:12 }}>🏍️ 车辆检查</div>
                  {CHECKLIST_VEHICLE.map((item, index) => {
                    const checked = !!checkedVehicle[index];
                    return (
                      <div key={item} className="list-row" style={{ borderTop:index ? "1px solid var(--border)" : "none", cursor:"pointer" }} onClick={() => toggleVehicle(index)}>
                        <span className={`checker ${checked ? "checker-on" : ""}`}>{checked ? "✓" : ""}</span>
                        <span style={{ fontSize:14, textDecoration:checked ? "line-through" : "none", opacity:checked ? 0.55 : 1 }}>{item}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="section-card">
                  <div style={{ fontSize:16, fontWeight:900, marginBottom:12 }}>🧑 人员准备</div>
                  {CHECKLIST_PERSON.map((item, index) => {
                    const checked = !!checkedPerson[index];
                    return (
                      <div key={item} className="list-row" style={{ borderTop:index ? "1px solid var(--border)" : "none", cursor:"pointer" }} onClick={() => togglePerson(index)}>
                        <span className={`checker ${checked ? "checker-on" : ""}`}>{checked ? "✓" : ""}</span>
                        <span style={{ fontSize:14, textDecoration:checked ? "line-through" : "none", opacity:checked ? 0.55 : 1 }}>{item}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="section-card">
                <div style={{ fontSize:16, fontWeight:900, marginBottom:12 }}>💊 医疗急救包</div>
                {[
                  { cat:"外伤处理", items:"碘伏棉签、纱布、绷带、创可贴、胶带" },
                  { cat:"止血固定", items:"止血带、止血粉、SAM 夹板、三角巾" },
                  { cat:"高原用品", items:"便携氧气瓶、血氧仪、乙酰唑胺、地塞米松" },
                  { cat:"常规药品", items:"感冒药、止泻药、抗生素、胃药、抗过敏药" },
                  { cat:"外用药品", items:"红霉素软膏、烫伤膏、风油精、布洛芬" },
                ].map((item) => (
                  <div key={item.cat} style={{ padding:14, borderRadius:14, background:"var(--card)", marginBottom:10 }}>
                    <div style={{ fontSize:13, color:"#90d0ff", fontWeight:900, marginBottom:6 }}>{item.cat}</div>
                    <div style={{ fontSize:13, color:"var(--muted)", lineHeight:1.7 }}>{item.items}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop:28, textAlign:"center", fontSize:12, color:"var(--label)" }}>
          川藏 G318 ADV 摩旅路书 · 支持手机骑行模式、GPX 导入与离线安装
        </div>
      </div>

      {previewPhoto && (
        <div
          onClick={() => setPreviewPhoto(null)}
          style={{
            position:"fixed",
            inset:0,
            background:"rgba(5,12,20,0.88)",
            display:"flex",
            alignItems:"center",
            justifyContent:"center",
            zIndex:80,
            padding:20,
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              maxWidth:"min(96vw, 1100px)",
              width:"100%",
              background:"rgba(15,20,28,0.96)",
              border:"1px solid var(--border)",
              borderRadius:20,
              overflow:"hidden",
            }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, padding:"14px 16px", borderBottom:"1px solid var(--border)" }}>
              <div style={{ fontSize:14, fontWeight:800 }}>{previewPhoto.name}</div>
              <button className="btn btn-soft" onClick={() => setPreviewPhoto(null)}>关闭</button>
            </div>
            <img src={previewPhoto.dataUrl} alt={previewPhoto.name} style={{ width:"100%", maxHeight:"78vh", objectFit:"contain", display:"block", background:"#050c14" }} />
          </div>
        </div>
      )}
    </div>
  );
}

window.G318RoadbookApp = App;

const mountNode = document.getElementById("root");
if (mountNode) {
  const root = ReactDOM.createRoot(mountNode);
  root.render(<App />);
}
