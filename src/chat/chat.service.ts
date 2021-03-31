import { Repository } from 'typeorm'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { ChatEntity } from './entities/chat.entity'

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatEntity) private readonly chatRepository: Repository<ChatEntity>,
  ) {}

  async getUnreadMessages(userId: string) {
    return await this.chatRepository.find({
      where: { receiver: { id: userId }, seen_at: null },
    })
  }

  async createChat(chat: ChatEntity) {
    return await this.chatRepository.save(chat)
  }

  async seenMessages(receiverId: string, senderId: string) {
    const chats = await this.chatRepository.find({
      where: { receiver: { id: receiverId }, sender: { id: senderId }, seen_at: null },
    })

    this.chatRepository.update(
      { receiver: { id: receiverId }, sender: { id: senderId }, seen_at: null },
      { seen_at: new Date() },
    )
    return chats
  }
}
