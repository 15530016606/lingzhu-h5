import { Controller, Get } from '@nestjs/common';
import { FortuneService } from './fortune.service';

@Controller('fortune')
export class FortuneController {
  constructor(private readonly fortuneService: FortuneService) {}

  @Get('daily')
  getDailyFortune() {
    return this.fortuneService.getDailyFortune();
  }

  @Get('all')
  getAllFortunes() {
    return this.fortuneService.getAllFortunes();
  }
}