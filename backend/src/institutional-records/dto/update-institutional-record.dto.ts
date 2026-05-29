import { PartialType } from '@nestjs/swagger';
import { CreateInstitutionalRecordDto } from './create-institutional-record.dto';

export class UpdateInstitutionalRecordDto extends PartialType(CreateInstitutionalRecordDto) {}
