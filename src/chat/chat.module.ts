import { AuthModule } from 'src/auth/auth.module';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatEntity } from './entities/chat.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([ChatEntity]), ConfigModule.forRoot()],
  controllers: [ChatController],
  providers: [ChatService],

  exports: [ChatService],
})
export class ChatModule {}
