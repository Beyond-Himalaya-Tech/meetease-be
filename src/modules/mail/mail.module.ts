import { MailerModule } from '@nestjs-modules/mailer';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import { Module } from '@nestjs/common';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { join } from 'path';
import { MailService } from './mail.service';

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: () => {
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = Number(process.env.SMTP_PORT);
        const smtpUser = process.env.SMTP_USER;
        const smtpFrom = process.env.SMTP_FROM;

        console.log('=== SMTP Configuration ===');
        console.log('SMTP_HOST:', smtpHost);
        console.log('SMTP_PORT:', smtpPort);
        console.log('SMTP_USER:', smtpUser ? `${smtpUser.substring(0, 5)}...` : 'NOT SET');
        console.log('SMTP_FROM:', smtpFrom);
        console.log('==========================');

        if (!smtpHost) {
          throw new Error('SMTP_HOST environment variable is not set');
        }

        return {
          transport: {
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
              user: smtpUser,
              pass: process.env.SMTP_PASS,
            },
            tls: {
              rejectUnauthorized: false,
            },
          } as SMTPTransport.Options,
          defaults: {
            from: `${process.env.SMTP_FROM_NAME || 'MeetEase'} <${smtpFrom}>`,
          },
          template: {
            dir: join(__dirname, '..', '..', 'templates'),
            adapter: new PugAdapter(),
            options: {
              strict: true,
            },
          },
        };
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService]
})

export class MailModule {}