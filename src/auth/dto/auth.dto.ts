import { IsNotEmpty, Length, Matches } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @Length(11)
  @Matches(/^09\d{9}$/, { message: 'wrong number' })
  @ApiProperty()
  @IsNotEmpty()
  phone: string
}
export class VerifyDto extends LoginDto{
  @IsNotEmpty()
  @ApiProperty()
  code: string

}
