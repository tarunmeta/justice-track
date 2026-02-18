import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCaseDto } from './dto/cases.dto';
import { CaseStatus, Prisma } from '@prisma/client';
import * as sanitizeHtml from 'sanitize-html';

@Injectable()
export class CasesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateCaseDto, userId: string, filePaths: string[] = []) {
        // Validate reference number format (FIR, Court Case, or URL must be present)
        if (!this.isValidReference(dto.referenceNumber) && !dto.sourceUrl) {
            throw new BadRequestException(
                'A valid FIR Number, Court Case Number, or verified News Source URL is required',
            );
        }

        // Basic AI moderation placeholder — check for abusive language
        if (this.containsAbusiveContent(dto.title) || this.containsAbusiveContent(dto.description)) {
            throw new BadRequestException('Content flagged for inappropriate language. Please revise.');
        }

        const caseRecord = await this.prisma.case.create({
            data: {
                title: this.sanitize(dto.title),
                description: this.sanitize(dto.description),
                category: dto.category,
                location: this.sanitize(dto.location),
                referenceNumber: dto.referenceNumber,
                sourceUrl: dto.sourceUrl || null,
                mainImage: dto.mainImage || null,
                groundStatus: dto.groundStatus || null,
                documents: filePaths,
                createdById: userId,
            },
        });

        // Create initial timeline entry
        await this.prisma.caseUpdate.create({
            data: {
                caseId: caseRecord.id,
                updateText: 'Case submitted and awaiting review',
                updateType: 'SUBMISSION',
                createdById: userId,
            },
        });

        return caseRecord;
    }

    async findAll(query: {
        page?: number; limit?: number; category?: string;
        location?: string; search?: string; status?: string;
    }) {
        const page = query.page || 1;
        const limit = Math.min(query.limit || 12, 50);
        const skip = (page - 1) * limit;

        const where: Prisma.CaseWhereInput = {};

        // Only show verified/approved cases to public
        if (!query.status) {
            where.status = { in: ['VERIFIED', 'UNDER_INVESTIGATION', 'COURT_HEARING', 'RESOLVED', 'CLOSED'] };
        } else {
            where.status = query.status as CaseStatus;
        }

        if (query.category) where.category = query.category as any;
        if (query.location) where.location = { contains: query.location, mode: 'insensitive' };
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
                { referenceNumber: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const [cases, total] = await Promise.all([
            this.prisma.case.findMany({
                where,
                skip,
                take: limit,
                orderBy: [{ supportCount: 'desc' }, { createdAt: 'desc' }],
                include: {
                    createdBy: { select: { id: true, name: true } },
                    _count: { select: { votes: true, updates: true, lawyerComments: true } },
                },
            }),
            this.prisma.case.count({ where }),
        ]);

        return { cases, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findAllForModeration(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [cases, total] = await Promise.all([
            this.prisma.case.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    createdBy: { select: { id: true, name: true, email: true } },
                },
            }),
            this.prisma.case.count(),
        ]);
        return { cases, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findById(id: string) {
        const caseRecord = await this.prisma.case.findUnique({
            where: { id },
            include: {
                createdBy: { select: { id: true, name: true } },
                verifiedBy: { select: { id: true, name: true } },
                updates: {
                    orderBy: { createdAt: 'asc' },
                    include: { createdBy: { select: { id: true, name: true, role: true } } },
                },
                lawyerComments: {
                    orderBy: { createdAt: 'desc' },
                    include: { lawyer: { select: { id: true, name: true } } },
                },
                _count: { select: { votes: true } },
            },
        });
        if (!caseRecord) throw new NotFoundException('Case not found');
        return caseRecord;
    }

    async updateStatus(caseId: string, status: CaseStatus, userId: string, reason?: string) {
        const caseRecord = await this.findById(caseId);

        const data: any = { status };
        if (status === 'VERIFIED') data.verifiedById = userId;

        await this.prisma.case.update({ where: { id: caseId }, data });

        await this.prisma.caseUpdate.create({
            data: {
                caseId,
                updateText: reason || `Status changed to ${status}`,
                updateType: 'STATUS_CHANGE',
                createdById: userId,
            },
        });

        return { message: `Case status updated to ${status}` };
    }

    async addUpdate(caseId: string, text: string, type: string, userId: string) {
        await this.findById(caseId);
        return this.prisma.caseUpdate.create({
            data: {
                caseId,
                updateText: this.sanitize(text),
                updateType: type as any,
                createdById: userId,
            },
        });
    }

    async addLawyerComment(caseId: string, explanation: string, lawyerId: string) {
        await this.findById(caseId);

        if (this.containsGuiltDeclaration(explanation)) {
            throw new BadRequestException('Lawyers cannot declare someone guilty. Please provide objective legal analysis.');
        }

        return this.prisma.lawyerComment.create({
            data: {
                caseId,
                explanation: this.sanitize(explanation),
                lawyerId,
            },
        });
    }

    async getTrending(limit = 10) {
        return this.prisma.case.findMany({
            where: { status: { in: ['VERIFIED', 'UNDER_INVESTIGATION', 'COURT_HEARING'] } },
            orderBy: [{ supportCount: 'desc' }, { createdAt: 'desc' }],
            take: limit,
            include: {
                createdBy: { select: { id: true, name: true } },
                _count: { select: { votes: true, lawyerComments: true } },
            },
        });
    }

    // -- Helpers --

    private isValidReference(ref: string): boolean {
        // FIR pattern: digits or alphanumeric with slashes/dashes
        const firPattern = /^[A-Za-z0-9\-\/]+$/;
        return ref.length >= 3 && firPattern.test(ref);
    }

    private sanitize(text: string): string {
        return sanitizeHtml(text, {
            allowedTags: [], // No HTML allowed
            allowedAttributes: {},
        }).trim();
    }

    private containsAbusiveContent(text: string): boolean {
        // Basic placeholder — in production, integrate a proper AI moderation API
        const flaggedWords = ['kill', 'threat', 'bomb'];
        const lower = text.toLowerCase();
        return flaggedWords.some((w) => lower.includes(w));
    }

    private containsGuiltDeclaration(text: string): boolean {
        const patterns = ['is guilty', 'declare guilty', 'found guilty', 'is the culprit'];
        const lower = text.toLowerCase();
        return patterns.some((p) => lower.includes(p));
    }
}
