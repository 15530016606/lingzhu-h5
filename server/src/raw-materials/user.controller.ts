// 用户游戏 API — 控制器 + 服务
import { Injectable, Controller, Get, Post, Body } from '@nestjs/common';
import { getDb } from '@/database/connection';
import { users, userRawMaterials, userWaste, dailyClaims, rawMaterialTypes } from '@/database/schema';
import { sql } from 'drizzle-orm';

// 获取或创建默认测试用户
async function getOrCreateUser(phone = '13900000000'): Promise<number> {
  const db = getDb();
  let user = await db.select().from(users).where(sql`phone = ${phone}`).get();
  if (!user) {
    const result = await db.insert(users).values({ phone }).run();
    return Number(result.lastInsertRowid);
  }
  return user.id;
}

@Injectable()
export class UserService {
  async getOrCreateUser(phone = '13900000000'): Promise<number> {
    return getOrCreateUser(phone);
  }

  async getRawMaterials(userId: number) {
    const db = getDb();
    return db.select({
      materialTypeId: userRawMaterials.materialTypeId,
      count: userRawMaterials.count,
      name: rawMaterialTypes.name,
      rarity: rawMaterialTypes.rarity,
      sourceId: rawMaterialTypes.sourceId,
      outputs: rawMaterialTypes.outputs,
      processMs: rawMaterialTypes.processMs,
      imageUrl: rawMaterialTypes.imageUrl,
    })
    .from(userRawMaterials)
    .leftJoin(rawMaterialTypes, sql`${userRawMaterials.materialTypeId} = ${rawMaterialTypes.id}`)
    .where(sql`${userRawMaterials.userId} = ${userId}`)
    .all();
  }

  async getWaste(userId: number) {
    const db = getDb();
    return db.select({
      wasteType: userWaste.wasteType,
      count: userWaste.count,
    })
    .from(userWaste)
    .where(sql`${userWaste.userId} = ${userId}`)
    .all();
  }

  async claimDaily(userId: number) {
    const db = getDb();
    const today = new Date().toISOString().slice(0, 10);

    const existing = await db.select().from(dailyClaims)
      .where(sql`${dailyClaims.userId} = ${userId} AND ${dailyClaims.claimDate} = ${today}`)
      .get();
    if (existing) {
      return { success: false, message: '今天已领取' };
    }

    await db.insert(dailyClaims).values({ userId, claimDate: today }).run();

    const materials = await db.select().from(rawMaterialTypes)
      .where(sql`rarity = 'common'`).all();
    const picked = materials[Math.floor(Math.random() * materials.length)];

    const existingMat = await db.select().from(userRawMaterials)
      .where(sql`${userRawMaterials.userId} = ${userId} AND ${userRawMaterials.materialTypeId} = ${picked.id}`)
      .get();
    if (existingMat) {
      await db.update(userRawMaterials)
        .set({ count: (existingMat.count ?? 0) + 1 })
        .where(sql`${userRawMaterials.id} = ${existingMat.id}`)
        .run();
    } else {
      await db.insert(userRawMaterials).values({ userId, materialTypeId: picked.id, count: 1 }).run();
    }

    return { success: true, material: picked };
  }

  async processMaterial(userId: number, materialTypeId: string) {
    const db = getDb();

    const inventory = await db.select().from(userRawMaterials)
      .where(sql`${userRawMaterials.userId} = ${userId} AND ${userRawMaterials.materialTypeId} = ${materialTypeId}`)
      .get();
    if (!inventory || (inventory.count ?? 0) < 1) {
      return { success: false, message: '原料不足' };
    }

    const material = await db.select().from(rawMaterialTypes)
      .where(sql`${rawMaterialTypes.id} = ${materialTypeId}`).get();
    if (!material) {
      return { success: false, message: '原料类型不存在' };
    }

    await db.update(userRawMaterials)
      .set({ count: (inventory.count ?? 0) - 1 })
      .where(sql`${userRawMaterials.id} = ${inventory.id}`)
      .run();

    const step1 = Math.random() < 0.5;
    const step2 = step1 && Math.random() < 0.7;
    const step3 = step2 && Math.random() < 0.9;

    if (!step3) {
      const existingWaste = await db.select().from(userWaste)
        .where(sql`${userWaste.userId} = ${userId} AND ${userWaste.wasteType} = ${material.wasteType}`)
        .get();
      if (existingWaste) {
        await db.update(userWaste)
          .set({ count: (existingWaste.count ?? 0) + (material.wasteAmount ?? 0) })
          .where(sql`${userWaste.id} = ${existingWaste.id}`)
          .run();
      } else {
        await db.insert(userWaste).values({
          userId,
          wasteType: material.wasteType,
          count: material.wasteAmount ?? 0,
        }).run();
      }

      return {
        success: false,
        step: step1 ? (step2 ? 'polish' : 'grind') : 'cut',
        message: '加工失败',
        wasteType: material.wasteType,
      };
    }

    const outputs = JSON.parse(material.outputs);
    const totalWeight = outputs.reduce((sum: number, o: any) => sum + o.weight, 0);
    let roll = Math.random() * totalWeight;
    let chosenOutput = outputs[outputs.length - 1];
    for (const output of outputs) {
      roll -= output.weight;
      if (roll <= 0) {
        chosenOutput = output;
        break;
      }
    }

    return {
      success: true,
      materialType: chosenOutput.materialType,
      wasteType: null,
    };
  }
}

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('raw-materials')
  async getRawMaterials() {
    const userId = await this.userService.getOrCreateUser();
    return this.userService.getRawMaterials(userId);
  }

  @Get('waste')
  async getWaste() {
    const userId = await this.userService.getOrCreateUser();
    return this.userService.getWaste(userId);
  }

  @Post('claim-daily')
  async claimDaily() {
    const userId = await this.userService.getOrCreateUser();
    return this.userService.claimDaily(userId);
  }

  @Post('process')
  async process(@Body() body: { materialTypeId: string }) {
    const userId = await this.userService.getOrCreateUser();
    return this.userService.processMaterial(userId, body.materialTypeId);
  }
}
