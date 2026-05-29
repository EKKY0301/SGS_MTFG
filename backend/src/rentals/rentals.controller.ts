import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseGuards } from '@nestjs/common';
import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { ListRequestDto } from '../shared/dto/query-list.dto';
import { SearchListDto } from '../shared/dto/search-list.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import type { Request } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('rentals')
export class RentalsController {
  constructor(private readonly rentalsService: RentalsService) {}

  @Post()
  create(@Req() req: Request, @Body() createRentalDto: CreateRentalDto) {
    return this.rentalsService.create(createRentalDto, (req as any).user.userId);
  }

  @Get()
  findAll() {
    return this.rentalsService.findAll({});
  }

  @Post('list')
  findAllByBody(@Body() query: ListRequestDto) {
    return this.rentalsService.findAll(query);
  }

  @Post('find-one')
  findOneByBody(@Body() body: { id: string }) {
    return this.rentalsService.findOne(body.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rentalsService.findOne(id);
  }

  @Post('search')
  search(@Body() body: SearchListDto) {
    return this.rentalsService.search(body);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateRentalDto: UpdateRentalDto) {
    return this.rentalsService.update(id, updateRentalDto, (req as any).user.userId);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id') id: string) {
    return this.rentalsService.delete(id, (req as any).user.userId);
  }
}
