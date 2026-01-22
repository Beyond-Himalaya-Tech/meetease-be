import { ISendMailOptions, MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    constructor(private readonly mailerService: MailerService) {}

    async sendEmail(params: {
        subject: string;
        template: string;
        context: ISendMailOptions['context'];
        emailsList: string;
    }) {
        try {
            const emailArray = params.emailsList.split(',').map(email => email.trim());
            
            const emailPromises = emailArray.map(async (email) => {
                const sendMailParams = {
                    to: email,
                    from: `${process.env.SMTP_FROM_NAME || 'MeetEase'} <${process.env.SMTP_FROM}>`,
                    subject: params.subject,
                    template: params.template,
                    context: params.context,
                };
                
                return await this.mailerService.sendMail(sendMailParams);
            });

            const responses = await Promise.all(emailPromises);
            
            console.log(
                `Emails sent successfully to ${emailArray.length} recipients individually: ${emailArray.join(', ')}`,
                responses,
            );
        } catch (error) {
            // console.error(
            //     `Error while sending mail with the following parameters : ${JSON.stringify(
            //         params,
            //     )}`
            // );
            console.log(error);
        }
    }

    async sendTechDigest(email: string, articles: Array<{
        title: string;
        link: string;
        pubDate: string;
        contentSnippet?: string;
        source: string;
    }>, recipientName?: string): Promise<void> {
        try {
            // Validate email
            if (!email || !email.trim()) {
                throw new Error('Email address is required');
            }

            // Validate SMTP configuration
            if (!process.env.SMTP_FROM) {
                throw new Error('SMTP_FROM environment variable is not set');
            }

            this.logger.log(`Preparing to send tech digest to ${email}...`);

            const currentYear = new Date().getFullYear();
            const formattedArticles = articles.map(article => ({
                ...article,
                pubDateFormatted: new Date(article.pubDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                })
            }));

            const mailOptions = {
                to: email.trim(),
                from: `${process.env.SMTP_FROM_NAME || 'MeetEase'} <${process.env.SMTP_FROM}>`,
                subject: `📰 Weekly Tech News Digest - Top ${articles.length} Stories`,
                template: 'tech-news-digest',
                context: {
                    name: recipientName || 'there',
                    articles: formattedArticles,
                    articleCount: articles.length,
                    currentYear,
                },
            };

            this.logger.log(`Sending mail with options: ${JSON.stringify({ to: mailOptions.to, subject: mailOptions.subject })}`);

            const result = await this.mailerService.sendMail(mailOptions);

            this.logger.log(`Tech news digest sent successfully to ${email}. Result: ${JSON.stringify(result)}`);
        } catch (error) {
            this.logger.error(`Error sending tech news digest to ${email}:`, error);
            if (error instanceof Error) {
                this.logger.error(`Error details: ${error.message}`);
                this.logger.error(`Error stack: ${error.stack}`);
            }
            throw error;
        }
    }
}