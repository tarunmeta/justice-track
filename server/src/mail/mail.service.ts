import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SibApiV3Sdk from '@getbrevo/brevo';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private apiInstance: SibApiV3Sdk.TransactionalEmailsApi;

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('BREVO_API_KEY');
        this.logger.log(`Brevo API Key loaded: ${apiKey ? 'YES' : 'NO'}`);

        if (apiKey) {
            this.apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
            this.apiInstance.setApiKey(
                SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
                apiKey,
            );
        } else {
            this.logger.error('CRITICAL: BREVO_API_KEY is missing. Email service will not work.');
        }
    }

    async sendOtp(email: string, otp: string): Promise<void> {
        if (!this.apiInstance) {
            this.logger.error('Brevo API instance not initialized. Cannot send OTP.');
            throw new Error('Email service is currently unavailable.');
        }

        try {
            const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

            sendSmtpEmail.sender = {
                email: this.configService.get<string>('MAIL_FROM', 'tarunsainiwork@gmail.com'),
                name: this.configService.get<string>('MAIL_FROM_NAME', 'JusticeTrack'),
            };
            sendSmtpEmail.to = [{ email }];
            sendSmtpEmail.subject = 'JusticeTrack: Your Verification Code';
            sendSmtpEmail.htmlContent = `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #4F46E5; text-align: center;">Verify Your Account</h2>
                    <p>Hello,</p>
                    <p>Use the OTP code below to complete your verification on JusticeTrack:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #4F46E5; background: #f9fafb; padding: 15px 25px; border-radius: 8px; border: 1px dashed #4F46E5;">
                            ${otp}
                        </span>
                    </div>
                    <p>This code expires in <strong>10 minutes</strong>.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #999; font-size: 12px; text-align: center;">&copy; 2024 JusticeTrack. All rights reserved.</p>
                </div>
            `;

            const response = await this.apiInstance.sendTransacEmail(sendSmtpEmail);
            this.logger.log(`OTP successfully sent to ${email} | Message ID: ${response.body.messageId}`);
        } catch (err: any) {
            const errorDetail = err?.response?.body || err?.response?.data || err.message;
            this.logger.error(`Failed to send OTP to ${email}: ${JSON.stringify(errorDetail)}`);
            throw err;
        }
    }
}
