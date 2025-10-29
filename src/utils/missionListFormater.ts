import type { GroupTaskViewModel } from "src/api/emergencyMission";

export function setStatus(row: GroupTaskViewModel) {
  let status = "待接收";
  if (row.receiveUser) status = "已接收";
  if (row.needSupport) status = "請求支援";
  if (row.isCancelled) status = "已取消";
  if (row.isCompleted) status = "已完成";
  return status;
}
