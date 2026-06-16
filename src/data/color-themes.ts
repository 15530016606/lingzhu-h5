import { BEAD_PRODUCTS } from './bead-products'

export interface ColorTheme {
  id: string
  name: string
  desc: string
  /* 主题色（展示用渐变） */
  gradient: string
  /* 推荐的珠子在 BEAD_PRODUCTS 中的索引 */
  beadIndices: number[]
  /* 预设排列：16 颗的 pattern（从 beadIndices 选） */
  pattern: number[]
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    id: 'warm',
    name: '暖阳系',
    desc: '橙黄金色调，温暖明媚',
    gradient: 'linear-gradient(135deg,#f59e0b,#d97706)',
    beadIndices: [24, 26, 129, 32, 28, 86, 70],
    pattern: [24, 129, 32, 28, 86, 24, 129, 70, 32, 28, 86, 24, 129, 70, 32, 28],
  },
  {
    id: 'cool',
    name: '冷月系',
    desc: '蓝紫银色调，清冷静谧',
    gradient: 'linear-gradient(135deg,#6366f1,#4338ca)',
    beadIndices: [11, 16, 47, 64, 105, 92],
    pattern: [11, 16, 47, 64, 105, 92, 11, 16, 47, 64, 105, 92, 11, 16, 47, 64],
  },
  {
    id: 'pink',
    name: '粉黛系',
    desc: '粉红玫瑰色，温柔浪漫',
    gradient: 'linear-gradient(135deg,#ec4899,#db2777)',
    beadIndices: [35, 37, 9, 187, 39, 72],
    pattern: [35, 37, 9, 187, 39, 72, 35, 37, 9, 187, 39, 72, 35, 37, 9, 187],
  },
  {
    id: 'forest',
    name: '森系',
    desc: '青绿碧玉色，自然清新',
    gradient: 'linear-gradient(135deg,#10b981,#059669)',
    beadIndices: [7, 114, 153, 157, 147, 54, 160],
    pattern: [7, 114, 153, 157, 147, 54, 7, 114, 153, 160, 147, 54, 7, 114, 153, 157],
  },
  {
    id: 'ink',
    name: '墨韵系',
    desc: '黑灰茶色，沉稳内敛',
    gradient: 'linear-gradient(135deg,#374151,#1f2937)',
    beadIndices: [96, 112, 83, 119, 92, 99],
    pattern: [96, 112, 83, 119, 92, 99, 96, 112, 83, 119, 92, 99, 96, 112, 83, 119],
  },
  {
    id: 'shimmer',
    name: '流光系',
    desc: '多彩混搭，缤纷活力',
    gradient: 'linear-gradient(135deg,#f43f5e,#f59e0b,#22c55e,#3b82f6)',
    beadIndices: [79, 24, 11, 114, 43, 35, 86],
    pattern: [79, 24, 11, 114, 43, 35, 86, 79, 24, 11, 114, 43, 35, 86, 79, 24],
  },
  {
    id: 'morandi',
    name: '莫兰迪系',
    desc: '低饱和灰调，高级雅致',
    gradient: 'linear-gradient(135deg,#a78bfa,#8b5cf6)',
    beadIndices: [0, 16, 63, 66, 174, 38],
    pattern: [0, 16, 63, 66, 174, 38, 0, 16, 63, 66, 174, 38, 0, 16, 63, 66],
  },
]

/** 从色系主题生成 16 颗真实商品列表 */
export function makeThemeBracelet(theme: ColorTheme): any[] {
  return theme.pattern.map((idx, i) => {
    const p = BEAD_PRODUCTS[idx]
    if (!p) return null
    return { ...p, _key: `theme-${i}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
  }).filter(Boolean)
}

/** 获取色系的配饰推荐 */
export function getThemeCharms(themeId: string): any[] {
  const charmMap: Record<string, number[]> = {
    warm: [132, 197],      // 大漆葫芦红, 金曜石貔貅
    cool: [134, 190],      // 大漆葫芦蓝, 白水晶弯管
    pink: [136, 187],      // 大漆葫芦粉, 粉水晶双尖
    forest: [165, 135],    // 黄杨木莲花, 大漆葫芦绿
    ink: [197, 179],       // 金曜石貔貅, 沉香隔片
    shimmer: [159, 186],   // 鼻涕熊, 黄水晶双尖
    morandi: [165, 179],   // 黄杨木莲花, 沉香隔片
  }
  const ids = charmMap[themeId] || charmMap.warm
  return ids.map((idx) => {
    const p = BEAD_PRODUCTS[idx]
    if (!p) return null
    return { ...p, _key: `charm-${idx}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` }
  }).filter(Boolean)
}
