import { FinanceModule } from 'src/finance/finance.module'
import { UserModule } from 'src/user/user.module'

import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config/dist'
import { JwtModule } from '@nestjs/jwt/dist/jwt.module'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { PassportModule } from '@nestjs/passport'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtGuard } from './guards/jwt.guard'
import { JwtStrategy } from './strategies/jwt.strategy'

@Module({
  imports: [
    ConfigModule.forRoot(),
    forwardRef(() => UserModule),
    forwardRef(() => FinanceModule),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRE_TIME },
    }),
    ClientsModule.register([
      {
        name: 'SMS_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBIT_URL],
          queue: 'sms',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [AuthService, JwtStrategy, JwtGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
