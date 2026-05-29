import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards, UploadedFile, UseInterceptors, Res } from '@nestjs/common';
import { RegulationsService } from './regulations.service';
import { CreateRegulationDto } from './dto/create-regulation.dto';
import { UpdateRegulationDto } from './dto/update-regulation.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('regulations')
export class RegulationsController {
  constructor(private readonly regulationsService: RegulationsService) {}

  @Post()
  create(@Req() req: Request, @Body() createRegulationDto: CreateRegulationDto) {
    return this.regulationsService.create(createRegulationDto, (req as any).user.userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadPdf(@Req() req: Request, @Body() createRegulationDto: CreateRegulationDto, @UploadedFile() file: any) {
    return this.regulationsService.createWithPdf(createRegulationDto, file, (req as any).user.userId);
  }

  @Get()
  findAll() {
    return this.regulationsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.regulationsService.findOne(id);
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    const { absolutePath, fileName } = await this.regulationsService.getDownloadInfo(id);
    return res.download(absolutePath, fileName);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.regulationsService.search(body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateRegulationDto: UpdateRegulationDto) {
    return this.regulationsService.update(id, updateRegulationDto, (req as any).user.userId);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.regulationsService.remove(id, (req as any).user.userId);
  }
}
