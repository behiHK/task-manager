import { UserEntity } from 'src/user/entities/user.entity';
import {
    BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';

import { StatusEnum } from '../enums/status.enum';
import { TaskEntity } from './task.entity';

@Entity({ name: 'user_tasks' })
export class UserTaskEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @ManyToOne(() => TaskEntity)
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.WAITING_FOR_CONFIRMATION,
  })
  status: StatusEnum

  @Column({
    nullable: true,
  })
  started_at: Date

  @Column({
    nullable: true,
  })
  finished_at: Date

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date
}
