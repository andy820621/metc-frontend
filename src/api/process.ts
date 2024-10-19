import { NodeViewModel } from "./../stores/signalR";
import { req } from "boot/axios";
import { serverDataType } from "src/pages/emergency/flow/flowTypes";
import { WorkflowTypeViewModel } from "./workflowType";
import { ApiResponse } from "./api.type";
// import { NodeViewModel } from "srr";

interface EdgeViewModel {
  id: string; // Guid in C# is mapped to string in TypeScript
  type: string;
  sourceId: string;
  targetId: string;
  label?: string | null;
  markerEnd: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
}

export interface WorkflowViewModel {
  id?: string;
  version: number;
  buildingId: number;
  groupId: number;
  type: WorkflowTypeViewModel;
  description: string;
  nodes: NodeViewModel[];
  edges: EdgeViewModel[];
  position?: [number, number];
  zoom?: number;
}

interface StartWorkflowPayload {
  id: string;
  version: number;
  testable: boolean;
  inputs?: {
    title: string;
  };
  reference?: string;
}
export interface workflowData {
  description: string;
  type: WorkflowTypeViewModel;
  groupId: number;
}

const process = {
  // 獲取消防編組角色清單
  apiGetFireMarchallingRoleLists() {
    return req("get", "/Workflow/workflows");
  },
  // 建新的流程圖
  apiAddNewProcess(payload: workflowData) {
    return req<ApiResponse<string | null>>("post", "/Workflow", payload);
  },
  // 更改流程圖名稱
  apiChangeProcessName(payload: workflowData) {
    return req<ApiResponse<boolean | null>>("put", "/Workflow", payload);
  },
  // 確認流程圖在記憶體運行狀況
  apiCheckProcessStatus(id: string) {
    return req("get", `/Workflow/status?id=${id}`);
  },
  // 刪除該 id 的流程圖
  apiDeleteProcess(id: string) {
    return req("delete", `/Workflow?id=${id}`);
  },
  // 儲存/更新 流程圖節點資料
  apiSaveOrUpdateProcessNodeData(payload: serverDataType, newVersion = true) {
    return req<serverDataType>(
      "patch",
      `/Workflow?newVersion=${newVersion}`,
      payload
    );
  },
  // 獲取該 id 的流程圖節點資料
  apiGetProcessNodeData(id: string, version: number) {
    return req<ApiResponse<WorkflowViewModel>>(
      "get",
      `/Workflow/${id}/${version}`
    );
  },
  // 啟動該 id 之流程圖
  apiStartProcess(queryObject: StartWorkflowPayload) {
    const { id, version, testable, reference } = queryObject;
    return req(
      "post",
      `/Workflow/${id}?version=${version}&testable=${testable}&reference=${
        reference || ""
      }`
    );
  },
  /**
   * 觸發指定 id 的等待節點，使其繼續執行下面的流程。
   * @param {string} params.eventName - 節點 stepDefinitions 中的 value。例如: "InPosition", "Not", "Fire", "Failure" 等。
   * @param {string} params.eventKey - 格式為 `${nodeKey}@${instantId}` 的節點識別符。其中，`nodeKey` 是該節點的 id（前端產生的 uuid），`instantId` 是正在執行的流程圖的 id（在開始後通過 API 獲得）。
   */
  apiTriggerWaitingNode({
    eventKey,
    eventName,
    buildingId,
  }: {
    eventName: string;
    eventKey: string;
    buildingId: number;
  }) {
    const eventData = {};
    return req(
      "post",
      `/Workflow/${eventName}/${eventKey}?buildingId=${buildingId}`,
      eventData
    );
  },
  // 獲取當下所有流程圖運作期間被觸發的設備 (起火層、延燒層)
  apiGettriggerdevices() {
    return req("get", "/Workflow/triggerdevices");
  },
};

export default process;
