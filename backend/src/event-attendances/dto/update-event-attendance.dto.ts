import { IsOptional, IsString } from 'class-validator';

export class UpdateEventAttendanceDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
