import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Length, Matches, Min } from "class-validator";

export class BookDto {
    @ApiProperty({
        description: 'Unique identifier of the book',
        example: 1,
    })
    @IsInt()
    @IsNotEmpty()
    id: number;

    @ApiProperty({
        description: 'Title of the book',
        example: 'The Great Gatsby',
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 255)
    @Matches(/^[a-zA-Z0-9\s]+$/, {
        message: 'Title must not contain special characters',
    })
    title: string;

    @ApiProperty({
        description: 'Author of the book',
        example: 'F. Scott Fitzgerald',
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 255)
    @Matches(/^[a-zA-Z\s\.]+$/, {
        message: 'Author must not contain special characters',
    })
    author: string;

    @ApiProperty({
        description: 'ISBN number (must be unique)',
        example: '978-3-16-148410-0',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^(97(8|9))?\-?\d{1,5}\-?\d{1,7}\-?\d{1,7}\-?(\d|X)$/, {
        message: 'ISBN must be a valid ISBN-10 or ISBN-13 number',
    })
    isbn: string;

    @ApiProperty({
        description: 'Available quantity of this book',
        example: 5,
    })
    @IsInt()
    @Min(0)
    availableQuantity: number;

    @ApiProperty({
        description: 'Shelf location of the book in the library',
        example: 'Aisle 3, Shelf B',
    })
    @IsString()
    @Length(3, 255)
    @Matches(/^[a-zA-Z0-9\s,]+$/, {
        message: 'Shelf location must not contain special characters',
    })
    shelfLocation: string;

    @ApiProperty({
        description: 'Creation date of the book record',
        example: '2023-10-01T12:00:00Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update date of the book record',
        example: '2023-10-01T12:00:00Z',
    })
    updatedAt: Date;
}