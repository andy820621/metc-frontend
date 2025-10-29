import { req } from "boot/axios";
import type {
  ApiResponse,
  ApiRowsResponse,
  pagination,
} from "./api.type";
import type { DeviceViewModel } from "./device";
import type { BuildingViewModel } from "./building";

export interface WorkflowTypeViewModel {
  id?: number;
  name: string;
  description?: string;
  buildings?: BuildingViewModel[];
  devices: DeviceViewModel[];
}

const WorkflowType = {
  // 新增流程圖種類
  apiPostData(payload: WorkflowTypeViewModel[]) {
    return req<ApiResponse<number[]>>("post", "/WorkflowType", payload);
  },
  // 編輯流程圖種類
  apiPatchData(payload: WorkflowTypeViewModel[]) {
    return req("patch", "/WorkflowType", payload);
  },
  // 取得流程圖種類
  apiGetData(payload: pagination) {
    return req<ApiRowsResponse<WorkflowTypeViewModel[]>>(
      "get",
      "/WorkflowType",
      payload
    );
  },
  // 刪除流程圖種類
  apiDeleteData(payload: WorkflowTypeViewModel["id"][]) {
    return req("delete", "/WorkflowType", payload);
  },
  // 取得所有流程圖種類
  apiGetAllFlowTypes() {
    return req<ApiResponse<WorkflowTypeViewModel[]>>(
      "post",
      "/WorkflowType/collection"
    );
  },
};

export default WorkflowType;
