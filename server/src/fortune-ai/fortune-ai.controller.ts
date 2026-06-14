import { Controller, Post, Body } from '@nestjs/common';
import { FortuneAiService } from './fortune-ai.service';

@Controller('fortune-ai')
export class FortuneAiController {
  constructor(private readonly service: FortuneAiService) {}

  @Post('recommend')
  async recommend(@Body() body: Record<string, any>) {
    return this.service.recommend(
      body?.answers || [],
      body?.wristSizeCm || 16,
    );
  }

  @Post('couple')
  async couple(@Body() body: Record<string, any>) {
    return this.service.coupleRecommend(
      body?.person1 || { name: '你', year: 2000, month: 1, day: 1 },
      body?.person2 || { name: 'TA', year: 2000, month: 1, day: 1 },
    );
  }
}
