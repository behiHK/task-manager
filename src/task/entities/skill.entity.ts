import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'skills' })
export class SkillEntity extends BaseEntity {
  @PrimaryGeneratedColumn('increment')
  id: number

  @Column()
  name: string
}
