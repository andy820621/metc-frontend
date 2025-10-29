import { req } from "src/boot/axios";
import type { pagination } from "./api.type";
import type { AddressPlateViewModel } from "./addressPlate";
import type { ProviderViewModel} from "./supplierData";
import { supplierDataConfig } from "./supplierData";
import type { BuildingViewModel } from "./building";

export enum RoutineTypes {
  ///  檢修申報
  MaintenanceDeclaration,
  /// 消防局抽查
  FireDepartmentInspection,
  /// 公安申報
  PublicSecurityDeclaration,
  /// 工務局抽查
  PublicWorksDepartmentInspection,
}
export enum yearType {
  ///  上半年
  FirstHalfYear,
  /// 下半年
  SecondHalfYear,
  /// 全年度
  FullYear,
}
export enum QualifiedStatus {
  ///  已改善
  Improved,
  /// 未改善
  NotImproved,
}

export interface RoutineViewModel {
  id?: number;
  type: RoutineTypes;
  year: number;
  yearType: yearType;
  building: BuildingViewModel;
  addressPlate: AddressPlateViewModel;
  checkDateStart: string;
  checkDateEnd: string;
  date: string;
  deadline: string;
  provider: ProviderViewModel;
  professional: string;
  isQualified: boolean;
  qualifiedDeadline: string;
  qualifiedStatus: QualifiedStatus;
  remark: string;
  incompleteFileId?: number;
  incompleteFilePath?: string;
}
export const yearTypeRadioOption = [
  { label: "上半年", value: yearType.FirstHalfYear },
  { label: "下半年", value: yearType.SecondHalfYear },
  { label: "全年度", value: yearType.FullYear },
];
export const qualifiedStatusRadioOption = [
  { label: "已改善", value: QualifiedStatus.Improved },
  { label: "未改善", value: QualifiedStatus.NotImproved },
];
export const routineInspConfig = [
  {
    label: "類型",
    name: "type",
    field: "type",
    align: "left",
    formType: "selectString",
    message: "請輸入 類型",
    isTable: false,
    isDialogForm: false,
    required: false,
  },
  {
    label: "年份",
    name: "year",
    field: (row: RoutineViewModel) =>
      `${row.year} ${
        yearTypeRadioOption.find((item) => item.value === row.yearType)?.label
      }`,
    align: "left",
    formType: "inputNumber",
    message: "請輸入 年份",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "年度",
    name: "yearType",
    field: "yearType",
    align: "left",
    formType: "radioOption",
    message: "請選擇 上半年、下半年、全年度",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: "大樓",
    name: "building",
    field: "building",
    align: "left",
    formType: "selectString",
    message: "請選擇 大樓",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "樓層",
    name: "floor",
    field: "floor",
    align: "left",
    formType: "selectString",
    message: "請選擇 樓層",
    isTable: false,
    isDialogForm: true,
    required: true,
    disable: false,
  },
  {
    label: "申報地點",
    name: "addressPlate",
    field: (row: { addressPlate: AddressPlateViewModel }) =>
      row.addressPlate?.houseNumber,
    align: "left",
    formType: "selectString",
    message: "請輸入 申報地點",
    isTable: true,
    isDialogForm: true,
    required: true,
    optionLabel: "houseNumber",
    // 進階搜尋用
    searchType: "string",
    searchOption: {
      label: "申報地點",
      val: "AddressPlateHouseNumber",
      isDefault: true,
    },
  },
  {
    label: "檢測開始日期",
    name: "checkDateStart",
    field: "checkDateStart",
    align: "left",
    formType: "date",
    message: "請輸入 申報日期",
    isTable: false,
    isDialogForm: false,
    required: false,
  },
  {
    label: "檢測結束日期",
    name: "checkDateEnd",
    field: "checkDateEnd",
    align: "left",
    formType: "date",
    message: "請輸入 申報日期",
    isTable: false,
    isDialogForm: false,
    required: false,
  },
  {
    label: "檢測期間",
    name: "checkDate",
    field: (row: RoutineViewModel) =>
      row.checkDateStart && row.checkDateEnd
        ? `${row.checkDateStart} 至 ${row.checkDateEnd}`
        : "",
    align: "left",
    formType: "rangeDate",
    message: "請輸入 檢測日期",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: "檢測期間",
    searchType: "date",
    searchOption: {
      startVal: "CheckDateStart",
      endVal: "CheckDateEnd",
    },
  },
  {
    label: "申報日期",
    name: "date",
    field: "date",
    align: "left",
    formType: "date",
    message: "請輸入 申報日期",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: "申報期限",
    name: "deadline",
    field: "deadline",
    align: "left",
    formType: "date",
    message: "請輸入 申報期限",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: "申報廠商",
    name: "provider",
    field: "provider",
    align: "left",
    formType: "selectString",
    message: "請輸入 申報廠商",
    isTable: true,
    isDialogForm: true,
    required: false,
    linkUrl:
      "/basic?label=廠商資料&value=supplierData&type=supplierData&search=name",
    config: supplierDataConfig,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "申報廠商", val: "ProviderName" },
  },
  {
    label: "專技人員",
    name: "professional",
    field: "professional",
    align: "left",
    formType: "inputString",
    message: "請輸入 專技人員",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "資格",
    name: "qualification",
    field: "qualification",
    align: "left",
    formType: "radioOption",
    message: "請選擇 資格",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "申報狀況",
    name: "isQualified",
    field: "isQualified",
    align: "left",
    formType: "checkbox",
    message: "請選擇 申報狀況",
    isTable: true,
    isDialogForm: true,
    required: false,
    isTableSlot: true,
    // 進階搜尋用
    searchTitle: "申報狀況",
    searchType: "singleSelect",
    searchOption: {
      val: "IsQualified",
      options: [
        {
          label: "缺失申報",
          value: false,
        },
        {
          label: "合格申報",
          value: true,
        },
      ],
    },
  },
  {
    label: "限改日期",
    name: "qualifiedDeadline",
    field: "qualifiedDeadline",
    align: "left",
    formType: "date",
    message: "請選擇 限改日期",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchTitle: "限改日期",
    searchType: "date",
    searchOption: {
      startVal: "QualifiedDeadline",
      endVal: "QualifiedDeadline",
    },
  },
  {
    label: "改善狀況",
    name: "qualifiedStatus",
    field: "qualifiedStatus",
    align: "left",
    formType: "radioOption",
    message: "請選擇 改善狀況",
    isTable: true,
    isDialogForm: true,
    required: false,
    isTableSlot: true,
    // 進階搜尋用
    searchTitle: "改善狀況",
    searchType: "singleSelect",
    searchOption: {
      val: "QualifiedStatus",
      options: qualifiedStatusRadioOption,
    },
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

const Routine = {
  // 新增例行檢查
  apiPostData(payload: RoutineViewModel[]) {
    return req("post", "/Routine", payload);
  },
  // 修改例行檢查
  apiPatchData(payload: RoutineViewModel[]) {
    return req("patch", "/Routine", payload);
  },
  // 查詢例行檢查
  apiGetData(
    pagination: pagination & { type: RoutineTypes; buildingId: number }
  ) {
    return req("get", "/Routine", pagination);
  },
  // 刪除例行檢查
  apiDeleteData(payload: number[]) {
    return req("delete", "/Routine", payload);
  },
};

export default Routine;
