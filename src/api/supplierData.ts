import { req } from "boot/axios";
import type { ApiResponse, pagination } from "./api.type";
import System, { systemType, SystemViewModel } from "src/api/system";
import { tableConfigItem } from "src/utils/tableMixin";

export interface ProviderViewModel {
  id: number;
  system: SystemViewModel; // 必填
  name: string; // 必填
  businessProjects?: string;
  address?: string;
  collaborate?: boolean;
  note?: string | null;
  contactName?: string | null;
  contactNumber?: string | null;
  contactPhoneNumber?: string | null;
  contactEmail?: string | null;
  chargeName?: string | null;
  chargeNumber?: string | null;
  chargePhoneNumber?: string | null;
  chargeEmail?: string | null;
  chargeFaxNumber?: string | null;
}

const supplierData = {
  // 新增廠商供應商
  apiPostData(payload: ProviderViewModel) {
    return req("post", "/provider", payload);
  },
  // 修改廠商供應商
  apiPatchData(payload: ProviderViewModel) {
    return req("patch", "/provider", payload);
  },
  // 查詢廠商供應商
  apiGetData(pagination: pagination) {
    return req("get", "/provider", pagination);
  },
  // 刪除廠商供應商
  apiDeleteData(payload: number[]) {
    return req("delete", "/provider", payload);
  },
  // 取得維護廠商下拉選單
  apiGetProviders() {
    return req<ApiResponse<ProviderViewModel[]>>(
      "post",
      "/Provider/collection"
    );
  },
};

export default supplierData;

// 配合狀態下拉
export const collaborateOptions = [
  { label: "配合中", value: true },
  { label: "未配合", value: false },
];

// 產出類別下拉，並附值到 options
async function setSupplierCategories() {
  const result = await System.apiGetSystemItem(systemType.ContactUnitOptions);
  const supplierCategories =
    result?.data.map((item) => ({
      label: item.label,
      value: item.id as number,
    })) || [];
  for (const item of supplierDataConfig) {
    if (item.name === "system" && item.searchOption) {
      item.searchOption.options = supplierCategories;
      break;
    }
  }
}
setSupplierCategories();

export const supplierDataConfig: tableConfigItem[] = [
  {
    label: "類別",
    name: "system",
    field: (row: { system: SystemViewModel }) => row.system?.label,
    align: "left",
    formType: "selectString",
    message: "請輸入 類別",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用 (Equals 下拉)
    searchTitle: "類別",
    searchType: "singleSelect",
    searchOption: {
      val: "SystemId",
      // options: supplierCategories, // 這個值透過 setSupplierCategories 設定
      style: "padding: 0 .2rem 0 .6rem",
    },
  },
  {
    label: "公司名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 公司名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "公司名稱", val: "Name", isDefault: true },
  },
  {
    label: "經營項目",
    name: "businessProjects",
    field: "businessProjects",
    align: "left",
    formType: "textArea",
    message: "請輸入 經營項目",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "聯絡人姓名",
    name: "contactName",
    field: "contactName",
    align: "left",
    formType: "inputString",
    message: "請輸入 聯絡人姓名",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "聯絡人姓名", val: "ContactName" },
  },
  {
    label: "聯絡人電話",
    name: "contactNumber",
    field: "contactNumber",
    align: "left",
    formType: "phone",
    message: "請輸入 聯絡人電話",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "聯絡人電話", val: "ContactNumber" },
  },
  {
    label: "聯絡人手機",
    name: "contactPhoneNumber",
    field: "contactPhoneNumber",
    align: "left",
    formType: "cellPhone",
    message: "請輸入 聯絡人手機",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "聯絡人手機", val: "ContactPhoneNumber" },
  },
  {
    label: "聯絡人信箱",
    name: "contactEmail",
    field: "contactEmail",
    align: "left",
    formType: "email",
    message: "請輸入 聯絡人信箱",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "聯絡人信箱", val: "ContactEmail" },
  },
  {
    label: "主管姓名",
    name: "chargeName",
    field: "chargeName",
    align: "left",
    formType: "inputString",
    message: "請輸入 主管姓名",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "主管電話",
    name: "chargeNumber",
    field: "chargeNumber",
    align: "left",
    formType: "phone",
    message: "請輸入 主管電話",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "主管手機",
    name: "chargePhoneNumber",
    field: "chargePhoneNumber",
    align: "left",
    formType: "cellPhone",
    message: "請輸入 聯絡主管手機",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "主管信箱",
    name: "chargeEmail",
    field: "chargeEmail",
    align: "left",
    formType: "email",
    message: "請輸入 主管信箱",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "傳真號碼",
    name: "chargeFaxNumber",
    field: "chargeFaxNumber",
    align: "left",
    formType: "inputString",
    message: "請輸入 傳真號碼",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "公司地址",
    name: "address",
    field: "address",
    align: "left",
    formType: "inputString",
    message: "請輸入 公司地址",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "公司地址", val: "Address" },
  },
  {
    label: "配合狀態",
    name: "collaborate",
    field: "collaborate",
    align: "left",
    formType: "selectString",
    message: "請輸入 配合狀態",
    isTable: false,
    isDialogForm: true,
    required: false,
    // 進階搜尋用 (Equals 下拉)
    searchTitle: "配合狀態",
    searchType: "singleSelect",
    searchOption: {
      val: "Collaborate",
      options: collaborateOptions,
      style: "padding: 0 .2rem 0 .6rem",
    },
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
