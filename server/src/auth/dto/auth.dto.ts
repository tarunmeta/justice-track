import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    password: string;
}

export class LoginDto {
    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
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

export class ResendOtpDto {
    @IsEmail()
    @MaxLength(100)
    email: string;
}
