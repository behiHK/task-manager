import { AppService } from 'src/app.service'
import { JwtGuard } from 'src/auth/guards/jwt.guard'
import { FinanceService } from 'src/finance/finance.service'
import { ResponseModel } from 'src/shared/models/response.model'
import { UserEntity } from 'src/user/entities/user.entity'

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'

import { CreateSkillDto } from './dto/skill.dto'
import { AcceptTaskDto, CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto } from './dto/task.dto'
import { SkillEntity } from './entities/skill.entity'
import { TaskEntity } from './entities/task.entity'
import { UserTaskEntity } from './entities/user-task.entity'
import { UserTaskStateEnum } from './enums/state.enum'
import { StatusEnum } from './enums/status.enum'
import { TaskService } from './task.service'

@ApiTags('task')
@Controller('task')
export class TaskController {
  constructor(
    private readonly taskService: TaskService,
    private readonly financeService: FinanceService,
    private readonly appService: AppService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'create a task' })
  @UseGuards(JwtGuard)
  @Post()
  async createTask(@Body() dto: CreateTaskDto) {
    //TODO check permissions?!
    let { skills, experts, ...data }: any = dto
    const task: TaskEntity = data
    task.skills = skills.map((ex: number) => <SkillEntity>{ id: ex })
    task.experts = experts.map((ex: string) => <UserEntity>{ id: ex })

    const result = await this.taskService.createTask(task)

    await this.appService.sendNewTask(result)
    return new ResponseModel(result, 201)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all tasks' })
  //TODO just minimum price is considered
  @ApiQuery({ required: false, name: 'price' })
  @ApiQuery({ required: false, name: 'skills', isArray: true, type: 'number' })
  @ApiQuery({ required: false, name: 'time' })
  @ApiQuery({ required: false, name: 'status', enum: StatusEnum })
  @ApiQuery({ required: false, name: 'page' })
  @ApiQuery({ required: false, name: 'per_page' })
  @UseGuards(JwtGuard)
  @Get()
  //TODO add filters
  async getTasks(
    @Query('page') page: number,
    @Query('per_page') per_page: number,
    @Query('price') price: number,
    @Query('status') status: StatusEnum,
    @Query('time') time: number,
    @Query('skills') skills: number[],
  ) {
    if (!page) page = 1
    if (!per_page) per_page = 10

    if (skills && typeof skills == 'string') skills = [skills]
    const result = await this.taskService.getTasks(page, per_page, price, time, skills, status)

    return new ResponseModel(result.array, 200, 'OK', { total: result.total })
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'request for a task' })
  @UseGuards(JwtGuard)
  @Get('request/:id')
  async requestForTask(@Param('id') id: number, @Req() req: any) {
    const user = <UserEntity>{ id: req.user.id }
    const task = <TaskEntity>{ id }

    const existRequest = await this.taskService.getUserTask(<UserTaskEntity>{
      user,
      task,
      status: StatusEnum.WAITING_FOR_CONFIRMATION,
    })
    if (existRequest) return new ResponseModel({}, 400, 'request already exists!')

    const userTask = <UserTaskEntity>{ user, task }
    const result = await this.taskService.requestTask(userTask)
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get requests' })
  @UseGuards(JwtGuard)
  @Get('requests')
  async getRequests() {
    const result = await this.taskService.getRequests()
    //TODO clean responses
    return new ResponseModel(result.array, 200, 'OK', { total: result.total })
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get a task' })
  @UseGuards(JwtGuard)
  @Get(':id')
  async getTask(@Param('id') id: number) {
    const result = await this.taskService.getTask(id)
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'accept a task' })
  @UseGuards(JwtGuard)
  @Patch('accept')
  async acceptTask(@Body() dto: AcceptTaskDto) {
    //TODO check permission of admin user
    const result = await this.taskService.acceptTask(dto.user_id, dto.task_id)
    return new ResponseModel(result)
  }

  //for admin
  @ApiBearerAuth()
  @ApiOperation({ summary: 'confirm a task' })
  @UseGuards(JwtGuard)
  @Patch('confirm')
  async confirmTask(@Body() dto: AcceptTaskDto) {
    //TODO check permission of admin user
    await this.taskService.confirmTask(dto.user_id, dto.task_id)

    const task = await this.taskService.getTask(dto.task_id)

    const account = await this.financeService.getAccount({ userId: dto.user_id })
    //TODO calculate value
    await this.financeService.settleMoney(account, task.price, task)
    return new ResponseModel({})
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'update task status' })
  @UseGuards(JwtGuard)
  @Patch('status')
  async updateTaskStatus(@Body() dto: UpdateTaskStatusDto, @Req() req: any) {
    //for user
    //TODO check user access to task
    let result: any
    switch (dto.state) {
      case UserTaskStateEnum.START:
        result = await this.taskService.startTask(req.user.id, dto.task_id)
        break
      case UserTaskStateEnum.DONE:
        result = await this.taskService.doneTask(req.user.id, dto.task_id)
        break
      case UserTaskStateEnum.CANCEL:
        result = await this.taskService.cancelTask(req.user.id, dto.task_id)
        break
      default:
        throw new BadRequestException()
    }

    return new ResponseModel({}, 200, result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'update a task' })
  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateTask(@Param('id') id: number, @Body() dto: UpdateTaskDto) {
    //TODO check permissions?!
    let { skills, experts, ...data }: any = dto
    const task: TaskEntity = data
    task.id = id
    if (skills) task.skills = skills.map((skillId: number) => <SkillEntity>{ id: skillId })
    if (experts) task.experts = experts.map((ex: string) => <UserEntity>{ id: ex })

    const result = await this.taskService.updateTask(task)
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get all skills' })
  @UseGuards(JwtGuard)
  @Get('skills')
  async getSkill() {
    const result = await this.taskService.getSkill()
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'create skill' })
  @UseGuards(JwtGuard)
  @Post('skill')
  async createSkill(@Body() dto: CreateSkillDto) {
    const result = await this.taskService.createSkill(<SkillEntity>dto)
    return new ResponseModel(result)
  }
}
