export class ResponseModel {
  code: number = 200
  message: string = 'OK'

  data: any = {}
  meta: any = {}
  constructor(data: any, code?: number, message?: string, meta?: any) {
    this.data = data
    this.code = code
    this.message = message
    this.meta = meta
  }
}
