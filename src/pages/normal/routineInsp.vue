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
      例行檢查
    </h3>
    <q-card class="col-12 overflow-hidden">
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
            v-model:filters="filters"
            :blockAttrs="blockAttrs"
            v-on="blockEvent"
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
            <template #customBlockField="{ data, config }">
              <q-checkbox
                v-if="config.name === 'isQualified'"
                disable
                v-model="data.isQualified"
                :label="data.isQualified ? '合格申報' : '缺失申報'"
                :checked-icon="mdiCheckCircle"
                :unchecked-icon="mdiCloseCircle"
                :color="data.isQualified ? 'positive' : 'negative'"
                :class="data.isQualified ? 'text-positive' : 'text-negative'"
                keep-color
              />
              <q-checkbox
                v-if="config.name === 'qualifiedStatus'"
                disable
                :model-value="
                  data.qualifiedStatus === QualifiedStatus.Improved
                    ? true
                    : false
                "
                :label="
                  data.qualifiedStatus === QualifiedStatus.Improved
                    ? '已改善'
                    : data.qualifiedStatus === QualifiedStatus.NotImproved
                    ? '未改善'
                    : '尚未填寫'
                "
                :checked-icon="mdiCheckCircle"
                :unchecked-icon="mdiCloseCircle"
                :color="
                  data.qualifiedStatus === QualifiedStatus.Improved
                    ? 'positive'
                    : 'negative'
                "
                :class="
                  data.qualifiedStatus === QualifiedStatus.Improved
                    ? 'text-positive'
                    : 'text-negative'
                "
                keep-color
              />
            </template>
            <template #customFilter>
              <q-card-section class="flex items-center">
                <div class="text-subtitle1 text-bold">年度</div>
                <div class="flex column flex-center q-ml-lg flex-grow-1">
                  <q-input
                    class="q-mb-md full-width"
                    type="number"
                    v-model.number="dataSearch.Year"
                  />

                  <q-option-group
                    v-model="dataSearch.YearType"
                    :options="yearTypeRadioOption"
                    color="primary"
                    inline
                    dense
                  />
                </div>
              </q-card-section>
            </template>
          </BlockComponent>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>

  <DialogForm
    :dialogAttrs="dialogAttrs"
    :blockAttrs="dialogTableVisible ? tableAttrs : blockAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
    <template #custom="{ config, dialogAttrs }">
      <div v-if="config.formType === 'rangeDate'">
        <DateRangeSelect
          ref="dateSelect"
          :label="config.label + (config.required ? ' *' : '')"
          v-model:dateModel="dialogAttrs.tempData.checkDate"
        />
      </div>
      <div v-else-if="config.formType === 'radioOption'">
        <div class="text-grey-6">
          {{ config.label + (config.required ? " *" : "") }}
        </div>
        <q-field
          :disable="config.disable"
          hide-bottom-space
          borderless
          item-aligned
          :model-value="dialogAttrs.tempData[config.name]"
          class="QField q-pa-none"
          lazy-rules
          :rules="[(val: any) => config.required ? val !== undefined : true ]"
        >
          <q-option-group
            v-model="dialogAttrs.tempData[config.name]"
            :options="handleRadioOption(config.name)"
            color="primary"
            inline
            dense
          />
          <template v-slot:error>
            {{ config.message }}
          </template>
        </q-field>
      </div>
      <div v-if="config.formType === 'checkbox'">
        <div class="text-grey-6">
          {{ config.label + (config.required ? " *" : "") }}
        </div>
        <q-checkbox
          v-model="dialogAttrs.tempData[config.name]"
          :label="
            config.name === 'isQualified'
              ? dialogAttrs.tempData[config.name]
                ? '合格申報'
                : '缺失申報'
              : config.label
          "
          @update:model-value="handleCheckbox"
        />
      </div>
    </template>
  </DialogForm>

  <DialogUpload
    rootPathName="Routine"
    :dialogAttrs="dialogAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
    <template
      #btn="{ fullPath, fileModelArray }"
      v-if="activeTab.value === 'MaintenanceDeclaration'"
    >
      <q-btn
        type="submit"
        color="primary"
        text-color="white"
        label="缺失內容"
        @click.prevent="setAsIncompleteFile(fullPath, fileModelArray)"
        v-close-popup
      />
    </template>
  </DialogUpload>

  <!-- 建立維保單 -->
  <q-dialog v-model="createMaintainDialogVisible" @hide="clearMaintain">
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 550px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">建立維保單確認</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md-lg">
        是否將此
        <span class="text-bold text-primary">{{
          dialogAttrs.selectArray.length
        }}</span>
        項缺失建立維保單?
      </q-card-section>
      <q-card-section class="q-px-lg">
        <div v-for="item in dialogAttrs.selectArray" :key="item.id">
          <div class="flex items-center text-subtitle1 text-bold q-mb-xs">
            <div>{{ item.item }}</div>
            <div
              v-if="item?.device?.condition === DeviceConditions.Maintaining"
            >
              <q-icon
                name="warning"
                color="negative"
                class="q-pl-xs cursor-pointer"
                style="font-size: 24px"
              />
              <q-tooltip
                class="text-body2 bg-negative"
                transition-show="scale"
                transition-hide="scale"
                anchor="top middle"
                self="bottom middle"
                :offset="[10, 10]"
              >
                顯示此符號，表示此缺失項目已建立過維護保養單，將自動更新原單據之狀態，不會重複建立。
              </q-tooltip>
            </div>
          </div>

          <div class="row q-col-gutter-md items-center">
            <!-- 單選select -->
            <div class="col-6">
              <q-select
                clearable
                use-input
                filled
                @filter="filterFn"
                input-debounce="300"
                v-model="item.deviceType"
                :options="deviceSelectOptions"
                option-label="name"
                label="請選擇 設備種類"
                @focus="selectListChange('deviceType', dialogAttrs.tempData)"
                @update:model-value="updateLatestData(item, 'deviceType')"
                :rules="[(val: any) =>  !!val  ? true : '請選擇設備種類']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      尚無資料
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:error>
                  {{ "請選擇設備種類" }}
                </template>
              </q-select>
            </div>
            <div class="col-6">
              <q-select
                clearable
                use-input
                filled
                @filter="filterFn"
                input-debounce="300"
                v-model="item.device"
                :options="deviceSelectOptions"
                option-label="name"
                label="請選擇 設備名稱"
                @focus="selectListChange('device', dialogAttrs.tempData, item)"
                option-disable="disable"
                emit-value
                map-options
                @update:model-value="updateLatestData(item, 'device')"
                :rules="[(val: any) =>  !!val  ? true : '請選擇設備名稱']"
              >
                <template v-slot:no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      尚無資料
                    </q-item-section>
                  </q-item>
                </template>
                <template v-slot:error>
                  {{ "請選擇設備名稱" }}
                </template>
              </q-select>
            </div>
          </div>
        </div>
      </q-card-section>
      <q-card-actions align="center" class="q-mb-md">
        <q-btn label="取消新增" v-close-popup @click="clearMaintain" />
        <q-btn
          label="確認新增"
          color="primary"
          v-close-popup
          @click="createMaintain"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
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
        >
          <template #customHeaderButtons>
            <q-btn
              v-for="(btn, index) in customHeaderButtons"
              :key="index"
              @click="handleClickOption(btn)"
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
        </BlockComponent>
      </q-card-section>
    </q-card>
  </q-dialog>

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
    :sampleFile="sampleFile"
  />
</template>
<script setup lang="ts">
// api
import Building from "src/api/building";
import Files from "src/api/file";
import Routine, {
  RoutineTypes,
  yearTypeRadioOption,
  qualifiedStatusRadioOption,
  routineInspConfig,
  QualifiedStatus,
  yearType,
} from "src/api/routine";
import RoutineImComplete, { incompleteConfig } from "src/api/routineIncomplete";
import Device from "src/api/device";
import DeviceType from "src/api/deviceType";
import SupplierData, { ProviderViewModel } from "src/api/supplierData";
import AddressPlate from "src/api/addressPlate";
import Floors from "src/api/floors";
import Maintain, { MaintainTypes } from "src/api/maintain";
import { DeviceMaintainViewModel } from "src/api/maintainDevice";

// utils
import { useCloned } from "@vueuse/core";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type {
  blockRefType,
  tempDataType,
  blockAttrsType,
  tableConfigItem,
} from "src/utils/tableMixin";
import { DeviceConditions } from "src/utils/deviceStatus";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
import {
  FilterColumn,
  FilterColumnCollection,
  FilterColumnLogical,
} from "src/api/api.type";
import { dataItem } from "src/components/Dialog/DialogImportExcel.vue";

// type
import { radioOptionsType } from "src/components/Dialog/DialogForm.vue";

// icon
import {
  mdiAlertBox,
  mdiAutoMode,
  mdiCheckCircle,
  mdiCloseCircle,
} from "@quasar/extras/mdi-v7";

// pinia store
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building";
import { formatExcelDate } from "src/utils/formatUtils";

const buildingStore = useBuildingStore();
const { buildingData, Bid } = storeToRefs(buildingStore);

const $q = inject("$q") as typeof QVueGlobals;

// tab
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = ref<{ label: string; value: string }[]>([
  {
    label: "檢修申報",
    value: "MaintenanceDeclaration",
  },
  {
    label: "消防局抽查",
    value: "FireDepartmentInspection",
  },
  {
    label: "公安申報",
    value: "PublicSecurityDeclaration",
  },
  {
    label: "工務局抽查",
    value: "PublicWorksDepartmentInspection",
  },
]);

const handleRadioOption = computed(() => (configName: string) => {
  let result: radioOptionsType[] = [];
  if (configName === "yearType") {
    result = yearTypeRadioOption;
  } else if (configName === "qualification") {
    result = [
      { label: "消防設備師", value: "消防設備師" },
      { label: "消防設備士", value: "消防設備士" },
      { label: "暫行裝置檢修", value: "暫行裝置檢修" },
    ];
  } else if (configName === "qualifiedStatus") {
    result = qualifiedStatusRadioOption;
  }
  return result;
});

// 客製 button
const customTableButtons = ref([
  {
    label: "缺失內容",
    icon: mdiAlertBox,
    status: "lack",
    isShow: true,
  },
]);
const customHeaderButtons = ref([
  {
    label: "自動建立維保單",
    icon: mdiAutoMode,
    status: "autoCreateMaintain",
  },
]);
function handleClickOption(
  btn: {
    label: string;
    icon: string;
    status: string;
  },
  data?: tempDataType
) {
  if (data) {
    handleBlock(btn, data);
  } else {
    handleBlock(btn, dialogAttrs.value.selectArray);
  }
}
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
  resetSelect,
} = tableMixin(blockRef as Ref<blockRefType>);

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
let routineData: tempDataType;
const createMaintainDialogVisible = ref(false);
let API: typeof Routine | typeof RoutineImComplete;
// 在 block 上的操作
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  if (dialogTableVisible.value) {
    API = RoutineImComplete;
    await handleBlockMixin(btn, data, API, getTableData);
  } else {
    API = Routine;
    if (btn.status === "edit") {
      data.checkDate = {
        from: data.checkDateStart,
        to: data.checkDateEnd,
      };
      data.floor = data.addressPlate?.floor;
      handleCheckbox(data.isQualified);
    }
    await handleBlockMixin(btn, data, API, getData);

    const floorConfigObj = blockAttrs.value.tableConfig.find(
      (item) => item.name === "floor"
    );
    const addressPlateConfigObj = blockAttrs.value.tableConfig.find(
      (item) => item.name === "addressPlate"
    );
    if (btn.status === "add") {
      dialogAttrs.value.tempData.isQualified = false;

      if (addressPlateConfigObj && !addressPlateConfigObj.required) {
        addressPlateConfigObj.required = true;
      }
      if (floorConfigObj && !floorConfigObj.required) {
        floorConfigObj.required = true;
      }
    } else if (btn.status === "edit") {
      if (dialogAttrs.value.tempData.building) {
        if (addressPlateConfigObj) addressPlateConfigObj.required = false;
        if (floorConfigObj) floorConfigObj.required = false;
      }
    }
  }
  if (btn.status === "lack") {
    routineData = data;
    dialogTableVisible.value = true;
    dialogTableTitle.value = "缺失內容";
    nextTick(() => {
      tableAttrs.value.tableConfig = incompleteConfig as tableConfigItem[];
      tableAttrs.value.headerButtons = ["add", "updateMany", "deleteMany"];
      tableAttrs.value.tableButtons = ["edit", "delete"];
    });
  } else if (btn.status === "upload") {
    routineData = data;
  } else if (btn.status === "autoCreateMaintain") {
    if (dialogAttrs.value.selectArray?.length) {
      createMaintainDialogVisible.value = true;
    } else {
      $q.notify({
        type: "negative",
        message: "請勾選要更新的資料列",
        position: "top",
      });
    }
  } else if (btn.status === "exportExcel") {
    $q.loading.show({
      message: "資料加載中...",
      spinnerColor: "warning",
      messageColor: "warning",
    });
    if (Bid.value) {
      const result = (await Routine.apiGetData({
        filters: "",
        page: 0,
        rowsPerPage: 0,
        type: RoutineTypes[activeTab.value.value as keyof typeof RoutineTypes],
        buildingId: Bid.value,
      })) as typeof AxiosResponse;
      $q.loading.hide();
      if (result.data.rows) {
        fullBlockDataForExcel.value = formatBlockData(result.data.rows);
      }
    }
  }
}
// 在新增/編輯 dialog 上的操作
function handleDialog(status: string, data: tempDataType) {
  if (data.checkDate) {
    data.checkDateStart = data.checkDate.from;
    data.checkDateEnd = data.checkDate.to;
  }
  if (dialogTableVisible.value) {
    data.routine = routineData;
    handleDialogMixin(status, API, getTableData, data);
  } else {
    if (status === "add") {
      data.type =
        RoutineTypes[activeTab.value.value as keyof typeof RoutineTypes];
    }
    handleDialogMixin(status, API, getData, data);
  }
}

// 取得分頁資料
const dataSearch = ref<{
  Type: RoutineTypes;
  Year?: number | null;
  YearType?: yearType | null;
}>({
  Type: 0,
}); // 年度 搜尋
const { filters } = searchFiltersGenerator(routineInspConfig);
async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 25,
  }
) {
  API = Routine;
  console.log("pagination", pagination);

  pagination.buildingId = Bid.value;

  const payload = useCloned(pagination).cloned.value;
  // 產出 filters 物件 (filtersObject)
  const searchText = pagination.filters.trim();
  console.log("searchText", searchText);

  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    filters,
    searchText,
    "Routine"
  );
  dataSearch.value.Type =
    RoutineTypes[activeTab.value.value as keyof typeof RoutineTypes];

  const dataSearchArr = Object.entries(dataSearch.value);
  dataSearchArr.forEach((item: any) => {
    filtersObject.push({
      logical: FilterColumnLogical.And,
      columns: [
        {
          logical: FilterColumnLogical.And,
          columnKey: {
            fieldName: item[0],
            typeName: "Routine",
          },
          value: item[1],
        },
      ],
    });
  });
  const jsonFilters = JSON.stringify(filtersObject);
  payload.filters = jsonFilters;

  await getDataMixin(API, payload);

  setDataForDataConfig(blockAttrs.value.blockData);

  setBlockLoading(blockRef);
}
onMounted(tabChange);

function tabChange(tab: { label: string; value: string } = blockTabs.value[0]) {
  console.log("tabChange", tab);
  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
  blockAttrs.value.blockTitle = tab.value;
  dialogAttrs.value.dialogTitle = tab.label;

  nextTick(() => {
    blockAttrs.value.tableConfig = routineInspConfig;
    blockAttrs.value.headerButtons = [
      "exportExcel",
      "importExcel",
      "add",
      "deleteMany",
    ];
    blockAttrs.value.tableButtons = ["upload", "edit", "delete"];
  });
}

async function selectListChange(
  props: string,
  tempData?: tempDataType,
  itemData?: tempDataType
) {
  console.log("selectListChange", props);
  if (props === "provider") {
    const result = await SupplierData.apiGetProviders();
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "building") {
    const result = (await Building.apiGetAllBuilding()) as typeof AxiosResponse;
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "floor") {
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

      dialogAttrs.value.selectOption = result.data;
    } else {
      $q.notify({
        type: "warning",
        message: "請先選擇樓層，再選擇地址",
        position: "top",
      });
      dialogAttrs.value.selectOption = [];
    }
  } else if (props === "deviceType") {
    const result =
      (await DeviceType.apiGetDevicetypes()) as typeof AxiosResponse;
    deviceSelectOptions.value = result.data;
  } else if (props === "device") {
    // 根據所選的設備種類篩出設備清單

    if (!itemData?.deviceType || itemData?.deviceType === undefined) {
      const result = (await Device.apiGetDevice()) as typeof AxiosResponse;
      deviceSelectOptions.value = result.data;
    } else {
      const result = (await Device.apiGetDeviceByDeviceType(
        itemData.deviceType?.id
      )) as typeof AxiosResponse;
      deviceSelectOptions.value = result.data;
    }
    // 把選過的選項disable
    const chooseDevice = dialogAttrs.value.selectArray
      ?.map((item) => item.device)
      .filter((item) => item);
    if (chooseDevice?.length) {
      chooseDevice.forEach((device) => {
        const disableOption = deviceSelectOptions.value?.find(
          (item) => item.id === device.id
        );
        if (disableOption) disableOption.disable = true;
      });
    }
  }
}

function updateLatestData(data: tempDataType, type: string) {
  if (type === "deviceType") {
    if (data.deviceType) {
      data.device = null;
    }
  } else if (type === "device") {
    if (data.device && !data.deviceType) {
      data.deviceType = data.device.deviceType;
    }
  }
  const floorConfigObj = blockAttrs.value.tableConfig.find(
    (item) => item.name === "floor"
  );
  const addressPlateConfigObj = blockAttrs.value.tableConfig.find(
    (item) => item.name === "addressPlate"
  );

  if (data.building) {
    if (floorConfigObj) floorConfigObj.required = false;
    if (addressPlateConfigObj) addressPlateConfigObj.required = false;
  } else {
    if (floorConfigObj) floorConfigObj.required = true;
    if (addressPlateConfigObj) addressPlateConfigObj.required = true;
  }
}

// dialogTable
const dialogTableVisible = ref(false);
const dialogTableTitle = ref("");

async function getTableData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  API = RoutineImComplete;
  pagination.routineId = routineData?.id;
  await getTableMixin(API, pagination);
}

function handleCheckbox(value: boolean) {
  const qualifiedDeadlineConfigObj = blockAttrs.value.tableConfig.find(
    (item) => item.name === "qualifiedDeadline"
  );
  const qualifiedStatusConfigObj = blockAttrs.value.tableConfig.find(
    (item) => item.name === "qualifiedStatus"
  );
  if (value) {
    if (qualifiedDeadlineConfigObj) {
      qualifiedDeadlineConfigObj.isDialogForm = false;
    }
    if (qualifiedStatusConfigObj) {
      qualifiedStatusConfigObj.isDialogForm = false;
    }
  } else {
    if (qualifiedDeadlineConfigObj) {
      qualifiedDeadlineConfigObj.isDialogForm = true;
    }
    if (qualifiedStatusConfigObj) {
      qualifiedStatusConfigObj.isDialogForm = true;
    }
  }
}

// 設定缺失檔案
async function setAsIncompleteFile(fullPath: string, fileModelArray: string[]) {
  if (fileModelArray.length > 1) {
    $q.notify({
      type: "warning",
      message: "請只選擇一張圖片",
      position: "top",
    });
    return;
  } else if (fileModelArray.length === 0) {
    $q.notify({
      type: "warning",
      message: "請選擇一張圖片",
      position: "top",
    });
  }
  console.log("setAsIncompleteFile", fullPath, fileModelArray);

  const encodedPath = encodeURI(fullPath + fileModelArray[0]);
  const result = (await Files.apiSetIncompleteFile(
    routineData.id as number,
    encodedPath
  )) as typeof AxiosResponse;

  if (result.data) {
    await getData();

    $q.notify({
      type: "positive",
      message: "設定缺失內容成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "設定缺失內容失敗",
      position: "top",
    });
  }
}

// Excel
const tableConfigForExcel = ref<blockAttrsType["tableConfig"]>([]);
const blockDataForExcel = ref<blockAttrsType["blockData"]>([]);
const fullBlockDataForExcel = ref<blockAttrsType["blockData"]>([]);
const rowsChKeyToEngNameObject = reactive<{ [key: string]: string }>({});
async function setDataForDataConfig(blockData: blockAttrsType["blockData"]) {
  const newBlockData = useCloned(blockData).cloned.value;
  tableConfigForExcel.value = routineInspConfig;
  console.log("newBlockData", newBlockData);

  blockDataForExcel.value = formatBlockData(newBlockData);
  tableConfigForExcel.value.forEach((item) => {
    const { label, name } = item;
    rowsChKeyToEngNameObject[label] = name;
  });
  console.log("tableConfigForExcel", tableConfigForExcel.value);
}
function formatBlockData(blockData: blockAttrsType["blockData"]) {
  return blockData.map((item) => {
    item.type = blockTabs.value.find(
      (tab) => tab.value === RoutineTypes[item.type]
    )?.label;
    item.yearType = yearTypeRadioOption.find(
      (type) => type.value === item.yearType
    )?.label;
    item.isQualified = item.isQualified ? "合格申報" : "缺失申報";
    item.checkDate =
      item.checkDateStart && item.checkDateEnd
        ? `${item.checkDateStart} 至 ${item.checkDateEnd}`
        : "";
    item.addressPlate = item.addressPlate?.houseNumber;
    return item;
  });
}
// Excel 匯入 => 多筆新增
const dialogImportExcelRef = ref();

const sampleFile = computed(() => {
  return "/excelSample/例行檢查.xlsx";
});

function formatImportData(data: dataItem[]) {
  const clonedData = useCloned(data).cloned.value;
  clonedData.map((item) => {
    for (const key in item) {
      const newKey = rowsChKeyToEngNameObject[key];

      if (newKey) {
        if (
          newKey === "type" ||
          newKey === "year" ||
          newKey === "yearType" ||
          newKey === "isQualified" ||
          newKey === "qualifiedStatus"
        ) {
          item[newKey as keyof typeof item] = JSON.parse(item[key]);
        } else {
          item[newKey as keyof typeof item] = item[key];
        }
      }
      delete item[key];
    }
    item.building = buildingData.value;
    item.checkDateStart = formatExcelDate(item.checkDateStart);
    item.checkDateEnd = formatExcelDate(item.checkDateEnd);
    item.date = formatExcelDate(item.date);
    item.deadline = formatExcelDate(item.deadline);
    item.qualifiedDeadline = formatExcelDate(item.qualifiedDeadline);
    return item;
  });
  return clonedData;
}
async function saveImportData(formattedTableData: dataItem[]) {
  await handleDialogMixin("add", API, getData, formattedTableData);
  dialogImportExcelRef.value.hide();
}
// 建立維保單
const deviceSelectOptions = ref<tempDataType[]>([]);

function filterFn(val: string, update: (func: () => void) => void) {
  update(() => {
    const needle = val.toLocaleLowerCase();
    deviceSelectOptions.value = deviceSelectOptions.value.filter(
      (v) => v.name.toLocaleLowerCase().indexOf(needle) > -1
    );
  });
}
async function createMaintain() {
  const maintainList: tempDataType[] = []; // 選擇的設備不在保養單
  const deviceTypeIdArr: string[] = [];
  const inMaintainDevice: tempDataType[] = []; // 選擇的設備已在其他保養單
  dialogAttrs.value.selectArray?.forEach((item) => {
    if (item?.device?.condition === DeviceConditions.Maintaining) {
      inMaintainDevice.push(item);
    } else if (
      item.deviceType &&
      !deviceTypeIdArr.includes(item.deviceType?.id) &&
      item?.device?.condition !== DeviceConditions.Maintaining
    ) {
      deviceTypeIdArr.push(item.deviceType?.id);

      maintainList.push({
        deviceType: item.deviceType,
        type: MaintainTypes.Fault,
        building: buildingData.value,
        creationDate: new Date(),
        deviceMaintains: [],
        providers: [],
        name: `${item.item}【缺失維修單】`,
      });
    }
  });
  // 建立維保單
  maintainList.forEach((maintain) => {
    dialogAttrs.value.selectArray?.forEach((item) => {
      if (
        item.deviceType?.id === maintain.deviceType?.id &&
        item?.device?.condition !== DeviceConditions.Maintaining
      ) {
        if (item.device) {
          maintain.deviceMaintains.push({
            maintainId: 0,
            device: item.device,
            incomplete: item,
          });
          if (item.device?.maintainVendor) {
            maintain.providers.push(item.device.maintainVendor);
            // 篩掉重複的廠商
            const set = new Set();
            maintain.providers = maintain.providers.filter(
              (item: ProviderViewModel) =>
                !set.has(item.id) ? set.add(item.id) : false
            );
          }
        }
      }
    });
  });

  // 若選擇的設備已在其他維保單中，則將該缺失設定進該張維保單中
  if (inMaintainDevice.length) {
    inMaintainDevice.forEach(async (item) => {
      const deviceMaintainId = item.device?.lastMaintain.deviceMaintains.find(
        (deviceMaintains: DeviceMaintainViewModel) =>
          deviceMaintains.device?.id === item?.id
      ).id;
      const result =
        (await RoutineImComplete.apiPatchIncompleteToDeviceMaintain(
          deviceMaintainId,
          item?.id
        )) as typeof AxiosResponse;
      if (result.data) {
        $q.notify({
          type: "positive",
          message: "修改成功",
          position: "top",
        });
      } else {
        $q.notify({
          type: "negative",
          message: "修改失敗",
          position: "top",
        });
      }
    });
  }

  if (maintainList?.length) {
    await handleDialogMixin("add", Maintain, getData, maintainList);
  }
  console.log("maintainList", maintainList, inMaintainDevice);
  resetSelect();
  await getTableData();
}
function clearMaintain() {
  resetSelect();
}
</script>
