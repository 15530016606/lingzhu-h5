// 管理后台 — 页面路由
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Controller()
export class AdminController {
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
}
