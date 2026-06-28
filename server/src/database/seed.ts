import { getDb } from './connection'
import { materialTypes } from './schema'
import { sql } from 'drizzle-orm'

export async function seed() {
  const db = getDb()

  // 原料类型 — 每个场景产出对应原料
  const mats = [
    // 水晶矿场
    { id: 'white', name: '白水晶', scene: 'crystal', emoji: '💎' },
    { id: 'purple', name: '紫水晶', scene: 'crystal', emoji: '🔮' },
    { id: 'pink', name: '粉晶', scene: 'crystal', emoji: '💗' },
    { id: 'gold', name: '发晶', scene: 'crystal', emoji: '⭐' },
    // 玉石溪谷
    { id: 'jade_green', name: '翡翠玉', scene: 'jade', emoji: '💚' },
    { id: 'jade_white', name: '白玉', scene: 'jade', emoji: '🪨' },
    // 森林
    { id: 'wood_root', name: '树根料', scene: 'forest', emoji: '🪵' },
    { id: 'bark', name: '树皮料', scene: 'forest', emoji: '🌿' },
    // 果园
    { id: 'fruit_seed', name: '果种料', scene: 'orchard', emoji: '🍎' },
    { id: 'fruit_pulp', name: '果肉料', scene: 'orchard', emoji: '🍑' },
    // 河岸
    { id: 'shell', name: '贝壳料', scene: 'beach', emoji: '🐚' },
    { id: 'pebble', name: '卵石料', scene: 'beach', emoji: '🪨' },
    // 工坊
    { id: 'artificial_clay', name: '人工黏土', scene: 'workshop', emoji: '🏺' },
    { id: 'artificial_resin', name: '树脂料', scene: 'workshop', emoji: '💧' },
  ]

  // 检查是否已存在
  const existing = await db.select().from(materialTypes).all()
  if (existing.length > 0) {
    console.log('[seed] material_types already seeded, skipping')
    return
  }

  for (const m of mats) {
    await db.insert(materialTypes).values(m as any).run()
  }
  console.log(`[seed] seeded ${mats.length} material types`)
}
