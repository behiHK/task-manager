import { TaskEntity } from 'src/task/entities/task.entity';
import {
    BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

import { PaymentStatusEnum } from '../enums/payment-status.enum';
import { AccountEntity } from './account.entity';

@Entity({ name: 'transactions' })
export class TransactionEntity extends BaseEntity {
  constructor(data?: Partial<TransactionEntity>) {
    super()
    if (data) {
      this.account = data.account
      this.task = data.task
      this.status = data.status
      this.debit = data.debit
      this.credit = data.credit
      this.tracking_id = data.tracking_id
    }
  }
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => AccountEntity)
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity

  @ManyToOne(() => TaskEntity)
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity

  @Column({ nullable: true })
  tracking_id: string

  @Column()
  debit: number

  @Column()
  credit: number

  @Column({
    enum: PaymentStatusEnum,
    default: PaymentStatusEnum.PENDING,
  })
  status: PaymentStatusEnum

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
