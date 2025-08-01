import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNotEmpty, IsPositive } from "class-validator";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class FindAllBorrowsByBorrowerDto extends PaginationDto{
    @ApiProperty({
        description: 'The ID of the borrower whose borrows are to be retrieved',
        type: Number,
        example: 1,
    })
    @IsNotEmpty()
    @IsPositive()
    @Type(() => Number)
    borrowerId: number;
}