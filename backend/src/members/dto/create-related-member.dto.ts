import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsIn } from 'class-validator';
import { CreateRelatedInlineMemberDto } from './create-member.dto';

export class CreateRelatedMemberDto extends CreateRelatedInlineMemberDto {
  @ApiProperty({
    description: "Relationship type",
    enum: ['child', 'partner', 'dependent-father', 'dependent-mother'],
  })
  @IsString()
  @IsIn(['child', 'partner', 'dependent-father', 'dependent-mother'])
  relation!: string;

}
