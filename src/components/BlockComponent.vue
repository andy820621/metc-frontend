<template>
  <div
    @click="handleClickBlock"
    class="flex"
    :class="customHeight ? '' : 'full-height'"
    :style="customHeight ? `height: ${customHeight}` : ''"
  >
    <div class="q-pa-xs-xs q-pa-md-md flex-grow-1 items-center">
      <div
        class="flex justify-between items-center"
        :class="$q.screen.xs || $q.screen.sm ? 'column  reverse' : 'q-mb-md'"
      >
        <div
          class="flex justify-between items-center q-ml-xs q-mb-xs"
          style="gap: 0.6rem; align-self: flex-end"
        >
          <slot name="customHeaderButtons" />
          <q-btn
            @click="handleClickOption(btn)"
            v-for="(btn, index) in headerButtons"
            :key="index"
            size="md"
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
        </div>

        <slot name="customCenterSlot"></slot>

        <q-form
          class="row justify-between items-center"
          :class="$q.screen.xs || $q.screen.sm ? 'full-width q-mb-md' : ''"
          @submit.prevent="changeBlockData(pagination)"
          v-if="props.isSearch"
        >
          <div
            class="searchContainer"
            :class="$q.screen.xs || $q.screen.sm ? 'full-width' : ''"
          >
            <slot name="customSearch"> </slot>

            <slot name="defaultSearch">
              <q-input
                outlined
                class="searchInput"
                type="search"
                dense
                v-model="pagination.filters"
                placeholder="請輸入關鍵字"
                @focus.stop="showAdvanced = true"
                @click.stop
              >
                <template v-slot:prepend>
                  <q-icon
                    name="search"
                    class="cursor-pointer"
                    @click.stop="changeBlockData(pagination)"
                  />
                </template>
              </q-input>
            </slot>
            <q-btn
              v-if="filtersData?.length"
              style="min-width: 20%"
              label="進階"
              :color="showAdvanced ? 'primary' : ''"
              :text-color="showAdvanced ? '' : 'text-primary'"
              @click.stop="showAdvanced = !showAdvanced"
            />
            <q-card v-if="showAdvanced" class="filtersContainer" @click.stop>
              <slot name="customFilter"> </slot>

              <template v-for="(filter, idx) in filtersData" :key="idx">
                <q-card-section v-if="filter.type === 'string'" class="filter">
                  <div class="title">{{ filter.title }}</div>
                  <div class="options">
                    <q-checkbox
                      v-for="option in filter.options"
                      :key="option.val"
                      v-model="filter.model"
                      :label="option.label"
                      :val="option.val"
                    />
                    <!-- <div class="hint">
                      提示:
                      文字內容必須是在所有勾選欄位都符合的內容方可被正確搜尋
                    </div> -->
                  </div>
                </q-card-section>

                <q-card-section
                  v-else-if="filter.type === 'date'"
                  class="filter"
                >
                  <div class="title">{{ filter.title }}</div>

                  <div class="dateRange">
                    <div class="dateBox">
                      <span class="label">
                        {{ filter.searchOption.startString || '起始日期' }}
                      </span>
                      <DateSelect
                        :min-width="
                          $q.screen.xs || $q.screen.sm ? '80px' : '180px'
                        "
                        outlined
                        dense
                        :disableFuture="
                          filter.searchOption.disableFuture ? today : undefined
                        "
                        v-model:dateModel="filter.dateRangeModel.from"
                      />
                    </div>
                    ~
                    <div class="dateBox">
                      <span class="label">
                        {{ filter.searchOption.endString || '結束日期' }}
                      </span>
                      <DateSelect
                        :min-width="
                          $q.screen.xs || $q.screen.sm ? '80px' : '180px'
                        "
                        outlined
                        dense
                        :disableFuture="
                          filter.searchOption.disableFuture ? today : undefined
                        "
                        :disable-past="disablePast(filter.dateRangeModel.from)"
                        v-model:dateModel="filter.dateRangeModel.to"
                      />
                    </div>
                  </div>
                </q-card-section>

                <q-card-section
                  v-else-if="filter.type === 'singleSelect'"
                  class="filter"
                >
                  <div class="title">{{ filter.title }}</div>
                  <q-select
                    v-model="filter.model"
                    :options="filter.searchOption.options"
                    clearable
                    :style="filter.searchOption.style"
                  />
                </q-card-section>

                <q-separator v-if="filters && idx !== filters.length - 1" />
              </template>

              <q-btn
                class="fit"
                type="submit"
                color="primary"
                text-color="white"
                label="開始搜尋"
              />
            </q-card>
          </div>
        </q-form>
      </div>

      <q-scroll-area
        class="q-mb-none"
        :visible="false"
        :style="scrollAreaHeight"
      >
        <q-table
          :grid="$q.screen.xs || $q.screen.sm"
          flat
          bordered
          ref="tableRef"
          :rows="blockData"
          :columns="tableConfig as QTableProps['columns']"
          row-key="id"
          v-model:pagination="pagination"
          :rows-per-page-options="[25, 50, 75, 100]"
          :loading="loading"
          selection="multiple"
          v-model:selected="selected"
          :class="$q.screen.xs || $q.screen.sm ? '' : 'my-sticky-header-block'"
          :style="tableStyle"
          separator="cell"
          @request="
            (val) => {
              pagination.rowsPerPage = val.pagination.rowsPerPage;
              return changeBlockData(pagination);
            }
          "
        >
          <template v-slot:pagination>
            <div style="font-size: 16px">
              共 {{ blockAttrs.totalNum }} 項 資料
            </div>
          </template>
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th
                auto-width
                v-if="expandAttrs && expandAttrs.isExpand && blockData.length"
              ></q-th>
              <q-th
                auto-width
                v-if="
                  (headerButtons.length > 0 || slotHeaderButtons?.length > 0) &&
                  isCheckbox
                "
              >
                <q-checkbox
                  v-model="props.selected"
                  @click="handleTableSelected"
                />
              </q-th>
              <q-th v-for="col in props.cols" :key="col.name" :props="props">
                {{ col.label }}
              </q-th>

              <q-th
                auto-width
                v-if="
                  blockData.length &&
                  (tableButtons.length > 0 ||
                    (slotTableButtons && slotTableButtons?.length > 0))
                "
              />
            </q-tr>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width v-if="expandAttrs && expandAttrs.isExpand">
                <q-btn
                  size="sm"
                  color="primary"
                  round
                  dense
                  @click="props.expand = !props.expand"
                  :icon="props.expand ? 'remove' : 'add'"
                />
              </q-td>
              <q-td
                auto-width
                v-if="
                  (headerButtons.length > 0 || slotHeaderButtons?.length > 0) &&
                  isCheckbox
                "
              >
                <q-checkbox
                  v-model="props.selected"
                  @click="handleTableSelected"
                />
              </q-td>
              <q-td
                v-for="col in props.cols"
                :key="col.name"
                :props="props"
                style="min-width: 120px"
              >
                <slot
                  v-if="$slots.customBlockField && col.isTableSlot"
                  name="customBlockField"
                  :data="props.row"
                  :config="col"
                />
                <div
                  v-else-if="
                    col.formType === 'inputString' ||
                    col.formType === 'inputNumber' ||
                    col.formType === 'deviceAddress'
                  "
                >
                  <q-badge
                    v-if="col.withLabel && props.row.labelContent"
                    color="primary"
                    class="q-mr-xs"
                  >
                    {{ props.row.labelContent }}
                  </q-badge>
                  {{ col.value }}
                </div>

                <div
                  v-else-if="
                    col.formType === 'selectString' ||
                    col.formType === 'searchableSingleSelect'
                  "
                >
                  <span
                    v-if="col.linkUrl"
                    class="text-primary cursor-pointer text-bold"
                    @click="openDialog(col)"
                  >
                    {{ col.value?.name || col.value?.fullname }}
                  </span>
                  <span v-else-if="typeof col.value === 'string'">
                    {{ col.value }}
                  </span>
                  <span v-else>{{
                    col.value?.description ||
                    col.value?.label ||
                    col.value?.name
                  }}</span>
                </div>

                <div v-else-if="col.formType === 'selectMany'">
                  <span>{{ col.value?.length ? col.value : '' }}</span>
                </div>

                <div v-else-if="col.formType === 'selectIcon'">
                  <q-icon :name="col.value?.iconImg" style="font-size: 24px" />
                  <span class="q-ml-sm">{{ col.value?.value }}</span>
                </div>
                <div v-else-if="col.formType === 'selectSvgIcon'">
                  <SvgIcon
                    dense
                    color="text-dark"
                    :svgName="col.value.iconId || col.value.icon || ''"
                    font-size="20px"
                    class="svgIcon"
                  />
                  <span class="q-ml-sm">{{ col.value.name }}</span>
                </div>

                <div v-else-if="col.formType === 'date'">
                  <span>{{
                    col.value
                      ? date.formatDate(
                          new Date(col.value),
                          col.customDateFormat || 'YYYY-MM-DD',
                        )
                      : ''
                  }}</span>
                </div>
                <div v-else-if="!col.isTableSlot">{{ col.value }}</div>
              </q-td>
              <q-td
                class="text-right space-x-2"
                auto-width
                v-if="
                  tableButtons.length > 0 ||
                  (slotTableButtons && slotTableButtons?.length > 0)
                "
              >
                <slot name="customTableButtons" :data="props.row" />
                <q-btn
                  @click="handleClickOption(btn, props.row)"
                  v-for="(btn, index) in tableButtons"
                  :key="index"
                  size="md"
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
              </q-td>
            </q-tr>
            <q-tr
              v-show="props.expand"
              :props="props"
              v-if="expandAttrs && expandAttrs.isExpand"
            >
              <q-td colspan="100%" class="bg-grey-3">
                <div class="text-left q-pa-sm">
                  <!-- 展開 -->
                  <q-table
                    v-if="
                      expandAttrs &&
                      props.row[expandAttrs.expandKey]?.length > 0
                    "
                    flat
                    :rows="props.row[expandAttrs.expandKey]"
                    :columns="
                      expandAttrs.expandConfig as QTableProps['columns']
                    "
                    row-key="id"
                    :rows-per-page-options="[0]"
                    hide-bottom
                  ></q-table>
                  <div
                    v-else
                    class="full-width flex flex-center text-primary q-gutter-sm"
                    style="font-size: 18px"
                  >
                    <q-icon size="1.6rem" :name="matErrorOutline" />
                    <span> 無相關資料 </span>
                  </div>
                </div>
              </q-td>
            </q-tr>
          </template>
          <!-- 手機板的card style -->
          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 fit">
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
                <q-card-section
                  v-if="
                    headerButtons.length > 0 || slotHeaderButtons?.length > 0
                  "
                  class="flex justify-between"
                  style="padding: 0.7rem 0.85rem"
                >
                  <div class="q-gutter-md">
                    <slot name="customTableButtons" :data="props.row" />
                    <q-btn
                      @click="handleClickOption(btn, props.row)"
                      v-for="(btn, index) in tableButtons"
                      :key="index"
                      size="sm"
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
                  </div>
                  <q-checkbox
                    class="bigger-on-mobile"
                    @click="handleTableSelected"
                    dense
                    v-model="props.selected"
                    :label="props.row.label"
                  />
                </q-card-section>
                <q-separator
                  v-if="
                    headerButtons.length > 0 || slotHeaderButtons?.length > 0
                  "
                />
                <q-list dense class="q-py-md text-subtitle1">
                  <q-item v-for="col in props.cols" :key="col.name">
                    <q-item-section>
                      <q-item-label>{{ col.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section
                      side
                      style="
                        width: 65%;
                        word-wrap: break-word;
                        word-break: break-all;
                        white-space: pre-wrap;
                      "
                    >
                      <slot
                        v-if="$slots.customBlockField && col.isTableSlot"
                        name="customBlockField"
                        :data="props.row"
                        :config="col"
                      />
                      <div
                        v-else-if="
                          col.formType === 'inputString' ||
                          col.formType === 'inputNumber' ||
                          col.formType === 'deviceAddress'
                        "
                      >
                        {{ col.value }}
                      </div>
                      <div
                        v-else-if="
                          col.formType === 'selectString' ||
                          col.formType === 'searchableSingleSelect'
                        "
                      >
                        <span
                          v-if="col.linkUrl"
                          class="text-primary cursor-pointer text-bold"
                          @click="openDialog(col)"
                        >
                          {{ col.value?.name || col.value?.fullname }}
                        </span>
                        <span v-else-if="typeof col.value === 'string'">
                          {{ col.value }}
                        </span>
                        <span v-else>{{
                          col.value?.description ||
                          col.value?.label ||
                          col.value?.name
                        }}</span>
                      </div>
                      <div v-else-if="col.formType === 'selectIcon'">
                        <q-icon
                          :name="col.value?.iconImg"
                          style="font-size: 24px"
                        />
                        <span class="q-ml-sm">{{ col.value?.value }}</span>
                      </div>
                      <div v-else-if="col.formType === 'selectSvgIcon'">
                        <SvgIcon
                          dense
                          color="text-dark"
                          :svgName="col.value?.iconId || col.value?.icon || ''"
                          font-size="20px"
                          class="svgIcon"
                        />
                        <span class="q-ml-sm">{{ col.value?.name }}</span>
                      </div>
                      <div v-else-if="col.formType === 'date'">
                        <span>{{
                          col.value
                            ? date.formatDate(
                                new Date(col.value),
                                col.customDateFormat || 'YYYY-MM-DD',
                              )
                            : ''
                        }}</span>
                      </div>
                      <div v-else-if="!col.isTableSlot">{{ col.value }}</div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </div>
          </template>
          <template v-slot:no-data="{ icon }">
            <div
              class="full-width row flex-center items-center text-primary q-gutter-sm"
              style="font-size: 18px"
            >
              <q-icon size="2em" :name="icon" />
              <span> 無相關資料 </span>
            </div>
          </template>
        </q-table>
      </q-scroll-area>
      <div class="row justify-center items-center q-mt-md" v-if="pagesNumber">
        <q-pagination
          v-model="pagination.page"
          :max="pagesNumber"
          input
          @update:model-value="changeBlockData(pagination)"
        />
      </div>
    </div>
  </div>

  <!-- 有 link 的資料顯示視窗 -->
  <DialogDataRowPreview
    v-model:visible="linkDialogVisible"
    :dataLabel="dialogData.configLabel || ''"
    :dialog-config="dialogConfig"
    :dialog-data="dialogData"
  >
    <template #btn>
      <template v-if="dialogData.onlyOpen">
        <q-btn color="primary" @click="linkDialogVisible = false">確定</q-btn>
      </template>
      <template v-else>
        <q-btn
          color="primary"
          @click="linkUrlAction(dialogData, dialogData.linkUrl)"
        >
          資料細節
        </q-btn>
      </template>
    </template>
  </DialogDataRowPreview>
</template>
<script setup lang="ts">
import type { QTableProps } from 'quasar';
import { date, useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
// utils
import { linkUrlAction } from 'src/utils/urlActions';
import { useVModel } from '@vueuse/core';
// icon
import { fasFileExport, fasFileImport } from '@quasar/extras/fontawesome-v5';
// type
import type {
  tempDataType,
  blockAttrsType,
  expandAttrsType,
  tableConfigItem,
  blockRefType,
} from 'src/utils/tableMixin';
import { matErrorOutline } from '@quasar/extras/material-icons';

const $q = useQuasar();
const slots = useSlots();

const props = withDefaults(
  defineProps<{
    blockAttrs: blockAttrsType;
    expandAttrs?: expandAttrsType;
    isSearch?: boolean;
    isDialogTable?: boolean;
    isCheckbox?: boolean;
    tabHeight?: string;
    customHeight?: string;
    // filters?: filtersType;
    filters?: any;
  }>(),
  {
    isSearch: true,
    isDialogTable: false,
    tabHeight: '36px',
    isCheckbox: true,
  },
);

const emit = defineEmits([
  'handleBlock',
  'changeBlockData',
  'handleSelectArray',
  'updateLatestData',
  'update:filters',
]);

const filtersData = useVModel(props, 'filters', emit);

const blockAttrs = computed(() => props.blockAttrs);
const dialogConfig = ref<tableConfigItem[]>();
const expandAttrs = computed(() => props.expandAttrs);

const scrollAreaHeight = computed(() => {
  let result = '';
  if (props.isSearch) {
    result = $q.screen.xs || $q.screen.sm ? 'height: 78%' : 'height: 87%';
  } else if (headerButtons.value.length > 0) {
    result = $q.screen.xs || $q.screen.sm ? 'height: 87%' : 'height: 86%';
  } else if (!$q.screen.gt.md) {
    result = 'height:  91%';
  } else {
    result = 'height: 93%';
  }
  return result;
});
const tableStyle = computed(() => {
  let result = '';
  if (props.blockAttrs.blockData?.length < 8) {
    result = 'height: auto';
  } else if (props.isDialogTable) {
    result = '--bodyHeight:88vh';
  } else {
    result = `--tab-height:${props.tabHeight}`;
  }
  return result;
});

// table 內容
interface tableButtonsType {
  label: string;
  icon: string;
  status: string;
}
function handleClickOption(btn: tableButtonsType, data?: tempDataType) {
  console.log('handleClickOption', btn, data, selected.value);
  if (btn.status === 'updateMany') {
    emit('handleBlock', btn, selected.value);
  } else {
    emit('handleBlock', btn, data);
  }
}
// 表格
const loading = ref(false);
const tableRef = ref();

const pagesNumber = computed(() =>
  blockData.value
    ? Math.ceil(blockAttrs.value.totalNum / pagination.value.rowsPerPage)
    : 0,
);

const pagination = ref({
  filters: '',
  page: 1,
  rowsPerPage: 25,
  rowsNumber: blockAttrs.value.totalNum,
});

// 標題欄位
const tableConfig = computed(() =>
  blockAttrs.value.tableConfig.filter(
    (config: tableConfigItem) => config.isTable,
  ),
);
// 表格內容
const blockData = computed(() => blockAttrs.value.blockData);

function changeBlockData({
  filters,
  rowsPerPage,
  page,
}: blockRefType['pagination']) {
  pagination.value = {
    filters,
    rowsPerPage,
    page,
    rowsNumber: blockAttrs.value.totalNum,
  };

  loading.value = true;
  emit('changeBlockData', pagination.value);
  setTimeout(() => {
    if (loading.value) loading.value = false;
  }, 5000);
  showAdvanced.value = false;
  resetSelect();
}

const slotHeaderButtons = ref();
const slotTableButtons = ref();

onMounted(() => {
  if (slots.customHeaderButtons) {
    slotHeaderButtons.value = slots.customHeaderButtons()[0].children;
  }
  if (slots.customTableButtons) {
    slotTableButtons.value = slots.customTableButtons()[0].children;
  }
  changeBlockData(pagination.value);
  // tableRef.value.requestServerInteraction();
});

const selected = ref([]);
function handleTableSelected() {
  emit('handleSelectArray', selected.value);
}
function resetSelect() {
  selected.value = [];
  handleTableSelected();
}

// 按鈕
const headerButtonsData = ref([
  {
    label: '匯入檔案',
    icon: fasFileImport,
    status: 'importExcel',
    isShow: true,
  },
  {
    label: '匯出檔案',
    icon: fasFileExport,
    status: 'exportExcel',
    isShow: true,
  },
  {
    label: '新增資料',
    icon: 'add',
    status: 'add',
    isShow: true,
  },
  {
    label: '多筆編輯',
    icon: 'edit',
    status: 'updateMany',
    isShow: true,
  },
  {
    label: '多筆刪除',
    icon: 'delete',
    status: 'deleteMany',
    isShow: true,
  },
]);

const tableButtonsData = ref([
  {
    label: '檔案上傳',
    icon: 'upload',
    status: 'upload',
    isShow: true,
  },
  {
    label: '編輯',
    icon: 'edit',
    status: 'edit',
    isShow: true,
  },
  {
    label: '刪除',
    icon: 'delete',
    status: 'delete',
    isShow: true,
  },
]);
const headerButtons = computed(() =>
  headerButtonsData.value.filter((item) => item.isShow),
);
const tableButtons = computed(() =>
  tableButtonsData.value.filter((item) => item.isShow),
);
watch(
  () => props.blockAttrs.headerButtons,
  () => {
    headerButtonsData.value.forEach((item) => {
      item.isShow = blockAttrs.value.headerButtons.includes(item.status);
    });
  },
);
watch(
  () => props.blockAttrs.tableButtons,
  () => {
    tableButtonsData.value.forEach((item) => {
      item.isShow = blockAttrs.value.tableButtons.includes(item.status);
    });
  },
);

const linkDialogVisible = ref(false);
const dialogData = ref<tempDataType>({});
interface tableCol {
  value: tempDataType;
  label: string;
  linkUrl: string;
  config: tableConfigItem[];
}
function openDialog(col: tableCol) {
  const { value: data, label: configLabel, linkUrl, config } = col;
  console.log('openDialog', data, configLabel);
  linkDialogVisible.value = true;
  dialogConfig.value = config;
  data.configLabel = configLabel;
  if (linkUrl === 'onlyOpen') {
    data.onlyOpen = true;
  } else {
    data.linkUrl = linkUrl;
  }
  dialogData.value = data;
}

defineExpose({
  resetSelect,
  pagination,
  loading,
});

// 進階搜尋
const showAdvanced = ref(false);

function handleClickBlock() {
  showAdvanced.value = false;
}

// Disable Date
const today = new Date();
function disablePast(pastDate: string) {
  const parsedDate = Date.parse(pastDate);
  if (!isNaN(parsedDate)) {
    return new Date(parsedDate);
  }
  return new Date('1990/01/01');
}
</script>

<style lang="scss">
.my-sticky-header-block {
  --navbar-height: 50px;
  --main-layout-padding: calc(16px * 2);
  --tab-height: 36px;
  --card-padding: calc(16px * 2);
  --block-padding: calc(16px * 2);
  --search-input-height: 40px;
  --search-input-margin: 24px;
  --pagination-margin: 16px;
  --pagination-height: 30px;
  --secretNum: 2px; // calc(100vh - var(--need-to-subtract) 可能會有小數點，css 會直接扣整數導致少扣，因此直接多扣 1px 來避免該狀況發生
  --bodyHeight: 100vh;

  --need-to-subtract: calc(
    var(--navbar-height) + var(--main-layout-padding) + var(--tab-height) +
      var(--card-padding) + var(--block-padding) + var(--search-input-height) +
      var(--pagination-height) + var(--search-input-margin) +
      var(--pagination-margin) + var(--secretNum)
  );
  --full-height: calc(var(--bodyHeight) - var(--need-to-subtract));
}
</style>

<style lang="scss" scoped>
table {
  td {
    div {
      width: auto;
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }
}
@media screen and (max-width: 1024px) {
  // 隱藏手機單頁搜尋比數控制器
  :deep(.q-table__control:nth-last-of-type(2)) {
    display: none;
  }

  // 放大手機 checkbox 大小
  .bigger-on-mobile {
    :deep(.q-checkbox__inner) {
      width: 1.5rem;
      height: 1.5rem;
    }
  }
}

// 進階搜尋
.searchContainer {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
  .filtersContainer {
    width: 100%;
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);

    @media screen and (min-width: 600px) {
      width: auto;
      top: auto;
      left: auto;
      bottom: 0;
      right: 0;
      transform: translateY(calc(100% + 0.6rem));
    }

    .filter {
      display: flex;
      flex-direction: column;
      @media screen and (min-width: 600px) {
        display: grid;
        grid-template-columns: 2.4rem 1fr;
        gap: 0.3rem;
        align-items: center;
      }
      :deep(.q-checkbox__label) {
        padding-left: 0;
        text-indent: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .title {
        font-size: 1rem;
        font-weight: bold;
      }
      .options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        column-gap: 0.8rem;
        .hint {
          grid-column: 1 / 3;
          padding: 0.5rem 0.5rem 0;
          color: #777;
        }
      }
      .dateRange {
        display: flex;
        gap: 0.5rem;
        align-items: center;
        .dateBox {
          display: grid;
          gap: 0.24rem;
          & > span.label {
            font-size: 1rem;
          }
        }
      }
    }
  }
}
.searchInput {
  width: 100%;
  @media screen and (min-width: 600px) {
    width: 50%;
  }
  @media screen and (min-width: 1024px) {
    width: 250px;
  }
}

:deep(.q-table__bottom-item) {
  font-size: 16px;
}

:deep(.q-table__bottom) {
  order: -1;
  @media screen and (min-width: 600px) {
    order: 0;
  }
}

:deep(.q-table--grid .q-table__middle) {
  min-height: 0;
  margin-bottom: 0;
}
</style>
