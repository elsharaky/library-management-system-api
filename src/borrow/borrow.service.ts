import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, LessThan, LessThanOrEqual, MoreThan, MoreThanOrEqual, Repository } from 'typeorm';
import { Borrow } from './entities/borrow.entity';
import { CheckoutBorrowDto } from './dto/checkout-borrow.dto';
import { Book } from 'src/book/entities/book.entity';
import { Borrower } from 'src/borrower/entities/borrower.entity';
import { Workbook } from 'exceljs';
import { createObjectCsvStringifier } from 'csv-writer';
import { ExportFormat } from './dto/export-borrows.dto';

@Injectable()
export class BorrowService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Borrow)
        private readonly borrowRepository: Repository<Borrow>,
    ){}
    private readonly logger = new Logger(BorrowService.name);

    async borrow(borrowDto: CheckoutBorrowDto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Retrieve the book to be borrowed
            this.logger.log(`Borrowing book with ID: ${borrowDto.bookId} for borrower ID: ${borrowDto.borrowerId}`);
            const book = await queryRunner.manager.findOne(Book, {
                where: { id: borrowDto.bookId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!book) {
                this.logger.warn(`Book with ID ${borrowDto.bookId} not found.`);
                throw new NotFoundException(`Book with ID ${borrowDto.bookId} not found.`);
            }

            // Check if book quantity is sufficient
            if (book.availableQuantity <= 0) {
                this.logger.warn(`Book with ID ${borrowDto.bookId} is not available for borrowing.`);
                throw new BadRequestException(`Book with ID ${borrowDto.bookId} is not available for borrowing.`);
            }

            // Retrieve the borrower
            const borrower = await queryRunner.manager.findOne(Borrower, {
                where: { id: borrowDto.borrowerId },
            });
            if (!borrower) {
                this.logger.warn(`Borrower with ID ${borrowDto.borrowerId} not found.`);
                throw new NotFoundException(`Borrower with ID ${borrowDto.borrowerId} not found.`);
            }

            // Decrease the book's available quantity
            book.availableQuantity -= 1;
            await queryRunner.manager.save(book);

            // Create the borrow record
            const borrow = queryRunner.manager.create(Borrow, {
                book,
                borrower,
                borrowedDate: borrowDto.borrowedDate || new Date(),
                dueDate: borrowDto.dueDate,
            });

            // Save the borrow record
            await queryRunner.manager.save(borrow);

            // Commit the transaction
            await queryRunner.commitTransaction();
            this.logger.log(`Book with ID ${borrowDto.bookId} borrowed successfully by borrower ID: ${borrowDto.borrowerId}`);

            // Retrieve the saved borrow record to return
            const savedBorrow = await queryRunner.manager.findOne(Borrow, {
                where: { id: borrow.id },
                relations: ['book', 'borrower'],
            });

            return savedBorrow;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async findAll(page: number, pageSize: number) {
        this.logger.log(`Fetching all borrows with pagination: page ${page}, pageSize ${pageSize}`);

        const [borrows, total] = await this.borrowRepository.findAndCount({
            skip: (page - 1) * pageSize,
            take: pageSize,
            relations: ['book', 'borrower'],
        });

        this.logger.log(`Found ${total} borrows.`);

        return {
            borrows,
            total,
            page,
            pageSize,
        };
    }

    async findAllByBorrowerId(borrowerId: number, page: number, pageSize: number) {
        this.logger.log(`Fetching all borrows for borrower ID: ${borrowerId} with pagination: page ${page}, pageSize ${pageSize}`);

        const [borrows, total] = await this.borrowRepository.findAndCount({
            where: { borrower: { id: borrowerId } },
            skip: (page - 1) * pageSize,
            take: pageSize,
            relations: ['book', 'borrower'],
        });

        this.logger.log(`Found ${total} borrows for borrower ID: ${borrowerId}.`);

        return {
            borrows,
            total,
            page,
            pageSize,
        };
    }

    async findAllOverdue(page: number, pageSize: number) {
        this.logger.log(`Fetching all overdue borrows with pagination: page ${page}, pageSize ${pageSize}`);
        
        const currentDate = new Date();
        const [borrows, total] = await this.borrowRepository.findAndCount({
            where: {
                dueDate: LessThan(currentDate),
                returnedDate: IsNull(),
            },
            skip: (page - 1) * pageSize,
            take: pageSize,
            relations: ['book', 'borrower'],
        });

        this.logger.log(`Found ${total} overdue borrows.`);

        return {
            borrows,
            total,
            page,
            pageSize,
        };
    }

    async returnBook(borrowId: number) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Retrieve the borrow record to be returned
            this.logger.log(`Returning borrow record with ID: ${borrowId}`);
            const borrow = await queryRunner.manager.findOne(Borrow, {
                where: { id: borrowId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!borrow) {
                this.logger.warn(`Borrow record with ID ${borrowId} not found.`);
                throw new NotFoundException(`Borrow record with ID ${borrowId} not found.`);
            }

            // Retrieve the book associated with the borrow record
            const book = await queryRunner.manager.findOne(Book, {
                where: { id: borrow.bookId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!book) {
                this.logger.warn(`Book with ID ${borrow.bookId} not found.`);
                throw new NotFoundException(`Book with ID ${borrow.bookId} not found.`);
            }

            // Check if the book is already returned
            if (borrow.returnedDate) {
                this.logger.warn(`Book with ID ${borrow.bookId} has already been returned.`);
                throw new BadRequestException(`Book with ID ${borrow.bookId} has already been returned.`);
            }

            // Increase the book's available quantity
            book.availableQuantity += 1;
            const updatedBook = await queryRunner.manager.save(book);

            // Update the returned date
            borrow.returnedDate = new Date();

            // Ensure the book reference is updated
            borrow.book = updatedBook;

            // Save the updated borrow record
            await queryRunner.manager.save(borrow);

            // Commit the transaction
            await queryRunner.commitTransaction();
            this.logger.log(`Book with ID ${borrow.bookId} returned successfully.`);

            // Retrieve the updated borrow record to return
            const updatedBorrow = await queryRunner.manager.findOne(Borrow, {
                where: { id: borrow.id },
                relations: ['book', 'borrower'],
            });

            return updatedBorrow;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }

    async exportBorrowsByPeriod(format: ExportFormat, startDate?: Date, endDate?: Date) {
        this.logger.log(`Exporting borrows from ${startDate?.toISOString()} to ${endDate?.toISOString()} in format: ${format}`);

        const where = {};
        if (startDate) {
            where['borrowedDate'] = MoreThanOrEqual(startDate);
        }
        if (endDate) {
            where['borrowedDate'] = LessThanOrEqual(endDate);
        }
        const borrows = await this.borrowRepository.find({
            relations: ['book', 'borrower'],
            where,
        });

        this.logger.log(`Found ${borrows.length} borrows for export.`);

        const buffer = await this.generateFile(borrows, format);

        this.logger.log(`Exported borrows successfully in format: ${format}`);

        return buffer;
    }

    async exportBorrowsInLastMonth(format: ExportFormat) {
        this.logger.log(`Exporting borrows from the last month in format: ${format}`);

        const currentDate = new Date();
        const lastMonthDate = new Date(currentDate);
        lastMonthDate.setMonth(currentDate.getMonth() - 1);

        const borrows = await this.borrowRepository.find({
            where: {
                borrowedDate: MoreThanOrEqual(lastMonthDate),
            },
            relations: ['book', 'borrower'],
        });

        this.logger.log(`Found ${borrows.length} borrows from the last month for export.`);

        const buffer = await this.generateFile(borrows, format);

        this.logger.log(`Exported borrows from the last month successfully in format: ${format}`);

        return buffer;
    }

    async exportBorrowsOverdue(format: ExportFormat) {
        this.logger.log(`Exporting overdue borrows in format: ${format}`);

        const currentDate = new Date();

        const borrows = await this.borrowRepository.find({
            where: {
                dueDate: LessThan(currentDate),
                returnedDate: IsNull(),
            },
            relations: ['book', 'borrower'],
        });

        this.logger.log(`Found ${borrows.length} overdue borrows for export.`);

        const buffer = await this.generateFile(borrows, format);

        this.logger.log(`Exported overdue borrows successfully in format: ${format}`);

        return buffer;
    }

    private async generateFile(borrows: Borrow[], format: ExportFormat) {
        if (format === ExportFormat.XLSX) {
            const workbook = new Workbook();
            const worksheet = workbook.addWorksheet('Borrows');

        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Book Title', key: 'bookTitle', width: 30 },
            { header: 'Borrower Name', key: 'borrowerName', width: 30 },
            { header: 'Borrowed Date', key: 'borrowedDate', width: 20 },
            { header: 'Due Date', key: 'dueDate', width: 20 },
            { header: 'Returned Date', key: 'returnedDate', width: 20 },
        ];

        borrows.forEach((borrow) => {
            worksheet.addRow({
            id: borrow.id,
            bookTitle: borrow.book?.title,
            borrowerName: borrow.borrower?.name,
            borrowedDate: borrow.borrowedDate?.toISOString(),
            dueDate: borrow.dueDate?.toISOString(),
            returnedDate: borrow.returnedDate?.toISOString(),
            });
        });

        return workbook.xlsx.writeBuffer();
        }

        const csvStringifier = createObjectCsvStringifier({
        header: [
            { id: 'id', title: 'ID' },
            { id: 'bookTitle', title: 'Book Title' },
            { id: 'borrowerName', title: 'Borrower Name' },
            { id: 'borrowedDate', title: 'Borrowed Date' },
            { id: 'dueDate', title: 'Due Date' },
            { id: 'returnedDate', title: 'Returned Date' },
        ],
        });

        const records = borrows.map((borrow) => ({
        id: borrow.id,
        bookTitle: borrow.book?.title,
        borrowerName: borrow.borrower?.name,
        borrowedDate: borrow.borrowedDate?.toISOString(),
        dueDate: borrow.dueDate?.toISOString(),
        returnedDate: borrow.returnedDate?.toISOString(),
        }));

        const csvHeader = csvStringifier.getHeaderString();
        const csvContent = csvStringifier.stringifyRecords(records);
        return Buffer.from(csvHeader + csvContent, 'utf-8');
  }
}
