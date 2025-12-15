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
}