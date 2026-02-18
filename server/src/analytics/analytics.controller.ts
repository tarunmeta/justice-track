import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'MODERATOR')
export class AnalyticsController {
    constructor(private analyticsService: AnalyticsService) { }

    @Get('dashboard')
    getDashboard() {
        return this.analyticsService.getDashboard();
    }
}
