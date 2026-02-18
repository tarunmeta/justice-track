import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter: nodemailer.Transporter;
    private readonly logger = new Logger(MailService.name);

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.MAIL_PORT || '587'),
            secure: process.env.MAIL_SECURE === 'true', // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
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
                    <p>Thank you for joining our platform. Please use the following verification code to complete your registration:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #1e293b; background: #f1f5f9; padding: 10px 20px; border-radius: 5px;">${otp}</span>
                    </div>
                    <p>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #64748b; text-align: center;">&copy; 2024 JusticeTrack. All rights reserved.</p>
                </div>
            `,
        };

        try {
            await this.transporter.sendMail(mailOptions);
            this.logger.log(`OTP sent to ${email}`);
        } catch (error) {
            this.logger.error(`Failed to send OTP to ${email}`, error.stack);
            throw error;
        }
    }
}
