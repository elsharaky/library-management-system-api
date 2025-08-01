import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsOptional } from "class-validator";

export enum ExportFormat {
    CSV = 'csv',
    XLSX = 'xlsx',
}

export class ExportBorrowsDto {
    @ApiProperty({
        description: 'The format in which to export the borrow records',
        enum: ExportFormat,
        example: ExportFormat.CSV,
    })
    @IsEnum(ExportFormat)
    format: ExportFormat;
}