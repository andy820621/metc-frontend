import { req } from "boot/axios";
import type { ApiResponse, pagination } from "./api.type";
import { SystemViewModel } from "./system";
import { UserViewModel } from "./accountSetting";
import { Reminds } from "./addressPlate";

// 排程
export interface JobViewModel {
  id?: number | null;
  date: SystemViewModel;
  remind: Reminds;
  days?: number | null;
  current: Date;
  completed: boolean;
  next: Date;
}
export interface BuildingViewModel {
  id?: number;
  name: string;
  address?: string;
  area?: number | null;
  height?: number | null;
  licenseNumber?: string | null;
  licenseDate?: string | null;
  groundFloor?: number | null;
  basementFloor?: number | null;
  fireManagers: UserViewModel[];
  phoneNumber?: string | null;
  use?: string | null;
  inspectionPlaceJob?: JobViewModel | null;
  publicPlaceJob?: JobViewModel | null;
  chairman?: UserViewModel | null;
  executiveSecretary?: UserViewModel | null;
  organizationFileId?: number | null;
  organizationFilePath?: number | null;
  protectionFileId?: number | null;
  protectionFilePath?: string | null;
}

const building = {
  // 新增大樓
  apiPostData(payload: BuildingViewModel) {
    return req("post", "/Building", payload);
  },
  // 編輯大樓
  apiPatchData(payload: BuildingViewModel) {
    return req("patch", "/Building", payload);
  },
  // 取得大樓
  apiGetData(payload: pagination) {
    return req("get", "/Building", payload);
  },
  // 刪除大樓
  apiDeleteData(payload: BuildingViewModel["id"][]) {
    return req("delete", "/Building", payload);
  },
  // 管理權人下拉選單
  apiGetByLandLord(Bid: BuildingViewModel["id"]) {
    return req("post", `/user/bylandlord?buildingId=${Bid}`, null);
  },

  // 主任委員、總幹事
  apiGetByCommunity(Bid: BuildingViewModel["id"]) {
    return req("post", `/user/bycommunity?buildingId=${Bid}`, null);
  },
  // 取得所有大樓
  apiGetAllBuilding() {
    return req<ApiResponse<BuildingViewModel[]>>(
      "post",
      "/building/collection"
    );
  },
  // 註冊頁面用
  // 取得所有大樓
  apiGetAnonymousAllBuilding() {
    return req("post", "/anonymous/buildings");
  },
};

export default building;
