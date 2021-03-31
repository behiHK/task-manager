import { Injectable } from '@nestjs/common';

import { AppGateway } from './app.gateway';
import { EventEnum } from './chat/enums/event.enum';
import { TaskEntity } from './task/entities/task.entity';

@Injectable()
export class AppService {
  constructor(private readonly appGateway: AppGateway) {}

  async sendNewTask(task: TaskEntity) {
    this.appGateway.server.to('USERS').emit(EventEnum.NEW_TASK, task)
  }
}
