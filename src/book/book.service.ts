import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateBookDto } from './dto/update-book.dto';
import { SearchBookDto } from './dto/search-book.dto';

@Injectable()
export class BookService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
    ) {}

    async create(createBookDto: CreateBookDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Check if the book with the same ISBN already exists
            const existingBook = await queryRunner.manager.findOne(Book, {
                where: { isbn: createBookDto.isbn },
            });
            if (existingBook) {
                throw new BadRequestException(`A book with ISBN ${createBookDto.isbn} already exists.`);
            }
            
            // Create a new book entity
            const book = queryRunner.manager.create(Book, {
                ...createBookDto,
            });

            // Save the book entity to the database
            const savedBook = await queryRunner.manager.save(book);

            // Commit the transaction
            await queryRunner.commitTransaction();

            return savedBook;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(page: number, pageSize: number) {
        const [books, total] = await this.bookRepository.findAndCount({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return {
            books,
            total,
            page,
            pageSize,
        };
    }

    async findOne(id: number) {
        const book = await this.bookRepository.findOneBy({ id });
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found.`);
        }
        
        return book;
    }

    async update(id: number, updateBookDto: UpdateBookDto) {
        const book = await this.bookRepository.findOneBy({ id });
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found.`);
        }

        // Check if the ISBN is being updated and if it already exists
        if (updateBookDto.isbn && updateBookDto.isbn !== book.isbn) {
            const existingBook = await this.bookRepository.findOneBy({ isbn: updateBookDto.isbn });
            if (existingBook) {
                throw new BadRequestException(`A book with ISBN ${updateBookDto.isbn} already exists.`);
            }
        }

        // Update the book's properties
        Object.assign(book, updateBookDto);

        // Save the updated book entity to the database
        const updatedBook = await this.bookRepository.save(book);

        return updatedBook;
    }

    async remove(id: number) {
        const book = await this.bookRepository.findOneBy({ id });
        if (!book) {
            throw new NotFoundException(`Book with ID ${id} not found.`);
        }

        // Remove the book entity from the database
        return this.bookRepository.remove(book);
    }

    async search(query: SearchBookDto) {
        const searchQuery = this.bookRepository.createQueryBuilder('book');
        if (query.title) {
            searchQuery.andWhere('book.title ILIKE :title', { title: `%${query.title}%` });
        }
        if (query.author) {
            searchQuery.andWhere('book.author ILIKE :author', { author: `%${query.author}%` });
        }
        if (query.isbn) {
            searchQuery.andWhere('book.isbn ILIKE :isbn', { isbn: `%${query.isbn}%` });
        }

        const page = query.page || 1;
        const pageSize = query.pageSize || 10;

        searchQuery.skip((page - 1) * pageSize).take(pageSize);

        const [books, total] = await searchQuery.getManyAndCount();

        return {
            books,
            total,
            page,
            pageSize,
        };
    }
}