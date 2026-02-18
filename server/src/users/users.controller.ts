import { Controller, Get, Patch, Param, Query, UseGuards, Req, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, AccountStatus } from '@prisma/client';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get('profile')
    getProfile(@Req() req: any) {
        return this.usersService.getProfile(req.user.sub);
    }

    @Get()
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.usersService.findAll(page, limit);
    }

    @Get('stats')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    getStats() {
        return this.usersService.getUserStats();
    }

    @Get(':id')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    findOne(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Patch(':id/role')
    @UseGuards(RolesGuard)
    @Roles('ADMIN')
    updateRole(@Param('id') id: string, @Body('role') role: Role) {
        return this.usersService.updateRole(id, role);
    }

    @Patch(':id/status')
    @UseGuards(RolesGuard)
    @Roles('ADMIN', 'MODERATOR')
    updateStatus(@Param('id') id: string, @Body('status') status: AccountStatus) {
        return this.usersService.updateStatus(id, status);
    }
}
