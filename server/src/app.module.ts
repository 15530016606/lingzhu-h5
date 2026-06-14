import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { FortuneModule } from '@/fortune/fortune.module';
import { SignInModule } from '@/signin/signin.module';
import { FortuneAiModule } from '@/fortune-ai/fortune-ai.module';

@Module({
  imports: [FortuneModule, SignInModule, FortuneAiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
