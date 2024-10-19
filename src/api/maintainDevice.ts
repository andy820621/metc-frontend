import { req } from "boot/axios";
import type { pagination } from "./api.type";
import type { DeviceViewModel } from "./device";
import type { RoutineViewModel } from "./routine";
import type { MaintainViewModel } from "./maintain";
import type { MaintainRecordViewModel } from "./maintainRecord";
import { date } from "quasar";

interface IncompleteViewModel {
  id?: number;
  routine: RoutineViewModel;
  item: string;
  content: string;
  // contentBuilder?: string; // 需確認這個值是幹嘛的
}
export interface DeviceMaintainViewModel {
  id?: number;
  maintainId: number;
  incomplete?: IncompleteViewModel;
  device?: DeviceViewModel;
  isDone: boolean;
  maintainRecordDisplays: MaintainRecordViewModel;
  maintain?: MaintainViewModel; // 前端拿 maintainId 打 api 獲取來的
}
// 維保細項 config
export const maintainDeviceTableConfig = [
  {
    label: "是否完成",
    name: "isDone",
    field: "isDone",
    align: "left",
    formType: "checkbox",
    message: "請選擇 是否完成",
    isTable: true,
    isDialogForm: false,
    required: false,
    disable: false,
    isTableSlot: true,
  },
  {
    label: "設備名稱",
    name: "device",
    field: (row: { device: DeviceViewModel }) => row.device?.name,
    align: "left",
    formType: "selectString",
    message: "請選擇 設備名稱",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "缺失內容",
    name: "incomplete",
    field: (row: { incomplete: IncompleteViewModel }) =>
      row.incomplete
        ? `【${row.incomplete?.item}】 ${row.incomplete?.content}`
        : "",
    align: "left",
    formType: "selectString",
    message: "請選擇 缺失內容",
    isTable: true,
    isDialogForm: true,
    required: true,
    disable: true,
  },
  {
    label: "事件處理紀錄",
    name: "maintainRecordDisplays",
    field: (row: { maintainRecordDisplays: MaintainRecordViewModel[] }) =>
      row.maintainRecordDisplays?.length
        ? row.maintainRecordDisplays
            .map((item) => {
              return `${date.formatDate(
                new Date(item.creationDate),
                "YYYY-MM-DD HH:mm:ss"
              )}   ${item.message}`;
            })
            .join("\n")
        : "",
    align: "left",
    formType: "selectString",
    message: "請選擇 事件處理紀錄",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
];
const MaintainDevice = {
  // 新增設備維修保養(維保細項)
  apiPostData(payload: DeviceMaintainViewModel[]) {
    return req("post", "/Maintain/device", payload);
  },
  // 修改設備維修保養(維保細項)
  apiPatchData(payload: DeviceMaintainViewModel[]) {
    return req("patch", "/Maintain/device", payload);
  },
  // 查詢設備維修保養(維保細項)
  apiGetTableData(pagination: pagination & { maintainId: number }) {
    return req("get", "/Maintain/device", pagination);
  },
  // 刪除設備維修保養(維保細項)
  apiDeleteData(payload: number[]) {
    return req("delete", "/Maintain/device", payload);
  },
};

export default MaintainDevice;
