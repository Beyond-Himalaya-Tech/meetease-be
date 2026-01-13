import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SalesNotesController } from './sales-notes.controller';
import { SalesNotesService } from './sales-notes.service';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [SalesNotesController],
  providers: [SalesNotesService],
  exports: [SalesNotesService]
})
export class SalesNotesModule {}

