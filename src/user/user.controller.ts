import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { FinanceService } from 'src/finance/finance.service'
import { ResponseModel } from 'src/shared/models/response.model'
import { SkillEntity } from 'src/task/entities/skill.entity'

import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { CreateUserDto, PatchUserDto } from './dto/user.dto'
import { UserEntity } from './entities/user.entity'
import { UserService } from './user.service'

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly financeService: FinanceService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get users' })
  @UseGuards(JwtGuard)
  @Get()
  async getUsers() {
    const result = await this.userService.getUsers()
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get user by id' })
  @UseGuards(JwtGuard)
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const result = await this.userService.getUser(<UserEntity>{ id })
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'create user' })
  @UseGuards(JwtGuard)
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    let { skills, ...userDto } = dto
    const user = <UserEntity>userDto
    user.skills = skills.map((ex) => <SkillEntity>{ id: ex })
    const result = await this.userService.createUser(user)

    this.financeService.createAccount(user)

    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'update user' })
  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateUser(@Param('id') id: string, @Body() dto: PatchUserDto) {
    let { skills, ...userDto } = dto
    const user = <UserEntity>{ id, ...userDto }
    if (user.skills) user.skills = skills.map((ex) => <SkillEntity>{ id: ex })

    const result = await this.userService.updateUser(user)
    return new ResponseModel(result)
  }
}
