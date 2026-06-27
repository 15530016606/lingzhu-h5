import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { AppService } from '@/app.service';
import * as fs from 'fs';
import * as path from 'path';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root(@Res() res: Response) {
    res.redirect('/admin');
  }

  @Get('hello')
  getHello(): { status: string; data: string } {
    return {
      status: 'success',
      data: this.appService.getHello()
    };
  }

  @Get('health')
  getHealth(): { status: string; data: string } {
    return {
      status: 'success',
      data: new Date().toISOString(),
    };
  }

  @Get('download')
  downloadProject(@Res() res: Response) {
    const filePath = path.resolve('/tmp/lingzhu-project.tar.gz');
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', 'application/gzip');
      res.setHeader('Content-Disposition', 'attachment; filename="lingzhu-project.tar.gz"');
      const stream = fs.createReadStream(filePath);
      stream.pipe(res);
    } else {
      res.status(404).json({ status: 'error', message: 'File not found' });
    }
  }
}
