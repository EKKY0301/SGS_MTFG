import { ApiProperty } from '@nestjs/swagger';
import { PaginationDataDto } from '../../shared/dto/pagination-data.dto';
import { ReturnPaginationDataDto } from '../../shared/dto/return-pagination.dto';

export class ReturnInListInstitutionalRecordDTO {
  @ApiProperty({ type: Array })
  items!: any[];

  @ApiProperty()
  paginationData!: ReturnPaginationDataDto;
}
