import { Body, Controller, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiExtraModels, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { BorrowDto } from './dto/borrow.dto';
import { CheckoutBorrowDto } from './dto/checkout-borrow.dto';
import { ParsePositiveIntPipe } from 'src/common/pipes/parse-positive-int.pipe';

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
        @Query('page', new ParsePositiveIntPipe('page')) page: number = 1,
        @Query('pageSize', new ParsePositiveIntPipe('pageSize')) pageSize: number = 10,
    ) {
        const borrows = await this.borrowService.findAll(page, pageSize);

        return {
            message: 'Borrows retrieved successfully',
            data: borrows,
        };
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
        @Param('borrowerId', new ParsePositiveIntPipe('borrowerId')) borrowerId: number,
        @Query('page', new ParsePositiveIntPipe('page')) page: number = 1,
        @Query('pageSize', new ParsePositiveIntPipe('pageSize')) pageSize: number = 10,
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
        @Query('page', new ParsePositiveIntPipe('page')) page: number = 1,
        @Query('pageSize', new ParsePositiveIntPipe('pageSize')) pageSize: number = 10,
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
    async returnBook(@Param('borrowId', new ParsePositiveIntPipe('borrowId')) borrowId: number) {
        const borrow = await this.borrowService.returnBook(borrowId);
        
        return {
            message: 'Book returned successfully',
            data: borrow,
        };
    }
}