import { Event } from "@prisma/client";
import { ReturnPaginationDataDto } from "../../shared/dto/return-pagination.dto";


export class ReturnEventDTO {
    id!: string;
    name!: string;
    description!: string;
    date!: Date;
    location!: string;
    maxCapacity!: number;
    organizedBy!: string;
    attendances!: number;
}

export class ReturnInListEventDTO {
    paginationData!: ReturnPaginationDataDto;
    items!: ReturnEventDTO[];
}