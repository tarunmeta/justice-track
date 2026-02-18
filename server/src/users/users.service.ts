import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Role, AccountStatus } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true, name: true, email: true, role: true,
                    status: true, createdAt: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);
        return { users, total, page, totalPages: Math.ceil(total / limit) };
    }

    async findById(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true, name: true, email: true, role: true,
                status: true, createdAt: true, verificationDocuments: true,
            },
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async getProfile(userId: string) {
        return this.findById(userId);
    }

    async updateRole(userId: string, role: Role) {
        await this.findById(userId);
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: { id: true, name: true, email: true, role: true, status: true },
        });
    }

    async updateStatus(userId: string, status: AccountStatus) {
        await this.findById(userId);
        return this.prisma.user.update({
            where: { id: userId },
            data: { status },
            select: { id: true, name: true, email: true, role: true, status: true },
        });
    }

    async getUserStats() {
        const [total, verified, pending, suspended] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.user.count({ where: { status: 'VERIFIED' } }),
            this.prisma.user.count({ where: { status: 'PENDING' } }),
            this.prisma.user.count({ where: { status: 'SUSPENDED' } }),
        ]);
        const byRole = await this.prisma.user.groupBy({
            by: ['role'],
            _count: { role: true },
        });
        return { total, verified, pending, suspended, byRole };
    }
}
