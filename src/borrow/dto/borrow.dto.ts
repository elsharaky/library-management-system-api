import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, Min } from "class-validator";

export class BorrowDto {
    @ApiProperty({
        description: 'Unique identifier for the borrow record',
        example: 1,
    })
    id: number;
    
    @ApiProperty({
        description: 'ID of the book being borrowed',
        example: 1,
    })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    bookId: number;

    @ApiProperty({
        description: 'ID of the borrower',
        example: 2,
    })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    borrowerId: number;

    @ApiProperty({
        description: 'Date when the book was borrowed',
        example: '2025-07-31',
    })
    @IsOptional()
    @IsDateString()
    borrowedDate?: Date;

    @ApiProperty({
        description: 'Due date for returning the book',
        example: '2025-08-15',
    })
    @IsDateString()
    @IsNotEmpty()
    dueDate: Date;

    @ApiProperty({
        description: 'Date when the book was returned',
        example: '2025-08-10',
    })
    returnedDate: Date;

    @ApiProperty({
        description: 'Creation date of the borrow record',
        example: '2025-07-31T12:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last updated date of the borrow record',
        example: '2025-08-01T12:00:00Z',
    })
    updatedAt: Date;
}