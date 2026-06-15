// 珠了个珠 206 款珠子商品数据
// 直接从网站 DOM 提取

export interface BeadProduct {
  id: string
  _key?: string           // 实例唯一键（添加时自动生成）
  name: string
  categoryId: string
  sizeMm: number
  price: number
  imageUrl: string
  type: 'bead' | 'accessory'
}

// 配饰品类识别
const ACCESSORY_NAMES = new Set([
  '大漆葫芦红', '大漆葫芦紫', '大漆葫芦蓝', '大漆葫芦绿', '大漆葫芦粉',
  '鼻涕熊', '黄杨木莲花', '贝珠', '沉香隔片', '海纹石',
  '白水晶双尖', '黄水晶双尖', '粉水晶双尖', '黑金超七双尖',
  '白水晶方糖', '白水晶弯管', '南瓜珠', '金曜石貔貅', '白水晶冰块',
  '青提岫玉', '蓝水翡翠', '蜜蜡',
])

const CATEGORY_MAP: Record<string, string> = {
  '白水晶': 'white-crystal',
  '白幽灵': 'white-phantom',
  '紫锂辉': 'kunzite',
  '巴西紫水晶': 'amethyst',
  '薰衣草紫水晶': 'lavender-amethyst',
  '乌拉圭紫水晶': 'uruguay-amethyst',
  '柠檬黄水晶': 'lemon-citrine',
  '冰糖雪梨黄水晶': 'citrine',
  '黄塔晶': 'yellow-crystal',
  '星光粉水晶': 'star-rose-quartz',
  '果冻粉水晶': 'jelly-rose-quartz',
  '海蓝宝(冰)': 'aquamarine-ice',
  '海蓝宝(润)': 'aquamarine-smooth',
  '蓝晶石': 'kyanite',
  '葡萄石': 'prehnite',
  '绿萤石': 'green-fluorite',
  '绿幽灵千层沙': 'green-phantom',
  '灰月光': 'gray-moonstone',
  '蓝月光': 'blue-moonstone',
  '橙月光': 'orange-moonstone',
  '草莓晶': 'strawberry-quartz',
  '鸽血红草莓晶': 'pigeon-blood-strawberry',
  '红玛瑙': 'red-agate',
  '绿龙晶': 'green-dragon-crystal',
  '茶水晶': 'smoky-quartz',
  '金曜石': 'gold-obsidian',
  '银耀石陨石': 'silver-meteorite',
  '金运石': 'gold-stone',
  '银曜石': 'silver-obsidian',
  '黑曜石': 'black-obsidian',
  '虎眼石': 'tiger-eye',
  '金虎眼': 'gold-tiger-eye',
  '蓝虎眼': 'blue-tiger-eye',
  '黄虎眼': 'yellow-tiger-eye',
  '黑发晶': 'black-rutilated',
  '绿发晶': 'green-rutilated',
  '黄虎眼直切': 'yellow-tiger-straight',
  '黑金超七': 'black-gold-super7',
  '红胶花': 'red-gel-flower',
  '黄胶花': 'yellow-gel-flower',
  '金发晶': 'gold-rutilated',
  '大漆葫芦红': 'lacquer-gourd',
  '大漆葫芦紫': 'lacquer-gourd',
  '大漆葫芦蓝': 'lacquer-gourd',
  '大漆葫芦绿': 'lacquer-gourd',
  '大漆葫芦粉': 'lacquer-gourd',
  '树王小金刚': 'king-bodhi',
  '百香籽直切': 'baixiang-seed',
  '猴头屁桃': 'monkey-head',
  '星月菩提': 'star-moon-bodhi',
  '沉香': 'eaglewood',
  '檀木': 'sandalwood',
  '绿檀': 'green-sandalwood',
  '老山檀(浮水)': 'old-sandalwood-float',
  '老山檀(沉水)': 'old-sandalwood-sink',
  '和田玉浅晴水': 'hetian-jade',
  '碧玉(带墨点)': 'jasper-ink',
  '碧玉': 'jasper',
  '鼻涕熊': 'bear-charm',
  '青提岫玉': 'green-xiuyu',
  '蓝水翡翠': 'blue-jadeite',
  '南红': 'nanhong',
  '黄杨木莲花': 'boxwood-lotus',
  '帝王砂': 'emperor-cinnabar',
  '紫金砂': 'purple-cinnabar',
  '淡水珍珠': 'freshwater-pearl',
  '贝珠': 'shell-pearl',
  '绿松石': 'turquoise',
  '沉香隔片': 'eaglewood-spacer',
  '海纹石': 'larimar',
  '蜜蜡': 'beeswax-amber',
  '白水晶双尖': 'crystal-double-point',
  '黄水晶双尖': 'citrine-double-point',
  '粉水晶双尖': 'rose-quartz-double-point',
  '黑金超七双尖': 'super7-double-point',
  '白水晶方糖': 'white-crystal-cube',
  '白水晶弯管': 'white-crystal-tube',
  '石榴石': 'garnet',
  '南瓜珠': 'pumpkin-bead',
  '金曜石貔貅': 'gold-obsidian-pixiu',
  '绿松石隔珠': 'turquoise-spacer',
  '白水晶冰块': 'white-crystal-ice',
}

import productsRaw from './bead-products.json'

export const BEAD_PRODUCTS: BeadProduct[] = (productsRaw as any[]).map((item, index) => ({
  id: `bead-${index}`,
  name: item.name,
  categoryId: CATEGORY_MAP[item.name] || 'other',
  sizeMm: parseFloat(item.size.replace('mm', '')),
  price: parseFloat(item.price.replace('¥', '')),
  imageUrl: item.img.replace('.png-cover2', '.png'),
  type: ACCESSORY_NAMES.has(item.name) ? 'accessory' : 'bead',
}))

// 所有品类列表
export interface BeadCategory {
  id: string
  name: string
  count: number
}

// 按类型获取品类
export function getCategories(type: 'bead' | 'accessory'): BeadCategory[] {
  const filtered = BEAD_PRODUCTS.filter(p => p.type === type)
  const map = new Map<string, { name: string; count: number }>()
  filtered.forEach(p => {
    if (!map.has(p.categoryId)) {
      map.set(p.categoryId, { name: p.name, count: 0 })
    }
    map.get(p.categoryId)!.count++
  })
  return Array.from(map.entries()).map(([id, info]) => ({ id, name: info.name, count: info.count }))
}

export const BEAD_CATEGORIES: BeadCategory[] = getCategories('bead')

export function getCategoryName(categoryId: string): string {
  const p = BEAD_PRODUCTS.find(p => p.categoryId === categoryId)
  return p?.name || categoryId
}

export function getProductsByCategory(categoryId: string, type?: 'bead' | 'accessory'): BeadProduct[] {
  let filtered = type ? BEAD_PRODUCTS.filter(p => p.type === type) : BEAD_PRODUCTS
  if (categoryId === 'all') return filtered
  return filtered.filter(p => p.categoryId === categoryId)
}

export function beadSizeToPx(mm: number): number {
  const map: Record<number, number> = {
    1: 12, 1.5: 14, 2: 16, 3: 20, 4: 24, 5: 28, 5.5: 30,
    6: 33, 7: 38, 8: 44, 9: 50, 9.5: 52, 10: 55,
    11: 60, 11.5: 63, 12: 66, 14: 77, 15: 82,
    20: 100, 21: 105, 25: 120,
  }
  return map[mm] || Math.round(mm * 5.5)
}

export function calcWristSize(beads: BeadProduct[]): number {
  const totalMm = beads.reduce((sum, b) => sum + b.sizeMm, 0)
  return Math.round((totalMm / 10 + 2) * 10) / 10
}

export function calcTotalPrice(beads: BeadProduct[]): number {
  return Math.round(beads.reduce((sum, b) => sum + b.price, 0) * 100) / 100
}

export function getWristStatus(cm: number): 'short' | 'normal' | 'long' {
  if (cm < 15) return 'short'
  if (cm > 20) return 'long'
  return 'normal'
}
