import { req } from "boot/axios";
import type { pagination } from "./api.type";
import { UserViewModel } from "./accountSetting";
import { BuildingViewModel } from "./building";
import { RoleViewModel } from "./role";
import { AreaViewModel } from "./area";
enum Group {
  Fire = "滅火班",
  Inform = "通報班",
  EvacuationGuide = "避難引導班",
  SafetyProtection = "安全防護班",
  Ambulance = "救護班",
}

enum DutyTypes {
  /// 未選擇
  None = 0,

  /// 平日
  Daytime = 1,

  /// 夜間
  Night = 2,

  /// 假日
  Holiday = 4,

  /// 其他
  Other = 8,
}

function formateGroupTye(enumObject: any): { label: string; value: string }[] {
  return Object.keys(enumObject).map((key) => ({
    label: enumObject[key],
    value: key,
  }));
}

export type GroupMember = UserViewModel & {
  state: string;
  isInPosition: boolean;
  isRetreat: boolean;
  mugShotUrl: string;
};

export interface GroupViewModel {
  id: number;
  area: AreaViewModel;
  building: BuildingViewModel;
  classLeaderUserId: string;
  dutyType: DutyTypes;
  members: GroupMember[];
  name: string;
  otherDutyType: string;
  role: RoleViewModel;
}
// 消防編組 config
export const sDFMConfig = [
  {
    label: "編組名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 編組名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "編組名稱", val: "Name", isDefault: true },
  },
  {
    label: "班別",
    name: "role",
    field: "role",
    align: "left",
    formType: "selectString",
    message: "請選擇 編組",
    isTable: true,
    isDialogForm: true,
    required: true,
    optionLabel: "description",
    // 進階搜尋用
    searchTitle: "班別",
    searchType: "singleSelect",
    searchOption: {
      val: "RoleName",
      options: formateGroupTye(Group),
    },
  },
  {
    label: "樓層編組/地區隊",
    name: "area",
    field: "area",
    align: "left",
    formType: "selectString",
    message: "請選擇 樓層編組",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "樓層編組/地區隊", val: "AreaName" },
  },
  {
    label: "成員",
    name: "members",
    field: "members",
    align: "left",
    formType: "selectMany",
    message: "請選擇 成員",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  // 要從成員中用 classLeaderUserId 撈出班長的資料
  {
    label: "班長",
    name: "classLeaderUser",
    field: "classLeaderUser",
    align: "left",
    formType: "selectString",
    message: "請選擇 班長",
    isTable: false,
    isDialogForm: true,
    required: false,
    optionLabel: (row: UserViewModel) => row.fullname,
  },
  // 自訂班別的文字存在 otherDutyType 欄位
  {
    label: "班別模式",
    name: "dutyType",
    field: "dutyType",
    align: "left",
    formType: "checkboxMany",
    message: "請輸入自訂班別名稱",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
];
// 編組展開 config
export const sDFMExpandConfig = [
  {
    label: "姓名",
    name: "fullname",
    field: "fullname",
    align: "left",
  },
  {
    label: "手機",
    name: "phoneNumber",
    field: (row: UserViewModel) => row.phoneNumber || "無",
    align: "left",
  },
  {
    label: "其他連絡電話",
    name: "phoneNumber2",
    field: (row: UserViewModel) => row.phoneNumber2?.join(",") || "無",
    align: "left",
  },
  {
    label: "電話",
    name: "contactNumber",
    field: (row: UserViewModel) => row.contactNumber || "無",
    align: "left",
  },
  {
    label: "email",
    name: "email",
    field: (row: UserViewModel) => row.email || "無",
    align: "left",
  },
];

// 選擇樓層的config
export const floorTableConfig = [
  {
    label: "樓層",
    name: "floor",
    field: "floor",
    align: "left",
    formType: "selectMany",
    message: "請選擇 樓層",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
];
const sDFM = {
  // 新增消防編組
  apiPostData(payload: GroupViewModel) {
    return req("post", "/Group", payload);
  },
  // 編輯消防編組
  apiPatchData(payload: GroupViewModel) {
    return req("patch", "/Group", payload);
  },
  // 取得消防編組
  apiGetData(payload: pagination) {
    return req("get", "/Group", payload);
  },
  // 刪除消防編組
  apiDeleteData(payload: GroupViewModel["id"][]) {
    return req("delete", "/Group", payload);
  },

  // 取得消防編組編輯 - 編組身分的下拉選單
  apiGetGroupType(payload: pagination) {
    return req("get", "/Group", payload);
  },
  // 取得樓層群組底下的編組
  // 填 areaId => 獲取該樓層群組的編組
  // 填 buildingId => 獲取該樓層群組為 null (隸屬於所有樓層) 的編組
  apiGetGroupByArea(
    areaId: AreaViewModel["id"] | null,
    buildingId?: BuildingViewModel["id"]
  ) {
    if (!areaId && !buildingId) {
      console.error("areaId or buildingId must fill in one!!");
      return { data: false };
    }
    if (!areaId) {
      return req("post", `/Group/collection?buildingId=${buildingId}`);
    }
    return req("post", `/Group/collection?areaId=${areaId}`);
  },
};

export default sDFM;
