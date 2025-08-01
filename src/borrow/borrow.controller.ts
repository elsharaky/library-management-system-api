import { Body, ClassSerializerInterceptor, Controller, DefaultValuePipe, Get, HttpCode, Param, ParseDatePipe, ParseEnumPipe, Patch, Post, Query, StreamableFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { ApiBadRequestResponse, ApiBasicAuth, ApiCreatedResponse, ApiExtraModels, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { BorrowDto } from './dto/borrow.dto';
import { CheckoutBorrowDto } from './dto/checkout-borrow.dto';
import { ParsePositiveIntPipe } from 'src/common/pipes/parse-positive-int.pipe';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ExportBorrowsWithPeriodDto } from './dto/export-borrows-with-period.dto';
import { ExportBorrowsDto, ExportFormat } from './dto/export-borrows.dto';
import { FindAllBorrowsByBorrowerDto } from './dto/find-borrows-by-borrower.dto';
import { BasicAuthGuard } from 'src/auth/basic-auth.gaurd';

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
    @ApiNotFoundResponse({
        description: 'Book or borrower not found.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while borrowing the book.',
    })
    @ApiBasicAuth('basic-auth')
    @Post()
    @HttpCode(201)
    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(BasicAuthGuard)
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
    @ApiBadRequestResponse({
        description: 'Invalid pagination parameters provided.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while retrieving the borrows.',
    })
    @ApiBasicAuth('basic-auth')
    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(BasicAuthGuard)
    async findAll(
        @Query() pagination: PaginationDto,
    ) {
        const borrows = await this.borrowService.findAll(pagination.page, pagination.pageSize);

        return {
            message: 'Borrows retrieved successfully',
            data: borrows,
        };
    }

    @ApiOperation({
        summary: 'Export all borrows by period',
        description: 'This endpoint exports all borrow records to a CSV or Xlsx file with optional period filtering.'
    })
    @ApiOkResponse({
        description: 'Borrows exported successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid date format or file format provided.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while generating the export file.',
    })
    @ApiBasicAuth('basic-auth')
    @Get('export')
    @UseGuards(BasicAuthGuard)
    async exportAll(
        @Query() exportWithPeriodQuery: ExportBorrowsWithPeriodDto,
    ) {
        const buffer = await this.borrowService.exportBorrowsByPeriod(exportWithPeriodQuery.format, exportWithPeriodQuery.startDate, exportWithPeriodQuery.endDate);

        return new StreamableFile(new Uint8Array(buffer), {
            type: this.getMimeType(exportWithPeriodQuery.format),
            disposition: `attachment; filename=borrows.${exportWithPeriodQuery.format}`,
        });
    }

    @ApiOperation({
        summary: 'Export all borrows in the last month',
        description: 'This endpoint exports all borrow records to a CSV or Xlsx file in the last month.'
    })
    @ApiOkResponse({
        description: 'Borrows exported successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid file format provided.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while generating the export file.',
    })
    @ApiBasicAuth('basic-auth')
    @Get('export/last-month')
    @UseGuards(BasicAuthGuard)
    async exportAllInLastMonth(
        @Query() exportQuery: ExportBorrowsDto,
    ) {
        const buffer = await this.borrowService.exportBorrowsInLastMonth(exportQuery.format);

        return new StreamableFile(new Uint8Array(buffer), {
            type: this.getMimeType(exportQuery.format),
            disposition: `attachment; filename=borrows.${exportQuery.format}`,
        });
    }

    @ApiOperation({
        summary: 'Export all overdue borrows',
        description: 'This endpoint exports all overdue borrow records to a CSV or Xlsx file.'
    })
    @ApiOkResponse({
        description: 'Overdue borrows exported successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid file format provided.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while generating the export file.',
    })
    @ApiBasicAuth('basic-auth')
    @Get('export/overdue')
    @UseGuards(BasicAuthGuard)
    async exportAllOverdue(
        @Query() exportQuery: ExportBorrowsDto,
    ) {
        const buffer = await this.borrowService.exportBorrowsOverdue(exportQuery.format);

        return new StreamableFile(new Uint8Array(buffer), {
            type: this.getMimeType(exportQuery.format),
            disposition: `attachment; filename=borrows.${exportQuery.format}`,
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
        description: 'Invalid borrower ID or pagination parameters provided.',
    })
    @ApiNotFoundResponse({
        description: 'Borrower not found.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while retrieving the borrows for the specified borrower.',
    })
    @ApiBasicAuth('basic-auth')
    @Get('borrower/:borrowerId')
    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(BasicAuthGuard)
    async findAllByBorrowerId(
        @Query() findAllByBorrowerDto: FindAllBorrowsByBorrowerDto,
    ) {
        const borrows = await this.borrowService.findAllByBorrowerId(findAllByBorrowerDto.borrowerId, findAllByBorrowerDto.page, findAllByBorrowerDto.pageSize);

        return {
            message: 'Borrows retrieved successfully for the specified borrower',
            data: borrows,
        };
    }

    @ApiOperation({
        summary: 'Get all overdue borrows',
        description: 'This endpoint retrieves all borrow records that are overdue.'
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
    @ApiBadRequestResponse({
        description: 'Invalid pagination parameters provided.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while retrieving the overdue borrows.',
    })
    @ApiBasicAuth('basic-auth')
    @Get('overdue')
    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(BasicAuthGuard)
    async findAllOverdue(
        @Query() pagination: PaginationDto,
    ) {
        const overdueBorrows = await this.borrowService.findAllOverdue(pagination.page, pagination.pageSize);

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
        description: 'Invalid borrow ID provided.',
    })
    @ApiNotFoundResponse({
        description: 'Borrow not found.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while returning the book.',
    })
    @ApiBasicAuth('basic-auth')
    @Patch(':borrowId/return')
    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(BasicAuthGuard)
    async returnBook(@Param('borrowId', new ParsePositiveIntPipe('borrowId')) borrowId: number) {
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