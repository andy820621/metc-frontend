import { req } from "boot/axios";
import type { ApiResponse, pagination } from "./api.type";
import type { ReceiveViewModel } from "src/stores/deviceAddress";
import type { SendViewModel } from "src/stores/signalR";
import { date } from "quasar";
import type { FireStatus } from "src/pages/emergency/pplStatus/index.type";
import { Domains, Providers } from "src/api/fireMarshalling";
export enum formalOrEmergency {
  emergency = 1,
  normal = 2,
}
export interface BookViewModel {
  id?: number;
  name: string;
  casualty: string;
  receive: ReceiveViewModel;
  send: SendViewModel;

  // 手動新增的欄位
  location: string;
  start: string;
  end: string;
  lastTime: string;
  callTime: string;
}
export const bookConfig = [
  {
    label: "紀錄簿名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 紀錄簿名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    isTableSlot: true,
  },
  {
    label: "火災發生地點",
    name: "location",
    field: "location",
    align: "left",
    formType: "inputString",
    message: "請輸入 火災發生地點",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
  {
    label: "紀錄開始時間",
    name: "start",
    field: "start",
    align: "left",
    formType: "date",
    message: "請輸入 紀錄開始時間",
    isTable: true,
    isDialogForm: false,
    required: false,
    customDateFormat: "YYYY-MM-DD HH:mm:ss",
  },
  {
    label: "紀錄結束時間",
    name: "end",
    field: (row: BookViewModel) => row.send?.dateTime,
    align: "left",
    formType: "date",
    message: "請輸入 紀錄結束時間",
    isTable: true,
    isDialogForm: false,
    required: false,
    customDateFormat: "YYYY-MM-DD HH:mm:ss",
  },
  {
    label: "時長",
    name: "spendTime",
    field: (row: BookViewModel) =>
      `${
        row.send?.dateTime
          ? date.getDateDiff(
              row.send?.dateTime,
              row.receive?.dateTime,
              "minutes"
            )
          : "0"
      } 分鐘`,
    align: "left",
    formType: "inputString",
    message: "請輸入 時長",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
  {
    label: "人員傷亡",
    name: "casualty",
    field: "casualty",
    align: "left",
    formType: "inputString",
    message: "請輸入 人員傷亡",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
];

const Book = {
  // 判斷緊急應變、平時管理
  apiCheckEmergency() {
    return req("get", "/Book/channel");
  },
  // 狀況解除時，開始存取歷史紀錄簿
  apiPostSaveData(data: { sendId: number; name: string; casualty: string }) {
    // sendId:狀況解除的 send id、name:歷史紀錄簿的名稱、casualty:歷史紀錄簿的人員傷亡
    return req<ApiResponse<boolean>>(
      "post",
      `/Book?sendId=${data.sendId}&name=${data.name}&casualty=${data.casualty}`
    );
  },
  // 歷史紀錄簿查詢
  apiGetData(payload: pagination) {
    return req("get", "/Book", payload);
  },
  // 歷史紀錄簿修改
  apiPatchData(payload: BookViewModel) {
    return req("patch", "/Book", payload);
  },
  // 設備紀錄查詢
  apiGetBookDeviceaddress(bookId: BookViewModel["id"]) {
    return req("get", `/Book/deviceaddress?id=${bookId}`);
  },
  // 緊急應變歷史紀錄查詢
  apiGetBookEmergencyrecord(bookId: BookViewModel["id"]) {
    return req("get", `/Book/emergencyrecord?id=${bookId}`);
  },
  // 讀取send 資料歷史紀錄 (取得是否聯絡消防隊)
  apiGetBookSendFireGuide(bookId: BookViewModel["id"]) {
    return req(
      "get",
      `/Book/send?id=${bookId}&domain=${Domains.FireGuide}&provider=${Providers.SignalR}`
    );
  },
  // 讀取send 訊息對話框
  apiGetBookSendEmergencyNotice(bookId: BookViewModel["id"]) {
    return req(
      "get",
      `/Book/send?id=${bookId}&domain=${Domains.EmegencyNotice}&provider=${Providers.SignalR}`
    );
  },
  // 使用者、附屬帳號查詢
  apiGetBookuseraccounts(
    payload: pagination & { id: BookViewModel["id"] } & { status?: FireStatus }
  ) {
    return req("get", "/Book/useraccounts", payload);
  },
  // 避難狀況統計
  apiGetBookstats(bookId: BookViewModel["id"]) {
    return req("get", `/Book/stats?id=${bookId}`);
  },
  // 讀取發布任務
  apiGetBookGroupTask(bookId: BookViewModel["id"]) {
    return req("get", `/Book/grouptask?id=${bookId}`);
  },
  // 獲取歷史紀錄簿(根據開始時間 ~ 結束時間，搜尋分頁)
  apiGetDataByTimeSpan(payload: { start: string; end: string }) {
    return req("get", "/Book/range", payload); // 無實際 api 先寫著放
  },
  // 獲取歷史紀錄簿(當週，搜尋分頁)
  apiGetDataByWeek(payload: pagination) {
    return req("get", "/Book/week", payload); // 無實際 api 先寫著放
  },
  // 獲取歷史紀錄簿(當月，搜尋分頁)
  apiGetDataByMonth(payload: pagination) {
    return req("get", "/Book/month", payload); // 無實際 api 先寫著放
  },
};
export default Book;
