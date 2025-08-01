import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CreateBookDto } from './dto/create-book.dto';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateBookDto } from './dto/update-book.dto';
import { SearchBookDto } from './dto/search-book.dto';

@Injectable()
export class BookService {
    constructor(
        @InjectRepository(Book)
        private readonly bookRepository: Repository<Book>,
    ) {}
    private readonly logger = new Logger(BookService.name);

    async create(createBookDto: CreateBookDto) {
        this.logger.log(`Creating book with ISBN: ${createBookDto.isbn}`);
        
        // Check if the book with the same ISBN already exists
        const existingBook = await this.bookRepository.findOneBy({
            isbn: createBookDto.isbn,
        });
        if (existingBook) {
            this.logger.warn(`Book with ISBN ${createBookDto.isbn} already exists.`);
            throw new BadRequestException(`A book with ISBN ${createBookDto.isbn} already exists.`);
        }
        
        // Create a new book entity
        const book = this.bookRepository.create({
            ...createBookDto,
        });
        this.logger.log(`Saving book with title: ${createBookDto.title}`);

        try {
            // Save the book entity to the database
            const savedBook = await this.bookRepository.save(book);
            this.logger.log(`Book with title ${createBookDto.title} saved successfully.`);
            return savedBook;
        } catch (error) {
            // Handle any errors that occur during the save operation
            if (error.code === '23505') { // Unique constraint violation
                this.logger.error(`Failed to create book with ISBN ${createBookDto.isbn}: ${error.message}`);
                throw new BadRequestException(`A book with ISBN ${createBookDto.isbn} already exists.`);
            }

            this.logger.error(`Failed to create book: ${error.message}`);
            throw new InternalServerErrorException('Failed to create book.'); // Handle other errors
        }
    }

    async findAll(page: number, pageSize: number) {
        this.logger.log(`Fetching all books with pagination: page ${page}, pageSize ${pageSize}`);
        
        const [books, total] = await this.bookRepository.findAndCount({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        this.logger.log(`Found ${total} books.`);

        return {
            books,
            total,
            page,
            pageSize,
        };
    }

    async findOne(id: number) {
        this.logger.log(`Fetching book with ID: ${id}`);
        
        const book = await this.bookRepository.findOneBy({ id });
        if (!book) {
            this.logger.warn(`Book with ID ${id} not found.`);
            throw new NotFoundException(`Book with ID ${id} not found.`);
        }

        this.logger.log(`Book with ID ${id} found: ${book.title}`);
        
        return book;
    }

    async update(id: number, updateBookDto: UpdateBookDto) {
        this.logger.log(`Updating book with ID: ${id}`);

        const book = await this.bookRepository.findOneBy({ id });
        if (!book) {
            this.logger.warn(`Book with ID ${id} not found.`);
            throw new NotFoundException(`Book with ID ${id} not found.`);
        }

        // Check if the ISBN is being updated and if it already exists
        if (updateBookDto.isbn && updateBookDto.isbn !== book.isbn) {
            const existingBook = await this.bookRepository.findOneBy({ isbn: updateBookDto.isbn });
            if (existingBook) {
                this.logger.warn(`Book with ISBN ${updateBookDto.isbn} already exists.`);
                throw new BadRequestException(`A book with ISBN ${updateBookDto.isbn} already exists.`);
            }
        }

        // Update the book's properties
        Object.assign(book, updateBookDto);

        try {
            // Save the updated book entity to the database
            this.logger.log(`Saving updated book with ID: ${id}`);
            const updatedBook = await this.bookRepository.save(book);
            this.logger.log(`Book with ID ${id} updated successfully.`);
            return updatedBook;
        } catch (error) {
            // Handle any errors that occur during the save operation
            if (error.code === '23505') { // Unique constraint violation
                this.logger.error(`Failed to update book with ID ${id}: ${error.message}`);
                throw new BadRequestException(`A book with ISBN ${updateBookDto.isbn} already exists.`);
            }

            this.logger.error(`Failed to update book with ID ${id}: ${error.message}`);
            throw new InternalServerErrorException(`Failed to update book with ID ${id}.`); // Handle other errors
        }
    }

    async remove(id: number) {
        this.logger.log(`Removing book with ID: ${id}`);

        const book = await this.bookRepository.findOneBy({ id });
        if (!book) {
            this.logger.warn(`Book with ID ${id} not found.`);
            throw new NotFoundException(`Book with ID ${id} not found.`);
        }

        // Remove the book entity from the database
        await this.bookRepository.remove(book);
        this.logger.log(`Book with ID ${id} removed successfully.`);
    }

    async search(query: SearchBookDto) {
        this.logger.log(`Searching books with query: ${JSON.stringify(query)}`);

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

        this.logger.log(`Found ${total} books matching query: ${JSON.stringify(query)}`);

        return {
            books,
            total,
            page,
            pageSize,
        };
    }
}