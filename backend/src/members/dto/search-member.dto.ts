import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, IsBoolean, IsUUID } from 'class-validator';
import { ValidateNested } from 'class-validator';
import { PaginationDataDto } from '../../shared/dto/pagination-data.dto';

export class SearchMembersFiltersDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  role?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  documentNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  status?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  deceased?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hasJapaneseName?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  adminParentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  birthDateFrom?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  birthDateTo?: string;

  @ApiPropertyOptional({
    description: 'Si es true, devuelve solo miembros no principales que cumplen 18 este anio',
  })
  @IsOptional()
  @IsBoolean()
  nonPrincipalTurning18ThisYear?: boolean;

  @ApiPropertyOptional({
    description: 'Si es true, devuelve solo miembros no principales que tienen 70 anios o mas',
  })
  @IsOptional()
  @IsBoolean()
  isSeventyOrMore?: boolean;
}

export class SearchMembersDto {
  @ApiProperty({ type: () => PaginationDataDto })
  @ValidateNested()
  @Type(() => PaginationDataDto)
  paginationData!: PaginationDataDto;

  @ApiProperty({ type: () => SearchMembersFiltersDto })
  @ValidateNested()
  @Type(() => SearchMembersFiltersDto)
  filters!: SearchMembersFiltersDto;
}
