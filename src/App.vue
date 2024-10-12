<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar, Cookies, date } from "quasar";
// pinia Store
import { useAuthStore } from "src/stores/auth.js";
import { useUserStore } from "src/stores/user";
import { useBuildingStore } from "src/stores/building.js";
import { storeToRefs } from "pinia";
// websocket signalR
import {
  useSignalRStore,
  SendViewModel,
  RoleNameToChName,
} from "src/stores/signalR";
// api
import fireMarshalling from "./api/fireMarshalling";
import Process from "src/api/process";
import Book, { formalOrEmergency } from "./api/book";

// type
import { iconLabels } from "src/pages/emergency/flow/processIconOptions";
import { RoleViewModel, roleType } from "./api/role";
import { DeviceViewModel } from "./api/device";
import { FloorViewModel } from "./api/floors";
// utils
import { useEventListener } from "@vueuse/core";
import { openMultipleMonitors } from "./utils/openMultipleMonitors";
import { fomateSendLogViewModelToSendViewModel } from "./utils/defaultUtils";
import { compareByDateTime } from "./utils/formatUtils";
import { UserViewModel } from "./api/accountSetting";
import PullToRefresh from "pulltorefreshjs";
import { initBeep } from "./utils/beep";

const $q = useQuasar();
provide("$q", $q);

// 解決 IOS pwa 下無法下拉重新整理的問題
if ($q.platform.is.ios) {
  onMounted(() => {
    const isSingleTouch = ref(false);
    function touchStartHandler(event: TouchEvent) {
      isSingleTouch.value = event.touches.length === 1;
    }

    document.addEventListener("touchstart", touchStartHandler);

    PullToRefresh.init({
      mainElement: "body", // 指定下拉刷新作用的元素
      // distThreshold: 81, // 觸發刷新所需的最小距離 — 預設為 60
      // distMax: 90, // 元素可能的最大距離 — 預設為 80
      onRefresh: () => window.location.reload(),
      shouldPullToRefresh: () => isSingleTouch.value,
    });

    onBeforeUnmount(() => {
      document.removeEventListener("touchstart", touchStartHandler);

      PullToRefresh.destroyAll();
    });
  });
}

useEventListener(window, "beforeunload", () => {
  const pages = JSON.parse(localStorage.getItem("visitedPages") || "[]");
  const currentPage = window.location.pathname;
  const pageIndex = pages.indexOf(currentPage);
  if (pageIndex > -1) {
    pages.splice(pageIndex, 1);
    localStorage.setItem("visitedPages", JSON.stringify(pages));
  }
});

const userStore = useUserStore();
userStore.initFirebase(); // init FCM

const { userData, roleName, roleChName, marshallingName, marshallingId } =
  storeToRefs(userStore);
const buildingStore = useBuildingStore();
const { Bid, buildingData } = storeToRefs(buildingStore);
// SignalR
const authStore = useAuthStore();
const { accessToken } = storeToRefs(authStore);
console.log("accessToken", accessToken.value);

const signalRStore = useSignalRStore();
const {
  processRunning,
  isBegin,
  nodeRecord,
  nodeResultFormatAsNodeRecord,
  unClickedBtnObject,
  locationRecord,
  locationRecordByGroupId,
  userWhoConfirmedFire,
  userWhoConfirmedNotFire,
  waitingBtnObject,
  fireWorkflowId,
  phoneStickyMsg,
  initialDetector,
  triggeredDevices,
  confirmFireTime,
  fireResultNode,
  onFireBuildings,
  triggerTime,
} = storeToRefs(signalRStore);

// init FCM
if (Notification.permission !== "granted") {
  $q.dialog({
    title: "提示",
    message:
      "因為本應用程式有非常多應用與通知相關，若沒有開啟通知權限，無法收到任何通知，強烈建議點擊確定授權通知!!",
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(async () => {
    Notification.requestPermission()
      .then((permission) => {
        if (permission === "granted") {
          console.log("nowwwwww accessToken.value", accessToken.value);
          if (!accessToken.value) {
            nextTick(() => {
              userStore.initFirebase();
            });
          }
        } else {
          $q.notify({
            type: "warning",
            message:
              "沒有開啟通知權限將無法收到任何通知，建議重新啟動應用程式並且授權通知!!",
            position: "top",
          });
        }
      })
      .catch((error) => {
        $q.notify({
          type: "negative",
          message: "Service worker registration failed: " + error,
          position: "top",
        });
      });
  });
} else {
  if (!accessToken.value) {
    userStore.initFirebase();
  }
}

window.addEventListener("storage", (event) => {
  if (event.key === "refreshPages" && event.newValue === "true") {
    setTimeout(() => {
      const refreshPages = localStorage.getItem("refreshPages");
      if (refreshPages) localStorage.removeItem("refreshPages");

      history.go(0);
    }, 2000);
  }
});

watch(
  Bid,
  async (newValue) => {
    if (newValue) {
      localStorage.setItem("Bid", newValue + "");

      // 更新已被觸發火警的設備資料 => 更新 initialDetector 跟 onFireBuildings
      const result =
        (await Process.apiGettriggerdevices()) as typeof AxiosResponse;
      console.log("now triggeredDevices", result.data);
      if (result.data?.length) {
        triggeredDevices.value.length = 0; // 初始化已被觸發火警的設備資料
        triggeredDevices.value = (result.data as DeviceViewModel[]).map(
          (item) => ({
            building: item.building,
            floor: item.floor as FloorViewModel,
            floors: item.floors as FloorViewModel[],
            location: item.location || "",
            id: item.id,
          })
        );
        initialDetector.value = triggeredDevices.value[0];

        const set = new Set();
        onFireBuildings.value = onFireBuildings.value.filter((item) =>
          !set.has(item.id) ? set.add(item.id) : false
        );
      }

      const checkEmergencyResult =
        (await Book.apiCheckEmergency()) as typeof AxiosResponse;
      if (checkEmergencyResult.data === formalOrEmergency.emergency) {
        processRunning.value = true;
      }

      // 若沒有節點資料 => 取得節點 => 處理節點資料
      if (!Object.keys(nodeRecord.value).length) {
        const result = await fireMarshalling.apiGetWorkflowNodesRecord(
          100, // TODO: 待確認是否直接獲取所有歷史資料就好
          initialDetector.value ? initialDetector.value.building.id : newValue // TODO: 先寫死抓現在的大樓的資料
        );

        const fireGuideRecordResult =
          await fireMarshalling.apiGetFireGuideRecord(); // 獲取是否通知消防隊的歷史紀錄

        console.log("initialNodeRecord", result);
        if (result && result.data && result.data.length) {
          console.log("initialNodeRecord", result.data);
          triggerTime.value = date.formatDate(
            new Date(result.data[0].dateTime),
            "YYYY-MM-DD HH:mm:ss"
          );
          waitingBtnObject.value = {}; // 初始化等待節點物件

          // 若已通知消防隊 => 整理該資料成節點資料的格式 => 加進去節點陣列
          if (fireGuideRecordResult && fireGuideRecordResult.data) {
            const formattedResults = fireGuideRecordResult.data.map((item) => {
              const { log, dateTime, id } = item;
              const formattedTime = date.formatDate(
                new Date(dateTime),
                "YYYY-MM-DD HH:mm:ss"
              );
              const { BuildingId, Message } = JSON.parse(log) as {
                BuildingId: number;
                Message: string;
              };
              const message = { buildingId: BuildingId, message: Message };
              return fomateSendLogViewModelToSendViewModel(
                id,
                formattedTime,
                message
              );
            });
            result.data.push(...formattedResults);
          }

          const initialNodeRecord = result.data.sort(compareByDateTime);

          // loop 節點資料
          for (let i = 0; i < initialNodeRecord?.length; i++) {
            const node = initialNodeRecord[i];
            const {
              workflowInstanceId,
              nodeType,
              externalNode,
              targets,
              message,
            } = node;

            if (message && externalNode) externalNode.message = message; // 把 format 過的 message 放進 externalNode 裡

            // 起始點
            // if (nodeType === iconLabels.Start) {
            //   if (!processRunning.value) processRunning.value = true;
            // }

            // 統計開始
            if (nodeType === iconLabels.Begin) {
              isBegin.value = true;
              fireWorkflowId.value = workflowInstanceId;
            }

            // 統計結束 => 緊急應變結束
            if (nodeType === iconLabels.End) {
              isBegin.value = false;
              phoneStickyMsg.value = {};
              waitingBtnObject.value = {};
              fireResultNode.value = undefined;
              fireWorkflowId.value = undefined;
              // break; // TODO: 確認是否需要 break
            }

            // format 節點時間
            node.dateTime = date.formatDate(
              new Date(node.dateTime),
              "YYYY-MM-DD HH:mm:ss"
            );

            // 透過 externalNode 處理 node 節點資料
            if (externalNode) {
              const { stepDefinition } = externalNode;
              if (externalNode.roleName) node.roleName = externalNode.roleName;
              node.chRoleName =
                RoleNameToChName[
                  node.roleName as keyof typeof RoleNameToChName
                ];
              // 生出最新的按鈕
              if (
                stepDefinition &&
                stepDefinition.nodeType.key === iconLabels.Wait &&
                typeof targets === "object" &&
                targets !== null &&
                node.roleName
              ) {
                waitingBtnObject.value[node.roleName] = []; // 初始化或清空該角色之等待按鈕
                // loop targets 獲得該角色之等待按鈕

                Object.entries(targets).forEach(
                  ([nodeKey, [nodeTypeId, btnName]]) => {
                    const eventKey = `${nodeKey}@${workflowInstanceId}`;
                    const eventName = iconLabels[nodeTypeId];

                    waitingBtnObject.value[node.roleName].push({
                      btnName,
                      eventName,
                      eventKey,
                    });
                    // 確保已按過的按鈕重刷後不會出現
                    if (
                      initialNodeRecord.findLast(
                        (item) =>
                          item.nodeType === nodeTypeId &&
                          item.user?.roles.find(
                            (user) => user.name === node.roleName
                          )
                      )?.user
                    ) {
                      waitingBtnObject.value[node.roleName] = [];
                    }
                  }
                );
              }
            }

            // 產出已定位、已撤退按鈕給位定位未撤退的使用者
            if (
              node.user &&
              node.externalNode &&
              (node.nodeType === iconLabels.InPosition ||
                node.nodeType === iconLabels.Retreat)
            ) {
              // 確認已定位、已撤退的使用者
              const { externalNode, workflowInstanceId, nodeType, user } = node;
              const { label, id } = externalNode;
              const btnName = label;
              const eventKey = `${id}@${workflowInstanceId}`;
              const eventName = iconLabels[nodeType];
              const btnArray = [{ btnName, eventName, eventKey }];
              const userId = user.id;
              const userRole = user.groupRole
                ? user.groupRole.name
                : user.roles.filter((role) => role.name === "Center").length
                ? "Center"
                : null;
              const groupId = node.workflowGroupId
                ? node.workflowGroupId
                : node.group.id;
              // 加入到未點選的按鈕物件
              // 已定位、已撤退的使用者紀錄
              if (userId && userRole) {
                unClickedBtnObject.value[userRole] = btnArray;

                // 檢查已定位、已撤退人員記錄物件中是否有 userRole 的物件 => 若為空則初始化
                if (!(userRole in locationRecord.value)) {
                  locationRecord.value[userRole] = {};
                }
                // 檢查 userRole 物件中是否有 groupId 的物件 => 若為空則初始化
                if (!(btnName in locationRecord.value[userRole])) {
                  locationRecord.value[userRole][btnName] = [];
                }
                // 檢查 btnName 物件中是否有該 userId => 若為空則初始化
                if (!locationRecord.value[userRole][btnName].includes(userId)) {
                  locationRecord.value[userRole][btnName].push(userId);
                }

                // TODO: 之後可以考慮其他作法
                // 檢查物件中是否有 groupId 的物件 => 若為空則初始化
                if (!(String(groupId) in locationRecordByGroupId.value)) {
                  locationRecordByGroupId.value[groupId] = {};
                }
                // 檢查 groupId 物件中是否有 btnName 的物件 => 若為空則初始化
                if (!(btnName in locationRecordByGroupId.value[groupId])) {
                  locationRecordByGroupId.value[groupId][btnName] = [];
                }
                // 檢查 btnName 物件中是否有該 userId => 若為空則初始化
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
              confirmFireTime.value = node.dateTime;
            } else if (
              node.externalNode?.roleName &&
              node.externalNode?.message &&
              node.nodeType === iconLabels.Broadcast
            ) {
              // 更新人員操作跑馬燈訊息
              phoneStickyMsg.value[node.externalNode?.roleName] =
                node.externalNode?.message;
            } else if (
              nodeType === iconLabels.Failure ||
              nodeType === iconLabels.Success ||
              nodeType === iconLabels.False
            ) {
              // 更新滅火成功、失敗的節點
              fireResultNode.value = node;
            }
            nodeResultFormatAsNodeRecord.value.push(node);
          }

          console.log("processRunning", processRunning.value);
        }
      }
    }
  },
  { immediate: true }
);

watch(processRunning, async (newValue, oldValue) => {
  if (newValue && !oldValue) {
    $q.notify({
      type: "info",
      message: "緊急應變中",
      position: "top",
    });

    if (
      roleName.value.includes("Center") &&
      !localStorage.getItem("hasOpenedMonitors")
    ) {
      openMultipleMonitors();
      localStorage.setItem("hasOpenedMonitors", "true");
    }
  } else if (oldValue && newValue === false) {
    $q.notify({
      type: "info",
      message: "緊急應變結束",
      position: "top",
    });
    localStorage.removeItem("hasOpenedMonitors"); // 清除標記
  }
});
watch(isBegin, (newValue) => {
  if (newValue) {
    $q.notify({
      type: "info",
      message: "統計開始",
      position: "top",
    });
  }
});

watch(
  () => accessToken.value,
  async (newValue) => {
    if (newValue) {
      await signalRStore.initWebSocket(newValue);
      await buildingStore.getBuildingsData();
      // TODO: user 資料獲取流程可能需要再討論，是否需要直接用該 api 獲取所有資料，還是一樣在 login 時候獲取資料，有資料異動時再強迫使用者登出
      await userStore.getUserData();
      // 把角色存進 pinia
      const roles = Cookies.get("roles") as RoleViewModel[];
      userData.value.fullname = Cookies.get("fullname");

      // 是否為管委會成員
      const isCommunityUser = Cookies.get(
        "isCommunityUser"
      ) as UserViewModel["isCommunityUser"];
      userData.value.isCommunityUser = JSON.parse(String(isCommunityUser));

      console.log("nowwwwwwwww roles", roles);
      if (roles?.length) {
        roleName.value = [];
        roleChName.value = [];
        roles.forEach((role) => {
          // 大樓一般角色
          if (role.type === roleType.role) {
            roleName.value.push(role.name);
            if (role.description) roleChName.value.push(role.description);
            console.log("roleChName", roleChName.value);
          } else if (role.type === roleType.class) {
            // 消防編組角色
            marshallingName.value = role.name;
            marshallingId.value = role.id;
          }
        });
      }
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
// onMounted(() => {
//   $q.notify({
//     message: "是否開啟音效",
//     type: "warning",
//     position: "top-right",
//     timeout: 0,
//     actions: [
//       {
//         label: "開啟",
//         handler: initBeep,
//       },
//     ],
//   });
// });
onMounted(initBeep); // TODO: 展覽先關掉詢問，之後看有沒有更好的做法
</script>

<style lang="scss">
// q-tabs 客製化設計 (手機專用)
.twoTabsPerRow {
  // & * {
  //   white-space: word-wrap;
  // }
  .q-tabs__content {
    padding: 1rem;
    row-gap: 0.24rem;
    // flex-wrap: wrap;
    display: grid;
    grid-template-columns: repeat(2, 50%);
    .q-tab {
      // flex: 0 0 50%;
      background-color: #f8f3e9;
      &.q-tab--active {
        background-color: #f8f3e9;
        .q-tab__content {
          background-color: white;
          box-shadow: 2px 2px 0 0 rgba(100, 100, 100, 0.5);
          .q-tab__label {
            font-weight: bolder;
          }
        }
      }
      .q-tab__content {
        width: 100%;
        margin: 0.4rem 0;
        transition: all 0.2s ease;
        border-radius: 0.75rem;
        color: black;
        .q-tab__label {
          font-size: 1.1rem;
          width: 100%;
          padding: 0 0.4rem;
          // word-wrap: break-all;
          // overflow-wrap: break-word;

          overflow-x: auto;
          &::-webkit-scrollbar {
            // height: 1px;
            display: none;
          }

          // white-space: nowrap;
          // overflow: hidden;
          // text-overflow: ellipsis;
        }
      }
      .q-tab__indicator {
        display: none;
      }
      /* 奇數  */
      &:nth-child(odd) {
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
        padding-right: 0.5rem;
      }

      /* 偶數 */
      &:nth-child(even) {
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        padding-left: 0.5rem;
      }
    }
  }
}
// q-tabs 客製化設計 (大部分於桌機使用)
.mainTabsDesign {
  color: grey;
  .q-tab__content {
    .q-tab__label {
      @media screen and (min-width: 700px) {
        font-size: 1.3rem;
        font-weight: bolder;
      }
    }
  }
  .mainTabsActiveClass {
    box-shadow: 0 2px 5px rgba(171, 171, 171, 0.8);
  }
}
</style>
