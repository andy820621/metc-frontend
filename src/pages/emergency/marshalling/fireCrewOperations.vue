<template>
  <Teleport to="body">
    <div
      class="stickyBack q-dialog__backdrop fixed-full"
      :class="{ show: alertMessageBoxVisible }"
      :style="{
        background:
          fireResultNode?.nodeType === iconLabels.Success
            ? '#21BA4566'
            : isBegin
            ? '#c61e1e66'
            : '#F0B90066',
      }"
      @click.prevent="alertMessageBoxVisible = false"
    />
  </Teleport>

  <q-page ref="pageRef">
    <swiper-container
      v-if="messageContentText"
      slides-per-view="auto"
      loop="true"
      speed="15000"
      :autoplay="{
        delay: 100,
        disableOnInteraction: false,
      }"
      class="swiper-wrapper"
    >
      <swiper-slide
        class="swiper-slide"
        :class="
          fireResultNode?.nodeType === iconLabels.Success
            ? 'bg-positive'
            : isBegin
            ? 'bg-process'
            : 'bg-warning'
        "
        v-for="i in 5"
        :key="i"
      >
        <q-icon :name="mdiBullhorn" class="text-h6 q-mr-sm" />
        <span>{{ messageContentText }}</span>
      </swiper-slide>
    </swiper-container>
    <h3
      v-if="!messageContentText"
      class="text-left text-bold q-pl-md q-py-sm"
      style="font-size: 1.55rem; margin: 0"
    >
      人員操作
    </h3>
    <div
      class="q-px-md q-pb-md flex flex-grow-1"
      :class="{ 'q-pt-md': messageContentText }"
    >
      <q-card
        class="flex full-width q-pa-md border-1 rounded-lg"
        ref="carousel"
        :style="
          processRunning
            ? 'min-height: calc(100vh - 48px - 106px - 79px); flex-grow:1;'
            : ''
        "
      >
        <FireCrewCarousel
          v-for="key in (Object.keys(allCarouselData) as allCarouselDataTypeKeyArray)"
          :carouselData="allCarouselData[key]"
          :separateData="separateData[key]"
          :key="key"
          :class="{ 'q-mb-md': key === 'carousel_1' }"
        />
      </q-card>
      <div
        class="btn-container"
        ref="btnContainer"
        v-if="
          waitingBtnArray.length ||
          unClickedYetBtnArray.length ||
          buttonOptions.length
        "
        :style="{
          'grid-template-columns': `repeat(${
            unClickedYetBtnArray.length +
            waitingBtnArray.length +
            buttonOptions.length
          }, 1fr)`,
        }"
      >
        <template v-if="isFire || isInfo">
          <template v-if="unClickedYetBtnArray.length && processRunning">
            <q-btn
              v-for="(option, index) in unClickedYetBtnArray"
              :key="index"
              push
              :label="option.btnName + '(統計用)'"
              class="q-pa-sm text-white text-bold fz-14"
              :style="{background: ButtonOptionsColor[option.eventName as keyof typeof ButtonOptionsColor]}"
              @click="handleUnClickedAction(option)"
            />
          </template>
          <template v-else-if="processRunning">
            <q-btn
              v-for="(option, index) in waitingBtnArray"
              :key="index"
              push
              :label="option.btnName"
              class="q-pa-sm text-white text-bold fz-14"
              :style="{background: ButtonOptionsColor[option.eventName as keyof typeof ButtonOptionsColor]}"
              @click="handleProcessAction(option)"
            />
          </template>
        </template>
        <template v-else-if="isGuide || isProtection || isAmbulance">
          <template v-if="processRunning">
            <template v-if="unClickedYetBtnArray.length">
              <q-btn
                v-for="(option, index) in unClickedYetBtnArray"
                :key="index"
                push
                :label="option.btnName + '(統計用)'"
                class="q-pa-sm text-white text-bold fz-14"
                :style="{background: ButtonOptionsColor[option.eventName as keyof typeof ButtonOptionsColor]}"
                @click="handleUnClickedAction(option)"
              />
            </template>
            <template v-else>
              <q-btn
                v-for="(option, index) in waitingBtnArray"
                :key="index"
                push
                :label="option.btnName"
                class="q-pa-sm text-white text-bold fz-14"
                :style="{background: ButtonOptionsColor[option.eventName as keyof typeof ButtonOptionsColor]}"
                @click="handleProcessAction(option)"
              />
            </template>
          </template>
        </template>
        <template v-if="(isCenter || isManager || isNormalUser) && isBegin">
          <q-btn
            v-for="(option, idx) in buttonOptions"
            :key="idx"
            push
            :label="ButtonOptions[option.value as keyof typeof ButtonOptions]"
            class="q-pa-sm text-white text-bold fz-14"
            :style="{background: ButtonOptionsColor[option.value as keyof typeof ButtonOptionsColor]}"
            @click.prevent="handleBtnConfirm(option)"
          />
        </template>
      </div>
    </div>
  </q-page>

  <!-- 浮動通知框 -->
  <AlertMessageBox
    v-model="alertMessageBoxVisible"
    :bgType="messageBoxBgType"
    @handleAlertMessageBox="handleAlertMessageBox"
  >
    <template #default>
      <p
        style="white-space: pre-line; margin: 0; overflow-wrap: break-word"
        class="q-py-sm"
      >
        {{ messageContentText }}
      </p>
    </template>
  </AlertMessageBox>
</template>

<script lang="ts" setup>
// Type
import {
  allCarouselDataType,
  allCarouselDataTypeKeyArray,
  separateDataType,
} from "./marshalling.type";
import { FireAckStatus } from "src/pages/emergency/pplStatus/index.type";

// pinia store
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/user";
import { useBuildingStore } from "src/stores/building.js";
import { useSignalRStore, WaitingBtn } from "src/stores/signalR";

// quasar
import { date, uid } from "quasar";

// Api
import fireMarshalling from "src/api/fireMarshalling";
import Workflow from "src/api/process";
import FireCheck from "src/api/fireCheck";
import User from "src/api/user";
import DeviceHistory, { formatedDeviceBlockData } from "src/api/deviceHistory";
// constant
import screenData from "src/constant/screenData";
import { iconLabels } from "src/pages/emergency/flow/processIconOptions";

// icon
import { mdiBullhorn } from "@quasar/extras/mdi-v6";
import { UserAccount } from "src/api/accountSetting";
import { RoleViewModel } from "src/api/role";
// util
import { beep } from "src/utils/beep";

// Pinia Store's Values
const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);
const userStore = useUserStore();
const {
  userData,
  roleName,
  marshallingName,
  isNormalUser,
  isFire,
  isInfo,
  isGuide,
  isProtection,
  isAmbulance,
  isManager,
  isCenter,
} = storeToRefs(userStore);
const signalRStore = useSignalRStore();
const {
  processRunning,
  isBegin,
  emergencyMsg,
  nodeResult,
  fireWorkflowId,
  waitingBtnObject,
  phoneStickyMsg,
  unClickedBtnObject,
  locationRecord,
  fireResultNode,
  initialDetector,
} = storeToRefs(signalRStore);

const $q = inject("$q") as typeof QVueGlobals;

// 火災通知的送達
watch(
  () => fireWorkflowId.value,
  async () => {
    console.log("fireWorkflowId", fireWorkflowId.value);
    if (isNormalUser.value) {
      const result = (await FireCheck.apiPatchFireSyn(
        fireWorkflowId.value
      )) as typeof AxiosResponse;
      console.log("apiPatchFireSyn", result);
      if (result.data) {
        $q.notify({
          type: "positive",
          message: "接收火災通知成功",
          position: "top",
        });
      }
      accountsData.value.forEach(async (item) => {
        const accountResult = (await FireCheck.apiPatchAccountFireSyn(
          fireWorkflowId.value,
          item.id
        )) as typeof AxiosResponse;
        console.log("apiPatchAccountFireSyn", accountResult);
        if (result.data) {
          $q.notify({
            type: "positive",
            message: "附屬帳號接收火災通知成功",
            position: "top",
          });
        }
      });

      //  else {
      //   $q.notify({
      //     type: "negative",
      //     message: "接收火災通知失敗",
      //     position: "top",
      //   });
      // }
    }
  }
);

// 收到初始探測器資料後，重新渲染所有輪播資料
watch(initialDetector, (newVal) => {
  if (newVal) getCarouselData();
});

async function getCarouselData() {
  const result = (await User.apiGetScreenSettings()) as typeof AxiosResponse;
  if (result.data) {
    allCarouselData.value = { carousel_1: [], carousel_2: [] };
    Object.values(result.data as { [key: string]: string[] }).forEach(
      (screenStrArray, index) => {
        const key = "carousel_" + (index + 1);
        allCarouselData.value[key as keyof typeof allCarouselData.value] = [];
        screenStrArray.forEach((screenStr) => {
          const screen = screenData.find((item) => item.value === screenStr);
          if (screen) {
            allCarouselData.value[
              key as keyof typeof allCarouselData.value
            ].push({
              title: screen.label,
              value: screen.value,
              id: uid(),
            });
            setSeparateData();
          }
        });
      }
    );

    console.log("now allCarouselData", allCarouselData.value);

    separateData.value = { carousel_1: {}, carousel_2: {} };
  }
  getAccountsData();
}
onMounted(getCarouselData);

const accountsData = ref<UserAccount[]>([]); // 本帳號的附屬帳號
async function getAccountsData() {
  const result = (await FireCheck.apiGetUserFamily()) as typeof AxiosResponse;
  accountsData.value = result.data.accounts;
  console.log("getAccountsData", accountsData.value);
}

const allCarouselData = ref<allCarouselDataType>({
  carousel_1: [],
  carousel_2: [],
});

const separateData = ref<separateDataType>({
  carousel_1: {
    detectorActionTime: "",
    deviceContentList: [],
  },
  carousel_2: {
    emergencyMsgArray: [],
  },
});

async function setSeparateData() {
  for (const [key, value] of Object.entries(allCarouselData.value)) {
    for (const item of value) {
      console.log("now item.value, key", item.value, key);
      await checkIfAddSeparateData(item.value, key);
    }
  }
  console.log("now separateData", separateData.value);
}

async function checkIfAddSeparateData(value: string, key: string) {
  if (value === "EquipmentActionStatus") {
    const result = (await DeviceHistory.apiGetData({
      page: 1,
      rowsPerPage: 24,
      filters: "",
    })) as typeof AxiosResponse;
    console.log("設定設備動作狀況 result: ", result);
    if (result.data && result.data.rows) {
      separateData.value[
        key as keyof typeof separateData.value
      ].deviceContentList = formatedDeviceBlockData(result.data.rows);
    }
  }
  // 設定防災中心訊息框歷史資料
  if (value === "EmergencyCenterMessage") {
    console.log("now set EmergencyCenterMessage");

    if (Bid.value) {
      const result = (await fireMarshalling.apiGetHistoryMessage(
        Bid.value
      )) as typeof AxiosResponse;
      console.log("now apiGetHistoryMessage result", result);
      if (result && result.data) {
        const messageArray: {
          submissionTime: string;
          textContent: string;
        }[] = [];
        // 檢查並 format 獲取到的歷史資料
        result.data.forEach((msgObj: { dateTime: string; log: string }) => {
          if (!msgObj.log) return;
          const { Message, BuildingId, RoleNames } = JSON.parse(msgObj.log);
          if (BuildingId !== Bid.value || !RoleNames) return;

          if (
            RoleNames.includes(marshallingName.value) ||
            RoleNames.some((item: string) => roleName.value.includes(item))
          ) {
            const submissionTime = date.formatDate(
              new Date(msgObj.dateTime),
              "YYYY-MM-DD HH:mm:ss"
            );
            const textContent = Message;
            messageArray.push({ submissionTime, textContent });
          }
        });
        separateData.value[
          key as keyof typeof separateData.value
        ].emergencyMsgArray = messageArray;
        console.log("now separateData.value", separateData.value);
      } else {
        separateData.value[
          key as keyof typeof separateData.value
        ].emergencyMsgArray = [];
        console.log("now separateData.value", separateData.value);
      }
    } else {
      separateData.value[
        key as keyof typeof separateData.value
      ].emergencyMsgArray = [];
      console.log("now separateData.value", separateData.value);
    }
  }
}
watch(
  emergencyMsg,
  (newValue, oldValue) => {
    if (
      newValue &&
      newValue.notice !== oldValue?.notice &&
      newValue.dateTime !== oldValue?.dateTime
    ) {
      console.log("now emergencyMsg", newValue, oldValue);
      Object.values(separateData.value).forEach((carouselData) => {
        for (const key in carouselData) {
          if (key === "emergencyMsgArray") {
            const { roleNames, message } = newValue.notice!;
            const isInRole = roleNames.some((role) =>
              roleName.value.includes(role)
            );
            if (roleNames.includes(marshallingName.value) || isInRole) {
              const messageItem = {
                submissionTime: newValue?.dateTime,
                textContent: message,
              };
              carouselData.emergencyMsgArray?.push(messageItem);
            }
          }
        }
      });
    }
  },
  { deep: true }
);

const unClickedYetBtnArray = ref<WaitingBtn[]>([]);
const waitingBtnArray = ref<WaitingBtn[]>([]);
// watch pinia 按鈕物件
watch(
  nodeResult,
  (newValue) => {
    if (newValue) {
      console.log("new nodeResult", newValue);
    }
  },
  { deep: true }
);
watch(
  locationRecord,
  (newValue) => {
    if (newValue) {
      console.log("now locationRecord", newValue);
    }
  },
  { deep: true, immediate: true }
);
watch(
  unClickedBtnObject,
  (newValue) => {
    if (newValue) {
      console.log("new unClickedBtnObject", unClickedBtnObject.value);
      if (
        marshallingName.value.length &&
        Object.keys(newValue).includes(marshallingName.value)
      ) {
        unClickedYetBtnArray.value.length = 0; // 初始化未被點選按鈕之陣列
        newValue[marshallingName.value].forEach((item) => {
          const { btnName } = item;
          const clickedUsers =
            locationRecord.value[marshallingName.value][btnName];

          if (!userData.value) return;
          if (clickedUsers.includes(userData.value.id as string)) return;
          unClickedYetBtnArray.value.push(item);
        });
      }
    }
  },
  { deep: true, immediate: true }
);
watch(
  waitingBtnObject,
  (newValue) => {
    if (newValue) {
      if (
        marshallingName.value.length &&
        Object.keys(newValue).includes(marshallingName.value)
      ) {
        let btnArray = newValue[marshallingName.value];
        const userId = userData.value.id as string;

        let clickedRecordBtns: string[] = [];

        if (
          locationRecord.value &&
          locationRecord.value[marshallingName.value]
        ) {
          // format 出使用者已點選的已定位、已撤退按鈕陣列
          clickedRecordBtns = Object.entries(
            locationRecord.value[marshallingName.value]
          ).reduce((acc, [key, users]) => {
            if (users.includes(userId)) {
              acc.push(key);
            }
            return acc;
          }, [] as string[]); // 已定位、已撤退人員記錄
        }
        if (clickedRecordBtns?.length && btnArray?.length) {
          // 過濾掉已點選已撤退者
          btnArray = btnArray.filter(
            (item) =>
              !(
                clickedRecordBtns.includes(item.btnName) &&
                item.eventName === "Retreat"
              )
          );
        }

        waitingBtnArray.value = btnArray;
      }
      if (newValue.Fire) {
        const isRetreating = newValue.Fire.some(
          (btn) => btn.eventName === "Retreat"
        );
        console.log("nowwwwwwww isRetreating", isRetreating);
        if (isRetreating) unClickedBtnObject.value = {};
      }
    }
  },
  { deep: true, immediate: true }
);

// 按鈕容器相關屬性方法
// 按鈕選項

const ButtonOptionsColor = {
  Fire: "#E01E1E", // 火災
  Not: "#52CC12", // 非火災
  InPosition: "#E01E1E", // 定位
  Retreat: "#52CC12", // 撤退
  BootSuccess: "#52CC12", // 引導成功
  BootFailure: "#E01E1E", // 引導失敗
  Failure: "#E01E1E", // 滅火失敗
  Success: "#52CC12", // 滅火成功
  False: "#F0B900", // 誤報
  Completed: "#52CC12", // 避難完成
  NotThere: "#F0B900", // 不在現場
  Ask: "#E01E1E", // 請求協助
  sDFMViewer: "#F0B900", // 編組狀態
  emergencyPplStatus: "#3B3B3B", // 避難狀況
};

async function handleUnClickedAction(option: WaitingBtn) {
  console.log("handleUnClickedAction", option);
  $q.dialog({
    title: "提示",
    message: `確定要確認為「${option.btnName}」嗎?`,
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(async () => {
    const { eventName, eventKey } = option;
    const payload = { eventName, eventKey, buildingId: Bid.value as number };
    try {
      (await Workflow.apiTriggerWaitingNode(payload)) as typeof AxiosResponse;
      unClickedYetBtnArray.value = []; // 清空按鈕，等待新的按鈕
      $q.notify({
        type: "positive",
        message: `成功確認為${option.btnName}`,
        position: "top",
      });
    } catch (err) {
      console.error(`${option.btnName}確認失敗: `, err);
      $q.notify({
        type: "negative",
        message: `${option.btnName}確認失敗，請重整頁面或是直接聯繫防災中心!! `,
        position: "top",
      });
    }
  });
}
async function handleProcessAction(option: WaitingBtn) {
  console.log("handleProcessAction", option);
  $q.dialog({
    title: "提示",
    message: `確定要確認為「${option.btnName}」嗎?`,
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(async () => {
    const { eventName, eventKey } = option;
    const payload = { eventName, eventKey, buildingId: Bid.value! };
    try {
      (await Workflow.apiTriggerWaitingNode(payload)) as typeof AxiosResponse;
      waitingBtnArray.value = []; // 清空按鈕，等待新的按鈕
      waitingBtnObject.value[marshallingName.value] = [];
      $q.notify({
        type: "positive",
        message: `成功確認為${option.btnName}`,
        position: "top",
      });
      if (eventName === "Fire") {
        messageBoxBgType.value = "process";
      }

      // 已撤退節點 => 確認避難完成 (統計人數用)
      try {
        if (eventName === "Retreat" && isBegin.value && isNormalUser.value) {
          const payload = {
            workflowId: fireWorkflowId.value,
            status: FireAckStatus.Completed,
            message: "",
          };
          await postFireAck(payload);
        }
      } catch (err) {
        console.error(`${userData.value?.fullname}避難完成確認失敗: `, err);
        $q.notify({
          type: "negative",
          message: `${userData.value?.fullname}避難完成確認失敗，請重整頁面或是直接聯繫防災中心!! `,
          position: "top",
        });
      }
    } catch (err) {
      console.error(`${option.btnName}確認失敗: `, err);
      $q.notify({
        type: "negative",
        message: `${option.btnName}確認失敗，請重整頁面或是直接聯繫防災中心!! `,
        position: "top",
      });
    }
  });
}
const router = useRouter();
async function handleBtnConfirm(item: { value: string }) {
  if (isNormalUser.value) {
    if (item.value === FireAckStatus[FireAckStatus.Ask]) {
      $q.dialog({
        title: "住戶避難狀況確認",
        message: "",
        persistent: true,
        prompt: {
          placeholder: "請輸入請求協助內容",
          model: "",
          type: "text", // optional
        },
        ok: {
          push: true,
          label: "確定",
        },
        cancel: "取消",
      }).onOk(async (message: string) => {
        const payload = {
          workflowId: fireWorkflowId.value,
          status: FireAckStatus.Ask,
          message,
        };
        await postFireAck(payload);
      });
    } else {
      const payload = {
        workflowId: fireWorkflowId.value,
        status: FireAckStatus[item.value as keyof typeof FireAckStatus],
        message: "",
      };
      await postFireAck(payload);
    }
  } else if (isCenter.value || isManager.value) {
    if (item.value === "emergencyPplStatus") {
      router.push("/emergency/emergencyPplStatus");
    } else if (item.value === "sDFMViewer") {
      router.push("/emergency/sDFMViewer");
    }
  }
}

// 傳出火災通知的回應
async function postFireAck(payload: {
  workflowId: string;
  status: number;
  message: string;
}) {
  const result = (await FireCheck.apiPostFireAck(
    payload
  )) as typeof AxiosResponse;
  if (result.data) {
    $q.notify({
      type: "positive",
      message: "傳送成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "傳送失敗",
      position: "top",
    });
  }
}
// AlertMessageBox 浮動通知
const alertMessageBoxVisible = ref(false);
const messageBoxBgType = ref("process");
const messageContentText = ref("");

watch(
  phoneStickyMsg,
  (newValue) => {
    if (Object.getOwnPropertyNames(newValue).length !== 0) {
      console.log("now phoneStickyMsg newValue", newValue);
      handleAlertMessageBoxContent();
      beep();
    }
  },
  { deep: true, immediate: true }
);
watch(
  processRunning,
  async (newValue, oldValue) => {
    if (!newValue && oldValue) {
      messageContentText.value = "";
    }
  },
  {
    immediate: true,
  }
);

// 統計開始、確認火災
const buttonOptions = ref<{ value: string }[]>([]);
enum ButtonOptions {
  Completed = "避難完成",
  NotThere = "不在現場",
  Ask = "請求協助",
  emergencyPplStatus = "避難狀況",
  sDFMViewer = "編組狀態",
}
watch(
  isBegin,
  () => {
    if (isBegin.value) {
      handleAlertMessageBoxContent();
      buttonOptions.value = [];
      if (isNormalUser.value) {
        if (
          isAmbulance.value ||
          isFire.value ||
          isInfo.value ||
          isGuide.value ||
          isProtection.value
        ) {
          buttonOptions.value = [
            ...buttonOptions.value,
            ...[{ value: "NotThere" }, { value: "Ask" }],
          ];
        } else {
          buttonOptions.value = [
            ...buttonOptions.value,
            ...[
              {
                value: "Completed",
              },
              { value: "NotThere" },
              { value: "Ask" },
            ],
          ];
        }
      }

      if (isCenter.value || isManager.value) {
        buttonOptions.value = [
          ...buttonOptions.value,
          ...[
            {
              value: "emergencyPplStatus",
            },
            {
              value: "sDFMViewer",
            },
          ],
        ];
      }
      console.log("buttonOptions", buttonOptions.value);
    }
  },
  {
    immediate: true,
  }
);

function handleAlertMessageBox(value: boolean) {
  // 關閉 alertMessageBox
  alertMessageBoxVisible.value = false;
}

// 滅火結果
watch(
  fireResultNode,
  (newVal) => {
    // 如果防災中心確認誤報，則滅火班按鈕清空
    if (newVal) {
      handleAlertMessageBoxContent();

      if (
        newVal.nodeType === iconLabels.False &&
        newVal.user.roles.find(
          (item: RoleViewModel) => item.name === "Center"
        ) &&
        waitingBtnArray.value.find((item) => item.eventName === "False") &&
        isFire.value
      ) {
        waitingBtnArray.value = [];
        waitingBtnObject.value[marshallingName.value] = [];
      }
    }
  },
  {
    immediate: true,
  }
);

function handleAlertMessageBoxContent() {
  // 提示訊息相關邏輯

  if (!isNormalUser.value && processRunning.value && !isBegin.value) {
    messageContentText.value = phoneStickyMsg.value[marshallingName.value];
  } else if (
    isFire.value ||
    isGuide.value ||
    isProtection.value ||
    isAmbulance.value ||
    isInfo.value ||
    isManager.value ||
    isCenter.value ||
    isNormalUser.value
  ) {
    if (marshallingName.value) {
      messageContentText.value = phoneStickyMsg.value[marshallingName.value];
    } else if (isNormalUser.value && !marshallingName.value) {
      messageContentText.value = phoneStickyMsg.value?.Member;
    } else if (isManager.value) {
      messageContentText.value = phoneStickyMsg.value?.Manager;
    } else if (isCenter.value) {
      messageContentText.value = phoneStickyMsg.value?.Center;
    }
    messageBoxBgType.value =
      fireResultNode.value?.nodeType === iconLabels.Success
        ? "positive"
        : processRunning.value && !isBegin.value
        ? "warning"
        : "process";
  }
  if (messageContentText.value) alertMessageBoxVisible.value = true;
}
</script>

<style lang="scss" scoped>
.q-page {
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}
.swiperBox {
  width: 100%;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.swiper-wrapper {
  transition-timing-function: linear;
}

.btn-container {
  overflow: hidden;
  display: grid;
  width: 100%;
  padding-top: 16px;
  // gap: 0.5rem;
  z-index: 10;
  // height: 78px;
}
.swiper-slide {
  letter-spacing: 3.2px;
  width: auto;
  color: #fff;
  font-weight: bold;
  font-size: 16px;
  padding: 12px;
}

.stickyBack {
  z-index: 3501;
  pointer-events: none;
  opacity: 0;
  transition: all 0.24s ease;
  &.show {
    pointer-events: initial;
    opacity: 1;
  }
}
</style>
