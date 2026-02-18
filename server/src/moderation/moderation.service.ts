import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ModerationAction } from '@prisma/client';

@Injectable()
export class ModerationService {
    constructor(private prisma: PrismaService) { }

    async logAction(action: ModerationAction, performedById: string, targetId: string, reason?: string) {
        return this.prisma.moderationLog.create({
            data: { actionType: action, performedById, targetId, reason },
        });
    }

    async getLogs(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            this.prisma.moderationLog.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { performedBy: { select: { id: true, name: true, role: true } } },
            }),
            this.prisma.moderationLog.count(),
        ]);
        return { logs, total, page, totalPages: Math.ceil(total / limit) };
    }

    async approveCase(caseId: string, moderatorId: string) {
        await this.prisma.case.update({
            where: { id: caseId },
            data: { status: 'VERIFIED', verifiedById: moderatorId },
        });
        await this.prisma.caseUpdate.create({
            data: {
                caseId,
                updateText: 'Case verified and approved by moderator',
                updateType: 'VERIFICATION',
                createdById: moderatorId,
            },
        });
        await this.logAction('APPROVE_CASE', moderatorId, caseId);
        return { message: 'Case approved' };
    }

    async rejectCase(caseId: string, moderatorId: string, reason: string) {
        await this.prisma.case.update({ where: { id: caseId }, data: { status: 'REJECTED' } });
        await this.prisma.caseUpdate.create({
            data: {
                caseId,
                updateText: `Case rejected: ${reason}`,
                updateType: 'REVIEW',
                createdById: moderatorId,
            },
        });
        await this.logAction('REJECT_CASE', moderatorId, caseId, reason);
        return { message: 'Case rejected' };
    }

    async flagCase(caseId: string, moderatorId: string, reason: string) {
        await this.prisma.case.update({ where: { id: caseId }, data: { status: 'FLAGGED' } });
        await this.logAction('FLAG_CASE', moderatorId, caseId, reason);
        return { message: 'Case flagged' };
    }

    async suspendUser(userId: string, moderatorId: string, reason: string) {
        await this.prisma.user.update({ where: { id: userId }, data: { status: 'SUSPENDED' } });
        await this.logAction('SUSPEND_USER', moderatorId, userId, reason);
        return { message: 'User suspended' };
    }

    async banUser(userId: string, moderatorId: string, reason: string) {
        await this.prisma.user.update({ where: { id: userId }, data: { status: 'BANNED' } });
        await this.logAction('BAN_USER', moderatorId, userId, reason);
        return { message: 'User banned' };
    }

    async unsuspendUser(userId: string, moderatorId: string) {
        await this.prisma.user.update({ where: { id: userId }, data: { status: 'VERIFIED' } });
        await this.logAction('UNSUSPEND_USER', moderatorId, userId);
        return { message: 'User unsuspended' };
    }
}
