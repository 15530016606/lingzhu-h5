import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { FortuneModule } from '@/fortune/fortune.module';
import { SignInModule } from '@/signin/signin.module';
import { FortuneAiModule } from '@/fortune-ai/fortune-ai.module';
import { ProductsModule } from '@/products/products.module';
import { AdminModule } from '@/admin/admin.module';
import { RawMaterialsController } from '@/raw-materials/raw-materials.controller';
import { RawMaterialsService } from '@/raw-materials/raw-materials.service';
import { UserController, UserService } from '@/raw-materials/user.controller';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [FortuneModule, SignInModule, FortuneAiModule, ProductsModule, AdminModule, AuthModule],
  controllers: [AppController, RawMaterialsController, UserController],
  providers: [AppService, RawMaterialsService, UserService],
})
export class AppModule {}
