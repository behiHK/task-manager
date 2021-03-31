import { checkInput } from 'microservice-shared/dist/main.helper';
import { RedisService } from 'nestjs-redis';
import { Server, Socket } from 'socket.io';

import {
    OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit, SubscribeMessage, WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';

import { AuthService } from './auth/auth.service';
import { ChatService } from './chat/chat.service';
import { ChatEntity } from './chat/entities/chat.entity';
import { EventEnum } from './chat/enums/event.enum';
import { ResponseModel } from './shared/models/response.model';
import { UserEntity } from './user/entities/user.entity';
import { RoleEnum } from './user/enums/role.enum';

@WebSocketGateway(Number(process.env.SOCKET_PORT))
export class AppGateway implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection {
  constructor(
    private readonly chatService: ChatService,
    private readonly authService: AuthService,
    private readonly redisService: RedisService,
  ) {}

  @WebSocketServer()
  server: Server

  public afterInit() {}

  public async handleConnection(client: Socket) {
    const token = client.handshake.query.token.split('Bearer ')[1]
    if (!token) client.disconnect()
    try {
      const user = await this.authService.validateToken(token)

      this.redisService.getClient().set(user.id, client.id)
      this.redisService.getClient().set(client.id, user.id)
      if (user.role == RoleEnum.USER) client.join('USERS')
      const unreadMessages = await this.chatService.getUnreadMessages(user.id)
      client.emit(EventEnum.CONNECT, new ResponseModel({ messages: unreadMessages }))
    } catch (error) {
      client.disconnect()
    }
  }

  public handleDisconnect(client: Socket) {
    console.log(client.id, ' disconnect')
    this.redisService.getClient().del(client.id)
  }

  /** CHAT */
  @SubscribeMessage(EventEnum.MESSAGE)
  async sendMessage(client: Socket, data: any) {
    const checkResult = checkInput(data, ['receiver_id'])
    if (!checkResult.status)
      return client.emit(
        EventEnum.MESSAGE,
        new ResponseModel({}, 400, checkResult.message.toString()),
      )
    const userId = await this.redisService.getClient().get(client.id)
    try {
      const sender = <UserEntity>{ id: userId }
      const receiver = <UserEntity>{ id: data.receiver_id }

      if (data.file) data.file = `raiquick/chats/` + data.file

      const chat = new ChatEntity({
        sender,
        receiver,
        message: data.message ? data.message : null,
        file: data.file ? data.file : null,
      })

      const receiverId = await this.redisService.getClient().get(data.receiver_id)
      client.emit(EventEnum.FILE, data.file)
      this.server.to(receiverId).emit(EventEnum.MESSAGE, new ResponseModel(chat))
    } catch (error) {
      client.emit(
        EventEnum.MESSAGE,
        new ResponseModel({}, 500, error.response ? error.response.message : 'internal error'),
      )
    }
  }
  @SubscribeMessage(EventEnum.SEEN)
  async seenMessage(client: Socket, data: any) {
    const checkResult = checkInput(data, ['sender_id'])
    if (!checkResult.status)
      return client.emit(EventEnum.SEEN, new ResponseModel({}, 400, checkResult.message.toString()))

    try {
      const userId = await this.redisService.getClient().get(client.id)
      const chats = await this.chatService.seenMessages(userId, data.sender_id)
      const senderId = await this.redisService.getClient().get(data.sender_id)
      this.server.to(senderId).emit(EventEnum.SEEN, new ResponseModel(chats))
    } catch (error) {
      client.emit(
        EventEnum.SEEN,
        new ResponseModel({}, 500, error.response ? error.response.message : 'internal error'),
      )
    }
  }
}
