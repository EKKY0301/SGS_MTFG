import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { ResourcesService } from './resources.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('resources')
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post()
  create(@Req() req: Request, @Body() createResourceDto: CreateResourceDto) {
    return this.resourcesService.create(createResourceDto, (req as any).user.userId);
  }

  @Get()
  findAll() {
    return this.resourcesService.findAll({});
  }

  @Post('list')
  findAllByBody(@Body() query: ListRequestDto) {
    return this.resourcesService.findAll(query);
  }

  @Post('find-one')
  findOneByBody(@Body() body: { id: string }) {
    return this.resourcesService.findOne(body.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resourcesService.findOne(id);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.resourcesService.search(body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateResourceDto: UpdateResourceDto) {
    return this.resourcesService.update(id, updateResourceDto, (req as any).user.userId);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id') id: string) {
    return this.resourcesService.delete(id, (req as any).user.userId);
  }
}
