import { req } from "boot/axios";
import type { ApiResponse, ApiRowsResponse, pagination } from "./api.type";
import { UserViewModel } from "./accountSetting";

export interface NotifyViewModel {
  id: number;
  user: UserViewModel;
  dateTime: string;
}

export interface NotifyReadViewModel {
  id: string;
  notify: NotifyViewModel;
  user: UserViewModel;
  message: string;
  switch: number;
  read: boolean;
  title?: string; // 在前端生出來的 key
  dateTime?: string; // 在前端生出來的 key
}

const Notify = {
  // 通知已讀 (已讀)
  apiPatchData(payload: NotifyReadViewModel[]) {
    return req<ApiResponse<boolean>>("patch", "/Notify", payload);
  },
  // 獲取通知
  apiGetData(pagination: pagination) {
    return req<ApiRowsResponse<NotifyReadViewModel[]>>(
      "get",
      "/Notify",
      pagination
    );
  },
  // 獲取通知 (DialogTable)
  apiGetTableData(pagination: pagination) {
    return req<ApiRowsResponse<NotifyReadViewModel[]>>(
      "get",
      "/Notify",
      pagination
    );
  },
  // 通知刪除 (多筆)
  apiDeleteData(payload: string[]) {
    return req<ApiResponse<boolean>>("delete", "/Notify", payload);
  },
};

export default Notify;
