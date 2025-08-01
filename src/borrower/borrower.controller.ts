import { Body, ClassSerializerInterceptor, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { BorrowerService } from './borrower.service';
import { ApiBadRequestResponse, ApiBasicAuth, ApiCreatedResponse, ApiExtraModels, ApiInternalServerErrorResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { BorrowerDto } from './dto/borrower.dto';
import { RegisterBorrowerDto } from './dto/register-borrower.dto';
import { ParsePositiveIntPipe } from 'src/common/pipes/parse-positive-int.pipe';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { BasicAuthGuard } from 'src/auth/basic-auth.gaurd';

@Controller('borrower')
@ApiExtraModels(BorrowerDto)
@UseInterceptors(ClassSerializerInterceptor)
export class BorrowerController {
    constructor(
        private readonly borrowerService: BorrowerService,
    ) {}

    @ApiOperation({
        summary: 'Register a new borrower',
        description: 'This endpoint allows you to register a new borrower in the library system.'
    })
    @ApiCreatedResponse({
        description: 'The borrower has been successfully registered.',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Borrower registered successfully' },
                data: { $ref: getSchemaPath(BorrowerDto) },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid data provided.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while registering the borrower.',
    })
    @Post()
    @HttpCode(201)
    async register(@Body() createBorrowerDto: RegisterBorrowerDto) {
        const borrower = await this.borrowerService.register(createBorrowerDto);
        return {
            message: 'Borrower registered successfully',
            data: borrower,
        };
    }

    @ApiOperation({
        summary: 'Get all borrowers',
        description: 'This endpoint retrieves all borrowers from the library system.'
    })
    @ApiOkResponse({
        description: 'Borrowers retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Borrowers retrieved successfully' },
                data: {
                    type: 'object',
                    properties: {
                        borrowers: {
                            type: 'array',
                            items: { $ref: getSchemaPath(BorrowerDto) },
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
        description: 'An error occurred while retrieving the borrowers.',
    })
    @ApiBasicAuth('basic-auth')
    @Get()
    @UseGuards(BasicAuthGuard)
    async findAll(
        @Query() pagination: PaginationDto,
    ) {
        const borrowers = await this.borrowerService.findAll(pagination.page, pagination.pageSize);

        return {
            message: 'Borrowers retrieved successfully',
            data: borrowers,
        };
    }

    @ApiOperation({
        summary: 'Get borrower by ID',
        description: 'This endpoint retrieves a borrower by their ID.'
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'The ID of the borrower to retrieve',
        type: Number,
        example: 1,
    })
    @ApiOkResponse({
        description: 'Borrower retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Borrower retrieved successfully' },
                data: { $ref: getSchemaPath(BorrowerDto) },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid ID provided.',
    })
    @ApiNotFoundResponse({
        description: 'Borrower not found.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while retrieving the borrower.',
    })
    @ApiBasicAuth('basic-auth')
    @Get(':id')
    @UseGuards(BasicAuthGuard)
    async findOne(@Param('id', new ParsePositiveIntPipe('id')) id: number) {
        const borrower = await this.borrowerService.findOne(id);
        
        return {
            message: 'Borrower retrieved successfully',
            data: borrower,
        };
    }

    @ApiOperation({
        summary: 'Update borrower information',
        description: 'This endpoint allows you to update the information of an existing borrower.'
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'The ID of the borrower to update',
        type: Number,
        example: 1,
    })
    @ApiOkResponse({
        description: 'Borrower updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Borrower updated successfully' },
                data: { $ref: getSchemaPath(BorrowerDto) },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid data or ID provided.',
    })
    @ApiNotFoundResponse({
        description: 'Borrower not found.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while updating the borrower.',
    })
    @ApiBasicAuth('basic-auth')
    @Patch(':id')
    @HttpCode(200)
    @UseGuards(BasicAuthGuard)
    async update(@Param('id', new ParsePositiveIntPipe('id')) id: number, @Body() updateBorrowerDto: UpdateBorrowerDto) {
        const borrower = await this.borrowerService.update(id, updateBorrowerDto);
        
        return {
            message: 'Borrower updated successfully',
            data: borrower,
        };
    }

    @ApiOperation({
        summary: 'Delete a borrower',
        description: 'This endpoint allows you to delete a borrower from the library system.'
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'The ID of the borrower to delete',
        type: Number,
        example: 1,
    })
    @ApiNoContentResponse({
        description: 'Borrower deleted successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid ID provided.',
    })
    @ApiNotFoundResponse({
        description: 'Borrower not found.',
    })
    @ApiInternalServerErrorResponse({
        description: 'An error occurred while deleting the borrower.',
    })
    @ApiBasicAuth('basic-auth')
    @Delete(':id')
    @HttpCode(204)
    @UseGuards(BasicAuthGuard)
    async remove(@Param('id', new ParsePositiveIntPipe('id')) id: number) {
        await this.borrowerService.remove(id);
        
        return {
            message: 'Borrower deleted successfully',
        };
    }
}