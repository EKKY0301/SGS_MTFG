import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateRegulationDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  type!: string; // "estatuto", "reglamento", "politica", "norma"

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  version?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  filePath?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  fileName?: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  effectiveDate?: Date;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
