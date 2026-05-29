import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Req() req: Request, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto, (req as any).user.userId);
  }

  @Get()
  findAll() {
    return this.usersService.findAll({});
  }

  @Post('list')
  findAllByBody(@Body() query: ListRequestDto) {
    return this.usersService.findAll(query);
  }

  @Post('find-one')
  findOneByBody(@Body() body: { id: string }) {
    return this.usersService.findOne(body.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.usersService.search(body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto, (req as any).user.userId);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id') id: string) {
    return this.usersService.delete(id, (req as any).user.userId);
  }
}
