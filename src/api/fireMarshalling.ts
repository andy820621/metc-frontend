import { req } from "boot/axios";
import { createPinia, storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
import type { ApiResponse } from "./api.type";
import type { SendLogViewModel } from "src/stores/signalR";

const buildingStore = useBuildingStore(createPinia());
const { Bid } = storeToRefs(buildingStore);

export enum Providers {
  SignalR = 1,
  LINE = 2,
  Message = 4,
  Notification = 8,
  Email = 16,
}
export enum Domains {
  Workflow,
  GroupTask,
  EmegencyNotice,
  FireGuide,
}

const fireMarshalling = {
  // 獲取防災中心訊息框歷史訊息
  apiGetHistoryMessage(buildingId: number, count = 100) {
    if (!buildingId) {
      console.error("buildingId is undefined!!!");
      return;
    }
    return req<ApiResponse<SendLogViewModel[]>>(
      "get",
      `/Send?buildingId=${buildingId}&domain=${Domains.EmegencyNotice}&provider=${Providers.SignalR}&count=${count}`
    );
  },
  // 獲取流程圖歷史紀錄
  apiGetWorkflowNodesRecord(count = 12, buildingId = Bid.value) {
    if (!buildingId) {
      console.error("buildingId is undefined!!!");
      return null;
    }
    return req<ApiResponse<SendLogViewModel[]>>(
      "get",
      `/Send?buildingId=${buildingId}&domain=${Domains.Workflow}&provider=${Providers.SignalR}&count=${count}`
    );
  },
  // 獲取是否通知消防隊的歷史紀錄
  apiGetFireGuideRecord(count = 12, buildingId = Bid.value) {
    if (!buildingId) {
      const Bid = localStorage.getItem("Bid");
      if (!Bid) {
        console.error("buildingId is undefined!!!");
        return false;
      } else {
        buildingId = +Bid;
      }
    }
    return req<ApiResponse<SendLogViewModel[]>>(
      "get",
      `/Send?buildingId=${buildingId}&domain=${Domains.FireGuide}&provider=${Providers.SignalR}&count=${count}`
    );
  },
};

export default fireMarshalling;
