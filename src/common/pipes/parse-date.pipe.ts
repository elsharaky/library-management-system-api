import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class CustomParseDatePipe implements PipeTransform<Date, Date> {
    constructor(private readonly field: string) {}
    
    transform(value: Date): Date {
        if (value === undefined || value === null) {
            return value;
        }

        const parsedDate = new Date(value);
        if (isNaN(parsedDate.getTime())) {
            throw new BadRequestException(`Invalid value for ${this.field}. It must be a valid date.`);
        }

        return parsedDate;
    }
}