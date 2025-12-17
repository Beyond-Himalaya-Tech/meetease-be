import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventTypesController } from './event-types.controller';
import { EventTypesService } from './event-types.service';

@Module({
  imports: [PrismaModule],
  controllers: [EventTypesController],
  providers: [EventTypesService]
})
export class EventTypesModule {}
