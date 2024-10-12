<template>
  <q-dialog seamless v-model="guideDialogVisible">
    <q-card
      class="border-process"
      :class="
        guideContent?.ePage === 'noneFire' || guideContent?.ePage === 'lift'
          ? 'border-safe'
          : 'border-process'
      "
      style="border-radius: 0"
      :style="[
        dialogStyle,
        $q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 600px',
      ]"
    >
      <q-toolbar
        class="text-white cursor-pointer"
        :class="
          guideContent?.ePage === 'noneFire' || guideContent?.ePage === 'lift'
            ? 'bg-positive'
            : 'bg-negative'
        "
        v-touch-pan.mouse="onPan"
      >
        <q-toolbar-title class="text-bold"
          >{{ guideContent?.title }}
        </q-toolbar-title>
        <q-btn dense flat :icon="fasMinus" v-close-popup />
      </q-toolbar>

      <q-card-section style="font-size: 18px">
        <p class="q-mb-none" v-html="guideContent?.content" />
      </q-card-section>
      <q-card-section v-if="guideContent?.checkList">
        <q-option-group
          style="font-size: 18px"
          v-model="checkValue"
          :options="guideContent?.checkList"
          type="checkbox"
        >
          <template v-slot:label="opt">
            <div class="row items-center text-bold">
              <span
                v-if="opt.url !== ''"
                class="text-primary"
                target="_blank"
                @click="redirect(opt.url)"
                style="text-decoration: underline"
                >{{ opt.label }}</span
              >
              <span v-else>{{ opt.label }}</span>
            </div>
          </template>
        </q-option-group>
      </q-card-section>
      <q-card-section align="center" class="q-mb-md" v-if="guideContent?.btn">
        <q-btn
          v-for="(item, index) in guideContent.btn"
          :key="item.value || item.eventName"
          :color="item.color"
          :label="item.label || item.btnName"
          :text-color="item.color === 'white' ? 'black' : ''"
          :class="index !== guideContent.btn?.length - 1 ? 'q-mr-md' : ''"
          @click="btnAction(item)"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { tempDataType } from "src/utils/tableMixin";
import Files from "src/api/file";
// icon
import { fasMinus } from "@quasar/extras/fontawesome-v6";
// pinia
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/user";
import { useSignalRStore, WaitingBtn } from "src/stores/signalR";
import { useBuildingStore } from "src/stores/building.js";

const buildingStore = useBuildingStore();
const signalRStore = useSignalRStore();
const {
  initialDetector,
  waitingBtnObject,
  userWhoConfirmedFire,
  confirmFireTime,
  userWhoConfirmedNotFire,
  fireResultNode,
} = storeToRefs(signalRStore);
// api
import Workflow from "src/api/process";
import { iconLabels } from "src/pages/emergency/flow/processIconOptions";
import { useCloned } from "@vueuse/core";
import { RoleViewModel } from "src/api/role";

const userStore = useUserStore();
const { userData, roleName } = storeToRefs(userStore);
const { Bid } = storeToRefs(buildingStore);

const router = useRouter();
const $q = inject("$q") as typeof QVueGlobals;
const rawGuideData = ref([]);

// 導引
const dialogPos = ref({
  x: 600,
  y: 230,
});

const dialogStyle = computed(
  () => `transform: translate(${dialogPos.value.x}px, ${dialogPos.value.y}px);`
);

function onPan(evt: any) {
  dialogPos.value.x = dialogPos.value.x + evt.delta.x;
  dialogPos.value.y = dialogPos.value.y + evt.delta.y;
}

// 導引內容
const checkValue = ref([]);
const fireGuideList = ref<
  {
    ePage: string;
    title: string;
    content: string;
    checkList?: object[];
    btn:
      | {
          label: string;
          value: string;
          color: string;
          step?: number;
        }[]
      | WaitingBtn[];
  }[]
>([]);
const waitingBtnArray = ref<WaitingBtn[]>([]);

const guideDialogVisible = ref(false);

watch(
  waitingBtnObject,
  (newValue) => {
    if (newValue) {
      if (roleName.value.includes("Center") && newValue.Center?.length > 0) {
        nextTick(async () => {
          const isFire = newValue.Center.findIndex(
            (btn) => btn.eventName === "Fire"
          );

          console.log("newValue['Center']", newValue.Center);
          if (newValue.Center.length === 0) {
            waitingBtnArray.value = [];
          }

          // 判斷是否為火災、非火災
          if (
            newValue.Center[0]?.eventKey ===
              waitingBtnArray.value[0]?.eventKey &&
            waitingBtnArray.value.length > 0
          ) {
            return;
          }

          // 第一次觸發
          if (
            !userWhoConfirmedFire.value.length &&
            !userWhoConfirmedNotFire.value.length &&
            isFire !== -1
          ) {
            if (initialDetector.value && !guideDialogVisible.value) {
              guideDialogVisible.value = true;
              guideData.value.bN = initialDetector.value?.building.name;
              guideData.value.uofN = initialDetector.value?.floor.name;
              await getData(guideData.value);
              guideContent.value = fireGuideList.value[0];
            }
          }

          // 防災中心二次確認後
          const userWhoConfirmedFireCenter = userWhoConfirmedFire.value.filter(
            (item) => item.roles.find((role) => role.name === "Center")
          )[0];

          if (
            userWhoConfirmedFire.value.length &&
            (!fireResultNode.value ||
              fireResultNode.value?.nodeType === iconLabels.False) &&
            userWhoConfirmedFireCenter
          ) {
            guideDialogVisible.value = true;
            guideData.value.rTime = confirmFireTime.value;
            guideData.value.ac =
              userWhoConfirmedFire.value
                .map((item) => item.fullname)
                .join(",") || "";
            await getData(guideData.value);
            guideContent.value = fireGuideList.value[2];
          }
          if (newValue.Center[0]?.eventName === "Lift") {
            // 狀況解除
            guideDialogVisible.value = true;
            await getData(guideData.value);
            guideContent.value = fireGuideList.value[8];
          } else if (
            fireResultNode.value?.nodeType === iconLabels.False &&
            fireResultNode.value.user.roles.find(
              (role: RoleViewModel) => role.name === "Center"
            )
          ) {
            return;
          }
          waitingBtnArray.value = newValue.Center?.map((btn) => {
            let stepNum = 1;
            if (btn?.eventName === "Fire") {
              stepNum = 2;
            } else if (btn?.eventName === "Failure") {
              stepNum = 6;
            }

            return {
              btnName: btn.btnName,
              eventName: btn?.eventName,
              eventKey: btn.eventKey,
              color: btn?.eventName === "Fire" ? "process" : "white",
              step: stepNum,
            };
          });
        });
      }
    }
  },
  { immediate: true, deep: true }
);
const guideContent = ref();

const guideData = computed(() => {
  return {
    bN: initialDetector.value?.building.name || "",
    uofN:
      `${initialDetector.value?.floor.name} ${initialDetector.value?.location}` ||
      "",
    rTime: "",
    ac: "",
    userName: userData.value?.fullname || "",
    userPhoneNumber: userData.value?.phoneNumber || "",
    result: fireResultNode.value?.nodeLabel || "非火災",
  };
});

watch(
  () => userWhoConfirmedFire.value,
  async () => {
    // 確認火災
    if (
      userWhoConfirmedFire.value.length &&
      !userWhoConfirmedNotFire.value.length
    ) {
      guideDialogVisible.value = true;
      guideData.value.rTime = confirmFireTime.value;
      guideData.value.ac =
        userWhoConfirmedFire.value.map((item) => item.fullname).join(",") || "";
      guideData.value.rTime = confirmFireTime.value || "";
      await getData(guideData.value);
      guideContent.value = fireGuideList.value[2];
    }
  },
  {
    immediate: true,
    deep: true,
  }
);
watch(
  () => userWhoConfirmedNotFire.value,
  async (newVal) => {
    // 確認非火災
    if (newVal.length) {
      guideDialogVisible.value = true;
      // const userWhoConfirmedNotFireCenter = newVal.filter((person) =>
      //   person.roles.find((role) => role.name === "Center")
      // )[0];
      guideData.value.ac = newVal.map((item) => item.fullname).join(",") || "";
      await getData(guideData.value);
      guideContent.value = fireGuideList.value[1];
      guideContent.value.btn = [];
      waitingBtnArray.value = [];
      // if (userWhoConfirmedNotFireCenter) {
      //   guideContent.value = fireGuideList.value[1]; // 這裡有問題
      // } else if (
      //   !userWhoConfirmedNotFireCenter &&
      //   !userWhoConfirmedFire.value.length
      // ) {
      //   guideContent.value = fireGuideList.value[1];
      // }
    }
  },
  {
    deep: true,
    immediate: true,
  }
);

watch(
  () => [guideContent.value, waitingBtnArray.value],
  () => {
    if (
      guideContent.value?.ePage === "fireCheck" ||
      guideContent.value?.ePage === "noneFire" ||
      guideContent.value?.ePage === "lift" ||
      guideContent.value?.ePage === "fireFailure"
    ) {
      guideContent.value.btn = waitingBtnArray.value;

      if (
        guideContent.value.ePage === "lift" &&
        waitingBtnArray.value.find((item) => item.eventName === "Fire")
      ) {
        guideContent.value.btn = [];
      } else if (
        (guideContent.value.ePage === "noneFire" ||
          guideContent.value.ePage === "fireFailure") &&
        fireResultNode.value &&
        waitingBtnArray.value.find((item) => item.eventName === "Lift")
      ) {
        guideContent.value = fireGuideList.value[8];
      } else if (
        fireResultNode.value?.nodeType === iconLabels.False &&
        fireResultNode.value.user.roles.find(
          (role: RoleViewModel) => role.name === "Center"
        ) &&
        !waitingBtnArray.value.find((item) => item.eventName === "Lift")
      ) {
        guideContent.value.btn = [];
      }
      if (guideContent.value.ePage === "fireFailure") {
        guideContent.value.btn = [];
      }
    }
  }
);

watch(
  fireResultNode,
  async (newVal) => {
    if (newVal) {
      if (!guideDialogVisible.value) {
        guideDialogVisible.value = true;
      }
      guideData.value.result = fireResultNode.value?.nodeLabel;
      guideData.value.rTime = newVal.dateTime;
      guideData.value.ac = newVal.user.fullname;

      if (newVal?.nodeType === iconLabels.False) {
        // 誤報
        await getData(guideData.value);
        guideContent.value = fireGuideList.value[1];
        if (
          guideContent.value.btn.find(
            (item: WaitingBtn) => item.eventName === "Fire"
          )
        ) {
          guideContent.value.btn = [];
        }
      } else {
        // 滅火成功 / 滅火失敗

        await getData(guideData.value);
        if (newVal.nodeType === iconLabels.Failure) {
          guideContent.value = fireGuideList.value[6];
        } else {
          guideContent.value = fireGuideList.value[7];
        }
        nextTick(() => {
          guideContent.value.btn = [];
        });
      }
    }
  },
  {
    immediate: true,
  }
);

async function getFireGuideData() {
  const result = (await Files.apiFileByPath(
    encodeURI("Hidden:\\FireGuide.txt")
  )) as typeof AxiosResponse;

  if (result.data) {
    const decodedData = atob(result.data);
    const jsonData = new TextDecoder().decode(
      // 將二進制數據轉換成 UTF-8 編碼的字串
      new Uint8Array([...decodedData].map((char) => char.charCodeAt(0)))
    );
    rawGuideData.value = JSON.parse(jsonData);
    console.log("rawGuideData.value", rawGuideData.value);
  }
}
async function getData(data: tempDataType) {
  const dataKeys = Object.keys(data);
  let fireGuidStepListArr: any[] = [];
  if (!rawGuideData.value.length) {
    await getFireGuideData();
  }
  fireGuideList.value = useCloned(rawGuideData.value).cloned.value;

  fireGuideList.value.forEach((item) => {
    fireGuidStepListArr = item.content.split(/[${,}]/).filter((item) => item);

    fireGuidStepListArr.forEach((step, index) => {
      dataKeys.forEach((key) => {
        if (step === key) {
          fireGuidStepListArr[index] = `<b>${data[step]}</b>`;

          if (!key) {
            fireGuidStepListArr[index] = "";
          }
        }
      });
    });

    item.content = fireGuidStepListArr.join(" ");
    // 將上下引號內的文字變色
    item.content = item.content.replace(
      /「(.*?)」/g,
      '<span style="color:red;font-weight:bold">「$1」</span>'
    );
  });
}

function btnAction(option: {
  label?: string;
  btnName?: string;
  step?: number;
  eventName?: string;
  eventKey?: string;
}) {
  const { eventName, eventKey } = option;
  if (eventName && eventKey) {
    $q.dialog({
      title: "提示",
      message: `確定要確認為「${option.btnName || option.label}」嗎?`,
      persistent: true,
      ok: {
        push: true,
        label: "確定",
      },
      cancel: "取消",
    }).onOk(async () => {
      const payload = {
        eventName,
        eventKey,
        buildingId: Bid.value as number,
      };
      try {
        (await Workflow.apiTriggerWaitingNode(payload)) as typeof AxiosResponse;
        $q.notify({
          type: "positive",
          message: `成功確認為${option.btnName}`,
          position: "top",
        });

        // 切換頁面
        if (option.step) {
          guideContent.value = fireGuideList.value[option.step];
        }
        if (eventName === "Lift") {
          guideDialogVisible.value = false;
          redirect("/historyAnalysis");
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
  } else {
    if (option.step) {
      guideContent.value = fireGuideList.value[option.step];
      if (option.step === 4) {
        const submitData = {
          BuildingId: Bid.value as number,
        };
        signalRStore.emergencyHub?.sendContactFireBrigadeRequest?.(submitData);
      }
      console.log("option.step", guideContent.value, option.step);
    } else {
      guideContent.value = fireGuideList.value[0];
      guideDialogVisible.value = false;
    }
  }
}

function redirect(url: string) {
  const directUrl = router.resolve(url);
  window.open(directUrl.href, "_blank");
}

defineExpose({
  guideDialogVisible,
  guideContent,
});
</script>
<style scoped lang="scss">
.bg-process {
  background: #c61e1e;
}
.border-process {
  border: solid 1px #c61e1e;
  border-width: 3px;
}
.bg-safe {
  background: #30a645;
}
.border-safe {
  border: solid 1px #30a645;
  border-width: 3px;
}

.q-card > div:first-child,
.q-card > img:first-child {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
</style>
