<template>
  <Teleport to="body">
    <div
      class="stickyBack q-dialog__backdrop fixed-full"
      :class="{ show: showBackDrop }"
      @click.prevent="fab.hide"
    ></div>
  </Teleport>

  <q-page-sticky
    ref="helper"
    position="bottom-right"
    :offset="fabPos"
    class="z-top"
  >
    <q-fab
      ref="fab"
      @show="showBackDrop = true"
      @hide="showBackDrop = false"
      icon="keyboard_arrow_up"
      direction="up"
      color="primary"
      vertical-actions-align="right"
      v-touch-pan.prevent.mouse="moveFab"
    >
      <!-- :disable="draggingFab" -->
      <q-fab-action
        v-for="item in helperMenu"
        :key="item.value"
        label-position="left"
        :color="item.color"
        :text-color="item.color !== 'primary' ? 'dark' : 'white'"
        @click="helperAction(item)"
        @mouseenter="isHover = true"
        @mouseout="isHover = false"
        :label="item.label"
        unelevated
      />

      <q-fab-action
        v-if="$q.screen.xs || $q.screen.sm || isInHomePage"
        label-position="left"
        color="white"
        @click="fireSupportVisible = !fireSupportVisible"
        @mouseenter="isHover = true"
        @mouseout="isHover = false"
        unelevated
      >
        <q-img
          src="~assets/image/fireSupport.webp"
          style="width: 20px"
          alt="消防支援"
        />
        <span class="text-dark q-ml-sm text-bold">消防支援</span>
      </q-fab-action>
    </q-fab>
  </q-page-sticky>

  <!-- 防災中心電話 -->
  <q-dialog v-model="isDialogOpen" @hide="dialogClose">
    <!-- 防災中心電話 -->
    <q-card v-if="isContact" style="width: 300px; max-width: 80vw">
      <q-card-section>
        <div class="text-h6 text-center text-bold">防災中心電話</div>
      </q-card-section>

      <q-card-section class="q-pt-none">
        <div
          class="text-center"
          v-for="cellPhone in contactData"
          :key="String(cellPhone.id)"
        >
          {{ cellPhone.label }}
        </div>
      </q-card-section>

      <q-card-actions align="center" class="bg-white text-primary">
        <q-btn flat label="已了解如何聯繫防災中心" v-close-popup />
      </q-card-actions>
    </q-card>
    <!-- 設備訊息 -->
    <q-card
      v-else-if="isEquipMsg"
      class="flex column"
      :style="
        $q.screen.xs || $q.screen.sm || isInHomePage
          ? 'width:100%; height:100%'
          : 'min-width: 90%; height:80%'
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">設備訊息</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="flex-grow-1">
        <BlockComponent
          ref="blockRef"
          :blockAttrs="tableAttrs"
          v-on="tableEvent"
          :isSearch="false"
          :isDialogTable="true"
          :custom-height="'calc(100% - 20px)'"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- 模擬試驗 -->
  <DialogSimulationTest
    v-model="simulationTestVisible"
    :simulationTestVisible="simulationTestVisible"
  />

  <!-- 消防支援 -->
  <FireSupport v-model:visible="fireSupportVisible" />

  <!-- 設備警示 -->
  <DialogDeviceAlert
    v-if="$q.screen.xs || $q.screen.sm || isInHomePage"
    v-model="deviceAlertModel"
  />
</template>

<script setup lang="ts">
// utils
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
// api
import System, { SystemViewModel, systemType } from "src/api/system";
import DeviceHistory, {
  ReceiveDeviceAddressViewModel,
  formatedDeviceBlockData,
} from "src/api/deviceHistory";
// type
import type { blockRefType } from "src/utils/tableMixin";
import { TouchPanValue } from "quasar";
// websocket signalR
import { storeToRefs } from "pinia";
import { useDeviceAddressStore } from "src/stores/deviceAddress";

// 變數
const $q = inject("$q") as typeof QVueGlobals;
const isHover = ref(false);
const route = useRoute();
const isInHomePage = computed(() => route.path === "/");

// store data
const deviceAddressStore = useDeviceAddressStore();
const { nohmi02, nohmi03, fatek03 } = storeToRefs(deviceAddressStore);

watch(nohmi02, (newValue) => {
  if (newValue) {
    console.log("nohmi02", newValue);
  }
});
watch(nohmi03, (newValue) => {
  if (newValue) {
    console.log("nohmi03", newValue);
  }
});
watch(fatek03, (newValue) => {
  if (newValue) {
    console.log("fatek03", newValue);
  }
});

// helper 選單設計
const helperMenuDefault = reactive([
  // {
  //   label: "設備訊息",
  //   value: "equipMsg",
  //   color: "white",
  // },
  {
    label: "聯絡防災中心",
    value: "contact",
    color: "primary",
  },
  {
    label: "防災中心官方帳號",
    value: "lineAccount",
    color: "white",
  },
  {
    label: "視訊直播間",
    value: "liveStream",
    color: "primary",
  },
  // {
  //   label: "模擬試驗",
  //   value: "simulationTest",
  //   color: "white",
  // },
]);
const helperMenu = computed(() => {
  if ($q.screen.xs || $q.screen.sm || isInHomePage.value) {
    return [
      ...helperMenuDefault,
      {
        label: "設備警示",
        value: "deviceAlert",
        color: "primary",
      },
    ];
  }

  return helperMenuDefault;
});

// helper 拖曳功能
let helperWidth: number;
const fabPos = ref([18, 18]);
// const draggingFab = ref(false);
const windowHeight = window.innerHeight;
const windowWidth = window.innerWidth;
const helper = ref<ComponentPublicInstance<HTMLDivElement>>();

onMounted(() => {
  helperWidth = helper.value?.$el.clientWidth;
});

// const moveFab: TouchPanValue = (ev) => {
//   if (!ev || !ev.position || !ev.delta) return;
//   const { left, top } = ev.position;
//   const { x, y } = ev.delta;
//   if (!left || !top || !x || !y) return;

//   const isFabOutsideWindow =
//     left >= windowWidth - helperWidth / 2 ||
//     left <= helperWidth / 2 ||
//     top >= windowHeight - helperWidth / 2 ||
//     top <= helperWidth / 2;

//   if (isFabOutsideWindow) return;

//   // draggingFab.value = ev.isFirst !== true && ev.isFinal !== true;
//   fabPos.value = [fabPos.value[0] - x, fabPos.value[1] - y];
// };
const moveFab: TouchPanValue = (ev) => {
  if (!ev || !ev.position || !ev.delta) return;
  const { left, top } = ev.position;
  const { x, y } = ev.delta;
  if (!left || !top || !x || !y) return;
  if (x === 0 && y === 0) return;

  let newX = fabPos.value[0] - x;
  let newY = fabPos.value[1] - y;

  const maxX = windowWidth - helperWidth;
  const maxY = windowHeight - helperWidth - 72;

  newX = Math.max(0, Math.min(newX, maxX));
  newY = Math.max(0, Math.min(newY, maxY));

  fabPos.value = [newX, newY];
};

const isDialogOpen = ref(false);
const isContact = ref(false);
const isEquipMsg = ref(false);
const isCommitSettings = ref(false);

type helperMenuItemType = {
  label: string;
  value: string;
  color: string;
};

const deviceConfig = [
  {
    label: "時間",
    name: "dateTime",
    field: "dateTime",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "地址",
    name: "addressName",
    field: "addressName",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "空間名稱",
    name: "areaName",
    field: "areaName",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "種類",
    name: "deviceType",
    field: "deviceType",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "設備名稱",
    name: "deviceName",
    field: "deviceName",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "設備狀況",
    name: "deviceStatus",
    field: "status",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "備註",
    name: "note",
    field: (row: ReceiveDeviceAddressViewModel) =>
      row?.deviceAddress?.device?.note ?? "",
    align: "left",
    formType: "textArea",
    isTable: true,
  },
];
const contactData = ref<SystemViewModel[]>([]);
const router = useRouter();
async function helperAction(item: helperMenuItemType) {
  if (item.value === "contact") {
    isDialogOpen.value = !isDialogOpen.value;
    isContact.value = true;
    const result = (await System.apiGetSystemItem(
      systemType.Contact
    )) as typeof AxiosResponse;
    if (result.data) contactData.value = result.data;
  } else if (item.value === "lineAccount") {
    const href = "https://lin.ee/rshiHBg";
    window.open(href, "_blank");
    isDialogOpen.value = false;
  } else if (item.value === "equipMsg") {
    isDialogOpen.value = !isDialogOpen.value;
    isEquipMsg.value = true;
    const result = (await DeviceHistory.apiGetData({
      filters: "",
      page: 1,
      rowsPerPage: 12,
    })) as typeof AxiosResponse;
    console.log("now result", result);
    nextTick(() => {
      tableAttrs.value.tableConfig = deviceConfig;
      tableAttrs.value.headerButtons = [];
      tableAttrs.value.tableButtons = [];
      setBlockLoading(blockRef);
    });
  } else if (item.value === "commitSettings") {
    isCommitSettings.value = true;
  } else if (item.value === "simulationTest") {
    simulationTestVisible.value = true;
  } else if (item.value === "liveStream") {
    const streamPage = router.resolve({ name: "liveStream" });
    window.open(streamPage.href, "_blank");
  } else if (item.value === "deviceAlert") handleDeviceAlert();
}
function dialogClose() {
  isContact.value = false;
  isEquipMsg.value = false;
}
// 設備訊息 dialogTable
const blockRef = ref<blockRefType>();
const { tableAttrs, handleSelectArray } = tableMixin(
  blockRef as Ref<blockRefType>
);
const tableEvent = computed(() => {
  return {
    handleSelectArray,
    changeBlockData: getTableData,
  };
});

async function getTableData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  if (pagination) {
    const result = (await DeviceHistory.apiGetData(
      pagination
    )) as typeof AxiosResponse;
    tableAttrs.value.blockData = result?.data?.rows
      ? formatedDeviceBlockData(result.data?.rows)
      : [];
    tableAttrs.value.totalNum = result?.data?.rowsNumber ?? 0;
  }
}

// 模擬試驗
const simulationTestVisible = ref(false);

// 消防支援
const fireSupportVisible = ref(false);

// 設備警示
const deviceAlertModel = ref(false);
function handleDeviceAlert() {
  deviceAlertModel.value = true;
}

// Fab backdrop
const fab = ref();
const showBackDrop = ref(false);
</script>

<style lang="scss" scoped>
:deep(.q-btn--fab-mini) {
  border: solid 1px $primary;
}

.stickyBack {
  z-index: 3501;
  opacity: 0;
  pointer-events: none;
  transition: all 0.24s ease;
  &.show {
    pointer-events: initial;
    opacity: 1;
  }
}
</style>
