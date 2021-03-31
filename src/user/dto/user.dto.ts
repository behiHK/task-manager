import { IsArray, IsEmail, IsNotEmpty, IsOptional, Length, Matches } from 'class-validator';

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  first_name: string

  @ApiProperty()
  @IsNotEmpty()
  last_name: string

  @ApiProperty()
  @IsNotEmpty()
  @Length(11)
  @Matches(/^09\d{9}$/, { message: 'wrong number' })
  phone: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  //TODO add pattern
  national_code: string

  @ApiPropertyOptional()
  avatar: string

  @ApiProperty()
  @IsNotEmpty()
  sheba: string

  @ApiProperty({ type: [Number] })
  @IsNotEmpty()
  @IsArray()
  skills: number[]
}

export class PatchUserDto {
  @ApiProperty()
  @IsOptional()
  first_name: string

  @ApiProperty()
  @IsOptional()
  last_name: string

  @ApiProperty()
  @IsOptional()
  @Length(11)
  @Matches(/^09\d{9}$/, { message: 'wrong number' })
  phone: string

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsOptional()
  national_code: string

  @ApiProperty()
  @IsOptional()
  avatar: string

  @ApiProperty()
  @IsOptional()
  sheba: string

  @ApiProperty()
  @IsOptional()
  @IsArray()
  skills: number[]
}
