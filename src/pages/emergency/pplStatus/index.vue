<template>
  <q-page class="q-pa-md flex">
    <div v-if="$q.screen.xs || $q.screen.sm" class="text-h5 text-bold q-mb-md">
      人員名冊
    </div>
    <div
      class="flex column flex-grow-1 full-width"
      :class="[
        {
          'q-pa-md bg-white border-1 rounded-lg': $q.screen.xs || $q.screen.sm,
        },
      ]"
    >
      <div class="row q-col-gutter-md q-mb-lg">
        <div
          v-for="(block, index) in PplTypeBlock"
          :key="index"
          :class="
            $q.screen.xs || $q.screen.sm
              ? (block.grid === '2' && index !== PplTypeBlock.length - 1) ||
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
                  :class="$q.screen.xs || $q.screen.sm ? 'fz-16' : 'fz-20'"
                >
                  <div class="flex flex-center q-mb-md">
                    <q-icon
                      v-if="
                        block.color === 'red' &&
                        isBegin &&
                        !$q.screen.xs &&
                        !$q.screen.sm
                      "
                      :name="fasTriangleExclamation"
                      size="lg"
                      class="q-mr-sm"
                      :class="{
                        bgRedAnimation: block.color === 'red' && isBegin,
                      }"
                    />
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
          <!-- <q-card v-else class="full-height" style="background-color: #f3eee7">
            <q-card-section class="q-pb-none">
              <div class="text-h6 text-bold text-center">
                {{ block.title }}
                <q-separator class="q-ma-xs" />
              </div>
            </q-card-section>

            <q-card-section horizontal>
              <q-card-section
                horizontal
                class="full-width text-center cursor-pointer"
                v-for="(layer, index) in block.layers"
                :key="index"
              >
                <q-card-section
                  class="full-width"
                  :class="[
                    { 'no-pointer-events': layer === pplBlock },
                    { 'q-pa-sm': $q.screen.xs || $q.screen.sm },
                  ]"
                >
                  <div
                    class="flex column justify-between full-height q-pa-xs"
                    @click="getPplBlockData(layer)"
                    :class="{
                      active: layer === pplBlock,
                    }"
                  >
                    <div class="text-bold" style="font-size: 16px">
                      <q-icon
                        v-if="
                          layer === pplBlock && !$q.screen.xs && !$q.screen.sm
                        "
                        :name="mdiAlert "
                        :color="layer.color"
                        size="sm"
                        class="q-mr-sm"
                      ></q-icon>
                      <span
                        class="text-bold"
                        style="font-size: 18px"
                        :class="`text-${layer.color}`"
                      >
                        {{ layer.title }}</span
                      >
                    </div>
                    <div
                      class="text-bold"
                      style="font-size: 24px"
                      :style="{ color: block.color }"
                      :class="`text-${layer.color || 'dark'}`"
                    >
                      {{ layer.pplNum }}
                    </div>
                  </div>
                </q-card-section>
                <q-separator
                  vertical
                  inset
                  v-if="index !== block.layers.length - 1"
                />
              </q-card-section>
            </q-card-section>
          </q-card> -->
        </div>
      </div>
      <q-card
        :style="
          $q.screen.xs || $q.screen.sm
            ? 'height: calc(100vh - 255px)'
            : 'flex-grow:1'
        "
        class="q-pa-md"
      >
        <BlockComponent
          ref="blockRef"
          v-model:filters="filters"
          :blockAttrs="blockAttrs"
          v-on="blockEvent"
          :custom-height="'calc(100% - 30px)'"
        >
          <template #customBlockField="{ data, config }">
            <div v-if="config.name === 'fullname'">
              <span
                class="q-mr-sm text-bold text-primary cursor-pointer"
                @click="openDialog(data)"
              >
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
          <template #customHeaderButtons>
            <q-btn
              color="white"
              text-color="primary"
              icon="print"
              @click.prevent="openPrintDialogVisible = true"
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
          </template>
        </BlockComponent>
      </q-card>
    </div>
  </q-page>
  <!-- 列印 dialog -->
  <q-dialog v-model="openPrintDialogVisible">
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%:' : 'width: 20%'"
    >
      <q-toolbar>
        <q-toolbar-title>
          <div class="text-h6 text-bold">人員名冊列印</div></q-toolbar-title
        >

        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-card-section class="q-pt-none">
        請選擇人員名冊之列印範圍。
      </q-card-section>
      <q-card-actions align="center" class="q-pa-lg">
        <q-btn
          outline
          label="列印本頁"
          color="primary"
          v-close-popup
          @click="choosePrintRange('current')"
        />
        <q-btn
          label="列印全部"
          color="primary"
          v-close-popup
          @click="choosePrintRange('all')"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <DialogDataRowPreview
    v-model:visible="previewDataModel"
    :dataLabel="previewDataLabel"
    :dialog-config="pplTableConfig"
    :dialog-data="previewDialogData"
  />
</template>

<script setup lang="ts">
// util
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type { blockRefType } from "src/utils/tableMixin";
import FileReadMixin from "src/utils/fileRead";
import { useRafFn, useCloned } from "@vueuse/core";
import { print, getTable, tdContent } from "src/utils/usePrint";
import { birthdayFormatAge } from "src/utils/formatUtils";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
import { FilterColumnCollection } from "src/api/api.type";

// type
import { FireStatus } from "src/pages/emergency/pplStatus/index.type";
// api
import FireCheck, { UserAccountAcks, pplTableConfig } from "src/api/fireCheck";

// pinia store
import { useSignalRStore } from "src/stores/signalR";
import { storeToRefs } from "pinia";

const signalRStore = useSignalRStore();
const { fireWorkflowId, broadStatistic, isBegin } = storeToRefs(signalRStore);
// assets
import mugShotUrl from "src/assets/image/mugShotPlaceHolder.png";

// icon
import { mdiWheelchair } from "@quasar/extras/mdi-v7";
import { fasTriangleExclamation } from "@quasar/extras/fontawesome-v6";

const $q = inject("$q") as typeof QVueGlobals;

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
  // {
  //   title: "已接收訊息",
  //   grid: "6",
  //   hasLayer: true,
  //   layers: [
  //     {
  //       title: "未避難完成",
  //       value: "NotCompleted",
  //       pplNum: 0,
  //       grid: "6",
  //       color: "negative",
  //       pplList: [],
  //     },
  //     {
  //       title: "避難完成",
  //       value: "Completed",
  //       color: "positive",
  //       pplNum: 0,
  //       grid: "6",
  //       pplList: [],
  //     },
  //     {
  //       title: "不在現場",
  //       value: "NotThere",
  //       color: "primary",
  //       pplNum: 0,
  //       grid: "6",
  //       pplList: [],
  //     },
  //     {
  //       title: "總計",
  //       value: "TotalReceived",
  //       pplNum: 0,
  //       grid: "6",
  //     },
  //   ],
  // },
  {
    title: "請求協助",
    value: "Ask",
    pplNum: 0,
    grid: "2",
    color: "red",
  },
]);

// 上半部的人數顯示
const pplBlock = ref();
const { getFile } = FileReadMixin();
watch(
  () => broadStatistic.value,
  async (newVal) => {
    console.log("broadStatistic", newVal);
    PplTypeBlock.forEach((item) => {
      if (item.value) {
        if (newVal[item.value] !== undefined) {
          useRafFn(() => {
            item.pplNum = newVal[item.value];
          });
        }
      }
      // else {
      //   item.layers?.forEach((layer) => {
      //     if (newVal[layer.value] !== undefined) {
      //       useRafFn(() => {
      //         layer.pplNum = newVal[layer.value];
      //       });
      //     }
      //   });
      // }
    });
  },
  {
    deep: true,
  }
);

onMounted(async () => {
  blockAttrs.value.tableConfig = pplTableConfig;
  blockAttrs.value.headerButtons = [];
  blockAttrs.value.tableButtons = [];
});

async function getUpperPplData() {
  if (fireWorkflowId.value) {
    const result = (await FireCheck.apiGetFireStatus(
      fireWorkflowId.value
    )) as typeof AxiosResponse;
    PplTypeBlock.forEach((item) => {
      if (item.value) {
        useRafFn(() => {
          if (item.pplNum < result.data[item.value]) {
            item.pplNum += 1;
          }
        });
      }
      // else {
      //   item.layers?.forEach((layer) => {
      //     useRafFn(() => {
      //       if (layer.pplNum < result.data[layer.value]) {
      //         layer.pplNum += 1;
      //       }
      //     });
      //   });
      // }
    });
    console.log("PplTypeBlock", PplTypeBlock);
  }
}
export interface pplBlockType {
  title: string;
  grid: string;
  value?: string;
  pplNum?: number;
  color?: string;
  hasLayer?: boolean;
  layers?: object[];
}

let tableContent = "";
function getPplBlockData(block: pplBlockType) {
  if (block?.value) {
    pplBlock.value = block;
  }
  getData();
}

const { filters } = searchFiltersGenerator(pplTableConfig);
async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  const payload = useCloned(pagination).cloned.value;
  // 產出 filters 物件 (filtersObject)
  const searchText = pagination.filters.trim();
  console.log("searchText", searchText);

  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    filters,
    searchText,
    "Fire"
  );

  const jsonFilters = JSON.stringify(filtersObject);
  payload.filters = jsonFilters;
  if (pplBlock.value && fireWorkflowId.value) {
    let usersData: UserAccountAcks["userAccount"][] = [];
    let tdContent: tdContent[] = [];

    const result = (await FireCheck.apiGetFireUsers(
      fireWorkflowId.value,
      FireStatus[pplBlock.value.value as keyof typeof FireStatus],
      payload
    )) as typeof AxiosResponse;

    result.data.rows.forEach(async (data: UserAccountAcks) => {
      data.userAccount.messages = data.messages;
      data.userAccount.mugShotUrl =
        (await getUserPhoto(Number(data.userAccount.mugShotFileId) || 0)) || "";
    });

    usersData = result.data.rows.map(
      (item: UserAccountAcks) => item.userAccount
    );

    if (pagination.rowsPerPage !== 0 && usersData) {
      blockAttrs.value.blockData = usersData;
      blockAttrs.value.totalNum = result.data.rowsNumber;
    }
    setTimeout(() => {
      if (pagination.rowsPerPage !== 0) {
        tdContent = getTdContent(
          blockAttrs.value.blockData as UserAccountAcks["userAccount"][]
        );
      } else {
        tdContent = getTdContent(usersData);
      }
      tableContent = getTable(tableTitle, tdContent);
    }, 1000);
  }
  setBlockLoading(blockRef);
}
watch(
  () => fireWorkflowId.value,
  async () => {
    await getUpperPplData();
    if (pplBlock.value) {
      getPplBlockData(pplBlock.value);
    } else {
      getPplBlockData(PplTypeBlock[0]);
    }
  },
  {
    immediate: true,
  }
);

async function getUserPhoto(id: number) {
  return await getFile(null, id);
}

// block
const blockRef = ref<blockRefType>();

const { blockAttrs } = tableMixin(blockRef as Ref<blockRefType>);
const blockEvent = computed(() => {
  return {
    changeBlockData: getData,
  };
});

// 列印
const openPrintDialogVisible = ref(false);
async function choosePrintRange(type: string) {
  if (type === "all") {
    await getData({
      filters: "",
      page: 1,
      rowsPerPage: 0,
    });
    print(tableContent, "人員名冊", true);
  } else {
    print(tableContent, "人員名冊", true);
  }
}
const tableTitle = {
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
function getTdContent(data: UserAccountAcks["userAccount"][]) {
  return data.map((member: UserAccountAcks["userAccount"]) => {
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
        ?.map((item) => item.houseNumber)
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

// 內容預覽
const previewDataModel = ref(false);
const previewDataLabel = ref("");
const previewDialogData = ref({});
function openDialog(value: UserAccountAcks["userAccount"]) {
  // 更新資料到 previewDataDialog
  previewDataLabel.value = value.fullname;
  previewDialogData.value = value;
  previewDataModel.value = true;
}
</script>

<style lang="scss" scoped>
.active {
  background-color: #fff !important;
  transition-duration: 0.5s;
  cursor: not-allowed;
}

.cardColor {
  background-color: #f3eee7;
}
.bgRedAnimation {
  animation: redAnimation 0.7s infinite;
}

@keyframes redAnimation {
  0% {
    color: red;
  }
  50% {
    color: transparent;
  }
  100% {
    color: red;
  }
}
</style>
