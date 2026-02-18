import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor() {
        const user = process.env.MAIL_USER;
        const pass = process.env.MAIL_PASS;
        const host = process.env.MAIL_HOST || 'smtp.gmail.com';

        const transportOptions: any = {
            auth: { user, pass },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 30000,
            family: 4, // Force IPv4
            tls: { rejectUnauthorized: false }
        };

        if (host.includes('gmail.com')) {
            transportOptions.service = 'gmail';
        } else {
            transportOptions.host = host;
            transportOptions.port = parseInt(process.env.MAIL_PORT || '465');
            transportOptions.secure = transportOptions.port === 465;
        }

        this.transporter = nodemailer.createTransport(transportOptions);
    }

    async onModuleInit() {
        if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
            this.logger.error('CRITICAL: SMTP credentials missing.');
            return;
        }

        try {
            await this.transporter.verify();
            this.logger.log('SMTP connection verified successfully.');
        } catch (error) {
            this.logger.error('SMTP verification failed. Check App Password.', error.message);
        }
    }

    async sendOtp(email: string, otp: string) {
        const mailOptions = {
            from: `"JusticeTrack" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
            to: email,
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
        };

        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
            try {
                attempts++;
                await this.transporter.sendMail(mailOptions);
                this.logger.log(`OTP successfully sent to ${email} (Attempt ${attempts})`);
                return;
            } catch (error) {
                this.logger.warn(`Failed to send OTP to ${email} (Attempt ${attempts}/${maxRetries}): ${error.message}`);
                if (attempts >= maxRetries) {
                    this.logger.error(`Critical: All ${maxRetries} attempts failed for ${email}`);
                    throw error;
                }
                // Wait 2 seconds before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
}
