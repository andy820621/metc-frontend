import { UserViewModel } from "src/api/accountSetting";
import { DeviceViewModel } from "src/api/device";
import { iconLabels } from "src/pages/emergency/flow/processIconOptions";
import { SendViewModel } from "src/stores/signalR";

export function fomateSendLogViewModelToSendViewModel(
  sendLogId: number,
  dateTime: string,
  message: { message: string; buildingId: number }
): SendViewModel {
  return {
    buildingId: message.buildingId,
    dateTime,
    domain: 9999,
    id: sendLogId,
    log: "",
    nodeType: iconLabels.CustomForSendLogViewModel,
    nodeLabel: message.message,
    porvider: 9999,
    stepExternalId: "test",
    user: null,
    workflowId: "test",
    workflowGroupId: 9999,
    provider: 1,
    firstDevice: {} as DeviceViewModel,
    triggerDevices: [],
    targets: null,
    roleName: "ContactFireBrigade",
    chRoleName: "聯絡消防隊",
    nodeTypeName: "聯絡消防隊",
    group: {
      classLeaderUserId: 9999,
      dutyType: 9999,
      id: 9999,
      area: "string",
      members: [],
      name: "string",
      otherDutyType: "string",
      role: "string",
    },
    positionUser: {} as UserViewModel,
  };
}
