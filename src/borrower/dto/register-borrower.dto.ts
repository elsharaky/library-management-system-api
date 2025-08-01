import { ApiProperty, OmitType } from "@nestjs/swagger";
import { BorrowerDto } from "./borrower.dto";
import { IsNotEmpty, IsString, Matches, MinLength } from "class-validator";

export class RegisterBorrowerDto extends OmitType(BorrowerDto, ['id', 'registeredDate', 'createdAt', 'updatedAt']) {
    @ApiProperty({
        description: 'Password for the borrower',
        example: 'StrongP@ssw0rd',
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).*$/, {
        message: 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character',
    })
    password: string;
}