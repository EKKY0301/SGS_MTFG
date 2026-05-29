import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MembersModule } from './members/members.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GroupsModule } from './groups/groups.module';
import { EventsModule } from './events/events.module';
import { EventAttendancesModule } from './event-attendances/event-attendances.module';
import { ResourcesModule } from './resources/resources.module';
import { RentalsModule } from './rentals/rentals.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { RolesModule } from './roles/roles.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InstitutionalRecordsModule } from './institutional-records/institutional-records.module';
import { RegulationsModule } from './regulations/regulations.module';

@Module({
  imports: [
    MembersModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    GroupsModule,
    EventsModule,
    EventAttendancesModule,
    ResourcesModule,
    RentalsModule,
    AnnouncementsModule,
    RolesModule,
    AuditLogsModule,
    DashboardModule,
    InstitutionalRecordsModule,
    RegulationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
