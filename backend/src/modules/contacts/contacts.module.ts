import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';

@Module({
  imports: [PrismaModule],
  controllers: [ContactsController],
  providers: [ContactsService]
})
export class ContactsModule {}
