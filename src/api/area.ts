import { req } from "boot/axios";
import { useBuildingStore } from "src/stores/building.js";
import { storeToRefs } from "pinia";
const buildingStore = useBuildingStore();
import type { pagination } from "./api.type";
import { BuildingViewModel } from "./building";

const { Bid } = storeToRefs(buildingStore);
export interface AreaViewModel {
  id?: number;
  name: string;
  description?: string | null;
  building: BuildingViewModel;
}

// 樓層群組 config
export const areaConfig = [
  {
    label: "名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "名稱", val: "Name", isDefault: true },
  },
  {
    label: "描述",
    name: "description",
    field: "description",
    align: "left",
    formType: "inputString",
    message: "請輸入 描述",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "描述", val: "Description" },
  },
];
const Area = {
  // 新增樓層群組
  apiPostData(payload: AreaViewModel) {
    return req("post", "/Area", payload);
  },
  // 編輯樓層群組
  apiPatchData(payload: AreaViewModel) {
    return req("patch", "/Area", payload);
  },
  // 取得樓層群組
  apiGetData(payload: pagination) {
    if (!Bid.value) console.error("沒有獲取到 Bid");
    payload.buildingId = Bid.value;
    return req("get", "/Area", payload);
  },
  // 刪除樓層群組
  apiDeleteData(payload: AreaViewModel["id"][]) {
    return req("delete", "/Area", payload);
  },
  //  樓層群組的下拉選單
  apiGetArea(bid: BuildingViewModel["id"]) {
    if (!bid) console.error("沒有獲取到 bid");
    return req("post", `/Area/collection?buildingId=${bid}`, null);
  },
};

export default Area;
