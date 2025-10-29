import { req } from "boot/axios";
import type { pagination } from "./api.type";
import type { AddressPlateViewModel } from "./addressPlate";
import { birthdayFormatAge } from "src/utils/formatUtils";
import type { UserViewModel } from "./accountSetting";
import type { FireAckStatus } from "src/pages/emergency/pplStatus/index.type";
import type { AccountViewModel } from "./userAccount";

export interface UserAccount {
  id?: string | number;
  nullable: true;
  fullname: string;
  email: string;
  phoneNumber: string;
  phoneNumber2: string[];
  identityCard: string;
  birthday: string;
  contactNumber: string;
  emergencyContact: string;
  emergencyNumber: string;
  emergencyNumber2: string[];
  mugShotFileId: string;
  note: string;
  sex: boolean;
  isDisability: boolean;
  addressPlates: AddressPlateViewModel[];
  messages?: string[]; // 前端用
  mugShotUrl?: string; // 前端用
}

export interface UserAccountAcks {
  userAccount: UserAccount;
  messages: string[];
}

export interface FireAckRequest {
  synUser: UserViewModel;
  user: UserViewModel;
  status: FireAckStatus;
  message: string[];
  responseTime: string;
}

export interface FireAccountAckRequest {
  synAccount: AccountViewModel;
  user: UserViewModel;
  status: FireAckStatus;
  message: string[];
  responseTime: string;
}

export interface UserAccountBook {
  userAccount: UserAccount;
  messages: string[];
  fireAcks: { [index: number]: FireAckRequest };
  fireAccountAcks: { [index: number]: FireAccountAckRequest };
}

export interface FamilyViewModel {
  familyUsers: {
    user: UserViewModel;
    accounts: AccountViewModel[];
  }[];
  accounts: AccountViewModel[];
}
export const pplTableConfig = [
  {
    label: "地址",
    name: "addressPlates",
    field: (row: { addressPlates: AddressPlateViewModel[] }) =>
      row.addressPlates?.length
        ? row.addressPlates.map((item) => item.houseNumber).join("、")
        : "",
    func: (val: AddressPlateViewModel[]) =>
      val
        ? val
            .map((p) => p.houseNumber)
            .filter((value, index, self) => self.indexOf(value) === index)
            .join("\n")
        : "",
    align: "left",
    formType: "selectString",
    message: "",
    isTable: true,
    isDialogForm: false,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "地址", val: "AddressPlateHouseNumber" },
  },
  {
    label: "姓名",
    name: "fullname",
    field: "fullname",
    align: "left",
    formType: "fullname",
    message: "請輸入 姓名",
    isTable: true,
    isDialogForm: true,
    required: true,
    isTableSlot: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "姓名", val: "Fullname", isDefault: true },
  },
  {
    label: "性別",
    name: "sex",
    field: (row: { sex: boolean }) =>
      row.sex ? "女" : row.sex === false ? "男" : "尚未設定",
    func: (val: UserViewModel["sex"]) =>
      val ? "女" : val === false ? "男" : "尚未設定",
    align: "left",
    formType: "radioOption",
    message: "請輸入 性別",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchTitle: "性別",
    searchType: "singleSelect",
    searchOption: {
      val: "Sex",
      options: [
        {
          label: "男",
          value: false,
        },
        {
          label: "女",
          value: true,
        },
      ],
    },
  },
  {
    label: "行動不便者",
    name: "isDisability",
    field: (row: { isDisability: UserViewModel["isDisability"] }) =>
      row.isDisability ? "是" : "否",
    func: (val: UserViewModel["isDisability"]) => (val ? "是" : "否"),
    align: "left",
    formType: "checkbox",
    message: "請選擇是否為行動不便者",
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
    // 進階搜尋用
    searchTitle: "生日",
    searchType: "date",
    searchOption: {
      startVal: "Birthday",
      endVal: "Birthday",
      disableFuture: true,
    },
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
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "手機", val: "PhoneNumber" },
  },
  {
    label: "其他連絡電話",
    name: "phoneNumber2",
    field: "phoneNumber2",
    func: (val: UserViewModel["phoneNumber2"]) => val?.join("\n"),
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
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "緊急聯絡人", val: "EmergencyContact" },
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
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "緊急電話", val: "EmergencyNumber" },
  },
  {
    label: "其他緊急電話",
    name: "emergencyNumber2",
    field: "emergencyNumber2",
    func: (val: UserViewModel["emergencyNumber2"]) => val?.join("\n"),
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
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "備註", val: "Note" },
  },
  {
    label: "請求協助內容",
    name: "messages",
    field: (row: { messages: string[] }) => row.messages.join("/n"),
    func: (val: string[]) => val?.join("\n"),
    align: "left",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "請求協助內容", val: "Message" },
  },
];
// 避難狀況確認與人員名冊
const fireCheck = {
  // 避難狀況確認
  // 火災通知的回應 (確認狀態為避難完成、不在現場、請求協助、家庭成員狀況...)
  apiPostFireAck(payload: {
    workflowId: string;
    status: number;
    message: string;
  }) {
    // workflowId : 運作的流程圖id ; status : 避難狀況 ; message:請求協助的訊息
    // workflowId = fireWorkflowId;  status = FireStatus;
    return req(
      "post",
      `/Fire/ack?workflowId=${payload.workflowId}&status=${payload.status}&message=${payload.message}`
    );
  },
  // 附屬帳號 :火災通知的回應 (確認狀態為避難完成、不在現場、請求協助、家庭成員狀況...)
  apiPostAccountFireAck(payload: {
    workflowId: string;
    accountId: string;
    status: number;
    message: string;
  }) {
    // workflowId : 運作的流程圖id ; status : 避難狀況 ; message:請求協助的訊息
    // workflowId = fireWorkflowId;  status = FireStatus;
    return req(
      "post",
      `/Fire/account/ack?workflowId=${payload.workflowId}&accountId=${payload.accountId}&status=${payload.status}&message=${payload.message}`
    );
  },
  // 家屬避難狀況確認
  apiPostFireFamily(workflowId: string, payload: FireAckRequest[]) {
    return req("post", `/Fire/family?workflowId=${workflowId}`, payload);
  },
  // 附屬帳號避難狀況確認
  apiPostFireAccount(workflowId: string, payload: FireAccountAckRequest[]) {
    return req("post", `/Fire/account?workflowId=${workflowId}`, payload);
  },
  // 讀取個人的家庭成員資料
  apiGetUserFamily() {
    return req("post", "/User/family");
  },
  // 取得家屬避難狀況
  apiGetUserFamilyStatus(workflowId: string) {
    return req("get", `/Fire/family?workflowId=${workflowId}`);
  },
  // 取得附屬帳號避難狀況
  apiGetUserAccountFamilyStatus(workflowId: string, userId: string) {
    return req(
      "get",
      `/Fire/account?workflowId=${workflowId}&userId=${userId}`
    );
  },

  // 人員名冊
  // 火災通知的送達 :確認訊息是否有正常送達
  apiPatchFireSyn(workflowId: string) {
    // workflowId : 運作的流程圖id
    return req("patch", `/Fire/syn?workflowId=${workflowId}`);
  },
  // 附屬帳號 : 火災通知的送達 :確認訊息是否有正常送達 >>> 擁有附屬帳號的一般帳號需要打這支API
  apiPatchAccountFireSyn(workflowId: string, accountId: string) {
    // workflowId : 運作的流程圖id ;accountId : 附屬帳號id
    return req(
      "patch",
      `/Fire/account/syn?workflowId=${workflowId}&accountId=${accountId}`
    );
  },
  // 避難狀況統計
  apiGetFireStatus(workflowId: string) {
    return req("get", `/Fire/stats?workflowId=${workflowId}`);
  },
  // 避難人員查詢
  apiGetFireUsers(workflowId: string, status: number, pagination: pagination) {
    const obj = { workflowId, status };
    const payload = { ...obj, ...pagination };
    return req("get", "/Fire/useraccounts", payload);
  },
};

export default fireCheck;
