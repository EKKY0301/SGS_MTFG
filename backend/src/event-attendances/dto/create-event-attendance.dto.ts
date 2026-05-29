import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateEventAttendanceDto {
  @ApiProperty({ description: "ID del evento al que se asiste" })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ description: "ID del miembro que asiste" })
  @IsString()
  @IsNotEmpty()
  memberId!: string;

  @ApiPropertyOptional({ description: "Estado de la asistencia (por ejemplo, 'asistió', 'falta', 'justificada')" })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: "Notas adicionales sobre la asistencia" })
  @IsOptional()
  @IsString()
  notes?: string;
}
