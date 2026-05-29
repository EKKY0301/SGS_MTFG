import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  create(@Req() req: Request, @Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto, (req as any).user.userId);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll({});
  }

  @Post('list')
  findAllByBody(@Body() query: ListRequestDto) {
    return this.rolesService.findAll(query);
  }

  @Post('find-one')
  findOneByBody(@Body() body: { id: string }) {
    return this.rolesService.findOne(body.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.rolesService.search(body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto, (req as any).user.userId);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id') id: string) {
    return this.rolesService.delete(id, (req as any).user.userId);
  }
}
