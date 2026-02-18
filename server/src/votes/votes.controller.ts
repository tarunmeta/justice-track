import { Controller, Post, Delete, Get, Param, Body, UseGuards, Req } from '@nestjs/common';
import { VotesService } from './votes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { VoteType } from '@prisma/client';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
    constructor(private votesService: VotesService) { }

    @Post(':caseId')
    vote(
        @Param('caseId') caseId: string,
        @Body('voteType') voteType: VoteType,
        @Req() req: any,
    ) {
        return this.votesService.vote(req.user.sub, caseId, voteType);
    }

    @Delete(':caseId')
    removeVote(@Param('caseId') caseId: string, @Req() req: any) {
        return this.votesService.removeVote(req.user.sub, caseId);
    }

    @Get(':caseId')
    getUserVote(@Param('caseId') caseId: string, @Req() req: any) {
        return this.votesService.getUserVote(req.user.sub, caseId);
    }
}
