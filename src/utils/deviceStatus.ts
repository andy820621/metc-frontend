import { MaintainViewModel } from "src/api/maintain";

export enum DeviceConditions {
  Fault, /// 故障
  Normal, /// 正常(已保養)
  Maintain, /// 待保養
  Maintaining, /// 保養中
}
// 設備狀況轉成中文
export function deviceStatus(condition: number | undefined) {
  if (condition === undefined || condition === null) return "";

  switch (condition) {
    case DeviceConditions.Fault:
      return "故障";
    case DeviceConditions.Normal:
      return "正常";
    case DeviceConditions.Maintain:
      return "待保養";
    case DeviceConditions.Maintaining:
      return "保養中";
  }
}

export function maintainStatus(data: MaintainViewModel) {
  if (data) {
    if (data.completionDate) return "已保養";
    else if (data.entryDate) return "保養中";
    else if (data.contactDate) return "已聯絡";
    return "";
  }
  return "";
}

export const deviceConditionOptions = Object.keys(DeviceConditions)
  .filter((key) => isNaN(Number(key)))
  .map((key) => ({
    label: deviceStatus(
      DeviceConditions[key as keyof typeof DeviceConditions]
    ) as string,
    value: DeviceConditions[key as keyof typeof DeviceConditions] as number,
  }));
