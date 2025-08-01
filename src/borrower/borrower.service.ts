import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { Borrower } from './entities/borrower.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { RegisterBorrowerDto } from './dto/register-borrower.dto';
import { UpdateBorrowerDto } from './dto/update-borrower.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BorrowerService {
    constructor(
        @InjectRepository(Borrower)
        private readonly borrowerRepository: Repository<Borrower>,
    ){}
    private readonly logger = new Logger(BorrowerService.name);

    async register(createBorrowerDto: RegisterBorrowerDto) {
        this.logger.log(`Registering borrower with email: ${createBorrowerDto.email}`);

        // Check if the borrower with the same email already exists
        const existingBorrower = await this.borrowerRepository.findOneBy({
            email: createBorrowerDto.email,
        });
        if (existingBorrower) {
            this.logger.warn(`Borrower with email ${createBorrowerDto.email} already exists.`);
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

        this.logger.log(`Saving borrower with email: ${createBorrowerDto.email}`);

        try {
            // Save the borrower entity to the database
            const savedBorrower = await this.borrowerRepository.save(borrower);
            this.logger.log(`Borrower with email ${createBorrowerDto.email} registered successfully.`);
            return savedBorrower;
        } catch (error) {
            // Handle any errors that occur during the save operation
            if (error.code === '23505') { // Unique constraint violation
                this.logger.error(`Failed to register borrower with email ${createBorrowerDto.email}: ${error.message}`);
                throw new BadRequestException(`A borrower with email ${createBorrowerDto.email} already exists.`);
            }

            this.logger.error(`Failed to register borrower: ${error.message}`);
            throw new InternalServerErrorException(`Failed to register borrower: ${error.message}`); // Handle other errors
        }
    }

    async findAll(page: number, pageSize: number) {
        this.logger.log(`Fetching all borrowers with pagination: page ${page}, pageSize ${pageSize}`);

        const [borrowers, total] = await this.borrowerRepository.findAndCount({
            skip: (page - 1) * pageSize,
            take: pageSize,
        });

        this.logger.log(`Found ${total} borrowers.`);

        return {
            borrowers,
            total,
            page,
            pageSize,
        };
    }

    async findOne(id: number) {
        this.logger.log(`Fetching borrower with ID: ${id}`);

        const borrower = await this.borrowerRepository.findOneBy({ id });
        if (!borrower) {
            this.logger.warn(`Borrower with ID ${id} not found.`);
            throw new BadRequestException(`Borrower with ID ${id} not found.`);
        }
        this.logger.log(`Borrower with ID ${id} found: ${borrower.email}`);

        return borrower;
    }

    async update(id: number, updateBorrowerDto: UpdateBorrowerDto) {
        this.logger.log(`Updating borrower with ID: ${id}`);
        
        const borrower = await this.borrowerRepository.findOneBy({ id });
        if (!borrower) {
            this.logger.warn(`Borrower with ID ${id} not found.`);
            throw new BadRequestException(`Borrower with ID ${id} not found.`);
        }

        // Check if the email is already taken by another borrower
        if (updateBorrowerDto.email && updateBorrowerDto.email !== borrower.email) {
            const existingBorrower = await this.borrowerRepository.findOneBy({ email: updateBorrowerDto.email });
            if (existingBorrower) {
                this.logger.warn(`Email ${updateBorrowerDto.email} is already taken by another borrower.`);
                throw new BadRequestException(`Email ${updateBorrowerDto.email} is already taken by another borrower.`);
            }
        }

        // If the password is being updated, hash it
        if (updateBorrowerDto.password) {
            updateBorrowerDto.password = await bcrypt.hash(updateBorrowerDto.password, 10);
        }

        // Update the borrower entity
        Object.assign(borrower, updateBorrowerDto);
        this.logger.log(`Saving updated borrower with ID: ${id}`);

        try {
            // Save the updated borrower entity to the database
            const updatedBorrower = await this.borrowerRepository.save(borrower);
            this.logger.log(`Borrower with ID ${id} updated successfully.`);
            return updatedBorrower;
        } catch (error) {
            // Handle any errors that occur during the save operation
            if (error.code === '23505') { // Unique constraint violation
                this.logger.error(`Failed to update borrower with ID ${id}: ${error.message}`);
                throw new BadRequestException(`A borrower with email ${updateBorrowerDto.email} already exists.`);
            }

            this.logger.error(`Failed to update borrower: ${error.message}`);
            throw new BadRequestException(`Failed to update borrower with ID ${id}: ${error.message}`);
        }
    }

    async remove(id: number) {
        this.logger.log(`Removing borrower with ID: ${id}`);

        const borrower = await this.borrowerRepository.findOneBy({ id });
        if (!borrower) {
            this.logger.warn(`Borrower with ID ${id} not found.`);
            throw new BadRequestException(`Borrower with ID ${id} not found.`);
        }

        await this.borrowerRepository.remove(borrower);
        this.logger.log(`Borrower with ID ${id} removed successfully.`);
    }

    async findByEmail(email: string) {
        this.logger.log(`Fetching borrower with email: ${email}`);

        const borrower = await this.borrowerRepository.findOneBy({ email });
        if (!borrower) {
            this.logger.warn(`Borrower with email ${email} not found.`);
            throw new BadRequestException(`Borrower with email ${email} not found.`);
        }

        this.logger.log(`Borrower with email ${email} found: ${borrower.email}`);

        return borrower;
    }
}