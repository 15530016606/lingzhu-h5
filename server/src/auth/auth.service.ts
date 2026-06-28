import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getDb } from '@/database/connection';
import { users } from '@/database/schema';
import { sql } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async register(phone: string, password: string) {
    const db = getDb();
    const existing = await db.select().from(users).where(sql`phone = ${phone}`).get();
    if (existing) return { success: false, message: '该手机号已注册' };

    const hash = await bcrypt.hash(password, 10);
    const result = await db.insert(users).values({ phone, passwordHash: hash }).run();
    const userId = Number(result.lastInsertRowid);
    const token = this.jwtService.sign({ sub: userId });

    return { success: true, token, userId };
  }

  async login(phone: string, password: string) {
    const db = getDb();
    const user = await db.select().from(users).where(sql`phone = ${phone}`).get();
    if (!user) return { success: false, message: '手机号未注册' };

    const valid = await bcrypt.compare(password, user.passwordHash || '');
    if (!valid) return { success: false, message: '密码错误' };

    const token = this.jwtService.sign({ sub: user.id });
    return { success: true, token, userId: user.id };
  }

  async getUser(userId: number) {
    const db = getDb();
    const user = await db.select({
      id: users.id, phone: users.phone, nickname: users.nickname,
      createdAt: users.createdAt, totalOrders: users.totalOrders,
    }).from(users).where(sql`id = ${userId}`).get();
    return user || null;
  }
}
