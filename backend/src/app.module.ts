import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AvailabilitiesService } from './modules/availabilities/availabilities.service';
import { AvailabilitiesModule } from './modules/availabilities/availabilities.module';
import { ContactsService } from './modules/contacts/contacts.service';
import { ContactsModule } from './modules/contacts/contacts.module';
import { EventTypesService } from './modules/event-types/event-types.service';
import { EventTypesModule } from './modules/event-types/event-types.module';
import { EventsService } from './modules/events/events.service';
import { EventsModule } from './modules/events/events.module';
import { AuthService } from './modules/auth/auth.service';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [UsersModule, PrismaModule, AvailabilitiesModule, ContactsModule, EventTypesModule, EventsModule, AuthModule],
  providers: [PrismaService, AvailabilitiesService, ContactsService, EventTypesService, EventsService, AuthService],
})
export class AppModule {}
