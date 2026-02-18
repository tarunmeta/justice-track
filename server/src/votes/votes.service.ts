import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { VoteType } from '@prisma/client';

@Injectable()
export class VotesService {
    constructor(private prisma: PrismaService) { }

    async vote(userId: string, caseId: string, voteType: VoteType) {
        // Verify case exists and is public
        const caseRecord = await this.prisma.case.findUnique({ where: { id: caseId } });
        if (!caseRecord) throw new NotFoundException('Case not found');

        // Check existing vote
        const existing = await this.prisma.vote.findUnique({
            where: { userId_caseId: { userId, caseId } },
        });

        if (existing) {
            if (existing.voteType === voteType) {
                throw new ConflictException('You have already voted this way');
            }
            // Change vote
            await this.prisma.$transaction([
                this.prisma.vote.update({
                    where: { id: existing.id },
                    data: { voteType },
                }),
                this.prisma.case.update({
                    where: { id: caseId },
                    data: {
                        supportCount: { increment: voteType === 'SUPPORT' ? 1 : -1 },
                        opposeCount: { increment: voteType === 'OPPOSE' ? 1 : -1 },
                    },
                }),
            ]);
            return { message: 'Vote changed', voteType };
        }

        // New vote
        await this.prisma.$transaction([
            this.prisma.vote.create({ data: { userId, caseId, voteType } }),
            this.prisma.case.update({
                where: { id: caseId },
                data: {
                    supportCount: { increment: voteType === 'SUPPORT' ? 1 : 0 },
                    opposeCount: { increment: voteType === 'OPPOSE' ? 1 : 0 },
                },
            }),
        ]);

        return { message: 'Vote recorded', voteType };
    }

    async removeVote(userId: string, caseId: string) {
        const existing = await this.prisma.vote.findUnique({
            where: { userId_caseId: { userId, caseId } },
        });
        if (!existing) throw new NotFoundException('No vote found');

        await this.prisma.$transaction([
            this.prisma.vote.delete({ where: { id: existing.id } }),
            this.prisma.case.update({
                where: { id: caseId },
                data: {
                    supportCount: { decrement: existing.voteType === 'SUPPORT' ? 1 : 0 },
                    opposeCount: { decrement: existing.voteType === 'OPPOSE' ? 1 : 0 },
                },
            }),
        ]);

        return { message: 'Vote removed' };
    }

    async getUserVote(userId: string, caseId: string) {
        const vote = await this.prisma.vote.findUnique({
            where: { userId_caseId: { userId, caseId } },
        });
        return { vote: vote?.voteType || null };
    }
}
