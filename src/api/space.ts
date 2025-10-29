import type { FloorViewModel } from "./floors";
import { req } from "boot/axios";
import type { pagination } from "./api.type";
import type { BuildingViewModel } from "./building";

export interface SpaceViewModel {
  id?: string;
  previous: FloorViewModel; // 必填
  next: FloorViewModel; // 必填
  name?: string;

  // 前端用
  firstBuilding?: BuildingViewModel;
  secondBuilding?: BuildingViewModel;
}
export const spaceConfig = [
  {
    label: "共用樓層名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 共用樓層名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "共用樓層名稱", val: "Name", isDefault: true },
  },
  {
    label: "第一個大樓",
    name: "firstBuilding",
    field: "firstBuilding",
    align: "left",
    formType: "selectString",
    message: "請選擇 大樓",
    isTable: false,
    isDialogForm: true,
    required: true,
    disable: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "第一個大樓", val: "PreviousBuildingName" },
  },
  {
    label: "第一個樓層",
    name: "previous",
    field: (row: { previous: FloorViewModel }) =>
      row.previous?.building.name + " - " + row.previous?.name,
    align: "left",
    formType: "selectString",
    message: "請選擇 樓層",
    isTable: true,
    isDialogForm: true,
    required: true,
    disable: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "第一個樓層", val: "PreviousFloorName" },
  },
  {
    label: "第二個大樓",
    name: "secondBuilding",
    field: "secondBuilding",
    align: "left",
    formType: "selectString",
    message: "請選擇 大樓",
    isTable: false,
    isDialogForm: true,
    required: true,
    disable: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "第二個大樓", val: "NextBuildingName" },
  },
  {
    label: "第二個樓層",
    name: "next",
    field: (row: { next: FloorViewModel }) =>
      row.next?.building.name + " - " + row.next?.name,
    align: "left",
    formType: "selectString",
    message: "請選擇 樓層",
    isTable: true,
    isDialogForm: true,
    required: true,
    disable: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "第二個樓層", val: "NextFloorName" },
  },
];
const space = {
  // 新增共用樓層
  apiPostData(payload: SpaceViewModel[]) {
    return req("post", "/space", payload);
  },
  // 修改共用樓層
  apiPatchData(payload: SpaceViewModel[]) {
    return req("patch", "/space", payload);
  },
  // 查詢共用樓層
  apiGetData(pagination: pagination) {
    return req("get", "/space", pagination);
  },
  // 刪除共用樓層
  apiDeleteData(payload: number[]) {
    return req("delete", "/space", payload);
  },
};

export default space;
