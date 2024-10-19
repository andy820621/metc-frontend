import { req } from "boot/axios";
import type {
  ApiResponse,
  ApiRowsResponse,
  pagination,
} from "./api.type";
import { useUserStore } from "src/stores/user";
import { DeviceStatus } from "./device";
const userStore = useUserStore();

// 保養頻率
export enum MaintainFrequencies {
  Month,
  Season,
  HalfYear,
  Year,
  CustomYear,
  CustomMonth,
  CustomDay,
}

export enum DeviceUses {
  None,
  Fire,
  Normal,
}

export interface IDeviceType {
  maintainFrequency?: MaintainFrequencies | null;
  maintainCustom?: number | null;
}

export interface DeviceTypeViewModel extends IDeviceType {
  id?: number;
  name: string;
  brand?: string;
  useType: DeviceUses; // 設備用途 => EX：消防設備、一般設備 => 用於前端方便區分設備訊息
  fullTypeValues: string[];
  driver?: string | null;
  certificationNumber?: string | null;
  productId?: string;
  frontCoverFileId?: number | null;
  frontCoverFilePath?: string | null;
  condition: number; // 後端計算出來的值
  // ! 以下新增時必須為 Null
  currentMaintainId?: number | null;
  currentMaintainCompleted?: boolean | null;
  nextMaintainDate?: Date | null;
}

// 保養頻率選項
export const maintainFrequencyOptions = [
  { label: "不設定", value: null },
  {
    label: "一個月",
    value: MaintainFrequencies.Month,
  },
  {
    label: "三個月(每季)",
    value: MaintainFrequencies.Season,
  },
  {
    label: "半年",
    value: MaintainFrequencies.HalfYear,
  },
  {
    label: "一年",
    value: MaintainFrequencies.Year,
  },
  {
    label: "自訂年份",
    value: MaintainFrequencies.CustomYear,
  },
  {
    label: "自訂月份",
    value: MaintainFrequencies.CustomMonth,
  },
];
const maintainFrequencyOptionsForFilter = maintainFrequencyOptions.filter(
  (item) => item.value !== null
) as {
  label: string;
  value: MaintainFrequencies;
}[];
// 設備種類 config
export const deviceTypeConfig = [
  {
    label: "系統",
    name: "fullTypeValues",
    field: (row: { fullTypeCh: string }) => row.fullTypeCh,
    align: "left",
    formType: "cascader",
    message: "請輸入 系統",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "種類",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 種類",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "種類", val: "Name", isDefault: true },
  },
  {
    label: "廠牌",
    name: "brand",
    field: "brand",
    align: "left",
    formType: "inputString",
    message: "請輸入 廠牌",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "廠牌", val: "Brand" },
  },
  {
    label: "型號",
    name: "productId",
    field: "productId",
    align: "left",
    formType: "inputString",
    message: "請輸入 型號",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "型號", val: "ProductId" },
  },
  {
    label: "驅動",
    name: "driver",
    field: "driver",
    align: "left",
    formType: "inputString",
    message: "請輸入 驅動",
    isTable: false,
    isDialogForm: userStore.roleName.includes("System"),
    required: false,
    disable: true,
  },
  {
    label: "保養頻率",
    name: "maintainFrequency",
    field: "maintainFrequency",
    align: "left",
    formType: "radioOptions",
    message: "請輸入 保養頻率",
    isTable: false,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: "保養頻率",
    searchType: "singleSelect",
    searchOption: {
      val: "MaintainFrequency",
      options: maintainFrequencyOptionsForFilter,
    },
  },
];

export interface DeviceInfo {
  label: string; // 設備種類中文名稱
  value: string; // 設備種類名稱
  iconId: string; // 前端-圖示編號
  drivers?: string[];
  children: DeviceInfo[];
  useType: DeviceUses;
  status: DeviceStatus[];
}

const deviceType = {
  // 新增設備種類
  apiPostData(payload: DeviceTypeViewModel) {
    return req("post", "/DeviceType", payload);
  },
  // 編輯設備種類
  apiPatchData(payload: DeviceTypeViewModel) {
    return req("patch", "/DeviceType", payload);
  },
  // 取得設備種類
  apiGetData(payload: pagination) {
    return req("get", "/DeviceType", payload);
  },
  // 刪除設備種類
  apiDeleteData(payload: DeviceTypeViewModel["id"][]) {
    return req("delete", "/DeviceType", payload);
  },
  // 設定設備種類封面
  apiSetCover(payload: { path: string; id: number; }) {
    const { id, path } = payload;
    return req<ApiResponse<number>>("patch", `/DeviceType/${id}?path=${path}`);
  },
  // 取得下拉的設備種類(系統)
  apiGetDeviceInfos() {
    return req<ApiResponse<DeviceInfo[]>>("post", "/DeviceType/deviceinfos");
  },
  // 取得設備清單下拉的設備種類(種類)
  apiGetDevicetypes() {
    return req<ApiResponse<DeviceTypeViewModel[]>>(
      "post",
      "/DeviceType/collection"
    );
  },
};

export default deviceType;
