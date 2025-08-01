import { Exclude } from "class-transformer";
import { Book } from "src/book/entities/book.entity";
import { Borrower } from "src/borrower/entities/borrower.entity";
import { Check, Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn, RelationId, UpdateDateColumn } from "typeorm";

@Entity()
@Index(['dueDate'])
@Index(['returnedDate'])
@Check(`"bookId" > 0`)
@Check(`"borrowerId" > 0`)
export class Borrow {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Book, book => book.borrows, { nullable: false, onDelete: 'CASCADE' })
  book: Book;

  @RelationId((borrow: Borrow) => borrow.book)
  @Exclude()
  bookId: number;

  @ManyToOne(() => Borrower, borrower => borrower.borrows, { nullable: false, onDelete: 'CASCADE' })
  borrower: Borrower;

  @Column()
  borrowedDate: Date;

  @Column()
  dueDate: Date;

  @Column({ nullable: true })
  returnedDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}