import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDataDto } from './pagination-data.dto';

export class ListRequestDto extends PaginationDataDto {
  @ApiPropertyOptional({ description: 'Texto libre de búsqueda', example: 'tanaka' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filtro básico opcional', example: 'active' })
  @IsOptional()
  @IsString()
  filter?: string;
}
