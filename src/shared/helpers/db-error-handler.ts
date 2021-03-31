import { InternalServerErrorException } from '@nestjs/common';

export function DBErrorHandler(error: any) {
  console.log(error)
  //TODO handle error message and code
throw new InternalServerErrorException()
}
