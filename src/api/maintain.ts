import { req } from "boot/axios";
import type { ApiResponse, ApiRowsResponse, pagination } from "./api.type";
import type { BuildingViewModel } from "./building";
import type { ProviderViewModel } from "./supplierData";
import type { DeviceMaintainViewModel } from "./maintainDevice";

import type { DeviceTypeViewModel } from "./deviceType";
import { useBuildingStore } from "src/stores/building.js";
import { date } from "quasar";

const buildingStore = useBuildingStore();

export enum MaintainTypes {
  //  維護
  Maintain,
  // 故障
  Fault,
}

const MaintainTypesOptions = Object.keys(MaintainTypes)
  .filter((key) => isNaN(Number(key)))
  .map((key) => ({
    label: key === "Maintain" ? "保養單" : "維修單",
    value: MaintainTypes[key as keyof typeof MaintainTypes] as number,
  }));

export interface MaintainViewModel {
  id?: number;
  building: BuildingViewModel;
  deviceType: DeviceTypeViewModel;
  type: MaintainTypes;
  name: string;
  remark?: string;
  frontCoverFileId?: number;
  frontCoverFilePath?: string;
  isEmailSent: boolean;
  contactDate?: Date;
  entryDate?: Date;
  completionDate?: Date;
  creationDate: Date;
  providers: ProviderViewModel[];
  deviceMaintains: DeviceMaintainViewModel[];
}

// 維保大項 config
export const maintainListTableConfig = [
  {
    label: "建立時間",
    name: "creationDate",
    field: (row: MaintainViewModel) =>
      date.formatDate(row.creationDate, "YYYY-MM-DD"),
    func: (row: MaintainViewModel["creationDate"]) =>
      date.formatDate(row, "YYYY-MM-DD"),
    align: "left",
    formType: "date",
    message: "請選擇 建立時間",
    isTable: true,
    isDialogForm: false,
    required: false,
    // 進階搜尋用
    searchTitle: "建立時間",
    searchType: "date",
    searchOption: { startVal: "CreationDate", endVal: "CreationDate" },
  },
  {
    label: "狀態",
    name: "completionDate",
    field: (row: MaintainViewModel) =>
      row.completionDate ? "已完成" : "未完成",
    align: "left",
    formType: "inputString",
    message: "請選擇 狀態",
    isTable: true,
    isDialogForm: false,
    required: false,
    // 進階搜尋用
    searchTitle: "狀態",
    searchType: "singleSelect",
    searchOption: {
      val: "CompletionDate",
      options: [
        {
          label: "未完成",
          value: true,
        },
        {
          label: "已完成",
          value: false,
        },
      ],
    },
  },
  {
    label: "類型",
    name: "type",
    field: (row: MaintainViewModel) =>
      row.type === MaintainTypes.Maintain ? "保養單" : "維修單",
    func: (row: MaintainViewModel["type"]) =>
      row === MaintainTypes.Maintain ? "保養單" : "維修單",
    align: "left",
    formType: "inputString",
    message: "請選擇 類型",
    isTable: true,
    isDialogForm: false,
    required: false,
    // 進階搜尋用
    searchTitle: "類型",
    searchType: "singleSelect",
    searchOption: {
      val: "Type",
      options: MaintainTypesOptions,
    },
  },
  {
    label: "維保單名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 維保單名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "維保單名稱", val: "Name", isDefault: true },
  },
  {
    label: "協助廠商",
    name: "providers",
    field: (row: { deviceMaintains: DeviceMaintainViewModel[] }) => {
      return row.deviceMaintains?.length
        ? row.deviceMaintains
            .map((p) => p.device?.maintainVendor?.name)
            .filter((value, index, self) => self.indexOf(value) === index)
            .filter((item) => item)
            .join("、")
        : "";
    },
    func: (row: MaintainViewModel["providers"]) =>
      row.map((item) => item.name).join("、"),
    align: "left",
    formType: "selectMany",
    message: "請選擇 協助廠商",
    isTable: true,
    isDialogForm: true,
    required: true,
    disable: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "協助廠商", val: "ProviderName" },
  },
  {
    label: "聯絡日期",
    name: "contactDate",
    field: "contactDate",
    func: (row: MaintainViewModel["contactDate"]) =>
      date.formatDate(row, "YYYY-MM-DD"),
    align: "left",
    formType: "date",
    message: "請選擇 聯絡日期",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "進場日期",
    name: "entryDate",
    field: "entryDate",
    func: (row: MaintainViewModel["entryDate"]) =>
      date.formatDate(row, "YYYY-MM-DD"),
    align: "left",
    formType: "date",
    message: "請選擇 進場日期",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "完成日期",
    name: "completionDate",
    field: "completionDate",
    func: (row: MaintainViewModel["completionDate"]) =>
      date.formatDate(row, "YYYY-MM-DD"),
    align: "left",
    formType: "date",
    message: "請選擇 完成日期",
    isTable: false,
    isDialogForm: true,
    required: false,
    showHint:
      "提示:完成日期一旦填寫並儲存後，並不能刪除，只能進行日期編修，請二次確認該單完成後再填寫。",
  },
  {
    label: "完成度",
    name: "completePercent",
    field: "completePercent",
    align: "left",
    formType: "progressPercent",
    message: "請選擇 完成度",
    isTable: true,
    isDialogForm: true,
    required: true,
    isTableSlot: true,
    isDialogConfig: false,
  },
  {
    label: "備註",
    name: "remark",
    field: "remark",
    align: "left",
    formType: "textArea",
    message: "請輸入 備註",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
];
const Maintain = {
  // 新增維修保養(維保大項)
  apiPostData(payload: MaintainViewModel[]) {
    return req("post", "/Maintain", payload);
  },
  // 修改維修保養(維保大項)
  apiPatchData(payload: MaintainViewModel[]) {
    return req("patch", "/Maintain", payload);
  },
  // 查詢維修保養(維保大項)
  apiGetData(pagination: pagination & { buildingId: number }) {
    return req("get", "/Maintain", pagination);
  },
  // 刪除維修保養(維保大項)
  apiDeleteData(payload: number[]) {
    return req("delete", "/Maintain", payload);
  },
  // 設定封面
  apiSetCover(payload: { path: string; id: number; }) {
    const { id, path } = payload;
    return req<ApiResponse<number>>("patch", `/Maintain/${id}/frontcover?path=${path}`);
  },

  // 取得需要保養提醒的設備
  apiGetMaintainDevices() {
    return req("post", `/Device/maintains?buildingId=${buildingStore.Bid}`);
  },
  // 取得需要故障提醒的設備
  apiGetFaultyDevices() {
    return req("post", `/Device/faulties?buildingId=${buildingStore.Bid}`);
  },

  // 設備維保紀錄查詢
  apiGetTableData(payload: pagination & { deviceId: number }) {
    return req<ApiRowsResponse<DeviceMaintainViewModel[]>>(
      "get",
      "/Maintain/bydevice",
      payload
    );
  },
  // 讀取該 id 的維保單
  apiGetMaintainById(id: number) {
    return req<ApiResponse<MaintainViewModel>>("get", `/Maintain/${id}`);
  },
};

export default Maintain;
