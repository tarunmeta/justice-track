import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUrl, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { CaseCategory } from '@prisma/client';

export class CreateCaseDto {
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    @MaxLength(150)
    @Transform(({ value }) => value?.trim())
    title: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(20)
    @MaxLength(10000)
    @Transform(({ value }) => value?.trim())
    description: string;

    @IsEnum(CaseCategory)
    category: CaseCategory;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    @Transform(({ value }) => value?.trim())
    location: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(50)
    @Transform(({ value }) => value?.trim())
    referenceNumber: string;

    @IsOptional()
    @IsUrl()
    @MaxLength(500)
    sourceUrl?: string;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    @Transform(({ value }) => value?.trim())
    groundStatus?: string;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    mainImage?: string;
}

export class UpdateCaseStatusDto {
    @IsString()
    @IsNotEmpty()
    status: string;

    @IsOptional()
    @IsString()
    reason?: string;
}
