import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { EventTypesModule } from '../event-types/event-types.module';
import { PublicContactsController } from './public-contacts.controller';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    UsersModule,
    EventTypesModule
  ],
  controllers: [ContactsController, PublicContactsController],
  providers: [ContactsService],
  exports: [ContactsService]
})
export class ContactsModule {}
