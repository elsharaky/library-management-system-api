import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParsePositiveIntPipe implements PipeTransform<number, number> {
    constructor(private readonly field: string) {}
    
    transform(value: number): number {
        if ((value !== undefined && isNaN(value)) || value <= 0) {
            throw new BadRequestException(`Invalid value for ${this.field}. It must be a positive integer.`);
        }

        return value;
    }
}