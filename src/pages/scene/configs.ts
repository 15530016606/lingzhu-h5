export interface GameEntry {
  id: string
  name: string
  desc: string
  icon: string
  type: 'react'
  reward: { material: string; name: string }
}

export interface SceneConfig {
  id: string
  name: string
  subtitle: string
  characterGif: string
  sceneImage: string
  bgColor: string
  accentColor: string
  games: GameEntry[]
}

export const SCENES: SceneConfig[] = [
  {
    id: 'crystal',
    name: '水晶矿场',
    subtitle: '小浣熊的矿洞，敲开石头找宝藏',
    characterGif: '/images/scenes/thumbs/thumb_raccoon-vector.png',
    sceneImage: '/images/scenes/thumbs/thumb_crystal-mine-raccoon.png',
    bgColor: '#1a1020',
    accentColor: '#b388ff',
    games: [
      { id: 'memory', name: '水晶连连看', desc: '翻牌配对 找到宝石', icon: '💎', type: 'react', reward: { material: 'white', name: '白水晶' } },
      { id: 'match3', name: '水晶消消乐', desc: '三连消除 刷出水晶', icon: '✨', type: 'react', reward: { material: 'purple', name: '紫水晶' } },
      { id: 'stack', name: '水晶叠叠乐', desc: '叠放水晶得高分', icon: '🔮', type: 'react', reward: { material: 'white', name: '白水晶' } },
    ],
  },
  {
    id: 'jade',
    name: '玉石溪谷',
    subtitle: '小熊在溪水边捡玉石',
    characterGif: '/videos/bear-cub.gif',
    sceneImage: '/images/scenes/thumbs/thumb_jade-valley-cub.png',
    bgColor: '#0a1810',
    accentColor: '#7db87d',
    games: [
      { id: 'memory', name: '溪谷寻玉', desc: '翻牌找到玉石配对', icon: '💚', type: 'react', reward: { material: 'jade_green', name: '翡翠玉' } },
      { id: 'stack', name: '玉石叠叠乐', desc: '叠放玉料得玉石', icon: '🧱', type: 'react', reward: { material: 'jade_white', name: '白玉' } },
    ],
  },
  {
    id: 'forest',
    name: '森林深处',
    subtitle: '小鹿在林间穿梭，接住掉落的果实',
    characterGif: '/videos/deer.gif',
    sceneImage: '/images/scenes/thumbs/thumb_deep-forest-deer.png',
    bgColor: '#0e1a0e',
    accentColor: '#8bc34a',
    games: [
      { id: 'fall-catch', name: '收集落叶', desc: '点击接住飘落的树叶果实', icon: '🍃', type: 'react', reward: { material: 'wood_root', name: '树根料' } },
      { id: 'memory', name: '森林记忆', desc: '记住果实位置翻牌配对', icon: '🌿', type: 'react', reward: { material: 'bark', name: '树皮料' } },
    ],
  },
  {
    id: 'orchard',
    name: '丰收果园',
    subtitle: '兔子在果园里分拣果实',
    characterGif: '/videos/rabbit.gif',
    sceneImage: '/images/scenes/thumbs/thumb_orchard-rabbit.png',
    bgColor: '#1a1008',
    accentColor: '#ff8a65',
    games: [
      { id: 'fall-catch', name: '接果子', desc: '接住从树上掉落的果子', icon: '🍎', type: 'react', reward: { material: 'fruit_seed', name: '果种料' } },
      { id: 'match3', name: '果园消消乐', desc: '消除同色水果', icon: '🍇', type: 'react', reward: { material: 'fruit_pulp', name: '果肉料' } },
    ],
  },
  {
    id: 'beach',
    name: '河岸拾贝',
    subtitle: '水獭在河滩上捞宝藏',
    characterGif: '/videos/otter.gif',
    sceneImage: '/images/scenes/thumbs/thumb_riverbank-otter.png',
    bgColor: '#081018',
    accentColor: '#40c4ff',
    games: [
      { id: 'timing-tap', name: '潮汐节奏', desc: '在贝壳打开的瞬间点击', icon: '🐚', type: 'react', reward: { material: 'shell', name: '贝壳料' } },
      { id: 'memory', name: '海底寻宝', desc: '翻牌配对找到宝藏', icon: '💀', type: 'react', reward: { material: 'pebble', name: '卵石料' } },
    ],
  },
  {
    id: 'workshop',
    name: '柴犬工坊',
    subtitle: '柴犬师傅亲手打造每一颗珠子',
    characterGif: '/videos/workshop-icon.gif',
    sceneImage: '/images/scenes/thumbs/thumb_workshop-shiba.png',
    bgColor: '#141008',
    accentColor: '#ffb300',
    games: [
      { id: 'timing-tap', name: '工坊节拍', desc: '在工具发出的瞬间敲击', icon: '🔧', type: 'react', reward: { material: 'artificial_clay', name: '人工黏土' } },
      { id: 'stack', name: '工坊叠叠乐', desc: '叠放原料得材料', icon: '📦', type: 'react', reward: { material: 'artificial_resin', name: '树脂料' } },
    ],
  },
]
