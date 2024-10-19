import { req } from "boot/axios";
import type { ApiResponse, pagination } from "./api.type";

export enum systemType {
  ContactUnitOptions, // 廠商類別
  MaintainContentOptions, // 維護保養內容
  EmergencyNotice, // 緊急通知罐頭訊息
  GroupTask, // 發布任務內容預設
  Reminder, // 提醒事項
  Contact, // 防災中心聯絡方式
  InspectionTypeOfTime, // 檢修申報期限設定
  PublicSafeTypeOfTime, // 公安申報期限設定
  CommunityUserTitle, // 社區管委會成員稱謂
}

export interface QuasarQuery {
  [index: number]: {
    filter:string;
    page:number;
    rowsPerPage:number;
  };
}
export interface SystemViewModel {
  id?: number | null;
  type: systemType;
  label: string;
  yearValue?: number | null;
  monthValues?: number[] | null;
  order: number;
}
const System = {
  // 新增系統設定
  apiPostData(payload: SystemViewModel) {
    return req("post", "/System", payload);
  },
  // 編輯系統設定
  apiPatchData(payload: SystemViewModel) {
    return req("patch", "/System", payload);
  },
  // 取得系統設定
  apiGetData(payload: pagination) {
    return req("get", "/System", payload);
  },
  // 刪除系統設定
  apiDeleteData(payload: SystemViewModel["id"][]) {
    return req("delete", "/System", payload);
  },
  apiGetMultiSystem(payload: QuasarQuery) {
    return req("post", "/System/multi", payload);
  },
  apiGetSystemItem(type: systemType) {
    return req<ApiResponse<SystemViewModel[]>>(
      "post",
      `/System/collection?type=${type}`
    );
  },
};

export default System;
