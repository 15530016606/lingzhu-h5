// 珠子寓意数据 — 按材质大类分组
// 每种材质有通用文案 + 随机种子

export interface BeadMeaning {
  element: string      // 五行
  meaning: string      // 寓意
  useCase: string      // 推荐用途
  luckyNumber: number  // 幸运数字
  poem: string         // 诗句
}

type MeaningTemplate = {
  element: string
  meaning: string
  useCase: string
}

const TEMPLATES: Record<string, MeaningTemplate> = {
  // 水晶类
  '白水晶':     { element: '金', meaning: '净化 · 纯粹 · 智慧', useCase: '提升专注力、理清思绪' },
  '白幽灵':     { element: '金', meaning: '净化 · 新生 · 纯净', useCase: '清理负面能量、重启心境' },
  '紫锂辉':     { element: '火', meaning: '爱与疗愈 · 温柔', useCase: '缓解焦虑、促进睡眠' },
  '巴西紫水晶': { element: '火', meaning: '灵性 · 安宁 · 智慧', useCase: '冥想辅助、提升直觉' },
  '薰衣草紫水晶': { element: '火', meaning: '舒缓 · 平和 · 灵性', useCase: '减压安神、改善睡眠' },
  '乌拉圭紫水晶': { element: '火', meaning: '深邃 · 高贵 · 洞察', useCase: '深度冥想、灵性提升' },
  '柠檬黄水晶': { element: '土', meaning: '财富 · 自信 · 活力', useCase: '招财进宝、增强自信' },
  '冰糖雪梨黄水晶': { element: '土', meaning: '温暖 · 丰盛 · 喜悦', useCase: '招财纳福、带来好运' },
  '黄塔晶':     { element: '土', meaning: '明亮 · 进取 · 活力', useCase: '增强行动力、开拓事业' },
  '星光粉水晶': { element: '水', meaning: '爱情 · 温柔 · 治愈', useCase: '招桃花、改善人际关系' },
  '果冻粉水晶': { element: '水', meaning: '甜美 · 柔软 · 爱', useCase: '提升人缘、带来好心情' },
  '海蓝宝(冰)': { element: '水', meaning: '勇气 · 沟通 · 宁静', useCase: '增强表达力、缓解压力' },
  '海蓝宝(润)': { element: '水', meaning: '沉静 · 智慧 · 包容', useCase: '稳定情绪、提升沟通' },
  '蓝晶石':     { element: '水', meaning: '理性 · 逻辑 · 清晰', useCase: '提升思考力、辅助决策' },
  '葡萄石':     { element: '木', meaning: '希望 · 新生 · 成长', useCase: '招正财、促进事业发展' },
  '绿萤石':     { element: '木', meaning: '清新 · 专注 · 平衡', useCase: '提升专注力、平衡情绪' },
  '绿幽灵千层沙': { element: '木', meaning: '事业 · 财富 · 机遇', useCase: '招正财、拓展事业' },
  '灰月光':     { element: '水', meaning: '直觉 · 神秘 · 守护', useCase: '提升直觉力、守护平安' },
  '蓝月光':     { element: '水', meaning: '温柔 · 感知 · 梦幻', useCase: '改善感情运、增强感知' },
  '橙月光':     { element: '火', meaning: '热情 · 创造 · 活力', useCase: '激发创造力、提升行动力' },
  '草莓晶':     { element: '火', meaning: '甜蜜 · 爱情 · 好运', useCase: '招桃花、增加魅力' },
  '鸽血红草莓晶': { element: '火', meaning: '激情 · 富贵 · 吉祥', useCase: '招财运、提升魅力' },
  '红玛瑙':     { element: '火', meaning: '活力 · 勇气 · 行动', useCase: '增强行动力、提升活力' },
  '绿龙晶':     { element: '木', meaning: '蜕变 · 疗愈 · 重生', useCase: '助力转变、修复创伤' },
  '茶水晶':     { element: '土', meaning: '稳定 · 踏实 · 包容', useCase: '稳定情绪、增强耐力' },

  // 曜石类
  '金曜石':     { element: '水', meaning: '守护 · 辟邪 · 力量', useCase: '辟邪化煞、护身保平安' },
  '银耀石陨石': { element: '水', meaning: '神秘 · 宇宙 · 能量', useCase: '连接宇宙能量、开启智慧' },
  '金运石':     { element: '土', meaning: '财富 · 机遇 · 好运', useCase: '招财转运、把握机遇' },
  '银曜石':     { element: '水', meaning: '守护 · 净化 · 平衡', useCase: '排除负能量、守护身心' },
  '黑曜石':     { element: '水', meaning: '辟邪 · 守护 · 安定', useCase: '辟邪化煞、安定心神' },

  // 虎眼类
  '虎眼石':     { element: '土', meaning: '勇气 · 力量 · 洞察', useCase: '增强勇气、提升洞察力' },
  '金虎眼':     { element: '土', meaning: '财富 · 进取 · 果断', useCase: '招财进宝、提升决断力' },
  '蓝虎眼':     { element: '水', meaning: '沉静 · 智慧 · 远见', useCase: '提升远见、冷静决策' },
  '黄虎眼':     { element: '土', meaning: '自信 · 行动 · 力量', useCase: '增强自信、激发行动力' },
  '黄虎眼直切': { element: '土', meaning: '坚韧 · 专注 · 力量', useCase: '提升意志力、突破瓶颈' },

  // 发晶类
  '黑发晶':     { element: '水', meaning: '辟邪 · 守护 · 力量', useCase: '辟邪护身、增强气场' },
  '绿发晶':     { element: '木', meaning: '事业 · 财富 · 机遇', useCase: '招正财、推动事业发展' },
  '黑金超七':   { element: '水', meaning: '超强 · 全能 · 转化', useCase: '全面提升运势、转化负能' },
  '红胶花':     { element: '火', meaning: '热情 · 爱情 · 活力', useCase: '增强魅力、改善感情' },
  '黄胶花':     { element: '土', meaning: '财富 · 喜悦 · 丰盛', useCase: '招财纳福、带来快乐' },
  '金发晶':     { element: '金', meaning: '财富 · 权威 · 领袖', useCase: '招正财偏财、提升领导力' },

  // 木质类
  '沉香':       { element: '土', meaning: '沉静 · 禅意 · 修行', useCase: '静心冥想、安神助眠' },
  '檀木':       { element: '木', meaning: '自然 · 质朴 · 安然', useCase: '安神定气、回归自然' },
  '绿檀':       { element: '木', meaning: '生机 · 变化 · 灵动', useCase: '带来变化、激发灵感' },
  '老山檀(浮水)': { element: '土', meaning: '禅意 · 宁静 · 致远', useCase: '冥想辅助、静心安神' },
  '老山檀(沉水)': { element: '土', meaning: '沉静 · 厚重 · 智慧', useCase: '静心沉思、积累智慧' },
  '黄杨木莲花': { element: '木', meaning: '纯净 · 美好 · 吉祥', useCase: '带来好运、净化心灵' },

  // 玉石类
  '和田玉浅晴水': { element: '土', meaning: '温润 · 内敛 · 平安', useCase: '保平安、养心性' },
  '碧玉(带墨点)': { element: '木', meaning: '沉稳 · 深邃 · 力量', useCase: '稳定心神、增强耐力' },
  '碧玉':       { element: '木', meaning: '温润 · 平和 · 滋养', useCase: '滋养身心、平衡情绪' },
  '青提岫玉':   { element: '木', meaning: '清新 · 活力 · 希望', useCase: '带来新希望、提升活力' },
  '蓝水翡翠':   { element: '水', meaning: '灵性 · 深邃 · 高贵', useCase: '提升灵性、带来好运' },

  // 玛瑙南红类
  '南红':       { element: '火', meaning: '吉祥 · 富贵 · 喜庆', useCase: '招财纳福、辟邪保平安' },
  '帝王砂':     { element: '火', meaning: '尊贵 · 权威 · 力量', useCase: '增强气场、提升权威' },
  '紫金砂':     { element: '火', meaning: '神秘 · 高贵 · 转化', useCase: '转化运气、带来机遇' },

  // 珍珠贝类
  '淡水珍珠':   { element: '水', meaning: '纯净 · 高贵 · 圆满', useCase: '提升气质、守护爱情' },
  '贝珠':       { element: '水', meaning: '温柔 · 包容 · 柔和', useCase: '缓和情绪、增强包容力' },

  // 其他
  '绿松石':     { element: '木', meaning: '平安 · 吉祥 · 守护', useCase: '保平安、辟邪化煞' },
  '海纹石':     { element: '水', meaning: '宁静 · 治愈 · 温柔', useCase: '舒缓情绪、治愈心灵' },
  '蜜蜡':       { element: '土', meaning: '温暖 · 富贵 · 永恒', useCase: '招财纳福、祈愿平安' },
  '石榴石':     { element: '火', meaning: '热情 · 生命力 · 爱情', useCase: '增强活力、促进感情' },
  '青金石':     { element: '水', meaning: '智慧 · 真理 · 灵性', useCase: '开启智慧、提升灵性' },
  '沉香隔片':   { element: '土', meaning: '沉静 · 安宁 · 祈福', useCase: '安神祈福、静心养性' },
  '大漆葫芦红': { element: '火', meaning: '福禄 · 吉祥 · 辟邪', useCase: '纳福招财、辟邪化煞' },
  '大漆葫芦紫': { element: '火', meaning: '高贵 · 福禄 · 吉祥', useCase: '招福纳财、提升运势' },
  '大漆葫芦蓝': { element: '水', meaning: '智慧 · 福禄 · 安宁', useCase: '祈求智慧、纳福平安' },
  '大漆葫芦绿': { element: '木', meaning: '生机 · 福禄 · 希望', useCase: '带来希望、招福纳财' },
  '大漆葫芦粉': { element: '火', meaning: '美好 · 福禄 · 甜蜜', useCase: '招桃花、纳福纳祥' },
  '树王小金刚': { element: '木', meaning: '坚韧 · 菩提 · 觉悟', useCase: '增益智慧、坚定信念' },
  '百香籽直切': { element: '木', meaning: '菩提 · 修行 · 清净', useCase: '辅助修行、清净身心' },
  '猴头屁桃':   { element: '木', meaning: '可爱 · 好运 · 福气', useCase: '带来好运、增加福气' },
  '星月菩提':   { element: '木', meaning: '菩提 · 觉悟 · 圆满', useCase: '增长智慧、圆满心愿' },
  '白水晶双尖': { element: '金', meaning: '能量 · 净化 · 聚焦', useCase: '增强能量场、聚焦目标' },
  '黄水晶双尖': { element: '土', meaning: '财富 · 能量 · 进取', useCase: '招财聚气、激发进取' },
  '粉水晶双尖': { element: '水', meaning: '爱情 · 能量 · 疗愈', useCase: '增强桃花能量、疗愈心伤' },
  '黑金超七双尖': { element: '水', meaning: '超强能量 · 转化 · 提升', useCase: '强力转化负能、全面提升' },
  '白水晶方糖': { element: '金', meaning: '纯净 · 力量 · 稳固', useCase: '稳固能量、增强定力' },
  '白水晶弯管': { element: '金', meaning: '流通 · 引导 · 净化', useCase: '引导能量流动、净化空间' },
  '南瓜珠':     { element: '土', meaning: '丰收 · 富足 · 圆满', useCase: '招财纳福、丰收圆满' },
  '金曜石貔貅': { element: '水', meaning: '招财 · 辟邪 · 守护', useCase: '强力招财、辟邪保平安' },
  '绿松石隔珠': { element: '木', meaning: '平安 · 守护 · 净化', useCase: '护身辟邪、净化能量' },
  '白水晶冰块': { element: '金', meaning: '清凉 · 纯净 · 通透', useCase: '清净身心、通透思维' },
  '鼻涕熊':     { element: '土', meaning: '可爱 · 治愈 · 陪伴', useCase: '带来快乐、治愈心情' },
}

const POEMS = [
  '心如水晶，明澈见底',
  '珠圆玉润，好运自来',
  '一串灵珠，一份安宁',
  '指尖流转，福运相随',
  '金玉满堂，福寿安康',
  '心有灵珠，万事通达',
  '珠联璧合，好运连连',
  '静水流深，珠蕴光华',
  '一颗一愿，一念一珠',
  '珠光流转，福至心灵',
  '灵珠在手，好运长久',
  '串珠成缘，好运相伴',
  '晶光璀璨，前路光明',
  '珠圆人生，事事圆满',
  '一念清净，珠光自现',
  '灵珠护体，百邪不侵',
  '福如珠串，连绵不绝',
  '珠转乾坤，运开时泰',
  '心有灵珠一点通',
  '珠落玉盘，福满人间',
]

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

export function getBeadMeaning(name: string): BeadMeaning {
  const template = TEMPLATES[name]
  let element = '土'
  let meaning = '平安 · 吉祥 · 好运'
  let useCase = '日常佩戴、祈福纳祥'

  if (template) {
    element = template.element
    meaning = template.meaning
    useCase = template.useCase
  }

  // 用名称哈希作为种子，保证每个材质有固定幸运数字和诗句
  const hash = name.split('').reduce((s, c) => s + c.charCodeAt(0), 0)
  const luckyNumber = Math.floor(seededRandom(hash) * 9) + 1
  const poemIdx = Math.floor(seededRandom(hash + 100) * POEMS.length)

  return {
    element,
    meaning,
    useCase,
    luckyNumber,
    poem: POEMS[poemIdx],
  }
}
