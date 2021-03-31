import { RedisModule } from 'nestjs-redis/dist/redis.module';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config/dist/config.module';
import { TypeOrmModule } from '@nestjs/typeorm/';

import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FinanceModule } from './finance/finance.module';
import { SupportModule } from './support/support.module';
import { TaskModule } from './task/task.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(),
    RedisModule.register({
      url: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
    }),
    AuthModule,
    UserModule,
    TaskModule,
    SupportModule,
    ChatModule,
    FinanceModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
  exports: [AppService],
})
export class AppModule {}
