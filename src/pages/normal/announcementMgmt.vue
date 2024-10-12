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
      公告欄
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
            v-model:filters="filters"
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

            <template #customFilter>
              <template v-if="activeTab.value === 'Removal'">
                <q-card-section class="flex items-center" style="gap: 0.8rem">
                  <div class="text-subtitle1">管委會屆數</div>
                  <q-select
                    style="flex: 1 0 0"
                    clearable
                    multiple
                    use-chips
                    option-value="id"
                    v-model="community"
                    :options="communityOptions"
                  >
                    <template v-slot:selected-item="scope">
                      <q-chip
                        removable
                        @remove="scope.removeAtIndex(scope.index)"
                        :tabindex="scope.tabindex"
                        dense
                      >
                        {{
                          scope.opt.description ||
                          scope.opt.fullname ||
                          scope.opt.label ||
                          scope.opt.name
                        }}
                      </q-chip>
                    </template>
                    <template v-slot:option="scope">
                      <q-item v-bind="scope.itemProps">
                        <q-item-section>
                          <q-item-label>{{
                            scope.opt.description ||
                            scope.opt.label ||
                            scope.opt.name ||
                            scope.opt.fullname
                          }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </template>
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          尚無資料
                        </q-item-section>
                      </q-item>
                    </template>
                  </q-select>
                </q-card-section>

                <q-separator />
              </template>

              <q-card-section class="filter">
                <div class="title">類別</div>
                <div class="options">
                  <q-checkbox
                    v-model="selectAll"
                    val="selectAll"
                    label="全選"
                    @update:model-value="selectAllChange"
                  />
                  <q-checkbox
                    v-for="type in sortTypeOptions"
                    :key="type.val"
                    v-model="sortType"
                    :label="type.label"
                    :val="type.val"
                  />
                </div>
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
    :select-many-disable="disableRoleSelect"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
    <template #custom="{ config, dialogAttrs }">
      <div v-if="config.formType === 'checkboxMany'">
        <span class="text-grey-8 fz-16 q-mr-xs">
          {{ config.label }}
        </span>
        <q-option-group
          :name="config.name"
          v-model="sortNum"
          :options="sortOptions"
          type="checkbox"
          color="primary"
          inline
          @update:model-value="sortChange(dialogAttrs.tempData)"
        />
      </div>
    </template>
  </DialogForm>

  <DialogUpload
    :dialogAttrs="dialogAttrs"
    :setCoverFunc="Board.apiSetCover"
    :updateBlockData="updateDialogUploadData"
    rootPathName="Board"
    @hide="hideDialog"
    v-on="dialogEvent"
  />

  <DialogFilePreview
    v-model="previewCoverModel"
    :image-url="imageUrl"
    :iframeUrl="iframeUrl"
    :downloadUrl="downloadUrl"
  />

  <DialogDataRowPreview
    v-model:visible="previewDataModel"
    :dataLabel="previewDataLabel"
    :dialog-config="announcementConfig"
    :dialog-data="previewDialogData"
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
    :sampleFile="sampleFile"
    :sampleFileText="'公告範例(請先轉成xlsx檔才能匯入).xlsm'"
  />
</template>
<script setup lang="ts">
// api
import Board, {
  BoardNotifyViewModel,
  BoardTypes,
  announcementConfig,
  BoardLabels,
  BoardTypesChangeToCh,
} from "src/api/board";
import Role, { RoleViewModel, roleType } from "src/api/role";
import type { FilterColumn, FilterColumnCollection } from "src/api/api.type";
import Committee from "src/api/managementCommittee";
// utils
import { useCloned } from "@vueuse/core";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type {
  blockRefType,
  tempDataType,
  blockAttrsType,
} from "src/utils/tableMixin";
import {
  maskToNumberArrayAndUpdateToModel,
  numberToBitMask,
} from "src/utils/bitMask";
import useFilePreview from "src/utils/useFilePreview";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
// type
import { FilterColumnLogical, FilterTypes } from "src/api/api.type";
// icon
import { tabPhotoSearch } from "quasar-extras-svg-icons/tabler-icons-v2";
import { antOutlinedFileSearch } from "quasar-extras-svg-icons/ant-design-icons";
import { mdiCheckCircle } from "@quasar/extras/mdi-v6";
import { formatExcelDate } from "src/utils/formatUtils";
import { dataItem } from "src/components/Dialog/DialogImportExcel.vue";
// pinia
import { useUserStore } from "src/stores/user";
const userStore = useUserStore();

const $q = inject("$q") as typeof QVueGlobals;

// tab
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = ref<{ label: BoardLabels; value: string }[]>([
  {
    label: BoardLabels.Announcement,
    value: "Announcement",
  },
  {
    label: BoardLabels.Removal,
    value: "Removal",
  },
]);

// 公告欄 config
// Form Disabled
const disableRoleSelect = ref(false);

// 客製 button
const customTableButtons = ref([
  {
    label: "資料預覽",
    icon: antOutlinedFileSearch,
    status: "previewData",
    isShow: true,
  },
  {
    label: "封面預覽",
    icon: tabPhotoSearch,
    status: "previewCover",
    isShow: true,
  },
]);
// 內容預覽
const previewDataModel = ref(false);
const previewDataLabel = ref("");
const previewDialogData = ref({});
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
const API = Board;
// 在 block 上的操作
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  console.log("handleBlock's payload", { btn, data });

  handleBlockMixin(btn, data, API, getData);

  if (btn.status === "edit") disableRoleSelect.value = true;
  else disableRoleSelect.value = false;

  if (btn.status === "add" || btn.status === "edit") {
    // format 分類
    maskToNumberArrayAndUpdateToModel(
      dialogAttrs.value.tempData.type,
      sortNum,
      sortOptions
    );
    // format 身分
    if (btn.status === "edit" && data && data.boardNotifies) {
      dialogAttrs.value.tempData.boardNotifies =
        dialogAttrs.value.tempData.boardNotifies.map(
          (item: {
            role: RoleViewModel & { notify: BoardNotifyViewModel["notify"] };
            notify: BoardNotifyViewModel["notify"];
          }) => {
            item.role.notify = item.notify;
            return item.role;
          }
        );
    }
    if (dialogAttrs.value.tempData.end === "9999-12-31") {
      delete dialogAttrs.value.tempData.end;
    }
  } else if (btn.status === "previewData") {
    // 更新資料到 previewDataDialog
    previewDataLabel.value = data.title;
    previewDialogData.value = data;
    previewDataModel.value = true;
  } else if (btn.status === "previewCover") {
    if (data && data.frontCoverFileId && data.frontCoverFilePath) {
      setFilePreview(data.frontCoverFilePath, data.frontCoverFileId);
    } else {
      $q.notify({
        type: "warning",
        message: "請先設定封面",
        position: "top",
      });
    }
  } else if (btn.status === "exportExcel") {
    $q.loading.show({
      message: "資料加載中...",
      spinnerColor: "warning",
      messageColor: "warning",
    });
    const result = (await Board.apiGetData({
      filters: "",
      page: 0,
      rowsPerPage: 0,
      tab:
        activeTab.value.value === "Announcement" ? "announcement" : "removal",
    })) as typeof AxiosResponse;

    $q.loading.hide();
    if (result.data.rows) {
      fullBlockDataForExcel.value = formatBlockData(result.data.rows);
    }
  }
}
// 在新增/編輯 dialog 上的操作
async function handleDialog(status: string, data: tempDataType) {
  console.log("status", status);
  if (status === "add" || status === "edit") {
    if (status === "add" && data.boardNotifies) {
      data.boardNotifies = data.boardNotifies?.map(
        (item: BoardNotifyViewModel) => {
          return { role: item, notify: null };
        }
      );
    } else if (status === "edit" && data.boardNotifies) {
      data.boardNotifies = data.boardNotifies?.map(
        (item: BoardNotifyViewModel) => {
          return { role: item, notify: item.notify };
        }
      );
    }
    if (!data.type) data.type = BoardTypes.Normal; // 預設為一般公告
    if (!data.top) data.top = false;
    if (!data.marqueeEnabled) data.marqueeEnabled = false;
    if (!data.start) delete data.start;
    if (!data.end) delete data.end;
  }
  await handleDialogMixin(status, API, getData, data);
  if (status === "edit" && data && data.boardNotifies) {
    data.boardNotifies = data.boardNotifies.map(
      (item: {
        role: RoleViewModel & { notify: BoardNotifyViewModel["notify"] };
        notify: BoardNotifyViewModel["notify"];
      }) => {
        item.role.notify = item.notify;
        return item.role;
      }
    );
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
  console.log("pagination", pagination);
  const blockPagination = Array.isArray(blockRef?.value)
    ? blockRef?.value[0]?.pagination
    : blockRef?.value?.pagination;

  if (activeTab.value.value === "Announcement") {
    blockPagination.tab = "announcement";
  } else blockPagination.tab = "removal";

  // 產出 filters 物件 (filtersObject)
  const searchText = blockPagination.filters;
  console.log("searchText", searchText);
  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    filters,
    searchText,
    "Board"
  );
  // 產出類別物件並加進 filtersObject
  const sorTypeColumn = generateFilterColumnForSortType(sortType.value);
  if (sorTypeColumn) filtersObject.push(sorTypeColumn);
  // 下架區且有選擇管委會屆數 => 根據屆數產出日期搜尋物件並加入 or 取代 filtersObject 中的日期搜尋物件
  if (activeTab.value.value === "Removal" && community.value?.length) {
    // 找到 filtersObject 中的日期搜尋物件
    const dateObj = filtersObject.findIndex((filterColumnCollection) =>
      filterColumnCollection.columns.some(
        (filterColumn) =>
          filterColumn.columnKey.fieldName === "Start" ||
          filterColumn.columnKey.fieldName === "End"
      )
    );
    // 從 filtersObject 中移除 dateObj
    if (dateObj) filtersObject.splice(dateObj, 1);

    // 用管委會屆數產出新的日期搜尋物件
    const dateRangesArray = community.value.map((item) => item.val);
    const dateRange = findEarliestFromAndLatestTo(dateRangesArray);
    const newDateObj: FilterColumn[] = [];
    newDateObj.push(createFilterObject("Start", dateRange));
    newDateObj.push(createFilterObject("End", dateRange));
    filtersObject.push({
      logical: FilterColumnLogical.And,
      columns: newDateObj,
    });
  }
  console.log("nowwww filtersObject", filtersObject);
  const jsonFilters = JSON.stringify(filtersObject);
  const payload = { ...blockPagination, filters: jsonFilters };

  await getDataMixin(API, payload);

  blockAttrs.value.blockData.forEach((item) => {
    if (item.top) item.labelContent = "置頂";
  });
  setDataForDataConfig(blockAttrs.value.blockData);
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
const route = useRoute();
const router = useRouter();
onMounted(async () => {
  const { query } = route;
  if (query && query.label && query.value) {
    tabChange(query as { label: string; value: string });
  } else tabChange();
});

function tabChange(tab: { label: string; value: string } = blockTabs.value[0]) {
  console.log("tabChange", tab);
  if (activeTab.value.label === tab.label) return;
  blockAttrs.value.blockData.length = 0;

  const { label, value } = tab;
  activeTab.value.label = label;
  activeTab.value.value = value;
  blockAttrs.value.blockTitle = value;
  dialogAttrs.value.dialogTitle = label;
  // 新增 tab 資訊到 query
  router.replace({ query: { label, value } });

  nextTick(() => {
    blockAttrs.value.tableConfig = announcementConfig;

    if (userStore.isManagerGroup) {
      blockAttrs.value.tableButtons = ["upload", "edit", "delete"];
      blockAttrs.value.headerButtons = [
        "exportExcel",
        "importExcel",
        "add",
        "deleteMany",
      ];
    } else {
      blockAttrs.value.tableButtons = [];
      blockAttrs.value.headerButtons = [];
    }
  });
}

async function selectListChange(props: string) {
  console.log("selectListChange", props);
  if (props === "boardNotifies") {
    const payload = [
      { type: roleType.role, isEmergency: null },
      { type: roleType.class, isEmergency: null },
    ];
    const result = (await Role.apiGetRoles(payload)) as typeof AxiosResponse;
    if (result.data) {
      dialogAttrs.value.selectOption = result.data;
    }
  }
}

// 分類
const sortNum = ref<number[]>([]);
const sortOptions = reactive<{ label: BoardLabels; value: BoardTypes }[]>([]);
for (const key in BoardLabels) {
  if (key === "Announcement" || key === "Removal") continue;
  // 產出分類選項
  sortOptions.push({
    label: BoardLabels[key as keyof typeof BoardLabels],
    value: BoardTypes[key as keyof typeof BoardTypes],
  });
}

function sortChange(tempData: tempDataType) {
  console.log("tempData", tempData);
  console.log("sortNum.value", sortNum.value);
  tempData.type = numberToBitMask(sortNum.value);
}

// 進階搜尋
const { filters } = searchFiltersGenerator(announcementConfig);

// 類別
const sortType = ref<string[]>([]);
const sortTypeOptions = reactive([
  { label: "相關下載", val: "Download" },
  { label: "歷屆名冊", val: "Past" },
  { label: "管委會公告", val: "Community" },
  { label: "災害注意宣導事項", val: "Matter" },
  { label: "一般公告", val: "Normal" },
]);

const selectAll = ref(false);
onMounted(() => {
  selectAll.value = true;
  sortType.value = sortTypeOptions.map((item) => item.val);
});
watch(sortType, (val) => {
  if (val.length && val.length === sortTypeOptions.length) {
    selectAll.value = true;
  } else selectAll.value = false;
});
function selectAllChange(val: boolean) {
  if (val) {
    sortType.value = sortTypeOptions.map((item) => item.val);
  } else {
    sortType.value.length = 0;
  }
}

// 產出類別的 type 值
function generateFilterColumnForSortType(
  sortType: string[]
): FilterColumnCollection {
  let totalValue = 0;

  sortType.forEach((type) => {
    const enumValue = BoardTypes[type as keyof typeof BoardTypes];
    if (enumValue !== undefined) totalValue += enumValue;
  });

  const filterColumn: FilterColumn = {
    logical: FilterColumnLogical.And,
    columnKey: { fieldName: "Type", typeName: "Board" },
    value: totalValue,
  };

  const filterColumnCollection: FilterColumnCollection = {
    logical: FilterColumnLogical.And,
    columns: [filterColumn],
  };

  return filterColumnCollection;
}

// 管委會屆數搜尋
interface Community {
  label: string;
  val: { from: string; to: string };
}
const community = ref<Community[] | null>([]);
const communityOptions = ref<Community[]>([]);

onMounted(async () => {
  // 獲取管委會下拉選單
  const committeeData = await Committee.apiCommitteeSearch();
  if (committeeData.data) {
    communityOptions.value = committeeData.data.map((item) => {
      return {
        label: `第 ${item.number} 屆`,
        val: { from: item.start, to: item.end },
      };
    });
  }
});
// 獲取最早的 from 跟最晚的 to
type DateRange = {
  from: string;
  to: string;
};
function findEarliestFromAndLatestTo(dateRanges: DateRange[]): DateRange {
  if (dateRanges.length === 0) {
    throw new Error("The array is empty");
  }

  let earliestFrom = dateRanges[0].from;
  let latestTo = dateRanges[0].to;

  for (const range of dateRanges) {
    if (range.from < earliestFrom) {
      earliestFrom = range.from;
    }
    if (range.to > latestTo) {
      latestTo = range.to;
    }
  }

  return { from: earliestFrom, to: latestTo };
}
function createFilterObject(fieldName: string, dateRange: DateRange) {
  const beginValue = new Date(dateRange.from);
  const endValue = new Date(dateRange.to);

  return {
    logical: FilterColumnLogical.And,
    columnKey: {
      fieldName,
      typeName: "Board",
    },
    beginValue,
    endValue,
  };
}

// Excel
const tableConfigForExcel = ref<blockAttrsType["tableConfig"]>([]);
const blockDataForExcel = ref<blockAttrsType["blockData"]>([]);
const fullBlockDataForExcel = ref<blockAttrsType["blockData"]>([]);
const rowsChKeyToEngNameObject = reactive<{ [key: string]: string }>({});
async function setDataForDataConfig(blockData: blockAttrsType["blockData"]) {
  const newBlockData = useCloned(blockData).cloned.value;
  tableConfigForExcel.value = announcementConfig;
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
    item.top = item.top ? "是" : "否";
    item.marqueeEnabled = item.marqueeEnabled ? "是" : "否";
    item.type = BoardTypesChangeToCh(item.type);
    item.boardNotifies = item.boardNotifies
      .map((boardNotify: BoardNotifyViewModel) => boardNotify.role.description)
      .join("、");
    return item;
  });
}
// Excel 匯入 => 多筆新增
const dialogImportExcelRef = ref();

const sampleFile = computed(() => {
  return "/excelSample/公告範例.xlsm";
});

function formatImportData(data: dataItem[]) {
  const clonedData = useCloned(data).cloned.value;
  clonedData.map((item) => {
    for (const key in item) {
      const newKey = rowsChKeyToEngNameObject[key];
      if (newKey) {
        if (
          newKey === "type" ||
          newKey === "top" ||
          newKey === "marqueeEnabled"
        ) {
          if (item[key]) {
            item[newKey as keyof typeof item] = JSON.parse(item[key]);
          }
        } else if (newKey === "boardNotifies") {
          item[newKey] = JSON.parse(item[key]).map(
            (item: BoardNotifyViewModel) => {
              return { role: item, notify: null };
            }
          );
        } else {
          item[newKey as keyof typeof item] = item[key];
        }
      }
      delete item[key];
    }
    item.start = formatExcelDate(item.start);
    item.end = formatExcelDate(item.end);
    return item;
  });
  return clonedData;
}
async function saveImportData(formattedTableData: dataItem[]) {
  await handleDialogMixin("add", API, getData, formattedTableData);
  dialogImportExcelRef.value.hide();
}
</script>
