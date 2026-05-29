import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { InstitutionalRecordsService } from './institutional-records.service';
import { CreateInstitutionalRecordDto } from './dto/create-institutional-record.dto';
import { UpdateInstitutionalRecordDto } from './dto/update-institutional-record.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('institutional-records')
export class InstitutionalRecordsController {
  constructor(private readonly institutionalRecordsService: InstitutionalRecordsService) {}

  @Post()
  create(@Req() req: Request, @Body() createInstitutionalRecordDto: CreateInstitutionalRecordDto) {
    return this.institutionalRecordsService.create(createInstitutionalRecordDto, (req as any).user.userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadPdf(@Req() req: Request, @Body() createInstitutionalRecordDto: CreateInstitutionalRecordDto, @UploadedFile() file: any) {
    return this.institutionalRecordsService.createWithPdf(createInstitutionalRecordDto, file, (req as any).user.userId);
  }

  @Get()
  findAll() {
    return this.institutionalRecordsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.institutionalRecordsService.findOne(id);
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { absolutePath, fileName } = await this.institutionalRecordsService.getDownloadInfo(id);
    return res.download(absolutePath, fileName);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.institutionalRecordsService.search(body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateInstitutionalRecordDto: UpdateInstitutionalRecordDto) {
    return this.institutionalRecordsService.update(id, updateInstitutionalRecordDto, (req as any).user.userId);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.institutionalRecordsService.remove(id, (req as any).user.userId);
  }
}
