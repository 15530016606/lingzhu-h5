import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { AdminModule } from '@/admin/admin.module';
import { UserController, UserService } from '@/raw-materials/user.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [AdminModule, AuthModule],
  controllers: [AppController, UserController],
  providers: [AppService, UserService],
})
export class AppModule {}
