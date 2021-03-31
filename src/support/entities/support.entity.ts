import { type } from 'os';
import { TaskEntity } from 'src/task/entities/task.entity';
import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { IssueStatusEnum, TypeEnum } from '../enums/support.enum';

@Entity({ name: 'supports' })
export class SupportEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  title: string

  @ManyToOne((type) => TaskEntity)
  @JoinColumn({ name: 'task_id' })
  task: TaskEntity

  @Column()
  description: string

  @Column({
    enum: TypeEnum,
    default: TypeEnum.DOCUMENT,
  })
  type: TypeEnum

  @Column({
    nullable: true,
  })
  answer: string

  @Column({
    type: 'simple-array',
    nullable: true,
  })
  attachments: string[]

  @Column({
    default: IssueStatusEnum.OPEN,
    enum: IssueStatusEnum,
  })
  status: IssueStatusEnum
}
