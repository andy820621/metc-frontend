import { FloorViewModel } from 'src/api/floors';
import { BuildingViewModel } from 'src/api/building';
import Book, { formalOrEmergency } from 'src/api/book';
// quasar
import { Cookies, Dialog, Notify, date } from 'quasar';
// utils
import { GroupTaskViewModel } from 'src/api/emergencyMission';

// type
import { FireStatus } from 'src/pages/emergency/pplStatus/index.type';
import { NotifyReadViewModel } from 'src/api/notify';
import { iconLabels } from 'src/pages/emergency/flow/processIconOptions';
import { UserViewModel } from 'src/api/accountSetting';
import { Providers } from 'src/api/fireMarshalling';
import { DeviceViewModel } from 'src/api/device';
// pinia
import { defineStore, storeToRefs } from 'pinia';
import { useUserStore } from 'src/stores/user';
import { useDeviceAddressStore } from 'src/stores/deviceAddress';
import type { ReceiveViewModel } from 'src/stores/deviceAddress';
import { fomateSendLogViewModelToSendViewModel } from 'src/utils/defaultUtils';
import { RoleViewModel } from 'src/api/role';
import { setStatus } from 'src/utils/missionListFormater';
import { beep } from 'src/utils/beep';

// 流程圖節點 type
type EventBtnName = string;
type NodeTypeId = number;
type NodeTypeIdAndLabel = [NodeTypeId, EventBtnName];
type WorkflowNodeId = string;
type Json = string;
type Targets = {
  [key: WorkflowNodeId]: NodeTypeIdAndLabel;
};
export enum RoleNameToChName {
  System = '系統管理員',
  Manager = '防火管理人',
  Landlord = '房東',
  Provider = '供應商',
  User = '一般使用者',
  SecurityGuard = '保全',
  FireBrigade = '消防隊',
  Mercury = '水星防火',
  Fire = '滅火班',
  Inform = '通報班',
  EvacuationGuide = '避難引導班',
  SafetyProtection = '安全防護班',
  Ambulance = '救護班',
  Center = '防災中心',
  Member = '住戶',
}
interface StepViewModel {
  id: number;
  name: string;
  isStart?: boolean;
  nodeType: { key: number; value: string };
  icon: string;
  stepType: string;
}
export interface NodeViewModel {
  id: string;
  workflowDefinitionId: string;
  version: number;
  stepDefinition: StepViewModel;
  label: string;
  roleName?: string | null;
  nextWorkflowDefinitionId?: string | null;
  message?: string | null;
  position?: [number, number] | null;
  class?: string | null;
  period?: string | null;
}
export interface SendViewModel {
  buildingId: number;
  dateTime: string;
  domain: number;
  id: number;
  log: Json;
  nodeType: number;
  nodeLabel: string;
  porvider: number;
  stepExternalId: string;
  user: UserViewModel | null;
  workflowId: string;
  workflowGroupId: number;
  provider: Providers;
  workflowInstanceId?: string;
  externalNode?: NodeViewModel;
  firstDevice: DeviceViewModel;
  triggerDevices: DeviceViewModel[];
  targets: Targets | null;
  // 手動加上去的
  roleName: string;
  chRoleName: string;
  nodeTypeName: string;
  group: {
    classLeaderUserId: number;
    dutyType: number;
    id: number;
    area: string;
    members: string[];
    name: string;
    otherDutyType: string;
    role: string;
  };
  positionUser: UserViewModel;
}
export interface SendLogViewModel extends SendViewModel {
  log: string;
  message?: string; // 後端 format 過後的 message
}

export interface StepData {
  workflowId: string;
  workflowDefinitionId: string;
  stepId: number;
  stepExternalId: string;
  nodeType: number; // 用他對出 nodeTypeName
  nodeLabel: string;
  testable: boolean;
  dateTime: string;
  firstDevice: DeviceViewModel;
  triggerDevices: DeviceViewModel[];
  building: {
    address: string;
    area: number;
    id: number;
    name: string;
    phoneNumber: string;
  };
  group: {
    classLeaderUserId: number;
    dutyType: number;
    id: number;
    area: string;
    members: string[];
    name: string;
    otherDutyType: string;
    role: string;
  };
  timeSpan?: string;
  nextWorkflowDefinitionId?: string;
  roleName?: string;
  message?: string;
  targets: Targets | null;
  publishs: SendViewModel[];
  // 手動加上去的
  nodeTypeName: string;
}

export interface EventData {
  dateTime: string;
  workflowInstanceId: string;
  stepExternalId: string;
  node: NodeViewModel;
  nodeTypeName: string;
  user: UserViewModel;
  groupId: number;
}
export interface WaitingBtn {
  btnName: string;
  eventName: string;
  eventKey: string;
  value?: string;
}

interface emergencyHubPayload {
  BuildingId: number;
  RoleNames?: string[];
  Messages?: string;
}
interface sendEmergencyMessagePayload extends emergencyHubPayload {
  Message: string;
}
interface Hub {
  connection?: any;
}
interface emergencyHub extends Hub {
  sendEmergencyMessage?: (submitData: sendEmergencyMessagePayload) => void;
  sendLocationRequest?: (submitData: emergencyHubPayload) => void;
  sendRetreatRequest?: (submitData: emergencyHubPayload) => void;
  sendContactFireBrigadeRequest?: (submitData: emergencyHubPayload) => void;
}

export interface TriggeredDeviceData {
  building: BuildingViewModel;
  floor: FloorViewModel;
  floors: FloorViewModel[] | null | undefined;
  location: DeviceViewModel['location'];
  id?: number;
}

export const useSignalRStore = defineStore('signalR', () => {
  // Pinia Data
  const userStore = useUserStore();
  const { userData, marshallingName, roleName, isCenter } =
    storeToRefs(userStore);

  // 流程圖相關變數
  const initialDetector = ref<TriggeredDeviceData>(); // 紀錄初始觸發的設備
  const triggeredDevices = ref<TriggeredDeviceData[]>([]); // 紀錄被觸發的設備
  const triggerTime = ref<string>(''); // 記錄觸發時間
  const onFireBuildings = ref<BuildingViewModel[]>([]); // 紀錄有起火的大樓
  const processRunning = ref<boolean>(false); // 是否有啟動應變
  const nodeResult = ref<StepData[]>([]); // 節點結果
  const nodeEnd = ref<{ sendLogId: number; data: StepData }>(); // 統計結束
  const fireStopNode = ref<{ sendLogId: number; data: StepData }>(); // 統計結束後的結束點
  const isSavedEmergencyRecordData = ref<boolean>(); // 編組頁面已儲存紀錄資料
  const nodeRecord = ref<{ [groupId: string]: SendViewModel[] }>({}); // 起始到最新節點紀錄
  const nodeResultFormatAsNodeRecord = ref<SendViewModel[]>([]);
  const waitingBtnObject = ref<{ [key: string]: WaitingBtn[] }>({}); // 流程圖按鈕
  const unClickedBtnObject = ref<{ [key: string]: WaitingBtn[] }>({});
  const locationRecord = ref<{
    [roleName: string]: { [btnName: string]: string[] };
  }>({}); // 已定位、已撤退人員記錄
  const locationRecordByGroupId = ref<{
    [groupId: number]: { [btnName: string]: string[] };
  }>({}); // 已定位、已撤退人員記錄
  const userWhoConfirmedFire = ref<UserViewModel[]>([]); // 確認為火災的使用者
  const userWhoConfirmedNotFire = ref<UserViewModel[]>([]); // 確認為非火災的使用者
  const confirmFireTime = ref();
  const fireResultNode = ref(); // 滅火成功、失敗的節點
  const phoneStickyMsg = ref<{ [roleName: string]: string }>({}); // 手機置頂訊息
  const isBegin = ref(false); // 是否跑到統計開始節點
  const broadStatistic = ref<{ [key: string]: number }>({}); // 緊急應變時，住戶人數廣播
  // 緊急通知訊息對話框
  const emergencyMsgVisible = ref(false);
  interface emergencyMsgType {
    sendLogId: number;
    dateTime: string;
    notice?: { message: string; buildingId: number; roleNames: string[] };
    message?: string;
  }
  interface ContactFireBrigade {
    sendLogId: number;
    dateTime: string;
    message: { message: string; buildingId: number };
  }
  const emergencyMsg = ref<emergencyMsgType>();
  const contactFireBrigade = ref<ContactFireBrigade>(); // 防災中心聯繫消防隊
  // 任務發布 WS
  const emgMission = reactive<{ [key: string]: GroupTaskViewModel }>({});
  const emgMissionVisible = ref(false);
  const emgMissionWs = ref();
  // pinia
  const deviceAddressStore = useDeviceAddressStore();

  const notifyWsData = ref<NotifyReadViewModel>();
  // Hubs
  const emergencyHub = reactive<emergencyHub>({ connection: undefined });
  const mqttHub = reactive<Hub>({ connection: undefined });
  const fireHub = reactive<Hub>({ connection: undefined });
  const notifyHub = reactive<Hub>({ connection: undefined });

  // 初始化所有 Hubs
  async function initWebSocket(accessToken: string) {
    // 初始化緊急應變 Hub
    initConnection(emergencyHub as Hub, 'emergency', accessToken);
    // 連接緊急應變 Hub
    startConnectionWithReconnect(
      emergencyHub.connection as any,
      initEmergencyHubFunction
    );

    // 初始化 mqtt Hub
    initConnection(mqttHub as Hub, 'mqtt', accessToken);
    // 連接 mqtt Hub
    startConnectionWithReconnect(
      mqttHub.connection as any,
      initMqttHubFunction
    );

    // 初始化 fireHub
    initConnection(fireHub as Hub, 'fire', accessToken);
    // 連接 fire Hub
    startConnectionWithReconnect(
      fireHub.connection as any,
      initFireHubFunction
    );

    // 初始化 notifyHub
    initConnection(notifyHub as Hub, 'notify', accessToken);
    // 連接 notify Hub
    startConnectionWithReconnect(
      notifyHub.connection as any,
      initNotifyHubFunction
    );
  }
  // 初始化 Hub
  function initConnection(Hub: Hub, hubName: string, accessToken: string) {
    console.log('initConnection');
  }

  // 連接 Hub 方法
  async function startConnectionWithReconnect(connection: any, cb: () => void) {
    console.log('startConnectionWithReconnect');
  }
  async function startConnection(connection: any, cb: () => void) {
    console.log('startConnection');
  }
  // 初始化緊急應變 Hub 相關 method
  function initEmergencyHubFunction() {
    console.log('允許通知 => 連接成功');
    // 接收流程圖節點的 WS 方法
    emergencyHub.connection?.on(
      'ReceiveNodeMessage',
      async (sendLogId: number, data: StepData) => {
        console.log('ReceiveNodeMessage', { sendLogId, data });
        // 初始節點、探測器動作 => 流程圖開始跑起

        const result = (await Book.apiCheckEmergency()) as typeof AxiosResponse;
        if (result.data === formalOrEmergency.emergency) {
          processRunning.value = true;
        }

        const { firstDevice, triggerDevices } = data;
        if (data.nodeType === iconLabels.Start) {
          if (!initialDetector.value && firstDevice) {
            const { building, floor, floors, location, id } = firstDevice;
            const fireBid = localStorage.getItem('fireBuilding');
            console.log('firstDevice', firstDevice);
            if (!fireBid && building.id && floor) {
              initialDetector.value = {
                building,
                floor,
                floors,
                location: location || '',
                id,
              };

              const nowBid = localStorage.getItem('Bid');
              if (nowBid && building.id !== +nowBid) {
                localStorage.setItem('Bid', building.id.toString());
                history.go(0);
              }
            }
          }
        }
        // 記錄所有 trigger 的設備
        if (
          triggerDevices?.length &&
          triggerDevices.length > (triggeredDevices.value.length || 0)
        ) {
          onFireBuildings.value = Array.from(
            new Set(triggerDevices.map((device) => device.building))
          );
          triggeredDevices.value = triggerDevices.map((item) => ({
            building: item.building,
            floor: item.floor as FloorViewModel,
            floors: item.floors as FloorViewModel[],
            location: item.location || '',
            id: item.id,
          }));
          if (!initialDetector.value) {
            initialDetector.value = triggeredDevices.value[0];
            console.log('initialDetector 在 signalR 有附值');
          }
        }

        data.nodeTypeName = iconLabels[data.nodeType];
        data.dateTime = date.formatDate(
          new Date(data.dateTime),
          'YYYY-MM-DD HH:mm:ss'
        );
        nodeResult.value.push(data);

        //! 生出 nodeResultFormatAsNodeRecord
        const nodeRecordData = {
          firstDevice: data.firstDevice,
          buildingId: data.building.id,
          dateTime: data.dateTime,
          externalNode: { id: data.stepExternalId },
          group: data.group,
          nodeLabel: data.nodeLabel,
          nodeType: data.nodeType,
          workflowGroupId: data.group.id,
          workflowId: data.workflowId,
          roleName: data.roleName,
          chRoleName:
            RoleNameToChName[data.roleName as keyof typeof RoleNameToChName] ||
            '',
        };
        nodeResultFormatAsNodeRecord.value.push(
          nodeRecordData as SendViewModel
        );

        const nodeRoleName = data.roleName;
        if (data.nodeType === iconLabels.Wait) {
          console.log('now nodeType is 0, and now nodeData: ', data);
          // 一般節點 => targets 為其下方的等待節點的 nodeId: nodeTypeId => 生出 WaitingBtn
          if (typeof data.targets === 'object' && data.targets !== null) {
            console.log('now data.targets', data.targets);

            if (!nodeRoleName) return;
            waitingBtnObject.value[nodeRoleName] = [];
            Object.entries(data.targets).forEach(
              ([nodeKey, [nodeTypeId, btnName]]) => {
                const eventKey = `${nodeKey}@${data.workflowId}`;
                const eventName = iconLabels[nodeTypeId];
                waitingBtnObject.value[nodeRoleName].push({
                  btnName,
                  eventName,
                  eventKey,
                });
              }
            );
            console.log('now waitingBtnObject', waitingBtnObject.value);
          }
        } else if (
          nodeRoleName &&
          data.message &&
          data.nodeType === iconLabels.Broadcast
        ) {
          if (phoneStickyMsg.value[nodeRoleName] !== data.message) {
            phoneStickyMsg.value[nodeRoleName] = data.message;
          }
        } else if (data.nodeType === iconLabels.Start) {
          // 起始點 - 探測器動作節點
          triggerTime.value = date.formatDate(
            new Date(data.dateTime),
            'YYYY-MM-DD HH:mm:ss'
          );
        } else if (data.nodeType === iconLabels.Stop && nodeEnd.value) {
          // 是`結束點`且`狀況解除`已被按過且已跑到`統計結束` => 緊急應變結束
          processRunning.value = false;
          fireStopNode.value = { sendLogId, data };
          userWhoConfirmedFire.value = [];
          userWhoConfirmedNotFire.value = [];

          localStorage.removeItem('fireBuilding');
          localStorage.removeItem('fireFloor');
          localStorage.removeItem('fireDeviceId');
          localStorage.removeItem('hasOpenedMonitors'); // 清除標記是否已開啟監控器

          // 結束後要求使用者重新刷
          const roles = Cookies.get('roles') as RoleViewModel[];
          const roleNames = roles.map((item) => item.name);
          if (!roleNames.includes('Center')) {
            setTimeout(() => {
              Dialog.create({
                title: '緊急應變已結束',
                message: '請重新刷新頁面',
                persistent: true,
              }).onOk(() => {
                history.go(0);
              });
            }, 2000);
          }
        }

        // 更新到目前最新節點的紀錄
        const workflowGroupId = data.group.id;
        if (nodeRecord.value[workflowGroupId]) {
          nodeRecord.value[workflowGroupId].length = 0;
        }
        const workflowId = data.workflowId; // TODO: 之後publishs有workflowId的話要刪掉這個
        data.publishs.forEach(async (node) => {
          node.workflowId = workflowId; // TODO: 之後publishs有workflowId的話要刪掉這個
          const { dateTime, externalNode } = node;
          node.dateTime = date.formatDate(
            new Date(dateTime),
            'YYYY-MM-DD HH:mm:ss'
          );
          node.group = data.group;
          if (externalNode && externalNode.roleName) {
            node.roleName = externalNode.roleName;
            node.chRoleName =
              RoleNameToChName[
                externalNode.roleName as keyof typeof RoleNameToChName
              ];
          }

          // 產出已定位、已撤退按鈕給位定位未撤退的使用者
          if (
            node.user &&
            node.externalNode &&
            (node.nodeType === iconLabels.InPosition ||
              node.nodeType === iconLabels.Retreat)
          ) {
            // 確認已定位、已撤退的使用者
            console.log('now node', node);
            const { workflowId, nodeType, user, externalNode } = node;
            const { label, id } = externalNode;
            const btnName = label;
            const eventKey = `${id}@${workflowId}`;
            const eventName = iconLabels[nodeType];
            const btnArray = [{ btnName, eventName, eventKey }];
            const userId = user.id;
            const userRole = user.groupRole
              ? user.groupRole.name
              : user.roles.filter((role) => role.name === 'Center').length
              ? 'Center'
              : null;
            const groupId = node.group.id; // TODO: 之後考慮刪掉這個
            // 加入到未點選的按鈕物件
            // 已定位、已撤退的使用者紀錄
            if (userId && userRole) {
              unClickedBtnObject.value[userRole] = btnArray;
              // 檢查物件中是否有 userRole 的物件
              if (!(userRole in locationRecord.value)) {
                locationRecord.value[userRole] = {};
              }
              // 檢查 userRole 物件中是否有 groupId 的物件
              if (!(btnName in locationRecord.value[userRole])) {
                locationRecord.value[userRole][btnName] = [];
              }
              // 檢查 btnName 物件中是否有該 userId
              if (!locationRecord.value[userRole][btnName].includes(userId)) {
                locationRecord.value[userRole][btnName].push(userId);
              }

              // TODO: 之後考慮刪掉這個
              console.log('now locationRecord.value', locationRecord.value);
              // 檢查物件中是否有 groupId 的物件
              if (!(String(groupId) in locationRecordByGroupId.value)) {
                locationRecordByGroupId.value[groupId] = {};
              }
              // 檢查 groupId 物件中是否有 btnName 的物件
              if (!(btnName in locationRecordByGroupId.value[groupId])) {
                locationRecordByGroupId.value[groupId][btnName] = [];
              }
              // 檢查 btnName 物件中是否有該 userId
              if (
                !locationRecordByGroupId.value[groupId][btnName].includes(
                  userId
                )
              ) {
                locationRecordByGroupId.value[groupId][btnName].push(userId);
              }
            }
          } else if (node.nodeType === iconLabels.Fire && node.user) {
            // 確認為火災的使用者
            if (
              !userWhoConfirmedFire.value.length ||
              !userWhoConfirmedFire.value.find(
                (item) => item.id === node.user?.id
              )
            ) {
              userWhoConfirmedFire.value.push(node.user);
            }
            confirmFireTime.value = node.dateTime;
          } else if (node.nodeType === iconLabels.Not && node.user) {
            // 確認為非火災的使用者
            if (
              !userWhoConfirmedNotFire.value.length ||
              !userWhoConfirmedNotFire.value.find(
                (item) => item.id === node.user?.id
              )
            ) {
              userWhoConfirmedNotFire.value.push(node.user);
            }
          }

          if (nodeRecord.value[workflowGroupId]) {
            nodeRecord.value[workflowGroupId].push(node);
          } else {
            nodeRecord.value[workflowGroupId] = [node];
          }
        });

        if (data.nodeType === iconLabels.End) {
          // 統計結束節點
          nodeEnd.value = { sendLogId, data };
        }

        // 清空按鈕
        if (data.nodeType === iconLabels.Stop && nodeRoleName) {
          waitingBtnObject.value[nodeRoleName].length = 0;
          // unClickedBtnObject.value = {};
        }
      }
    );
    // 接收流程圖節點事件的 WS 方法
    emergencyHub.connection?.on(
      'ReceiveEventMessage',
      (sendLogId: number, eventData: EventData) => {
        console.log('ReceiveEventMessage', { sendLogId, eventData });
        const { dateTime, groupId, node, user, workflowInstanceId } = eventData;
        const nodeRecordData = {
          user,
          dateTime: date.formatDate(new Date(dateTime), 'YYYY-MM-DD HH:mm:ss'),
          externalNode: node,
          nodeLabel: node.label,
          nodeType: node.stepDefinition?.nodeType.key,
          nodeTypeName: node.stepDefinition
            ? iconLabels[node.stepDefinition.nodeType.key]
            : '',
          workflowGroupId: groupId,
          workflowId: workflowInstanceId,
          roleName: node.roleName,
          chRoleName:
            RoleNameToChName[node.roleName as keyof typeof RoleNameToChName] ||
            '',
        };
        if (
          nodeRecordData.nodeTypeName === 'Failure' ||
          nodeRecordData.nodeTypeName === 'Success' ||
          nodeRecordData.nodeTypeName === 'False'
        ) {
          fireResultNode.value = nodeRecordData;
        }

        nodeResultFormatAsNodeRecord.value.push(
          nodeRecordData as SendViewModel
        );
        // 刪掉已被點選過的按鈕
        let found = false;
        for (const [roleName, btnArray] of Object.entries(
          waitingBtnObject.value
        )) {
          for (const btn of btnArray) {
            const { btnName, eventKey } = btn;
            const [nodeId, workflowId] = eventKey.split('@');

            if (
              btnName === node.label &&
              nodeId === node.id &&
              workflowId === workflowInstanceId
            ) {
              waitingBtnObject.value[roleName].length = 0;
              found = true;
              break;
            }
          }
          if (found) break;
        }
      }
    );
    // 接收發布的任務的 WS 方法
    emergencyHub.connection?.on(
      'ReceiveTaskMessage',
      (sendLogId: number, task: GroupTaskViewModel) => {
        console.log('ReceiveTaskMessage', { sendLogId, task });
        emgMission[task.id] = task;
        emgMissionWs.value = task;
        // 顯示任務的提示
        if (isCenter.value || marshallingName.value.includes(task.role.name)) {
          if (
            (isCenter.value &&
              !task.isCancelled &&
              !task.isCompleted &&
              !task.needSupport &&
              !task.receiveUser) ||
            task.receiveUser?.id === userData.value.account
          ) {
            return;
          }

          const { device, receiveUser, content } = task;
          let message = `<div style="font-weight: bold; font-size: 20px">${
            receiveUser?.fullname
              ? '接收人:' + receiveUser?.fullname + ' |'
              : ''
          }  任務 : ${setStatus(task)}</div>`;
          if (device) {
            const { building, floor, name, location } = device;
            let devicePosition = `${building.name} ${floor?.name} ${name}`;
            if (location) devicePosition += `(${location})`;
            message += `<div style="font-size: 16px">設備位置: ${devicePosition}</div>`;
          }
          message += `<div style="font-size: 16px">任務內容: ${content}</div>`;
          if (isCenter.value) {
            Notify.create({
              html: true,
              message,
              type: 'warning',
              position: 'top-right',
              timeout: 5000,
            });
            beep();
          } else {
            Notify.create({
              html: true,
              message,
              type: 'warning',
              position: 'top-right',
              timeout: 5000,
              actions: [
                {
                  label: '前往',
                  handler: () => {
                    emgMissionVisible.value = true;
                  },
                },
              ],
            });
            beep();
          }
        }
      }
    );
    // 接收緊急通知訊息的 WS 方法
    emergencyHub.connection?.on(
      'ReceiveEmergencyNotice',
      (
        sendLogId: number,
        dateTime: string,
        notice: { message: string; buildingId: number; roleNames: string[] }
      ) => {
        console.log('ReceiveEmergencyNotice', { sendLogId, dateTime, notice });

        dateTime = date.formatDate(new Date(dateTime), 'YYYY-MM-DD HH:mm:ss');
        emergencyMsg.value = { sendLogId, dateTime, notice };

        // 顯示即時通知在右上角
        const userRoles = Cookies.get('roles') as RoleViewModel[];
        if (!userRoles) return;
        const userRoleNames = userRoles.map((role) => role.name);
        if (!userRoleNames) return;
        const rolesInNotice = notice.roleNames.filter((roleName) =>
          userRoleNames.includes(roleName)
        );
        if (!rolesInNotice?.length) return;
        Notify.create({
          message: notice.message,
          type: 'warning',
          position: 'top-right',
          timeout: 5000,
          actions: [
            {
              label: '前往',
              handler: () => {
                emergencyMsgVisible.value = true;
              },
            },
          ],
        });
        beep();
      }
    );
    // 接收已聯絡消防隊
    emergencyHub.connection?.on(
      'ReceiveGuideMessage',
      (
        sendLogId: number,
        dateTime: string,
        message: ContactFireBrigade['message']
      ) => {
        console.log('ReceiveGuideMessage', { sendLogId, dateTime, message });
        dateTime = date.formatDate(new Date(dateTime), 'YYYY-MM-DD HH:mm:ss');
        contactFireBrigade.value = {
          sendLogId,
          dateTime,
          message,
        };

        // 弄出一個假的 SendViewModel 放進 nodeResultFormatAsNodeRecord 中
        const formattedContactFireBrigade =
          fomateSendLogViewModelToSendViewModel(sendLogId, dateTime, message);
        nodeResultFormatAsNodeRecord.value.push(formattedContactFireBrigade);
      }
    );
    // 發送緊急通知訊息
    emergencyHub.sendEmergencyMessage = async function ({
      BuildingId,
      RoleNames,
      Message,
    }: sendEmergencyMessagePayload) {
      console.log('sendEmergencyMessage', { BuildingId, RoleNames, Message });
      try {
        await emergencyHub.connection?.invoke('SendEmergencyNotice', {
          BuildingId,
          RoleNames,
          Message,
        });
        Notify.create({
          type: 'positive',
          message: '緊急通知發送成功',
          position: 'top',
        });
      } catch (err) {
        console.error('Invoke SendEmergencyNotice method with error: ', err);
        Notify.create({
          type: 'negative',
          message: '緊急通知發送失敗',
          position: 'top',
        });
      }
    };
    // 發送定位要求
    emergencyHub.sendLocationRequest = async function ({
      BuildingId,
      RoleNames,
    }: emergencyHubPayload) {
      console.log('sendLocationRequest', { BuildingId, RoleNames });
      try {
        await emergencyHub.connection?.invoke('SendEmergencyInPosition', {
          BuildingId,
          RoleNames,
        });
        Notify.create({
          type: 'positive',
          message: '要求發送成功',
          position: 'top',
        });
      } catch (err) {
        console.error(
          'Invoke SendEmergencyInPosition method with error: ',
          err
        );
        Notify.create({
          type: 'negative',
          message: '要求發送失敗',
          position: 'top',
        });
      }
    };
    // 發送撤退要求
    emergencyHub.sendRetreatRequest = async function ({
      BuildingId,
      RoleNames,
    }: emergencyHubPayload) {
      console.log('sendRetreatRequest', { BuildingId, RoleNames });
      try {
        await emergencyHub.connection?.invoke('SendEmergencyRetreat', {
          BuildingId,
          RoleNames,
        });
        Notify.create({
          type: 'positive',
          message: '要求發送成功',
          position: 'top',
        });
      } catch (err) {
        console.error('Invoke SendEmergencyRetreat method with error: ', err);
        Notify.create({
          type: 'negative',
          message: '要求發送失敗',
          position: 'top',
        });
      }
    };
    // 發送 已聯絡消防隊
    emergencyHub.sendContactFireBrigadeRequest = async function ({
      BuildingId,
    }: emergencyHubPayload) {
      console.log('sendContactFireBrigadeRequest', { BuildingId });
      try {
        await emergencyHub.connection?.invoke('GuideFireBrigade', {
          BuildingId,
        });
        Notify.create({
          type: 'positive',
          message: '已確認聯絡消防隊',
          position: 'top',
        });
      } catch (err) {
        console.error('Invoke GuideFireBrigade method with error: ', err);
        Notify.create({
          type: 'negative',
          message: '發送失敗',
          position: 'top',
        });
      }
    };
  }
  // 初始化 mqtt Hub 相關 method
  function initMqttHubFunction() {
    // 接收流程圖節點的 WS 方法
    mqttHub.connection?.on(
      'ReceiveApplicationMessage',
      (model: ReceiveViewModel) => {
        console.log('now ReceiveApplicationMessage', { model });

        deviceAddressStore.deviceAddressFormat(model);
      }
    );
  }
  // 初始化 fireHub 相關 method
  const fireWorkflowId = ref();
  function initFireHubFunction() {
    fireHub.connection?.on('ReceiveStats', (status: number, count: number) => {
      console.log('ReceiveStats', { status, count });
      broadStatistic.value[FireStatus[status]] = count;
    });
    // 統計開始
    fireHub.connection?.on('Begin', (workflowId: string, message: string) => {
      console.log('Begin', { workflowId, message });
      isBegin.value = true;
      fireWorkflowId.value = workflowId;
    });
    // 統計結束
    fireHub.connection?.on('End', (workflowId: string) => {
      isBegin.value = false;
      console.log('End', { workflowId });
    });
  }
  // 初始化 NotifyHub 相關 method
  function initNotifyHubFunction() {
    notifyHub.connection?.on('ReceiveMessage', (model: NotifyReadViewModel) => {
      console.log('ReceiveMessage', model);
    });
  }

  // 儲存歷史紀錄簿
  watch(isSavedEmergencyRecordData, async (val) => {
    if (val && fireStopNode.value) {
      const payload = {
        sendId: fireStopNode.value.sendLogId,
        name: `${initialDetector.value?.building.name} ${initialDetector.value?.floor.name} 火災紀錄`,
        casualty: '',
      };

      const result = await Book.apiPostSaveData(payload);
      console.log('now result', result);

      if (result.data) {
        Notify.create({
          type: 'positive',
          message: '已成功存取歷史紀錄簿',
          position: 'top',
        });
      } else {
        Notify.create({
          type: 'negative',
          message: '存取歷史紀錄簿失敗: ' + result.errors,
          position: 'top',
        });
      }

      localStorage.setItem('refreshPages', 'true');
      // 結束後重刷
      setTimeout(() => {
        history.go(0);
      }, 2000);
    }
  });

  return {
    broadStatistic,
    nodeResult,
    phoneStickyMsg,
    processRunning,
    emergencyMsg,
    emgMission,
    emgMissionWs,
    emergencyHub,
    contactFireBrigade,
    mqttHub,
    fireHub,
    initWebSocket,
    fireWorkflowId,
    waitingBtnObject,
    unClickedBtnObject,
    nodeRecord,
    nodeEnd,
    isSavedEmergencyRecordData,
    userWhoConfirmedFire,
    userWhoConfirmedNotFire,
    locationRecord,
    locationRecordByGroupId,
    confirmFireTime,
    isBegin,
    nodeResultFormatAsNodeRecord,
    fireResultNode,
    notifyWsData,
    initialDetector,
    triggeredDevices,
    triggerTime,
    onFireBuildings,
    emergencyMsgVisible,
    emgMissionVisible,
  };
});
