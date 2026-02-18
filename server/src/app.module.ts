import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CasesModule } from './cases/cases.module';
import { VotesModule } from './votes/votes.module';
import { ModerationModule } from './moderation/moderation.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { MailModule } from './mail/mail.module';

@Module({
    imports: [
        ThrottlerModule.forRoot([
            {
                name: 'short',
                ttl: 1000,
                limit: 3,
            },
            {
                name: 'long',
                ttl: 60000,
                limit: 100,
            },
        ]),
        PrismaModule,
        AuthModule,
        UsersModule,
        CasesModule,
        VotesModule,
        ModerationModule,
        AnalyticsModule,
        MailModule,
    ],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },
    ],
})
export class AppModule { }
