import { req } from "boot/axios";
import { useBuildingStore } from "src/stores/building.js";
import type { ApiResponse, pagination } from "./api.type";
import { BuildingViewModel } from "./building";
import { ProviderViewModel, supplierDataConfig } from "./supplierData";
import type { AddressPlateViewModel } from "./addressPlate";
import type { FloorViewModel } from "./floors";
import { DeviceTypeViewModel, deviceTypeConfig } from "./deviceType";
import { ReceiveDeviceAddressViewModel } from "./deviceHistory";
import { MaintainViewModel } from "./maintain";
import { CommunityUserViewModel, committeeConfig } from "./managementCommittee";
import {
  DeviceConditions,
  deviceStatus,
  deviceConditionOptions,
} from "src/utils/deviceStatus";

const buildingStore = useBuildingStore();

export enum DeviceStatusValues {
  Normal = 0, /// 正常
  Action = 1, /// 動作
  Stop = 2, /// 停止
  Fire = 3, /// 火災
}

export enum DeviceStatusTypes {
  State, /// 狀態
  Control, /// 控制
  PowerState, /// 電源狀態
  PowerControl, /// 電源作動
}

export enum FunctionCodes {
  ReadCoils = 1,
  ReadInputs = 2,
  ReadHoldingRegisters = 3,
  ReadInputRegisters = 4,
  WriteSingleCoil = 5,
  WriteSingleRegister = 6,
  WriteMultipleCoils = 15,
  WriteMultipleRegisters = 16,
  ReadWriteMultipleRegisters = 23,
}

interface MasterViewModel {
  hostName: string;
  port: number;
  slaveAddress: number;
}
interface CameraViewModel {
  url: string;
  userName?: string;
  password?: string;
}

export interface PoolViewModel {
  area?: number; // 面積
  high?: number; // 高度
  legal?: number; // 法定水量噸數
  invalid?: number; // 無效水量噸數
  total?: number; // 總水量回傳值
  zero?: number; // 零水量回傳值
}

export interface DeviceViewModel {
  id?: number;
  building: BuildingViewModel;
  floor?: FloorViewModel;
  addressPlate?: AddressPlateViewModel | null;
  floors?: FloorViewModel[]; // 垂直區劃
  deviceType: DeviceTypeViewModel;
  name: string;
  purchaseDate?: Date | null; // 購買日期
  location?: string;
  groupID?: string | null;
  warrantyDate?: Date | null; // 保固日期
  master?: MasterViewModel | null;
  camera?: CameraViewModel | null;
  currentDeviceMaintainId?: number;
  currentMaintainCompleted?: boolean;
  nextMaintainDate?: Date;
  lastMaintain?: MaintainViewModel | null;
  note?: string;
  isShortcut: boolean;
  keeperUnit?: CommunityUserViewModel | null; // 保管單位
  maintainVendor?: ProviderViewModel | null; // 維護廠商
  gateway?: number;
  iconId?: string;
  isFaulty: boolean; // 是否故障
  isNotified: boolean; // 是否已經把 alert 紀錄起來了
  condition?: DeviceConditions; // 設備狀況
  pool: PoolViewModel | null; // 水位計用
}

export interface DeviceAddressViewModel {
  id?: number;
  device: DeviceViewModel;
  master?: DeviceViewModel;
  floor: FloorViewModel;
  addressPlate?: AddressPlateViewModel;
  iconId?: string;
  functionCode: FunctionCodes;
  system?: string;
  address?: number;
  number: number;
  location?: number;
  points?: number;
  area?: string;
  statusType?: DeviceStatusTypes;
  statusValue?: DeviceStatusValues;
}
// 設備種類的狀態或指令屬性
export interface DeviceStatus {
  name: string;
  type: DeviceStatusTypes;
  value: DeviceStatusValues;
  trigger: boolean;
  color: string;
}
export interface DeviceAddressStatusViewModel {
  deviceAddress: DeviceAddressViewModel;
  deviceStatuses: DeviceStatus[];
}
export interface DeviceStatusViewModel extends DeviceViewModel {
  state: DeviceAddressViewModel[];
  control: DeviceAddressStatusViewModel[];
  powerState: DeviceAddressViewModel[];
  powerControl: DeviceAddressStatusViewModel[];
  value?: string | number; // 前端在使用的
}

// 設備清單 config
export const deviceManageConfig = [
  {
    label: "種類",
    name: "deviceType",
    field: "deviceType",
    align: "left",
    formType: "selectString",
    message: "請選擇 種類",
    isTable: true,
    isDialogForm: true,
    required: true,
    linkUrl: "/deviceData/devicesManagement?type=deviceType&search=name",
    config: deviceTypeConfig,
    optionLabel: "name",
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "種類", val: "DeviceTypeName" },
  },
  // "以下": type 是 `PLC` 或是 `火警受信總機` 才需填寫
  {
    label: "hostName",
    name: "hostName",
    field: "hostName",
    align: "left",
    formType: "masterInputString",
    message: "請輸入 hostName",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: "Port",
    name: "port",
    field: "port",
    align: "left",
    formType: "masterInputNumber",
    message: "請輸入 Port",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: "SlaveAddress",
    name: "slaveAddress",
    field: "slaveAddress",
    align: "left",
    formType: "masterInputNumber",
    message: "請輸入 SlaveAddress",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  // "以上": type 是 `PLC` 或是 `火警受信總機` 才需填寫

  // "以下": type 是攝影機才需填寫
  {
    label: "攝影機 Url",
    name: "url",
    field: "url",
    align: "left",
    formType: "cameraInputString",
    message: "請輸入 攝影機 Url",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: "攝影機 帳號",
    name: "userName",
    field: "userName",
    align: "left",
    formType: "cameraInputString",
    message: "請輸入 攝影機 帳號",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "攝影機 密碼",
    name: "password",
    field: "password",
    align: "left",
    formType: "cameraInputString",
    message: "請輸入 攝影機 密碼",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  // "以上": type 是攝影機才需填寫

  // "以下": type 是水位計才需填寫
  {
    label: "水槽面積 (平方公尺)",
    name: "area",
    field: "area",
    align: "left",
    formType: "levelMeter",
    message: "請輸入水槽面積",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "水槽高度 (公尺)",
    name: "high",
    field: "high",
    align: "left",
    formType: "levelMeter",
    message: "請輸入水槽高度",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "法定水量 (噸數)",
    name: "legal",
    field: "legal",
    align: "left",
    formType: "levelMeter",
    message: "請輸入法定水量",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "無效水量 (噸數)",
    name: "invalid",
    field: "invalid",
    align: "left",
    formType: "levelMeter",
    message: "請輸入無效水量",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "總水量水位計回傳值",
    name: "total",
    field: "total",
    align: "left",
    formType: "levelMeter",
    message: "請輸入總水量水位計回傳值",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "零水量水位計回傳值",
    name: "zero",
    field: "zero",
    align: "left",
    formType: "levelMeter",
    message: "請輸入總水量水位計回傳值",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  // "以上": type 是水位計才需填寫

  {
    label: "名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "名稱", val: "Name", isDefault: true },
  },
  {
    label: "大樓",
    name: "building",
    field: "building",
    align: "left",
    formType: "selectString",
    message: "請選擇 大樓",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "樓層",
    name: "floor",
    field: "floor",
    align: "left",
    formType: "selectString",
    message: "請選擇 樓層",
    isTable: true,
    isDialogForm: true,
    required: false,
    disable: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "樓層", val: "FloorName" },
  },
  {
    label: "地址",
    name: "addressPlate",
    field: (row: { addressPlate: AddressPlateViewModel }) =>
      row.addressPlate?.houseNumber,
    align: "left",
    formType: "selectString",
    message: "請選擇 地址",
    isTable: true,
    isDialogForm: true,
    required: false,
    disable: false,
    optionLabel: "houseNumber",
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "地址", val: "AddressPlateHouseNumber" },
  },
  {
    label: "垂直區劃樓層",
    name: "floors",
    field: "floors",
    align: "left",
    formType: "selectMany",
    message: "請選擇 垂直區劃樓層",
    isTable: false,
    isDialogForm: true,
    required: false,
    disable: false,
  },
  {
    label: "位置設置",
    name: "location",
    field: "location",
    align: "left",
    formType: "inputString",
    message: "請輸入 位置設置",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "位置設置", val: "Location" },
  },
  {
    label: "購買日期",
    name: "purchaseDate",
    field: "purchaseDate",
    align: "left",
    formType: "date",
    message: "請選擇 日期",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: "購買日期",
    searchType: "date",
    searchOption: { startVal: "PurchaseDate", endVal: "PurchaseDate" },
  },
  {
    label: "保固日期",
    name: "warrantyDate",
    field: "warrantyDate",
    align: "left",
    formType: "date",
    message: "請選擇 日期",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: "保固日期",
    searchType: "date",
    searchOption: { startVal: "WarrantyDate", endVal: "WarrantyDate" },
  },
  {
    label: "保管單位",
    name: "keeperUnit",
    field: (row: DeviceViewModel) =>
      row.keeperUnit ? row.keeperUnit.user : "",
    align: "left",
    formType: "selectString",
    message: "請選擇 保管單位",
    isTable: true,
    isDialogForm: true,
    required: false,
    optionLabel: (row: CommunityUserViewModel) => row.user?.fullname,
    linkUrl:
      "/normal/basic?label=管委會&value=managementCommittee&type=managementCommittee&search=name",
    config: committeeConfig.slice(1),
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "保管單位", val: "KeeperUnitCommunityUserName" },
  },
  {
    label: "維護廠商",
    name: "maintainVendor",
    field: "maintainVendor",
    align: "left",
    formType: "selectString",
    message: "請選擇 維護廠商",
    isTable: true,
    isDialogForm: true,
    required: false,
    linkUrl:
      "/normal/basic?label=廠商資料&value=supplierData&type=supplierData&search=name",
    config: supplierDataConfig,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "維護廠商", val: "MaintainVendorProviderName" },
  },
  {
    label: "下次保養時間",
    name: "nextMaintainDate",
    field: "nextMaintainDate",
    align: "left",
    formType: "date",
    message: "請選擇 日期",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "設備狀況",
    name: "condition",
    field: (row: DeviceViewModel) => deviceStatus(row.condition),
    align: "left",
    formType: "deviceStatus",
    message: "請選擇 設備狀況",
    isTable: true,
    isDialogForm: false,
    required: false,
    // 進階搜尋用 (Equals 下拉)
    searchTitle: "設備狀況",
    searchType: "singleSelect",
    searchOption: {
      val: "Condition",
      options: deviceConditionOptions,
      style: "padding: 0 5.8rem 0 0.81rem",
    },
  },
  {
    label: "顯示於頁面",
    name: "isShortcut",
    field: "isShortcut",
    align: "left",
    formType: "toggle",
    message: "請選擇是否顯示於頁面",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "閘道器",
    name: "gateway",
    field: "gateway",
    align: "left",
    formType: "inputNumber",
    message: "請輸入 閘道器",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "故障",
    name: "isFaulty",
    field: (row: DeviceViewModel) => (row.isFaulty ? "是" : "否"),
    align: "left",
    formType: "toggle",
    message: "請選擇是否故障",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "備註",
    name: "note",
    field: "note",
    align: "left",
    formType: "textArea",
    message: "請輸入 備註",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
];
const device = {
  // 新增設備
  apiPostData(payload: DeviceViewModel) {
    return req("post", "/Device", payload);
  },
  // 編輯設備
  apiPatchData(payload: DeviceViewModel) {
    return req<ApiResponse<boolean>>("patch", "/Device", payload);
  },
  // 取得設備
  apiGetData(payload: pagination) {
    payload.buildingId = +(localStorage.getItem("Bid") as string);
    return req("get", "/Device", payload);
  },
  // 刪除設備
  apiDeleteData(payload: DeviceViewModel["id"][]) {
    return req("delete", "/Device", payload);
  },
  // 下拉取得設備
  apiGetDevice() {
    return req("post", `/Device/bybuilding?buildingId=${buildingStore.Bid}`);
  },
  // 依照大樓取得所屬設備
  apiGetDeviceByDeviceType(deviceTypeId: number) {
    return req("post", `/Device/bydevicetype?deviceTypeId=${deviceTypeId}`);
  },
  // 下拉取得設備 master
  apiGetDeviceMaster() {
    return req("post", `/Device/masters?buildingId=${buildingStore.Bid}`);
  },
  // 以設備來作設備位址查詢
  apiGetTableData(payload: {
    deviceId: number;
    page: number;
    rowsPerPage: number;
  }) {
    const { deviceId, page, rowsPerPage } = payload;
    return req(
      "post",
      `/DeviceAddress/table?page=${page}&rowsPerPage=${rowsPerPage}&deviceId=${deviceId}`
    );
  },
  // 取得指定樓層的設備
  apiGetDeviceWithAddress(payload: { floorId?: number }) {
    const { floorId } = payload;
    return req("post", `/Device/clients?floorId=${floorId ?? ""}`);
  },
  // 取得要顯示在設備處理狀況左側的設備資料
  apiGetIsShortcutDevices() {
    return req<ApiResponse<DeviceStatusViewModel[]>>(
      "post",
      `/Device/shortcuts?buildingId=${buildingStore.Bid}`
    );
  },
  // 獲得消防支援物件
  apiGetFireSupports(payload: { floorId: number }) {
    const { floorId } = payload;

    return req("post", `/Device/supports?floorId=${floorId ?? ""}`);
  },

  // 取得設備初始狀態 topic :哪裡來的設備訊號; count: 幾筆資料
  apiGetDeviceStatus(deviceId: DeviceViewModel["id"]) {
    return req<ApiResponse<ReceiveDeviceAddressViewModel[]>>(
      "get",
      `/Receive/latest?deviceId=${deviceId}`
    );
  },
  // 取得還沒被設定在流程圖種類的設備
  apiGetUnsettedTriggers(payload: DeviceViewModel["id"][]) {
    return req<ApiResponse<DeviceViewModel[]>>(
      "post",
      "/Device/triggers",
      payload
    );
  },
  // 設定設備是否故障 (by id)
  apiSetDeviceFaulty(payload: {
    id: DeviceViewModel["id"];
    isFaulty: DeviceViewModel["isFaulty"];
  }) {
    return req<ApiResponse<boolean>>(
      "post",
      `/Device/setfaulty?isFaulty=${payload.isFaulty}&id=${payload.id}`
    );
  },
};

export default device;
