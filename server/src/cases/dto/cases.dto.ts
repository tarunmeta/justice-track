import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUrl, IsArray } from 'class-validator';
import { CaseCategory } from '@prisma/client';

export class CreateCaseDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsEnum(CaseCategory)
    category: CaseCategory;

    @IsString()
    @IsNotEmpty()
    location: string;

    @IsString()
    @IsNotEmpty()
    referenceNumber: string;

    @IsOptional()
    @IsUrl()
    sourceUrl?: string;

    @IsOptional()
    @IsString()
    groundStatus?: string;

    @IsOptional()
    @IsString()
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
