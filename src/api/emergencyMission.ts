import type { pagination } from "./api.type";
import { req } from "boot/axios";
import { storeToRefs } from "pinia";
import { date } from "quasar";
import { useBuildingStore } from "src/stores/building.js";
import { setStatus } from "src/utils/missionListFormater";
import type { UserViewModel } from "./accountSetting";
import type { BuildingViewModel } from "./building";
import type { DeviceViewModel } from "./device";
import type { RoleViewModel } from "./role";

const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);
export interface GroupTaskViewModel{
  id:number;
  role:RoleViewModel;
  building:BuildingViewModel;
  device:DeviceViewModel;
  receiveUser:UserViewModel;
  receiveTime:string;
  needSupport:boolean;
  sendUser:UserViewModel;
  sendTime:string;
  content:string;
  isCancelled:boolean;
  isCompleted:boolean;
  // 轉換後的屬性
  sendUserName?: string;
  deviceName?: string;
  createTime?: string;
  status?: string;
}
export interface postMissionParams {
  roleName: string;
  buildingId?: number;
  deviceId?: number;
  content: string;
}
export const emgyMissionTableConfig = [
  {
    label: "發布者",
    name: "sendUserName",
    field: (row: { sendUser: UserViewModel }) => row.sendUser.fullname,
    align: "left",
  },
  {
    label: "接收班別",
    name: "receiveUserClass",
    field: (row: GroupTaskViewModel) => row.role?.description,
    align: "left",
  },
  {
    label: "發布時間",
    name: "createTime",
    field: (row: GroupTaskViewModel) =>
      date.formatDate(new Date(row.sendTime), "YYYY-MM-DD HH:mm:ss"),
    align: "left",
  },
  {
    label: "接收時間",
    name: "receiveTime",
    field: (row: GroupTaskViewModel) =>
      date.formatDate(
        new Date(row.receiveTime),
        "YYYY-MM-DD HH:mm:ss"
      ),
    align: "left",
  },
  {
    label: "設備名稱",
    name: "deviceName",
    field: (row: GroupTaskViewModel) => (row.device ? row.device.name : ""),
    align: "left",
  },
  {
    label: "任務狀態",
    name: "status",
    field: (row: GroupTaskViewModel) => setStatus(row),
    align: "left",
  },
  {
    label: "任務內容",
    name: "content",
    field: "content",
    align: "left",
  },
];

export const missionListTableConfig = [
  {
    label: "完成狀況",
    name: "status",
    field: (row: GroupTaskViewModel) => setStatus(row),
    align: "left",
    formType: "status",
    message: "請選擇 完成狀況",
    isTable: true,
    isDialogForm: false,
    required: false,
    isTableSlot: true,
  },
  {
    label: "任務發布時間",
    name: "createTime",
    field: (row: GroupTaskViewModel) =>
      date.formatDate(new Date(row.sendTime), "YYYY-MM-DD HH:mm:ss"),
    align: "left",
    formType: "inputString",
    message: "請選擇 任務發布時間",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
  {
    label: "設備名稱",
    name: "deviceName",
    field: (row: GroupTaskViewModel) => (row.device ? row.device.name : ""),
    align: "left",
    message: "請選擇 設備名稱",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
  {
    label: "任務內容",
    name: "content",
    field: "content",
    align: "left",
    formType: "inputString",
    message: "請選擇 任務內容",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
  {
    label: "接收者",
    name: "receiveUser",
    field: (row: { receiveUser: UserViewModel }) => row.receiveUser?.fullname,
    align: "left",
    formType: "inputString",
    message: "請選擇 發布者",
    isTable: true,
    isDialogForm: false,
    required: false,
  },
]
const emergencyMission = {
  // 取得班別清單
  apiGetClassLists(params: pagination) {
    return req("get", "/Group", params);
  },

  // 發布任務
  apiPostMission(params: postMissionParams) {
    const { roleName, deviceId, content } = params;
    const buildingId = params.buildingId ?? Bid.value;
    if (!deviceId) {
      return req(
        "post",
        `/GroupTask?roleName=${roleName}&buildingId=${buildingId}&content=${content}`
      );
    }
    return req(
      "post",
      `/GroupTask?roleName=${roleName}&buildingId=${buildingId}&deviceId=${deviceId}&content=${content}`
    );
  },
  // 取得任務
  apiGetMissionLists(params: {
    filter:string,
    page: number,
    rowsPerPage: number,
    roleName: string
  }) {
    return req("get", "/GroupTask", params);
  },
  // 取消任務
  apiCancelMission(id: number) {
    return req("patch", `/GroupTask/${id}/cancel`);
  },
  // 接收任務
  apiReceiveMission(id: number) {
    return req("patch", `/GroupTask/${id}/receive`);
  },
  // 支援任務請求
  apiSupportRequest(id: number) {
    return req("patch", `/GroupTask/${id}/need`);
  },
  // 完成任務
  apiMissionAccomplished(id: number) {
    return req("patch", `/GroupTask/${id}/complete`);
  },
};

export default emergencyMission;
