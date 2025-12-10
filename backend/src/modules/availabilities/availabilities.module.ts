import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AvailabilitiesController } from './availabilities.controller';
import { AvailabilitiesService } from './availabilities.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module'; // ← add this

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    UsersModule
  ],
  controllers: [AvailabilitiesController],
  providers: [AvailabilitiesService],
  exports: [AvailabilitiesService]
})
export class AvailabilitiesModule {}
