import { OmitType } from "@nestjs/swagger";
import { BorrowerDto } from "./borrower.dto";

export class RegisterBorrowerDto extends OmitType(BorrowerDto, ['id', 'registeredDate', 'createdAt', 'updatedAt']) {}