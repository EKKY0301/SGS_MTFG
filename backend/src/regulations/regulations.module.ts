import { Module } from '@nestjs/common';
import { RegulationsService } from './regulations.service';
import { RegulationsController } from './regulations.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [RegulationsController],
  providers: [RegulationsService],
})
export class RegulationsModule {}
