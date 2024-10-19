import { req } from "src/boot/axios";
import type { ApiRowsResponse, pagination } from "./api.type";
import { RoutineViewModel } from "./routine";
import { DeviceMaintainViewModel } from "./maintainDevice";
import { MaintainViewModel, maintainListTableConfig } from "./maintain";
import { maintainStatus } from "src/utils/deviceStatus";

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
export interface IncompleteViewModel {
  id?: number;
  routine: RoutineViewModel;
  item: string;
  content: string;
  lastMaintain: DeviceMaintainViewModel;
}

export const incompleteConfig = [
  {
    label: "所屬維修單",
    name: "lastMaintain",
    field: "lastMaintain",
    align: "left",
    formType: "selectString",
    message: "請輸入 所屬維修單",
    isTable: true,
    isDialogForm: false,
    required: false,
    linkUrl: "/normal/maintenance?type=&search=name",
    config: maintainListTableConfig,
  },
  {
    label: "缺失項目",
    name: "item",
    field: "item",
    align: "left",
    formType: "inputString",
    message: "請輸入 缺失項目",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "缺失內容",
    name: "content",
    field: "content",
    align: "left",
    formType: "inputString",
    message: "請輸入 缺失內容",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "處理進度",
    name: "lastMaintain",
    field: (row: { lastMaintain: MaintainViewModel }) =>
      maintainStatus(row.lastMaintain),
    align: "left",
    formType: "inputString",
    message: "請輸入 處理進度",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
];
const RoutineImComplete = {
  // 新增例行檢查缺失
  apiPostData(payload: IncompleteViewModel[]) {
    return req("post", "/Routine/incomplete", payload);
  },
  // 修改例行檢查缺失
  apiPatchData(payload: IncompleteViewModel[]) {
    return req("patch", "/Routine/incomplete", payload);
  },
  // 查詢例行檢查缺失
  apiGetTableData(pagination: pagination & { routineId: number }) {
    return req("get", "/Routine/incomplete", pagination);
  },
  // 刪除例行檢查缺失
  apiDeleteData(payload: number[]) {
    return req("delete", "/Routine/incomplete", payload);
  },
  // 維修保養關聯缺失
  apiPatchIncompleteToDeviceMaintain(
    deviceMaintainId: number,
    incompleteId: number
  ) {
    return req<ApiRowsResponse<DeviceMaintainViewModel[]>>(
      "patch",
      `/Maintain/${deviceMaintainId}/device?deviceMaintainId=${deviceMaintainId}&incompleteId=${incompleteId}`
    );
  },
};

export default RoutineImComplete;
