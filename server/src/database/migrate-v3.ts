// 数据库迁移：从旧版升级到 v3 精简架构
import { getDb, getClient } from './connection'
import { materialTypes } from './schema'

export async function migrateV3() {
  const db = getDb()
  const client = getClient()

  console.log('[migrate] starting v3 schema migration...')

  // 1. 删除旧表（逐个尝试，忽略不存在错误）
  const oldTables = [
    'collection_sources', 'raw_material_types', 'user_ores',
    'daily_claims', 'signin_records', 'user_raw_materials',
    'ore_types', 'user_bead_collection', 'user_sandpaper',
    'user_bead_inventory', 'user_waste', 'user_inventory',
    'products',
  ]
  for (const t of oldTables) {
    try {
      client.execute({ sql: `DROP TABLE IF EXISTS "${t}"` })
      console.log(`[migrate] dropped old table: ${t}`)
    } catch (e: any) {
      console.warn(`[migrate] skip drop ${t}: ${e.message}`)
    }
  }

  // 2. 创建 v3 表
  const createSql: [string, string][] = [
    ['material_types', `CREATE TABLE IF NOT EXISTS material_types (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      scene TEXT NOT NULL,
      emoji TEXT DEFAULT '💎'
    )`],
    ['user_materials', `CREATE TABLE IF NOT EXISTS user_materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      material_type TEXT NOT NULL,
      count INTEGER DEFAULT 0
    )`],
    ['user_beads', `CREATE TABLE IF NOT EXISTS user_beads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      material_type TEXT NOT NULL,
      quality TEXT DEFAULT '普通',
      count INTEGER DEFAULT 0
    )`],
    ['orders', `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      beads TEXT NOT NULL,
      rope_color TEXT,
      receiver TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      note TEXT DEFAULT '',
      status TEXT DEFAULT 'pending',
      total_price INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    )`],
  ]

  for (const [name, sql] of createSql) {
    try {
      client.execute({ sql })
      console.log(`[migrate] created table: ${name}`)
    } catch (e: any) {
      console.error(`[migrate] create ${name} failed:`, e.message)
    }
  }

  // 3. 确保 users 表有 password_hash 列
  try {
    await client.execute({ sql: "ALTER TABLE users ADD COLUMN password_hash TEXT" })
    console.log('[migrate] added password_hash to users')
  } catch (e: any) {
    // 已存在或不可操作则忽略
    console.log('[migrate] password_hash column check:', e.message.includes('duplicate column') ? 'already exists' : e.message)
  }

  console.log('[migrate] v3 schema migration complete')

  // 4. 种子数据
  try {
    const rows = await db.select().from(materialTypes).all() as any[]
    if (!rows || rows.length === 0) {
      const mats = [
        { id: 'white', name: '白水晶', scene: 'crystal', emoji: '💎' },
        { id: 'purple', name: '紫水晶', scene: 'crystal', emoji: '🔮' },
        { id: 'pink', name: '粉晶', scene: 'crystal', emoji: '💗' },
        { id: 'gold', name: '发晶', scene: 'crystal', emoji: '⭐' },
        { id: 'green', name: '绿幽灵', scene: 'crystal', emoji: '🍀' },
        { id: 'blue', name: '海蓝宝', scene: 'crystal', emoji: '💙' },
        { id: 'jade_green', name: '翡翠玉', scene: 'jade', emoji: '💚' },
        { id: 'jade_white', name: '白玉', scene: 'jade', emoji: '🪨' },
        { id: 'wood_root', name: '树根料', scene: 'forest', emoji: '🪵' },
        { id: 'bark', name: '树皮料', scene: 'forest', emoji: '🌿' },
        { id: 'fruit_seed', name: '果种料', scene: 'orchard', emoji: '🍎' },
        { id: 'fruit_pulp', name: '果肉料', scene: 'orchard', emoji: '🍑' },
        { id: 'shell', name: '贝壳料', scene: 'beach', emoji: '🐚' },
        { id: 'pebble', name: '卵石料', scene: 'beach', emoji: '🪨' },
        { id: 'artificial_clay', name: '人工黏土', scene: 'workshop', emoji: '🏺' },
        { id: 'artificial_resin', name: '树脂料', scene: 'workshop', emoji: '💧' },
      ]
      for (const m of mats) {
        db.insert(materialTypes).values(m as any).run()
      }
      console.log(`[migrate] seeded ${mats.length} material types`)
    } else {
      console.log(`[migrate] material_types already seeded (${rows.length} rows)`)
    }
  } catch (e: any) {
    console.error('[migrate] seed failed:', e.message)
  }
}
