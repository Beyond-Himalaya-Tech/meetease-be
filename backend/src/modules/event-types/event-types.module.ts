import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventTypesController } from './event-types.controller';
import { EventTypesService } from './event-types.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    UsersModule
  ],
  controllers: [EventTypesController],
  providers: [EventTypesService]
})
export class EventTypesModule {}
