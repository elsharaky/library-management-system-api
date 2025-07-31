import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsEmail, IsNotEmpty, IsString, Matches } from "class-validator";

export class BorrowerDto {
    @ApiProperty({
        description: 'Unique identifier of the borrower',
        example: 1,
    })
    id: number;

    @ApiProperty({
        description: 'Name of the borrower',
        example: 'Alice Johnson',
    })
    @IsString()
    @IsNotEmpty()
    @Matches(/^[a-zA-Z0-9\s,]+$/, {
        message: 'Name must not contain special characters',
    })
    name: string;

    @ApiProperty({
        description: 'Email of the borrower',
        example: 'alice@example.com',
    })
    @IsEmail()
    @IsString()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Date the borrower registered',
        example: '2025-07-31T12:00:00Z',
    })
    registeredDate: Date;

    @ApiProperty({
        description: 'Creation date of the borrower record',
        example: '2025-07-31T12:00:00Z',
    })
    createdAt?: Date;

    @ApiProperty({
        description: 'Last update date of the borrower record',
        example: '2025-07-31T12:00:00Z',
    })
    updatedAt?: Date;
}