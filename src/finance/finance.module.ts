import { AuthModule } from 'src/auth/auth.module';

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AccountEntity } from './entities/account.entity';
import { TransactionEntity } from './entities/transaction.entity';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([TransactionEntity, AccountEntity]),
    forwardRef(() => AuthModule),
  ],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService],
})
export class FinanceModule {}
