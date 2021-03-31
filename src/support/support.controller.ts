import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ResponseModel } from 'src/shared/models/response.model';
import { TaskEntity } from 'src/task/entities/task.entity';

import {
    BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UseGuards
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { CreateSupportDto, UpdateSupportDto } from './dto/support.dto';
import { SupportEntity } from './entities/support.entity';
import { IssueStatusEnum } from './enums/support.enum';
import { SupportService } from './support.service';

@ApiTags('support')
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'create support' })
  @UseGuards(JwtGuard)
  @Post()
  async createSupport(@Body() dto: CreateSupportDto) {
    let { task_id, ...data } = dto
    const support = <SupportEntity>data
    support.task = <TaskEntity>{ id: task_id }
    const result = await this.supportService.createSupport(support)
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'update support' })
  @UseGuards(JwtGuard)
  @Patch(':id')
  async updateSupport(@Param('id') id: number, @Body() dto: UpdateSupportDto) {
    const support = <SupportEntity>{ id, ...dto }

    const currentSupport = await this.supportService.getSupport(id)
    if (currentSupport && currentSupport.status != IssueStatusEnum.OPEN)
      throw new BadRequestException('issue is closed!')
    const result = await this.supportService.updateSupport(support)
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get supports' })
  @ApiQuery({ required: false, name: 'page' })
  @ApiQuery({ required: false, name: 'per_page' })
  @UseGuards(JwtGuard)
  @Get()
  async getSupports(@Query('page') page: number, @Query('per_page') per_page: number) {
    if (!page) page = 1
    if (!per_page) per_page = 10
    const result = await this.supportService.getSupports(page, per_page)
    return new ResponseModel(result.array, 200, 'OK', { total: result.total })
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get support by id' })
  @UseGuards(JwtGuard)
  @Get(':id')
  async getSupport(@Param('id') id: number) {
    const result = await this.supportService.getSupport(id)
    return new ResponseModel(result)
  }
}
