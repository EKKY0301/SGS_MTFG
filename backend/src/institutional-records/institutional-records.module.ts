import { Module } from '@nestjs/common';
import { InstitutionalRecordsService } from './institutional-records.service';
import { InstitutionalRecordsController } from './institutional-records.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [InstitutionalRecordsController],
  providers: [InstitutionalRecordsService],
})
export class InstitutionalRecordsModule {}
