import { req } from "boot/axios";
import type { pagination } from "./api.type";
import type { UserViewModel } from "./accountSetting";
import type { DeviceMaintainViewModel } from "./maintainDevice";
import { date } from "quasar";

export interface MaintainRecordViewModel {
  id?: number;
  deviceMaintainId: DeviceMaintainViewModel;
  user: UserViewModel;
  message?: string;
  isDisplay: boolean;
  creationDate: Date;
}
// 事件處理紀錄 config
export const maintainRecordTableConfig = [
  {
    label: "顯示狀態",
    name: "isDisplay",
    field: "isDisplay",
    align: "left",
    formType: "toggle",
    message: "請選擇 總表顯示",
    isTable: true,
    isDialogForm: true,
    required: false,
    isTableSlot: true,
  },
  {
    label: "紀錄時間",
    name: "creationDate",
    field: (row: MaintainRecordViewModel) =>
      date.formatDate(new Date(row.creationDate), "YYYY-MM-DD HH:mm:ss"),
    align: "left",
    formType: "inputString",
    message: "請選擇 紀錄時間",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
  {
    label: "紀錄內容",
    name: "message",
    field: "message",
    align: "left",
    formType: "textArea",
    message: "請選擇 紀錄",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "紀錄人",
    name: "user",
    field: (row: MaintainRecordViewModel) => row.user.fullname,
    align: "left",
    formType: "selectString",
    message: "請選擇 紀錄人",
    isTable: true,
    isDialogForm: true,
    required: false,
    disable: true,
    optionLabel: (row: UserViewModel) => row.fullname,
  },
];
const MaintainRecord = {
  // 新增事件處理紀錄
  apiPostData(payload: MaintainRecordViewModel[]) {
    return req("post", "/Maintain/record", payload);
  },
  // 修改事件處理紀錄
  apiPatchData(payload: MaintainRecordViewModel[]) {
    return req("patch", "/Maintain/record", payload);
  },
  // 查詢事件處理紀錄
  apiGetData(pagination: pagination & { deviceMaintainId: number }) {
    return req("get", "/Maintain/record", pagination);
  },
  // 刪除事件處理紀錄
  apiDeleteData(payload: number[]) {
    return req("delete", "/Maintain/record", payload);
  },
};

export default MaintainRecord;
