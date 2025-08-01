import { Borrow } from "src/borrow/entities/borrow.entity";
import { Check, Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@Index(['title'])
@Index(['author'])
@Index(['isbn'], { unique: true })
@Check(`"availableQuantity" >= 0`)
export class Book {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 255 })
    title: string;

    @Column({ length: 255 })
    author: string;

    @Column({ length: 20 })
    isbn: string;

    @Column({ type:'integer' })
    availableQuantity: number;

    @Column({ length: 255 })
    shelfLocation: string;

    @OneToMany(() => Borrow, borrow => borrow.book)
    borrows: Borrow[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}