import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventTypesController } from './event-types.controller';
import { EventTypesService } from './event-types.service';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { AvailabilitiesModule } from '../availabilities/availabilities.module';
import { GoogleOauthModule } from '../google-oauth/google-oauth.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    UsersModule,
    AvailabilitiesModule,
    GoogleOauthModule
  ],
  controllers: [EventTypesController],
  providers: [EventTypesService],
  exports: [EventTypesService]
})
export class EventTypesModule {}
