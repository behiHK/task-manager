import { UserEntity } from 'src/user/entities/user.entity';
import {
    BaseEntity, Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn, UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'chats' })
export class ChatEntity extends BaseEntity {
  constructor(data?: Partial<ChatEntity>) {
    super()
    if (data) {
      this.sender = data.sender
      this.receiver = data.receiver
      this.message = data.message
      this.file = data.file
    }
  }
  @PrimaryGeneratedColumn('increment')
  id: number

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'sender_id' })
  sender: UserEntity

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'receiver_id' })
  receiver: UserEntity

  @Column({
    nullable: true,
  })
  message: string

  @Column({
    nullable: true,
  })
  file: string

  @Column({
    nullable: true,
    type: 'timestamp without time zone',
  })
  seen_at: Date

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @DeleteDateColumn()
  deleted_at: Date
}
