import { DBErrorHandler } from 'src/shared/helpers/db-error-handler'
import { Repository } from 'typeorm'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { UserEntity } from './entities/user.entity'

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity) private readonly userRepository: Repository<UserEntity>,
  ) {}

  async getUsers() {
    try {
      return await this.userRepository.find()
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getUser(user: UserEntity) {
    try {
      return await this.userRepository.findOne(user)
    } catch (error) {
      DBErrorHandler(error)
    }
  }
  async createUser(user: UserEntity) {
    try {
      const path = `raiquick/${user.id}/avatar/${new Date().getTime()}/`
      user.avatar = path + user.avatar
      return await this.userRepository.save(user)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async updateUser(user: UserEntity) {
    try {
      return await this.userRepository.update(user.id, user)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async deleteUser(user: UserEntity) {
    try {
      return await this.userRepository.softDelete(user.id)
    } catch (error) {
      DBErrorHandler(error)
    }
  }
}
