// 灵珠手作 — 数据库 Schema（SQLite via Drizzle ORM）
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// 产品表（珠子 + 配饰）
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type', { enum: ['bead', 'accessory'] }).notNull().default('bead'),
  category: text('category').notNull(),
  materialType: text('material_type'),
  size: text('size'),
  price: integer('price').notNull(),     // 分
  imageUrl: text('image_url'),
  stock: integer('stock').default(0),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default('datetime(\'now\')'),
  updatedAt: text('updated_at').default('datetime(\'now\')'),
})

// 矿石类型表
export const oreTypes = sqliteTable('ore_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  rarity: text('rarity', { enum: ['common', 'uncommon', 'rare', 'legendary'] }).notNull(),
  imageUrl: text('image_url'),
  polishMs: integer('polish_ms').default(2000),
  outputs: text('outputs').notNull(),        // JSON string
})

// 用户表
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  phone: text('phone').notNull().unique(),
  nickname: text('nickname'),
  avatar: text('avatar'),
  createdAt: text('created_at').default('datetime(\'now\')'),
  lastLoginAt: text('last_login_at'),
  totalOrders: integer('total_orders').default(0),
  totalSpent: integer('total_spent').default(0),
})

// 用户库存表
export const userInventory = sqliteTable('user_inventory', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  productId: integer('product_id').references(() => products.id),
  materialType: text('material_type'),
  source: text('source', { enum: ['polish', 'claim', 'buy', 'admin'] }).notNull(),
  acquiredAt: text('acquired_at').default('datetime(\'now\')'),
})

// 用户矿石表
export const userOres = sqliteTable('user_ores', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  oreTypeId: text('ore_type_id').notNull().references(() => oreTypes.id),
  count: integer('count').default(0),
})

// 每日领取记录
export const dailyClaims = sqliteTable('daily_claims', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  claimDate: text('claim_date').notNull(),
})

// 订单表
export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  items: text('items').notNull(),           // JSON
  totalPrice: integer('total_price').notNull(),  // 分
  receiver: text('receiver').notNull(),
  phone: text('phone').notNull(),
  address: text('address').notNull(),
  note: text('note').default(''),
  paymentMethod: text('payment_method', { enum: ['wechat', 'alipay'] }),
  status: text('status', { enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] }).default('pending'),
  trackingNumber: text('tracking_number'),
  createdAt: text('created_at').default('datetime(\'now\')'),
  paidAt: text('paid_at'),
  shippedAt: text('shipped_at'),
})

// 签到记录
export const signinRecords = sqliteTable('signin_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  date: text('date').notNull(),
  streak: integer('streak').default(0),
})

// 采集源表
export const collectionSources = sqliteTable('collection_sources', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  icon: text('icon').notNull(),
  description: text('description'),
})

// 原料类型表
export const rawMaterialTypes = sqliteTable('raw_material_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  sourceId: text('source_id').notNull(),
  rarity: text('rarity', { enum: ['common', 'uncommon', 'rare', 'legendary'] }).notNull(),
  imageUrl: text('image_url'),
  processMs: integer('process_ms').default(7000),
  outputs: text('outputs').notNull(),           // JSON
  wasteType: text('waste_type').notNull(),
  wasteAmount: integer('waste_amount').default(1),
})

// 用户原料库存
export const userRawMaterials = sqliteTable('user_raw_materials', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  materialTypeId: text('material_type_id').notNull(),
  count: integer('count').default(0),
})

// 用户废料库存
export const userWaste = sqliteTable('user_waste', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  wasteType: text('waste_type').notNull(),
  count: integer('count').default(0),
})
