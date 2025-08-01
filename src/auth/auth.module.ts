import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { BorrowerModule } from 'src/borrower/borrower.module';
import { BasicAuthStrategy } from './basic-auth.strategy';

@Module({
    imports: [PassportModule, BorrowerModule],
    providers: [BasicAuthStrategy],
    exports: [BasicAuthStrategy],
})
export class AuthModule {}
