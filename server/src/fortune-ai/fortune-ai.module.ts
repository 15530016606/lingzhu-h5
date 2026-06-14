import { Module } from '@nestjs/common';
import { FortuneAiController } from './fortune-ai.controller';
import { FortuneAiService } from './fortune-ai.service';

@Module({
  controllers: [FortuneAiController],
  providers: [FortuneAiService],
  exports: [FortuneAiService],
})
export class FortuneAiModule {}
