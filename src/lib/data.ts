// 材质类型
export interface Material {
  id: string
  name: string
  desc: string
  roughness: number
  metalness: number
  transparency: number
  glossType: 'glossy' | 'soft' | 'clear' | 'matte' | 'shiny'
  colors: MaterialColor[]
}

export interface MaterialColor {
  hex: string
  name: string
  gradient: string[]
}

export interface Accessory {
  id: string
  type: 'spacer_gold' | 'spacer_silver' | 'tassel' | 'pendant'
  name: string
  icon: string
}

export interface BeadConfig {
  material: Material | null
  color: MaterialColor | null
  accessories: Array<{ accessory: Accessory; position: number }>
  beadCount: number
}

export interface Fortune {
  title: string
  poem: string
  advice: string
  category: string
  // 多维度运势评分 1-5
  scores: {
    career: number   // 事业
    love: number     // 爱情
    health: number   // 健康
    wealth: number   // 财运
  }
  // 幸运信息
  lucky: {
    color: string
    number: number
    direction: string
  }
}

export interface DailyRecord {
  date: string
  count: number
  maxCount: number
}

export interface SignInRecord {
  date: string
  signed: boolean
}

// === 新模型：单颗珠子配置 ===
export interface BeadItem {
  id: string
  material: Material
  color: MaterialColor
  sizeMm: number // 珠子直径 mm
}

export interface RopeType {
  id: string
  name: string
  desc: string
  color: string
}

export interface Charm {
  id: string
  name: string
  icon: string
  category: 'animal' | 'food' | 'symbol' | 'nature'
}

// 新 BeadConfig：自由编使用
export interface BeadConfigV2 {
  beads: BeadItem[]
  wristSizeCm: number
  rope: RopeType
  charms: Charm[]
}

export const ROPE_TYPES: RopeType[] = [
  { id: 'elastic', name: '弹力绳', desc: '弹性好，易佩戴', color: '#555555' },
  { id: 'leather', name: '皮绳', desc: '复古质感，可调节', color: '#8B4513' },
  { id: 'silk', name: '丝绳', desc: '细腻光滑，编结使用', color: '#D4A05A' },
  { id: 'metal', name: '金属链', desc: '时尚硬朗，百搭款', color: '#C0C0C0' },
]

export const CHARMS: Charm[] = [
  { id: 'bear', name: '小熊', icon: '🐻', category: 'animal' },
  { id: 'cat', name: '小猫', icon: '🐱', category: 'animal' },
  { id: 'rabbit', name: '小兔', icon: '🐰', category: 'animal' },
  { id: 'dog', name: '小狗', icon: '🐶', category: 'animal' },
  { id: 'panda', name: '熊猫', icon: '🐼', category: 'animal' },
  { id: 'star', name: '星星', icon: '⭐', category: 'symbol' },
  { id: 'heart', name: '爱心', icon: '❤️', category: 'symbol' },
  { id: 'cherry', name: '樱桃', icon: '🍒', category: 'food' },
  { id: 'flower', name: '小花', icon: '🌸', category: 'nature' },
  { id: 'moon', name: '月亮', icon: '🌙', category: 'nature' },
]

// 手腕围 → 推荐珠子参数
export function recommendBeadCount(wristCm: number, beadMm: number): number {
  const circumference = wristCm * 10 // 转 mm
  const holeSize = 2 // 穿绳空隙
  const beadSpacing = 0.5 // 珠间间隙
  const totalPerBead = beadMm + holeSize + beadSpacing
  const count = Math.floor(circumference / totalPerBead)
  return Math.max(6, Math.min(count, 30))
}

// 默认珠子大小参考
export const BEAD_SIZES_MM = [6, 8, 10, 12, 14]

// 6种材质 — Obsidian 暗夜流光 · 深空国风规格
export const MATERIALS: Material[] = [
  {
    id: 'bodhi',
    name: '菩提木',
    desc: '温润 · 淡雅',
    roughness: 0.8,
    metalness: 0,
    transparency: 0,
    glossType: 'matte',
    colors: [
      { hex: '#C4956A', name: '檀木棕', gradient: ['#C4956A', '#6B4F2E'] },
      { hex: '#D4A87A', name: '琥珀黄', gradient: ['#D4A87A', '#B8875A'] },
      { hex: '#8B6B4A', name: '老木色', gradient: ['#8B6B4A', '#5A4028'] },
      { hex: '#E0C8A8', name: '白檀', gradient: ['#E0C8A8', '#C0A888'] },
    ]
  },
  {
    id: 'agate',
    name: '玛瑙',
    desc: '通透 · 华贵',
    roughness: 0.3,
    metalness: 0.1,
    transparency: 0.2,
    glossType: 'glossy',
    colors: [
      { hex: '#D44040', name: '朱砂红', gradient: ['#E06060', '#8A1515'] },
      { hex: '#D4A017', name: '琥珀金', gradient: ['#E0B830', '#B8860B'] },
      { hex: '#2F4F4F', name: '墨玉黑', gradient: ['#3A5A5A', '#1A2E2E'] },
      { hex: '#8B4513', name: '咖啡棕', gradient: ['#A05820', '#5C3317'] },
      { hex: '#D2B48C', name: '奶油白', gradient: ['#E0C8A8', '#B89878'] },
      { hex: '#708090', name: '烟灰蓝', gradient: ['#8098A8', '#4A5568'] },
    ]
  },
  {
    id: 'crystal',
    name: '水晶',
    desc: '清透 · 灵气',
    roughness: 0.05,
    metalness: 0,
    transparency: 0.6,
    glossType: 'clear',
    colors: [
      { hex: '#A0B8E0', name: '月光白', gradient: ['#D0E0FF', '#788FC0'] },
      { hex: '#D4A0D4', name: '粉晶', gradient: ['#E8C0E8', '#B080B0'] },
      { hex: '#9370DB', name: '紫水晶', gradient: ['#B090E8', '#7B5DB0'] },
      { hex: '#87CEEB', name: '海蓝宝', gradient: ['#A8D8F0', '#6BA8D8'] },
      { hex: '#F5DEB3', name: '黄水晶', gradient: ['#F8E8C8', '#D4B878'] },
      { hex: '#D2691E', name: '茶晶', gradient: ['#E08038', '#B04810'] },
    ]
  },
  {
    id: 'jade',
    name: '玉石',
    desc: '温润 · 典雅',
    roughness: 0.2,
    metalness: 0,
    transparency: 0.3,
    glossType: 'soft',
    colors: [
      { hex: '#48A078', name: '翠竹绿', gradient: ['#70D0A0', '#2D7A56'] },
      { hex: '#A8D8A8', name: '白玉青', gradient: ['#C0E8C0', '#80B080'] },
      { hex: '#E8D5B7', name: '羊脂白', gradient: ['#F0E0C8', '#C8B898'] },
      { hex: '#C4A882', name: '黄玉', gradient: ['#D8B890', '#B09068'] },
      { hex: '#6B7B8D', name: '青玉灰', gradient: ['#8098A8', '#4A5A6B'] },
      { hex: '#8FBC8F', name: '碧玉', gradient: ['#A8D0A8', '#6B9B6B'] },
    ]
  },
  {
    id: 'dzi',
    name: '天珠',
    desc: '神秘 · 护佑',
    roughness: 0.3,
    metalness: 0.2,
    transparency: 0.15,
    glossType: 'glossy',
    colors: [
      { hex: '#B89870', name: '古铜色', gradient: ['#C0A080', '#6B4F30'] },
      { hex: '#8B5A2B', name: '深褐', gradient: ['#A07040', '#5A3818'] },
      { hex: '#4A3728', name: '玄黑', gradient: ['#5A4838', '#2A1A10'] },
      { hex: '#A08060', name: '土黄', gradient: ['#B89878', '#7A5A3A'] },
      { hex: '#D4B898', name: '乳白', gradient: ['#E0C8A8', '#B89878'] },
    ]
  },
  {
    id: 'gilt',
    name: '鎏金',
    desc: '璀璨 · 贵气',
    roughness: 0.15,
    metalness: 0.6,
    transparency: 0.1,
    glossType: 'shiny',
    colors: [
      { hex: '#E0B848', name: '赤金', gradient: ['#FDE094', '#B0882E'] },
      { hex: '#D4A84B', name: '古铜金', gradient: ['#E8C868', '#B89030'] },
      { hex: '#FFD700', name: '璀璨金', gradient: ['#FFE880', '#D4A800'] },
      { hex: '#C0A060', name: '浅金', gradient: ['#D8C080', '#A88848'] },
      { hex: '#B8860B', name: '暗金', gradient: ['#D4A828', '#8B6508'] },
    ]
  },
  {
    id: 'walnut',
    name: '核桃',
    desc: '古朴 · 自然',
    roughness: 0.85,
    metalness: 0,
    transparency: 0,
    glossType: 'matte',
    colors: [
      { hex: '#8B5A2B', name: '深核桃', gradient: ['#A07040', '#5A3818'] },
      { hex: '#C4956A', name: '浅核桃', gradient: ['#D4A87A', '#8B6B4A'] },
      { hex: '#6B4F2E', name: '老核桃', gradient: ['#8B6B4A', '#4A3020'] },
    ]
  },
  {
    id: 'amber',
    name: '琥珀',
    desc: '温润 · 凝光',
    roughness: 0.2,
    metalness: 0.1,
    transparency: 0.4,
    glossType: 'glossy',
    colors: [
      { hex: '#E8A030', name: '蜜蜡黄', gradient: ['#F0C060', '#C08020'] },
      { hex: '#D06030', name: '血珀', gradient: ['#E08040', '#A04018'] },
      { hex: '#F0D080', name: '明珀', gradient: ['#F8E0A0', '#D0B060'] },
      { hex: '#C09840', name: '金珀', gradient: ['#D8B858', '#A08028'] },
    ]
  },
  {
    id: 'coral',
    name: '珊瑚',
    desc: '红润 · 吉祥',
    roughness: 0.25,
    metalness: 0.05,
    transparency: 0.1,
    glossType: 'soft',
    colors: [
      { hex: '#E06050', name: '赤珊瑚', gradient: ['#F08068', '#B04030'] },
      { hex: '#F09080', name: '粉珊瑚', gradient: ['#F8B0A0', '#D07060'] },
      { hex: '#D04838', name: '深珊瑚', gradient: ['#E06050', '#A83028'] },
    ]
  },
  {
    id: 'lapis',
    name: '青金石',
    desc: '深邃 · 尊贵',
    roughness: 0.3,
    metalness: 0.15,
    transparency: 0.1,
    glossType: 'glossy',
    colors: [
      { hex: '#2A50A0', name: '帝青', gradient: ['#4068C0', '#183878'] },
      { hex: '#4068B0', name: '藏蓝', gradient: ['#5880C8', '#284888'] },
      { hex: '#5A78B8', name: '浅青金', gradient: ['#7890D0', '#3860A0'] },
    ]
  },
  {
    id: 'turquoise',
    name: '绿松石',
    desc: '清雅 · 灵秀',
    roughness: 0.3,
    metalness: 0,
    transparency: 0.15,
    glossType: 'soft',
    colors: [
      { hex: '#40A0B0', name: '天蓝色', gradient: ['#60C0D0', '#208090'] },
      { hex: '#50B898', name: '绿松', gradient: ['#70D0B0', '#289878'] },
      { hex: '#80C8C0', name: '浅绿松', gradient: ['#A0E0D8', '#58A8A0'] },
    ]
  },
  {
    id: 'beeswax',
    name: '蜜蜡',
    desc: '温润 · 凝脂',
    roughness: 0.15,
    metalness: 0,
    transparency: 0.25,
    glossType: 'soft',
    colors: [
      { hex: '#F0D090', name: '鸡油黄', gradient: ['#F8E0B0', '#D0B068'] },
      { hex: '#E8C068', name: '蜜糖色', gradient: ['#F0D080', '#C8A048'] },
      { hex: '#F8E0B0', name: '白蜜蜡', gradient: ['#FFF0D0', '#E0C888'] },
    ]
  },
  {
    id: 'obsidian',
    name: '黑曜石',
    desc: '神秘 · 辟邪',
    roughness: 0.1,
    metalness: 0.4,
    transparency: 0.05,
    glossType: 'shiny',
    colors: [
      { hex: '#1A1A2E', name: '彩虹眼', gradient: ['#2A2A4E', '#0A0A18'] },
      { hex: '#0D0D1A', name: '纯黑曜', gradient: ['#1A1A2E', '#00000A'] },
      { hex: '#2A2A40', name: '银曜石', gradient: ['#404060', '#101020'] },
    ]
  },
]

export const ACCESSORIES: Accessory[] = [
  { id: 'spacer_gold', type: 'spacer_gold', name: '金隔片', icon: '⭕' },
  { id: 'spacer_silver', type: 'spacer_silver', name: '银隔片', icon: '⭕' },
  { id: 'tassel', type: 'tassel', name: '流苏', icon: '✨' },
  { id: 'pendant', type: 'pendant', name: '小吊坠', icon: '💎' },
]

const DIRECTIONS = ['东', '南', '西', '北', '东北', '东南', '西南', '西北']

export const FORTUNES: Fortune[] = [
  { title: '上上签 · 紫气东来', poem: '紫气东来祥云绕，\n珠联璧合万事兴。\n贵人相助前程远，\n福泽绵长岁月宁。', advice: '今日宜主动出击，把握良机。事业上有贵人相助，感情方面会遇到心仪之人。佩戴此手串可增强运势。', category: '事业', scores: { career: 5, love: 4, health: 4, wealth: 4 }, lucky: { color: '#D4A05A', number: 8, direction: '东' } },
  { title: '上吉签 · 花开富贵', poem: '春风送暖入罗帷，\n花开富贵满庭辉。\n良缘天定终须有，\n锦绣前程任鸟飞。', advice: '感情运势极佳，单身者容易邂逅良缘。已有伴侣者关系更加甜蜜。适合约会、表白。', category: '爱情', scores: { career: 3, love: 5, health: 4, wealth: 3 }, lucky: { color: '#FFB6C1', number: 3, direction: '南' } },
  { title: '中吉签 · 金玉满堂', poem: '金玉满堂非虚言，\n积善之家有余庆。\n财源滚滚如江水，\n守得云开见月明。', advice: '财运亨通，适合投资理财。但切忌贪心，见好就收。正财偏财皆有收获。', category: '财运', scores: { career: 4, love: 3, health: 3, wealth: 5 }, lucky: { color: '#FFD700', number: 6, direction: '西' } },
  { title: '中平签 · 岁岁平安', poem: '平安二字值千金，\n岁月静好便是福。\n身心康健无烦忧，\n喜乐常伴福满门。', advice: '整体运势平稳，身体健康是最大财富。适合调理身体、养生保健。不宜冒进。', category: '健康', scores: { career: 3, love: 3, health: 5, wealth: 3 }, lucky: { color: '#48A078', number: 2, direction: '北' } },
  { title: '上吉签 · 步步高升', poem: '青云直上九重天，\n步步高升在眼前。\n勤勉耕耘终有获，\n功成名就笑开颜。', advice: '事业运势旺盛，工作得到认可，有晋升机会。适合展示才华、争取机会。', category: '事业', scores: { career: 5, love: 3, health: 3, wealth: 4 }, lucky: { color: '#E0B848', number: 9, direction: '东北' } },
  { title: '中吉签 · 喜结良缘', poem: '千里姻缘一线牵，\n相知相守共百年。\n红鸾星动佳期近，\n愿得一心人白首。', advice: '感情运势上升，容易遇到心仪对象。已有伴侣者感情升温，适合谈婚论嫁。', category: '爱情', scores: { career: 3, love: 5, health: 4, wealth: 3 }, lucky: { color: '#FF6B6B', number: 7, direction: '东南' } },
  { title: '上上签 · 凤舞九天', poem: '凤舞九天彩云追，\n才华横溢众望归。\n前程似锦无限好，\n大展宏图正当时。', advice: '各方面运势皆佳，尤其适合展现才华。机会就在眼前，放手一搏必有所成。', category: '综合', scores: { career: 5, love: 4, health: 4, wealth: 5 }, lucky: { color: '#D4A05A', number: 1, direction: '南' } },
  { title: '中平签 · 静水流深', poem: '静水流深暗涌藏，\n不争不抢自芬芳。\n沉淀心绪观时变，\n待得风起再翱翔。', advice: '当前宜静不宜动，适合沉淀学习。表面平静但暗藏机遇，耐心等待最佳时机。', category: '学业', scores: { career: 3, love: 2, health: 4, wealth: 3 }, lucky: { color: '#708090', number: 4, direction: '西' } },
  { title: '上吉签 · 福星高照', poem: '福星高照满华堂，\n家和万事俱兴旺。\n心想事成皆如意，\n岁岁年年福绵长。', advice: '家庭运势极佳，适合与家人团聚。家庭和睦带来各方面的好运气。宜居家、置产。', category: '家庭', scores: { career: 4, love: 4, health: 5, wealth: 4 }, lucky: { color: '#E8D5B7', number: 5, direction: '北' } },
  { title: '中吉签 · 破茧成蝶', poem: '破茧成蝶展新姿，\n历经风雨见彩虹。\n莫道前路多艰险，\n苦尽甘来自有功。', advice: '过去努力即将见到成果，突破在即。保持耐心和信心，很快就能看到回报。', category: '综合', scores: { career: 4, love: 3, health: 3, wealth: 4 }, lucky: { color: '#E8C870', number: 0, direction: '东' } },
  { title: '下下签 · 守株待兔', poem: '枯木逢春犹再发，\n人无两度再少年。\n劝君莫做守株客，\n主动出击换新天。', advice: '运势偏低，不宜被动等待。工作上需要主动争取机会，感情上不要害怕表达。调整心态，积极面对。', category: '综合', scores: { career: 2, love: 2, health: 3, wealth: 2 }, lucky: { color: '#8B5A2B', number: 11, direction: '西南' } },
  { title: '中吉签 · 风生水起', poem: '风生水起正当时，\n扬帆起航莫迟疑。\n一路顺风前程好，\n宏图大展会有期。', advice: '运势上扬，是行动的好时机。事业上适合新的开始，感情上可以主动约心仪的人出来。', category: '事业', scores: { career: 4, love: 3, health: 4, wealth: 4 }, lucky: { color: '#40A0B0', number: 10, direction: '东' } },
  { title: '上吉签 · 月老牵线', poem: '月老红线暗中牵，\n有缘千里来相见。\n莫问姻缘何时到，\n且行且珍惜当前。', advice: '感情运势很好，缘分已在路上。多参加社交活动，缘分可能就在意想不到的地方。', category: '爱情', scores: { career: 3, love: 5, health: 4, wealth: 3 }, lucky: { color: '#FFB6C1', number: 6, direction: '南' } },
  { title: '中平签 · 百事可乐', poem: '百事可乐心自宽，\n无忧无虑即是福。\n粗茶淡饭皆滋味，\n平淡之中见真趣。', advice: '运势平稳，心态决定一切。保持乐观开朗的心情，困难和烦恼自然消散。', category: '综合', scores: { career: 3, love: 3, health: 4, wealth: 3 }, lucky: { color: '#F0D090', number: 3, direction: '中' } },
  { title: '下吉签 · 曲径通幽', poem: '曲径通幽处，\n禅房花木深。\n山重水复疑无路，\n柳暗花明又一村。', advice: '暂时遇到一些阻碍，但不要灰心。换个思路，可能有新的解决方案。坚持就是胜利。', category: '事业', scores: { career: 2, love: 3, health: 3, wealth: 2 }, lucky: { color: '#6B4F2E', number: 8, direction: '南' } },
  { title: '上吉签 · 金榜题名', poem: '十年寒窗无人问，\n一举成名天下知。\n金榜题名前程好，\n光宗耀祖正当时。', advice: '学业运势极佳，考试运很好。适合参加考试、面试或重要汇报。准备充分的话，结果会超出预期。', category: '学业', scores: { career: 4, love: 2, health: 3, wealth: 3 }, lucky: { color: '#9370DB', number: 7, direction: '北' } },
  { title: '中吉签 · 招财进宝', poem: '招财进宝喜盈门，\n八方来财聚宝盆。\n勤劳致富是本分，\n好运来时挡不住。', advice: '财富运势不错，适合尝试新的赚钱方式。但是要脚踏实地，投机取巧反而不利。', category: '财运', scores: { career: 3, love: 2, health: 3, wealth: 5 }, lucky: { color: '#FFD700', number: 5, direction: '东' } },
  { title: '上吉签 · 青春永驻', poem: '若有人知春去处，\n唤取归来同住。\n青春不是年华，\n而是心境。', advice: '健康运势很好，身心状态俱佳。适合开始一项新的运动或健身计划。保持年轻的秘诀是保持好奇心。', category: '健康', scores: { career: 3, love: 4, health: 5, wealth: 3 }, lucky: { color: '#80C080', number: 2, direction: '西' } },
  { title: '中平签 · 随遇而安', poem: '行到水穷处，\n坐看云起时。\n偶然值林叟，\n谈笑无还期。', advice: '不必太执着于计划，随缘也是一种智慧。今天适合放慢节奏，享受当下的每一刻。', category: '综合', scores: { career: 3, love: 3, health: 4, wealth: 3 }, lucky: { color: '#C4A882', number: 0, direction: '南' } },
  { title: '下中签 · 守成待变', poem: '守成不易莫贪功，\n稳扎稳打才是真。\n待到时机成熟日，\n一飞冲天破长空。', advice: '当前宜守不宜攻，保持现状等待机会。不要因为急于求成而做出冲动的决定。', category: '事业', scores: { career: 2, love: 3, health: 3, wealth: 3 }, lucky: { color: '#8B6B4A', number: 9, direction: '东北' } },
  { title: '上吉签 · 比翼双飞', poem: '在天愿作比翼鸟，\n在地愿为连理枝。\n天长地久有时尽，\n此情绵绵无绝期。', advice: '伴侣关系非常美满，适合共同规划未来。单身者会遇到一个志趣相投的灵魂伴侣。', category: '爱情', scores: { career: 3, love: 5, health: 4, wealth: 4 }, lucky: { color: '#FF6B6B', number: 4, direction: '东' } },
  { title: '中吉签 · 厚积薄发', poem: '不积跬步无以至千里，\n不积小流无以成江海。\n厚积薄发终有时，\n一鸣惊人天下知。', advice: '积累的阶段虽然辛苦，但终会有收获。坚持学习和提升自己，量变终将引起质变。', category: '学业', scores: { career: 4, love: 2, health: 3, wealth: 3 }, lucky: { color: '#5A78B8', number: 1, direction: '北' } },
  { title: '上吉签 · 贵人临门', poem: '贵人临门喜气扬，\n时来运转好风光。\n出门遇贵多相助，\n事业腾达有名扬。', advice: '今天会遇到对你帮助很大的人。多注意身边人的建议，贵人可能就在你身边。', category: '事业', scores: { career: 5, love: 3, health: 4, wealth: 4 }, lucky: { color: '#D4A05A', number: 6, direction: '东南' } },
  { title: '中吉签 · 五谷丰登', poem: '五谷丰登年岁好，\n风调雨顺福星照。\n春种一粒粟，\n秋收万颗子。', advice: '付出有回报，之前的努力很快就会看到成果。适合做复盘和总结，看到自己的进步。', category: '财运', scores: { career: 4, love: 3, health: 4, wealth: 4 }, lucky: { color: '#E8A030', number: 3, direction: '南' } },
  { title: '中平签 · 闲庭信步', poem: '宠辱不惊，\n看庭前花开花落。\n去留无意，\n望天上云卷云舒。', advice: '保持内心的平静，不被外界干扰。今天的节奏宜慢不宜快，适合独处和思考。', category: '综合', scores: { career: 3, love: 3, health: 4, wealth: 3 }, lucky: { color: '#A0B8E0', number: 7, direction: '中' } },
  { title: '下下签 · 逆水行舟', poem: '逆水行舟用力撑，\n一篙松劲退千寻。\n古云此日足可惜，\n吾辈更应惜秒阴。', advice: '有些事情进展不顺，但不能放弃。越是困难越要坚持，稍微放松就会前功尽弃。', category: '事业', scores: { career: 2, love: 2, health: 2, wealth: 2 }, lucky: { color: '#4A3728', number: 12, direction: '西北' } },
  { title: '上吉签 · 天赐良缘', poem: '天赐良缘不可求，\n千里姻缘一线牵。\n愿得一心人，\n白首不相离。', advice: '姻缘天定，你的缘分很快就会到来。保持开放的心态，不要设置太多条条框框。', category: '爱情', scores: { career: 3, love: 5, health: 4, wealth: 3 }, lucky: { color: '#FFD700', number: 8, direction: '南' } },
  { title: '中吉签 · 身体力行', poem: '纸上得来终觉浅，\n绝知此事要躬行。\n空谈误国实干兴，\n身体力行见真功。', advice: '不要只停留在想的阶段，行动起来。今天适合把计划付诸实践，行动比完美更重要。', category: '健康', scores: { career: 3, love: 3, health: 4, wealth: 3 }, lucky: { color: '#50B898', number: 5, direction: '东' } },
  { title: '上吉签 · 高朋满座', poem: '朋友来了有好酒，\n豺狼来了有猎枪。\n海内存知己，\n天涯若比邻。', advice: '人际关系运势很好，适合聚会和社交。老朋友会给你带来好消息，新朋友会给你带来新机遇。', category: '综合', scores: { career: 4, love: 4, health: 4, wealth: 3 }, lucky: { color: '#E8C868', number: 2, direction: '西南' } },
  { title: '中平签 · 知足常乐', poem: '知足常乐心自安，\n无求便是福之源。\n随缘而遇皆是缘，\n心安理得度流年。', advice: '不要和别人比较，珍惜自己拥有的。今天适合感恩，想想自己已经拥有的幸福。', category: '综合', scores: { career: 2, love: 3, health: 4, wealth: 3 }, lucky: { color: '#D2B48C', number: 9, direction: '北' } },
  { title: '上吉签 · 鹏程万里', poem: '大鹏一日同风起，\n扶摇直上九万里。\n假令风歇时下来，\n犹能簸却沧冥水。', advice: '前途无量，你的潜力远比自己想象的大。今天适合大胆展示自己，让别人看到你的实力。', category: '事业', scores: { career: 5, love: 3, health: 3, wealth: 4 }, lucky: { color: '#D4A05A', number: 0, direction: '东' } },
  { title: '中吉签 · 良辰美景', poem: '良辰美景奈何天，\n赏心乐事谁家院。\n朝飞暮卷云霞翠，\n雨丝风片烟波画。', advice: '今天心情会很好，适合出去走走，享受大自然的美好。好心情会带来好运气。', category: '综合', scores: { career: 3, love: 4, health: 4, wealth: 3 }, lucky: { color: '#87CEEB', number: 4, direction: '西' } },
  { title: '下吉签 · 塞翁失马', poem: '塞翁失马焉知非福，\n看似失去实为得。\n祸兮福所倚，\n福兮祸所伏。', advice: '看起来不好的事情，其实可能是在帮你避开更大的麻烦。不要着急，好事多磨。', category: '综合', scores: { career: 2, love: 3, health: 3, wealth: 2 }, lucky: { color: '#6B7B8D', number: 10, direction: '北' } },
  { title: '上吉签 · 万象更新', poem: '春回大地万象新，\n否极泰来又逢春。\n辞旧迎新好运到，\n一年更比一年好。', advice: '崭新的开始就在眼前。过去的不愉快都翻篇了，放下包袱轻装上阵。', category: '综合', scores: { career: 4, love: 4, health: 4, wealth: 4 }, lucky: { color: '#48A078', number: 1, direction: '东' } },
  { title: '中吉签 · 锦上添花', poem: '锦上添花不如雪中送炭，\n友情的真谛在患难。\n平日里多种善缘，\n困难时自有天助。', advice: '今天适合帮助别人，善有善报。你对别人付出的善意，最终会以意想不到的方式回到你身边。', category: '综合', scores: { career: 3, love: 4, health: 3, wealth: 4 }, lucky: { color: '#E0B848', number: 6, direction: '南' } },
  { title: '中平签 · 悠然自得', poem: '采菊东篱下，\n悠然见南山。\n此中有真意，\n欲辨已忘言。', advice: '享受独处的时光吧。有时候最好的陪伴就是自己。给自己泡杯茶，读一本好书。', category: '综合', scores: { career: 3, love: 2, health: 4, wealth: 3 }, lucky: { color: '#C0A060', number: 5, direction: '西' } },
  { title: '上吉签 · 金玉良言', poem: '良药苦口利于病，\n忠言逆耳利于行。\n莫嫌他人批评话语，\n虚心接受助成长。', advice: '今天会有重要的建议出现，可能来自长辈或上司。认真倾听并思考，对你有很大帮助。', category: '学业', scores: { career: 4, love: 3, health: 3, wealth: 3 }, lucky: { color: '#9370DB', number: 3, direction: '东北' } },
  { title: '中吉签 · 和风细雨', poem: '好雨知时节，\n当春乃发生。\n随风潜入夜，\n润物细无声。', advice: '凡事不必太激烈，温和的方式反而更有效。今天适合用沟通解决问题，而不是对抗。', category: '综合', scores: { career: 3, love: 4, health: 4, wealth: 3 }, lucky: { color: '#708090', number: 7, direction: '东南' } },
  { title: '下中签 · 卧薪尝胆', poem: '有志者事竟成，\n破釜沉舟百二秦关终属楚。\n苦心人天不负，\n卧薪尝胆三千越甲可吞吴。', advice: '暂时的困难是在磨练你的意志。坚持住，这段经历会成为你未来最宝贵的财富。', category: '事业', scores: { career: 2, love: 2, health: 3, wealth: 2 }, lucky: { color: '#4A3728', number: 11, direction: '西北' } },
  { title: '上上签 · 日月同辉', poem: '日月同辉照乾坤，\n阴阳相济万物生。\n天地人和皆顺遂，\n万般如意自天成。', advice: '最佳运势！各方面都非常顺利。今天适合做重大的决定或开启新计划，一切都会顺风顺水。', category: '综合', scores: { career: 5, love: 5, health: 5, wealth: 5 }, lucky: { color: '#FFD700', number: 8, direction: '中' } },
]

// 生成每日运势（基于日期种子随机）
export function getDailyFortune(): Fortune {
  const today = new Date().toISOString().split('T')[0]
  const hash = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const index = hash % FORTUNES.length
  return FORTUNES[index]
}

// 每日免费额度
export const DAILY_FREE_COUNT = 3
export const REWARDED_EXTRA_COUNT = 2
export const MAX_DAILY_COUNT = DAILY_FREE_COUNT + REWARDED_EXTRA_COUNT

// 签到限定配色（连续签到解锁）
export const SIGNIN_LOCKED_COLORS: Record<number, MaterialColor> = {
  3: { hex: '#FF1493', name: '限定·霓光粉', gradient: ['#FF1493', '#FF69B4'] },
  7: { hex: '#00CED1', name: '限定·极光蓝', gradient: ['#00CED1', '#20B2AA'] },
  14: { hex: '#FFD700', name: '限定·曜日金', gradient: ['#FFD700', '#FFA500'] },
  30: { hex: '#C0C0C0', name: '限定·月光银', gradient: ['#C0C0C0', '#E8E8E8'] },
}
