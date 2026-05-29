import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Res } from '@nestjs/common';
import { AuditLogsService } from './audit-logs.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import { UpdateAuditLogDto } from './dto/update-audit-log.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import type { Response } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('audit-logs')
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Post()
  create(@Body() createAuditLogDto: CreateAuditLogDto) {
    return this.auditLogsService.create(createAuditLogDto);
  }

  @Get()
  findAll() {
    return this.auditLogsService.findAll({});
  }

  @Post('list')
  findAllByBody(@Body() query: ListRequestDto) {
    return this.auditLogsService.findAll(query);
  }

  @Post('find-one')
  findOneByBody(@Body() body: { id: string }) {
    return this.auditLogsService.findOne(body.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.auditLogsService.findOne(id);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.auditLogsService.search(body);
  }

  @Post('export-pdf')
  async exportPdf(@Body() body: SearchListDto, @Res() res: Response) {
    const { buffer, fileName } = await this.auditLogsService.exportSearchAsPdf(body);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuditLogDto: UpdateAuditLogDto) {
    return this.auditLogsService.update(id, updateAuditLogDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.auditLogsService.delete(id);
  }
}
