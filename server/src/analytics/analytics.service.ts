import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
    constructor(private prisma: PrismaService) { }

    async getDashboard() {
        const [
            totalCases,
            totalUsers,
            pendingCases,
            resolvedCases,
            topSupported,
            byCategory,
            byLocation,
            recentCases,
        ] = await Promise.all([
            this.prisma.case.count(),
            this.prisma.user.count(),
            this.prisma.case.count({ where: { status: 'PENDING_REVIEW' } }),
            this.prisma.case.count({ where: { status: 'RESOLVED' } }),
            this.prisma.case.findMany({
                orderBy: { supportCount: 'desc' },
                take: 5,
                select: { id: true, title: true, supportCount: true, opposeCount: true, category: true },
            }),
            this.prisma.case.groupBy({
                by: ['category'],
                _count: { category: true },
            }),
            this.prisma.case.groupBy({
                by: ['location'],
                _count: { location: true },
                orderBy: { _count: { location: 'desc' } },
                take: 10,
            }),
            this.prisma.case.findMany({
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: { id: true, title: true, status: true, createdAt: true, category: true },
            }),
        ]);

        const resolutionRate = totalCases > 0 ? ((resolvedCases / totalCases) * 100).toFixed(1) : '0';

        return {
            overview: { totalCases, totalUsers, pendingCases, resolvedCases, resolutionRate: `${resolutionRate}%` },
            topSupported,
            byCategory: byCategory.map((c) => ({ category: c.category, count: c._count.category })),
            byLocation: byLocation.map((l) => ({ location: l.location, count: l._count.location })),
            recentCases,
        };
    }
}
