<template>
  <!-- 大樓設定 -->
  <BuildingSelect flat dense class="q-mr-md" ref="buildingSelect" />

  <MarqueeComponent v-if="!$q.screen.xs && !$q.screen.sm"> </MarqueeComponent>

  <!-- 右半邊 List -->
  <div class="q-gutter-sm row items-center no-wrap q-ml-auto">
    <!-- // TODO: 之後可能拿掉的 -->
    <template v-if="!$q.screen.xs && !$q.screen.sm">
      <q-btn
        label="模擬探測器關閉"
        color="primary"
        @click="simulationDetectorOff"
      />
      <!-- <q-btn label="螢幕控制" color="primary" @click="monitorControl" /> -->
      <q-btn label="設備警示" color="primary" @click="deviceAlertModel = true">
        <q-badge v-if="deviceNotifiesLength" color="red" floating>
          {{ deviceNotifiesLength }}
        </q-badge>
      </q-btn>
    </template>
    <!-- 消防支援 -->
    <q-btn
      :class="process ? 'fireService' : 'bg-white'"
      @click="fireSupportVisible = !fireSupportVisible"
    >
      <q-img
        src="~assets/image/fireSupport.webp"
        style="width: 20px"
        alt="消防支援"
      />
      <span class="text-dark q-ml-sm text-bold">消防支援</span>
    </q-btn>
    <!-- 放大縮小頁面按鈕 -->
    <q-btn
      round
      dense
      flat
      color="dark"
      :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
      @click="$q.fullscreen.toggle()"
      v-if="$q.screen.gt.md"
    />

    <!-- 通知 -->
    <q-btn
      round
      dense
      flat
      color="dark"
      icon="notifications"
      @click="notificationComponent?.handleNotifyDrawer"
    >
      <!-- 如果有收到新的通知顯示紅點 -->
      <q-badge
        v-if="notificationComponent?.hasNewNotification"
        floating
        color="red"
        rounded
      />
    </q-btn>
    <!-- 個人設定 -->
    <q-btn-dropdown rounded auto-close dense flat color="dark" icon="person">
      <div class="row column no-wrap q-pa-md" style="min-width: 260px">
        <div class="flex justify-between items-center">
          <div class="flex q-gutter-md items-center">
            <q-avatar size="64px">
              <q-img
                class="fit"
                :src="userMugShotUrl"
                spinner-color="white"
                fit="cover"
                placeholder-src="~assets/image/mugShotPlaceHolder.png"
              />
            </q-avatar>

            <div class="text-subtitle1 text-bold">
              {{ userData?.fullname }}
            </div>
          </div>

          <q-btn
            color="primary"
            label="登出"
            size="md"
            push
            v-close-popup
            @click.prevent="logout"
          />
        </div>
        <q-separator class="q-my-md" />
        <q-list class="column justify-center">
          <q-item clickable :to="{ name: 'profile' }">
            <q-item-section> 個人資料 </q-item-section>
          </q-item>
          <q-item clickable @click="openDialog">
            <q-item-section> 大樓基本資料 </q-item-section>
          </q-item>
          <q-item
            v-for="list in dropdownLists"
            :key="list.path"
            clickable
            :to="{ name: list.name }"
          >
            <q-item-section> {{ list.label }} </q-item-section>
          </q-item>
        </q-list>
      </div>
    </q-btn-dropdown>
    <!-- 時間 -->
    <span
      class="text-dark q-pr-md"
      style="font-size: 18px"
      v-if="!$q.screen.xs && !$q.screen.sm"
      >{{ formattedTime }}</span
    >
  </div>

  <!-- 消防支援 -->
  <FireSupport v-model:visible="fireSupportVisible" />
  <!-- 大樓基本資料 dialog -->
  <q-dialog v-model="dialogAttrs.visible">
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 500px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">{{ dialogAttrs.dialogTitle }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-list bordered :dense="$q.screen.xs || $q.screen.sm">
          <q-item v-for="item in dialogConfig" :key="item.name">
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
            <q-item-section side style="width: 70%">
              <span
                v-if="
                  item.name === 'chairman' || item.name === 'executiveSecretary'
                "
                >{{ dialogAttrs.tempData[item.name] }}</span
              >
              <span v-else-if="item.name === 'fireManagers'">{{
                fireManagerName(item)
              }}</span>
              <span v-else>{{ dialogAttrs.tempData[item.name] }}</span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>

  <NotificationComponent
    v-if="!($q.screen.xs || $q.screen.sm)"
    ref="notificationComponent"
  />

  <DialogDeviceAlert v-model="deviceAlertModel" />
</template>

<script setup lang="ts">
// pinia store
import { useAuthStore } from "src/stores/auth";
import { usePermissionStore } from "src/stores/permission";
import { useBuildingStore } from "src/stores/building.js";
import { useUserStore } from "src/stores/user";
import { useSignalRStore, TriggeredDeviceData } from "src/stores/signalR";
import { storeToRefs } from "pinia";
import { useDeviceAddressStore } from "src/stores/deviceAddress";
import { useDeviceAlertStore } from "src/stores/deviceAlert";
// utils
import type { tableConfigItem } from "src/utils/tableMixin";
import tableMixin from "src/utils/tableMixin";
import { useNow, useDateFormat } from "@vueuse/core";
// api
import DeviceControl from "src/api/deviceControl";

const buildingStore = useBuildingStore();
const userStore = useUserStore();

const { userData, userMugShotUrl } = storeToRefs(userStore);
const { buildingData, buildingDataList } = storeToRefs(buildingStore);

const $q = inject("$q") as typeof QVueGlobals;

const deviceAlertStore = useDeviceAlertStore();
const deviceAddressStore = useDeviceAddressStore();
const signalRStore = useSignalRStore();
const { onFireBuildings } = storeToRefs(signalRStore);
const { deviceNotifiesLength, deviceAlertModel } =
  storeToRefs(deviceAlertStore);

const notificationComponent = ref();

// 大樓下拉 Ref
const buildingSelect = ref();

// 監聽 onFireBuildings 的變化
watch(
  onFireBuildings,
  (newVal, oldVal) => {
    // console.log("uniqueBuildingIds changed", { newVal, oldVal });
    // console.log("newVal.length > oldVal.length", newVal.length > oldVal.length);
    if (newVal.length === 1) {
      const Bid = localStorage.getItem("Bid");
      if (Bid && +Bid !== newVal[0].id) {
        // 跳轉到初始大樓
        const building = buildingDataList.value?.find(
          (item) => item.id === newVal[0].id
        );
        nextTick(() => {
          if (building) buildingSelect.value?.selectBuilding(building);
        });
      }
    } else if (newVal.length && buildingDataList.value) {
      const newFireBuilding = newVal[newVal.length - 1];
      const dismiss = $q.notify({
        type: "info",
        message: `【${newFireBuilding.name}】也監測到火勢了!`,
        position: "top",
        actions: [
          {
            label: "忽略",
            color: "white",
            handler: () => {
              dismiss();
            },
          },
          {
            label: "前往查看",
            color: "yellow",
            handler: () => {
              dismiss();
              nextTick(() => {
                buildingSelect.value?.selectBuilding(newFireBuilding);
              });
            },
          },
        ],
      });
    }
  },
  { immediate: true, deep: true }
);

// 防火管理人姓名 format
const fireManagerName = computed(() => {
  return function (item: { name: string }) {
    return dialogAttrs.value.tempData[item.name]
      .map((data: { fullname: string }) => data.fullname)
      .join(" , ");
  };
});

const router = useRouter();
const authStore = useAuthStore();
const usePermission = usePermissionStore();
const { userDropdownOptionsRoutes } = storeToRefs(usePermission);
const dropdownLists = ref<{ [key: string]: string }[]>([]);
const stop = watch(
  userDropdownOptionsRoutes,
  (val) => {
    dropdownLists.value = val.map((item) => ({
      label: item.meta?.title as string,
      path: item.path,
      name: item.name as string,
    }));
  },
  { immediate: true }
);
onMounted(() => setTimeout(stop, 10000));

// 緊急應變
const process = ref(false);

// 個人設定下拉
function logout() {
  authStore.logout();
  // 清除該帳號權限才擁有的選單設定
  usePermission.userDropdownOptionsRoutes.length = 0;
  usePermission.sideBarMenuRoutes.length = 0;
  usePermission.permissionRouteNames.length = 0;
  nextTick(() => {
    router.push("/login");
  });
}

//  大樓基本資料 dialog
const { dialogAttrs } = tableMixin();
const dialogConfig = ref<tableConfigItem[]>([]);

async function openDialog() {
  dialogAttrs.value.visible = true;
  dialogAttrs.value.dialogTitle = "大樓基本資料";
  if (buildingData.value) dialogAttrs.value.tempData = buildingData.value;
  dialogConfig.value = buildingStore.buildingTableConfig.filter(
    (item) => item.isTable
  );
}

// 現在時間
const formatter = ref("YYYY-MM-DD HH:mm:ss");
const formattedTime = useDateFormat(useNow(), formatter);

// 消防支援
const fireSupportVisible = ref(false);

// 螢幕控制
interface ScreenDetailed extends Screen {
  readonly availLeft: number;
  readonly availTop: number;
  readonly left: number;
  readonly top: number;
  readonly isPrimary: boolean;
  readonly isInternal: boolean;
  readonly devicePixelRatio: number;
  readonly label: string;
}
// eslint-disable-next-line no-undef
interface ExtendedFullscreenOptions extends FullscreenOptions {
  screen?: ScreenDetailed;
}

async function monitorControl() {
  // 根據瀏覽器支援的功能取得屏幕信息接口
  const screensInterface =
    "getScreens" in window // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? await (window as any).getScreens() // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : await (window as any).getScreenDetails();
  // 找到除當前屏幕外的其他屏幕
  const otherScreens = screensInterface.screens.filter(
    (screen: ScreenDetailed) => screen !== screensInterface.currentScreen
  );
  const currentScreenObj = {
    label: "目前螢幕",
    value: screensInterface.currentScreen,
  };

  // 如果找不到其他屏幕，就使用第一個屏幕
  let index = 1;
  let options = [currentScreenObj];
  if (otherScreens.length > 0) {
    const newOptions = otherScreens.map((screen: ScreenDetailed) => ({
      label: "螢幕" + index++,
      value: screen,
    }));
    options = options.concat(newOptions);
  }

  $q.dialog({
    title: "提示",
    message: "請選擇要放大至哪個螢幕",
    persistent: true,
    options: {
      type: "radio",
      model: options[0].value,
      isValid: (model: ScreenDetailed) => model !== undefined || model !== null,
      items: options,
    },
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(async (screen: ScreenDetailed) => {
    console.log("screen", screen);
    await document.body.requestFullscreen({
      screen,
    } as ExtendedFullscreenOptions);
  });
}

async function simulationDetectorOff() {
  const controlArray = deviceAddressStore.getFatek03ControlArray();
  controlArray[7] = 0;
  const result = await DeviceControl.apiDeviceControl(0, 204, controlArray);
  if (result.data.length && result.data[0].isSuccess) {
    $q.notify({
      type: "positive",
      message: "發送成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "發送失敗",
      position: "top",
    });
  }
}
</script>

<style scoped lang="scss">
.cursor-pointer {
  &:hover {
    cursor: pointer;
  }
}
.fireService {
  animation: fireServiceFade 2000ms infinite ease-in-out;
}
@keyframes fireServiceFade {
  from {
    background-color: #fde2b7;
  }
  50% {
    background-color: #ffffff;
  }
  to {
    background-color: #fde2b7;
  }
}
</style>
