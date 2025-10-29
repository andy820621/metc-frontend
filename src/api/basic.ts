import { req } from "boot/axios";
import type { ApiResponse } from "./api.type";
import type { RoleViewModel } from "./role";
import type { UserViewModel } from "./accountSetting";
export interface LoginRequiredData {
  password: string;
  visitorId: string;
  loginProvider: "Web" | "IOS" | "Android";
  token: string;
}

export type Account = { account: string };
export type Email = { email: string };
export type PhoneNumber = { phoneNumber: string };

export type LoginPartialParams = Partial<Account & Email & PhoneNumber>;

export type LoginRequest = LoginRequiredData & LoginPartialParams;
export // 註冊的使用者欄位 (一般帳號)
const registerConfig = [
  {
    label: "角色/身分",
    name: "roles",
    field: "roles",
    align: "left",
    formType: "selectMany",
    message: "請選擇 角色/身分",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "帳號",
    name: "account",
    field: "account",
    align: "left",
    formType: "inputString",
    message: "請輸入 帳號",
    isTable: true,
    isDialogForm: true,
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
    label: "email",
    name: "email",
    field: "email",
    align: "left",
    formType: "email",
    message: "請輸入 email",
    isTable: true,
    isDialogForm: true,
    required: true,
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
    required: true,
  },
  {
    label: "密碼",
    name: "password",
    field: "password",
    align: "left",
    formType: "password",
    message: "請輸入 密碼",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "確認密碼",
    name: "password2",
    field: "password2",
    align: "left",
    formType: "password",
    message: "請輸入 確認密碼",
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
    required: false,
  },
  {
    label: "身分證",
    name: "identityCard",
    field: "identityCard",
    align: "left",
    formType: "inputString",
    message: "請輸入 身分證",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "生日",
    name: "birthday",
    field: "birthday",
    align: "left",
    formType: "date",
    message: "請選擇 日期",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "行動不便者",
    name: "isDisability",
    field: "isDisability",
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
    label: "其它聯絡電話",
    name: "phoneNumber2",
    field: "phoneNumber2",
    align: "left",
    formType: "cellPhone",
    message: "請輸入 其它聯絡電話",
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
    label: "其它緊急電話",
    name: "emergencyNumber2",
    field: "emergencyNumber2",
    align: "left",
    formType: "cellPhone",
    message: "請輸入 其它緊急電話",
    isTable: true,
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

interface LoginResponse {
  accessToken: string;
  exp: number;
  roles: RoleViewModel[];
  fullname: string;
  mugShotFileId?: number;
  isCommunityUser: boolean;
}

const basic = {
  apiPostLogin(data: LoginRequest) {
    return req<ApiResponse<LoginResponse>>("post", "/account/login", data);
  },
  apiPostRegister(data: UserViewModel[]) {
    return req("post", "/account/register", JSON.parse(JSON.stringify(data)));
  },
};
export default basic;
