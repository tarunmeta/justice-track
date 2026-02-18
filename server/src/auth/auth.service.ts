import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing) throw new ConflictException('Email already registered');

        const passwordHash = await bcrypt.hash(dto.password, 12);
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        const user = await this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                passwordHash,
                otpCode,
                otpExpiresAt,
                otpAttempts: 0,
            },
        });

        // In production, send OTP via email. For dev, return it.
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[DEV] OTP for ${dto.email}: ${otpCode}`);
        }

        return {
            message: 'Registration successful. Please verify your email with the OTP sent.',
            userId: user.id,
            // DEV ONLY: remove in production
            devOtp: process.env.NODE_ENV !== 'production' ? otpCode : undefined,
        };
    }

    async verifyOtp(dto: VerifyOtpDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new BadRequestException('User not found');

        if (user.status === 'VERIFIED') return { message: 'Already verified' };
        if (!user.otpCode || !user.otpExpiresAt) throw new BadRequestException('No OTP pending');

        if (user.otpAttempts >= 5) {
            throw new BadRequestException('Too many failed attempts. Please request a new OTP.');
        }

        if (new Date() > user.otpExpiresAt) throw new BadRequestException('OTP expired');

        if (user.otpCode !== dto.otp) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { otpAttempts: { increment: 1 } },
            });
            throw new BadRequestException(`Invalid OTP. ${5 - (user.otpAttempts + 1)} attempts remaining.`);
        }

        await this.prisma.user.update({
            where: { id: user.id },
            data: { status: 'VERIFIED', otpCode: null, otpExpiresAt: null, otpAttempts: 0 },
        });

        return { message: 'Email verified successfully' };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        // Check for account lockout
        if (user.lockoutUntil && new Date() < user.lockoutUntil) {
            const minutesLeft = Math.ceil((user.lockoutUntil.getTime() - Date.now()) / 60000);
            throw new UnauthorizedException(`Account is locked. Please try again in ${minutesLeft} minutes.`);
        }

        const valid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!valid) {
            const newAttempts = user.failedLoginAttempts + 1;
            const lockoutUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;

            await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    failedLoginAttempts: newAttempts,
                    lockoutUntil,
                },
            });

            if (lockoutUntil) {
                throw new UnauthorizedException('Too many failed attempts. Account locked for 15 minutes.');
            }
            throw new UnauthorizedException(`Invalid credentials. ${5 - newAttempts} attempts remaining.`);
        }

        if (user.status === 'PENDING') throw new UnauthorizedException('Please verify your email first');
        if (user.status === 'SUSPENDED' || user.status === 'BANNED')
            throw new UnauthorizedException('Account has been suspended');

        const tokens = await this.generateTokens(user.id, user.email, user.role);

        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken: await bcrypt.hash(tokens.refreshToken, 10),
                failedLoginAttempts: 0,
                lockoutUntil: null,
            },
        });

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
            },
        };
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || !user.refreshToken) throw new UnauthorizedException('Access denied');

        const valid = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!valid) throw new UnauthorizedException('Access denied');

        const tokens = await this.generateTokens(user.id, user.email, user.role);

        await this.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: await bcrypt.hash(tokens.refreshToken, 10) },
        });

        return tokens;
    }

    async logout(userId: string) {
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null },
        });
        return { message: 'Logged out' };
    }

    private async generateTokens(userId: string, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_SECRET,
                expiresIn: process.env.JWT_EXPIRY || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: process.env.JWT_REFRESH_SECRET,
                expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d',
            }),
        ]);

        return { accessToken, refreshToken };
    }
}
