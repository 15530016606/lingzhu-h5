// 用户游戏 API
import { Injectable, Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { getDb } from '@/database/connection';
import { users, userRawMaterials, userWaste, userSandpaper, userBeadCollection, userBeadInventory, dailyClaims, rawMaterialTypes, products } from '@/database/schema';
import { sql } from 'drizzle-orm';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

// 获取用户 ID（兼容新旧模式）
function getUserId(req: any): number | null {
  return req.user?.userId || null;
}

// 尺寸→砂纸消耗
function sandpaperCost(mm: number): number {
  if (mm <= 6) return 4; if (mm <= 8) return 3; if (mm <= 10) return 2; if (mm <= 12) return 2; return 3;
}

// 获取或创建测试用户
async function getTestUser(): Promise<number> {
  const db = getDb();
  let u = await db.select().from(users).where(sql`phone = '13900000000'`).get();
  if (!u) {
    const r = await db.insert(users).values({ phone: '13900000000' }).run();
    return Number(r.lastInsertRowid);
  }
  return u.id;
}

async function ensureSP(uid: number) {
  const db = getDb();
  const s = await db.select().from(userSandpaper).where(sql`user_id = ${uid}`).get();
  if (!s) await db.insert(userSandpaper).values({ userId: uid, count: 0 }).run();
}

@Injectable()
export class UserService {
  // === 兼容旧方法 ===
  async getOrCreateUser(phone = '13900000000') { return getTestUser(); }
  async getRawMaterials(userId: number) {
    const db = getDb();
    return db.select({ materialTypeId: userRawMaterials.materialTypeId, count: userRawMaterials.count, name: rawMaterialTypes.name, rarity: rawMaterialTypes.rarity, sourceId: rawMaterialTypes.sourceId, outputs: rawMaterialTypes.outputs, processMs: rawMaterialTypes.processMs, imageUrl: rawMaterialTypes.imageUrl }).from(userRawMaterials).leftJoin(rawMaterialTypes, sql`${userRawMaterials.materialTypeId} = ${rawMaterialTypes.id}`).where(sql`${userRawMaterials.userId} = ${userId}`).all();
  }
  async getWaste(userId: number) { const db = getDb(); return db.select({ wasteType: userWaste.wasteType, count: userWaste.count }).from(userWaste).where(sql`${userWaste.userId} = ${userId}`).all(); }
  async claimDaily(userId: number) { return this._claimDaily(userId); }
  async processMaterial(userId: number, materialTypeId: string) { return this._process(userId, materialTypeId); }

  // === 新方法 ===
  async _claimDaily(userId: number) {
    const db = getDb(); const today = new Date().toISOString().slice(0, 10);
    const ex = await db.select().from(dailyClaims).where(sql`${dailyClaims.userId}=${userId} AND ${dailyClaims.claimDate}=${today}`).get();
    if (ex) return { success: false, message: '今天已领取' };
    await db.insert(dailyClaims).values({ userId, claimDate: today }).run();
    await ensureSP(userId);
    await db.update(userSandpaper).set({ count: sql`count+3` }).where(sql`user_id=${userId}`).run();
    const mats = await db.select().from(rawMaterialTypes).where(sql`rarity='common'`).all();
    const p = mats[Math.floor(Math.random() * mats.length)];
    const em = await db.select().from(userRawMaterials).where(sql`${userRawMaterials.userId}=${userId} AND ${userRawMaterials.materialTypeId}=${p.id}`).get();
    if (em) await db.update(userRawMaterials).set({ count: (em.count ?? 0) + 1 }).where(sql`${userRawMaterials.id}=${em.id}`).run();
    else await db.insert(userRawMaterials).values({ userId, materialTypeId: p.id, count: 1 }).run();
    return { success: true, material: p, sandpaper: 3 };
  }

  async _process(userId: number, materialTypeId: string) {
    const db = getDb();
    const inv = await db.select().from(userRawMaterials).where(sql`${userRawMaterials.userId}=${userId} AND ${userRawMaterials.materialTypeId}=${materialTypeId}`).get();
    if (!inv || (inv.count ?? 0) < 1) return { success: false, message: '原料不足' };
    const mat = await db.select().from(rawMaterialTypes).where(sql`${rawMaterialTypes.id}=${materialTypeId}`).get();
    if (!mat) return { success: false, message: '原料不存在' };
    await ensureSP(userId);
    const sp = await db.select().from(userSandpaper).where(sql`user_id=${userId}`).get();

    // 确定产物
    const outputs = JSON.parse(mat.outputs);
    const tw = outputs.reduce((s: number, o: any) => s + o.weight, 0);
    let r = Math.random() * tw, ct = outputs[outputs.length - 1].materialType;
    for (const o of outputs) { r -= o.weight; if (r <= 0) { ct = o.materialType; break; } }

    const cand = await db.select().from(products).where(sql`material_type=${ct} AND type='bead'`).all();
    if (cand.length === 0) return { success: false, message: '没有对应珠子' };
    const prod = cand[Math.floor(Math.random() * cand.length)];
    const sz = prod.size ? parseFloat(String(prod.size)) : 8;
    const cost = sandpaperCost(sz);
    if (!sp || (sp.count ?? 0) < cost) return { success: false, message: `砂纸不足需要${cost}张` };

    // 扣原料+砂纸
    await db.update(userRawMaterials).set({ count: (inv.count ?? 0) - 1 }).where(sql`${userRawMaterials.id}=${inv.id}`).run();
    await db.update(userSandpaper).set({ count: (sp.count ?? 0) - cost }).where(sql`id=${sp.id}`).run();

    // 概率
    const s1 = Math.random() < 0.5, s2 = s1 && Math.random() < 0.7, s3 = s2 && Math.random() < 0.9;
    if (!s3) {
      const ew = await db.select().from(userWaste).where(sql`${userWaste.userId}=${userId} AND ${userWaste.wasteType}=${mat.wasteType}`).get();
      if (ew) await db.update(userWaste).set({ count: (ew.count ?? 0) + 1 }).where(sql`${userWaste.id}=${ew.id}`).run();
      else await db.insert(userWaste).values({ userId, wasteType: mat.wasteType, count: 1 }).run();
      return { success: false, step: s1 ? (s2 ? 'polish' : 'grind') : 'cut', message: '加工失败', wasteType: mat.wasteType };
    }

    // 成功：图鉴+背包
    const col = await db.select().from(userBeadCollection).where(sql`${userBeadCollection.userId}=${userId} AND ${userBeadCollection.materialType}=${ct}`).get();
    const now = new Date().toISOString();
    if (col) await db.update(userBeadCollection).set({ count: (col.count ?? 0) + 1, lastAt: now }).where(sql`${userBeadCollection.id}=${col.id}`).run();
    else await db.insert(userBeadCollection).values({ userId, materialType: ct, count: 1, firstAt: now, lastAt: now }).run();

    const bi = await db.select().from(userBeadInventory).where(sql`${userBeadInventory.userId}=${userId} AND ${userBeadInventory.productIndex}=${prod.id}`).get();
    if (bi) await db.update(userBeadInventory).set({ count: (bi.count ?? 0) + 1 }).where(sql`${userBeadInventory.id}=${bi.id}`).run();
    else await db.insert(userBeadInventory).values({ userId, productIndex: prod.id, count: 1 }).run();

    return { success: true, materialType: ct, product: { id: prod.id, name: prod.name, size: prod.size, price: prod.price }, sandpaperUsed: cost };
  }

  async recycleWaste(userId: number, wasteType: string, target: string) {
    const db = getDb();
    const ws = await db.select().from(userWaste).where(sql`${userWaste.userId}=${userId} AND ${userWaste.wasteType}=${wasteType}`).get();
    if (!ws || (ws.count ?? 0) < (target === 'material' ? 5 : 3)) return { success: false, message: target === 'material' ? '需要5个废料' : '需要3个废料' };

    await db.update(userWaste).set({ count: (ws.count ?? 0) - (target === 'material' ? 5 : 3) }).where(sql`${userWaste.id}=${ws.id}`).run();
    if (target === 'material') {
      const cm = await db.select().from(rawMaterialTypes).where(sql`rarity='common'`).all();
      const p = cm[Math.floor(Math.random() * cm.length)];
      const em = await db.select().from(userRawMaterials).where(sql`${userRawMaterials.userId}=${userId} AND ${userRawMaterials.materialTypeId}=${p.id}`).get();
      if (em) await db.update(userRawMaterials).set({ count: (em.count ?? 0) + 1 }).where(sql`${userRawMaterials.id}=${em.id}`).run();
      else await db.insert(userRawMaterials).values({ userId, materialTypeId: p.id, count: 1 }).run();
      return { success: true, material: p };
    }
    await ensureSP(userId);
    await db.update(userSandpaper).set({ count: sql`count+1` }).where(sql`user_id=${userId}`).run();
    return { success: true };
  }

  async getSandpaper(userId: number) {
    await ensureSP(userId);
    const db = getDb();
    const s = await db.select().from(userSandpaper).where(sql`user_id=${userId}`).get();
    return s || { count: 0 };
  }

  async getCollection(userId: number) {
    const db = getDb();
    return db.select({ materialType: userBeadCollection.materialType, count: userBeadCollection.count, firstAt: userBeadCollection.firstAt, lastAt: userBeadCollection.lastAt }).from(userBeadCollection).where(sql`${userBeadCollection.userId}=${userId}`).all();
  }

  async getInventory(userId: number) {
    const db = getDb();
    return db.select({ productIndex: userBeadInventory.productIndex, count: userBeadInventory.count, name: products.name }).from(userBeadInventory).leftJoin(products, sql`${userBeadInventory.productIndex}=${products.id}`).where(sql`${userBeadInventory.userId}=${userId}`).all();
  }
}

// === 控制器 ===
@Controller('user')
export class UserController {
  constructor(private readonly s: UserService) {}

  // 旧API（无鉴权，兼容现有前端）
  @Get('raw-materials') async getRawMaterials() { return this.s.getRawMaterials(await getTestUser()); }
  @Get('waste') async getWaste() { return this.s.getWaste(await getTestUser()); }
  @Post('claim-daily') async claimDaily() { return this.s._claimDaily(await getTestUser()); }
  @Post('process') async process(@Body() b: { materialTypeId: string }) { return this.s._process(await getTestUser(), b.materialTypeId); }

  // 新API（需JWT鉴权）
  @UseGuards(JwtAuthGuard)
  @Get('me/raw-materials') async getRawMaterialsAuth(@Req() req: any) { return this.s.getRawMaterials(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Get('me/waste') async getWasteAuth(@Req() req: any) { return this.s.getWaste(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Get('me/sandpaper') async getSandpaper(@Req() req: any) { return this.s.getSandpaper(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Post('me/claim-daily') async claimDailyAuth(@Req() req: any) { return this.s._claimDaily(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Post('me/process') async processAuth(@Req() req: any, @Body() b: { materialTypeId: string }) { return this.s._process(req.user.userId, b.materialTypeId); }

  @UseGuards(JwtAuthGuard)
  @Post('me/recycle') async recycle(@Req() req: any, @Body() b: { wasteType: string; target: string }) { return this.s.recycleWaste(req.user.userId, b.wasteType, b.target); }

  @UseGuards(JwtAuthGuard)
  @Get('me/collection') async collection(@Req() req: any) { return this.s.getCollection(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Get('me/inventory') async inventory(@Req() req: any) { return this.s.getInventory(req.user.userId); }
}
