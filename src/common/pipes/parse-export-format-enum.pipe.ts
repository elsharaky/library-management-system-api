import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { ExportFormat } from "../enums/export-format.enum";

@Injectable()
export class CustomParseExportFormatEnumPipe implements PipeTransform<ExportFormat, ExportFormat> {
    constructor(private readonly field: string) {}

    transform(value: ExportFormat): ExportFormat {
        if (!Object.values(ExportFormat).includes(value)) {
            throw new BadRequestException(`Invalid value for ${this.field}. It must be one of: ${Object.values(ExportFormat).join(', ')}`);
        }

        return value;
    }
}
