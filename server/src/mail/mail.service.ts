import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService implements OnModuleInit {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor(private configService: ConfigService) {
        const user = this.configService.get<string>('MAIL_USER');
        const pass = this.configService.get<string>('MAIL_PASS');
        const host = this.configService.get<string>('MAIL_HOST', 'smtp.gmail.com');
        const port = this.configService.get<number>('MAIL_PORT', 465);
        const secure = this.configService.get<boolean>('MAIL_SECURE', port === 465);

        const transportOptions: any = {
            host,
            port,
            secure,
            auth: { user, pass },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 15000,
            family: 4, // Force IPv4 globally for this transporter
            tls: {
                rejectUnauthorized: false, // Prevents cert issues with some cloud proxies
            },
        };

        // Use 'gmail' service only if host is gmail and it's the standard port
        if (host.includes('gmail.com') && !this.configService.get('MAIL_PORT')) {
            transportOptions.service = 'gmail';
        }

        this.transporter = nodemailer.createTransport(transportOptions);
    }

    async onModuleInit() {
        if (!this.configService.get('MAIL_USER') || !this.configService.get('MAIL_PASS')) {
            this.logger.error('CRITICAL: SMTP credentials missing (MAIL_USER/MAIL_PASS).');
            return;
        }

        try {
            await this.transporter.verify();
            this.logger.log('SMTP connection verified successfully.');
        } catch (error) {
            this.logger.error('SMTP verification failed. Check App Password or Port settings.', error.message);
        }
    }

    async sendOtp(email: string, otp: string) {
        const mailOptions = {
            from: `"JusticeTrack" <${this.configService.get('MAIL_FROM', this.configService.get('MAIL_USER'))}>`,
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
                </div>
            `,
        };

        let attempts = 0;
        const maxRetries = 3;

        while (attempts < maxRetries) {
            try {
                attempts++;
                await this.transporter.sendMail(mailOptions);
                this.logger.log(`OTP sent to ${email} (Attempt ${attempts} successful)`);
                return;
            } catch (error) {
                this.logger.warn(`Email fail (Attempt ${attempts}/${maxRetries}): ${error.message}`);
                if (attempts >= maxRetries) throw error;
                await new Promise(resolve => setTimeout(resolve, 3000)); // 3s wait between retries
            }
        }
    }
}
