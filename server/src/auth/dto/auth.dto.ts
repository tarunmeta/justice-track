import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    name: string;

    @IsEmail()
    @MaxLength(100)
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString()
    @MinLength(8)
    @MaxLength(100)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
        message: 'Password is too weak. Must contain uppercase, lowercase, and a number or special character.',
    })
    password: string;
}

export class LoginDto {
    @IsEmail()
    @MaxLength(100)
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    password: string;
}

export class VerifyOtpDto {
    @IsEmail()
    @MaxLength(100)
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(10)
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
    @Transform(({ value }) => value?.toLowerCase().trim())
    email: string;
}
