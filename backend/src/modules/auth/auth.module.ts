import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './auth.guard';
import { GoogleOauthModule } from '../google-oauth/google-oauth.module';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => UsersModule),
    GoogleOauthModule
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  exports: [
    AuthGuard,
    AuthService,
    JwtModule
  ],
})
export class AuthModule {}
