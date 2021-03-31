import { DBErrorHandler } from 'src/shared/helpers/db-error-handler'
import { UserEntity } from 'src/user/entities/user.entity'
import { Repository } from 'typeorm'

import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { CancelTaskEntity } from './entities/cancel-task.entity'
import { SkillEntity } from './entities/skill.entity'
import { TaskEntity } from './entities/task.entity'
import { UserTaskEntity } from './entities/user-task.entity'
import { StatusEnum } from './enums/status.enum'

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(SkillEntity)
    private readonly skillRepository: Repository<SkillEntity>,

    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserTaskEntity)
    private readonly userTaskRepository: Repository<UserTaskEntity>,
  ) {}

  async getSkill() {
    try {
      return await this.skillRepository.find()
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getTask(id: number) {
    try {
      return await this.taskRepository.findOne(id)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getTasks(
    page: number,
    per_page: number,
    price: number,
    time: number,
    skills: number[],
    status: StatusEnum,
  ) {
    try {
      const qb = this.taskRepository
        .createQueryBuilder('tasks')
        .innerJoinAndSelect('tasks.skills', 'skill')
      if (skills && skills.length > 0) qb.where('skill.id IN (:...skills)', { skills })
      if (price) qb.andWhere('tasks.price >= :price', { price })
      if (status) qb.andWhere('tasks.status = :status', { status })
      if (time) qb.andWhere(`tasks.time >= '${time}'`)

      const [array, total] = await qb
        .skip((page - 1) * per_page)
        .take(per_page)
        .getManyAndCount()

      return { array, total }
    } catch (error) {
      DBErrorHandler(error)
    }
  }
  async createSkill(skill: SkillEntity) {
    try {
      return await this.skillRepository.save(skill)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async createTask(task: TaskEntity) {
    try {
      return await this.taskRepository.save(task)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async updateTask(task: TaskEntity) {
    try {
      const oldTask = await this.getTask(task.id)
      Object.keys(task).map((key) => {
        oldTask[key] = task[key]
      })
      return await this.taskRepository.save(oldTask)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async requestTask(userTask: UserTaskEntity) {
    try {
      return await this.userTaskRepository.save(userTask)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getRequests() {
    try {
      const [array, total] = await this.userTaskRepository
        .createQueryBuilder('ut')
        .innerJoinAndSelect('ut.user', 'user')
        .innerJoinAndSelect('ut.task', 'task')
        .where('ut.status = :status', { status: StatusEnum.WAITING_FOR_CONFIRMATION })
        .getManyAndCount()
      return { array, total }
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async acceptTask(userId: string, taskId: number) {
    try {
      await this.userTaskRepository
        .createQueryBuilder('user_tasks')
        .innerJoinAndSelect('user_tasks.user', 'user')
        .innerJoinAndSelect('user_tasks.task', 'task')
        .update()
        .set({ status: StatusEnum.REJECTED })
        .where('user.id  != :userId', { userId })
        .andWhere('task.id = :taskId', { taskId })
        .andWhere('user_tasks.status = :status', { status: StatusEnum.WAITING_FOR_CONFIRMATION })
        .execute()

      await this.userTaskRepository
        .createQueryBuilder('user_tasks')
        .innerJoinAndSelect('user_tasks.user', 'user')
        .innerJoinAndSelect('user_tasks.task', 'task')
        .update()
        .set({ status: StatusEnum.WAITING_FOR_START })
        .where('user.id  = :userId', { userId })
        .andWhere('task.id = :taskId', { taskId })
        .execute()
      return await this.taskRepository.update(taskId, {
        status: StatusEnum.WAITING_FOR_START,
        user: <UserEntity>{ id: userId },
      })
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async confirmTask(userId: string, taskId: number) {
    try {
      await this.userTaskRepository.update(
        { user: { id: userId }, task: { id: taskId } },
        { status: StatusEnum.CONFIRMED },
      )
      return await this.taskRepository.update(taskId, { status: StatusEnum.CONFIRMED })
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async updateTaskStatus(userId: string, taskId: number, status: StatusEnum) {
    try {
      await this.userTaskRepository
        .createQueryBuilder('user_tasks')
        .innerJoinAndSelect('user_tasks.user', 'user')
        .innerJoinAndSelect('user_tasks.task', 'task')
        .update()
        .set(
          status == StatusEnum.IN_PROCESS
            ? { status, started_at: new Date() }
            : status == StatusEnum.WAITING_FOR_CONFIRMATION
            ? { status, finished_at: new Date() }
            : { status },
        )
        .where('user.id  = :userId', { userId })
        .andWhere('task.id = :taskId', { taskId })
        .andWhere(`user_tasks.status != :rejected`, { rejected: StatusEnum.REJECTED })
        .execute()
      return await this.taskRepository.update(taskId, {
        status,
      })
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async cancelTask(userId: string, taskId: number) {
    const task = await this.getTask(taskId)
    const userTask = await this.getUserTask(<UserTaskEntity>{
      user: <UserEntity>{ id: userId },
      task,
    })
    console.log(task.status)
    console.log(userTask.status)

    if (task.status != StatusEnum.IN_PROCESS || userTask.status != StatusEnum.IN_PROCESS)
      throw new BadRequestException('you cannot cancel the task')
    await this.updateTaskStatus(userId, taskId, StatusEnum.CANCELED)
    const cancelTask = new CancelTaskEntity({
      user: <UserEntity>{ id: userId },
      task,
    })
    try {
      await cancelTask.save()
      return 'canceled'
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async doneTask(userId: string, taskId: number) {
    const user = <UserEntity>{ id: userId }
    const task = await this.getTask(taskId)
    const userTask = await this.getUserTask(<UserTaskEntity>{
      user,
      task,
      status: StatusEnum.IN_PROCESS,
    })
    if (!userTask || task.status != StatusEnum.IN_PROCESS)
      throw new BadRequestException('there is no task in process!')

    await this.updateTaskStatus(userId, taskId, StatusEnum.WAITING_FOR_CONFIRMATION)

    const spentTime =
      userTask.started_at.getTime() + task.time * 3600000 - userTask.finished_at.getTime()
    if (spentTime < 0) {
      //over time ...
      console.log('you were not on time')
      return 'you were not on time'
    } else {
      console.log('congratulation! you did it!')
      return 'congratulation! you did it!'
    }
  }

  async startTask(userId: string, taskId: number) {
    //check if user is confirmed
    const task = await this.getTask(taskId)
    const userTask = await this.getUserTask(<UserTaskEntity>{ user: { id: userId }, task })
    if (
      userTask.status != StatusEnum.WAITING_FOR_START ||
      task.status != StatusEnum.WAITING_FOR_START
    )
      throw new BadRequestException('you cannot start it!')

    await this.updateTaskStatus(userId, taskId, StatusEnum.IN_PROCESS)
    return 'started'
  }

  async getUserTask(userTask: UserTaskEntity) {
    try {
      return await this.userTaskRepository.findOne(userTask)
    } catch (error) {
      DBErrorHandler(error)
    }
  }
}
