import { Exclude } from "class-transformer";
import { Borrow } from "src/borrow/entities/borrow.entity";
import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
@Index(['email'], { unique: true })
export class Borrower {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255 })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column()
  registeredDate: Date;

  @OneToMany(() => Borrow, borrow => borrow.borrower)
  borrows: Borrow[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}