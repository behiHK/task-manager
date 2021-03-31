import { IsNotEmpty } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class CreateSkillDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string
}
