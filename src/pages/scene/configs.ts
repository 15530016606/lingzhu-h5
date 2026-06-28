export interface GameEntry {
  id: string          // folder name in public/games/
  name: string        // 显示名称
  desc: string        // 一句话说明
  icon: string        // emoji 图标
  type: 'iframe' | 'react'
  reward: {
    material: string  // 产出原料ID
    name: string      // 显示名
  }
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

/** 每款游戏产出原料：按总分100分，<40出废料，>=40出对应原料 */
export const SCENES: SceneConfig[] = [
  {
    id: 'crystal',
    name: '水晶矿场',
    subtitle: '小浣熊的矿洞，敲开石头找宝藏',
    characterGif: '/images/scenes/thumbs/thumb_raccoon-vector.png',
    sceneImage: '/images/scenes/thumbs/thumb_crystal-mine-raccoon.png',
    bgColor: '#f0e6f6',
    accentColor: '#b388d4',
    games: [
      { id: 'doodle-jump', name: '矿道跳跃', desc: '在矿道岩层间跳跃，踩得越深水晶越多', icon: '⬆️', type: 'iframe', reward: { material: 'white', name: '白水晶' } },
      { id: 'whack-mole', name: '敲水晶', desc: '水晶从岩缝冒出来，快速敲击采集', icon: '🔨', type: 'iframe', reward: { material: 'purple', name: '紫水晶' } },
      { id: 'crystal-mine-react', name: '矿场小游戏', desc: '经典三选一：记忆翻牌/消消乐/堆叠', icon: '🎲', type: 'react', reward: { material: 'white', name: '白水晶' } },
    ],
  },
  {
    id: 'jade',
    name: '玉石溪谷',
    subtitle: '小熊在溪水边捡玉石',
    characterGif: '/videos/bear-cub.gif',
    sceneImage: '/images/scenes/thumbs/thumb_jade-valley-cub.png',
    bgColor: '#e6f0e6',
    accentColor: '#7db87d',
    games: [
      { id: 'game2048', name: '玉石合成', desc: '滑动合成更高等级的美玉', icon: '💎', type: 'iframe', reward: { material: 'jade_green', name: '翡翠玉' } },
      { id: 'memory-card', name: '玉矿记忆', desc: '翻牌找到藏在石头里的玉石', icon: '🃏', type: 'iframe', reward: { material: 'jade_white', name: '白玉' } },
      { id: 'sliding-puzzle', name: '玉石拼图', desc: '拼出完整的玉器图案', icon: '🧩', type: 'iframe', reward: { material: 'jade_green', name: '翡翠玉' } },
    ],
  },
  {
    id: 'forest',
    name: '森林深处',
    subtitle: '小鹿在林间穿梭，接住掉落的果实',
    characterGif: '/videos/deer.gif',
    sceneImage: '/images/scenes/thumbs/thumb_deep-forest-deer.png',
    bgColor: '#eef0d8',
    accentColor: '#b8bd6a',
    games: [
      { id: 'doodle-jump', name: '林间跳跃', desc: '在树枝间弹跳采集野果', icon: '🌿', type: 'iframe', reward: { material: 'wood_root', name: '树根料' } },
      { id: 'insect-catch', name: '捕捉萤火虫', desc: '点击闪光的萤火虫，点亮森林', icon: '🪲', type: 'iframe', reward: { material: 'wood_root', name: '树根料' } },
      { id: 'snake', name: '森林蛇道', desc: '小鹿在林间穿行收集果实', icon: '🐍', type: 'iframe', reward: { material: 'bark', name: '树皮料' } },
    ],
  },
  {
    id: 'orchard',
    name: '丰收果园',
    subtitle: '兔子在果园里分拣果实',
    characterGif: '/videos/rabbit.gif',
    sceneImage: '/images/scenes/thumbs/thumb_orchard-rabbit.png',
    bgColor: '#f6ece0',
    accentColor: '#d4a080',
    games: [
      { id: 'snake', name: '串果子', desc: '兔子在果园里串吃果子，越来越长', icon: '🐰', type: 'iframe', reward: { material: 'fruit_seed', name: '果种料' } },
      { id: 'shape-clicker', name: '分拣果子', desc: '快速点击对应形状的果子', icon: '🍎', type: 'iframe', reward: { material: 'fruit_seed', name: '果种料' } },
      { id: 'whack-mole', name: '接果子', desc: '熟果子冒头了，接住它！', icon: '🧺', type: 'iframe', reward: { material: 'fruit_pulp', name: '果肉料' } },
    ],
  },
  {
    id: 'beach',
    name: '河岸拾贝',
    subtitle: '水獭在河滩上捞宝藏',
    characterGif: '/videos/otter.gif',
    sceneImage: '/images/scenes/thumbs/thumb_riverbank-otter.png',
    bgColor: '#e0eaf6',
    accentColor: '#7aaed4',
    games: [
      { id: 'simon-says', name: '水波节奏', desc: '按水流节奏敲击彩色贝壳', icon: '🌊', type: 'iframe', reward: { material: 'shell', name: '贝壳料' } },
      { id: 'sliding-puzzle', name: '贝壳拼图', desc: '拼出完整的贝壳图案', icon: '🐚', type: 'iframe', reward: { material: 'shell', name: '贝壳料' } },
      { id: 'memory-card', name: '海底寻宝', desc: '记住宝藏位置，配对收集', icon: '💀', type: 'iframe', reward: { material: 'pebble', name: '卵石料' } },
    ],
  },
  {
    id: 'workshop',
    name: '柴犬工坊',
    subtitle: '柴犬师傅亲手打造每一颗珠子',
    characterGif: '/videos/workshop-icon.gif',
    sceneImage: '/images/scenes/thumbs/thumb_workshop-shiba.png',
    bgColor: '#f0ece0',
    accentColor: '#c9a87c',
    games: [
      { id: 'game2048', name: '材料合成', desc: '滑动合成更高级的加工材料', icon: '⚙️', type: 'iframe', reward: { material: 'artificial_clay', name: '人工黏土' } },
      { id: 'simon-says', name: '工序记忆', desc: '按正确顺序敲击工具', icon: '🔧', type: 'iframe', reward: { material: 'artificial_resin', name: '树脂料' } },
      { id: 'shape-clicker', name: '精准点击', desc: '快速点击正确形状的工具', icon: '🎯', type: 'iframe', reward: { material: 'artificial_clay', name: '人工黏土' } },
    ],
  },
]
