import { UserEntity } from 'src/user/entities/user.entity'
import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'

import { TaskEntity } from './task.entity'

@Entity({ name: 'cancel_tasks' })
export class CancelTaskEntity extends BaseEntity {
  constructor(data?: Partial<CancelTaskEntity>) {
    super()
    if (data) {
      this.task = data.task
      this.user = data.user
    }
  }
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => TaskEntity)
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'user_id' })
  user: UserEntity

  @CreateDateColumn()
  created_at: Date
}
