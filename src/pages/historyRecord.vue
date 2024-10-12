<template>
  <q-page
    class="q-pa-md row grid"
    :style="$q.screen.xs || $q.screen.sm ? 'grid-template-rows: 60px 1fr' : ''"
  >
    <h3
      v-if="$q.screen.xs || $q.screen.sm"
      class="text-left text-bold"
      style="font-size: 1.55rem; margin: 0"
    >
      歷史紀錄
    </h3>
    <q-card class="col-12">
      <q-tabs
        v-model="activeTab.value"
        :class="
          $q.screen.xs || $q.screen.sm ? 'twoTabsPerRow' : 'mainTabsDesign'
        "
        :active-class="
          $q.screen.xs || $q.screen.sm ? undefined : 'mainTabsActiveClass'
        "
        active-color="activeTab"
        indicator-color="activeTab"
        :active-bg-color="$q.screen.xs || $q.screen.sm ? undefined : 'white'"
        content-class="bg-grey-1"
        align="justify"
        narrow-indicator
        outside-arrows
        inline-label
      >
        <q-tab
          v-for="(tab, index) in blockTabs"
          :key="index"
          :name="tab.value"
          :label="tab.label"
          :icon="
            $q.screen.xs || $q.screen.sm
              ? undefined
              : tab.value === activeTab.value
              ? mdiCheckCircle
              : ''
          "
          @click="tabChange(tab)"
        />
      </q-tabs>

      <q-separator />

      <q-tab-panels
        v-model="activeTab.value"
        animated
        :style="{
          height:
            $q.screen.xs || $q.screen.sm
              ? 'calc(100% - 140px)'
              : 'calc(100% - 50px)',
        }"
      >
        <q-tab-panel
          v-for="(tab, index) in blockTabs"
          :key="index"
          :name="tab.value"
        >
          <BlockComponent
            ref="blockRef"
            :blockAttrs="blockAttrs"
            v-on="blockEvent"
          >
            <template #defaultSearch>
              <q-btn
                style="min-width: 20%"
                label="日期搜尋"
                :color="
                  searchBoxVariables[activeTab.value]?.showSearchBox
                    ? 'primary'
                    : ''
                "
                :text-color="
                  searchBoxVariables[activeTab.value]?.showSearchBox
                    ? ''
                    : 'text-primary'
                "
                @click.stop="
                  searchBoxVariables[activeTab.value].showSearchBox =
                    !searchBoxVariables[activeTab.value]?.showSearchBox
                "
              />
              <q-card
                v-if="searchBoxVariables[activeTab.value]?.showSearchBox"
                class="searchBox"
                @click.stop
              >
                <div class="grid">
                  <q-radio
                    v-model="searchBoxVariables[activeTab.value].searchType"
                    val="all"
                    label="搜尋全部"
                  />
                  <q-radio
                    v-model="searchBoxVariables[activeTab.value].searchType"
                    val="byWeek"
                    label="搜尋當週"
                  />
                  <q-radio
                    v-model="searchBoxVariables[activeTab.value].searchType"
                    val="byMonth"
                    label="搜尋當月"
                  />

                  <div>
                    <q-radio
                      v-model="searchBoxVariables[activeTab.value].searchType"
                      val="customize"
                      label="自訂搜尋起迄"
                    />
                    <div class="dateRange">
                      <div class="dateBox">
                        <span class="label">起始日期</span>
                        <DateSelect
                          @focus="handleFocusDateSelect"
                          :min-width="
                            $q.screen.xs || $q.screen.sm ? '80px' : '180px'
                          "
                          outlined
                          dense
                          v-model:dateModel="
                            searchBoxVariables[activeTab.value].dateRangeModel
                              .from
                          "
                        />
                      </div>
                      ~
                      <div class="dateBox">
                        <span class="label">結束日期</span>
                        <DateSelect
                          @focus="handleFocusDateSelect"
                          :min-width="
                            $q.screen.xs || $q.screen.sm ? '80px' : '180px'
                          "
                          outlined
                          dense
                          v-model:dateModel="
                            searchBoxVariables[activeTab.value].dateRangeModel
                              .to
                          "
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <q-btn
                  class="fit"
                  type="submit"
                  color="primary"
                  text-color="white"
                  label="開始搜尋"
                />
              </q-card>
            </template>
            <template #customBlockField="{ data, config }">
              <div v-if="config.name === 'name'">
                <span
                  class="q-mr-sm text-bold text-primary cursor-pointer"
                  @click="openDialog(data)"
                >
                  {{ data.name }}
                </span>
              </div>
            </template>
          </BlockComponent>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>

  <DialogForm
    :dialogAttrs="dialogAttrs"
    :blockAttrs="blockAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  />
  <!-- 歷史事件簿 -->
  <q-dialog v-model="historyRecordVisible" persistent id="historyRecord">
    <q-card
      :style="
        $q.screen.xs || $q.screen.sm
          ? 'width:100%; height:100%'
          : 'min-width: 80%; height:100%'
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <div
          class="text-h6 text-bold"
          :style="{ width: $q.screen.xs || $q.screen.sm ? '80%' : 'auto' }"
        >
          {{
            `歷史事件簿 ( ${date.formatDate(
              bookData?.receive.dateTime,
              "YYYY-MM-DD"
            )} ${bookData?.name} )`
          }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="flex-grow-1">
        <q-btn
          outline
          color="primary"
          :icon="mdiPrinter"
          @click="handlePrint"
          class="q-mb-md"
        >
          <q-tooltip
            class="text-body2"
            transition-show="scale"
            transition-hide="scale"
            anchor="top middle"
            self="bottom middle"
            :offset="[10, 10]"
          >
            列印
          </q-tooltip>
        </q-btn>
        <div class="flex border-1 overflow-hidden" v-if="bookData">
          <div
            style="width: 50%"
            v-for="(item, index) in historyBookConfig"
            :key="index"
          >
            <div
              class="q-pa-sm border-1 text-subtitle1 text-bold text-center"
              style="background-color: #fefcf8"
            >
              {{ item.label }}
            </div>
            <div
              class="q-pa-sm border-1 text-subtitle1 text-bold text-center full-height"
            >
              <template v-if="item.value">
                {{ bookData[item.value as keyof BookViewModel] }}
              </template>
            </div>
          </div>
        </div>
        <div class="q-pt-md flex">
          <div
            class="flex column flex-grow-1 full-width"
            :class="[
              {
                'q-pt-md bg-white rounded-lg': $q.screen.xs || $q.screen.sm,
              },
            ]"
          >
            <div class="row q-col-gutter-md q-mb-lg">
              <div
                v-for="(block, index) in PplTypeBlock"
                :key="index"
                :class="
                  $q.screen.xs || $q.screen.sm
                    ? (block.grid === '2' &&
                        index !== PplTypeBlock.length - 1) ||
                      block.value === 'Ask'
                      ? 'col-4'
                      : 'col-12'
                    : `col-${block.grid}`
                "
              >
                <q-card
                  :flat="block !== pplBlock"
                  :class="[
                    `text-${block.color}`,
                    { active: block === pplBlock },
                    { cardColor: block !== pplBlock },
                  ]"
                  class="full-height"
                >
                  <q-card-section
                    class="full-height cursor-pointer"
                    :class="{
                      'no-pointer-events': block === pplBlock,
                      'q-pa-sm': $q.screen.xs || $q.screen.sm,
                    }"
                    @click="getPplBlockData(block)"
                  >
                    <div
                      class="flex column justify-between"
                      :style="{
                        height: $q.screen.xs || $q.screen.sm ? '100%' : '150px',
                      }"
                    >
                      <div
                        class="text-bold"
                        :class="
                          $q.screen.xs || $q.screen.sm ? 'fz-16' : 'fz-20'
                        "
                      >
                        <div class="flex flex-center q-mb-md">
                          <span> {{ block.title }}</span>
                        </div>

                        <q-separator v-if="!$q.screen.xs && !$q.screen.sm" />
                      </div>
                      <div
                        class="text-center text-bold"
                        :style="[
                          {
                            'font-size':
                              $q.screen.xs || $q.screen.sm ? '30px' : '60px',
                          },
                        ]"
                      >
                        {{ block.pplNum }}
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
            <q-card style="height: calc(100vh - 300px)">
              <BlockComponent
                ref="blockRef"
                :blockAttrs="tableAttrs"
                v-on="blockEvent"
                :custom-height="'calc(100% - 30px)'"
                :isSearch="false"
              >
                <template #customBlockField="{ data, config }">
                  <div v-if="config.name === 'fullname'">
                    <span class="q-mr-sm">
                      {{ data.fullname }}
                    </span>
                    <span>
                      <q-btn
                        v-if="typeof data?.id === 'number'"
                        flat
                        size="xs"
                        text-color="white"
                        dense
                        padding="2px 4px"
                        class="text-bold q-mr-sm"
                        style="font-size: 12px; background: #d1cd57"
                      >
                        <span>附</span>
                        <q-tooltip
                          class="text-body2"
                          transition-show="scale"
                          transition-hide="scale"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[10, 10]"
                        >
                          附屬帳號
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        v-if="data.isDisability"
                        size="sm"
                        text-color="white"
                        dense
                        :icon="mdiWheelchair"
                        padding="3px 2px"
                        class="bg-positive"
                      >
                        <q-tooltip
                          class="text-body2"
                          transition-show="scale"
                          transition-hide="scale"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[10, 10]"
                        >
                          行動不便者
                        </q-tooltip>
                      </q-btn>
                    </span>
                  </div>
                </template>
              </BlockComponent>
            </q-card>
          </div>
        </div>
      </q-card-section>
      <q-card-section>
        <div class="flex justify-end" v-if="tab === 'emergencyRecord'">
          <q-option-group
            v-model="checkedDataType"
            :options="dataType"
            type="checkbox"
            inline
          >
            <template v-slot:label="opt">
              <span class="text-bold fz-16" :class="`text-${opt.color}`"
                >{{ opt.label }}
              </span>
            </template>
          </q-option-group>
        </div>

        <q-card>
          <q-tabs
            v-model="tab"
            :class="
              $q.screen.xs || $q.screen.sm ? 'twoTabsPerRow' : 'mainTabsDesign'
            "
            :active-class="
              $q.screen.xs || $q.screen.sm ? undefined : 'mainTabsActiveClass'
            "
            active-color="activeTab"
            indicator-color="activeTab"
            :active-bg-color="
              $q.screen.xs || $q.screen.sm ? undefined : 'white'
            "
            content-class="bg-grey-1"
            align="justify"
            narrow-indicator
            outside-arrows
            inline-label
          >
            <q-tab
              label="火災重要節點時間紀錄"
              name="importantNode"
              :icon="
                tab === 'importantNode' && !($q.screen.xs || $q.screen.sm)
                  ? mdiCheckCircle
                  : undefined
              "
            />
            <q-tab
              label="火災緊急應變追蹤紀錄"
              name="emergencyRecord"
              :icon="
                tab === 'emergencyRecord' && !($q.screen.xs || $q.screen.sm)
                  ? mdiCheckCircle
                  : undefined
              "
            />
          </q-tabs>

          <q-separator />
          <q-tab-panels v-model="tab" animated class="fz-16">
            <q-tab-panel name="importantNode" style="height: 500px">
              <div
                v-if="!sortedFormattedAllDataArr.length"
                class="text-grey text-center"
              >
                尚未有資料
              </div>
              <div
                v-for="(item, index) in sortedFormattedAllDataArr.filter(
                  (item) => item.type === 'fireCrewOperations'
                )"
                :key="index"
              >
                <div class="text-negative">
                  <span>
                    {{ item.dateTime }}
                  </span>
                  <span> - </span>

                  <template v-if="item.label">
                    <span>{{ item.label }}</span>
                  </template>

                  <template v-if="item.status">
                    <span>{{ item.status }}</span>
                  </template>
                </div>
              </div>
            </q-tab-panel>

            <q-tab-panel name="emergencyRecord" style="height: 500px">
              <div
                v-if="!sortedFormattedAllDataArr.length"
                class="text-grey text-center"
              >
                尚未有資料
              </div>
              <div
                v-for="(item, index) in sortedFormattedAllDataArr"
                :key="index"
              >
                <div
                  :class="`text-${
                    dataType.find((type) => type.value === item.type)?.color
                  }`"
                >
                  <span>
                    {{ item.dateTime }}
                  </span>
                  <span> - </span>

                  <template v-if="item.label">
                    <span>{{ item.label }}&nbsp;</span>
                  </template>

                  <template v-if="item.status">
                    <span>{{ item.status }}</span>
                  </template>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { date } from "quasar";
// api
import Book, { BookViewModel, bookConfig } from "src/api/book";
import DeviceHistory, {
  ReceiveDeviceAddressViewModel,
  formatedDeviceBlockData,
} from "src/api/deviceHistory";
import EmergencyHistory, {
  EmergencyRecordViewModel,
  formatedEmergencyBlockData,
} from "src/api/emergencyHistory";
import {
  FireAccountAckRequest,
  UserAccountAcks,
  UserAccountBook,
  pplTableConfig,
} from "src/api/fireCheck";
import { SendViewModel } from "src/stores/signalR";
import { GroupTaskViewModel } from "src/api/emergencyMission";
import { AddressPlateViewModel } from "src/api/addressPlate";

// utils
import { birthdayFormatAge } from "src/utils/formatUtils";
import { useSorted } from "@vueuse/core";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type { blockRefType } from "src/utils/tableMixin";
import { setStatus } from "src/utils/missionListFormater";
import { FireAckStatus, FireStatus } from "./emergency/pplStatus/index.type";
import { print, tdContent, getTable } from "src/utils/usePrint";
import mugShotUrl from "src/assets/image/mugShotPlaceHolder.png";

// icon
import { mdiPrinter, mdiCheckCircle } from "@quasar/extras/mdi-v6";
import { mdiWheelchair } from "@quasar/extras/mdi-v7";
import { pplBlockType } from "./emergency/pplStatus/index.vue";

// pinia
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/user";
const userStore = useUserStore();
const { isManager } = storeToRefs(userStore);

type formattedDataType = {
  dateTime: string;
  label: string;
  status: string;
  type: string;
};
const $q = inject("$q") as typeof QVueGlobals;

const blockRef = ref<blockRefType>();
const {
  dialogAttrs,
  tableAttrs,
  blockAttrs,
  handleBlockMixin,
  handleSelectArray,
  getDataMixin,
  handleDialogMixin,
  hideDialog,
} = tableMixin(blockRef as Ref<blockRefType>);

const blockEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getData,
  };
});
const dialogEvent = computed(() => {
  return {
    handleDialog,
  };
});
// Table Config 設定
const deviceActionStatusConfig = [
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
const emergencyOperationsConfig = [
  {
    label: "時間",
    name: "dateTimeString",
    field: "dateTimeString",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "紀錄類型",
    name: "chRecordType",
    field: "chRecordType",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "操作者 / 操作角色",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "事件名稱",
    name: "label",
    field: "label",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
];

onMounted(tabChange);
// tab
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "歷史事件簿",
    value: "historyRecordBook",
  },
  {
    label: "設備動作狀態",
    value: "deviceActionStatus",
  },
  {
    label: "緊急應變 / 人員操作",
    value: "emergencyOperations",
  },
];

// Tab Change
let API: typeof Book | typeof DeviceHistory | typeof EmergencyHistory;
function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log("tabChange tab", tab);
  if (activeTab.value.label === tab.label) return;
  blockAttrs.value.blockData.length = 0;

  activeTab.value.label = tab.label;
  activeTab.value.value = tab.value;
  blockAttrs.value.blockTitle = tab.value;
  dialogAttrs.value.dialogTitle = tab.label;

  if (activeTab.value.value === "historyRecordBook") {
    blockAttrs.value.tableConfig = bookConfig;
    API = Book;

    nextTick(() => {
      if (isManager.value) {
        blockAttrs.value.headerButtons = [];
        blockAttrs.value.tableButtons = [];
      } else {
        blockAttrs.value.headerButtons = [];
        blockAttrs.value.tableButtons = ["edit"];
      }
    });
  } else {
    if (activeTab.value.value === "deviceActionStatus") {
      blockAttrs.value.tableConfig = deviceActionStatusConfig;
      API = DeviceHistory;
    } else if (activeTab.value.value === "emergencyOperations") {
      blockAttrs.value.tableConfig = emergencyOperationsConfig;
      API = EmergencyHistory;
    }
    nextTick(() => {
      blockAttrs.value.headerButtons = [];
      blockAttrs.value.tableButtons = [];
    });
  }
}
// 處理 Block 業務、按鈕邏輯
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: BookViewModel | BookViewModel[]
) {
  handleBlockMixin(btn, data, API, getData);
}
// 取得分頁資料
// 日期選擇、搜尋
type searcgVariables = {
  showSearchBox: boolean;
  searchType: string;
  dateRangeModel: { from: string; to: string };
};

const searchBoxVariables = reactive<{ [key: string]: searcgVariables }>({
  deviceActionStatus: {
    showSearchBox: false,
    searchType: "all",
    dateRangeModel: { from: "", to: "" },
  },
  emergencyOperations: {
    showSearchBox: false,
    searchType: "all",
    dateRangeModel: { from: "", to: "" },
  },
});

function handleFocusDateSelect(e: FocusEvent) {
  searchBoxVariables[activeTab.value.value].searchType = "customize";
}

type TabNames = "deviceActionStatus" | "emergencyOperations";
type DataTypes = ReceiveDeviceAddressViewModel[] | EmergencyRecordViewModel[];

// 具體實現
function formattedBlockData(type: TabNames, data: DataTypes) {
  if (type === "deviceActionStatus") {
    return formatedDeviceBlockData(data as ReceiveDeviceAddressViewModel[]);
  } else if (type === "emergencyOperations") {
    return formatedEmergencyBlockData(data as EmergencyRecordViewModel[]);
  }
}

async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  console.log("now data", blockAttrs.value.blockData);
  if (activeTab.value.value === "historyRecordBook") {
    await getDataMixin(API, pagination);
    (blockAttrs.value.blockData as BookViewModel[]).forEach((item) => {
      item.location = `${item.receive.deviceAddresses
        .map((item) =>
          item.deviceAddress.device.floor
            ? item.deviceAddress.device.floor?.name
            : item.deviceAddress.device.floors?.map((floor) => floor.name)
        )
        .join("、")} ${item.receive.deviceAddresses.map(
        (address) => address.deviceAddress.device.addressPlate?.houseNumber
      )} ${item.receive.deviceAddresses
        .map((item) => item.deviceAddress.device.name)
        .join("、")}`;
      item.start = item.receive?.dateTime;
    });
  } else {
    const nowSearchType = searchBoxVariables[activeTab.value.value]?.searchType;
    if (nowSearchType === "all") {
      await getDataMixin(API, pagination);
      blockAttrs.value.blockData = formattedBlockData(
        activeTab.value.value as TabNames,
        blockAttrs.value.blockData as DataTypes
      )!;
      console.log("blockAttrs.value.blockData", blockAttrs.value.blockData);
      setBlockLoading(blockRef);
    }
    if (nowSearchType === "customize") {
      await searchByDate(pagination);
    } else if (nowSearchType === "byWeek") {
      await searchByWeek(pagination);
    } else if (nowSearchType === "byMonth") {
      await searchByMonth(pagination);
    }

    setBlockLoading(blockRef);
  }
}

const myPagination: blockRefType["pagination"] = {
  filters: "",
  page: 1,
  rowsPerPage: 25,
};
async function searchByDate(
  pagination: blockRefType["pagination"] = myPagination
) {
  const { from, to } = searchBoxVariables[activeTab.value.value].dateRangeModel;
  const start = from ? new Date(from + " 00:00:00").toISOString() : null;
  const end = to ? new Date(to + " 23:59:59").toISOString() : null;
  if (!start || !end) {
    $q.notify({
      type: "warning",
      message: "請先選擇日期",
      position: "top",
    });
    return;
  }
  const payload = { ...pagination, start, end };
  const result = (await API.apiGetDataByTimeSpan(
    payload
  )) as typeof AxiosResponse;
  console.log("customize result", result);
  blockAttrs.value.blockData = formattedBlockData(
    activeTab.value.value as TabNames,
    result.data.rows as DataTypes
  )!;
}
async function searchByWeek(payload = myPagination) {
  const result = (await API.apiGetDataByWeek(payload)) as typeof AxiosResponse;
  console.log("searchByWeek result", result);
  if (result.data && result.data.rows) {
    blockAttrs.value.blockData = formattedBlockData(
      activeTab.value.value as TabNames,
      result.data.rows as DataTypes
    )!;
  }
}
async function searchByMonth(payload = myPagination) {
  const result = (await API.apiGetDataByMonth(payload)) as typeof AxiosResponse;
  console.log("searchByMonth result", result);
  if (result.data && result.data.rows) {
    blockAttrs.value.blockData = formattedBlockData(
      activeTab.value.value as TabNames,
      result.data.rows as DataTypes
    )!;
    blockAttrs.value.totalNum = result.data.rowsNumber;
  }
}

function handleDialog(status: string, data: BookViewModel) {
  if (data.receive.master?.keeperUnit) data.receive.master.keeperUnit = null;
  if (data.receive.deviceAddresses[0].deviceAddress.master) {
    data.receive.deviceAddresses[0].deviceAddress.master.keeperUnit = null;
    data.receive.deviceAddresses[0].deviceAddress.device.keeperUnit = null;
  }

  handleDialogMixin(status, API, getData, data);
}

// 歷史紀錄簿 dialog
const historyRecordVisible = ref(false);
watch(historyRecordVisible, (newVal) => {
  if (!newVal) {
    formattedAllDataArr.value = [];

    checkedDataType.value = [
      "bookDeviceAddress",
      "groupTask",
      "fireAcks",
      "fireCrewOperations",
    ];
  }
});
const bookData = ref<BookViewModel>();
const historyBookConfig = ref([
  {
    label: "火災開始時間",
    value: "start",
  },
  {
    label: "火災結束時間",
    value: "end",
  },
  {
    label: "火災時長",
    value: "lastTime",
  },
  {
    label: "報案時間",
    value: "callTime",
  },
  {
    label: "發生地點",
    value: "location",
  },
  {
    label: "人員傷亡",
    value: "casualty",
  },
]);
async function openDialog(value: BookViewModel) {
  bookData.value = value;
  bookData.value.start = date.formatDate(
    bookData.value.receive.dateTime,
    "YYYY-MM-DD HH:mm:ss"
  );
  bookData.value.end = date.formatDate(
    bookData.value.send.dateTime,
    "YYYY-MM-DD HH:mm:ss"
  );
  bookData.value.lastTime = `${
    bookData.value.send?.dateTime
      ? date.getDateDiff(
          bookData.value.send?.dateTime,
          bookData.value.receive?.dateTime,
          "minutes"
        )
      : "0"
  } 分鐘`;
  console.log("bookData.value", bookData.value);
  historyRecordVisible.value = true;
  if (bookData.value) {
    const bookId = bookData.value.id;
    // 取得是否通知消防隊
    const notifyFireBrigade = await getnotifyFireBrigade(bookId);
    // 取得訊息對話框
    const emergencyNotice = await getEmergencyNotice(bookId);
    // 人員名冊 避難狀況統計
    await getBookStats(bookId);
    await getPplBlockData(PplTypeBlock[0]);
    // 緊急應變歷史紀錄
    const emergencyRecord = await getEmergencyRecord(bookId);
    // 設備動作狀態
    const bookDeviceAddress = await getBookDeviceAddress(bookId);
    // 讀取發布任務
    const bookGroupTask = await getBookGroupTask(bookId);
    formattedAllDataArr.value = [
      ...formattedAllDataArr.value,
      ...notifyFireBrigade,
      ...emergencyNotice,
      ...fireAcksData.value,
      ...emergencyRecord,
      ...bookDeviceAddress,
      ...bookGroupTask,
    ];
  }
}

// 火災緊急應變追蹤紀錄
const formattedAllDataArr = ref<formattedDataType[]>([]);

const sortedFormattedAllDataArr = computed(() => {
  const sortedData = useSorted(
    formattedAllDataArr,
    (a: { dateTime: string }, b: { dateTime: string }) =>
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
  );

  return sortedData.value
    .reverse()
    .filter((item) => checkedDataType.value.includes(item.type));
});

const pplBlock = ref();
const PplTypeBlock = reactive([
  {
    title: "避難總人數",
    value: "TotalNumber",
    pplNum: 0,
    grid: "2",
    color: "dark",
  },
  {
    title: "未接收訊息",
    value: "NotReceived",
    pplNum: 0,
    grid: "2",
    color: "red",
  },
  {
    title: "未避難完成",
    value: "NotCompleted",
    pplNum: 0,
    grid: "2",
    color: "red",
  },
  {
    title: "避難完成",
    value: "Completed",
    color: "dark",
    pplNum: 0,
    grid: "2",
  },
  {
    title: "不在現場",
    value: "NotThere",
    color: "dark",
    pplNum: 0,
    grid: "2",
  },
  {
    title: "請求協助",
    value: "Ask",
    pplNum: 0,
    grid: "2",
    color: "red",
  },
]);

const fireAcksData = ref<formattedDataType[]>([]);
enum FireAckStatusCh {
  Ask = "請求協助",
  NotThere = "不在現場",
  Completed = "避難完成",
}

// 人員名冊 避難狀況統計
async function getBookStats(bookId: BookViewModel["id"]) {
  if (bookId) {
    const result = (await Book.apiGetBookstats(bookId)) as typeof AxiosResponse;
    PplTypeBlock.forEach((item) => {
      if (item.value) {
        item.pplNum = result.data[item.value];
      }
    });
  }
}
async function getPplBlockData(block: pplBlockType) {
  if (block?.value) {
    pplBlock.value = block;
  }
  if (bookData.value && block.value) {
    tableAttrs.value.blockData = await getBookuseraccounts(
      FireStatus[block.value as keyof typeof FireStatus]
    );

    tableAttrs.value.tableConfig = pplTableConfig;
    tableAttrs.value.headerButtons = [];
    tableAttrs.value.tableButtons = [];
  }
}
async function getBookuseraccounts(status: FireStatus) {
  const pagination = {
    filters: "",
    page: 1,
    rowsPerPage: 0,
    id: bookData.value?.id,
    status,
  };
  const result = (await Book.apiGetBookuseraccounts(
    pagination
  )) as typeof AxiosResponse;
  result.data.rows.forEach((data: UserAccountAcks) => {
    data.userAccount.messages = data.messages;
  });
  const userAccountsData = result.data.rows.map(
    (data: UserAccountAcks) => data.userAccount
  );
  tableAttrs.value.totalNum = result.data.rowsNumber;

  // 總人數的避難狀況
  if (status === FireStatus.TotalNumber) {
    fireAcksData.value = result.data.rows
      .flatMap((item: UserAccountBook) => {
        if (Object.getOwnPropertyNames(item.fireAcks).length) {
          return Object.values(item.fireAcks)[0];
        } else if (Object.getOwnPropertyNames(item.fireAccountAcks).length) {
          return Object.values(item.fireAccountAcks)[0];
        }

        return undefined;
      })
      .filter(
        (value: any, index: any, self: any) =>
          self.indexOf(value) === index && value !== undefined
      );
    if (fireAcksData.value?.length) {
      const formattedData = fireAcksData.value.map((item: any) => {
        return {
          dateTime: date.formatDate(
            new Date(item.responseTime),
            "YYYY-MM-DD HH:mm:ss"
          ),
          label: `${
            item.synUser?.fullname || item.synAccount?.fullname || ""
          } 已被確認為狀態`,
          status: `${
            FireAckStatusCh[
              FireAckStatus[item.status] as keyof typeof FireAckStatusCh
            ]
          } ${item.status === FireAckStatus.Ask ? `${item.message}` : ""}`,
          type: "fireAcks",
        };
      });
      fireAcksData.value = formattedData;
    }
  }
  return userAccountsData;
}

// 緊急應變紀錄
const tab = ref("importantNode");

async function getEmergencyRecord(bookId: BookViewModel["id"]) {
  const result = (await Book.apiGetBookEmergencyrecord(
    bookId
  )) as typeof AxiosResponse;
  console.log("getEmergencyRecord", result.data);
  if (result.data) {
    const formattedEmergencyData = formatedEmergencyBlockData(result.data);
    const formattedData = formattedEmergencyData.map(
      ({ dateTimeString, name, label }) => {
        return {
          dateTime: dateTimeString,
          label: name,
          status: label,
          type: "fireCrewOperations",
        };
      }
    );
    console.log("formattedData", formattedData);
    return formattedData;
  }
  return [];
}
// 設備動作狀態
async function getBookDeviceAddress(bookId: BookViewModel["id"]) {
  const result = (await Book.apiGetBookDeviceaddress(
    bookId
  )) as typeof AxiosResponse;
  if (result.data) {
    const formatedDeviceData = formatedDeviceBlockData(result.data);
    const formattedData = formatedDeviceData.map(
      ({ dateTime, deviceName, status }) => {
        return {
          dateTime,
          label: deviceName,
          status,
          type: "bookDeviceAddress",
        };
      }
    );
    return formattedData;
  }
  return [];
}

// 取得是否通知消防隊
async function getnotifyFireBrigade(bookId: BookViewModel["id"]) {
  const result = (await Book.apiGetBookSendFireGuide(
    bookId
  )) as typeof AxiosResponse;
  if (result.data) {
    const formattedData = result.data.map((item: SendViewModel) => {
      return {
        dateTime: date.formatDate(
          new Date(item.dateTime),
          "YYYY-MM-DD HH:mm:ss"
        ),
        label: JSON.parse(item.log).Message,
        type: "fireCrewOperations",
      };
    });
    if (bookData.value && result.data.length) {
      // 取得最後一筆通知消防隊的時間
      bookData.value.callTime = date.formatDate(
        result.data[result.data.length - 1].dateTime,
        "YYYY-MM-DD HH:mm:ss"
      );
    }
    return formattedData;
  }
  return [];
}
// 取得send 訊息對話框
async function getEmergencyNotice(bookId: BookViewModel["id"]) {
  const result = (await Book.apiGetBookSendEmergencyNotice(
    bookId
  )) as typeof AxiosResponse;
  if (result.data) {
    const formattedData = result.data.map((item: SendViewModel) => {
      return {
        dateTime: date.formatDate(
          new Date(item.dateTime),
          "YYYY-MM-DD HH:mm:ss"
        ),
        label: JSON.parse(item.log).Message,
        type: "emergencyNotice", // 新增一個type
      };
    });

    return formattedData;
  }
  return [];
}
// 讀取發布任務
async function getBookGroupTask(bookId: BookViewModel["id"]) {
  const result = (await Book.apiGetBookGroupTask(
    bookId
  )) as typeof AxiosResponse;
  if (result.data) {
    const formattedData = result.data.map((item: GroupTaskViewModel) => {
      return {
        dateTime: date.formatDate(
          new Date(item.sendTime),
          "YYYY-MM-DD HH:mm:ss"
        ),
        label: `【${item.sendUser.fullname}】發布任務給【${
          item.role.description
        }】 ${item.device ? " - " + item.device?.name : ""} - ${item.content}`,
        status: `| 任務結果 : ${setStatus(item)}`,
        type: "groupTask",
      };
    });
    return formattedData;
  }
  return [];
}

const checkedDataType = ref([
  "bookDeviceAddress",
  "groupTask",
  "fireAcks",
  "fireCrewOperations",
  "emergencyNotice",
]);
const dataType = ref([
  {
    label: "設備動作狀態",
    value: "bookDeviceAddress",
    color: "dark",
  },
  {
    label: "發布任務",
    value: "groupTask",
    color: "positive",
  },
  {
    label: "人員名冊回報狀態",
    value: "fireAcks",
    color: "blue",
  },
  {
    label: "緊急應變 / 人員操作",
    value: "fireCrewOperations",
    color: "negative",
  },
  {
    label: "緊急通知訊息對話框",
    value: "emergencyNotice",
    color: "warning",
  },
]);

// 列印
const fireAcksTableTitle = {
  TotalNumber: "避難總人數",
  NotReceived: "未接收訊息",
  NotCompleted: "未避難完成",
  Completed: "避難完成",
  NotThere: "不在現場",
  Ask: "請求協助",
};
const pplTableTitle = {
  houseNumber: "地址",
  photo: "照片",
  fullname: "姓名",
  sex: "性別",
  birthday: "年齡",
  isDisability: "行動不便者",
  contactNumber: "電話",
  phoneNumber: "手機",
  emergencyContact: "緊急聯絡人",
  emergencyNumber: "緊急電話",
  note: "備註",
  messages: "請求協助內容",
};
const bookDataTitle = {
  start: "火災開始時間",
  end: "火災結束時間",
  lastTime: "火災時長",
  callTime: "報案時間",
  location: "發生地點",
  casualty: "人員傷亡",
};
let tableContent = "";
async function handlePrint() {
  const fireAcksTdContentHTML = getTable(
    fireAcksTableTitle,
    fireAcksTdContent()
  );
  const bookDataTdContentHTML = getTable(bookDataTitle, bookDataTdContent());
  const fireAcksPplTdContentHTML = await fireAcksPplTdContent();
  const sortedFormattedAllDataHTML = sortedFormattedAllData();

  tableContent = `
    <div style="margin-bottom:24px;">${bookDataTdContentHTML}</div>
    <div style="margin-bottom:24px;">${fireAcksTdContentHTML}</div>
    <div style="margin-bottom:24px;">${fireAcksPplTdContentHTML}</div>
    <table>${sortedFormattedAllDataHTML}</table>
  `;
  setTimeout(() => {
    print(tableContent, "歷史紀錄", true);
  }, 1000);
}
// 歷史紀錄簿資料
function bookDataTdContent() {
  const tempData: { [key: string]: string } = {};

  Object.entries(bookData.value!).forEach((item) => {
    tempData[item[0]] = `<p>${item[1]}</p>`;
  });
  return [tempData];
}
// 人員名冊回報狀態
function fireAcksTdContent() {
  const tempData: { [key: string]: string } = {};
  PplTypeBlock.forEach((item) => {
    tempData[item.value] = `<p>${item.pplNum}</p>`;
  });
  return [tempData];
}
// 人員名冊名單 - 根據避難狀態排列
async function fireAcksPplTdContent() {
  const fireAcksTypeArr = [
    "NotReceived",
    "NotCompleted",
    "Completed",
    "NotThere",
    "Ask",
  ];
  let htmlResult = "";
  const htmlResultArr = await Promise.all(
    fireAcksTypeArr.map(async (item) => {
      const blockData = await getBookuseraccounts(
        FireStatus[item as keyof typeof FireStatus]
      );

      const typeTitle = PplTypeBlock.find(
        (block) => block.value === item
      )?.title;
      const thObject = pplTableTitle;
      const tdContent = generateFireAcksTdObj(blockData);

      const header = `<tr>
    ${Object.values(thObject)
      .map((item) => {
        return `<th style="padding: 5px; width: 10%">${item}</th>`;
      })
      .join("")}
  </tr>`;
      const body = tdContent
        .map((content: any) => {
          return `<tr>
    ${Object.keys(thObject)
      .map((key) => {
        return `<td><div>${content[key]}</div></td>`;
      })
      .join("")}
  </tr>`;
        })
        .join("");
      const result = `<table style="margin-bottom:24px;"><h4>${typeTitle}</h4>${
        tdContent.length > 0
          ? header + body
          : "<p style='text-align:center'>無相關資料</p>" + body
      }</table>`;

      return result;
    })
  );
  htmlResultArr.forEach((item) => {
    htmlResult += item;
  });
  return htmlResult;
}
function generateFireAcksTdObj(blockData: UserAccountBook["userAccount"][]) {
  return blockData.map((member) => {
    const tempData = {
      houseNumber: "",
      photo: "",
      fullname: "",
      sex: "",
      birthday: "",
      isDisability: "",
      contactNumber: "",
      phoneNumber: "",
      emergencyContact: "",
      emergencyNumber: "",
      note: "",
      messages: "",
    };

    tempData.houseNumber += `<p>${
      member.addressPlates
        ?.map((item: AddressPlateViewModel) => item.houseNumber)
        .filter(
          (value: any, index: any, self: string | any[]) =>
            self.indexOf(value) === index
        )
        .join("、") || ""
    }</p>`;
    tempData.fullname += `<p>${member.fullname || ""}</p>`;
    console.log("member", member, member.mugShotUrl);

    if (member.mugShotFileId) {
      tempData.photo += `
            <div>
              <img src="${member.mugShotUrl}" alt="image">
            </div>
            `;
    } else {
      tempData.photo += `
            <div>
              <img src="${mugShotUrl}" alt="image">
            </div>
            `;
    }
    tempData.sex += `<p>${
      member.sex ? "女" : member.sex !== null ? "男" : "尚未填寫"
    }</p>`;
    tempData.birthday += `<p>${
      member.birthday ? birthdayFormatAge(member.birthday) : ""
    }</p>`;
    tempData.isDisability += `<p>${member.isDisability ? "是" : "否"}</p>`;
    tempData.contactNumber += `<p>${member.contactNumber || ""}</p>`;
    tempData.phoneNumber += `<p>${member.phoneNumber || ""}</p>`;
    tempData.emergencyContact += `<p>${member.emergencyContact || ""}</p>`;
    tempData.emergencyNumber += `<p>${member.emergencyNumber || ""}</p>`;
    tempData.note += `<p>${member.note || ""}</p>`;
    tempData.messages += `<p>${member.messages?.join("") || ""}</p>`;
    return tempData;
  });
}
// 火災緊急應變追蹤紀錄
function sortedFormattedAllData() {
  let tempData = "";

  sortedFormattedAllDataArr.value.forEach((item) => {
    tempData += `<p>${item.dateTime} ${item.label} ${
      item.status ? item.status : ""
    } </p>`;
  });
  return `<h3>火災緊急應變追蹤紀錄</h3>${tempData}`;
}
</script>

<style scoped lang="scss">
.searchBox {
  width: 100%;
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  & > .grid {
    padding: 0.8rem;
    font-size: 1rem;
    font-weight: bold;
  }

  @media screen and (min-width: 600px) {
    width: auto;
    top: auto;
    left: auto;
    bottom: 0;
    right: 0;
    transform: translateY(calc(100% + 0.6rem));
  }
}

.dateRange {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-left: 2.5rem;
  font-size: 0.9rem;
  .dateBox {
    display: grid;
    gap: 0.24rem;
    .label {
      color: #888;
    }
    & > span.label {
      font-size: 1rem;
    }
  }
}
.active {
  background-color: #fff !important;
  transition-duration: 0.5s;
  cursor: not-allowed;
}

.cardColor {
  background-color: #f3eee7;
}
</style>
