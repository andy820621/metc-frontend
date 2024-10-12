<template>
  <q-page
    class="q-pa-md grid"
    :style="$q.screen.xs || $q.screen.sm ? 'grid-template-rows:  60px 1fr' : ''"
  >
    <h3
      v-if="$q.screen.xs || $q.screen.sm"
      class="text-left text-bold"
      style="font-size: 1.55rem; margin: 0"
    >
      設備點位
    </h3>
    <q-card class="q-pa-md">
      <BlockComponent
        ref="blockRef"
        :blockAttrs="blockAttrs"
        v-on="blockEvent"
        tabHeight="0px"
        v-model:filters="filters"
      >
        <template #customFilter>
          <q-card-section class="filter">
            <div class="title">點位</div>
            <div
              class="flex flex-nowrap justify-between items-center"
              style="gap: 0.8rem"
            >
              <template
                v-for="(item, index) in deviceAddress"
                :key="item.value"
              >
                <template v-if="item.value === 'system'">
                  <q-input
                    style="width: 81px"
                    v-model="deviceAddressInput[item.value as keyof typeof deviceAddressInput]"
                    :label="item.label"
                  />
                </template>
                <template v-else>
                  <q-input
                    style="width: 81px"
                    type="number"
                    v-model.number="deviceAddressInput[item.value as keyof typeof deviceAddressInput]"
                    :label="item.label"
                  />
                </template>
                <div class="text-h5" v-if="index !== deviceAddress.length - 1">
                  -
                </div>
              </template>
            </div>
          </q-card-section>

          <q-separator />
        </template>
      </BlockComponent>
    </q-card>
  </q-page>

  <DialogForm
    :dialogAttrs="dialogAttrs"
    :blockAttrs="blockAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
    <template #custom="{ config, dialogAttrs }">
      <div v-if="config.formType === 'deviceAddress'">
        {{ config.label }}
        <div class="flex justify-between">
          <div
            v-for="(item, index) in deviceAddress"
            :key="item.value"
            class="flex flex-center no-wrap"
            style="width: 30%"
          >
            <q-input
              :type="
                item.value === 'address' || item.value === 'number'
                  ? 'number'
                  : 'text'
              "
              :disable="config.disable"
              v-model="dialogAttrs.tempData[item.value]"
              :label="item.label + (config.required ? ' *' : '')"
              lazy-rules
              :rules="[(val: any) => config.required ? !!val : (typeof val === 'string' || typeof val === 'number' || !val )  ? true :false || config.message?config.message:`請輸入 ${config.label}`]"
            />
            <div
              style="font-size: 24px"
              class="q-ml-lg"
              v-if="index !== deviceAddress.length - 1"
            >
              -
            </div>
          </div>
        </div>
      </div>

      <q-select
        v-if="config.formType === 'selectSvgIcon'"
        v-model="dialogAttrs.tempData[config.name]"
        clearable
        :options="dialogAttrs.selectOption"
        :label="config.label + (config.required ? ' *' : '')"
        :rules="[(val: any) => config.required ? !!val : typeof val === 'object'? true :false || config.message?config.message:`請輸入 ${config.label}`]"
        @focus="selectListChange(config.name)"
      >
        <template v-slot:selected-item="scope">
          <SvgIcon
            dense
            color="text-dark"
            :svgName="scope.opt.iconId"
            font-size="20px"
            class="svgIcon"
          />
          <span class="q-ml-sm">{{ scope.opt.value || scope.opt.name }}</span>
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <SvgIcon
                dense
                color="text-dark"
                :svgName="scope.opt.iconId"
                font-size="20px"
                class="svgIcon"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{
                scope.opt.label || scope.opt.name
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> 尚無資料 </q-item-section>
          </q-item>
        </template>
      </q-select>

      <div
        v-if="
          hasAlertSettingsType(
            dialogAttrs.tempData as DeviceAddressViewModel
          ) && config.formType === 'alertSettings'
          && dialogAttrs.tempData.alertSettings
        "
      >
        <span style="font-size: 1rem">{{ config.label }}</span>
        <div class="text-subtitle2" style="color: rgb(99, 99, 99)">
          (設定後該狀況下為錯誤情形，因此系統會有相應的警示跳出)
        </div>
        <div
          class="grid"
          v-for="([key, value]) in Object.entries(dialogAttrs.tempData.alertSettings as AlertSettings)"
          :key="key"
        >
          <div class="flex no-wrap items-center" style="gap: 2rem">
            <q-checkbox v-model="value.selected">
              <span style="font-size: 1rem">{{ key }}</span>
            </q-checkbox>

            <template v-if="value.selected">
              <q-toggle
                v-if="
                  hasAlertSettingsType(
                    dialogAttrs.tempData as DeviceAddressViewModel
                  ) === valueTypes.boolean
                "
                v-model="value.boolValue"
                left-label
                label="關 / 開"
              />
              <div
                class="flex no-wrap items-center"
                style="gap: 0.8rem"
                v-else-if="
                  hasAlertSettingsType(
                    dialogAttrs.tempData as DeviceAddressViewModel
                  ) === valueTypes.number
                "
              >
                <q-toggle
                  :checked-icon="mdiGreaterThanOrEqual"
                  :unchecked-icon="mdiLessThan"
                  v-model="value.numberThen"
                />
                <q-input
                  class="full-width"
                  v-model.number="value.numberValue"
                  type="number"
                  label="數值"
                />
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>
  </DialogForm>
</template>
<script setup lang="ts">
// api
import DeviceAddress, {
  Channels,
  DeviceChannelViewModel,
  DeviceAddressViewModel,
} from "src/api/deviceAddress";
import Device from "src/api/device";
import Floors from "src/api/floors";
import AddressPlate from "src/api/addressPlate";

// utils
import { useCloned } from "@vueuse/core";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type {
  blockRefType,
  tableConfigItem,
  tempDataType,
} from "src/utils/tableMixin";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";

// icon
import { mdiGreaterThanOrEqual, mdiLessThan } from "@quasar/extras/mdi-v7";

// pinia store
import { useUserStore } from "src/stores/user";
import { useBuildingStore } from "src/stores/building.js";
import { storeToRefs } from "pinia";
import {
  FilterColumn,
  FilterColumnCollection,
  FilterColumnLogical,
  FilterTypes,
} from "src/api/api.type";
const buildingStore = useBuildingStore();
const userStore = useUserStore();
const { isMercury, isSystem } = storeToRefs(userStore);
const { Bid } = storeToRefs(buildingStore);

const $q = inject("$q") as typeof QVueGlobals;

// block
const blockRef = ref<blockRefType>();
const {
  dialogAttrs,
  blockAttrs,
  handleBlockMixin,
  handleDialogMixin,
  handleSelectArray,
  hideDialog,
  getDataMixin,
} = tableMixin(blockRef as Ref<blockRefType>);

const dialogEvent = computed(() => {
  return {
    handleDialog,
    selectListChange,
  };
});
const blockEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getData,
  };
});
const tableConfig = [
  {
    label: "來源",
    name: "master",
    field: "master",
    align: "left",
    formType: "selectString",
    message: "請選擇 Master",
    isTable: true,
    isDialogForm: true,
    required: false,
    showHint: (tempData: tempDataType) =>
      `來源 id : ${tempData?.master?.id ?? "尚未選擇"}`,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "來源", val: "DeviceMasterName" },
  },
  {
    label: "設備",
    name: "device",
    field: "device",
    align: "left",
    formType: "selectSvgIcon",
    message: "請選擇 設備",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "設備", val: "DeviceName", isDefault: true },
  },
  // 純做顯示用
  {
    label: "點位",
    name: "addressStr",
    field: "addressStr",
    align: "left",
    formType: "deviceAddress",
    message: "請輸入 點位",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
  {
    label: "FunctionCode",
    name: "functionCode",
    field: "functionCode",
    align: "left",
    formType: "selectString",
    message: "請輸入 FunctionCode",
    isTable: false,
    isDialogForm: true,
    required: false,
    optionLabel: "label",
  },
  {
    label: "Points",
    name: "points",
    field: "points",
    align: "center",
    formType: "inputNumber",
    message: "請輸入 Points",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "空間描述",
    name: "area",
    field: "area",
    align: "left",
    formType: "inputString",
    message: "請輸入 空間描述",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: {
      label: "空間描述",
      val: "Area",
    },
  },
  {
    label: "點位狀態類型",
    name: "statusType",
    field: "statusType",
    align: "left",
    formType: "selectString",
    message: "請輸入 點位狀態類型",
    isTable: false,
    isDialogForm: true,
    required: false,
    optionLabel: "label",
  },
  {
    label: "點位狀態",
    name: "statusValue",
    field: "statusValue",
    align: "left",
    formType: "selectString",
    message: "請輸入 點位狀態",
    isTable: false,
    isDialogForm: true,
    required: false,
    optionLabel: "label",
  },
  {
    label: "平時/災時警示設定",
    name: "alertSettings",
    field: "alertSettings",
    align: "left",
    formType: "alertSettings",
    message: "請輸入 平時 / 災時設定",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
];
// 點位
const deviceAddress = [
  {
    label: "系統",
    value: "system",
  },
  {
    label: "位址",
    value: "address",
  },
  {
    label: "編號",
    value: "number",
  },
];

interface AlertSettings {
  [key: string]: DeviceChannelViewModel & { selected: boolean };
}
const AlertSettingsKey = {
  normarl: "平時" as const,
  disaster: "災時" as const,
};
// ! 判斷平時/災時警告欄位的類型 (前後端都寫死，未來隨 PLC 增加會再增加)
const valueTypes = {
  boolean: "boolean",
  number: "number",
};
const driverTypeToValueType: {
  [key: string]:
    | (typeof valueTypes)[keyof typeof valueTypes]
    | {
        [key: string | number]: (typeof valueTypes)[keyof typeof valueTypes];
      };
} = {
  nohmi02: valueTypes.boolean,
  nohmi03: valueTypes.number,
  fatek03: {
    100: valueTypes.boolean,
    400: valueTypes.number,
  },
  amsamotion02: valueTypes.boolean,
  mitsubishi: {
    Y: valueTypes.boolean, // 設備狀態
    D: valueTypes.number, // 水位計
  },
};
// 判斷是否顯示平時/災時警告欄位，有的話回傳設定類型，沒有回傳 false
// TODO: 有空時看能不能改用 computed 去處理這個問題 (效能優化)
function hasAlertSettingsType(data: DeviceAddressViewModel) {
  const { functionCode, master, address, system } = data;
  if (!functionCode) return false;
  const driver = master?.deviceType.driver;
  if (!driver) return false;
  const functionCodeStr =
    typeof functionCode === "number"
      ? functionCode.toString()
      : functionCode.value.toString();
  const functionCodeStrLenth = functionCodeStr.length;
  const toBeCombined =
    functionCodeStrLenth === 1 ? "0" + functionCodeStr : functionCodeStr;
  let driverType = driver + toBeCombined;
  if (driverType.includes("mitsubishi")) driverType = "mitsubishi"; // 展場硬寫:mitsubishi01、03合併成 mitsubishi
  // 透過 driverType 判斷是否顯示平時/災時警告欄位
  if (!(driverType in driverTypeToValueType)) return false;
  let valueType = driverTypeToValueType[driverType];

  if (typeof valueType !== "string") {
    if (address) valueType = valueType[address.toString()];
    else if (driverType === "mitsubishi" && system === "D") {
      // 實際為mitsubishi03的訊號
      valueType = "number";
    } else {
      valueType = "boolean";
    }
  }

  return valueType;
}

// API類別
const API = DeviceAddress;

// 在 block 上的操作
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType | tempDataType[]
) {
  await handleBlockMixin(btn, data, API, getData);

  if (btn.status === "add") {
    setDefaultAlertSettings(dialogAttrs.value.tempData);
  } else if (btn.status === "edit" || btn.status === "updateMany") {
    const items =
      btn.status === "edit"
        ? [dialogAttrs.value.tempData]
        : dialogAttrs.value.selectArray;
    items.forEach((item) => updateAlertSettings(item));
  }
}
// 開啟表單時整理 data
function setDefaultAlertSettings(data: tempDataType) {
  data.alertSettings = {
    [AlertSettingsKey.normarl]: {
      deviceAddressId: 0,
      selected: false,
      channel: Channels.Management,
      boolValue: false,
      numberThen: false,
      numberValue: 0,
    },
    [AlertSettingsKey.disaster]: {
      deviceAddressId: 0,
      selected: false,
      channel: Channels.Emergency,
      boolValue: false,
      numberThen: false,
      numberValue: 0,
    },
  };
}
function updateAlertSettings(data: tempDataType) {
  console.log("updateAlertSettings", data);

  const showAlertSettings = hasAlertSettingsType(
    data as DeviceAddressViewModel
  );
  if (!showAlertSettings) {
    data.alertSettings = null;
    return;
  }

  const isBoolType = showAlertSettings === valueTypes.boolean;
  data.alertSettings = {
    [AlertSettingsKey.normarl]: getChannelSettings(
      data,
      Channels.Management,
      isBoolType
    ),
    [AlertSettingsKey.disaster]: getChannelSettings(
      data,
      Channels.Emergency,
      isBoolType
    ),
  };
}
function getChannelSettings(
  data: tempDataType,
  channelType: Channels,
  isBoolType: boolean
) {
  const { id, deviceChannels } = data;
  const channelObject = (deviceChannels as DeviceChannelViewModel[]).find(
    (item) => item.channel === channelType
  );
  return isBoolType
    ? {
        deviceAddressId: id,
        selected: !!channelObject || false,
        channel: channelType,
        boolValue: channelObject?.boolValue || false,
      }
    : {
        deviceAddressId: id,
        selected: !!channelObject || false,
        channel: channelType,
        numberThen: channelObject?.numberThen || false,
        numberValue: channelObject?.numberValue || 0,
      };
}

// 在新增/編輯 dialog 上的操作
async function handleDialog(status: string, data: any) {
  const { cloned } = useCloned(data);
  const tempData = cloned.value;

  function processItem(item: tempDataType) {
    ["functionCode", "statusType", "statusValue"].forEach((key) => {
      if (item[key]) item[key] = item[key].value;
    });
    if (!item.functionCode) delete item.functionCode;

    ["system", "number", "address"].forEach((key) => {
      if (!item[key]) item[key] = null;
    });

    const settingsType = hasAlertSettingsType(item as DeviceAddressViewModel);
    if (settingsType) {
      const isBoolType = settingsType === valueTypes.boolean;
      item.deviceChannels = createDeviceChannels(item, isBoolType) || undefined;
    }
    delete item.alertSettings;
  }

  if (Array.isArray(tempData)) {
    tempData.forEach(processItem);
  } else {
    processItem(tempData);
  }

  console.log("tempData", tempData);
  if (Array.isArray(tempData)) {
    tempData.forEach((item) => {
      if (item.device) item.device.keeperUnit = null;
      if (item.master) item.master.keeperUnit = null;
    });
  } else {
    tempData.device.keeperUnit = null;
    tempData.master.keeperUnit = null;
  }

  await handleDialogMixin(status, API, getData, tempData);
}

function createDeviceChannels(item: tempDataType, isBoolType: boolean) {
  const { functionCode, alertSettings } = item;
  // if (!functionCode || !alertSettings) return null;

  // const isBoolType = isBooleanType.includes(functionCode);

  function createChannelObject(key: string) {
    const setting = alertSettings[key];
    if (!setting?.selected) return null;

    const { deviceAddressId, channel, boolValue, numberThen, numberValue } =
      setting;
    return {
      deviceAddressId,
      channel,
      ...(isBoolType ? { boolValue } : { numberThen, numberValue }),
    };
  }

  const result = [];
  const normalItem = createChannelObject(AlertSettingsKey.normarl);
  const disasterItem = createChannelObject(AlertSettingsKey.disaster);
  if (normalItem) result.push(normalItem);
  if (disasterItem) result.push(disasterItem);

  return result.length ? result : null;
}

enum statusType {
  "監視",
  "控制",
  "電源監視",
  "電源控制",
}
enum statusValue {
  "正常",
  "動作",
  "停止",
  "火災",
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
  const searchText = copyPagination.filters;
  console.log("searchText", searchText);
  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    filters,
    searchText,
    "DeviceAddress"
  );
  // 產出點位物件並加進 filtersObject
  const deviceAddressColumnArray =
    generateFilterColumnForDeviceAddress(deviceAddressInput);
  if (deviceAddressColumnArray) filtersObject.push(deviceAddressColumnArray);
  // 產出 JSON => 放進 payload
  const jsonFilters = JSON.stringify(filtersObject);
  const payload = { ...copyPagination, filters: jsonFilters };

  await getDataMixin(API, payload);
  if (pagination) {
    blockAttrs.value.blockData.forEach((item: tempDataType) => {
      if (item.system || item.address || item.number) {
        item.addressStr = `${item.system || ""}${
          item.address ? "-" + item.address : ""
        }${item.number ? "-" + item.number : ""}`;
      } else {
        item.addressStr = "";
      }
      if (item.functionCode !== null) {
        item.functionCode = {
          label: String(item.functionCode),
          value: item.functionCode,
        };
      }
      if (item.statusType !== null) {
        item.statusType = {
          label: statusType[item.statusType],
          value: item.statusType,
        };
      }
      if (item.statusValue !== null) {
        item.statusValue = {
          label: statusValue[item.statusValue],
          value: item.statusValue,
        };
      }
    });
  }

  setBlockLoading(blockRef);
}

function init() {
  dialogAttrs.value.dialogTitle = "設備點位";
  blockAttrs.value.tableConfig = tableConfig as tableConfigItem[];
  if (isMercury.value || isSystem.value) {
    blockAttrs.value.headerButtons = ["add", "updateMany", "deleteMany"];
    blockAttrs.value.tableButtons = ["edit", "delete"];
  } else {
    blockAttrs.value.headerButtons = [];
    blockAttrs.value.tableButtons = [];
  }
}
onMounted(() => {
  init();
});

// 每次點取變換下拉選單內容
async function selectListChange(props: string, tempData?: tempDataType) {
  console.log("selectListChange", props);
  if (props === "device") {
    const result = (await Device.apiGetDevice()) as typeof AxiosResponse;
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "master") {
    const result = (await Device.apiGetDeviceMaster()) as typeof AxiosResponse;
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "floor") {
    if (Bid.value) {
      const result = (await Floors.apiGetBuildingFloor(
        Bid.value
      )) as typeof AxiosResponse;
      dialogAttrs.value.selectOption = result.data;
    }
  } else if (props === "addressPlate") {
    if (tempData?.floor) {
      const result = (await AddressPlate.apiGetAddressPlate(
        tempData.floor.id
      )) as typeof AxiosResponse;

      dialogAttrs.value.selectOption = result.data;
    } else {
      $q.notify({
        type: "warning",
        message: "請先選擇樓層，再選擇地址",
        position: "top",
      });
      dialogAttrs.value.selectOption = [];
    }
  } else if (props === "functionCode") {
    dialogAttrs.value.selectOption = [
      {
        label: "1",
        value: 1,
      },
      {
        label: "2",
        value: 2,
      },
      {
        label: "3",
        value: 3,
      },
      {
        label: "4",
        value: 4,
      },
      {
        label: "5",
        value: 5,
      },
      {
        label: "6",
        value: 6,
      },
      {
        label: "15",
        value: 15,
      },
      {
        label: "16",
        value: 16,
      },
      {
        label: "23",
        value: 23,
      },
    ];
  } else if (props === "statusType") {
    dialogAttrs.value.selectOption = [
      {
        label: statusType[0],
        value: 0,
      },
      {
        label: statusType[1],
        value: 1,
      },
      {
        label: statusType[2],
        value: 2,
      },
      {
        label: statusType[3],
        value: 3,
      },
    ];
  } else if (props === "statusValue") {
    dialogAttrs.value.selectOption = [
      {
        label: "正常",
        value: 0,
      },
      {
        label: "動作",
        value: 1,
      },
      {
        label: "停止",
        value: 2,
      },
      {
        label: "火災",
        value: 3,
      },
    ];
  }
}

// 進階搜尋
const { filters } = searchFiltersGenerator(tableConfig);

interface DeviceAddressInput {
  system: string;
  address?: number;
  number?: number;
}
const deviceAddressInput = reactive<DeviceAddressInput>({
  system: "",
  address: undefined,
  number: undefined,
});
// 產出點位的 System - Address - Number 的值
function generateFilterColumnForDeviceAddress(
  inputObject: typeof deviceAddressInput
): FilterColumnCollection {
  const filtersObjectArray: FilterColumn[] = [];

  for (const key in inputObject) {
    const value = inputObject[key as keyof DeviceAddressInput];
    if (value) {
      filtersObjectArray.push({
        logical: FilterColumnLogical.And,
        columnKey: {
          fieldName: capitalizeFirstLetter(key),
          typeName: "DeviceAddress",
        },
        value,
      });
    }
  }

  function capitalizeFirstLetter(str: string): string {
    if (str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return {
    logical: FilterColumnLogical.And,
    columns: filtersObjectArray,
  };
}
</script>
