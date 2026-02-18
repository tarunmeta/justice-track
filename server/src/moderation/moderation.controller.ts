import { Controller, Post, Get, Param, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ModerationService } from './moderation.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('moderation')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MODERATOR')
export class ModerationController {
    constructor(private moderationService: ModerationService) { }

    @Get('logs')
    getLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.moderationService.getLogs(page, limit);
    }

    @Post('cases/:id/approve')
    approveCase(@Param('id') id: string, @Req() req: any) {
        return this.moderationService.approveCase(id, req.user.sub);
    }

    @Post('cases/:id/reject')
    rejectCase(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
        return this.moderationService.rejectCase(id, req.user.sub, reason);
    }

    @Post('cases/:id/flag')
    flagCase(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
        return this.moderationService.flagCase(id, req.user.sub, reason);
    }

    @Post('users/:id/suspend')
    suspendUser(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
        return this.moderationService.suspendUser(id, req.user.sub, reason);
    }

    @Post('users/:id/ban')
    @Roles('ADMIN')
    banUser(@Param('id') id: string, @Body('reason') reason: string, @Req() req: any) {
        return this.moderationService.banUser(id, req.user.sub, reason);
    }

    @Post('users/:id/unsuspend')
    unsuspendUser(@Param('id') id: string, @Req() req: any) {
        return this.moderationService.unsuspendUser(id, req.user.sub);
    }
}
