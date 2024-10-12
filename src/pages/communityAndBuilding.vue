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
      編輯社區/大樓
    </h3>
    <q-card>
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
              ? 'calc(100% - 100px)'
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

            <template #customFilter v-if="activeTab.value === 'building'">
              <q-card-section class="flex items-center" style="gap: 0.8rem">
                <div class="text-subtitle1 text-bold">地上樓層</div>
                <q-input v-model.number="groundFloorNumber" type="number" />
                <div class="text-subtitle1 text-bold">地下樓層</div>
                <q-input v-model.number="basementFloorNumber" type="number" />
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
    :blockAttrs="dialogTableVisible ? tableAttrs : blockAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
    <template #default>
      <div
        v-for="config in dialogTableVisible
          ? tableAttrs.tableConfig
          : blockAttrs.tableConfig"
        :key="config.name"
      >
        <div v-if="config.isDialogForm">
          <div
            v-if="
              activeTab.value === 'building' &&
              (config.name === 'inspectionPlaceDate' ||
                config.name === 'publicPlaceDate')
            "
            class="q-mb-sm"
          >
            <span class="text-h6 text-bold">{{
              config.name === "inspectionPlaceDate" ? "檢修申報" : "公安申報"
            }}</span>
            <q-separator class="q-pb-xs q-mb-md q-mt-sm" />
          </div>
          <div v-if="activeTab.value === 'community'" class="q-mb-sm">
            <div
              class="separator"
              style="padding: 1rem 1rem 1rem"
              v-if="
                config.name === 'firstBuilding' ||
                config.name === 'secondBuilding'
              "
            >
              {{
                config.name === "firstBuilding"
                  ? "第一個樓層"
                  : config.name === "secondBuilding"
                  ? "第二個樓層"
                  : ""
              }}
            </div>
          </div>
          <!-- inputString -->
          <q-input
            :disable="config.disable"
            v-if="config.formType === 'inputString'"
            v-model="dialogAttrs.tempData[config.name]"
            :label="config.label + (config.required ? ' *' : '')"
            lazy-rules
            :rules="[(val: any) => config.required ? !!val : (typeof val === 'string' || !val )  ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
          >
            <template v-slot:error>
              {{ config.message }}
            </template>
          </q-input>
          <!-- 數字 -->
          <q-input
            :disable="config.disable"
            v-if="config.formType === 'inputNumber'"
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
          <!-- 單選select -->
          <q-select
            clearable
            :disable="config.disable"
            v-if="config.formType === 'selectString'"
            v-model="dialogAttrs.tempData[config.name]"
            :options="dialogAttrs.selectOption"
            :label="config.label + (config.required ? ' *' : '')"
            option-disable="disable"
            @focus="selectListChange(config.name, dialogAttrs.tempData)"
            @update:model-value="
              $emit('updateLatestData', dialogAttrs.tempData)
            "
            :rules="[(val: any) => config.required ? !!val : typeof val === 'object'|| !val ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
          >
            <template v-slot:selected-item="scope">
              <span>{{
                scope.opt.name || scope.opt.fullname || scope.opt.label
              }}</span>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{
                    scope.opt.name || scope.opt.fullname || scope.opt.label
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> 尚無資料 </q-item-section>
              </q-item>
            </template>
            <template v-slot:error>
              {{ config.message }}
            </template>
          </q-select>
          <!-- 多選select -->
          <q-select
            :disable="config.disable"
            v-if="config.formType === 'selectMany'"
            clearable
            multiple
            use-chips
            option-value="id"
            v-model="dialogAttrs.tempData[config.name]"
            :options="dialogAttrs.selectOption"
            :label="config.label + (config.required ? ' *' : '')"
            @focus="selectListChange(config.name, dialogAttrs.tempData)"
            class="q-mb-md-md"
            :rules="[(val: any) => config.required ? !!val : true || config.message]"
          >
            <template v-slot:selected-item="scope">
              <q-chip
                removable
                @remove="scope.removeAtIndex(scope.index)"
                :tabindex="scope.tabindex"
                dense
              >
                {{ scope.opt.fullname || scope.opt.label || scope.opt.name }}
              </q-chip>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{
                    scope.opt.label || scope.opt.name || scope.opt.fullname
                  }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> 尚無資料 </q-item-section>
              </q-item>
            </template>
            <template v-slot:error>
              {{ config.message }}
            </template>
          </q-select>
          <div v-if="config.formType === 'radioOption'">
            {{ config.label + (config.required ? " *" : "") }}

            <q-field
              hide-bottom-space
              borderless
              item-aligned
              :model-value="dialogAttrs.tempData[config.name]"
              class="QField q-pa-none"
              lazy-rules
              :rules="[(val: any) => config.required ? val !== undefined : true ]"
            >
              <template v-slot:default>
                <q-option-group
                  v-model="dialogAttrs.tempData[config.name]"
                  :options="declareRadioOptions(config.name)"
                  color="primary"
                  inline
                  dense
                  @update:model-value="
                    declareOptionAction(
                      config.name,
                      dialogAttrs.tempData[config.name],
                      blockAttrs.tableConfig
                    )
                  "
                >
                  <template v-slot:label="opt">
                    <div class="row items-center">
                      <q-input
                        @click.stop
                        v-if="opt.value === 2"
                        dense
                        v-model="
                          dialogAttrs.tempData[
                            config.name === 'inspectionPlaceRemind'
                              ? 'inspectionPlaceDays'
                              : 'publicPlaceDays'
                          ]
                        "
                        :placeholder="'自訂天數'"
                        style="width: 100px"
                        ><template v-slot:append>
                          <span class="text-subtitle1">天</span>
                        </template></q-input
                      >
                      <span else>{{ opt.label }}</span>
                    </div>
                  </template>
                </q-option-group>
              </template>

              <template v-slot:error>
                {{ config.message }}
              </template>
            </q-field>
          </div>
          <!-- 備註 -->
          <q-input
            :disable="config.disable"
            v-if="config.formType === 'textArea'"
            v-model="dialogAttrs.tempData[config.name]"
            :label="config.label + (config.required ? ' *' : '')"
            type="textarea"
            autogrow
          >
            <template v-slot:error>
              {{ config.message }}
            </template>
          </q-input>
          <!-- Toggle Boolean -->
          <q-toggle
            v-if="config.formType === 'toggle'"
            v-model="dialogAttrs.tempData[config.name]"
            color="primary"
            left-label
          >
            <span class="text-grey-8 fz-16 q-mr-xs">{{ config.label }}</span>
          </q-toggle>
        </div>
      </div>
    </template>
  </DialogForm>

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
          ref="blockRefInDialogTable"
          :blockAttrs="tableAttrs"
          v-on="tableEvent"
          :isSearch="false"
          :isDialogTable="true"
          :custom-height="'calc(100% - 20px)'"
        />
      </q-card-section>
    </q-card>
  </q-dialog>

  <q-dialog v-model="dialogQrCodeVisible" persistent>
    <q-card
      :style="
        $q.screen.xs || $q.screen.sm
          ? 'width:100%; height:auto'
          : 'min-width: 20%; height:auto'
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">QRCode</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>
      <q-card-section class="flex-grow-1">
        <q-img :src="qrCode" fit="cover" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
// api
import Space, { SpaceViewModel, spaceConfig } from "src/api/space";
import accountSetting from "src/api/accountSetting";
import Area from "src/api/area";
import System, { systemType } from "src/api/system";

import Building, { BuildingViewModel } from "src/api/building";
import Floors, { FloorViewModel, floorConfig } from "src/api/floors";

// utils
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type { blockRefType, tempDataType } from "src/utils/tableMixin";
import { useQRCode } from "@vueuse/integrations/useQRCode";
import declareMixin from "src/utils/declareMixin";

// icon
import { mdiCheckCircle, mdiHomeFlood, mdiQrcode } from "@quasar/extras/mdi-v6";

// pinia store
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
import {
  FilterColumn,
  FilterColumnCollection,
  FilterColumnLogical,
} from "src/api/api.type";

const buildingStore = useBuildingStore();
const { buildingData, buildingTableConfig, Bid } = storeToRefs(buildingStore);

const $q = inject("$q") as typeof QVueGlobals;

// block
const blockRef = ref<blockRefType>();
const blockRefInDialogTable = ref<blockRefType>();
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

// tab
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "大樓",
    value: "building",
  },
  {
    label: "社區共用樓層",
    value: "community",
  },
];

// 客製 button
const customTableButtons = ref([
  {
    label: "產生QRCode",
    icon: mdiQrcode,
    status: "qrCode",
    isShow: true,
  },
  {
    label: "設定大樓樓層",
    icon: mdiHomeFlood,
    status: "settingFloor",
    isShow: true,
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
  console.log("handleClickOption", { btn, data });

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

// QRCode
const qrCodeUrl = ref(process.env.Url + "/login?buildingId=" + Bid.value);
const qrCode = useQRCode(qrCodeUrl, {
  errorCorrectionLevel: "H",
  margin: 3,
});

// API類別
let API: typeof Building | typeof Floors | typeof Space;
// 在 block 上的操作
const currentBuildingData = ref<BuildingViewModel>();
// 申報相關
const { declareRadioOptions, declareOptionAction } = declareMixin();
const dialogQrCodeVisible = ref(false);
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  if (dialogTableVisible.value) {
    await handleBlockMixin(btn, data, API, getTableData);
  } else if (activeTab.value.value === "building") {
    currentBuildingData.value = data as BuildingViewModel;
    handleBlockMixin(btn, data, API, getData);

    if (btn.status === "add" || btn.status === "edit") {
      const dialogTempData = dialogAttrs.value.tempData;
      declareOptionAction(
        "use",
        dialogTempData.use,
        blockAttrs.value.tableConfig
      );
      declareOptionAction(
        "purpose",
        dialogTempData.purpose,
        blockAttrs.value.tableConfig
      );
      // 檢修申報
      dialogTempData.inspectionPlaceDate =
        dialogTempData.inspectionPlaceJob?.date;
      dialogTempData.inspectionPlaceRemind =
        dialogTempData.inspectionPlaceJob?.remind;
      dialogTempData.inspectionPlaceDays =
        dialogTempData.inspectionPlaceJob?.days;
      // 公安申報
      dialogTempData.publicPlaceDate = dialogTempData.publicPlaceJob?.date;
      dialogTempData.publicPlaceRemind = dialogTempData.publicPlaceJob?.remind;
      dialogTempData.publicPlaceDays = dialogTempData.publicPlaceJob?.days;
    } else if (btn.status === "settingFloor") {
      dialogTableVisible.value = true;
      dialogTableTitle.value = "設定樓層";
      nextTick(() => {
        tableAttrs.value.tableConfig = floorConfig;
        tableAttrs.value.headerButtons = ["add", "deleteMany"];
        tableAttrs.value.tableButtons = ["edit", "delete"];
      });
      tableAttrs.value.blockData = blockAttrs.value.blockData;
      tableAttrs.value.totalNum = blockAttrs.value.totalNum;
    } else if (btn.status === "qrCode") {
      dialogQrCodeVisible.value = true;
      qrCodeUrl.value = `${window.location.origin}/login?buildingId=${data.id}`;
    }
  } else if (activeTab.value.value === "community") {
    if (btn.status === "edit") {
      data.firstBuilding = data.previous.building;
      data.secondBuilding = data.next.building;
    }
    await handleBlockMixin(btn, data, API, getTableData);
  }

  console.log("handleBlock", data);
}

// Dialog 相關方法
// 在新增/編輯 dialog 上的操作
function handleDialog(status: string, data: tempDataType) {
  if (dialogTableVisible.value && tableDataAPI === Floors) {
    data.building = currentBuildingData.value;
    handleDialogMixin(status, tableDataAPI, getTableData, data);
  } else if (API === Building) {
    if (data.inspectionPlaceDate || data.inspectionPlaceRemind) {
      data.inspectionPlaceJob = {
        date: data.inspectionPlaceDate,
        remind: data.inspectionPlaceRemind,
        days: data.inspectionPlaceDays,
        current: new Date(),
        completed: false,
        next: new Date(),
      };
    }
    if (data.publicPlaceDate || data.publicPlaceRemind) {
      data.publicPlaceJob = {
        date: data.publicPlaceDate,
        remind: data.publicPlaceRemind,
        days: data.publicPlaceDays,
        current: new Date(),
        completed: false,
        next: new Date(),
      };
    }
    handleDialogMixin(status, API, getData, data);
  } else if (API === Space) {
    if (!data.previous || !data.next) {
      $q.notify({
        type: "warning",
        message: "請先選擇共用樓層",
        position: "top",
      });
      return;
    }
    if (data.firstBuilding.id === data.secondBuilding.id) {
      $q.notify({
        type: "warning",
        message: "請選擇不同大樓",
        position: "top",
      });
      return;
    }
    handleDialogMixin(status, API, getData, data);
  }
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
    activeTab.value.value === "building" ? buildingFilters : communityFilters,
    searchText,
    activeTab.value.value === "building" ? "Building" : "Space"
  );
  if (activeTab.value.value === "building") {
    const defaultObj: FilterColumnCollection = {
      logical: FilterColumnLogical.And,
      columns: [],
    };

    if (groundFloorNumber.value) {
      defaultObj.columns.push({
        logical: FilterColumnLogical.Or,
        columnKey: { fieldName: "GroundFloor", typeName: "Building" },
        value: groundFloorNumber.value,
      });
    }

    if (basementFloorNumber.value) {
      defaultObj.columns.push({
        logical: FilterColumnLogical.Or,
        columnKey: { fieldName: "BasementFloor", typeName: "Building" },
        value: basementFloorNumber.value,
      });
    }

    if (defaultObj.columns.length) filtersObject.push(defaultObj);
  }
  // 產出 JSON => 放進 payload
  const jsonFilters = JSON.stringify(filtersObject);
  const payload = { ...copyPagination, filters: jsonFilters };
  await getDataMixin(API, payload);

  if (activeTab.value.value === "building") {
    // 即時更新 building store
    blockAttrs.value.blockData.forEach((item) => {
      if (item.id === buildingStore.Bid) {
        buildingData.value = item as BuildingViewModel;
      }
    });
  }

  setBlockLoading(blockRef);
}

async function init() {
  tabChange(blockTabs[0]);
}
onMounted(() => {
  init();
});

function tabChange(tab: { label: string; value: string } = blockTabs[1]) {
  console.log("tabChange", tab);

  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
  blockAttrs.value.blockTitle = tab.value;
  dialogAttrs.value.dialogTitle = tab.label;

  if (activeTab.value.value === "building") {
    API = Building;
    nextTick(() => {
      blockAttrs.value.tableConfig = buildingTableConfig.value;
      blockAttrs.value.headerButtons = ["add", "deleteMany"];
      blockAttrs.value.tableButtons = ["edit", "delete"];
      customTableButtons.value = [
        {
          label: "產生QRCode",
          icon: mdiQrcode,
          status: "qrCode",
          isShow: true,
        },
        {
          label: "設定大樓樓層",
          icon: mdiHomeFlood,
          status: "settingFloor",
          isShow: true,
        },
      ];
    });
  } else if (activeTab.value.value === "community") {
    API = Space;
    nextTick(() => {
      blockAttrs.value.tableConfig = spaceConfig;
      blockAttrs.value.headerButtons = ["updateMany", "add", "deleteMany"];
      blockAttrs.value.tableButtons = ["edit", "delete"];
      customTableButtons.value = [];
    });
  }
}

async function selectListChange(props: string, tempData?: tempDataType) {
  console.log("selectListChange", props);
  if (buildingStore.Bid) {
    if (!dialogTableVisible.value) {
      if (
        props === "fireManagers" ||
        props === "chairman" ||
        props === "executiveSecretary"
      ) {
        // 防火管理人
        const result = (await accountSetting.apiGetUsersByRoleName(
          "Manager"
        )) as typeof AxiosResponse;
        dialogAttrs.value.selectOption = result.data;
      } else if (props === "inspectionPlaceDate") {
        const result = (await System.apiGetSystemItem(
          systemType.InspectionTypeOfTime
        )) as typeof AxiosResponse;
        dialogAttrs.value.selectOption = result.data;
      } else if (props === "publicPlaceDate") {
        const result = (await System.apiGetSystemItem(
          systemType.PublicSafeTypeOfTime
        )) as typeof AxiosResponse;
        dialogAttrs.value.selectOption = result.data;
      } else if (props === "firstBuilding" || props === "secondBuilding") {
        const result =
          (await Building.apiGetAllBuilding()) as typeof AxiosResponse;
        dialogAttrs.value.selectOption = result.data;
      } else if (props === "previous") {
        if (tempData?.firstBuilding) {
          const result = (await Floors.apiGetBuildingFloor(
            tempData?.firstBuilding.id
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
      } else if (props === "next") {
        if (tempData?.secondBuilding) {
          const result = (await Floors.apiGetBuildingFloor(
            tempData?.secondBuilding.id
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
      }
    } else {
      if (props === "area") {
        const result = (await Area.apiGetArea(
          currentBuildingData.value?.id
        )) as typeof AxiosResponse;
        dialogAttrs.value.selectOption = result.data;
      }
    }
  }
}

// dialogTable
const dialogTableVisible = ref(false);
const dialogTableTitle = ref("");
let tableDataAPI: typeof Floors;
async function getTableData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  tableDataAPI = Floors;
  pagination.buildingId = currentBuildingData.value?.id;
  await getTableMixin(tableDataAPI, pagination);
  setBlockLoading(blockRefInDialogTable);
}

// 進階搜尋
const { filters: buildingFilters } = searchFiltersGenerator(
  buildingTableConfig.value
);
const { filters: communityFilters } = searchFiltersGenerator(spaceConfig);
const filters = computed(() => {
  if (activeTab.value.value === "building") return buildingFilters;
  else if (activeTab.value.value === "community") return communityFilters;
});

const groundFloorNumber = ref();
const basementFloorNumber = ref();
</script>
