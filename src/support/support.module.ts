import { AuthModule } from 'src/auth/auth.module';

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SupportEntity } from './entities/support.entity';
import { SupportController } from './support.controller';
import { SupportService } from './support.service';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([SupportEntity])],
  controllers: [SupportController],
  providers: [SupportService],
})
export class SupportModule {}
