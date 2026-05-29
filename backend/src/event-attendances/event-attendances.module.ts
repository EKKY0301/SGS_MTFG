import { Module } from '@nestjs/common';
import { EventAttendancesService } from './event-attendances.service';
import { EventAttendancesController } from './event-attendances.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EventAttendancesController],
  providers: [EventAttendancesService],
})
export class EventAttendancesModule {}
