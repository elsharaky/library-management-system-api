import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class SearchBookDto {
    @ApiProperty ({
        description: 'Search query for books by title',
        example: 'Harry Potter',
        required: false,
    })
    @IsOptional()
    @IsString()
    title?: string;

    @ApiProperty ({
        description: 'Search query for books by author',
        example: 'J.K. Rowling',
        required: false,
    })
    @IsOptional()
    @IsString()
    author?: string;

    @ApiProperty ({
        description: 'Search query for books by ISBN',
        example: '978-3-16-148410-0',
        required: false,
    })
    @IsOptional()
    @IsString()
    isbn?: string;

    @ApiProperty({
        description: 'Page number for pagination',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    page?: number;

    @ApiProperty({
        description: 'Number of books per page',
        example: 10,
        required: false,
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    @Type(() => Number)
    pageSize?: number;
}