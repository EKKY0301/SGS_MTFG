import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Post()
  create(@Req() req: Request, @Body() createGroupDto: CreateGroupDto) {
    return this.groupsService.create(createGroupDto, (req as any).user.userId);
  }

  @Get()
  findAll() {
    return this.groupsService.findAll();
  }

  @Post('list')
  findAllByBody() {
    return this.groupsService.findAll();
  }

  @Post('find-one')
  findOneByBody(@Body() body: { id: string }) {
    return this.groupsService.findOne(body.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.groupsService.search(body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateGroupDto: UpdateGroupDto) {
    return this.groupsService.update(id, updateGroupDto, (req as any).user.userId);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id') id: string) {
    return this.groupsService.delete(id, (req as any).user.userId);
  }
}
