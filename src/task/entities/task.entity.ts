import { UserEntity } from 'src/user/entities/user.entity'
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

import { PriorityEnum } from '../enums/priority.enum'
import { StatusEnum } from '../enums/status.enum'
import { CancelTaskEntity } from './cancel-task.entity'
import { SkillEntity } from './skill.entity'

@Entity({ name: 'tasks' })
export class TaskEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  title: string

  @Column({ type: 'text' })
  description: string

  @Column({ type: 'text' })
  circumstance: string

  @ManyToMany(() => SkillEntity)
  @JoinTable({ name: 'task_skills' })
  skills: SkillEntity[]

  @Column()
  price: number

  @Column({
    type: 'enum',
    enum: PriorityEnum,
    default: PriorityEnum.NORMAL,
  })
  priority: PriorityEnum

  @Column({
    type: 'enum',
    enum: StatusEnum,
    default: StatusEnum.NEW,
  })
  status: StatusEnum

  //TODO user or different entity?!
  @ManyToMany((type) => UserEntity)
  @JoinTable({ name: 'task_experts' })
  experts: UserEntity[]

  @ManyToOne((type) => UserEntity)
  @JoinColumn({ name: 'task_user' })
  user: UserEntity

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  attachments: string[]

  @OneToMany(() => CancelTaskEntity, (ct) => ct.task)
  cancel_requests: CancelTaskEntity[]

  @Column()
  //hours
  time: number

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date
}
