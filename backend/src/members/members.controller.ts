import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from '@nestjs/common';
import { MembersService } from './members.service';
import { CreateMemberDto, CreateRelatedInlineMemberDto } from './dto/create-member.dto';
import { SearchMembersDto } from './dto/search-member.dto';
import { CreateRelatedMemberDto } from './dto/create-related-member.dto';
import { GenerateYearPaymentsDto } from './dto/generate-year-payments.dto';
import { JwtCookieAuthGuard } from '../auth/guard/jwt-cookie-auth.guard';
import type { Response, Request } from 'express';

@UseGuards(JwtCookieAuthGuard)
@Controller('members')
export class MembersController {
  constructor(
    readonly membersService: MembersService,
  ) {}

  @Post()
  create(@Req() req: Request, @Body() createMemberDto: CreateMemberDto) {
    return this.membersService.create(createMemberDto, (req as any).user.userId);
  }

  @Post('list')
  search(@Body() searchDto: SearchMembersDto) {
    return this.membersService.search(searchDto);
  }

  @Post('export-pdf')
  async exportPdf(@Body() searchDto: SearchMembersDto, @Res() res: Response) {
    const { buffer, fileName } = await this.membersService.exportSearchAsPdf(searchDto);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Length', buffer.length.toString());
    res.send(buffer);
  }

  @Post('payments/generate-year')
  generateYearPayments(@Body() dto: GenerateYearPaymentsDto) {
    return this.membersService.generateYearPaymentsForResponsibleMembers(dto);
  }

  @Post(':id/related')
  createRelated(@Req() req: Request, @Param('id') id: string, @Body() dto: CreateRelatedMemberDto) {
    return this.membersService.createRelated(dto, id, (req as any).user.userId);
  }

  @Post(':id/children')
  addChildren(@Req() req: Request, @Param('id') id: string, @Body() dto: { children: CreateRelatedInlineMemberDto[] }) {
    return this.membersService.addChildren(dto.children, id, (req as any).user.userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  update(@Req() req: Request, @Param('id') id: string, @Body() updateMemberDto: Partial<CreateMemberDto>) {
    return this.membersService.update(id, updateMemberDto, (req as any).user.userId);
  }

  @Patch(':id/deceased')
  markAsDeceased(@Req() req: Request, @Param('id') id: string, @Body() body: { deathDate: string }) {
    return this.membersService.deseaced(id, body.deathDate, (req as any).user.userId);
  }

  @Delete(':id')
  delete(@Req() req: Request, @Param('id') id: string) {
    return this.membersService.delete(id, (req as any).user.userId);
  }
}
