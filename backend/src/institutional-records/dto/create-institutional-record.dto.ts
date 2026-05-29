import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateInstitutionalRecordDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  type!: string; // "acta", "acuerdo", "resolucion", "asamblea"

  @ApiProperty()
  @IsDateString()
  recordDate!: Date;

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
}
