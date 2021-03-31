import { FinanceService } from 'src/finance/finance.service'
import { ResponseModel } from 'src/shared/models/response.model'
import { SkillEntity } from 'src/task/entities/skill.entity'
import { CreateUserDto } from 'src/user/dto/user.dto'
import { UserEntity } from 'src/user/entities/user.entity'
import { UserService } from 'src/user/user.service'

import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { LoginDto, VerifyDto } from './dto/auth.dto'

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly financeService: FinanceService,
  ) {}

  @Post('register')
  async register(@Body() dto: CreateUserDto) {
    let { skills, ...rest }: any = dto
    const user = new UserEntity(rest)
    if (skills) user.skills = skills.map((id: number) => <SkillEntity>{ id })
    const result = await this.userService.createUser(user)

    this.financeService.createAccount(user)

    const token = await this.authService.signJwt(user)
    return new ResponseModel({ user: result, token }, 201)
  }

  @Post('login')
  async sendVerificationCode(@Body() loginDto: LoginDto) {
    const user = await this.userService.getUser(<UserEntity>{ phone: loginDto.phone })
    if (!user) throw new UnauthorizedException('register first')

    const code = await this.authService.sendVerificationCode(loginDto.phone)
    await this.authService.sendSms(loginDto.phone, code)
    // return new ResponseModel(code)
  }

  @Post('verify')
  async verifyCode(@Body() verifyDto: VerifyDto) {
    const verified = await this.authService.verifyCode(verifyDto.code, verifyDto.phone)
    //TODO check error response
    if (!verified) throw new UnauthorizedException()

    const user = await this.userService.getUser(<UserEntity>{ phone: verifyDto.phone })
    if (!user) throw new UnauthorizedException('register first')

    const token = await this.authService.signJwt(user)
    return new ResponseModel({ user, token })
  }
}
