import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { BorrowerService } from './borrower.service';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiExtraModels, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { BorrowerDto } from './dto/borrower.dto';
import { RegisterBorrowerDto } from './dto/register-borrower.dto';
import { CustomParsePositiveIntPipe } from 'src/common/pipes/parse-positive-int.pipe';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';

@Controller('borrower')
@ApiExtraModels(BorrowerDto)
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
        description: 'Number of borrowers per page',
        type: Number,
        example: 10,
        default: 10,
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
    @Get()
    async findAll(
        @Query('page', new CustomParsePositiveIntPipe('page')) page: number = 1,
        @Query('pageSize', new CustomParsePositiveIntPipe('pageSize')) pageSize: number = 10,
    ) {
        const borrowers = await this.borrowerService.findAll(page, pageSize);
        
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
        description: 'Invalid borrower ID provided.',
    })
    @Get(':id')
    async findOne(@Param('id', new CustomParsePositiveIntPipe('id')) id: number) {
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
        description: 'Invalid data provided or borrower not found.',
    })
    @Patch(':id')
    @HttpCode(200)
    async update(@Param('id', new CustomParsePositiveIntPipe('id')) id: number, @Body() updateBorrowerDto: UpdateBorrowerDto) {
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
        description: 'Invalid ID provided or borrower not found.',
    })
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id', new CustomParsePositiveIntPipe('id')) id: number) {
        await this.borrowerService.remove(id);
        
        return {
            message: 'Borrower deleted successfully',
        };
    }
}