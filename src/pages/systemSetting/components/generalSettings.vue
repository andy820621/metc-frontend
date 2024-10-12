<template>
  <div v-if="$q.screen.xs || $q.screen.sm">
    <q-tabs
      v-model="activeTab.value"
      active-color="primary"
      active-bg-color="grey-3"
    >
      <q-tab
        v-for="(tab, index) in blockTabs"
        :key="index"
        :name="tab.value"
        :label="tab.label"
        @click="tabChange(tab)"
      />
    </q-tabs>
    <q-tab-panels
      v-model="activeTab.value"
      animated
      swipeable
      transition-prev="jump-up"
      transition-next="jump-up"
      class="full-height"
      style="background: transparent"
    >
      <q-tab-panel
        v-for="(tab, index) in blockTabs"
        :key="index"
        :name="tab.value"
      >
        <div class="row q-col-gutter-md">
          <div
            v-for="block in tab.block"
            :key="block.value"
            class="col-xs-12 col-md-6"
          >
            <q-card>
              <q-card-section style="height: 350px; overflow: hidden">
                <div class="flex justify-between items-center q-mb-md">
                  <div class="text-h6 text-bold">
                    {{ block.label }}
                  </div>
                  <q-btn
                    @click="handleClickOption(btn, {}, block)"
                    v-for="(btn, index) in headerButtonsData"
                    :key="index"
                    size="sm"
                    color="grey-6"
                    round
                    dense
                    :icon="btn.icon"
                    class="q-ml-md"
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
                </div>

                <q-scroll-area
                  style="height: 82%"
                  v-if="block.blockData.length > 0"
                >
                  <div
                    v-for="(item, index) in (block.blockData as SystemViewModel[])"
                    :key="index"
                  >
                    <div class="flex justify-between q-mb-md">
                      <div
                        style="font-size: 18px"
                        :style="
                          $q.screen.xs || $q.screen.sm
                            ? 'width: 50%'
                            : 'width: 80%'
                        "
                      >
                        <span>{{ Number(index) + 1 }}. </span>
                        {{ item.label }}
                      </div>
                      <div>
                        <q-btn
                          @click="handleClickOption(btn, item, block)"
                          v-for="(btn, index) in tableButtonsData"
                          :key="index"
                          size="sm"
                          color="grey-6"
                          round
                          dense
                          :icon="btn.icon"
                          class="q-ml-md"
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
                      </div>
                    </div>
                  </div>
                </q-scroll-area>
                <div v-else class="text-grey">尚無資料</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-tab-panel>
    </q-tab-panels>
  </div>
  <q-card
    flat
    style="background: transparent"
    class="flex-nowrap flex-col q-col-gutter-md full-height"
    v-else
  >
    <q-splitter v-model="splitterModel">
      <template v-slot:before>
        <q-tabs
          v-model="activeTab.value"
          vertical
          active-color="primary"
          active-bg-color="grey-3"
        >
          <q-tab
            v-for="(tab, index) in blockTabs"
            :key="index"
            :name="tab.value"
            :label="tab.label"
            @click="tabChange(tab)"
          />
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="activeTab.value"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
          class="full-height"
          style="background: transparent"
        >
          <q-tab-panel
            v-for="(tab, index) in blockTabs"
            :key="index"
            :name="tab.value"
          >
            <div class="row q-col-gutter-md">
              <div
                v-for="block in tab.block"
                :key="block.value"
                class="col-xs-12 col-md-6"
              >
                <q-card>
                  <q-card-section style="height: 350px; overflow: hidden">
                    <div class="flex justify-between items-center q-mb-md">
                      <div class="text-h6 text-bold">
                        {{ block.label }}
                      </div>
                      <q-btn
                        @click="handleClickOption(btn, {}, block)"
                        v-for="(btn, index) in headerButtonsData"
                        :key="index"
                        size="sm"
                        color="grey-6"
                        round
                        dense
                        :icon="btn.icon"
                        class="q-ml-md"
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
                    </div>

                    <q-scroll-area
                      style="height: 82%"
                      v-if="block.blockData.length > 0"
                    >
                      <div
                        v-for="(item, index) in (block.blockData as SystemViewModel[])"
                        :key="index"
                      >
                        <div class="flex justify-between q-mb-md">
                          <div
                            style="font-size: 18px"
                            :style="
                              $q.screen.xs || $q.screen.sm
                                ? 'width: 50%'
                                : 'width: 80%'
                            "
                          >
                            <span>{{ Number(index) + 1 }}. </span>
                            {{ item.label }}
                          </div>
                          <div>
                            <q-btn
                              @click="handleClickOption(btn, item, block)"
                              v-for="(btn, index) in tableButtonsData"
                              :key="index"
                              size="sm"
                              color="grey-6"
                              round
                              dense
                              :icon="btn.icon"
                              class="q-ml-md"
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
                          </div>
                        </div>
                      </div>
                    </q-scroll-area>
                    <div v-else class="text-grey">尚無資料</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </q-card>

  <DialogForm
    :dialogAttrs="dialogAttrs"
    :blockAttrs="blockAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
  </DialogForm>
</template>
<script setup lang="ts">
// api
import System, {
  QuasarQuery,
  SystemViewModel,
  systemType,
} from "src/api/system";
// utils
import systemBlock from "../systemBlock";
import tableMixin from "src/utils/tableMixin";
import type { blockRefType, tempDataType } from "src/utils/tableMixin";
const $q = inject("$q") as typeof QVueGlobals;

const {
  dialogAttrs,
  blockAttrs,
  handleBlockMixin,
  handleDialogMixin,
  hideDialog,
} = tableMixin();
const dialogEvent = computed(() => ({ handleDialog, selectListChange }));
enum monthType {
  "一月" = 1,
  "二月" = 2,
  "三月" = 3,
  "四月" = 4,
  "五月" = 5,
  "六月" = 6,
  "七月" = 7,
  "八月" = 8,
  "九月" = 9,
  "十月" = 10,
  "十一月" = 11,
  "十二月" = 12,
}

enum yearType {
  "每一年一次" = 1,
  "每兩年一次" = 2,
  "每三年一次" = 3,
  "每四年一次" = 4,
  "每五年一次" = 5,
}

// 左側導覽的寬度(%)
const splitterModel = ref(10);
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = ref(systemBlock);

const API = System;
function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  if (btn.status === "edit") {
    if (typeof data.monthValues[0] === "number") {
      data.monthValues = data.monthValues.map((value: string) => ({
        label: monthType[value as keyof typeof monthType],
        value,
      }));
    }
    if (typeof data.yearValue === "number") {
      data.yearValue = {
        label: yearType[data.yearValue as unknown as keyof typeof yearType],
        value: data.yearValue,
      };
    }
  }

  handleBlockMixin(btn, data, API, getData);
  console.log("handleBlock", data);
}
async function handleDialog(status: string, data: tempDataType) {
  data.type = activeBlockType.value;
  if (!data.order) data.order = 0; // 排序預設為0
  if (data.monthValues?.length) {
    data.monthValues = data.monthValues.map((item: { value: number }) =>
      Number(item.value)
    );
  }
  if (data.yearValue) {
    data.yearValue = data.yearValue.value;
  }
  await handleDialogMixin(status, API, getData, data);
}
const headerButtonsData = ref([
  {
    label: "新增資料",
    icon: "add",
    status: "add",
    isShow: true,
  },
]);
const tableButtonsData = ref([
  {
    label: "編輯",
    icon: "edit",
    status: "edit",
    isShow: true,
  },
  {
    label: "刪除",
    icon: "delete",
    status: "delete",
    isShow: true,
  },
]);

// 目前 tab 的類型
const activeBlockType = ref(0);
// 取得分頁資料
async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 0,
    rowsPerPage: 0,
  }
) {
  console.log("pagination", pagination);

  pagination.type = activeBlockType.value;
  const result = (await API.apiGetData(pagination)) as typeof AxiosResponse;
  const tab = blockTabs.value.find(
    (item) => item.value === activeTab.value.value
  );

  tab?.block.forEach((item) => {
    if (item.value === systemType[activeBlockType.value]) {
      item.blockData = result.data.rows;
    }
  });
}

async function selectListChange(props: string) {
  console.log("selectListChange", props);
  if (props === "monthValues") {
    dialogAttrs.value.selectOption = Object.entries(monthType)
      .filter(([label, value]) => typeof value !== "string")
      .map(([label, value]) => {
        return {
          label,
          value,
        };
      });
  } else if (props === "yearValue") {
    dialogAttrs.value.selectOption = Object.entries(yearType)
      .filter(([label, value]) => typeof value !== "string")
      .map(([label, value]) => {
        return {
          label,
          value,
        };
      });
  }
}
async function tabChange(
  tab: {
    label: string;
    value: string;
    block: {
      label: string;
      value: string;
      blockData: tempDataType[];
    }[];
  } = blockTabs.value[0]
) {
  console.log("tabChange", tab);
  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
  // 讀出一個tab的所有區塊資料
  const tabBlockArr = tab.block.map((item) => item.value);
  const data: QuasarQuery = {};
  tabBlockArr.forEach((tabBlock: string) => {
    const type = systemType[tabBlock as keyof typeof systemType];
    data[type] = {
      filter: "",
      page: 0,
      rowsPerPage: 0,
    };
  });
  const result = (await API.apiGetMultiSystem(data)) as typeof AxiosResponse;
  const multiSystemArr = Object.keys(result.data);
  multiSystemArr.forEach((system) => {
    const block = tab.block.find((item) => item.value === system);
    if (block) block.blockData = result.data[system].rows;
  });
}

interface tableButtonsType {
  label: string;
  icon: string;
  status: string;
}
function isWithTimeInput(value: string) {
  switch (value) {
    case "InspectionTypeOfTime":
    case "PublicSafeTypeOfTime":
      return true;
    default:
      return false;
  }
}
function handleClickOption(
  btn: tableButtonsType,
  data: tempDataType,
  block: {
    label: string;
    value: string;
  }
) {
  console.log("handleClickOption", btn, data, block);

  if (isWithTimeInput(block.value)) {
    blockAttrs.value.tableConfig = [...defaultConfig, ...configWithTimeInput];
  } else blockAttrs.value.tableConfig = defaultConfig;

  dialogAttrs.value.dialogTitle = block.label;
  const type = systemType[block.value as keyof typeof systemType];
  activeBlockType.value = type;
  if (btn.status === "add") {
    handleBlock(btn, {});
  } else {
    handleBlock(btn, data);
  }
}
const defaultConfig = [
  {
    label: "名稱",
    name: "label",
    field: "label",
    align: "left",
    formType: "inputString",
    message: "請輸入 名稱",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: "排序",
    name: "order",
    field: "order",
    align: "left",
    formType: "inputNumber",
    message: "請輸入 排序",
    isTable: true,
    isDialogForm: true,
    required: false,
  },
];
const configWithTimeInput = [
  {
    label: "年份",
    name: "yearValue",
    field: "yearValue",
    align: "left",
    formType: "selectString",
    message: "請輸入 年份",
    isTable: true,
    isDialogForm: true,
    required: false,
    optionLabel: "label",
  },
  {
    label: "月份",
    name: "monthValues",
    field: "monthValues",
    align: "left",
    formType: "selectMany",
    message: "請輸入 月份",
    isTable: true,
    isDialogForm: true,
    required: false,
    optionLabel: "label",
  },
];
onMounted(() => {
  tabChange(blockTabs.value[0]);
  blockAttrs.value.tableConfig = defaultConfig;
  if ($q.screen.xs || $q.screen.sm) {
    splitterModel.value = 20;
  }
});
</script>
