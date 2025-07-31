import { BadRequestException, Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Patch, Post, Query } from '@nestjs/common';
import { BookService } from './book.service';
import { CreateBookDto } from './dto/create-book.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiExtraModels, ApiNoContentResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, getSchemaPath } from '@nestjs/swagger';
import { UpdateBookDto } from './dto/update-book.dto';
import { BookDto } from './dto/book.dto';
import { CustomParsePositiveIntPipe } from 'src/common/pipes/parse-positive-int.pipe';
import { SearchBookDto } from './dto/search-book.dto';

@Controller('book')
@ApiExtraModels(BookDto)
export class BookController {
    constructor(
        private readonly bookService: BookService,
    ){}

    @ApiOperation({
        summary: 'Create a new book',
        description: 'This endpoint allows you to create a new book in the library system.'
    })
    @ApiCreatedResponse({
        description: 'The book has been successfully created.',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Book created successfully' },
                data: { $ref: getSchemaPath(BookDto) },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid data provided.',
    })
    @Post()
    @HttpCode(201)
    async create(@Body() createBookDto: CreateBookDto) {
        const book = await this.bookService.create(createBookDto);
        return {
            message: 'Book created successfully',
            data: book,
        }
    }

    @ApiOperation({
        summary: 'Get all books',
        description: 'This endpoint retrieves all books from the library system.'
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
        description: 'Number of books per page',
        type: Number,
        example: 10,
        default: 10,
    })
    @ApiOkResponse({
        description: 'Books retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Books retrieved successfully' },
                data: {
                    type: 'object',
                    properties: {
                        books: { type: 'array', items: { $ref: getSchemaPath(BookDto) } },
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
        const books = await this.bookService.findAll(page, pageSize);

        return {
            message: 'Books retrieved successfully',
            data: books,
        }
    }

    @ApiOperation({
        summary: 'Search for books',
        description: 'This endpoint allows you to search for books by title, author, or ISBN.'
    })
    @ApiOkResponse({
        description: 'Books matching the search query retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Books matching the search query retrieved successfully' },
                data: {
                    type: 'array',
                    items: { $ref: getSchemaPath(BookDto) },
                },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid search query provided.',
    })
    @Get('search')
    async search(
        @Query() query: SearchBookDto,
    ) {
        const books = await this.bookService.search(query);

        return {
            message: 'Books matching the search query retrieved successfully',
            data: books,
        };
    }

    @ApiOperation({
        summary: 'Get a book by ID',
        description: 'This endpoint retrieves a book by its ID from the library system.'
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'The ID of the book to retrieve',
        type: Number,
        example: 1,
    })
    @ApiOkResponse({
        description: 'Book retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Book retrieved successfully' },
                data: { $ref: getSchemaPath(BookDto) },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid ID provided.',
    })
    @Get(':id')
    async findOne(@Param('id', new CustomParsePositiveIntPipe('id')) id: number) {
        const book = await this.bookService.findOne(id);

        return {
            message: 'Book retrieved successfully',
            data: book,
        };
    }

    @ApiOperation({
        summary: 'Update a book',
        description: 'This endpoint allows you to update an existing book in the library system.'
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'The ID of the book to update',
        type: Number,
        example: 1,
    })
    @ApiOkResponse({
        description: 'Book updated successfully',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Book updated successfully' },
                data: { $ref: getSchemaPath(BookDto) },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Invalid data provided or book not found.',
    })
    @Patch(':id')
    @HttpCode(200)
    async update(@Param('id', new CustomParsePositiveIntPipe('id')) id: number, @Body() updateBookDto: UpdateBookDto) {
        const book = await this.bookService.update(id, updateBookDto);
        
        return {
            message: 'Book updated successfully',
            data: book,
        };
    }

    @ApiOperation({
        summary: 'Delete a book',
        description: 'This endpoint allows you to delete a book from the library system.'
    })
    @ApiParam({
        name: 'id',
        required: true,
        description: 'The ID of the book to delete',
        type: Number,
        example: 1,
    })
    @ApiNoContentResponse({
        description: 'Book deleted successfully',
    })
    @ApiBadRequestResponse({
        description: 'Invalid ID provided or book not found.',
    })
    @Delete(':id')
    @HttpCode(204)
    async remove(@Param('id', new CustomParsePositiveIntPipe('id')) id: number) {
        await this.bookService.remove(id);
        
        return {
            message: 'Book deleted successfully',
        };
    }
}

