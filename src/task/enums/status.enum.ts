export enum StatusEnum {
  NEW = 'NEW', //T
  WAITING_FOR_START = 'WAITING_TO_START', // منتظر شروع کاربر T,U
  WAITING_FOR_CONFIRMATION = 'WAITING_FOR_CONFIRMATION', //U
  CONFIRMED = 'CONFIRMED', // تایید شده
  IN_PROCESS = 'IN_PROCESS',
  // DONE = 'DONE',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
}
