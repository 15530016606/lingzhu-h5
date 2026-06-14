import { Controller, Get, Post, Query } from '@nestjs/common';
import { SignInService } from './signin.service';

@Controller('signin')
export class SignInController {
  constructor(private readonly signInService: SignInService) {}

  @Post()
  doSignIn(@Query('openId') openId: string = 'default') {
    return this.signInService.doSignIn(openId);
  }

  @Get('records')
  getRecords(@Query('openId') openId: string = 'default') {
    return this.signInService.getRecords(openId);
  }

  @Get('streak')
  getStreak() {
    const streak = this.signInService.getStreakCount();
    return { data: { streak } };
  }

  @Get('quota')
  getQuota(@Query('openId') openId: string = 'default') {
    return this.signInService.getDailyQuota(openId);
  }

  @Post('consume')
  consumeQuota(@Query('openId') openId: string = 'default') {
    return this.signInService.consumeQuota(openId);
  }

  @Post('reward')
  addRewardedQuota(@Query('openId') openId: string = 'default') {
    return this.signInService.addRewardedQuota(openId);
  }
}