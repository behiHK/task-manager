import { Response } from 'express';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { ResponseModel } from 'src/shared/models/response.model';

import { Body, Controller, Get, Patch, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { ConfirmWithdrawRequestDto, CreateWithdrawRequestDto } from './dto/finance.dto';
import { TransactionTypeEnum } from './enums/transaction-type.enum';
import { FinanceService } from './finance.service';

@ApiTags('finance')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get the excel of withdraw requests' })
  @UseGuards(JwtGuard)
  @Get()
  async getWithdrawRequests(@Res() res: Response) {
    //TODO check permission by permission guard
    const result = await this.financeService.getTransactionsExcel()
    res.send(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get account balance' })
  @UseGuards(JwtGuard)
  @Get('wallet')
  async getAccountBalance(@Req() req: any) {
    const result = await this.financeService.getAccountBalance(req.user.id)
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'get user transactions' })
  @ApiQuery({ required: false, name: 'date' })
  @ApiQuery({ required: false, name: 'type', enum: TransactionTypeEnum })
  @UseGuards(JwtGuard)
  @Get('transactions')
  async getUserTransactions(
    @Req() req: any,
    @Query('type') type: TransactionTypeEnum,
    @Query('date') date: string,
  ) {
    const result = await this.financeService.getUserTransactions(req.user.id, type, date)
    return new ResponseModel(result)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'create withdraw request' })
  @UseGuards(JwtGuard)
  @Post()
  async createWithdrawRequest(@Body() dto: CreateWithdrawRequestDto, @Req() req: any) {
    const userAccount = await this.financeService.getAccount({
      userId: req.user.id,
    })
    const result = await this.financeService.withdrawRequest(userAccount, dto.value)
    return new ResponseModel(result, 201)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'confirm withdraw request' })
  @UseGuards(JwtGuard)
  @Patch()
  async confirmWithdrawRequest(@Body() dto: ConfirmWithdrawRequestDto) {
    //TODO check user permission
    const userAccount = await this.financeService.getAccount({
      userId: dto.user_id,
    })
    const result = await this.financeService.withdrawConfirm(userAccount, dto.tracking_id)
    return new ResponseModel(result)
  }
}
