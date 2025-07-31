import { PartialType } from "@nestjs/swagger";
import { RegisterBorrowerDto } from "./register-borrower.dto";

export class UpdateBorrowerDto extends PartialType(RegisterBorrowerDto) {}