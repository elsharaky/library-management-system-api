import { Borrow } from "src/borrow/entities/borrow.entity";
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@Index(['title'])
@Index(['author'])
@Index(['isbn'], { unique: true })
@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    author: string;

    @Column()
    isbn: string;

    @Column({ type:'integer' })
    availableQuantity: number;

    @Column()
    shelfLocation: string;

    @OneToMany(() => Borrow, borrow => borrow.book)
    borrows: Borrow[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}