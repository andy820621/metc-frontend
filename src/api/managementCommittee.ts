import { SystemViewModel } from "./system";
import { req } from "boot/axios";
import type { ApiResponse, ApiRowsResponse, pagination } from "./api.type";
import type { UserAccount, UserViewModel } from "./accountSetting";
import { userConfig } from "src/utils/linkUrlConfig";

export interface reElectionPayLoad {
  start: string;
  end: string;
}

export interface CommunityViewModel {
  id?: number;
  number: number;
  start: string;
  end: string;
}

export interface CommunityUserViewModel {
  id?: number;
  community: CommunityViewModel;
  user: UserViewModel;
  title?: SystemViewModel | null;
  note?: string | null;
}
export const committeeConfig = [
  {
    label: "照片",
    name: "mugShotFileId",
    field: "mugShotFileId",
    align: "left",
    formType: "mugShotFile",
    message: "",
    isTable: false,
    isDialogForm: true,
    required: false,
    disable: true,
  },
  {
    label: "職稱",
    name: "title",
    field: "title",
    align: "left",
    formType: "selectString",
    message: "請選擇 職稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    optionLabel: "label",
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "職稱", val: "TitleSystemLabel" },
  },
  {
    label: "委員名稱",
    name: "user",
    field: (row: { user: UserViewModel }) => row.user,
    align: "left",
    formType: "searchableSingleSelect",
    message: "請選擇管委會人員",
    isTable: true,
    isDialogForm: true,
    required: true,
    linkUrl: "onlyOpen",
    config: userConfig,
    optionLabel: (row: UserAccount) =>
      !row.addressPlates
        ? row.fullname
        : `${row.fullname} (${row.addressPlates
            .map((p) => p.houseNumber)
            .filter((value, index, self) => self.indexOf(value) === index)
            .join("、")})`,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "委員名稱", val: "UserName", isDefault: true },
  },
  {
    label: "電話",
    name: "phone",
    field: (row: { user: UserViewModel }) => row.user.contactNumber,
    align: "left",
    formType: "inputString",
    message: "請輸入 電話",
    isTable: true,
    isDialogForm: true,
    required: false,
    disable: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "電話", val: "ContactNumber" },
  },
  {
    label: "手機",
    name: "phoneNumber",
    field: (row: { user: UserViewModel }) => row.user.phoneNumber,
    align: "left",
    formType: "inputString",
    message: "請輸入 手機",
    isTable: true,
    isDialogForm: true,
    required: false,
    disable: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "手機", val: "PhoneNumber" },
  },
  {
    label: "email",
    name: "email",
    field: (row: { user: UserViewModel }) => row.user.email,
    align: "left",
    formType: "inputString",
    message: "請輸入 email",
    isTable: true,
    isDialogForm: true,
    required: false,
    disable: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "email", val: "Email" },
  },
  {
    label: "地址",
    name: "houseNumber",
    field: (row: { user: UserViewModel }) =>
      row.user.roleAddressPlates.length
        ? row.user.roleAddressPlates
            .flatMap((p) => p.addressPlates.map((a) => a.houseNumber))
            .filter((value, index, self) => self.indexOf(value) === index)
            .join("、")
        : "",

    align: "left",
    formType: "inputString",
    message: "請輸入 地址",
    isTable: true,
    isDialogForm: true,
    required: false,
    disable: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "地址", val: "AddressPlateHouseNumber" },
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
];
const managementCommittee = {
  // 新增社區委員
  apiPostData(payload: CommunityUserViewModel[]) {
    return req<ApiResponse<number>>("post", "/Community/user", payload);
  },
  // 修改社區委員
  apiPatchData(payload: CommunityUserViewModel[]) {
    return req<ApiResponse<boolean>>("patch", "/Community/user", payload);
  },
  // 查詢社區委員
  apiGetData(pagination: pagination) {
    return req<ApiRowsResponse<CommunityUserViewModel[]>>(
      "get",
      "/Community/user",
      pagination
    );
  },
  // 刪除社區委員
  apiDeleteData(payload: number[]) {
    return req<ApiResponse<boolean>>("delete", "/Community/user", payload);
  },
  // 社區管委會屆數查詢
  apiCommitteeSearch() {
    return req<ApiResponse<CommunityViewModel[]>>(
      "post",
      "/Community/collection"
    );
  },
  // 管委會改選
  apiCommitteeReElection(
    query: reElectionPayLoad,
    payload: CommunityUserViewModel[]
  ) {
    const { start, end } = query;
    return req<ApiResponse<boolean>>(
      "post",
      `/Community?start=${start}&end=${end}`,
      payload
    );
  },
  // 取得當屆社區管委會成員
  apiGetCommunities() {
    return req<ApiResponse<CommunityUserViewModel[]>>(
      "post",
      "/Community/users"
    );
  },
  // 社區管委會成員查詢(有過濾地址驗證)
  // TODO: 確認沒用後可刪除
  // apiGetCommunitiesWhoVerified() {
  //   return req<ApiResponse<UserViewModel[]>>("get", "/User/communityusers");
  // },
};

export default managementCommittee;
