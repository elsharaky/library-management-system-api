import { Module } from '@nestjs/common';
import { BorrowerService } from './borrower.service';
import { BorrowerController } from './borrower.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Borrower } from './entities/borrower.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Borrower])
  ],
  providers: [BorrowerService],
  controllers: [BorrowerController]
})
export class BorrowerModule {}
