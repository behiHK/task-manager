import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  if (process.env.NODE_ENV == 'development') {
    const options = new DocumentBuilder()
      .setTitle('Raiquick')
      .setDescription('Raiquick Backend')
      .setVersion('0.0.1')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('/docs', app, document)
  }

  await app.listen(process.env.SERVICE_PORT, () => {
    console.log(
      `server is listening on ${process.env.SERVICE_HOST}:${process.env.SERVICE_PORT}/docs`,
    )
  })
}
bootstrap()
