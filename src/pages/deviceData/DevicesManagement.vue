<template>
  <q-page
    class="q-pa-md grid"
    :style="$q.screen.xs || $q.screen.sm ? 'grid-template-rows: 60px 1fr' : ''"
  >
    <h3
      v-if="$q.screen.xs || $q.screen.sm"
      class="text-left text-bold"
      style="font-size: 1.55rem; margin: 0"
    >
      設備資料
    </h3>
    <q-card class="overflow-hidden">
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
              ? 'calc(100% - 90px)'
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
            v-model:filters="filters"
          >
            <template #customTableButtons="scope">
              <q-btn
                v-for="(btn, index) in customTableButtons"
                :key="index"
                @click="handleClickOption(btn, scope.data)"
                dense
                :icon="btn.icon"
                padding="5px 5px"
              >
                <q-tooltip
                  class="text-body2"
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ btn.label }}
                </q-tooltip>
              </q-btn>
            </template>

            <template #customFilter v-if="activeTab.value === 'deviceType'">
              <q-card-section class="flex items-center" style="gap: 0.8rem">
                <div class="text-subtitle1 text-bold">系統</div>
                <QCascader
                  style="flex: 1 0 0; min-width: 240px"
                  :options="fullTypeOptions"
                  v-model="systemModel"
                  :fullTypeAllData="fullTypeAllData"
                  clearable
                />
              </q-card-section>

              <q-separator />
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
  >
    <template #custom="{ config, dialogAttrs }">
      <!-- masterInputString -->
      <q-input
        :disable="config.disable"
        v-if="config.formType === 'masterInputString' && showMasterRequired"
        v-model="dialogAttrs.tempData[config.name]"
        :label="config.label + (config.required ? ' *' : '')"
        lazy-rules
        :rules="[(val: any) => config.required ? !!val : (typeof val === 'string' || !val )  ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
      >
        <template v-slot:error>
          {{ config.message }}
        </template>
      </q-input>
      <!-- masterInputNumber -->
      <q-input
        :disable="config.disable"
        v-if="config.formType === 'masterInputNumber' && showMasterRequired"
        v-model.number="dialogAttrs.tempData[config.name]"
        :label="config.label + (config.required ? ' *' : '')"
        type="number"
        lazy-rules
        :rules="[(val: any) => config.required ? !!val : (typeof val === 'number' || !val )  ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
      >
        <template v-slot:error>
          {{ config.message }}
        </template>
      </q-input>
      <!-- cameraInputString -->
      <q-input
        :disable="config.disable"
        v-if="config.formType === 'cameraInputString' && showCameraRequired"
        v-model="dialogAttrs.tempData[config.name]"
        :label="config.label + (config.required ? ' *' : '')"
        lazy-rules
        :rules="[(val: any) => config.required ? !!val : (typeof val === 'string' || !val )  ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
      >
        <template v-slot:error>
          {{ config.message }}
        </template>
      </q-input>

      <!-- 系統下拉 - 多層選單 -->
      <QCascader
        v-if="config.formType === 'cascader'"
        :options="dialogAttrs.selectOption"
        :modelValue="dialogAttrs.tempData[config.name]"
        :fullTypeAllData="fullTypeAllData"
        :label="config.label + (config.required ? ' *' : '')"
        @focus="selectListChange(config.name)"
        :rules="[(val: any) => config.required ? (!!val && val.length > 0) : false || config.message ]"
        @update:modelValue="changeCascaderValue"
        clearable
      />
      <!-- 保養頻率 -->
      <div v-else-if="config.formType === 'radioOptions'">
        {{ config.label }}
        <q-option-group
          v-model="dialogAttrs.tempData[config.name]"
          :options="handleRadioOptions(config.name)"
          color="primary"
          inline
          dense
          @update:model-value="
            (value) => handleRadioUpdateValue(value, dialogAttrs.tempData)
          "
        >
          <template v-slot:label="opt">
            <div class="row items-center">
              <q-input
                style="width: 5rem"
                ref="customYearInput"
                v-if="opt.value === MaintainFrequencies.CustomYear"
                type="number"
                dense
                v-model="dialogAttrs.tempData.customYear"
                :placeholder="opt.label"
              />
              <q-input
                ref="customMonthInput"
                style="width: 5rem"
                v-else-if="opt.value === MaintainFrequencies.CustomMonth"
                dense
                type="number"
                v-model="dialogAttrs.tempData.customMonth"
                :placeholder="opt.label"
              />
              <span v-else>{{ opt.label }}</span>
            </div>
          </template>
        </q-option-group>
      </div>
      <!-- 水位計設定 -->
      <!-- @keydown="handleNumberInputKeydown" -->
      <q-input
        v-if="config.formType === 'levelMeter' && showLevelMeterRequired"
        :disable="config.disable"
        v-model.number="dialogAttrs.tempData[config.name]"
        :label="config.label + (config.required ? ' *' : '')"
        type="number"
        lazy-rules
        :rules="[
          (val) =>
            config.required
              ? val !== undefined &&
                val !== null &&
                val !== '' &&
                Number.isInteger(Number(val)) &&
                val >= 0
              : true || config.message || `必須是大於等於 0 的正整數`,
        ]"
      >
        <template v-slot:error>
          {{ config.message || `請輸入 ${config.label}` }}
        </template>
      </q-input>
    </template>
  </DialogForm>

  <DialogUpload
    :dialogAttrs="dialogAttrs"
    :setCoverFunc="DeviceType.apiSetCover"
    :updateBlockData="updateDialogUploadData"
    rootPathName="DeviceType"
    @hide="hideDialog"
    v-on="dialogEvent"
  />

  <DialogExportExcel
    v-model="dialogAttrs.exportExcelVisible"
    :blockData="blockDataForExcel"
    :tableConfig="tableConfigForExcel"
    :fullBlockData="fullBlockDataForExcel"
  />

  <DialogImportExcel
    ref="dialogImportExcelRef"
    v-model="dialogAttrs.importExcelVisible"
    @formatAndSaveFunc="saveImportData"
    :formatImportData="formatImportData"
    :tableConfig="blockAttrs.tableConfig.filter((item) => item.isTable)"
    sampleFile="/excelSample/設備種類.xlsx"
  />
  <!-- dialogTable -->
  <q-dialog v-model="dialogTableVisible" persistent>
    <q-card
      class="flex column"
      :style="
        $q.screen.xs || $q.screen.sm
          ? 'width:100%; height:100%'
          : 'min-width: 90%; height:80%'
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">
          {{ dialogAttrs.dialogTitle }}
          {{ dialogTableTitle ? `- ${dialogTableTitle}` : "" }}
        </div>
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

  <DialogFilePreview
    v-model="previewCoverModel"
    :image-url="imageUrl"
    :iframeUrl="iframeUrl"
    :downloadUrl="downloadUrl"
  />
</template>
<script setup lang="ts">
// api
import Device, { DeviceViewModel, deviceManageConfig } from "src/api/device";
import { DeviceMaintainViewModel } from "src/api/maintainDevice";
import Maintain, {
  MaintainViewModel,
  maintainListTableConfig,
} from "src/api/maintain";
import { deviceAddressConfig } from "src/api/deviceAddress";
import DeviceType, {
  DeviceTypeViewModel,
  deviceTypeConfig,
  MaintainFrequencies,
  maintainFrequencyOptions,
  DeviceInfo,
} from "src/api/deviceType";
import Building from "src/api/building";
import Floors from "src/api/floors";
import AddressPlate from "src/api/addressPlate";
import Committee from "src/api/managementCommittee";
import SupplierData, { supplierDataConfig } from "src/api/supplierData";
import { IncompleteViewModel } from "src/api/routineIncomplete";
// type
import { radioOptionsType } from "src/components/Dialog/DialogForm.vue";
// utils
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type {
  blockAttrsType,
  blockRefType,
  tableConfigItem,
  tempDataType,
} from "src/utils/tableMixin";
import { useCloned } from "@vueuse/core";
import useFilePreview from "src/utils/useFilePreview";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
import { deviceStatus, maintainStatus } from "src/utils/deviceStatus";

// icon
import { matLocationOn } from "@quasar/extras/material-icons";
import { mdiFileAlert, mdiCheckCircle } from "@quasar/extras/mdi-v6";
import { tabPhotoSearch } from "quasar-extras-svg-icons/tabler-icons-v2";

// constant
import { customDesignEquipTypes } from "src/constant/customDesignEquipTypes";

// pinia store
import { useBuildingStore } from "src/stores/building";
import {
  FilterColumn,
  FilterColumnCollection,
  FilterColumnLogical,
} from "src/api/api.type";
import { dataItem } from "src/components/Dialog/DialogImportExcel.vue";

const buildingStore = useBuildingStore();

const $q = inject("$q") as typeof QVueGlobals;
const router = useRouter();

// block
const blockRef = ref<blockRefType>();
const {
  dialogAttrs,
  blockAttrs,
  tableAttrs,
  handleBlockMixin,
  handleDialogMixin,
  handleSelectArray,
  hideDialog,
  getDataMixin,
  getTableMixin,
  updateLatestData,
} = tableMixin(blockRef as Ref<blockRefType>);

// 判斷是否顯示 hostName/port/slaveAddress 欄位

function checkDeviceType(deviceTypeString: string): boolean {
  if (dialogAttrs.value.tempData && dialogAttrs.value.tempData.deviceType) {
    const { fullTypeValues } = dialogAttrs.value.tempData.deviceType;
    const fullTypeString = fullTypeValues.join(",");
    return fullTypeString === deviceTypeString;
  }
  return false;
}

const showMasterRequired = computed(
  () =>
    checkDeviceType(customDesignEquipTypes.PLC) ||
    checkDeviceType(customDesignEquipTypes.Fire_Alarm_Control_Panels)
);
const showCameraRequired = computed(() =>
  checkDeviceType(customDesignEquipTypes.Camera)
);
const showLevelMeterRequired = computed(() =>
  checkDeviceType(customDesignEquipTypes.Liquid_Level_Meter)
);

// tab
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "設備種類",
    value: "deviceType",
  },
  {
    label: "設備清單",
    value: "device",
  },
];

// 維保紀錄 config
const maintainConfig = [
  {
    label: "維保單名稱",
    name: "name",
    field: (row: { maintain: MaintainViewModel }) => row.maintain,
    align: "left",
    formType: "selectString",
    isTable: true,
    linkUrl: "/normal/maintenance?type=&search=name",
    config: maintainListTableConfig,
  },
  {
    label: "協助廠商",
    name: "maintainVendor",
    field: (row: DeviceMaintainViewModel) => row.device?.maintainVendor,
    align: "left",
    formType: "selectString",
    isTable: true,
    linkUrl:
      "/normal/basic?label=廠商資料&value=supplierData&type=supplierData&search=name",
    config: supplierDataConfig,
  },
  {
    label: "處理進度",
    name: "status",
    field: (row: { maintain: MaintainViewModel }) =>
      maintainStatus(row.maintain),
    align: "left",
    formType: "inputString",
    isTable: true,
  },
  {
    label: "缺失內容",
    name: "incomplete",
    field: (row: { incomplete: IncompleteViewModel }) =>
      row.incomplete
        ? `【${row.incomplete?.item}】 ${row.incomplete?.content}`
        : "",
    align: "left",
    formType: "inputString",
    isTable: true,
  },
];
// 客製 button
const customTableButtons = ref([
  {
    label: "設備關聯點位",
    icon: matLocationOn,
    status: "deviceAddress",
    isShow: true,
  },
  {
    label: "維保紀錄",
    icon: mdiFileAlert,
    status: "maintainRecord",
    isShow: true,
  },
]);

// 封面預覽
const { previewCoverModel, imageUrl, iframeUrl, downloadUrl, setFilePreview } =
  useFilePreview();

function handleClickOption(
  btn: {
    label: string;
    icon: string;
    status: string;
  },
  data?: tempDataType
) {
  console.log("handleClickOption", { btn, data });
  if (btn.status === "deviceAddress") tableDataAPI = Device;
  else if (btn.status === "maintainRecord") tableDataAPI = Maintain;

  if (data) {
    handleBlock(btn, data);
  } else {
    handleBlock(btn, dialogAttrs.value.selectArray);
  }
}

const dialogEvent = computed(() => {
  return {
    handleDialog,
    selectListChange,
    updateLatestData,
  };
});

const blockEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getData,
  };
});
const tableEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getTableData,
  };
});
// API類別
let API: typeof Device | typeof DeviceType;
const DeviceId = ref<number>();
// 在 block 上的操作
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType | tempDataType[]
) {
  const { status } = btn;

  if (status !== "deviceAddress" && status !== "maintainRecord") {
    // 設備種類 format
    if (API === DeviceType && data) {
      if (Array.isArray(data)) {
        data.forEach((item) => addCustomForMaintainFrequency(item));
      } else {
        addCustomForMaintainFrequency(data);
        // 清空新增時必須為 Null 的 key
        if (data.currentMaintainId) delete data.currentMaintainId;
        if (data.currentMaintainCompleted) delete data.currentMaintainCompleted;
        if (data.nextMaintainDate) delete data.nextMaintainDate;
      }
    }

    // 設備清單 format
    if (API === Device) {
      if (status === "edit") formatWhenGetDeviceData(data);
      else if (status === "updateMany") {
        data.forEach((item: tempDataType) => formatWhenGetDeviceData(item));
      }
    }
  }

  await handleBlockMixin(btn, data, API, getData);

  if (API === Device && status === "add") {
    dialogAttrs.value.tempData.building = buildingStore.buildingData;
  }

  // 格式化資料給 exportExcel
  if ((API === Device || API === DeviceType) && status === "exportExcel") {
    $q.loading.show({
      message: "資料加載中...",
      spinnerColor: "warning",
      messageColor: "warning",
    });
    const result = (await API.apiGetData({
      filters: "",
      page: 0,
      rowsPerPage: 0,
      tab: activeTab.value.value === "device" ? "Device" : "DeviceType",
    })) as typeof AxiosResponse;

    $q.loading.hide();
    if (result.data.rows) {
      fullBlockDataForExcel.value = formatBlockData(result.data.rows);
    }
  } else if (status === "deviceAddress") {
    dialogTableVisible.value = true;
    dialogTableTitle.value = "設備關聯點位";
    if (!Array.isArray(data)) DeviceId.value = data.id;

    nextTick(() => {
      tableAttrs.value.tableConfig = deviceAddressConfig;
      tableAttrs.value.headerButtons = [];
      tableAttrs.value.tableButtons = [];
    });
  } else if (status === "maintainRecord") {
    dialogTableVisible.value = true;
    dialogTableTitle.value = "維保紀錄";
    if (!Array.isArray(data)) DeviceId.value = data.id;

    nextTick(() => {
      tableAttrs.value.tableConfig = maintainConfig as tableConfigItem[];
      tableAttrs.value.headerButtons = [];
      tableAttrs.value.tableButtons = [];
    });
    tableAttrs.value.blockData = [];
    tableAttrs.value.totalNum = 0;
  } else if (btn.status === "previewCover" && !Array.isArray(data)) {
    if (data && data.frontCoverFileId && data.frontCoverFilePath) {
      setFilePreview(data.frontCoverFilePath, data.frontCoverFileId);
    } else {
      $q.notify({
        type: "warning",
        message: "請先設定封面",
        position: "top",
      });
    }
  }
}
function formatWhenGetDeviceData(data: tempDataType) {
  if (data.master) {
    const { cloned } = useCloned(data.master);
    data.master = null;
    const { hostName, port, slaveAddress } = cloned.value;
    data.hostName = hostName;
    data.port = port;
    data.slaveAddress = slaveAddress;
  }
  if (data.camera) {
    const { cloned } = useCloned(data.camera);
    data.camera = null;
    const { url, userName, password } = cloned.value;
    data.url = url;
    data.userName = userName;
    data.password = password;
  }
  if (data.pool) {
    const { cloned } = useCloned(data.pool);
    data.pool = null;
    const { area, high, legal, invalid, total, zero } = cloned.value;
    if (area) data.area = area;
    if (high) data.high = high;
    if (legal) data.legal = legal;
    if (invalid) data.invalid = invalid;
    if (total) data.total = total;
    if (zero) data.zero = zero;
  }
}
// 把 maintainCustom 附值進 customYear/customMonth
function addCustomForMaintainFrequency(data: tempDataType) {
  const { maintainCustom, maintainFrequency } = data;
  if (maintainFrequency && maintainCustom) {
    if (maintainFrequency === MaintainFrequencies.CustomYear) {
      data.customYear = maintainCustom;
      data.customMonth = undefined;
    } else if (maintainFrequency === MaintainFrequencies.CustomMonth) {
      data.customMonth = maintainCustom;
      data.customYear = undefined;
    }
  } else {
    data.customMonth = undefined;
    data.customYear = undefined;
  }
}

// Dialog 相關方法
// 在新增/編輯 dialog 上的操作
function handleDialog(
  status: string,
  data:
    | DeviceTypeViewModel
    | DeviceTypeViewModel[]
    | DeviceViewModel
    | DeviceViewModel[]
) {
  if (API === DeviceType) {
    if (status === "add") {
      // 新增時這三個 key 的值必須為空
      delete (data as DeviceTypeViewModel).currentMaintainId;
      delete (data as DeviceTypeViewModel).currentMaintainCompleted;
      delete (data as DeviceTypeViewModel).nextMaintainDate;
    }

    if (status === "add" || status === "edit") {
      if (!checkCustomValueAndNotify(data)) return;
      formatDataForCustom(data);
    } else if (status === "updateMany") {
      for (const item of data as DeviceTypeViewModel[]) {
        if (!checkCustomValueAndNotify(data)) return;
        formatDataForCustom(item);
      }
    }
  } else if (API === Device) {
    delete (data as DeviceViewModel).lastMaintain;
    if ((status === "add" || status === "edit") && !Array.isArray(data)) {
      formatDataForDevice(data);
    } else if (status === "updateMany") {
      for (const item of data as DeviceViewModel[]) {
        formatDataForDevice(item);
      }
    }
  }
  handleDialogMixin(status, API, getData, data);
}
// 把 customYear/customMonth 附值回 maintainCustom
function formatDataForCustom(data: tempDataType) {
  if (
    data.customYear &&
    data.maintainFrequency === MaintainFrequencies.CustomYear
  ) {
    data.maintainCustom = data.customYear;
  } else if (
    data.customMonth &&
    data.maintainFrequency === MaintainFrequencies.CustomMonth
  ) {
    data.maintainCustom = data.customMonth;
  }
}
// 判斷是否需要填寫 customYear/customMonth
function checkCustomValueAndNotify(data: tempDataType) {
  const { maintainFrequency, maintainCustom } = data;
  const isCorrectValue =
    (maintainFrequency === MaintainFrequencies.CustomYear ||
      maintainFrequency === MaintainFrequencies.CustomMonth) &&
    !maintainCustom;

  if (isCorrectValue) {
    $q.notify({
      type: "warning",
      message: "保養頻率不正確，請正確地填寫自訂數值",
      position: "top",
    });
    return false;
  }
  return true;
}
function formatDataForDevice(data: tempDataType) {
  // Camera
  if (data.url) {
    data.camera = {
      url: data.url,
      userName: data.userName ?? "",
      password: data.password ?? "",
    };
  }
  // Master
  if (data.hostName) {
    data.master = {
      hostName: data.hostName,
      port: data.port ?? "",
      slaveAddress: data.slaveAddress ?? "",
    };
  }
  // Liquid Level Meter
  if (
    data.deviceType.fullTypeValues.join(",") ===
    customDesignEquipTypes.Liquid_Level_Meter
  ) {
    data.pool = {};
    const { area, high, legal, invalid, total, zero } = data;
    if (area) data.pool.area = area;
    if (high) data.pool.high = high;
    if (legal) data.pool.legal = legal;
    if (invalid) data.pool.invalid = invalid;
    if (total) data.pool.total = total;
    if (zero) data.pool.zero = zero;
  }
}

// maintainFrequency 轉成中文
function maintainFrequencyToCh(data: string) {
  let label = "";
  const maintainFrequencyRadio = handleRadioOptions("maintainFrequency");
  maintainFrequencyRadio?.forEach((item) => {
    if (item.value === data) {
      label = item.label;
    }
  });
  return label;
}
// 取得分頁資料
async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  const copyPagination = { ...pagination };

  // 產出 filters 物件 (filtersObject)
  const searchText = "filters" in copyPagination ? copyPagination.filters : "";
  console.log("searchText", searchText);
  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    activeTab.value.value === "device" ? deviceFilters : deviceTypeFilters,
    searchText,
    activeTab.value.value === "device" ? "Device" : "DeviceType"
  );
  if (activeTab.value.value === "deviceType" && systemTrueValue.value) {
    filtersObject.push({
      logical: FilterColumnLogical.And,
      columns: [
        {
          logical: FilterColumnLogical.And,
          columnKey: { fieldName: "FullType", typeName: "DeviceType" },
          value: systemTrueValue.value,
        },
      ],
    });
  }
  // 產出 JSON => 放進 payload
  const jsonFilters = JSON.stringify(filtersObject);
  const payload = { ...copyPagination, filters: jsonFilters };

  await getDataMixin(API, payload);

  if (activeTab.value.value === "deviceType") {
    blockAttrs.value.blockData.forEach((item: tempDataType) => {
      if (Array.isArray(item.fullTypeValues)) {
        // 把fullType資料轉成中文
        const fullTypeString = item.fullTypeValues.join(",");
        item.fullTypeCh = fullTypeAllData[fullTypeString].value;
      }
    });
    setDataForDataConfig(blockAttrs.value.blockData);
  } else if (activeTab.value.value === "device") {
    blockAttrs.value.blockData.forEach((item: tempDataType) => {
      // 把fullType資料轉成中文
      if (Array.isArray(item.deviceType.fullTypeValues)) {
        const fullTypeString = item.deviceType.fullTypeValues.join(",");
        item.deviceType.fullTypeCh = fullTypeAllData[fullTypeString].value;
      }
      // 把maintainFrequency資料轉成中文
      item.deviceType.maintainFrequencyCh = maintainFrequencyToCh(
        item.deviceType.maintainFrequency
      );
    });
    setDataForDataConfig(blockAttrs.value.blockData);
  }

  setBlockLoading(blockRef);
}

// 更新 dialogUpload 資料
async function updateDialogUploadData() {
  await getData();
  const newData = blockAttrs.value.blockData.find(
    (data) => data.id === dialogAttrs.value.tempData.id
  );
  if (newData) dialogAttrs.value.tempData = newData;
}

// 如果有 跳轉Url 的話，跳到正確的 tab
router.afterEach(async (to) => {
  if (to.query.type && to.query.search) {
    const result = blockTabs.find((item) => item.value === to.query.type);
    await tabChange(result);
    await getData({
      filters: String(to.query.search),
      page: 1,
      rowsPerPage: 0,
    });
  }
});
interface fullTypeAllDataType {
  [key: string]: { value: string; drivers: string };
}

let fullTypeAllData: fullTypeAllDataType = {};
async function init() {
  const result = (await DeviceType.apiGetDeviceInfos()) as typeof AxiosResponse;
  dialogAttrs.value.selectOption = result.data;
  fullTypeAllData = convertKeyValueObject(result.data);
  fullTypeValuesObject.value = reverseKeyValue(fullTypeAllData);
  tabChange(blockTabs[1]);
}
onMounted(init);

function tabChange(tab: { label: string; value: string } = blockTabs[1]) {
  console.log("tabChange", tab);
  if (router.currentRoute.value.query.type) {
    router.push(router.currentRoute.value.path);
  } else {
    dialogAttrs.value.visible = false;
  }
  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
  blockAttrs.value.blockTitle = tab.value;
  dialogAttrs.value.dialogTitle = tab.label;

  if (activeTab.value.value === "device") {
    API = Device;
    nextTick(() => {
      blockAttrs.value.tableConfig = deviceManageConfig;
      blockAttrs.value.headerButtons = [
        "updateMany",
        "add",
        "deleteMany",
        "exportExcel",
      ];
      blockAttrs.value.tableButtons = ["edit", "delete"];
      customTableButtons.value = [
        {
          label: "設備關聯點位",
          icon: matLocationOn,
          status: "deviceAddress",
          isShow: true,
        },
        {
          label: "維保紀錄",
          icon: mdiFileAlert,
          status: "maintainRecord",
          isShow: true,
        },
      ];
    });
  } else if (activeTab.value.value === "deviceType") {
    API = DeviceType;
    nextTick(() => {
      blockAttrs.value.tableConfig = deviceTypeConfig;
      blockAttrs.value.headerButtons = [
        "updateMany",
        "add",
        "deleteMany",
        "exportExcel",
        "importExcel",
      ];
      customTableButtons.value = [
        {
          label: "封面預覽",
          icon: tabPhotoSearch,
          status: "previewCover",
          isShow: true,
        },
      ];
    });
  }
}

// radio
const customYearInput = ref();
const customMonthInput = ref();

function handleRadioUpdateValue(
  value: MaintainFrequencies,
  tempData: tempDataType
) {
  if (value === MaintainFrequencies.CustomYear) {
    tempData.customMonth = undefined;
    customYearInput.value.focus();
  } else if (value === MaintainFrequencies.CustomMonth) {
    tempData.customYear = undefined;
    customMonthInput.value.focus();
  } else if (value === null) {
    tempData.customYear = undefined;
    tempData.customMonth = undefined;
  }
}

function handleRadioOptions(configName: string) {
  let result: radioOptionsType[] = [];
  if (configName === "maintainFrequency") {
    result = maintainFrequencyOptions;
  }
  return result;
}

const fullTypeOptions = ref<DeviceInfo[]>([]);
onMounted(async () => {
  const result = await DeviceType.apiGetDeviceInfos();
  fullTypeOptions.value = result.data;
  console.log("now fullTypeOptions", fullTypeOptions.value);
});
async function selectListChange(props: string, tempData?: tempDataType) {
  console.log("selectListChange", props);
  if (props === "fullTypeValues") {
    const result = await DeviceType.apiGetDeviceInfos();
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "keeperUnit") {
    const result = await Committee.apiGetCommunities();
    console.log("now result", result);
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "maintainVendor") {
    const result = await SupplierData.apiGetProviders();
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "deviceType") {
    const result = await DeviceType.apiGetDevicetypes();
    result.data.forEach((item) => {
      item.name = item.brand ? `${item.brand} - ${item.name}` : `${item.name}`;
    });
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "building") {
    const result = (await Building.apiGetAllBuilding()) as typeof AxiosResponse;
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "floor" || props === "floors") {
    if (tempData?.building) {
      const result = (await Floors.apiGetBuildingFloor(
        tempData?.building.id
      )) as typeof AxiosResponse;
      dialogAttrs.value.selectOption = result.data;
    } else {
      $q.notify({
        type: "warning",
        message: "請先選擇大樓，再選擇樓層",
        position: "top",
      });
      dialogAttrs.value.selectOption = [];
    }
  } else if (props === "addressPlate") {
    if (tempData?.floor) {
      const result = (await AddressPlate.apiGetAddressPlate(
        tempData?.floor.id
      )) as typeof AxiosResponse;

      console.log("nowwww", result.data);

      dialogAttrs.value.selectOption = result.data;
    } else {
      $q.notify({
        type: "warning",
        message: "請先選擇樓層，再選擇地址",
        position: "top",
      });
      dialogAttrs.value.selectOption = [];
    }
  }
}
function changeCascaderValue(
  valueList: string[],
  modelLabel: {
    label: string;
  }[],
  drivers?: string
) {
  dialogAttrs.value.tempData.fullTypeValues = valueList;
  dialogAttrs.value.tempData.name = modelLabel[modelLabel.length - 1].label;
  dialogAttrs.value.tempData.driver = Array.isArray(drivers)
    ? drivers[0]
    : drivers;
}

// Excel
const tableConfigForExcel = ref<blockAttrsType["tableConfig"]>([]);
const blockDataForExcel = ref<blockAttrsType["blockData"]>([]);
const fullBlockDataForExcel = ref<blockAttrsType["blockData"]>([]);

async function setDataForDataConfig(blockData: blockAttrsType["blockData"]) {
  const newBlockData = useCloned(blockData).cloned.value;

  if (activeTab.value.value === "device") {
    tableConfigForExcel.value = deviceManageConfig;
  } else if (activeTab.value.value === "deviceType") {
    tableConfigForExcel.value = deviceTypeConfig;
  }
  blockDataForExcel.value = formatBlockData(newBlockData);
  console.log("blockDataForExcel", blockDataForExcel.value);
  tableConfigForExcel.value.forEach((item) => {
    const { label, name } = item;
    rowsChKeyToEngNameObject[label] = name;
  });
  console.log("tableConfigForExcel", tableConfigForExcel.value);
}
function formatBlockData(blockData: blockAttrsType["blockData"]) {
  if (activeTab.value.value === "device") {
    return blockData.map((item) => {
      item.status = deviceStatus(item.status);
      return item;
    });
  } else if (activeTab.value.value === "deviceType") {
    return blockData.map((item) => {
      if (item.fullTypeValues) {
        item.fullTypeValues =
          fullTypeAllData[item.fullTypeValues.join(",")].value;
      }
      item.maintainFrequency = maintainFrequencyToCh(item.maintainFrequency);
      return item;
    });
  }
  return [];
}

// Excel 匯入 => 多筆新增
const dialogImportExcelRef = ref();
// Formatter
interface reversedObj {
  [key: string]: {
    value: string[];
    drivers: string;
  };
}
const rowsChKeyToEngNameObject = reactive<{ [key: string]: string }>({});
const fullTypeValuesObject = ref<reversedObj>({});

function formatImportData(data: dataItem[]) {
  let clonedData = useCloned(data).cloned.value;
  clonedData = clonedData
    .map((item) => {
      for (const key in item) {
        const newKey = rowsChKeyToEngNameObject[key];

        if (newKey) {
          if (newKey === "fullTypeValues") {
            if (item[key]) {
              item[newKey as keyof typeof item] = JSON.parse(item[key]);
            }
          } else {
            item[newKey as keyof typeof item] = item[key];
          }
        }
        delete item[key];
      }
      const fullTypeString = item.fullTypeValues?.join(",");
      if (fullTypeString) {
        item.fullTypeCh = fullTypeAllData[fullTypeString].value;
      }

      return item;
    })
    .filter((item) => item.fullTypeValues);

  return clonedData;
}
async function saveImportData(formattedTableData: dataItem[]) {
  await handleDialogMixin("add", API, getData, formattedTableData);
  dialogImportExcelRef.value.hide();
}

// dialogTable
const dialogTableVisible = ref(false);
const dialogTableTitle = ref("");
let tableDataAPI: typeof Device | typeof Maintain;
async function getTableData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  pagination.deviceId = DeviceId.value;
  await getTableMixin(tableDataAPI, pagination);
  if (dialogAttrs.value.status === "maintainRecord") {
    tableAttrs.value.blockData.forEach(async (item) => {
      const result = (await Maintain.apiGetMaintainById(
        item.maintainId
      )) as typeof AxiosResponse;
      item.maintain = result.data;
    });
  }
}

// 讀出所有 fullType 的中文
interface itemType {
  value: string;
  label: string;
  drivers: string;
  children?: itemType[];
}
function convertKeyValueObject(data: itemType[]) {
  const obj = {};
  data.forEach((item) => addKeyValueToObject(item, obj));
  return obj;
}
function addKeyValueToObject(
  data: itemType,
  obj: fullTypeAllDataType,
  depth = 0,
  parentObj?: [string, string, string]
) {
  const { value, label, children, drivers } = data;
  let nowObj: [string, string, string] | undefined;
  if (depth > 3) {
    return;
  } else if (depth === 0) {
    obj[value] = { value: label, drivers };
    nowObj = [value, label, drivers];
  }
  let combineKey;
  let combineValue;
  if (parentObj) {
    combineKey = `${parentObj[0]},${value}`;
    combineValue = `${parentObj[1]} / ${label}`;
    obj[combineKey] = { value: combineValue, drivers: parentObj[2] };
    if (drivers) obj[combineKey].drivers = drivers;
    nowObj = [combineKey, combineValue, obj[combineKey].drivers];
  }

  if (children && children.length && nowObj) {
    depth++;
    children.forEach((item) => addKeyValueToObject(item, obj, depth, nowObj));
  }
}
// 轉出 excel 匯入所需要的 format 物件
function reverseKeyValue(data: fullTypeAllDataType) {
  return Object.entries(data).reduce<reversedObj>(
    (reversedObj, [key, value]) => {
      reversedObj[value.value] = {
        value: key.split(","),
        drivers: value.drivers,
      };
      return reversedObj;
    },
    {}
  );
}

// 進階搜尋
const { filters: deviceFilters } = searchFiltersGenerator(deviceManageConfig);
const { filters: deviceTypeFilters } = searchFiltersGenerator(deviceTypeConfig);
const filters = computed(() => {
  if (activeTab.value.value === "device") return deviceFilters;
  else if (activeTab.value.value === "deviceType") return deviceTypeFilters;
});
const systemModel = ref();
const systemTrueValue = computed(() => {
  if (!systemModel.value) return "";
  return systemModel.value[systemModel.value.length - 1];
});
</script>
