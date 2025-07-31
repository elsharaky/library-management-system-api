import { Body, Controller, DefaultValuePipe, Get, HttpCode, Param, ParseDatePipe, ParseEnumPipe, Patch, Post, Query, StreamableFile } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiExtraModels, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { BorrowDto } from './dto/borrow.dto';
import { CheckoutBorrowDto } from './dto/checkout-borrow.dto';
import { CustomParsePositiveIntPipe } from 'src/common/pipes/parse-positive-int.pipe';
import { CustomParseDatePipe } from 'src/common/pipes/parse-date.pipe';
import { Readable } from 'stream';
import { ExportFormat } from 'src/common/enums/export-format.enum';
import { CustomParseExportFormatEnumPipe } from 'src/common/pipes/parse-export-format-enum.pipe';

@Controller('borrow')
@ApiExtraModels(BorrowDto)
export class BorrowController {
    constructor(
        private readonly borrowService: BorrowService,
    ){}

    @ApiOperation({
        summary: 'Borrow a book',
        description: 'This endpoint allows a user to borrow a book from the library.'
    })
    @ApiCreatedResponse({
        description: 'The book has been successfully borrowed.',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Book borrowed successfully' },
                data: { $ref: getSchemaPath(BorrowDto) },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid data provided.',
    })
    @Post()
    @HttpCode(201)
    async borrow(@Body() borrowDto: CheckoutBorrowDto) {
        const borrow = await this.borrowService.borrow(borrowDto);
        
        return {
            message: 'Book borrowed successfully',
            data: borrow,
        };
    }

    @ApiOperation({
        summary: 'Get all borrows',
        description: 'This endpoint retrieves all borrow records from the library system.'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number for pagination',
        type: Number,
        example: 1,
        default: 1,
    })
    @ApiQuery({
        name: 'pageSize',
        required: false,
        description: 'Number of borrows per page',
        type: Number,
        example: 10,
        default: 10,
    })
    @ApiOkResponse({
        description: 'Borrows retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Borrows retrieved successfully' },
                data: {
                    type: 'object',
                    properties: {
                        borrows: {
                            type: 'array',
                            items: { $ref: getSchemaPath(BorrowDto) },
                        },
                        total: { type: 'number', example: 100 },
                        page: { type: 'number', example: 1 },
                        pageSize: { type: 'number', example: 10 },
                    },
                },
            },
        },
    })
    @Get()
    async findAll(
        @Query('page', new CustomParsePositiveIntPipe('page')) page: number = 1,
        @Query('pageSize', new CustomParsePositiveIntPipe('pageSize')) pageSize: number = 10,
    ) {
        const borrows = await this.borrowService.findAll(page, pageSize);

        return {
            message: 'Borrows retrieved successfully',
            data: borrows,
        };
    }

    @ApiOperation({
        summary: 'Export all borrows by period',
        description: 'This endpoint exports all borrow records to a CSV or Xlsx file with optional period filtering.'
    })
    @ApiQuery({
        name: 'format',
        required: false,
        description: 'Format of the export file (csv or xlsx)',
        enum: ExportFormat,
        example: ExportFormat.CSV,
        default: ExportFormat.CSV,
    })
    @ApiQuery({
        name: 'startDate',
        required: false,
        description: 'Start date for filtering borrows (YYYY-MM-DD)',
        type: String,
        example: '2023-01-01',
    })
    @ApiQuery({
        name: 'endDate',
        required: false,
        description: 'End date for filtering borrows (YYYY-MM-DD)',
        type: String,
        example: '2023-12-31',
    })
    @ApiBadRequestResponse({
        description: 'Invalid date format or file format provided.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while generating the export file.',
    })
    @Get('export')
    async exportAll(
        @Query('format', new CustomParseExportFormatEnumPipe('format')) format: ExportFormat,
        @Query('startDate', new CustomParseDatePipe('startDate')) startDate?: Date,
        @Query('endDate', new CustomParseDatePipe('endDate')) endDate?: Date,
    ) {
        const buffer = await this.borrowService.exportBorrowsByPeriod(format, startDate, endDate);

        return new StreamableFile(new Uint8Array(buffer), {
            type: this.getMimeType(format),
            disposition: `attachment; filename=borrows.${format}`,
        });
    }

    @ApiOperation({
        summary: 'Export all borrows in the last month',
        description: 'This endpoint exports all borrow records to a CSV or Xlsx file in the last month.'
    })
    @ApiQuery({
        name: 'format',
        required: false,
        description: 'Format of the export file (csv or xlsx)',
        enum: ExportFormat,
        example: ExportFormat.CSV,
        default: ExportFormat.CSV,
    })
    @ApiBadRequestResponse({
        description: 'Invalid file format provided.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while generating the export file.',
    })
    @Get('export/last-month')
    async exportAllInLastMonth(
        @Query('format', new CustomParseExportFormatEnumPipe('format')) format: ExportFormat,
    ) {
        const buffer = await this.borrowService.exportBorrowsInLastMonth(format);

        return new StreamableFile(new Uint8Array(buffer), {
            type: this.getMimeType(format),
            disposition: `attachment; filename=borrows.${format}`,
        });
    }

    @ApiOperation({
        summary: 'Export all overdue borrows',
        description: 'This endpoint exports all overdue borrow records to a CSV or Xlsx file.'
    })
    @ApiQuery({
        name: 'format',
        required: false,
        description: 'Format of the export file (csv or xlsx)',
        enum: ExportFormat,
        example: ExportFormat.CSV,
        default: ExportFormat.CSV,
    })
    @ApiBadRequestResponse({
        description: 'Invalid file format provided.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while generating the export file.',
    })
    @Get('export/overdue')
    async exportAllOverdue(
        @Query('format', new CustomParseExportFormatEnumPipe('format')) format: ExportFormat,
    ) {
        const buffer = await this.borrowService.exportBorrowsOverdue(format);

        return new StreamableFile(new Uint8Array(buffer), {
            type: this.getMimeType(format),
            disposition: `attachment; filename=borrows.${format}`,
        });
    }

    @ApiOperation({
        summary: 'Get all borrows by borrower ID',
        description: 'This endpoint retrieves all borrow records for a specific borrower.'
    })
    @ApiParam({
        name: 'borrowerId',
        required: true,
        description: 'ID of the borrower to filter borrows',
        type: Number,
        example: 1,
    })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number for pagination',
        type: Number,
        example: 1,
        default: 1,
    })
    @ApiQuery({
        name: 'pageSize',
        required: false,
        description: 'Number of borrows per page',
        type: Number,
        example: 10,
        default: 10,
    })
    @ApiOkResponse({
        description: 'Borrows retrieved successfully for the specified borrower',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Borrows retrieved successfully for the specified borrower' },
                data: {
                    type: 'object',
                    properties: {
                        borrows: {
                            type: 'array',
                            items: { $ref: getSchemaPath(BorrowDto) },
                        },
                        total: { type: 'number', example: 100 },
                        page: { type: 'number', example: 1 },
                        pageSize: { type: 'number', example: 10 },
                    },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid borrower ID.',
    })
    @ApiNotFoundResponse({
        description: 'Borrower not found.',
    })
    @Get('borrower/:borrowerId')
    async findAllByBorrowerId(
        @Param('borrowerId', new CustomParsePositiveIntPipe('borrowerId')) borrowerId: number,
        @Query('page', new CustomParsePositiveIntPipe('page')) page: number = 1,
        @Query('pageSize', new CustomParsePositiveIntPipe('pageSize')) pageSize: number = 10,
    ) {
        const borrows = await this.borrowService.findAllByBorrowerId(borrowerId, page, pageSize);

        return {
            message: 'Borrows retrieved successfully for the specified borrower',
            data: borrows,
        };
    }

    @ApiOperation({
        summary: 'Get all overdue borrows',
        description: 'This endpoint retrieves all borrow records that are overdue.'
    })
    @ApiQuery({
        name: 'page',
        required: false,
        description: 'Page number for pagination',
        type: Number,
        example: 1,
        default: 1,
    })
    @ApiQuery({
        name: 'pageSize',
        required: false,
        description: 'Number of borrows per page',
        type: Number,
        example: 10,
        default: 10,
    })
    @ApiOkResponse({
        description: 'Overdue borrows retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Overdue borrows retrieved successfully' },
                data: {
                    type: 'object',
                    properties: {
                        borrows: {
                            type: 'array',
                            items: { $ref: getSchemaPath(BorrowDto) },
                        },
                        total: { type: 'number', example: 100 },
                        page: { type: 'number', example: 1 },
                        pageSize: { type: 'number', example: 10 },
                    },
                },
            },
        },
    })
    @Get('overdue')
    async findAllOverdue(
        @Query('page', new CustomParsePositiveIntPipe('page')) page: number = 1,
        @Query('pageSize', new CustomParsePositiveIntPipe('pageSize')) pageSize: number = 10,
    ) {
        const overdueBorrows = await this.borrowService.findAllOverdue(page, pageSize);

        return {
            message: 'Overdue borrows retrieved successfully',
            data: overdueBorrows,
        };
    }

    @ApiOperation({
        summary: 'Return a borrowed book',
        description: 'This endpoint allows a user to return a borrowed book to the library.'
    })
    @ApiParam({
        name: 'borrowId',
        required: true,
        description: 'ID of the borrow record to return',
        type: Number,
        example: 1,
    })
    @ApiOkResponse({
        description: 'The book has been successfully returned.',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Book returned successfully' },
                data: { $ref: getSchemaPath(BorrowDto) },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid data provided.',
    })
    @Patch(':borrowId/return')
    async returnBook(@Param('borrowId', new CustomParsePositiveIntPipe('borrowId')) borrowId: number) {
        const borrow = await this.borrowService.returnBook(borrowId);
        
        return {
            message: 'Book returned successfully',
            data: borrow,
        };
    }

    private getMimeType(format: ExportFormat): string {
    return format === ExportFormat.XLSX
      ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      : 'text/csv';
  }
}