import { Injectable } from '@nestjs/common';

export interface SignInRecord {
  date: string;
  signed: boolean;
}

// 基于内存存储（生产环境应使用数据库）
@Injectable()
export class SignInService {
  private signInRecords: SignInRecord[] = [];
  // 每日编串额度记录
  private dailyQuota: Map<string, number> = new Map();

  private readonly FREE_LIMIT = 3;

  doSignIn(openId: string): { data: { signed: boolean; streak: number } } {
    const today = new Date().toISOString().split('T')[0];
    const key = `${openId}_${today}`;

    if (this.signInRecords.some(r => r.date === today)) {
      return { data: { signed: false, streak: this.getStreakCount() } };
    }

    this.signInRecords.push({ date: today, signed: true });
    return { data: { signed: true, streak: this.getStreakCount() } };
  }

  getRecords(openId: string): { data: SignInRecord[] } {
    return { data: this.signInRecords };
  }

  getStreakCount(): number {
    if (this.signInRecords.length === 0) return 0;
    const sorted = [...this.signInRecords]
      .filter(r => r.signed)
      .sort((a, b) => b.date.localeCompare(a.date));

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      if (sorted.some(r => r.date === dateStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  getDailyQuota(openId: string): { data: { used: number; max: number } } {
    const today = new Date().toISOString().split('T')[0];
    const key = `${openId}_${today}`;
    const used = this.dailyQuota.get(key) || 0;
    return { data: { used, max: this.FREE_LIMIT } };
  }

  consumeQuota(openId: string): { data: { success: boolean; remaining: number } } {
    const today = new Date().toISOString().split('T')[0];
    const key = `${openId}_${today}`;
    const used = this.dailyQuota.get(key) || 0;

    if (used >= this.FREE_LIMIT) {
      return { data: { success: false, remaining: 0 } };
    }

    this.dailyQuota.set(key, used + 1);
    return { data: { success: true, remaining: this.FREE_LIMIT - used - 1 } };
  }

  addRewardedQuota(openId: string): { data: { remaining: number } } {
    const today = new Date().toISOString().split('T')[0];
    const key = `${openId}_${today}`;
    const used = this.dailyQuota.get(key) || 0;
    const newRemaining = this.FREE_LIMIT + 2 - used;
    this.dailyQuota.set(key, used);
    return { data: { remaining: Math.max(0, newRemaining) } };
  }
}