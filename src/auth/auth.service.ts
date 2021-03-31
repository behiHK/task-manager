import { RedisService } from 'nestjs-redis';

import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ClientProxy } from '@nestjs/microservices';

import { UserEntity } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly jwtService: JwtService,

    @Inject('SMS_SERVICE') private smsService: ClientProxy,
  ) {}

  redisClient = this.redisService.getClient()

  async sendVerificationCode(phone: string) {
    const code = JSON.parse(await this.redisClient.get('verify-' + phone))
    if (code) {
      const remain = code.discardedAt - new Date().getTime()
      if (remain >= 0)
        throw new BadRequestException(`Wait ${Math.trunc(remain / 1000)}s until next request`)
    }
    const verificationCode = Math.floor(Math.random() * (999999 - 100000 + 1) + 100000).toString()

    this.redisClient.set(
      'verify-' + phone,
      JSON.stringify({ code: verificationCode, discardedAt: new Date().getTime() + 20000 }),
      'EX',
      process.env.VERIFICATION_CODE_EXPIRE_TIME,
    )
    return verificationCode
    //  TODO send sms
  }

  async verifyCode(code: string, phone: string) {
    const savedCode = JSON.parse(await this.redisClient.get('verify-' + phone))
    if (savedCode && savedCode.code == code) return true
    else return false
  }

  async signJwt(user: UserEntity) {
    const { created_at, updated_at, deleted_at, ...payload } = user
    return this.jwtService.sign(payload)
  }

  async validateToken(token: string) {
    return await this.jwtService.verify(token)
  }

  async sendSms(phone: string, code: string) {
    return new Promise(async (resolve, reject) => {
      const result = await this.smsService
        .send('send-sms', {
          text: null,
          receivers: [phone],
          options: {
            templateId: 18128,
            templateParams: [
              {
                Parameter: 'VerificationCode',
                ParameterValue: `${code}`,
              },
            ],
          },
        })
        .toPromise()
      if (result.success) resolve(result)
      else {
        reject(result)
      }
    })
  }
}
