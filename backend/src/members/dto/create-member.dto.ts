import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsBoolean,
  IsEmail,
  IsNumber,
  IsUUID,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRelatedInlineMemberDto {
  // Roles
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  memberNumber?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  // Datos personales (espanol)
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  surname!: string;

  // Datos japoneses
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  japaneseName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  japaneseSurname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  // Documento de identidad
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  documentExpDate?: string;

  // Estado migratorio
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  visaStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryOrigin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  // Datos laborales
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workPhone?: string;

  // Fallecimiento (opcional)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  deathDate?: string;

  // Relacion de pareja (cambia si se independiza)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  partnerId?: string;

  // Relacion administrativa (cambia si se independiza)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  adminParentId?: string;

  // Relacion biologica (NO cambia nunca)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  biologicalMotherId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  biologicalFatherId?: string;

  // Datos de dependencia familiar
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dependencyStart?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  responsible?: boolean;

  // Datos de grupo asignado
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @IsBoolean()
  @IsOptional()
  deleted?: boolean;
}

export class CreateMemberDto {
  // Roles
  @ApiProperty()
  @IsString()
  role!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  memberNumber?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  status?: string;

  // Datos personales (espanol)
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  surname!: string;

  // Datos japoneses
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  japaneseName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  japaneseSurname?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sex?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  // Documento de identidad
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  documentNumber?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  documentExpDate?: string;

  // Estado migratorio
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  visaStatus?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  countryOrigin?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  ruc?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  address?: string;

  // Datos laborales
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  workPhone?: string;

  // Fallecimiento (opcional)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  deathDate?: string;

  // Relacion de pareja (cambia si se independiza)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  partnerId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRelatedInlineMemberDto)
  partner?: CreateRelatedInlineMemberDto | null;

  // Relacion administrativa (cambia si se independiza)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  adminParentId?: string;

  // Relacion biologica (NO cambia nunca)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  biologicalMotherId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  biologicalFatherId?: string;

  // Relacion biologica (helpers de creacion)
  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRelatedInlineMemberDto)
  father?: CreateRelatedInlineMemberDto | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateRelatedInlineMemberDto)
  mother?: CreateRelatedInlineMemberDto | null;

  @ApiProperty({ required: false, type: [CreateRelatedInlineMemberDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRelatedInlineMemberDto)
  children?: CreateRelatedInlineMemberDto[];

  // Datos de dependencia familiar
  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dependencyStart?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  responsible?: boolean;

  // Datos de grupo asignado
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  groupId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  joinDate?: string;

  @IsBoolean()
  @IsOptional()
  deleted?: boolean;
}
