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
            :expandAttrs="expandAttrs"
            v-model:filters="filters"
            ref="blockRef"
            :blockAttrs="blockAttrs"
            v-on="blockEvent"
          >
            <template #customTableButtons="scope">
              <template
                v-if="activeTab.value === 'areaEdit' && !isCommonCommunityUser"
              >
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
            </template>
            <template #customFilter>
              <q-card-section
                class="filter"
                v-if="activeTab.value === 'sDFMEdit'"
              >
                <div class="title">班別模式</div>
                <div class="options">
                  <q-checkbox
                    v-model="selectAll"
                    val="selectAll"
                    label="全選"
                    @update:model-value="selectAllCheckbox"
                  />
                  <q-checkbox
                    v-for="item in dutyTypeOptions"
                    :key="item.value"
                    v-model="dutyTypeNum"
                    :label="item.value === 8 ? '自訂班別' : item.label"
                    :val="item.value"
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
    :blockAttrs="blockAttrs"
    :customTableConfig="floorTableConfig"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
    <template #custom="{ config, dialogAttrs }">
      <div v-if="config.formType === 'checkboxMany'">
        {{ config.label }}
        <div class="flex items-center">
          <q-checkbox
            v-model="selectAll"
            val="selectAll"
            label="全選"
            @update:model-value="selectAllCheckbox(dialogAttrs.tempData)"
          />
          <q-option-group
            :name="config.name"
            v-model="dutyTypeNum"
            :options="dutyTypeOptions"
            type="checkbox"
            color="primary"
            inline
            @update:model-value="dutyTypeChange(dialogAttrs.tempData)"
          >
            <template v-slot:label="opt">
              <div class="row items-center">
                <q-input
                  @click.stop
                  v-if="opt.value === 8"
                  dense
                  v-model="dialogAttrs.tempData['otherDutyType']"
                  :placeholder="config.message"
                />
                <span else>{{ opt.label }}</span>
              </div>
            </template>
          </q-option-group>
        </div>
      </div>
    </template>
  </DialogForm>
</template>
<script setup lang="ts">
// api
import Building from "src/api/building";
import sDFM, {
  sDFMConfig,
  sDFMExpandConfig,
  floorTableConfig,
} from "src/api/sDFM";
import Area, { areaConfig } from "src/api/area";
import Role, { roleType } from "src/api/role";
import AccountSetting from "src/api/accountSetting";
import Floors from "src/api/floors";

// utils
import { useCloned } from "@vueuse/core";
import { Cookies, is } from "quasar";
import {
  maskToNumberArrayAndUpdateToModel,
  numberToBitMask,
} from "src/utils/bitMask";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type { blockRefType, tempDataType } from "src/utils/tableMixin";
// icon
import { mdiHomeFloorNegative1, mdiCheckCircle } from "@quasar/extras/mdi-v6";

// pinia store
import { useBuildingStore } from "src/stores/building.js";
import { useUserStore } from "src/stores/user";

// 進階搜尋
import { storeToRefs } from "pinia";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
import {
  FilterColumn,
  FilterColumnCollection,
  FilterColumnLogical,
} from "src/api/api.type";

const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);
const $q = inject("$q") as typeof QVueGlobals;

const userStore = useUserStore();
const { userData } = storeToRefs(userStore);

const { isSystem, isManager, isCenter, isMercury } = storeToRefs(userStore);
const isCommonCommunityUser = computed(() => {
  return (
    userData.value.isCommunityUser &&
    !isSystem.value &&
    !isManager.value &&
    !isMercury.value &&
    !isCenter.value
  );
});

// tab
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "消防編組",
    value: "sDFMEdit",
  },
  {
    label: "樓層群組",
    value: "areaEdit",
  },
];

// block
const blockRef = ref<blockRefType>();

// 展開
const expandAttrs = computed(() => expandTableAttrs.value);
const {
  expandTableAttrs,
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

// 客製 button
const customTableButtons = ref([
  {
    label: "選擇樓層",
    icon: mdiHomeFloorNegative1,
    status: "selectFloor",
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
  if (data) {
    handleBlock(btn, data);
  } else {
    handleBlock(btn, dialogAttrs.value.selectArray);
  }
}
// API類別
let API: typeof sDFM | typeof Area;
// 在 block 上的操作
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  handleBlockMixin(btn, data, API, getData);

  console.log("handleBlock", btn.status, data);
  if (
    activeTab.value.value === "sDFMEdit" &&
    dialogAttrs.value.tempData.members
  ) {
    const classLeaderUser = dialogAttrs.value.tempData.members.find(
      (item: { id: string }) =>
        item.id === dialogAttrs.value.tempData.classLeaderUserId
    );
    dialogAttrs.value.tempData.classLeaderUser = classLeaderUser || null;
  }
  updateLatestData(dialogAttrs.value.tempData);

  maskToNumberArrayAndUpdateToModel(
    dialogAttrs.value.tempData.dutyType,
    dutyTypeNum,
    dutyTypeOptions
  );
  console.log("handleBlock", data);

  if (btn.status === "selectFloor") {
    // 選擇樓層
    dialogAttrs.value.visible = true;
    const { cloned } = useCloned(data);
    dialogAttrs.value.tempData = cloned.value;
    dialogAttrs.value.tempData.floor = null;
  }
}
// 在新增/編輯 dialog 上的操作
async function handleDialog(status: string, data: tempDataType) {
  if (activeTab.value.value === "sDFMEdit") {
    data.classLeaderUserId = data.classLeaderUser?.id
      ? data.classLeaderUser.id
      : null;
    if (data.area) {
      data.building = data.area.building;
    } else {
      data.building = buildingStore.buildingData;
    }
  } else if (activeTab.value.value === "areaEdit") {
    data.building = buildingStore.buildingData;
  }

  await handleDialogMixin(status, API, getData, data);
  // 選擇樓層
  if (status === "selectFloor") {
    const { cloned } = useCloned(data);
    const floors = cloned.value.floor;
    floors.forEach((item: { area: tempDataType }) => {
      item.area = data;
      delete item.area.floor;
    });
    const result = (await Floors.apiPatchData(floors)) as typeof AxiosResponse;
    floors.forEach((item: { id: number }) => {
      if (result.data[item.id]) {
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
    hideDialog();
  }
}

// 取得分頁資料

// 搜尋篩選物件 (filters)
const { filters: sDFMFilters } = searchFiltersGenerator(sDFMConfig);
const { filters: areaFilters } = searchFiltersGenerator(areaConfig);

const filters = computed(() => {
  if (activeTab.value.value === "sDFMEdit") return sDFMFilters;
  else if (activeTab.value.value === "areaEdit") {
    return areaFilters;
  }
  return [];
});
// const { filters } = searchFiltersGenerator(sDFMConfig);
async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  console.log("pagination", pagination);
  const payload = useCloned(pagination).cloned.value;
  // 產出 filters 物件 (filtersObject)
  const searchText = pagination.filters.trim();
  console.log("searchText", searchText);
  let filtersObject: FilterColumnCollection[] = [];
  if (activeTab.value.value === "sDFMEdit") {
    payload.buildingId = Bid.value;
    filtersObject = generateFiltersObject(filters.value, searchText, "Group");
    if (dutyTypeNum.value.length) {
      filtersObject.push({
        logical: FilterColumnLogical.And,
        columns: [
          {
            logical: FilterColumnLogical.And,
            columnKey: {
              fieldName: "DutyType",
              typeName: "Group",
            },
            value: dutyTypeNum.value.reduce((acc, current) => acc + current, 0),
          },
        ],
      });
    }
  } else if (activeTab.value.value === "areaEdit") {
    filtersObject = generateFiltersObject(filters.value, searchText, "Area");
  }
  const jsonFilters = JSON.stringify(filtersObject);
  payload.filters = jsonFilters;
  await getDataMixin(API, payload);
  setBlockLoading(blockRef);
}
function init() {
  tabChange(blockTabs[0]);
}
onMounted(() => {
  init();
});

function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log("tabChange", tab);

  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
  blockAttrs.value.blockTitle = tab.value;
  dialogAttrs.value.dialogTitle = tab.label;

  if (activeTab.value.value === "sDFMEdit") {
    API = sDFM;
    nextTick(() => {
      blockAttrs.value.tableConfig = sDFMConfig;
      blockAttrs.value.headerButtons = isCommonCommunityUser.value
        ? []
        : ["add", "deleteMany"];
      blockAttrs.value.tableButtons = isCommonCommunityUser.value
        ? []
        : ["edit", "delete"];

      // 展開
      expandTableAttrs.value.isExpand = true;
      expandTableAttrs.value.expandKey = "members";
      expandTableAttrs.value.expandConfig = sDFMExpandConfig;
    });
  } else if (activeTab.value.value === "areaEdit") {
    API = Area;
    nextTick(() => {
      blockAttrs.value.tableConfig = areaConfig;
      blockAttrs.value.headerButtons = isCommonCommunityUser.value
        ? []
        : ["add", "deleteMany"];
      blockAttrs.value.tableButtons = isCommonCommunityUser.value
        ? []
        : ["edit", "delete"];

      // 展開
      expandTableAttrs.value.isExpand = false;
      expandTableAttrs.value.expandKey = "";
      expandTableAttrs.value.expandConfig = [];
    });
  }
}

async function selectListChange(props: string, tempData: tempDataType) {
  console.log("selectListChange", props);
  if (props === "role") {
    const result = (await Role.apiGetRoles([
      { type: roleType.class, isEmergency: null },
    ])) as typeof AxiosResponse;
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "area") {
    const bid = localStorage.getItem("Bid");
    if (bid) {
      const result = (await Area.apiGetArea(+bid)) as typeof AxiosResponse;
      dialogAttrs.value.selectOption = result.data;
    }
  } else if (props === "members") {
    if (tempData.role?.name) {
      const result = (await AccountSetting.apiGetUsersByRoleName(
        tempData.role.name
      )) as typeof AxiosResponse;
      dialogAttrs.value.selectOption = result.data;
    } else {
      $q.notify({
        type: "negative",
        message: "請先選擇班別",
        position: "top",
      });
      dialogAttrs.value.selectOption = [];
    }
  } else if (props === "classLeaderUser") {
    if (tempData.members) {
      dialogAttrs.value.selectOption = tempData.members;
    } else {
      dialogAttrs.value.selectOption = [];
    }
  } else if (props === "building") {
    const result = (await Building.apiGetAllBuilding()) as typeof AxiosResponse;
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "floor") {
    if (Bid.value) {
      const result = (await Floors.apiGetBuildingFloor(
        Bid.value
      )) as typeof AxiosResponse;
      dialogAttrs.value.selectOption = result.data;
    }
  }
}

watch(
  () => dialogAttrs.value.tempData.classLeaderUser,
  () => {
    if (dialogAttrs.value.tempData.classLeaderUser?.id) {
      dialogAttrs.value.tempData.classLeaderUserId =
        dialogAttrs.value.tempData.classLeaderUser.id;
    }
  },
  {
    deep: true,
  }
);

// 班別模式
const selectAll = ref<string[]>([]);
const dutyTypeNum = ref<number[]>([]);
const dutyTypeOptions = reactive([
  {
    label: "平日",
    value: 1,
  },
  {
    label: "夜間",
    value: 2,
  },
  {
    label: "假日",
    value: 4,
  },
  {
    label: "",
    value: 8,
  },
]);
watch(
  () => dutyTypeNum.value,
  () => {
    if (
      dutyTypeNum.value.includes(1) &&
      dutyTypeNum.value.includes(2) &&
      dutyTypeNum.value.includes(4)
    ) {
      selectAll.value = ["selectAll"];
    } else {
      selectAll.value = [];
    }
  }
);
watch(
  () => dialogAttrs.value.visible,
  (newVal) => {
    if (!newVal) {
      selectAll.value[0] = "selectAll";
      dutyTypeNum.value = dutyTypeOptions.map((item) => item.value);
    }
  }
);

// 把 dutyType 陣列轉成數字
function dutyTypeChange(tempData: tempDataType) {
  tempData.dutyType = numberToBitMask(dutyTypeNum.value);
}
function selectAllCheckbox(tempData: tempDataType) {
  if (selectAll.value[0] === "selectAll") {
    dutyTypeNum.value = dutyTypeOptions.map((item) => item.value);
  } else {
    dutyTypeNum.value = [];
  }
  dutyTypeChange(tempData);
}

function updateLatestData(tempData: tempDataType) {
  if (activeTab.value.value === "sDFMEdit") {
    // 消防編組 - building & Area 二必擇一 (Area 本身就會帶 building)
    if (dialogAttrs.value.tempData.role?.id !== tempData.role?.id) {
      tempData.members = [];
    }
  }
}
</script>
