import { nanoid } from 'nanoid'
import xlsx from 'node-xlsx'
import { DBErrorHandler } from 'src/shared/helpers/db-error-handler'
import { TaskEntity } from 'src/task/entities/task.entity'
import { UserEntity } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'

import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { AccountEntity } from './entities/account.entity'
import { TransactionEntity } from './entities/transaction.entity'
import { PaymentStatusEnum } from './enums/payment-status.enum'
import { TransactionTypeEnum } from './enums/transaction-type.enum'

@Injectable()
export class FinanceService {
  constructor(
    @InjectRepository(AccountEntity) private readonly accountRepository: Repository<AccountEntity>,
    @InjectRepository(TransactionEntity)
    private readonly transactionRepository: Repository<TransactionEntity>,
  ) {}

  //TODO seed company account
  async createAccount(user: UserEntity) {
    try {
      const account = new AccountEntity()
      account.user = user
      return await this.accountRepository.save(account)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getAccount(condition: {
    id?: number
    userId?: string
    firstName?: string
    lastName?: string
    bankName?: string
  }) {
    try {
      const qb = this.accountRepository
        .createQueryBuilder('accounts')
        .leftJoinAndSelect('accounts.user', 'user')

      if (condition.id) qb.where('accounts.id = :id', { id: condition.id })
      if (condition.userId) qb.andWhere('user.id = :userId', { userId: condition.userId })
      if (condition.firstName)
        qb.andWhere('user.first_name = :firstName', { firstName: condition.firstName })
      if (condition.lastName)
        qb.andWhere('user.last_name = :lastName', { lastName: condition.lastName })
      if (condition.bankName)
        qb.andWhere('accounts.bank_name = :bank_name', { bank_name: condition.bankName })

      return await qb.getOne()
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async updateAccount(accountId: number, account: AccountEntity) {
    try {
      return await this.accountRepository.update(accountId, account)
    } catch (error) {
      DBErrorHandler(error)
    }
  }
  async settleMoney(account: AccountEntity, value: number, task: TaskEntity) {
    try {
      //TODO seed company account
      const companyAccount = await this.getAccount({ firstName: 'Ali', lastName: 'Saadat' })
      await this.createTransaction(companyAccount, 0, value, PaymentStatusEnum.PAID, task)
      await this.createTransaction(account, value, 0, PaymentStatusEnum.PAID, task)

      const userAccount = await this.getAccount({ id: account.id })
      await this.updateAccount(account.id, <AccountEntity>{ credit: userAccount.credit + value })
      await this.updateAccount(companyAccount.id, <AccountEntity>{
        debit: companyAccount.debit + value,
      })
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async withdrawRequest(account: AccountEntity, value: number) {
    const userAccount = await this.getAccount({ id: account.id })
    const balance = userAccount.credit - userAccount.debit
    if (balance < value && value > Number(process.env.MINIMUM_WITHDRAW))
      throw new BadRequestException('unacceptable request')

    //TODO seed bank account
    const bankAccount = await this.getAccount({ bankName: 'saderat' })
    const id = nanoid(12)
    await this.createTransaction(bankAccount, value, 0, PaymentStatusEnum.PENDING, null, id)
    await this.createTransaction(account, 0, value, PaymentStatusEnum.PENDING, null, id)
  }

  async withdrawConfirm(account: AccountEntity, trackingId: string) {
    const userTransaction = await this.getTransaction(<TransactionEntity>{
      tracking_id: trackingId,
      account,
    })
    const value = userTransaction.debit

    const userAccount = await this.getAccount({ id: account.id })
    try {
      await this.updateAccount(account.id, <AccountEntity>{ debit: userAccount.debit + value })

      //TODO seed bank account
      const bankAccount = await this.getAccount({ bankName: 'saderat' })

      await this.updateAccount(bankAccount.id, <AccountEntity>{
        credit: bankAccount.credit + value,
      })

      return await this.updateTransaction(trackingId, PaymentStatusEnum.PAID)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getTransaction(transaction: TransactionEntity) {
    try {
      return await this.transactionRepository.findOne(transaction)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async createTransaction(
    account: AccountEntity,
    credit: number,
    debit: number,
    status: PaymentStatusEnum,
    task?: TaskEntity,
    trackingId?: string,
  ) {
    try {
      const transaction = new TransactionEntity({
        account,
        credit,
        debit,
        status,
        task,
        tracking_id: trackingId,
      })
      return await this.transactionRepository.save(transaction)
    } catch (error) {
      DBErrorHandler(error)
    }
    // TODO handle bank connections ...
  }
  async updateTransaction(trackingId: string, status: PaymentStatusEnum) {
    try {
      return await this.transactionRepository
        .createQueryBuilder('transactions')
        .update()
        .set({ status })
        .where('transactions.tracking_id = :trackingId', { trackingId })
        .andWhere('transactions.status = :pendingStatus', {
          pendingStatus: PaymentStatusEnum.PENDING,
        })
        .execute()
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getPendingTransactions() {
    try {
      return await this.transactionRepository.find({
        where: { status: PaymentStatusEnum.PENDING, account: { bank_name: null } },
      })
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getTransactionsExcel() {
    const transactions = await this.getPendingTransactions()
    const withdrawData = [['شماره پیگیری', 'نام', 'نام خانوادگی', 'کد ملی', 'شبا', 'مبلغ']]

    transactions.map((tr) => {
      withdrawData.push([
        tr.tracking_id,
        tr.account.user.first_name,
        tr.account.user.last_name,
        tr.account.user.national_code,
        tr.account.user.sheba,
        tr.debit.toString(),
      ])
    })

    return xlsx.build([{ name: 'WithdrawSheet', data: withdrawData }], {
      type: 'buffer',
      bookType: 'xls',
    })
  }

  async getAccountBalance(userId: string) {
    const userAccount = await this.getAccount({ userId })

    return userAccount.credit - userAccount.debit
  }

  async getUserTransactions(userId: string, type?: TransactionTypeEnum, date?: string) {
    try {
      const [array, total] = await this.transactionRepository
        .createQueryBuilder('transactions')
        .innerJoinAndSelect('transactions.account', 'account')
        .leftJoinAndSelect('account.user', 'user')
        .where('user.id = :userId', { userId })
        .andWhere(
          type && type == TransactionTypeEnum.DEPOSIT
            ? 'transactions.debit > 0 '
            : type && type == TransactionTypeEnum.WITHDRAW
            ? 'transactions.credit > 0 '
            : '1=1',
        )
        .andWhere(date ? 'transactions.date >= :date' : '1=1', { date })
        .getManyAndCount()

      return { array, total }
    } catch (error) {
      DBErrorHandler(error)
    }
  }
}
