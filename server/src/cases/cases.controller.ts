import {
    Controller, Get, Post, Patch, Param, Body, Query,
    UseGuards, Req, UseInterceptors, UploadedFiles, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
} from '@nestjs/common';
import { FilesInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';
import { extname } from 'path';
import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseStatusDto } from './dto/cases.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

const storage = diskStorage({
    destination: './uploads/documents',
    filename: (_, file, cb) => {
        const name = uuid() + extname(file.originalname);
        cb(null, name);
    },
});

@Controller('cases')
export class CasesController {
    constructor(private casesService: CasesService) { }

    // Public endpoints
    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('category') category?: string,
        @Query('location') location?: string,
        @Query('search') search?: string,
    ) {
        return this.casesService.findAll({ page, limit, category, location, search });
    }

    @Get('trending')
    getTrending(@Query('limit') limit?: number) {
        return this.casesService.getTrending(limit);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.casesService.findById(id);
    }

    // Protected endpoints
    @Post()
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'mainImage', maxCount: 1 },
        { name: 'documents', maxCount: 5 },
    ], { storage }))
    create(
        @Body() dto: CreateCaseDto,
        @Req() req: any,
        @UploadedFiles() files?: { mainImage?: Express.Multer.File[], documents?: Express.Multer.File[] },
    ) {
        // Manual validation since ParseFilePipe can be tricky with FileFieldsInterceptor
        if (files?.mainImage?.[0]) {
            const file = files.mainImage[0];
            if (file.size > 5 * 1024 * 1024) throw new Error('Main image too large');
            if (!file.mimetype.match(/\/(jpg|jpeg|png)$/)) throw new Error('Invalid image type');
        }

        if (files?.documents) {
            files.documents.forEach(file => {
                if (file.size > 5 * 1024 * 1024) throw new Error('Document too large');
                if (!file.mimetype.match(/\/(jpg|jpeg|png|pdf)$/)) throw new Error('Invalid document type');
            });
        }

        const mainImagePath = files?.mainImage?.[0] ? `/uploads/documents/${files.mainImage[0].filename}` : undefined;
        const documentPaths = files?.documents?.map((f) => `/uploads/documents/${f.filename}`) || [];

        dto.mainImage = mainImagePath;
        return this.casesService.create(dto, req.user.sub, documentPaths);
    }

    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    updateStatus(
        @Param('id') id: string,
        @Body() dto: UpdateCaseStatusDto,
        @Req() req: any,
    ) {
        return this.casesService.updateStatus(id, dto.status as any, req.user.sub, dto.reason);
    }

    @Post(':id/updates')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    addUpdate(
        @Param('id') id: string,
        @Body('text') text: string,
        @Body('type') type: string,
        @Req() req: any,
    ) {
        return this.casesService.addUpdate(id, text, type, req.user.sub);
    }

    @Post(':id/lawyer-comments')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('LAWYER')
    addLawyerComment(
        @Param('id') id: string,
        @Body('explanation') explanation: string,
        @Req() req: any,
    ) {
        return this.casesService.addLawyerComment(id, explanation, req.user.sub);
    }

    // Moderation list
    @Get('moderation/all')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    findAllForModeration(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.casesService.findAllForModeration(page, limit);
    }
}
