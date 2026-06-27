// 管理员鉴权 Guard
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['authorization']?.replace('Bearer ', '');
    const adminToken = process.env.ADMIN_TOKEN || 'admin123';

    if (!token || token !== adminToken) {
      throw new UnauthorizedException('无效的管理员令牌');
    }
    return true;
  }
}
