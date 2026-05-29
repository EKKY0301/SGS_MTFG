import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { PaginationDataDto } from './pagination-data.dto';

export class SearchListFiltersDto {
  @ApiPropertyOptional({ description: 'Texto libre de búsqueda', example: 'tanaka' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtro básico opcional', example: 'active' })
  @IsOptional()
  @IsString()
  filter?: string;

  @ApiPropertyOptional({ description: 'Fecha desde en formato ISO', example: '2026-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  from?: string;

  @ApiPropertyOptional({ description: 'Fecha hasta en formato ISO', example: '2026-01-31T23:59:59.999Z' })
  @IsOptional()
  @IsString()
  to?: string;
}

export class SearchListDto {
  @ApiProperty({ type: () => PaginationDataDto })
  @ValidateNested()
  @Type(() => PaginationDataDto)
  paginationData!: PaginationDataDto;

  @ApiPropertyOptional({ type: () => SearchListFiltersDto })
  @ValidateNested()
  @Type(() => SearchListFiltersDto)
  @IsOptional()
  filters?: SearchListFiltersDto;
}
