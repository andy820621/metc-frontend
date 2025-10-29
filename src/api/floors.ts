import { req } from "boot/axios";
import type { ApiResponse, pagination } from "./api.type";
import type { BuildingViewModel } from "./building";
import type { AreaViewModel } from "./area";

export interface FloorViewModel {
  id?: number;
  building: BuildingViewModel;
  area?: AreaViewModel | null;
  name: string;
  isUnderground: boolean;
  dataFileId?: number | null;
  dataFilePath?: string | null;
  floorPlanFileId?: number | null;
  floorPlanFilePath?: string | null;
  evacuationRouteFileId?: number | null;
  evacuationRouteFilePath?: string | null;
  sort: number;
  floorZIndex?: number; // 前端新增的
  floor1?: number;
}
export interface withBuildingId extends pagination {
  buildingId: number;
}
export const floorConfig = [
  {
    label: "樓層名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 名稱",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "是否為地下樓層",
    name: "isUnderground",
    field: "isUnderground",
    align: "left",
    formType: "toggle",
    message: "請輸入 名稱",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "樓層群組/地區隊",
    name: "area",
    field: "area",
    align: "left",
    formType: "selectString",
    message: "請輸入 樓層群組/地區隊",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "樓層排序",
    name: "sort",
    field: "sort",
    align: "left",
    formType: "inputNumber",
    message: "請輸入 樓層排序",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
]
const floors = {
  // 新增樓層
  apiPostData(payload: FloorViewModel) {
    return req("post", "/Floor", payload);
  },
  // 編輯樓層
  apiPatchData(payload: FloorViewModel) {
    return req("patch", "/Floor", payload);
  },
  // 取得樓層
  apiGetTableData(payload: withBuildingId) {
    return req("get", "/Floor", payload);
  },
  // 刪除樓層
  apiDeleteData(payload: FloorViewModel["id"][]) {
    return req("delete", "/Floor", payload);
  },

  // 依據樓層ID，找出所有流程圖的節點
  apiGetFloorCNode(floorId: FloorViewModel["id"]) {
    return req("get", `/drawingControl/cNode/${floorId}`);
  },
  // 儲存該樓層圖控資料為txt
  apiSaveFloorGraphicFile(floorId: FloorViewModel["id"], formData: FormData) {
    return req<FormData>("uploadPatch", `/Floor/${floorId}/upload`, formData);
  },
  // 取得樓層圖控資料
  apiGetFloorGraphicFile(floorId: FloorViewModel["id"]) {
    return req("get", `/Floor/${floorId}/download`);
  },
  // 讀取下拉門牌地址
  apiGetFloors(floorId: FloorViewModel["id"]) {
    return req("post", `/AddressPlate/collection?floorId=${floorId}`);
  },
  // 設定樓層圖
  apiSetEvacuationFloorPlan(id: FloorViewModel["id"], path: string) {
    return req<ApiResponse<boolean>>(
      "patch",
      `/Floor/${id}/evacuationroute?path=${path}`
    );
  },
  // 設定起火樓層平面圖
  apiSetFireFloorPlan(id: FloorViewModel["id"], path: string) {
    return req<ApiResponse<boolean>>(
      "patch",
      `/Floor/${id}/floorplan?path=${path}`
    );
  },

  // 取得大樓所屬之樓層
  apiGetBuildingFloor(Bid: BuildingViewModel["id"]) {
    return req("post", `/Floor/collection?buildingId=${Bid}`);
  },

  // 註冊頁面用
  // 取得大樓所屬之樓層
  apiGetAnonymousBuildingFloor(Bid: BuildingViewModel["id"]) {
    return req("post", `/anonymous/floors?buildingId=${Bid}`);
  },
  // 取得樓層所屬之門牌地址
  apiGetAnonymousBuildingFloorAddressplate(floorId: FloorViewModel["id"]) {
    return req("post", `/anonymous/addressplates?floorId=${floorId}`);
  },
};

export default floors;
