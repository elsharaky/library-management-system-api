import { OmitType } from "@nestjs/swagger";
import { BorrowDto } from "./borrow.dto";

export class CheckoutBorrowDto extends OmitType(BorrowDto, ['id', 'returnedDate', 'createdAt', 'updatedAt']) {}