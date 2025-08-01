import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Borrower } from './entities/borrower.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RegisterBorrowerDto } from './dto/register-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BorrowerService {
    constructor(
        private readonly dataSource: DataSource,
        @InjectRepository(Borrower)
        private readonly borrowerRepository: Repository<Borrower>,
    ){}

    async register(createBorrowerDto: RegisterBorrowerDto) {
        // Check if the borrower with the same email already exists
        const existingBorrower = await this.borrowerRepository.findOneBy({
            email: createBorrowerDto.email,
        });
        if (existingBorrower) {
            throw new BadRequestException(`A borrower with email ${createBorrowerDto.email} already exists.`);
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(createBorrowerDto.password, 10);

        // Create a new borrower entity
        const borrower = this.borrowerRepository.create({
            ...createBorrowerDto,
            password: hashedPassword,
            registeredDate: new Date(),
        });

        try {
            // Save the borrower entity to the database
            const savedBorrower = await this.borrowerRepository.save(borrower);
            return savedBorrower;
        } catch (error) {
            // Handle any errors that occur during the save operation
            if (error.code === '23505') { // Unique constraint violation
                throw new BadRequestException(`A borrower with email ${createBorrowerDto.email} already exists.`);
            }

            throw new InternalServerErrorException(`Failed to register borrower: ${error.message}`); // Handle other errors
        }
    }

    async findAll(page: number, pageSize: number) {
        const [borrowers, total] = await this.borrowerRepository.findAndCount({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        return {
            borrowers,
            total,
            page,
            pageSize,
        };
    }

    async findOne(id: number) {
        const borrower = await this.borrowerRepository.findOneBy({ id });
        if (!borrower) {
            throw new BadRequestException(`Borrower with ID ${id} not found.`);
        }

        return borrower;
    }

    async update(id: number, updateBorrowerDto: UpdateBorrowerDto) {
        const borrower = await this.borrowerRepository.findOneBy({ id });
        if (!borrower) {
            throw new BadRequestException(`Borrower with ID ${id} not found.`);
        }

        // Check if the email is already taken by another borrower
        if (updateBorrowerDto.email && updateBorrowerDto.email !== borrower.email) {
            const existingBorrower = await this.borrowerRepository.findOneBy({ email: updateBorrowerDto.email });
            if (existingBorrower) {
                throw new BadRequestException(`Email ${updateBorrowerDto.email} is already taken by another borrower.`);
            }
        }

        // If the password is being updated, hash it
        if (updateBorrowerDto.password) {
            updateBorrowerDto.password = await bcrypt.hash(updateBorrowerDto.password, 10);
        }

        // Update the borrower entity
        Object.assign(borrower, updateBorrowerDto);

        try {
            // Save the updated borrower entity to the database
            const updatedBorrower = await this.borrowerRepository.save(borrower);
            return updatedBorrower;
        } catch (error) {
            // Handle any errors that occur during the save operation
            if (error.code === '23505') { // Unique constraint violation
                throw new BadRequestException(`A borrower with email ${updateBorrowerDto.email} already exists.`);
            }

            throw new BadRequestException(`Failed to update borrower with ID ${id}: ${error.message}`);
        }
    }

    async remove(id: number) {
        const borrower = await this.borrowerRepository.findOneBy({ id });
        if (!borrower) {
            throw new BadRequestException(`Borrower with ID ${id} not found.`);
        }

        return this.borrowerRepository.remove(borrower);
    }

    async findByEmail(email: string) {
        const borrower = await this.borrowerRepository.findOneBy({ email });
        if (!borrower) {
            throw new BadRequestException(`Borrower with email ${email} not found.`);
        }

        return borrower;
    }
}