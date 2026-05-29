import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class ReturnPaginationDataDto {
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number | null;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    currentPage?: number | null;

    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(10)
    itemsPerPage?: number | null;

    @Type(() => Number)
    @IsInt()
    totalItems?: number | null;

    @Type(() => Number)
    @IsInt()
    totalPages?: number | null;
}