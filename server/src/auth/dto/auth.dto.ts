import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
}

export class LoginDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class VerifyOtpDto {
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    otp: string;
}

export class RefreshTokenDto {
    @IsString()
    @IsNotEmpty()
    refreshToken: string;
}
