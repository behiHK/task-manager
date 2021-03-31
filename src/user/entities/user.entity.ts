import {
    BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany,
    PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';

import { SkillEntity } from '../../task/entities/skill.entity';
import { RoleEnum } from '../enums/role.enum';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  constructor(data?: Partial<UserEntity>) {
    super()
    if (data) {
      this.first_name = data.first_name
      this.last_name = data.last_name
      this.email = data.email
      this.national_code = data.national_code
      this.sheba = data.sheba
      this.phone = data.phone
      this.avatar = data.avatar
      this.role = data.role
      this.skills = data.skills
    }
  }
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    nullable: true,
  })
  first_name: string

  @Column({
    nullable: true,
  })
  last_name: string

  @Column({
    unique: true,
    length: 11,
  })
  phone: string

  @Column({
    nullable: true,
  })
  email: string

  @Column({
    nullable: true,
  })
  national_code: string

  @Column({
    nullable: true,
  })
  avatar: string

  //sheba
  @Column({
    nullable: true,
  })
  sheba: string

  //TODO just for now
  @Column({
    enum: RoleEnum,
    default: RoleEnum.USER,
  })
  role: RoleEnum

  @ManyToMany((type) => SkillEntity)
  @JoinTable({ name: 'user_skills' })
  skills: SkillEntity[]

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date
}
