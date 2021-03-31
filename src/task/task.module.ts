import { AppModule } from 'src/app.module';
import { AuthModule } from 'src/auth/auth.module';
import { FinanceModule } from 'src/finance/finance.module';

import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SkillEntity } from './entities/skill.entity';
import { TaskEntity } from './entities/task.entity';
import { UserTaskEntity } from './entities/user-task.entity';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';

@Module({
  imports: [
    AuthModule,
    FinanceModule,
    forwardRef(() => AppModule),
    TypeOrmModule.forFeature([SkillEntity, TaskEntity, UserTaskEntity]),
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
