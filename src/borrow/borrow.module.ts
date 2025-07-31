import { Module } from '@nestjs/common';
import { BorrowService } from './borrow.service';
import { BorrowController } from './borrow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrow } from './entities/borrow.entity';
import { BookModule } from 'src/book/book.module';
import { BorrowerModule } from 'src/borrower/borrower.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrow]),
    BookModule,
    BorrowerModule,
  ],
  providers: [BorrowService],
  controllers: [BorrowController]
})
export class BorrowModule {}
