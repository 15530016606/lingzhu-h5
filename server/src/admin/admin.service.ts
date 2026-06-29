// 管理后台 — 数据服务
import { Injectable } from '@nestjs/common';
import { getDb } from '@/database/connection';
import { users, materialTypes, userMaterials, userBeads } from '@/database/schema';
import { eq, sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  // 1. 获取全部用户列表
  async getUsers() {
    const db = getDb();
    const result = await db
      .select({
        id: users.id,
        phone: users.phone,
        nickname: users.nickname,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(users.createdAt);
    return result;
  }

  // 2. 添加用户
  async addUser(phone: string, password: string) {
    const db = getDb();
    const passwordHash = await bcrypt.hash(password, 10);
    const result = await db
      .insert(users)
      .values({ phone, passwordHash })
      .returning({ id: users.id });
    return { success: true, userId: result[0].id };
  }

  // 3. 删除用户
  async deleteUser(id: number) {
    const db = getDb();
    await db.delete(users).where(eq(users.id, id));
    return { success: true };
  }

  // 4. 查看用户背包（原料），关联 material_types 获取名称
  async getUserMaterials(userId: number) {
    const db = getDb();
    const result = await db
      .select({
        materialType: userMaterials.materialType,
        name: materialTypes.name,
        count: userMaterials.count,
      })
      .from(userMaterials)
      .leftJoin(materialTypes, eq(userMaterials.materialType, materialTypes.id))
      .where(eq(userMaterials.userId, userId));
    return result;
  }

  // 5. 查看用户珠子库存
  async getUserBeads(userId: number) {
    const db = getDb();
    const result = await db
      .select({
        id: userBeads.id,
        name: userBeads.name,
        materialType: userBeads.materialType,
        quality: userBeads.quality,
        count: userBeads.count,
      })
      .from(userBeads)
      .where(eq(userBeads.userId, userId));
    return result;
  }
}
