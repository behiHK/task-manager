import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IssueStatusEnum, TypeEnum } from '../enums/support.enum';

export class CreateSupportDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsNotEmpty()
  task_id: number

  @ApiProperty({
    enum: TypeEnum,
  })
  @IsNotEmpty()
  @IsEnum(TypeEnum)
  type: TypeEnum

  @ApiProperty()
  @IsNotEmpty()
  description: string
}

export class UpdateSupportDto {
  //for experts

  @ApiPropertyOptional()
  @IsOptional()
  answer: string

  @ApiPropertyOptional({
    type: [String],
  })
  @IsOptional()
  @IsArray()
  attachments: string[]

  @ApiPropertyOptional({
    enum: IssueStatusEnum,
  })
  @IsOptional()
  @IsEnum(IssueStatusEnum)
  status: IssueStatusEnum
}
