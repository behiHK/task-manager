import { DBErrorHandler } from 'src/shared/helpers/db-error-handler'
import { Repository } from 'typeorm'

import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { SupportEntity } from './entities/support.entity'

@Injectable()
export class SupportService {
  constructor(
    @InjectRepository(SupportEntity) private readonly supportRepository: Repository<SupportEntity>,
  ) {}

  async createSupport(support: SupportEntity) {
    try {
      return await this.supportRepository.save(support)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getSupports(page: number, per_page: number) {
    try {
      //TODO add filters
      const skip = (page - 1) * per_page
      const [array, total] = await this.supportRepository.findAndCount({ skip, take: per_page })
      return { array, total }
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async getSupport(id: number) {
    try {
      return await this.supportRepository.findOne(id)
    } catch (error) {
      DBErrorHandler(error)
    }
  }

  async updateSupport(support: SupportEntity) {
    try {
      return await this.supportRepository.update(support.id, support)
    } catch (error) {
      DBErrorHandler(error)
    }
  }
}
