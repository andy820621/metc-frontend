import { req } from "boot/axios";
import type { ApiResponse, ApiRowsResponse, pagination } from "./api.type";

export interface ScreenViewModel {
  id?: number;
  menuName: string;
  index: number;
}

const Screen = {
  // 新增維修保養(維保大項)
  apiPostData(payload: ScreenViewModel[]) {
    return req("post", "/Screen", payload);
  },
  // 修改維修保養(維保大項)
  apiPatchData(payload: ScreenViewModel[]) {
    return req("patch", "/Screen", payload);
  },
  // 查詢維修保養(維保大項)
  apiGetData(pagination: pagination) {
    return req<ApiRowsResponse<ScreenViewModel[]>>(
      "get",
      "/Screen",
      pagination
    );
  },
  // 刪除維修保養(維保大項)
  apiDeleteData(payload: number[]) {
    return req("delete", "/Screen", payload);
  },
  // 取得動態螢幕設定
  apiGetScreenData() {
    return req<ApiResponse<ScreenViewModel[]>>("post", "/Screen/collection");
  },
  // 取得符合防災中心權限的選單
  apiGetScreenMenus() {
    return req<ApiResponse<string[]>>("get", "/Screen/menus");
  },
};

export default Screen;
