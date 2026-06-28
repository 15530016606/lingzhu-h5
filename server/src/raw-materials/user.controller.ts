import { Injectable, Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { getDb } from '@/database/connection';
import { users, materialTypes, userMaterials, userBeads, orders } from '@/database/schema';
import { sql } from 'drizzle-orm';
import { JwtAuthGuard } from '@/auth/jwt-auth.guard';

@Injectable()
export class UserService {
  // 获取用户原料列表（背包）
  async getMaterials(userId: number) {
    const db = getDb();
    const rows = await db.select({
      materialType: userMaterials.materialType,
      count: userMaterials.count,
      name: materialTypes.name,
      scene: materialTypes.scene,
      emoji: materialTypes.emoji,
    }).from(userMaterials)
      .leftJoin(materialTypes, sql`${userMaterials.materialType} = ${materialTypes.id}`)
      .where(sql`${userMaterials.userId} = ${userId}`)
      .all();
    return rows.filter(r => (r.count ?? 0) > 0);
  }

  // 获取用户珠子库存
  async getBeads(userId: number) {
    const db = getDb();
    return db.select({
      id: userBeads.id,
      name: userBeads.name,
      materialType: userBeads.materialType,
      quality: userBeads.quality,
      count: userBeads.count,
    }).from(userBeads).where(sql`${userBeads.userId} = ${userId}`).all();
  }

  // 添加原料到背包
  async addMaterial(userId: number, materialType: string, count = 1) {
    const db = getDb();
    const existing = await db.select().from(userMaterials)
      .where(sql`${userMaterials.userId}=${userId} AND ${userMaterials.materialType}=${materialType}`).get();
    if (existing) {
      await db.update(userMaterials).set({ count: (existing.count ?? 0) + count })
        .where(sql`${userMaterials.id}=${existing.id}`).run();
    } else {
      await db.insert(userMaterials).values({ userId, materialType, count }).run();
    }
    return { success: true };
  }

  // 消耗原料
  async consumeMaterial(userId: number, materialType: string) {
    const db = getDb();
    const existing = await db.select().from(userMaterials)
      .where(sql`${userMaterials.userId}=${userId} AND ${userMaterials.materialType}=${materialType}`).get();
    if (!existing || (existing.count ?? 0) < 1) return { success: false, message: '原料不足' };
    const newCount = (existing.count ?? 0) - 1;
    if (newCount <= 0) {
      await db.delete(userMaterials).where(sql`${userMaterials.id}=${existing.id}`).run();
    } else {
      await db.update(userMaterials).set({ count: newCount }).where(sql`${userMaterials.id}=${existing.id}`).run();
    }
    return { success: true };
  }

  // 添加珠子到库存
  async addBead(userId: number, name: string, materialType: string, quality: string) {
    const db = getDb();
    const existing = await db.select().from(userBeads)
      .where(sql`${userBeads.userId}=${userId} AND ${userBeads.materialType}=${materialType} AND ${userBeads.quality}=${quality}`).get();
    if (existing) {
      await db.update(userBeads).set({ count: (existing.count ?? 0) + 1 })
        .where(sql`${userBeads.id}=${existing.id}`).run();
    } else {
      await db.insert(userBeads).values({ userId, name, materialType, quality, count: 1 }).run();
    }
    return { success: true };
  }

  // 创建订单
  async createOrder(userId: number, data: { beads: { name: string; materialType: string; quality: string }[]; ropeColor: string; receiver: string; phone: string; address: string; note?: string }) {
    const db = getDb();
    const orderId = `ORD${Date.now()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const totalPrice = data.beads.length * 500; // 每颗500分

    await db.insert(orders).values({
      id: orderId,
      userId,
      beads: JSON.stringify(data.beads),
      ropeColor: data.ropeColor,
      receiver: data.receiver,
      phone: data.phone,
      address: data.address,
      note: data.note || '',
      totalPrice,
    } as any).run();

    // 从库存扣减珠子
    for (const b of data.beads) {
      const bead = await db.select().from(userBeads)
        .where(sql`${userBeads.userId}=${userId} AND ${userBeads.materialType}=${b.materialType} AND ${userBeads.quality}=${b.quality}`).get();
      if (bead) {
        const newCount = (bead.count ?? 0) - 1;
        if (newCount <= 0) await db.delete(userBeads).where(sql`${userBeads.id}=${bead.id}`).run();
        else await db.update(userBeads).set({ count: newCount }).where(sql`${userBeads.id}=${bead.id}`).run();
      }
    }

    return { success: true, orderId };
  }
}

@Controller('user')
export class UserController {
  constructor(private readonly s: UserService) {}

  // 需要 JWT 鉴权的 API
  @UseGuards(JwtAuthGuard)
  @Get('materials')
  async getMaterials(@Req() req: any) { return this.s.getMaterials(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Get('beads')
  async getBeads(@Req() req: any) { return this.s.getBeads(req.user.userId); }

  @UseGuards(JwtAuthGuard)
  @Post('materials/add')
  async addMaterial(@Req() req: any, @Body() b: { materialType: string; count?: number }) {
    return this.s.addMaterial(req.user.userId, b.materialType, b.count ?? 1);
  }

  @UseGuards(JwtAuthGuard)
  @Post('materials/consume')
  async consumeMaterial(@Req() req: any, @Body() b: { materialType: string }) {
    return this.s.consumeMaterial(req.user.userId, b.materialType);
  }

  @UseGuards(JwtAuthGuard)
  @Post('beads/add')
  async addBead(@Req() req: any, @Body() b: { name: string; materialType: string; quality: string }) {
    return this.s.addBead(req.user.userId, b.name, b.materialType, b.quality);
  }

  @UseGuards(JwtAuthGuard)
  @Post('orders')
  async createOrder(@Req() req: any, @Body() b: any) {
    return this.s.createOrder(req.user.userId, b);
  }
}
