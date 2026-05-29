import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { EventAttendancesService } from './event-attendances.service';
import { CreateEventAttendanceDto } from './dto/create-event-attendance.dto';
import { UpdateEventAttendanceDto } from './dto/update-event-attendance.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';

@UseGuards(JwtCookieAuthGuard)
@Controller('event-attendances')
export class EventAttendancesController {
  constructor(private readonly eventAttendancesService: EventAttendancesService) {}

  @Post()
  create(@Body() createEventAttendanceDto: CreateEventAttendanceDto) {
    return this.eventAttendancesService.create(createEventAttendanceDto);
  }

  @Post('list')
  findAllByBody(@Body() query: ListRequestDto) {
    return this.eventAttendancesService.findAll(query);
  }

  @Post('find-one')
  findOneByBody(@Body() body: { id: string }) {
    return this.eventAttendancesService.findOne(body.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventAttendancesService.findByEventId(id);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.eventAttendancesService.search(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventAttendanceDto: UpdateEventAttendanceDto) {
    return this.eventAttendancesService.update(id, updateEventAttendanceDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.eventAttendancesService.delete(id);
  }
}
