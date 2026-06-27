// 原料 + 采集源 API — 控制器
import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { RawMaterialsService } from './raw-materials.service';

@Controller('raw-materials')
export class RawMaterialsController {
  constructor(private readonly service: RawMaterialsService) {}

  @Get('sources')
  getSources() {
    return this.service.getSources();
  }

  @Get()
  getMaterials(@Query('sourceId') sourceId?: string) {
    return this.service.getMaterials(sourceId);
  }
}
