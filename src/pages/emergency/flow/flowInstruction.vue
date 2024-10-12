<template>
  <q-page class="q-pa-md flex row">
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
        :style="{
          height:
            $q.screen.xs || $q.screen.sm
              ? 'calc(100% - 90px)'
              : 'calc(100% - 50px)',
        }"
        animated
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
    <template
      v-if="activeTab.value === 'instructions'"
      #custom="{ config, dialogAttrs }"
    >
      <q-select
        v-if="config.formType === 'selectIcon'"
        v-model="dialogAttrs.tempData[config.name]"
        clearable
        :options="dialogAttrs.selectOption"
        :label="config.label + (config.required ? ' *' : '')"
        :rules="[(val: any) => config.required ? !!val : typeof val === 'object'? true :false || config.message?config.message:`請輸入 ${config.label}`]"
        @focus="selectListChange(config.name)"
        @update:model-value="chooseSelect(dialogAttrs.tempData)"
      >
        <template v-slot:selected-item="scope">
          <q-icon :name="scope.opt.iconImg" style="font-size: 18px"></q-icon>
          <span class="q-ml-sm">{{ scope.opt.value || scope.opt.name }}</span>
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-icon :name="scope.opt.iconImg"></q-icon>
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
    </template>
  </DialogForm>
</template>
<script setup lang="ts">
// api
import ProcessInstruction, { StepViewModel } from "src/api/processInstruction";
import WorkflowType, { WorkflowTypeViewModel } from "src/api/workflowType";
import Device, { DeviceViewModel } from "src/api/device";
// utils
import processIconOptions from "./processIconOptions";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type { blockRefType, tempDataType } from "src/utils/tableMixin";
import Building from "src/api/building";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
import { useCloned } from "@vueuse/core";
// icon
import { mdiCheckCircle } from "@quasar/extras/mdi-v6";
import { FilterColumnCollection } from "src/api/api.type";

const $q = inject("$q") as typeof QVueGlobals;

// 獲取節點類型下拉
onMounted(async () => {
  const result = await ProcessInstruction.apiGetNodeType();

  const nodeTypeConfig = instructionConfig.find(
    (item) => item.name === "nodeType"
  );

  if (nodeTypeConfig) {
    nodeTypeConfig.searchOption.options =
      result.data.map((item) => ({
        label: item.name as string,
        value: item.nodeType,
      })) || [];
  }
});
const instructionConfig = [
  {
    label: "名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "名稱", val: "Name", isDefault: true },
  },
  {
    label: "節點類型",
    name: "nodeType",
    field: "nodeType",
    align: "left",
    formType: "selectIcon",
    message: "請選擇 節點類型",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用 (Equals 下拉)
    searchTitle: "節點類型",
    searchType: "singleSelect",
    searchOption: {
      val: "NodeType",
      options: [] as { label: string; value: number }[],
      style: "padding: 0 .2rem 0 .6rem",
    },
  },
];
const flowTypeConfig = [
  {
    label: "名稱",
    name: "name",
    field: "name",
    align: "left",
    formType: "inputString",
    message: "請輸入 名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "名稱", val: "Name", isDefault: true },
  },
  {
    label: "描述",
    name: "description",
    field: "description",
    align: "left",
    formType: "textArea",
    message: "請輸入 描述",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "描述", val: "Description" },
  },
  {
    label: "大樓",
    name: "buildings",
    field: "buildings",
    align: "left",
    formType: "selectMany",
    message: "請輸入 大樓",
    isTable: false,
    isDialogForm: true,
    required: false,
  },
  {
    label: "觸發設備",
    name: "devices",
    field: (row: WorkflowTypeViewModel) =>
      row.devices?.map((item) => item.name).join(", ") || "",
    align: "left",
    formType: "selectMany",
    message: "請選擇 觸發設備",
    isTable: true,
    isDialogForm: true,
    required: false,
    // 進階搜尋用
    searchType: "string",
    searchOption: { label: "觸發設備", val: "DeviceName" },
  },
];

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
// API類別
let API: typeof ProcessInstruction | typeof WorkflowType;
// 在 block 上的操作
function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  handleBlockMixin(btn, data, API, getData);
  console.log("handleBlock", data);
}
// 在新增/編輯 dialog 上的操作
function handleDialog(status: string, data: tempDataType) {
  delete data.stepType;
  if (API === ProcessInstruction && status === "add") {
    data.icon = data.nodeType.icon;
    delete data.nodeType.icon;
  } else if (API === WorkflowType && status === "edit") {
    console.log("now data", data);
    if (!data.buildings) delete data.buildings;
    if (!data.devices) delete data.devices;
    else if (data.devices) {
      data.devices.forEach((device: DeviceViewModel) => {
        device.keeperUnit = null;
      });
    }
  }
  handleDialogMixin(status, API, getData, data);
}

// 獲取 icon 下拉資料
const iconsData: StepViewModel[] = [];
onMounted(async () => {
  const result = await ProcessInstruction.apiGetNodeType();
  result.data.forEach((item: tempDataType) => {
    const iconObj = processIconOptions.find(
      (iconItem) => item.nodeType === iconItem.nodeType
    );
    item.iconImg = iconObj?.iconImg;
  });
  iconsData.push(...result.data);
  blockAttrs.value.blockData?.forEach((item: tempDataType) => {
    const iconObj = iconsData.find(
      (iconItem) => item.nodeType.key === iconItem.nodeType
    );
    item.icon = iconObj?.iconImg;
    item.nodeType.iconImg = iconObj?.iconImg;
  });
});

// 取得分頁資料
// 搜尋篩選物件 (filters)
const { filters: instructionFilters } =
  searchFiltersGenerator(instructionConfig);
const { filters: flowTypeFilters } = searchFiltersGenerator(flowTypeConfig);
const filters = computed(() => {
  if (activeTab.value.value === "instructions") return instructionFilters;
  else if (activeTab.value.value === "flowTypes") return flowTypeFilters;
  return [];
});
async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  // 產出 filters 物件 (filtersObject)
  const payload = useCloned(pagination).cloned.value;
  const searchText = pagination.filters.trim();
  let jsonFilters = "";
  if (activeTab.value.value === "instructions") {
    const filtersObject: FilterColumnCollection[] = generateFiltersObject(
      filters.value,
      searchText,
      "Step"
    );
    jsonFilters = JSON.stringify(filtersObject);
    payload.filters = jsonFilters;
  } else if (activeTab.value.value === "flowTypes") {
    const filtersObject: FilterColumnCollection[] = generateFiltersObject(
      filters.value,
      searchText,
      "WorkflowType"
    );
    jsonFilters = JSON.stringify(filtersObject);
  }
  payload.filters = jsonFilters;
  await getDataMixin(API, payload);
  if (payload && API === ProcessInstruction) {
    blockAttrs.value.blockData.forEach((item: tempDataType) => {
      const iconObj = iconsData.find(
        (iconItem) => item.nodeType.key === iconItem.nodeType
      );
      item.icon = iconObj?.iconImg;
      item.nodeType.iconImg = iconObj?.iconImg;
    });
  }
  setBlockLoading(blockRef);
}

// 每次點取變換下拉選單內容
async function selectListChange(props: string, tempData?: tempDataType) {
  console.log("selectListChange", props);
  if (props === "nodeType") {
    dialogAttrs.value.selectOption = iconsData;
  } else if (props === "devices") {
    if (tempData) {
      const { buildings, devices } = tempData;
      const payload = buildings?.map((item: tempDataType) => item.id) ?? [];
      const result = await Device.apiGetUnsettedTriggers(payload);

      // 如果 result.data 有值且 devices 有值，需要把兩者重複的資料刪除
      if (result.data.length && devices && devices.length) {
        const devicesIdArray = devices.map(
          (deviceItem: DeviceViewModel) => deviceItem.id
        );
        const uniqueResultData = result.data.filter(
          (resultItem) => !devicesIdArray.includes(resultItem.id)
        );
        dialogAttrs.value.selectOption = [
          ...uniqueResultData,
          ...(devices || []),
        ];
      } else {
        dialogAttrs.value.selectOption = [...result.data, ...(devices || [])];
      }
    }
  } else if (props === "buildings") {
    const result = await Building.apiGetAllBuilding();
    dialogAttrs.value.selectOption = result.data;
  }
}

function chooseSelect(data: tempDataType) {
  console.log("chooseSelect", data);
  const iconObj = processIconOptions.find(
    (iconItem) => data.nodeType.nodeType === iconItem.nodeType
  );
  data.nodeType = {
    key: data.nodeType.nodeType,
    value: data.nodeType.name,
    iconImg: data.nodeType.iconImg,
  };
  data.icon = iconObj?.value;
}

// tab
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "流程指令",
    value: "instructions",
  },
  {
    label: "流程圖種類",
    value: "flowTypes",
  },
];
// Tab Change
onMounted(() => {
  tabChange(blockTabs[0]);
});

function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log("tabChange", tab);

  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
  blockAttrs.value.blockTitle = tab.value;
  dialogAttrs.value.dialogTitle = tab.label;

  if (activeTab.value.value === "instructions") {
    API = ProcessInstruction;
    nextTick(() => {
      blockAttrs.value.tableConfig = instructionConfig;
      blockAttrs.value.headerButtons = ["add", "deleteMany"];
      blockAttrs.value.tableButtons = ["edit", "delete"];
    });
  } else if (activeTab.value.value === "flowTypes") {
    API = WorkflowType;
    nextTick(() => {
      blockAttrs.value.tableConfig = flowTypeConfig;
      blockAttrs.value.headerButtons = ["updateMany", "add", "deleteMany"];
      blockAttrs.value.tableButtons = ["edit", "delete"];
    });
  }
}
</script>
