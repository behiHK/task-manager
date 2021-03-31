import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

import { PriorityEnum } from '../enums/priority.enum'
import { UserTaskStateEnum } from '../enums/state.enum'
import { StatusEnum } from '../enums/status.enum'

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  circumstance: string

  @ApiProperty()
  @IsNotEmpty()
  time: number

  @ApiProperty()
  @IsNotEmpty()
  price: number

  @ApiProperty({
    enum: PriorityEnum,
  })
  @IsNotEmpty()
  @IsEnum(PriorityEnum)
  priority: PriorityEnum

  @ApiProperty({
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  skills: number[]

  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  experts: string[]

  @ApiPropertyOptional()
  @IsArray()
  attachments: string[]
}

export class UpdateTaskDto {
  @ApiPropertyOptional()
  title: string

  @ApiPropertyOptional()
  description: string

  @ApiPropertyOptional()
  circumstance: string

  @ApiPropertyOptional()
  time: number

  @ApiPropertyOptional()
  price: number

  @ApiPropertyOptional({
    enum: PriorityEnum,
  })
  @IsOptional()
  @IsEnum(PriorityEnum)
  priority: PriorityEnum

  @ApiPropertyOptional({
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  skills: number[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  experts: string[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  attachments: string[]

  @ApiPropertyOptional({
    enum: StatusEnum,
  })
  @IsOptional()
  @IsEnum(StatusEnum)
  status: StatusEnum
}

export class AcceptTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  user_id: string

  @ApiProperty()
  @IsNotEmpty()
  task_id: number
}

export class UpdateTaskStatusDto {
  @ApiProperty({
    enum: UserTaskStateEnum,
  })
  @IsNotEmpty()
  @IsEnum(UserTaskStateEnum)
  state: UserTaskStateEnum

  @ApiProperty()
  @IsNotEmpty()
  task_id: number
}
