import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsString } from "class-validator";

export class CreateEventDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsString()
  description?: string;

  @ApiProperty()
  @IsDateString()
  date!: Date;

  @ApiProperty({ required: false })
  @IsString()
  location?: string;

  @ApiProperty({ required: false })
  @IsNumber()
  maxCapacity?: number;

  @ApiProperty({ required: false })
  @IsString()
  organizedBy?: string;
}
