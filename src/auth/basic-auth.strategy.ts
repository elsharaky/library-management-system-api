import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { BasicStrategy as Strategy } from "passport-http";
import { BorrowerService } from "src/borrower/borrower.service";
import * as bcrypt from 'bcrypt';
import { Borrower } from "src/borrower/entities/borrower.entity";

@Injectable()
export class BasicAuthStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly borrowerService: BorrowerService) {
        super();
    }

    async validate(username: string, password: string) {
        let borrower: Borrower;
        try {
            borrower = await this.borrowerService.findByEmail(username);
            if (!borrower) {
                return null; // Borrower not found
            }
        } catch (error) {
            return null; // Handle error, e.g., borrower not found
        }

        const isPasswordValid = await bcrypt.compare(password, borrower.password);
        if (!isPasswordValid) {
            return null; // Invalid password
        }

        return borrower; // Return the borrower if validation is successful
    }
}