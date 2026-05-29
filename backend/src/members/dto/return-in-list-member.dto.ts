import { RrturnGroupDTO } from "../../groups/dto/return-group.dto";
import { ReturnPaginationDataDto } from "../../shared/dto/return-pagination.dto";

export class ReturnInListMemberDto {
    id!: string;
    name!: string;
    surname!: string;
    japaneseName!: string;
    japaneseSurname!: string;
    memberNumber!: number;
    birthDate!: Date;
    group!: RrturnGroupDTO | null;
}

export class ReturnInListMembersDto {
    paginationData!: ReturnPaginationDataDto;
    items!: ReturnInListMemberDto[];
}