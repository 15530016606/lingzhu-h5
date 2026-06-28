// 灵珠手作 — 精简数据库 Schema
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// 用户
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phone: text('phone').notNull().unique(),
  passwordHash: text('password_hash'),
  nickname: text('nickname'),
  createdAt: text('created_at').default("datetime('now')"),
  lastLoginAt: text('last_login_at'),
})

// 原料类型（采集源产出的原料，每种场景对应不同原料）
export const materialTypes = sqliteTable('material_types', {
  id: text('id').primaryKey(),          // 'white', 'purple', 'jade_green', etc.
  name: text('name').notNull(),          // '白水晶', '紫水晶', '翡翠玉'
  scene: text('scene').notNull(),        // 'crystal', 'jade', 'forest', etc.
  emoji: text('emoji').default('💎'),    // 显示用
})

// 用户背包（从游戏获得的原料）
export const userMaterials = sqliteTable('user_materials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  materialType: text('material_type').notNull(),  // 对应 materialTypes.id
  count: integer('count').default(0),
})

// 用户珠子库存（加工后获得的成品珠子）
export const userBeads = sqliteTable('user_beads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  name: text('name').notNull(),          // '白水晶珠', '翡翠玉珠'
  materialType: text('material_type').notNull(),  // 原料类型
  quality: text('quality').default('普通'),        // '稀有'|'普通'|'粗糙'
  count: integer('count').default(0),
})

// 订单
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  beads: text('beads').notNull(),        // JSON: [{name, materialType, quality}]
  ropeColor: text('rope_color'),
  receiver: text('receiver').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  note: text('note').default(''),
  status: text('status', { enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] }).default('pending'),
  totalPrice: integer('total_price').default(0),
  createdAt: text('created_at').default("datetime('now')"),
})
