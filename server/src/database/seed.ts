// 种子脚本 — 建表 + 迁移 bead-products.json + 插入 ore_types
import { getDb, getClient } from './connection'
import * as path from 'path'
import fs from 'fs'

const __dirname = path.resolve(process.cwd(), 'src/database')

/**
 * 建表 SQL（无 ORM，保证独立运行）
 */
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'bead' CHECK(type IN ('bead','accessory')),
  category TEXT NOT NULL,
  material_type TEXT,
  size TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  stock INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS ore_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK(rarity IN ('common','uncommon','rare','legendary')),
  image_url TEXT,
  polish_ms INTEGER DEFAULT 2000,
  outputs TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT UNIQUE NOT NULL,
  nickname TEXT,
  avatar TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  last_login_at TEXT,
  total_orders INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_inventory (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER REFERENCES products(id),
  material_type TEXT,
  source TEXT NOT NULL CHECK(source IN ('polish','claim','buy','admin')),
  acquired_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS user_ores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  ore_type_id TEXT NOT NULL REFERENCES ore_types(id),
  count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS daily_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  claim_date TEXT NOT NULL,
  UNIQUE(user_id, claim_date)
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  items TEXT NOT NULL,
  total_price INTEGER NOT NULL,
  receiver TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  note TEXT DEFAULT '',
  payment_method TEXT CHECK(payment_method IN ('wechat','alipay')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending','paid','shipped','delivered','cancelled')),
  tracking_number TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  paid_at TEXT,
  shipped_at TEXT
);

CREATE TABLE IF NOT EXISTS signin_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  date TEXT NOT NULL,
  streak INTEGER DEFAULT 0,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS collection_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS raw_material_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_id TEXT NOT NULL,
  rarity TEXT NOT NULL CHECK(rarity IN ('common','uncommon','rare','legendary')),
  image_url TEXT,
  process_ms INTEGER DEFAULT 7000,
  outputs TEXT NOT NULL,
  waste_type TEXT NOT NULL,
  waste_amount INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS user_raw_materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  material_type_id TEXT NOT NULL,
  count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_waste (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  waste_type TEXT NOT NULL,
  count INTEGER DEFAULT 0
);
`

function inferCategory(name: string): string {
  const map: Record<string, string> = {
    '白水晶': '水晶', '白幽灵': '水晶', '粉晶': '水晶', '紫晶': '水晶',
    '黄水晶': '水晶', '茶晶': '水晶', '绿幽灵': '水晶', '发晶': '水晶',
    '黑曜石': '水晶', '金曜石': '水晶', '银曜石': '水晶',
    '月光石': '水晶', '星光粉晶': '水晶', '海蓝宝': '水晶',
    '草莓晶': '水晶', '红玛瑙': '玛瑙', '玛瑙': '玛瑙',
    '虎眼': '水晶', '红纹石': '水晶', '青金石': '水晶',
    '孔雀石': '玉石', '葡萄石': '水晶',
    '沉香': '木珠', '檀木': '木珠',
    '银': '金属', '金': '金属', '铜': '金属',
  }
  for (const [key, cat] of Object.entries(map)) {
    if (name.includes(key)) return cat
  }
  return '其他'
}

export async function seed() {
  const client = getClient()
  console.log('开始 seed...')

  // 1. 建表
  for (const sql of CREATE_TABLES_SQL.split(';').filter(s => s.trim())) {
    client.execute(sql.trim() + ';')
  }
  console.log('✓ 表已创建')

  // 2. 迁移 bead-products.json
  const jsonPath = path.resolve(process.cwd(), '../src/data/bead-products.json')
  if (!fs.existsSync(jsonPath)) {
    console.warn(`bead-products.json不存在: ${jsonPath}`)
  } else {
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
    for (const item of raw) {
      const name = item.name || ''
      const sizeMatch = name.match(/(\d+mm)/)
      const cleanName = name.replace(/\s*\d+mm/, '').trim()
      client.execute({
        sql: 'INSERT INTO products (name, type, category, material_type, size, price, image_url, stock, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        args: [
          cleanName || name,
          'bead',
          inferCategory(cleanName || name),
          cleanName || name,
          sizeMatch?.[1] || null,
          parseFloat(String(item.price || '0').replace('¥', '')) * 100,
          `${raw.indexOf(item)}.png`,
          100,
          1,
        ],
      })
    }
    console.log(`✓ 已插入 ${raw.length} 个产品`)
  }

  // 3. 插入采集源 + 原料类型种子数据
  const sources = [
    { id: 'crystal', name: '水晶矿场', icon: '⛰', description: '开采水晶原矿，加工成水晶珠子' },
    { id: 'jade', name: '玉石矿场', icon: '🗻', description: '开采玉石原石，雕刻成玉石珠子' },
    { id: 'forest', name: '森林', icon: '🌲', description: '收集木材树根，车制成木珠' },
    { id: 'orchard', name: '果园', icon: '🌿', description: '采摘果实种子，打磨成菩提' },
    { id: 'beach', name: '河床海岸', icon: '🏞', description: '拾取卵石贝壳，加工成有机珠子' },
    { id: 'workshop', name: '工坊', icon: '🏭', description: '人工原料制胚烧制，制作琉璃陶瓷' },
  ]
  for (const s of sources) {
    client.execute({ sql: 'INSERT OR IGNORE INTO collection_sources (id, name, icon, description) VALUES (?, ?, ?, ?)', args: [s.id, s.name, s.icon, s.description] })
  }
  console.log(`✓ 已插入 ${sources.length} 个采集源`)

  // 原料类型: id, name, source_id, rarity, imageUrl, processMs, outputs(JSON), wasteType, wasteAmount
  const materials = [
    // 水晶矿场 (crystal) - output 引用产品名称
    { id: 'white-crystal-ore', name: '白水晶簇', sourceId: 'crystal', rarity: 'common', processMs: 7000, outputs: JSON.stringify([{ materialType: 'white-crystal', weight: 100 }]), wasteType: 'crystal-slag' },
    { id: 'amethyst-ore', name: '紫晶洞原石', sourceId: 'crystal', rarity: 'common', processMs: 8000, outputs: JSON.stringify([{ materialType: 'amethyst', weight: 60 }, { materialType: 'lavender-amethyst', weight: 25 }, { materialType: 'uruguay-amethyst', weight: 15 }]), wasteType: 'crystal-slag' },
    { id: 'rose-ore', name: '粉晶原石', sourceId: 'crystal', rarity: 'common', processMs: 7000, outputs: JSON.stringify([{ materialType: 'rose-quartz', weight: 60 }, { materialType: 'star-rose-quartz', weight: 25 }, { materialType: 'jelly-rose-quartz', weight: 15 }]), wasteType: 'crystal-slag' },
    { id: 'citrine-ore', name: '黄水晶原石', sourceId: 'crystal', rarity: 'common', processMs: 7000, outputs: JSON.stringify([{ materialType: 'citrine', weight: 50 }, { materialType: 'lemon-citrine', weight: 30 }, { materialType: 'citrine-snow', weight: 20 }]), wasteType: 'crystal-slag' },
    { id: 'phantom-ore', name: '幽灵晶原石', sourceId: 'crystal', rarity: 'uncommon', processMs: 9000, outputs: JSON.stringify([{ materialType: 'white-phantom', weight: 60 }, { materialType: 'green-phantom', weight: 40 }]), wasteType: 'crystal-slag' },
    { id: 'rutilated-ore', name: '发晶原石', sourceId: 'crystal', rarity: 'uncommon', processMs: 9000, outputs: JSON.stringify([{ materialType: 'gold-rutilated', weight: 50 }, { materialType: 'black-rutilated', weight: 30 }, { materialType: 'silver-rutilated', weight: 20 }]), wasteType: 'crystal-slag' },
    { id: 'strawberry-ore', name: '草莓晶原石', sourceId: 'crystal', rarity: 'uncommon', processMs: 8000, outputs: JSON.stringify([{ materialType: 'strawberry-quartz', weight: 70 }, { materialType: 'pigeon-blood-strawberry', weight: 30 }]), wasteType: 'crystal-slag' },
    { id: 'super-seven-ore', name: '超七原石', sourceId: 'crystal', rarity: 'rare', processMs: 12000, outputs: JSON.stringify([{ materialType: 'super-seven-black', weight: 60 }, { materialType: 'super-seven-purple', weight: 40 }]), wasteType: 'crystal-slag' },
    { id: 'thunder-egg', name: '雷公蛋', sourceId: 'crystal', rarity: 'legendary', processMs: 15000, outputs: JSON.stringify([{ materialType: 'random-high-crystal', weight: 100 }]), wasteType: 'crystal-slag' },
    // 玉石矿场 (jade)
    { id: 'agate-rough', name: '玛瑙原石', sourceId: 'jade', rarity: 'common', processMs: 8000, outputs: JSON.stringify([{ materialType: 'red-agate', weight: 50 }, { materialType: 'agate', weight: 30 }, { materialType: 'striped-agate', weight: 20 }]), wasteType: 'stone-powder' },
    { id: 'xinyu-rough', name: '岫玉原石', sourceId: 'jade', rarity: 'common', processMs: 8000, outputs: JSON.stringify([{ materialType: 'xinyu', weight: 70 }, { materialType: 'green-xinyu', weight: 30 }]), wasteType: 'stone-powder' },
    { id: 'hetian-rough', name: '和田玉原石', sourceId: 'jade', rarity: 'uncommon', processMs: 10000, outputs: JSON.stringify([{ materialType: 'hetian-jade', weight: 50 }, { materialType: 'white-jade', weight: 30 }, { materialType: 'green-jade', weight: 20 }]), wasteType: 'stone-powder' },
    { id: 'jadeite-rough', name: '翡翠原石', sourceId: 'jade', rarity: 'rare', processMs: 12000, outputs: JSON.stringify([{ materialType: 'jadeite', weight: 50 }, { materialType: 'blue-jadeite', weight: 30 }, { materialType: 'dark-jadeite', weight: 20 }]), wasteType: 'stone-powder' },
    { id: 'malachite-rough', name: '孔雀石原石', sourceId: 'jade', rarity: 'uncommon', processMs: 9000, outputs: JSON.stringify([{ materialType: 'malachite', weight: 60 }, { materialType: 'turquoise', weight: 40 }]), wasteType: 'stone-powder' },
    { id: 'nanhong-rough', name: '南红原石', sourceId: 'jade', rarity: 'rare', processMs: 11000, outputs: JSON.stringify([{ materialType: 'nanhong', weight: 100 }]), wasteType: 'stone-powder' },
    // 森林 (forest)
    { id: 'common-wood', name: '普通木料', sourceId: 'forest', rarity: 'common', processMs: 5000, outputs: JSON.stringify([{ materialType: 'common-wood-bead', weight: 100 }]), wasteType: 'wood-sawdust' },
    { id: 'sandalwood', name: '檀木木料', sourceId: 'forest', rarity: 'uncommon', processMs: 7000, outputs: JSON.stringify([{ materialType: 'sandalwood', weight: 60 }, { materialType: 'red-sandalwood', weight: 40 }]), wasteType: 'wood-sawdust' },
    { id: 'eaglewood', name: '沉香木料', sourceId: 'forest', rarity: 'rare', processMs: 10000, outputs: JSON.stringify([{ materialType: 'eaglewood', weight: 100 }]), wasteType: 'wood-sawdust' },
    { id: 'cypress-root', name: '崖柏根料', sourceId: 'forest', rarity: 'rare', processMs: 9000, outputs: JSON.stringify([{ materialType: 'cypress', weight: 100 }]), wasteType: 'wood-sawdust' },
    { id: 'gold-nanmu', name: '金丝楠料', sourceId: 'forest', rarity: 'rare', processMs: 10000, outputs: JSON.stringify([{ materialType: 'gold-nanmu', weight: 100 }]), wasteType: 'wood-sawdust' },
    { id: 'huanghuali', name: '黄花梨料', sourceId: 'forest', rarity: 'legendary', processMs: 12000, outputs: JSON.stringify([{ materialType: 'huanghuali', weight: 100 }]), wasteType: 'wood-sawdust' },
    // 果园/菩提 (orchard)
    { id: 'bodhi-fruit', name: '菩提果', sourceId: 'orchard', rarity: 'common', processMs: 6000, outputs: JSON.stringify([{ materialType: 'bodhi-root', weight: 60 }, { materialType: 'white-bodhi', weight: 40 }]), wasteType: 'bad-seed' },
    { id: 'vajra-fruit', name: '金刚果', sourceId: 'orchard', rarity: 'common', processMs: 7000, outputs: JSON.stringify([{ materialType: 'vajra-bodhi', weight: 100 }]), wasteType: 'bad-seed' },
    { id: 'star-fruit', name: '星月果', sourceId: 'orchard', rarity: 'common', processMs: 7000, outputs: JSON.stringify([{ materialType: 'star-bodhi', weight: 100 }]), wasteType: 'bad-seed' },
    { id: 'fenyang-fruit', name: '凤眼果', sourceId: 'orchard', rarity: 'uncommon', processMs: 8000, outputs: JSON.stringify([{ materialType: 'fenyang-bodhi', weight: 100 }]), wasteType: 'bad-seed' },
    { id: 'baixiang-fruit', name: '百香果籽', sourceId: 'orchard', rarity: 'uncommon', processMs: 8000, outputs: JSON.stringify([{ materialType: 'baixiang-bodhi', weight: 100 }]), wasteType: 'bad-seed' },
    { id: 'coconut', name: '椰子', sourceId: 'orchard', rarity: 'common', processMs: 6000, outputs: JSON.stringify([{ materialType: 'coconut-shell', weight: 70 }, { materialType: 'coconut-fiber', weight: 30 }]), wasteType: 'bad-seed' },
    { id: 'purple-gold-fruit', name: '紫金果', sourceId: 'orchard', rarity: 'rare', processMs: 10000, outputs: JSON.stringify([{ materialType: 'purple-gold-bodhi', weight: 100 }]), wasteType: 'bad-seed' },
    // 河床海岸 (beach)
    { id: 'river-pebble', name: '河滩卵石', sourceId: 'beach', rarity: 'common', processMs: 6000, outputs: JSON.stringify([{ materialType: 'common-agate', weight: 70 }, { materialType: 'rainbow-stone', weight: 30 }]), wasteType: 'gravel' },
    { id: 'seashell', name: '贝壳', sourceId: 'beach', rarity: 'common', processMs: 5000, outputs: JSON.stringify([{ materialType: 'shell-bead', weight: 70 }, { materialType: 'tridacna', weight: 30 }]), wasteType: 'shell-frag' },
    { id: 'pearl-oyster', name: '珍珠蚌', sourceId: 'beach', rarity: 'uncommon', processMs: 7000, outputs: JSON.stringify([{ materialType: 'pearl', weight: 70 }, { materialType: 'freshwater-pearl', weight: 30 }]), wasteType: 'shell-frag' },
    { id: 'amber-rough', name: '蜜蜡原石', sourceId: 'beach', rarity: 'rare', processMs: 10000, outputs: JSON.stringify([{ materialType: 'amber', weight: 60 }, { materialType: 'burnt-amber', weight: 40 }]), wasteType: 'gravel' },
    { id: 'coral-branch', name: '珊瑚枝', sourceId: 'beach', rarity: 'rare', processMs: 9000, outputs: JSON.stringify([{ materialType: 'coral', weight: 70 }, { materialType: 'bamboo-coral', weight: 30 }]), wasteType: 'gravel' },
    { id: 'giant-clam', name: '砗磲原贝', sourceId: 'beach', rarity: 'rare', processMs: 10000, outputs: JSON.stringify([{ materialType: 'giant-clam', weight: 60 }, { materialType: 'jade-clam', weight: 40 }]), wasteType: 'shell-frag' },
    // 工坊 (workshop)
    { id: 'glass-material', name: '玻璃料', sourceId: 'workshop', rarity: 'common', processMs: 4000, outputs: JSON.stringify([{ materialType: 'glass-bead', weight: 100 }]), wasteType: 'waste-mold' },
    { id: 'glaze-material', name: '彩釉料', sourceId: 'workshop', rarity: 'uncommon', processMs: 6000, outputs: JSON.stringify([{ materialType: 'color-glaze', weight: 60 }, { materialType: 'cloisonne', weight: 40 }]), wasteType: 'waste-mold' },
    { id: 'ceramic-clay', name: '陶瓷泥', sourceId: 'workshop', rarity: 'common', processMs: 5000, outputs: JSON.stringify([{ materialType: 'ceramic-bead', weight: 100 }]), wasteType: 'waste-mold' },
    { id: 'metal-material', name: '金属料', sourceId: 'workshop', rarity: 'uncommon', processMs: 7000, outputs: JSON.stringify([{ materialType: 'silver-bead', weight: 60 }, { materialType: 'copper-bead', weight: 40 }]), wasteType: 'metal-scrap' },
    { id: 'ancient-material', name: '古法料', sourceId: 'workshop', rarity: 'rare', processMs: 9000, outputs: JSON.stringify([{ materialType: 'ancient-gold', weight: 60 }, { materialType: 'gold-wash', weight: 40 }]), wasteType: 'waste-mold' },
  ]

  for (const m of materials) {
    client.execute({
      sql: 'INSERT OR IGNORE INTO raw_material_types (id, name, source_id, rarity, image_url, process_ms, outputs, waste_type, waste_amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      args: [m.id, m.name, m.sourceId, m.rarity, `${materials.indexOf(m)}.png`, m.processMs, m.outputs, m.wasteType, 1],
    })
  }
  console.log(`✓ 已插入 ${materials.length} 种原料类型`)
  console.log('Seed 完成!')
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seed 失败:', err)
    process.exit(1)
  })
