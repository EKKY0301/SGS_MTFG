import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Res, UseGuards } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import type { Response, Request } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Req() req: Request, @Body() createEventDto: CreateEventDto) {
    return this.eventsService.create(createEventDto, (req as any).user.userId);
  }

  @Get()
  findAll() {
    return this.eventsService.findAll();
  }

  @Post('list')
  findAllByBody(@Body() dto: SearchListDto) {
    return this.eventsService.search(dto);
  }

  @Post('find-one')
  findOneByBody(@Body() body: { id: string }) {
    return this.eventsService.findOne(body.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.eventsService.search(body);
  }

  @Post('export-pdf')
  async exportPdf(@Body() body: SearchListDto, @Res() res: Response) {
    const { buffer, fileName } = await this.eventsService.exportSearchAsPdf(body);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }

  @Get(':id/export-pdf')
  async exportEventDetailPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, fileName } = await this.eventsService.exportEventDetailAsPdf(id);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
    return this.eventsService.update(id, updateEventDto, (req as any).user.userId);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id') id: string) {
    return this.eventsService.delete(id, (req as any).user.userId);
  }
}
