// 管理后台 — 页面路由 + 用户管理 API
import { Controller, Get, Post, Delete, Param, Body, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import { AdminAuthGuard } from './admin-auth.guard';
import { AdminService } from './admin.service';

@Controller()
@UseGuards(AdminAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // 管理后台页面
  @Get('admin')
  getAdminPage(@Res() res: Response) {
    const htmlPath = path.resolve(__dirname, '../admin/pages/index.html');
    if (fs.existsSync(htmlPath)) {
      res.sendFile(htmlPath);
    } else {
      const devPath = path.resolve(__dirname, '../../src/admin/pages/index.html');
      if (fs.existsSync(devPath)) {
        res.sendFile(devPath);
      } else {
        res.status(500).send('Admin page not found');
      }
    }
  }

  // 1. 获取全部用户列表
  @Get('admin/users')
  getUsers() {
    return this.adminService.getUsers();
  }

  // 2. 添加用户
  @Post('admin/users')
  addUser(@Body() body: { phone: string; password: string }) {
    return this.adminService.addUser(body.phone, body.password);
  }

  // 3. 删除用户
  @Delete('admin/users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(Number(id));
  }

  // 4. 查看用户背包（原料）
  @Get('admin/users/:id/materials')
  getUserMaterials(@Param('id') id: string) {
    return this.adminService.getUserMaterials(Number(id));
  }

  // 5. 查看用户珠子库存
  @Get('admin/users/:id/beads')
  getUserBeads(@Param('id') id: string) {
    return this.adminService.getUserBeads(Number(id));
  }
}
