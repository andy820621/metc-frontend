import { req } from "boot/axios";
import type { pagination } from "./api.type";

export interface BasementViewModel {
  id?: number;
  name: string; // 必填
  sort: number; // 浮點數
  dataFileId?: number;
  floorPlanFileId?: number;
  evacuationRouteFileId?: number;
}
const basement = {
  // 取得社區所有之地下室資料
  apiGetBasement() {
    return req("post", "/Basement/collection");
  },
  // 新增地下室
  apiPostData(payload: BasementViewModel[]) {
    return req("post", "/Basement", payload);
  },
  // 修改地下室
  apiPatchData(payload: BasementViewModel[]) {
    return req("patch", "/Basement", payload);
  },
  // 查詢地下室
  apiGetData(pagination: pagination) {
    return req("get", "/Basement", pagination);
  },
  // 刪除地下室
  apiDeleteData(payload: number[]) {
    return req("delete", "/Basement", payload);
  },
};

export default basement;
