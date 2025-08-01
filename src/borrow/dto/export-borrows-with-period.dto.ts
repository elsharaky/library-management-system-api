import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsOptional } from "class-validator";
import { ExportBorrowsDto } from "./export-borrows.dto";

export class ExportBorrowsWithPeriodDto extends ExportBorrowsDto {
    @ApiProperty({
        description: 'The start date for filtering borrow records',
        type: Date,
        example: '2023-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: Date;

    @ApiProperty({
        description: 'The end date for filtering borrow records',
        type: Date,
        example: '2023-12-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: Date;
}