import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsDigestService } from './news-digest.service';
import { MailModule } from '../mail/mail.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [MailModule, PrismaModule, AuthModule, UsersModule],
  providers: [NewsService, NewsDigestService],
  controllers: [],
  exports: [NewsService, NewsDigestService],
})
export class NewsModule {}

