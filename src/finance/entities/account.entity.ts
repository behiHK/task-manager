import { UserEntity } from 'src/user/entities/user.entity';
import {
    BaseEntity, Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'accounts' })
export class AccountEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @OneToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @Column({
    nullable: true,
  })
  bank_name: string

  @Column({
    default: 0,
    type: 'float',
  })
  debit: number

  @Column({
    default: 0,
    type: 'float',
  })
  credit: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date
}
