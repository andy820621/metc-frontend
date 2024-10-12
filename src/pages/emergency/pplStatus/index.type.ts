export enum FireStatus {
  TotalNumber, // 避難總人數
  NotReceived, // 未接收訊息
  NotCompleted, // 未避難完成
  Completed, // 避難完成
  NotThere, // 不在現場
  TotalReceived, // 已接收訊息
  Ask, // 請求協助
}

export enum FireAckStatus {
  NotCompleted, // 未避難完成
  Completed, // 避難完成
  NotThere, // 不在現場
  Ask, // 請求協助
}
