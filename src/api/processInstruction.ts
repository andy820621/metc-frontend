import { req } from "boot/axios";
import type { ApiResponse, pagination } from "./api.type";

export interface StepViewModel {
  id?: number;
  isSatart: boolean;
  nodeType: number;
  name?: string;
  stepType?: string;
  iconImg?: string; // 前端附值
}

const processInstruction = {
  // 取得流程指令 - 節點類型的下拉選單
  apiGetNodeType() {
    return req<ApiResponse<StepViewModel[]>>("post", "/Step/collection");
  },
  // 新增流程指令
  apiPostData(payload: StepViewModel) {
    return req("post", "/Step", payload);
  },
  // 編輯流程指令
  apiPatchData(payload: StepViewModel) {
    return req("patch", "/Step", payload);
  },
  // 取得分頁內容
  apiGetData(payload: pagination) {
    return req("get", "/Step", payload);
  },
  // 刪除流程指令
  apiDeleteData(payload: StepViewModel["id"][]) {
    return req("delete", "/Step", payload);
  },
};

export default processInstruction;
