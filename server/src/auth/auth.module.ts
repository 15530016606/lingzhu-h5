import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

const JWT_SECRET = 'lingzh...2026';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({ secret: JWT_SECRET, signOptions: { expiresIn: '30d' } }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
