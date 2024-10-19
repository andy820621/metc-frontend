import { req } from "boot/axios";
import type { ApiResponse, tempDataType } from "./api.type";
import { UserViewModel } from "./accountSetting";

export enum loginDevice {
  Android,
  IOS,
  Web,
}
export const userDataConfig = [
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
    message: "請選擇是否為行動不便者",
    isTable: true,
    isDialogForm: true,
    required: false,
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
export const passwordConfig = [
  {
    label: "現有密碼",
    name: "currentPassword",
    field: "currentPassword",
    align: "left",
    formType: "password",
    message: "請輸入 現有密碼",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "新建密碼",
    name: "newPassword",
    field: "newPassword",
    align: "left",
    formType: "password",
    message: "請輸入 新建密碼",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
];
const user = {
  // 把拿到的 FCM token 存到後端
  apiSaveFCMToken(loginDevice: loginDevice, token: string) {
    return req("post", `/Manage/${loginDevice}?token=${token}`);
  },
  // 取得使用者的個人資料
  apiGetUserData() {
    return req<ApiResponse<UserViewModel>>("get", "/Manage/personal");
  },
  // 修改使用者的個人資料
  apiPatchData(payload: UserViewModel) {
    return req("patch", "/Manage/personal", payload);
  },
  // 上傳該帳號本身大頭貼 (個人資料)
  apiUploadHeadShot(formData: FormData) {
    return req<FormData>("uploadPatch", "/Manage/mugshot", formData);
  },
  // 上傳使用者大頭貼
  apiUploadUserMugshot(formData: FormData, userId: UserViewModel["id"]) {
    return req<FormData>("uploadPatch", `/User/mugshot?id=${userId}`, formData);
  },
  // 驗證電子信箱
  apiVerifyEmail() {
    return req("post", "/Manage/email");
  },
  // 修改密碼
  apiPatchPassword(currentPassword: string, newPassword: string) {
    return req(
      "post",
      `/Manage/password?currentPassword=${currentPassword}&newPassword=${newPassword}`
    );
  },
  // 通知開關
  apiPatchSwitch(switchs: number) {
    return req("patch", `/Manage/switchs?switchs=${switchs}`);
  },
  // 取得自訂螢幕畫面參數
  apiGetScreenSettings() {
    return req("get", "/Manage/mobile");
  },
  // 使用者設定螢幕參數
  apiChangeScreenSettings(payload: tempDataType) {
    return req("patch", "/Manage/mobile", payload);
  },
};

export default user;
