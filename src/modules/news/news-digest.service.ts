import { Injectable, Logger } from '@nestjs/common';
import { NewsService } from './news.service';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NewsDigestService {
  private readonly logger = new Logger(NewsDigestService.name);

  constructor(
    private readonly newsService: NewsService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Sends weekly tech news digest to all MeetEase clients (contacts)
   */
  async sendWeeklyTechDigest(): Promise<void> {
    try {
      this.logger.log('Starting weekly tech news digest process...');

      // Fetch top 5 tech news articles
      const articles = await this.newsService.getTechNews(5);
      
      if (articles.length === 0) {
        this.logger.warn('No articles found, skipping digest send');
        return;
      }

      this.logger.log(`Fetched ${articles.length} articles for digest`);

      // Get all MeetEase clients (contacts) - excluding soft-deleted ones
      const recipients = await this.prisma.contacts.findMany({
        where: {
          deleted_at: null, // Only active contacts
        },
        select: {
          email: true,
          name: true,
        },
      });

      if (recipients.length === 0) {
        this.logger.log('No clients (contacts) found to send digest to');
        return;
      }

      // Filter out contacts without valid email addresses
      const validRecipients = recipients.filter(
        (r) => r.email && r.email.trim().length > 0,
      );

      if (validRecipients.length === 0) {
        this.logger.warn(
          `Found ${recipients.length} contacts but none have valid email addresses`,
        );
        return;
      }

      this.logger.log(
        `Found ${validRecipients.length} clients with valid emails (out of ${recipients.length} total contacts)`,
      );

      // Log first few emails for debugging
      this.logger.log(
        `Sample recipients: ${validRecipients.slice(0, 3).map((r) => r.email).join(', ')}`,
      );

      // Send email to each recipient
      let successCount = 0;
      let failureCount = 0;

      for (const recipient of validRecipients) {
        try {
          this.logger.log(`Attempting to send digest to ${recipient.email}...`);
          await this.mailService.sendTechDigest(
            recipient.email,
            articles,
            recipient.name || undefined,
          );
          successCount++;
          this.logger.log(`✓ Successfully sent to ${recipient.email}`);
        } catch (error) {
          failureCount++;
          this.logger.error(
            `✗ Failed to send digest to ${recipient.email}:`,
            error instanceof Error ? error.message : String(error),
          );
          if (error instanceof Error && error.stack) {
            this.logger.error(`Stack trace: ${error.stack}`);
          }
        }
      }

      this.logger.log(
        `Weekly tech news digest completed. Success: ${successCount}, Failures: ${failureCount}`,
      );
    } catch (error) {
      this.logger.error('Error in weekly tech news digest process:', error);
      throw error;
    }
  }
}
