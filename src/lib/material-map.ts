// 原料类型 → 加工场景映射
export const MATERIAL_TO_SOURCE: Record<string, string> = {
  white: 'crystal',
  purple: 'crystal',
  pink: 'crystal',
  gold: 'crystal',
  green: 'crystal',
  blue: 'crystal',
  jade_green: 'jade',
  jade_white: 'jade',
  wood_root: 'forest',
  bark: 'forest',
  fruit_seed: 'orchard',
  fruit_pulp: 'orchard',
  shell: 'beach',
  pebble: 'beach',
  artificial_clay: 'workshop',
  artificial_resin: 'workshop',
}

// 原料类型 → 显示名 + 颜色
export const MATERIAL_INFO: Record<string, { label: string; color: string; bg: string }> = {
  white: { label: '白水晶', color: '#a0c4ff', bg: '#e8f0ff' },
  purple: { label: '紫晶', color: '#b388ff', bg: '#e8d0ff' },
  pink: { label: '粉晶', color: '#ff80ab', bg: '#ffd0e8' },
  gold: { label: '发晶', color: '#ffd54f', bg: '#fff0c0' },
  green: { label: '绿幽灵', color: '#69f0ae', bg: '#d0ffd0' },
  blue: { label: '海蓝宝', color: '#40c4ff', bg: '#d0f0ff' },
  jade_green: { label: '翡翠玉', color: '#90c890', bg: '#c8e0c8' },
  jade_white: { label: '白玉', color: '#d4c8a0', bg: '#e8e0d0' },
  wood_root: { label: '树根料', color: '#b89870', bg: '#e8d8c0' },
  bark: { label: '树皮料', color: '#a08860', bg: '#d8c8a8' },
  fruit_seed: { label: '果种料', color: '#d4a070', bg: '#f0e0c0' },
  fruit_pulp: { label: '果肉料', color: '#d48860', bg: '#f0d0c0' },
  shell: { label: '贝壳料', color: '#a8c8e0', bg: '#e0e8f0' },
  pebble: { label: '卵石料', color: '#a09888', bg: '#d8d0c8' },
  artificial_clay: { label: '人工黏土', color: '#c0a888', bg: '#e8e0d0' },
  artificial_resin: { label: '树脂料', color: '#d4b898', bg: '#f0e8d8' },
}

// 全部16种原料ID（用于图鉴展示全部）
export const ALL_MATERIALS = Object.keys(MATERIAL_INFO)
