import { req } from "boot/axios";
import type { pagination } from "./api.type";

import type { JobViewModel } from "./building";
import type { SystemViewModel } from "./system";
import type { FloorViewModel } from "./floors";
import type { UserViewModel } from "./accountSetting";
import { birthdayFormatAge } from "src/utils/formatUtils";

enum Uses {
  Residential,
  Commercial,
}

export enum Reminds {
  Month,
  Week,
  Days,
}

enum Purposes {
  Personal,
  Rent,
}
export interface AddressPlateViewModel {
  id?: number;
  floor: FloorViewModel;
  houseNumber: string;
  use: Uses;
  name?: string | null;
  businessHours?: string | null;
  spatial?: string | null;
  purpose: Purposes;
  owner?: UserViewModel | null;
  landlordUserName?: string | null;
  landlordPhoneNumber?: string | null;
  inspectionPlaceSelf: boolean;
  inspectionPlaceJob?: JobViewModel;
  inspectionPlaceDate?: SystemViewModel | null; // 前端用欄位
  inspectionPlaceRemind?: Reminds | null; // 前端用欄位
  inspectionPlaceDays?: number | null; // 前端用欄位
  publicPlaceSelf: boolean;
  publicPlaceJob?: JobViewModel;
  publicPlaceDate?: SystemViewModel | null; // 前端用欄位
  publicPlaceRemind?: Reminds | null; // 前端用欄位
  publicPlaceDays?: number | null; // 前端用欄位
  place?: string | null;
  note?: string | null;
  heads: UserViewModel[];
}
export const addressPlatesConfig = [
  {
    label: "地址",
    name: "houseNumber",
    field: "houseNumber",
    align: "left",
    formType: "inputString",
    message: "請輸入 地址",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "地址", val: "HouseNumber", isDefault: true },
  },
  {
    label: "住宅/商用",
    name: "use",
    field: (row: { use: number }) => (row.use === 0 ? "住宅" : "商用"),
    align: "left",
    formType: "radioOption",
    message: "請選擇 住宅/商用",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: "公司名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 公司名稱",
    isTable: false,
    isDialogForm: false,
    required: true,
  },
  {
    label: "營業時間",
    name: "businessHours",
    field: "businessHours",
    align: "left",
    formType: "inputString",
    message: "請輸入 營業時間",
    isTable: false,
    isDialogForm: false,
    required: false,
  },
  {
    label: "空間特性",
    name: "spatial",
    field: "spatial",
    align: "left",
    formType: "textArea",
    message: "請輸入 空間特性",
    isTable: false,
    isDialogForm: false,
    required: false,
  },
  {
    label: "自用/租賃",
    name: "purpose",
    field: (row: { purpose: number }) => (row.purpose === 0 ? "自用" : "租賃"),
    align: "left",
    formType: "radioOption",
    message: "請選擇 自用/租賃",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "房東/所有權人",
    name: "owner",
    field: "owner",
    align: "left",
    formType: "selectString",
    message: "請選擇 房東",
    isTable: false,
    isDialogForm: false,
    required: false,
  },
  {
    label: "房東",
    name: "landlordUserName",
    field: "landlordUserName",
    align: "left",
    formType: "inputString",
    message: "請選擇 房東姓名",
    isTable: false,
    isDialogForm: false,
    required: false,
  },
  {
    label: "房東聯絡電話",
    name: "landlordPhoneNumber",
    field: "landlordPhoneNumber",
    align: "left",
    formType: "inputString",
    message: "請填寫房東聯絡電話",
    isTable: false,
    isDialogForm: false,
    required: false,
  },
  {
    label: "戶長",
    name: "heads",
    field: "heads",
    align: "left",
    formType: "selectMany",
    message: "",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "場所用途",
    name: "place",
    field: "place",
    align: "left",
    formType: "inputString",
    message: "請選擇 場所用途",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  // 檢修申報
  {
    label: "申報方式",
    name: "inspectionPlaceSelf",
    field: "inspectionPlaceSelf",
    align: "left",
    formType: "radioOption",
    message: "請選擇 申報方式",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: "申報時間",
    name: "inspectionPlaceDate",
    field: "inspectionPlaceDate",
    align: "left",
    formType: "selectString",
    message: "請選擇 申報時間",
    isTable: false,
    isDialogForm: true,
    required: false,
    disable: true,
  },
  {
    label: "申報提醒",
    name: "inspectionPlaceRemind",
    field: "inspectionPlaceRemind",
    align: "left",
    formType: "radioOption",
    message: "請選擇 申報提醒",
    isTable: false,
    isDialogForm: true,
    required: false,
    disable: true,
  },

  // 公安申報
  {
    label: "申報方式",
    name: "publicPlaceSelf",
    field: "publicPlaceSelf",
    align: "left",
    formType: "radioOption",
    message: "請選擇 申報方式",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
  {
    label: "申報時間",
    name: "publicPlaceDate",
    field: "publicPlaceDate",
    align: "left",
    formType: "selectString",
    message: "請選擇 申報時間",
    isTable: false,
    isDialogForm: true,
    required: false,
    disable: true,
  },
  {
    label: "申報提醒",
    name: "publicPlaceRemind",
    field: "publicPlaceRemind",
    align: "left",
    formType: "radioOption",
    message: "請選擇 申報提醒",
    isTable: false,
    isDialogForm: true,
    required: false,
    disable: true,
  },
  {
    label: "備註",
    name: "note",
    field: "note",
    align: "left",
    formType: "textArea",
    message: "請輸入 備註",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
];

export const residentExpandConfig = [
  {
    label: "姓名",
    name: "fullname",
    field: "fullname",
    align: "left",
    formType: "inputString",
    message: "請輸入 姓名",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "性別",
    name: "sex",
    field: (row: { sex: boolean }) =>
      row.sex ? "女" : row.sex === false ? "男" : "尚未設定",
    align: "left",
    formType: "radioOption",
    message: "請輸入 性別",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "年齡",
    name: "age",
    field: (row: { birthday: string }) =>
      row.birthday ? birthdayFormatAge(row.birthday) : "尚未填寫",
    align: "left",
    formType: "inputString",
    message: "請輸入 年齡",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
  {
    label: "行動不便者",
    name: "isDisability",
    field: (row: { isDisability: boolean }) => (row.isDisability ? "是" : "否"),
    align: "left",
    formType: "checkbox",
    message: "請選擇是否為行動不便者",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "手機",
    name: "phoneNumber",
    field: "phoneNumber",
    align: "left",
    formType: "cellPhone",
    message: "請輸入 手機",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "緊急聯絡人",
    name: "emergencyContact",
    field: "emergencyContact",
    align: "left",
    formType: "inputString",
    message: "請輸入 緊急聯絡人",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
];
const AddressPlate = {
  // 編輯地址
  apiPatchData(payload: AddressPlateViewModel[]) {
    return req("patch", "/AddressPlate", payload);
  },
  // 依照樓層作門牌地址查詢
  apiGetData(payload: pagination) {
    return req("get", "/AddressPlate/byfloor", payload);
  },
  // 新增地址
  apiPostData(payload: AddressPlateViewModel[]) {
    return req("post", "/AddressPlate", payload);
  },
  // 刪除地址
  apiDeleteData(payload: { value: string }[]) {
    return req("delete", "/AddressPlate", payload);
  },
  // 取得樓層所屬之門牌地址
  apiGetAddressPlate(floorId: number) {
    return req("post", `/AddressPlate/collection?floorId=${floorId}`);
  },
  // 從該地址搜尋住戶或房東(有過濾地址驗證)
  apiGetByLandLordAndResident(addressPlateId: number) {
    return req(
      "post",
      `/user/bylandlord?addressPlateId=${addressPlateId}`,
      null
    );
  },
  // 讀取該住址之住戶(有過濾地址驗證)
  apiGetResident(addressPlateId: number) {
    return req(
      "post",
      `/user/byaddressplate?addressPlateId=${addressPlateId}`,
      null
    );
  },
  // 依照使用者作門牌地址查詢
  apiGetDataByUser(payload: pagination) {
    return req("get", "/AddressPlate/byuser", payload);
  },
};

export default AddressPlate;
