import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class PaginationDto {
    @ApiProperty({
        description: 'Page number for pagination',
        type: Number,
        example: 1,
        default: 1,
        required: false,
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    page: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        type: Number,
        example: 10,
        default: 10,
        required: false,
    })
    @IsInt()
    @IsPositive()
    @IsOptional()
    @Type(() => Number)
    pageSize: number = 10;
}