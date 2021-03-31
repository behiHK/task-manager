import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateWithdrawRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  value: number
}

export class ConfirmWithdrawRequestDto {
  @ApiProperty()
  @IsNotEmpty()
  tracking_id: string

  @ApiProperty()
  @IsNotEmpty()
  user_id: string
}
