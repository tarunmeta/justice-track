import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
    private resend: Resend;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('RESEND_API_KEY');
        if (apiKey) {
            this.resend = new Resend(apiKey);
        } else {
            this.logger.error('CRITICAL: RESEND_API_KEY is missing. Email service will not work.');
        }
    }

    async sendOtp(email: string, otp: string): Promise<void> {
        if (!this.resend) {
            this.logger.error('Resend client not initialized. Cannot send OTP.');
            throw new Error('Email service is currently unavailable.');
        }
        const from = this.configService.get<string>('MAIL_FROM', 'onboarding@resend.dev');

        try {
            const { data, error } = await this.resend.emails.send({
                from,
                to: [email],
                subject: 'Your JusticeTrack Verification Code',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                        <h2 style="color: #4f46e5; text-align: center;">Welcome to JusticeTrack</h2>
                        <p>Hello,</p>
                        <p>Please use the following verification code to complete your registration:</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px 20px; border-radius: 5px;">${otp}</span>
                        </div>
                        <p>This code will expire in 10 minutes.</p>
                        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                        <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2024 JusticeTrack. All rights reserved.</p>
                    </div>
                `,
            });

            if (error) {
                this.logger.error(`Resend API error sending OTP to ${email}: ${error.message}`);
                throw new Error(error.message);
            }

            this.logger.log(`OTP successfully sent to ${email}. Message ID: ${data?.id}`);
        } catch (err) {
            this.logger.error(`Failed to send OTP email to ${email}: ${err.message}`);
            throw err;
        }
    }
}
