import { req } from "boot/axios";
import type { pagination } from "./api.type";
import { UserViewModel } from "./accountSetting";
import { birthdayFormatAge } from "src/utils/formatUtils";

export interface AccountViewModel {
  id?: number;
  user: UserViewModel;
  fullname: string;
  email?: string | null;
  phoneNumber?: string | null;
  phoneNumber2?: string[] | null;
  identityCard?: string | null;
  birthday?: Date;
  contactNumber?: string | null;
  emergencyContact?: string | null;
  emergencyNumber?: string | null;
  emergencyNumber2?: string[] | null;
  mugShotFileId?: number | null;
  note?: string | null;
  sex?: boolean | null;
  isDisability?: boolean | null;

  statusConfirmObj?: {
    isAccount: boolean,
    status: string,
    checkedStatus: any,
    message: string,
    checked: boolean,
  }; // 前端用
}
export const beControlledDataConfig = [
  {
    label: "照片",
    name: "mugShotFileId",
    field: "mugShotFileId",
    align: "left",
    formType: "mugShotFile",
    message: "",
    isTable: false,
    isDialogForm: false,
    required: true,
  },
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
    label: "生日",
    name: "birthday",
    field: "birthday",
    align: "left",
    formType: "date",
    message: "請輸入 生日",
    isTable: false,
    isDialogForm: true,
    required: false,
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
    label: "身分證",
    name: "identityCard",
    field: "identityCard",
    align: "left",
    formType: "inputString",
    message: "請輸入 身分證",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "行動不便者",
    name: "isDisability",
    field: (row: { isDisability: boolean }) => (row.isDisability ? "是" : "否"),
    align: "left",
    formType: "checkbox",
    message: "請選擇 行動不便者",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "電話",
    name: "contactNumber",
    field: "contactNumber",
    align: "left",
    formType: "phone",
    message: "請輸入 電話",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "email",
    name: "email",
    field: "email",
    align: "left",
    formType: "email",
    message: "請輸入 email",
    isTable: false,
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
    label: "其他連絡電話",
    name: "phoneNumber2",
    field: "phoneNumber2",
    align: "left",
    formType: "cellPhone",
    message: "請輸入 其他連絡電話",
    isTable: false,
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
  {
    label: "緊急電話",
    name: "emergencyNumber",
    field: "emergencyNumber",
    align: "left",
    formType: "cellPhone",
    message: "請輸入 緊急電話",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "其他緊急電話",
    name: "emergencyNumber2",
    field: "emergencyNumber2",
    align: "left",
    formType: "cellPhone",
    message: "請輸入 其他緊急電話",
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
    isTable: true,
    isDialogForm: true,
    required: false,
  },
];

const userAccount = {
  // 編輯附屬帳號
  apiPatchData(payload: AccountViewModel) {
    return req("patch", "/User/account", JSON.parse(JSON.stringify(payload)));
  },
  // 取得附屬帳號
  apiGetTableData(payload: pagination) {
    return req("get", "/User/account", payload);
  },
  // 新增附屬帳號
  apiPostData(payload: AccountViewModel) {
    return req("post", "/User/account", JSON.parse(JSON.stringify(payload)));
  },
  // 刪除附屬帳號
  apiDeleteData(payload: AccountViewModel["id"][]) {
    return req("delete", "/User/account", payload);
  },
  // 上傳附屬帳號大頭照
  apiUploadAccountMugshot(formData: FormData, accountId: AccountViewModel["id"]) {
    return req<FormData>("uploadPatch", `/User/account/mugshot?accountId=${accountId}`, formData);
  },
};

export default userAccount;
