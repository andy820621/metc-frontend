<template>
  <header class="row justify-between items-center">
    <div class="deviceInfo">
      <div class="time q-mb-xs">{{ deviceData.dateTime }}</div>
      <div class="label">{{ deviceData.device.name }}</div>
    </div>
    <div class="row q-gutter-md">
      <q-btn
        :loading="pending"
        v-if="btnControl.showDeleteBtn"
        @click="handleSetError(deviceData.device)"
        :color="deviceData.device.isFaulty ? 'primary' : undefined"
      >
        故障
      </q-btn>
      <q-btn
        v-if="!processRunning"
        :loading="pending"
        color="primary"
        @click="
          handleOpenMissionDialog({
            name: deviceData.device.name,
            id: deviceData.device.id!,
          })
        "
      >
        發布任務
      </q-btn>
    </div>
  </header>
  <div class="alertContent">
    <div class="content">
      <div class="device">
        <span>{{ deviceData.device.name }}</span>
        <span class="text-red q-px-sm">運轉監視</span>
        <span>發生異常</span>
      </div>
      <div>
        <span>請前往確認</span>
      </div>
      <div>
        <span
          >或是{{
            processRunning
              ? "發送任務給相關編組人員"
              : "發送通知聯絡保管人員 / 維護廠商人員"
          }}</span
        >
      </div>
    </div>

    <template v-if="!processRunning">
      <div class="options" v-if="selectModels">
        <q-checkbox
          v-model="selectModels.all"
          label="全選"
          @update:modelValue="handleSelectAll"
        />
        <q-checkbox
          v-if="'keeperUnit' in selectModels"
          v-model="selectModels.keeperUnit"
          label="保管人員"
        />
        <q-checkbox
          v-if="'maintainVendor' in selectModels"
          v-model="selectModels.maintainVendor"
          label="維護廠商人員"
        />
      </div>
      <div class="optionsEmptyAlert q-mt-sm text-orange" v-else>
        尚未設定任何通知對象，請先到設備清單對該設備設定通知對象，或是自行前往確認。
      </div>
    </template>

    <div class="notifyResultsContainer" v-if="deviceData.notifyResults?.length">
      <div class="title">發送通知結果列</div>
      <ul class="notifyResults">
        <li
          v-for="[dateTime, results] in Object.entries(
            deviceData.formattedNotifyResults
          )"
          :key="dateTime"
          class="flex items-start"
          style="gap: 0.24rem"
        >
          <div>{{ dateTime }}</div>
          <div>—</div>
          <ul class="flex-grow-1">
            <li
              v-for="item in results"
              :key="item.id"
              :class="{
                'text-positive': item.message.includes('成功'),
                'text-negative': !item.message.includes('成功'),
              }"
            >
              {{ item.message }}
            </li>
          </ul>
        </li>
      </ul>
    </div>

    <div class="btnContainer">
      <q-btn
        v-if="!processRunning"
        :loading="pending"
        :disable="!selectModels"
        @click="handleSendNotify"
      >
        通知
      </q-btn>
      <q-btn
        v-if="processRunning"
        :loading="pending"
        color="primary"
        @click="
          handleOpenMissionDialog({
            name: deviceData.device.name,
            id: deviceData.device.id!,
          })
        "
      >
        發布任務
      </q-btn>

      <q-btn
        :loading="pending"
        v-if="btnControl.showProccessedBtn"
        @click="handleSetNotified"
      >
        已通知
      </q-btn>
      <q-btn
        :loading="pending"
        v-if="btnControl.showDeleteBtn"
        @click="handleDelete"
      >
        刪除該筆警示資料
      </q-btn>
    </div>
  </div>

  <q-dialog
    v-model="missionDialogVisible"
    @hide="initialMissionData"
    @show="dialogClassName = '安全防護班'"
  >
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 500px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">
          發布任務內容 - {{ dialogDevice.name }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-select
          :model-value="dialogClassName"
          use-input
          hide-selected
          fill-input
          input-debounce="300"
          :options="classOptions"
          @filter="classSelectFilterFunc"
          @input-value="(val) => (dialogClassName = val)"
          option-value="id"
          option-label="description"
          class="q-mb-sm"
          :label="!!dialogClassName ? '' : '班別 *'"
          :rules="[
            (val) =>
              !val
                ? '此欄位不得為空'
                : classOptions?.map((item) => item.description).includes(val)
                ? true
                : '請選擇正確的班別',
          ]"
          ref="dialogClassNameSelect"
          @update:model-value="dialogClassNameSelectUpdateFunc"
        >
          <template v-if="dialogClassName" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="dialogClassName = ''"
              class="cursor-pointer"
            />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> 沒有該物件 </q-item-section>
            </q-item>
          </template>
        </q-select>
        <q-select
          :model-value="dialogMissionContent"
          use-input
          hide-selected
          fill-input
          input-debounce="300"
          :options="missionLazyTextOptions"
          @filter="classSelectFilterFunc"
          @input-value="(val) => (dialogMissionContent = val)"
          option-value="id"
          option-label="label"
          class="q-mb-sm"
          :label="!!dialogMissionContent ? '' : '任務內容 *'"
          lazy-rules="ondemand"
          :rules="[(val) => !!val || '此欄位不得為空']"
          ref="dialogMissionContentSelect"
          @update:model-value="dialogMissionContentSelectUpdateFunc"
        >
          <template v-if="dialogMissionContent" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="dialogMissionContent = ''"
              class="cursor-pointer"
            />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                沒有該任務內容
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-actions align="center" class="q-mb-md">
        <!-- <q-btn label="確定" color="primary" v-close-popup /> -->
        <q-btn
          color="primary"
          padding=".4rem 1rem"
          label="發布任務"
          icon-right="navigation"
          @click.prevent="handlePostMission"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// api
import deviceNotify from "src/api/deviceNotify";
import Device, { DeviceViewModel } from "src/api/device";
import Role, { roleType } from "src/api/role";
import emergencyMission, { postMissionParams } from "src/api/emergencyMission";
// utils
import { useVModel } from "@vueuse/core";
// type
import type {
  DeviceNotifyViewModel,
  SendNotifyPayload,
} from "src/api/deviceNotify";
// pinia store
import { useDeviceAlertStore } from "src/stores/deviceAlert";
import System, { systemType } from "src/api/system";
import { useSignalRStore } from "src/stores/signalR";
import { storeToRefs } from "pinia";

const signalRStore = useSignalRStore();
const { processRunning } = storeToRefs(signalRStore);

// onMounted(() => (processRunning.value = true));

const deviceAlertStore = useDeviceAlertStore();

const props = withDefaults(
  defineProps<{
    deviceData: DeviceNotifyViewModel;
    btnControl?: {
      showProccessedBtn?: boolean;
      showDeleteBtn?: boolean;
    };
    invokeTabChange: () => void;
  }>(),
  {
    btnControl: () => ({
      showProccessedBtn: false,
      showDeleteBtn: false,
    }),
  }
);
const emit = defineEmits(["update:deviceData"]);
const deviceData = useVModel(props, "deviceData", emit);
console.log("now deviceData", deviceData.value);

// checkbox;
const selectModels = computed(() => deviceData.value.options);

function handleSelectAll(val: boolean) {
  if (selectModels.value) {
    if ("keeperUnit" in selectModels.value) {
      selectModels.value.keeperUnit = val;
    }
    if ("maintainVendor" in selectModels.value) {
      selectModels.value.maintainVendor = val;
    }
  }
}
watch(
  () => {
    return {
      keeperUnit:
        selectModels.value && "keeperUnit" in selectModels.value
          ? selectModels.value.keeperUnit
          : undefined,
      maintainVendor:
        selectModels.value && "maintainVendor" in selectModels.value
          ? selectModels.value.maintainVendor
          : undefined,
    };
  },
  ({ keeperUnit, maintainVendor }) => {
    if (selectModels.value) {
      if (keeperUnit !== undefined && maintainVendor !== undefined) {
        selectModels.value.all = keeperUnit && maintainVendor;
      } else if (keeperUnit !== undefined) {
        selectModels.value.all = keeperUnit;
      } else if (maintainVendor !== undefined) {
        selectModels.value.all = maintainVendor;
      }
    }
  },
  { deep: true }
);

// Button handler
const $q = inject("$q") as typeof QVueGlobals;
const pending = ref(false);
async function handleSendNotify() {
  if (selectModels.value) {
    pending.value = true;

    const { receiveDeviceAddressId, device } = deviceData.value;
    const { keeperUnit, maintainVendor } = device;

    let isOk = false;
    let payload: SendNotifyPayload | undefined;

    const selectCommunityUser =
      "keeperUnit" in selectModels.value ? selectModels.value.keeperUnit : null;
    const selectProvider =
      "maintainVendor" in selectModels.value
        ? selectModels.value.maintainVendor
        : null;

    try {
      if (keeperUnit) {
        if (selectCommunityUser) {
          payload = {
            id: receiveDeviceAddressId,
            notify: `設備${device.name}回傳狀態異常，請前往確認實際情況`,
            communityUserId: keeperUnit.id!,
          };

          const result = await deviceNotify.apiSendNotify(payload);
          console.log("sendToCommunityUser result", result);

          if (result.data) {
            $q.notify({
              type: "positive",
              message: "發送給保管人員成功",
              position: "top",
            });
            isOk = true;
            if (maintainVendor) {
              if (selectProvider) {
                payload = {
                  id: receiveDeviceAddressId,
                  notify: `設備${device.name}回傳狀態異常，請前往確認實際情況`,
                  providerId: maintainVendor.id!,
                };

                const result = await deviceNotify.apiSendNotify(payload);
                console.log("sendToProvider result", result);

                if (result.data) {
                  $q.notify({
                    type: "positive",
                    message: "發送給維護廠商人員成功",
                    position: "top",
                  });
                  isOk = true;
                } else {
                  $q.notify({
                    type: "negative",
                    message: "發送給維護廠商人員失敗",
                    position: "top",
                  });
                }
              } else {
                $q.notify({
                  type: "warning",
                  message: "尚未設定維護廠商之聯絡方式",
                  position: "top",
                });
              }
            }
          } else {
            $q.notify({
              type: "negative",
              message: "發送給保管人員失敗",
              position: "top",
            });
          }
        } else {
          $q.notify({
            type: "warning",
            message: "尚未設定保管人員之聯絡方式",
            position: "top",
          });
        }
      }

      // if (maintainVendor) {
      //   if (selectProvider) {
      //     payload = {
      //       id: receiveDeviceAddressId,
      //       notify: `設備${device.name}回傳狀態異常，請前往確認實際情況`,
      //       providerId: maintainVendor.id!,
      //     };

      //     const result = await deviceNotify.apiSendNotify(payload);
      //     console.log("sendToProvider result", result);

      //     if (result.data) {
      //       $q.notify({
      //         type: "positive",
      //         message: "發送給維護廠商人員成功",
      //         position: "top",
      //       });
      //       isOk = true;
      //     } else {
      //       $q.notify({
      //         type: "negative",
      //         message: "發送給維護廠商人員失敗",
      //         position: "top",
      //       });
      //     }
      //   } else {
      //     $q.notify({
      //       type: "warning",
      //       message: "尚未設定維護廠商之聯絡方式",
      //       position: "top",
      //     });
      //   }
      // }
    } catch (err) {
      $q.notify({
        type: "negative",
        message: `發送通知失敗，${err}`,
        position: "top",
      });
    } finally {
      pending.value = false;
    }

    if (isOk) await deviceAlertStore.getDeviceNotifyData();
  } else {
    $q.notify({
      type: "warning",
      message: "尚未設定任何通知對象，請先到設備清單對該設備設定通知對象!",
      position: "top",
    });
  }
}
async function handleSetNotified() {
  pending.value = true;

  const id = deviceData.value.receiveDeviceAddressId;
  const result = await deviceNotify.apiSetProcessed(id);

  if (result.data) {
    await deviceAlertStore.getDeviceNotifyData();
    nextTick(props.invokeTabChange);
    $q.notify({
      type: "positive",
      message: "成功設定成已通知",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "設定成已通知失敗",
      position: "top",
    });
  }

  pending.value = false;
}
async function handleDelete() {
  pending.value = true;

  const id = deviceData.value.receiveDeviceAddressId;
  const result = await deviceNotify.apiDeleteData([id]);

  if (result.data) {
    await deviceAlertStore.getDeviceNotifyData();
    $q.notify({
      type: "positive",
      message: "刪除成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "刪除失敗",
      position: "top",
    });
  }

  pending.value = false;
}

async function handleSetError(device: DeviceViewModel) {
  console.log("handleSetError device:", device);

  const { id, name, isFaulty } = device;

  const message = isFaulty
    ? `確定要將設備「${name}」復原成非故障嗎?`
    : `確定要將設備「${name}」設為故障嗎？`;

  $q.dialog({
    title: "設備故障狀態更改",
    message,
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(async () => {
    pending.value = true;
    try {
      const result = await Device.apiSetDeviceFaulty({
        id: id!,
        isFaulty: !isFaulty,
      });
      if (result.data) {
        await deviceAlertStore.getDeviceNotifyData();
        $q.notify({
          type: "positive",
          message: "成功設定設備狀態為故障",
          position: "top",
        });
      } else {
        throw new Error(
          "設定設備狀態為故障失敗" + result.errors ? `: ${result.errors}` : ""
        );
      }
    } catch (err) {
      device.isFaulty = false;
      $q.notify({
        type: "negative",
        message: `設定設備狀態為故障失敗，${err}`,
        position: "top",
      });
    } finally {
      pending.value = false;
    }
  });
}

// 發布任務
const missionDialogVisible = ref(false);
const dialogClassName = ref("");
const dialogMissionContent = ref("");
const dialogDevice = ref({ name: "", id: 0 });
const dialogClassNameSelect = ref();
const dialogMissionContentSelect = ref();
function dialogClassNameSelectUpdateFunc() {
  dialogClassNameSelect.value.resetValidation();
}
function dialogMissionContentSelectUpdateFunc() {
  dialogMissionContentSelect.value.resetValidation();
}
function handleOpenMissionDialog(device: { name: string; id: number }) {
  missionDialogVisible.value = true;
  dialogDevice.value = device;
  dialogMissionContent.value = device.name + "出現異常，請前往確認";
}
function initialMissionData() {
  dialogMissionContent.value = "";
  dialogClassName.value = "";
}
async function handlePostMission() {
  // 檢查是否有欄位為空
  if (
    dialogClassName.value.trim() === "" ||
    dialogMissionContent.value.trim() === ""
  ) {
    dialogClassNameSelect.value.validate();
    dialogMissionContentSelect.value.validate();
    $q.notify({
      type: "warning",
      message: "班別欄位與任務內容不得為空",
      position: "top",
    });
    return;
  }
  // 檢查班別欄位值是否式有效值
  const roleName = classData.find(
    (data) => data.description === dialogClassName.value
  )?.name;
  if (!roleName) {
    dialogClassNameSelect.value.validate();
    $q.notify({
      type: "warning",
      message: "班別欄位的值非有效值，請重新選取",
      position: "top",
    });
    return;
  }

  const params: postMissionParams = {
    roleName,
    deviceId: dialogDevice.value.id,
    content: dialogMissionContent.value,
  };

  // 打 api 發布
  console.log("now deviceData processed", deviceData.value.processed);
  const result = (await emergencyMission.apiPostMission(
    params
  )) as typeof AxiosResponse;

  if (result.data) {
    console.log("result.data", result.data);
    $q.notify({
      type: "positive",
      message: "發布任務成功",
      position: "top",
    });

    // 若為未處理 => 設為已通知
    if (!deviceData.value.processed) handleSetNotified();

    // 清空 input
    dialogClassName.value = "";
    dialogDevice.value = { name: "", id: 0 };
    dialogMissionContent.value = "";
    missionDialogVisible.value = false;
  } else {
    $q.notify({
      type: "negative",
      message: "發布任務失敗",
      position: "top",
    });
  }
}

// 班別 select 下拉
interface ClassOption {
  description: string;
  id: string;
  isEmergency: boolean | null;
  name: string;
  type: number;
}
const classData: ClassOption[] = [];
const classOptions = ref<ClassOption[]>([]);
const className = ref("");
const classNameSelect = ref();
onMounted(async () => {
  const result = (await Role.apiGetRoles([
    { type: roleType.class, isEmergency: null },
  ])) as typeof AxiosResponse;
  if (result.data) {
    classData.length = 0;
    classData.push(...result.data);
    classOptions.value = classData;
  }
});

// 任務內容 select 下拉
interface optionItem {
  id: number;
  label: string;
  value: string;
  type: number;
  order: number;
  description: string;
  [key: string]: number | string;
}
const missionContent = ref(""); // 發布任務的內容
const lazyTexts: optionItem[] = [];
const missionLazyTextOptions = ref();
const missionContentSelect = ref();

onMounted(async () => {
  const result = (await System.apiGetSystemItem(
    systemType.EmergencyNotice
  )) as typeof AxiosResponse;
  if (result.data) {
    lazyTexts.length = 0;
    lazyTexts.push(...result.data);
    missionLazyTextOptions.value = lazyTexts;
  }
});

function classSelectFilterFunc(
  val: string,
  update: (func: () => void) => void
) {
  filterFunc<ClassOption>(val, update, classOptions, classData);
}
function filterFunc<T = object>(
  val: string,
  update: (func: () => void) => void,
  refOptions: Ref<T[]>,
  options: T[],
  optionLabelKey = "name"
) {
  update(() => {
    const needle = val.toLocaleLowerCase();
    refOptions.value = options.filter((option) =>
      (option[optionLabelKey as keyof typeof option] as string)
        ?.toLocaleLowerCase()
        ?.includes(needle)
    );
  });
}
</script>

<style scoped lang="scss">
header {
  .deviceInfo {
    border-bottom: 2px solid rgb(221, 221, 221);
    padding-bottom: 0.8rem;
    padding-left: 0;
    width: 50%;
  }
}
.alertContent {
  padding: 1rem 0 0;
  font-size: 1rem;
  font-weight: bold;
  .content {
    line-height: 1.5em;
  }
  .options {
    display: flex;
    gap: 1rem;
    margin-left: -0.5rem;
    margin-top: 0.24rem;
  }

  .notifyResultsContainer {
    margin-top: 1rem;
    padding-top: 0.8rem;
    border-top: 2px solid rgb(221, 221, 221);
    .title {
      font-size: 1.2rem;
      font-weight: bold;
      margin-bottom: 0.24rem;
    }
    ul {
      margin: 0;
      padding: 0;
      border-radius: 0.24rem;
      list-style: none;
      font-weight: normal;
      &.notifyResults {
        padding: 0.24rem 0.5rem;
        max-height: 8rem;
        overflow-y: auto;
        outline: 1px solid rgb(221, 221, 221);
        display: grid;
        gap: 0.3rem;
      }
    }
  }
  .btnContainer {
    padding-top: 1.2rem;
    width: 100%;
    display: flex;
    justify-content: center;
    gap: 2rem;
    .q-btn {
      padding: 0 1.4rem;
      font-weight: bold;
    }
    @media screen and (max-width: 768px) {
      padding-top: 2rem;
      padding-bottom: 0.8rem;
    }
  }
}
</style>
