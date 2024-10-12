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
      消防安全指南
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
          v-for="tab in blockTabs"
          :key="tab.value"
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
              ? 'calc(100% - 140px)'
              : 'calc(100% - 50px)',
        }"
        animated
        swipeable
        keep-alive
      >
        <q-tab-panel name="FireProtectionPlan">
          <div class="row q-col-gutter-xl q-pa-sm">
            <div class="col-12 col-md-6">
              <!-- 消防防護計畫書下載 -->
              <div class="flex items-center q-mb-md q-pr-md">
                <div class="text-h6 text-bold">消防防護計畫書</div>
                <q-btn
                  @click.stop="
                    downloadImage(fireProtectionPlanUrl, '消防防護計畫書')
                  "
                  :icon="mdiDownload"
                  color="white"
                  text-color="primary"
                  :disable="!fireProtectionPlanUrl"
                  class="q-ml-md"
                >
                  <q-tooltip
                    class="text-body2"
                    transition-show="scale"
                    transition-hide="scale"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[10, 10]"
                  >
                    下載計劃書
                  </q-tooltip>
                </q-btn>
              </div>

              <div class="cursor-pointer">
                <p
                  class="flex items-center text-h6 text-grey"
                  v-if="!fireProtectionPlanUrl"
                >
                  尚未設定消防防護計畫書
                </p>
                <q-img
                  v-else
                  class="q-mb-md"
                  :src="fireProtectionPlanUrl"
                  @click="openDialog(fireProtectionPlanUrl)"
                />
              </div>
            </div>
            <div class="col-12 col-md-6">
              <!-- 避難引導圖 -->
              <div class="q-mx-md">
                <div class="flex items-center q-mb-md">
                  <AllFloors
                    dense
                    @handleSelect="handleSelect"
                    @reset-data="floorPlanImage = ''"
                    evacuationGuidePlan
                    :style="{
                      width: $q.screen.xs || $q.screen.sm ? '30%' : '20%',
                    }"
                  />

                  <div class="text-h6 text-bold">避難引導圖</div>
                  <q-btn
                    @click.stop="downloadImage(floorPlanImage, '避難引導圖')"
                    :icon="mdiDownload"
                    color="white"
                    text-color="primary"
                    :disable="!floorPlanImage"
                    class="q-ml-md"
                  >
                    <q-tooltip
                      class="text-body2"
                      transition-show="scale"
                      transition-hide="scale"
                      anchor="top middle"
                      self="bottom middle"
                      :offset="[10, 10]"
                    >
                      下載避難引導圖
                    </q-tooltip>
                  </q-btn>
                </div>

                <div class="cursor-pointer full-height">
                  <p
                    v-if="!floorPlanImage"
                    class="flex items-center full-height text-h6 text-grey"
                  >
                    請先至該樓層設定避難引導圖
                  </p>

                  <q-img
                    v-else
                    :src="floorPlanImage"
                    @click="openDialog(floorPlanImage)"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel name="sDFMList">
          <!-- 各樓層編組名冊 -->
          <div class="row q-col-gutter-lg q-pa-sm">
            <div class="col-12 col-md-6">
              <!-- 樓層群組選擇 -->
              <div>
                <q-select
                  style="width: 50%"
                  v-model="currentFloorGroup"
                  :options="floorGroupOptions"
                  emit-value
                  map-options
                  class="q-mr-md"
                >
                  <template v-slot:selected-item="scope">
                    <span>{{ scope.opt.name }}</span>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>

                <q-table
                  class="q-mt-lg"
                  :rows="peopleList"
                  :columns="(tableConfig as QTableProps['columns'])"
                  flat
                  :grid="$q.screen.xs"
                  bordered
                  binary-state-sort
                  row-key="id"
                  hide-bottom
                >
                  <template v-slot:item="props">
                    <div
                      class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 fit"
                    >
                      <q-card
                        bordered
                        flat
                        class="q-mb-md"
                        :class="
                          props.selected
                            ? $q.dark.isActive
                              ? 'bg-grey-9'
                              : 'bg-grey-2'
                            : ''
                        "
                      >
                        <q-list dense>
                          <q-item v-for="col in props.cols" :key="col.label">
                            <q-item-section avatar style="min-width: 72px">
                              {{ col.label }}
                            </q-item-section>
                            <q-item-section>{{ col.value }} </q-item-section>
                          </q-item>
                        </q-list>
                      </q-card>
                    </div>
                  </template>
                </q-table>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="flex items-center">
                <div class="text-h6 text-bold">組織架構圖</div>
                <q-btn
                  @click.stop="downloadImage(organizationFileUrl, '組織架構圖')"
                  :icon="mdiDownload"
                  color="white"
                  text-color="primary"
                  :disable="!organizationFileUrl"
                  class="q-ml-md"
                >
                  <q-tooltip
                    class="text-body2"
                    transition-show="scale"
                    transition-hide="scale"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[10, 10]"
                  >
                    下載組織架構圖
                  </q-tooltip>
                </q-btn>
              </div>
              <div
                class="flex full-height text-h6 text-grey"
                v-if="!organizationFileUrl"
              >
                尚未設定組織架構圖
              </div>
              <div class="flex items-center" v-else>
                <q-img
                  :src="organizationFileUrl"
                  @click="openDialog(organizationFileUrl)"
                />
              </div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="DisasterPrecautions">
          <!-- 災害注意宣導事項 -->
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
          </BlockComponent>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>

  <q-dialog v-model="dialogVisible">
    <q-card
      :style="
        $q.screen.xs || $q.screen.sm
          ? 'width:100%'
          : 'min-width: clamp(800px, 75vw, 1200px); height: calc(100vh - 36px); '
      "
    >
      <q-card-section>
        <q-img
          img-class="cursor-pointer"
          height="100%"
          fit="cover"
          position="center"
          spinner-color="grey-5"
          :src="dialogFileUrl"
          @click="dialogVisible = true"
        >
        </q-img>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- 災害注意宣導事項用 -->
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
</template>
<script setup lang="ts">
// api
import Area from "src/api/area";
import sDFM, { GroupViewModel } from "src/api/sDFM";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
// api
import Board, {
  BoardNotifyViewModel,
  BoardTypes,
  announcementConfig,
} from "src/api/board";
// type
import type { blockRefType, tempDataType } from "src/utils/tableMixin";
import type { QTableProps } from "quasar";
// icon
import { mdiCheckCircle, mdiDownload } from "@quasar/extras/mdi-v6";
import { tabPhotoSearch } from "quasar-extras-svg-icons/tabler-icons-v2";
import { antOutlinedFileSearch } from "quasar-extras-svg-icons/ant-design-icons";
// utils
import { useCloned } from "@vueuse/core";
import useFilePreview from "src/utils/useFilePreview";
// pinia store
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
import fileRead from "src/utils/fileRead";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
import {
  FilterColumn,
  FilterColumnCollection,
  FilterColumnLogical,
} from "src/api/api.type";

const $q = inject("$q") as typeof QVueGlobals;
const buildingStore = useBuildingStore();

const { Bid, buildingData } = storeToRefs(buildingStore);

const { getFile } = fileRead();
const fireProtectionPlanUrl = ref("");
const organizationFileUrl = ref("");
const dialogFileUrl = ref("");

const dialogVisible = ref(false);

function openDialog(url: string) {
  dialogFileUrl.value = url;
  dialogVisible.value = true;
}

// tab
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "消防計畫書與避引圖",
    value: "FireProtectionPlan",
  },
  {
    label: "編組名冊",
    value: "sDFMList",
  },
  // {
  //   label: "避難引導圖",
  //   value: "Evacuation",
  // },
  {
    label: "災害注意宣導事項",
    value: "DisasterPrecautions",
  },
];

async function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log("tabChange", tab);

  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;

  if (tab.value === "FireProtectionPlan") {
    // 獲取消防防護計畫書
    fireProtectionPlanUrl.value = ""; // TODO: 不先清空 console 會有錯誤
    if (!buildingData.value?.protectionFileId) return;
    const url = await getFile(null, buildingData.value.protectionFileId);
    if (url && url.length) fireProtectionPlanUrl.value = url;
  } else if (tab.value === "sDFMList") {
    // 獲取組織架構圖
    organizationFileUrl.value = ""; // TODO: 不先清空 console 會有錯誤，待確認為什麼
    if (!buildingData.value?.organizationFileId) return;
    const url = await getFile(null, buildingData.value.organizationFileId);
    if (url && url.length) organizationFileUrl.value = url;
  } else if (tab.value === "DisasterPrecautions") {
    nextTick(() => {
      blockAttrs.value.tableConfig = announcementConfig;
      blockAttrs.value.headerButtons = [];
      blockAttrs.value.tableButtons = [];
    });
  }
}

function downloadImage(src: string, fireName: string) {
  console.log("src", src);
  const a = document.createElement("a");
  a.href = src;
  a.download = fireName + ".png";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function init() {
  tabChange(blockTabs[0]);
}

onMounted(() => {
  init();
});

const tableConfig = ref([
  {
    label: "編組名稱",
    name: "name",
    field: "name",
    align: "left",
  },
  {
    label: "編組人員",
    name: "members",
    field: (row: GroupViewModel) => formatMembers(row),
    align: "left",
  },
]);

function formatMembers(row: GroupViewModel) {
  const { classLeaderUserId } = row;
  return row.members
    .map((item) =>
      classLeaderUserId === item.id ? item.fullname + " (班長)" : item.fullname
    )
    .join("、");
}
// const blockData = ref([]);

const peopleList = ref<GroupViewModel[]>([]);

// 樓層群組選擇
const currentFloorGroup = ref<tempDataType>();
const floorGroupOptions = ref<tempDataType[]>([]);
// const hasSelectedValue = computed(() => currentFloorGroup.value !== undefined);

watch(
  () => Bid.value,
  async (val) => {
    if (val) {
      await getAreaData(val);
      currentFloorGroup.value = floorGroupOptions.value[0];
    }
  },
  { immediate: true }
);
watch(
  () => currentFloorGroup.value,
  async () => {
    if (currentFloorGroup.value) {
      await getSDFMData();
    }
  }
);

async function getAreaData(bid: number) {
  const result = (await Area.apiGetArea(bid)) as typeof AxiosResponse;
  floorGroupOptions.value = result.data;
}
async function getSDFMData() {
  const areaGroupResult = (await sDFM.apiGetGroupByArea(
    currentFloorGroup.value?.id
  )) as typeof AxiosResponse;

  const allFloorGroup = (await sDFM.apiGetGroupByArea(
    null,
    Bid.value
  )) as typeof AxiosResponse;
  if (areaGroupResult.data && allFloorGroup.data) {
    peopleList.value = [...areaGroupResult.data, ...allFloorGroup.data];
  }
  console.log("now peopleList.value", peopleList.value);
  // peopleList.value.forEach(async (ppl: tempDataType) => {
  //   if (ppl.mugShotFileId) {
  //     ppl.mugShotUrl = await getFile(null, ppl.mugShotFileId);
  //   }
  // });
  // const tdContent = getTdContent(peopleList.value);
  // tableContent = getTable(tableTitle, tdContent);
}

// 避難引導圖
const floorPlanImage = ref();

function handleSelect(
  floorData: { id: string; floorPlanID: number },
  url?: string
) {
  if (url) floorPlanImage.value = url;
}

// 災害注意宣導事項
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

const blockEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getData,
  };
});

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
enum BoardLabels {
  "Announcement" = "公告區",
  "Removal" = "下架區",
  "Download" = "相關下載",
  "Past" = "歷屆名冊",
  "Community" = "管委會公告",
  "Matter" = "災害注意宣導事項",
}
const API = Board;
// 在 block 上的操作
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  console.log("handleBlock's payload", { btn, data });

  handleBlockMixin(btn, data, API, getData);

  if (btn.status === "previewData") {
    const { value } = useCloned(data).cloned;
    // format data
    const { top, marqueeEnabled, type, boardNotifies } = value;
    value.top = top ? "是" : "否";
    value.marqueeEnabled = marqueeEnabled ? "是" : "否";
    const typeEnName = BoardTypes[type as keyof typeof BoardTypes];
    if (typeEnName) {
      value.sort =
        BoardLabels[typeEnName as unknown as keyof typeof BoardLabels];
    }
    if (boardNotifies && boardNotifies.length > 0) {
      value.role = boardNotifies
        .map((boardNotify: BoardNotifyViewModel) => boardNotify.role.name)
        .join("、");
    }

    // 更新資料到 previewDataDialog
    previewDataLabel.value = value.title;
    previewDialogData.value = value;
    previewDataModel.value = true;
  } else if (btn.status === "previewCover") {
    if (data && data.frontCoverFileId && data.frontCoverFilePath) {
      setFilePreview(data.frontCoverFilePath, data.frontCoverFileId);
    } else {
      $q.notify({
        type: "warning",
        message: "尚未設定封面",
        position: "top",
      });
    }
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

  blockPagination.tab = "announcement";

  // 產出 filters 物件 (filtersObject)
  const searchText = blockPagination.filters;
  console.log("searchText", searchText);
  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    filters,
    searchText,
    "Board"
  );
  // 把災害注意宣導事項物件加進 filtersObject
  filtersObject.push(matterColumn);

  const jsonFilters = JSON.stringify(filtersObject);
  const payload = { ...blockPagination, filters: jsonFilters };

  await getDataMixin(API, payload);

  blockAttrs.value.blockData.forEach((item) => {
    if (item.top) item.labelContent = "置頂";
  });

  setBlockLoading(blockRef);
}
// 進階搜尋
const { filters } = searchFiltersGenerator(announcementConfig);
// 災害注意宣導事項物件
const matterColumn = {
  logical: FilterColumnLogical.And,
  columns: [
    {
      logical: FilterColumnLogical.And,
      columnKey: { fieldName: "Type", typeName: "Board" },
      value: BoardTypes.Matter,
    },
  ],
};
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
</script>

<style lang="scss">
.hideLabel {
  .q-field__label {
    display: none !important;
  }
  .q-field__native {
    transform: translateY(-7px);
  }
}

// .sDFMList {
//   display: grid;
//   grid-template-columns: 5fr 4fr;
//   gap: 2.4rem;
// }

// img default style
img {
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  font-style: italic;
  background-repeat: no-repeat;
  background-size: center;
  shape-margin: 0.75rem;
}
</style>
