import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { EventTypesModule } from '../event-types/event-types.module';

@Module({
    imports: [
        PrismaModule,
        forwardRef(() => AuthModule),
        UsersModule,
        EventTypesModule
    ],
    controllers: [EventsController],
    providers: [EventsService]
})
export class EventsModule {}
