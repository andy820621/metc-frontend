import { req } from "boot/axios";
import type {
  ApiResponse,
  ApiRowsResponse,
  pagination,
} from "./api.type";
import type {
  DeviceStatusTypes,
  DeviceStatusValues,
  DeviceViewModel,
  FunctionCodes,
} from "./device";

export enum Channels {
  Emergency = 1, // 緊急應變
  Management = 2, // 平時管理
}
export interface DeviceChannelViewModel {
  deviceAddressId: number;
  channel: Channels;
  boolValue?: boolean;
  numberThen?: boolean;
  numberValue?: number;
}
export interface DeviceAddressViewModel {
  id?: number;
  device: DeviceViewModel;
  master?: DeviceViewModel;
  iconId?: string;
  color?: string;
  functionCode: FunctionCodes | { label: string; value: FunctionCodes };
  system?: string;
  address?: number;
  number?: number;
  location?: number;
  points?: number;
  area?: string;
  statusType?: DeviceStatusTypes;
  statusValue?: DeviceStatusValues;
  deviceChannels: DeviceChannelViewModel[];
}

export const deviceAddressConfig = [
  {
    label: "來源",
    name: "master",
    field: "master",
    align: "left",
    formType: "selectString",
    message: "請選擇 Master",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "設備",
    name: "device",
    field: "device",
    align: "left",
    formType: "selectSvgIcon",
    message: "請選擇 設備",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  // 純做顯示用
  {
    label: "點位",
    name: "addressStr",
    field: (row: { system: string; address: string; number: string }) =>
      `${row.system || ""}${row.address ? "-" + row.address : ""}${
        row.number ? "-" + row.number : ""
      }`,
    align: "left",
    formType: "deviceAddress",
    message: "請輸入 點位",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "空間描述",
    name: "area",
    field: "area",
    align: "left",
    formType: "inputString",
    message: "請輸入 空間描述",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
];
const DeviceAddress = {
  // 新增點位
  apiPostData(payload: DeviceAddressViewModel[]) {
    return req<ApiResponse<number[]>>("post", "/DeviceAddress", payload);
  },
  // 編輯點位
  apiPatchData(payload: DeviceAddressViewModel[]) {
    return req("patch", "/DeviceAddress", payload);
  },
  // 取得點位
  apiGetData(payload: pagination) {
    payload.buildingId = +(localStorage.getItem("Bid"));
    return req<ApiRowsResponse<DeviceAddressViewModel[]>>(
      "get",
      "/DeviceAddress",
      payload
    );
  },
  // 刪除點位
  apiDeleteData(payload: number[]) {
    return req("delete", "/DeviceAddress", payload);
  },
};

export default DeviceAddress;
