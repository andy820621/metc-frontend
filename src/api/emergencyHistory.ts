import { req } from "boot/axios";
import type { TimeSpan, pagination } from "./api.type";
import { date } from "quasar";

export enum RecordTypes {
  PersonnelLocationRecord, // 人員位置紀錄
  EventHandlingRecord, // 事件處理紀錄
}

export interface EmergencyRecordViewModel {
  id?: number;
  nodeId: string;
  recordType: RecordTypes;
  dateTimeString: string;
  name?: string | null;
  label: string;
  chRecordType?: string; // 前端新增的
}

const EmergencyHistory = {
  // 新增緊急應變歷史紀錄
  apiPostData(payload: EmergencyRecordViewModel[]) {
    return req("post", "/Emergency", payload);
  },
  // 獲取緊急應變歷史紀錄 (分頁)
  apiGetData(pagination: pagination) {
    return req("get", "/Emergency/emergencyrecord", pagination);
  },
  // 獲取緊急應變歷史紀錄 (根據開始時間 ~ 結束時間，搜尋分頁)
  apiGetDataByTimeSpan(payload: pagination & TimeSpan) {
    return req("get", "/Emergency/emergencyrecord/range", payload);
  },
  // 獲取緊急應變歷史紀錄 (當週，搜尋分頁)
  apiGetDataByWeek(payload: pagination) {
    return req("get", "/Emergency/emergencyrecord/week", payload);
  },
  // 獲取緊急應變歷史紀錄 (當月，搜尋分頁)
  apiGetDataByMonth(payload: pagination) {
    return req("get", "/Emergency/emergencyrecord/month", payload);
  },
};

export default EmergencyHistory;

export function formatedEmergencyBlockData(data: EmergencyRecordViewModel[]) {
  return data.map((record) => {
    record.chRecordType =
      record.recordType === 0 ? "人員位置紀錄" : "事件處理紀錄";
    return record;
  });
}
