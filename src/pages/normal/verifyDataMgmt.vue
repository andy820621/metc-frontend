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
      驗證頁面
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
            tabHeight="0px"
            v-model:filters="filters"
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
            <template #customTableButtons="scoped">
              <template v-if="activeTab.value === 'addressPlates'">
                <q-btn
                  v-for="(btn, index) in customTableButtons"
                  :key="index"
                  @click="handleClickOption(btn, scoped.data)"
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
              <q-card-section class="filter">
                <div class="title">驗證結果</div>
                <q-select
                  v-model="verifyResult"
                  :options="verifyResultOptions"
                  clearable
                  style="padding: 0 0.2rem 0 0.6rem"
                />
              </q-card-section>

              <q-separator />
            </template>
            <template #customBlockField="{ data, config }">
              <div
                v-if="config.name === 'addressPlateConfirmed'"
                class="text-bold"
                :class="verifyTextStyle(data).colorStyle"
              >
                {{ verifyTextStyle(data).result }}
              </div>
            </template>
          </BlockComponent>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>
<script setup lang="ts">
// api
import type { UserAddressPlateViewModel } from 'src/api/AddressplateVerify';
import AddressplateVerify, {
  addressPlatesVerifyConfig,
} from 'src/api/AddressplateVerify';
import AccountSetting from 'src/api/accountSetting';

// pinia store
import { storeToRefs } from 'pinia';
import { useBuildingStore } from 'src/stores/building';

// utils
import tableMixin, { setBlockLoading } from 'src/utils/tableMixin';
import type { blockRefType, tempDataType } from 'src/utils/tableMixin';
import searchFiltersGenerator, {
  generateFiltersObject,
} from 'src/utils/advancedSearchFilters';
import { useCloned } from '@vueuse/core';

// icon
import { matVerified, matSmsFailed } from '@quasar/extras/material-icons';
import { mdiCheckCircle } from '@quasar/extras/mdi-v6';
import type { FilterColumnCollection } from 'src/api/api.type';
import { FilterColumn, FilterColumnLogical } from 'src/api/api.type';

const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);
const $q = useQuasar();

// tab
const activeTab = ref({
  label: '',
  value: '',
});
const blockTabs = [
  {
    label: '地址驗證',
    value: 'addressPlates',
  },
];

// block
const blockRef = ref<blockRefType>();

const {
  dialogAttrs,
  blockAttrs,
  handleSelectArray,
  getDataMixin,
  resetSelect,
} = tableMixin(blockRef);

const blockEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getData,
  };
});

// 客製 button
const customHeaderButtons = ref([
  {
    label: '多筆驗證成功',
    icon: matVerified,
    status: 'verifyMany',
  },
]);
const customTableButtons = ref([
  {
    label: '驗證成功',
    icon: matVerified,
    status: 'verify',
  },
  {
    label: '驗證失敗',
    icon: matSmsFailed,
    status: 'verifyFailed',
  },
]);
function handleClickOption(
  btn: {
    label: string;
    icon: string;
    status: string;
  },
  data?: tempDataType,
) {
  if (data) {
    handleBlock(btn, data);
  } else {
    handleBlock(btn, dialogAttrs.value.selectArray);
  }
}
// API類別
let API: typeof AddressplateVerify;
// 在 block 上的操作
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType,
) {
  console.log('handleBlock', btn, data);
  const pagination = Array.isArray(blockRef?.value)
    ? blockRef?.value[0]?.pagination
    : blockRef?.value?.pagination;
  if (btn.status === 'verifyMany') {
    if (
      dialogAttrs.value.selectArray &&
      dialogAttrs.value.selectArray.length > 0
    ) {
      const idArr = dialogAttrs.value.selectArray.map((item) => item.id);
      const result = (await API.apiPatchSuccess(idArr)) as typeof AxiosResponse;
      idArr.forEach((id) => {
        if (result.data[id]) {
          $q.notify({
            type: 'positive',
            message: '驗證成功',
            position: 'top',
          });
        } else {
          $q.notify({
            type: 'negative',
            message: '驗證失敗',
            position: 'top',
          });
        }
      });
      const userIdArr = dialogAttrs.value.selectArray.map((item) => {
        return item.user.id;
      });
      const accountStatus: { [key: string]: boolean } = {};
      userIdArr.forEach((userId) => {
        accountStatus[userId] = false;
      });
      const lockResult = (await AccountSetting.apiLockoutUser(
        accountStatus,
      )) as typeof AxiosResponse;
      userIdArr.forEach((userId) => {
        if (lockResult.data[userId]) {
          $q.notify({
            type: 'positive',
            message: '啟用成功',
            position: 'top',
          });
        } else {
          $q.notify({
            type: 'negative',
            message: '啟用失敗',
            position: 'top',
          });
        }
      });
    } else {
      $q.notify({
        type: 'negative',
        message: '請勾選要更新的資料列',
        position: 'top',
      });
    }
  } else if (btn.status === 'verify') {
    if (!data.addressPlateConfirmed) {
      const result = (await API.apiPatchSuccess([
        data.id,
      ])) as typeof AxiosResponse;
      if (result.data[data.id]) {
        $q.notify({
          type: 'positive',
          message: '驗證成功',
          position: 'top',
        });

        const accountStatus: { [key: string]: boolean } = {};
        accountStatus[data.user.id] = false;
        const lockResult = (await AccountSetting.apiLockoutUser(
          accountStatus,
        )) as typeof AxiosResponse;
        if (lockResult.data[data.user.id]) {
          $q.notify({
            type: 'positive',
            message: '啟用成功',
            position: 'top',
          });
        } else {
          $q.notify({
            type: 'negative',
            message: '啟用失敗',
            position: 'top',
          });
        }
      } else {
        $q.notify({
          type: 'negative',
          message: '驗證失敗',
          position: 'top',
        });
      }
    } else {
      $q.notify({
        type: 'positive',
        message: '已驗證過成功',
        position: 'top',
      });
    }
  } else if (btn.status === 'verifyFailed') {
    if (data.addressPlateConfirmed) {
      $q.dialog({
        title: '驗證失敗原因',
        message: '請輸入驗證失敗原因',
        prompt: {
          model: '身分/內容有誤',
          type: 'text', // optional
        },
        cancel: true,
        persistent: true,
      }).onOk(
        void (async (message: string) => {
          const result = (await API.apiPatchFailure(
            data.id,
            message,
          )) as typeof AxiosResponse;
          if (result.data) {
            $q.notify({
              type: 'positive',
              message: '已成功驗證為失敗',
              position: 'top',
            });

            const accountStatus: { [key: string]: boolean } = {};
            accountStatus[data.user.id] = false;
            const lockResult = (await AccountSetting.apiLockoutUser(
              accountStatus,
            )) as typeof AxiosResponse;
            if (lockResult.data[data.user.id]) {
              $q.notify({
                type: 'positive',
                message: '取消啟用',
                position: 'top',
              });
            } else {
              $q.notify({
                type: 'negative',
                message: '取消啟用失敗',
                position: 'top',
              });
            }
            resetSelect();
            getData(pagination);
          } else {
            $q.notify({
              type: 'negative',
              message: '更改失敗',
              position: 'top',
            });
          }
        }),
      );
    } else {
      $q.notify({
        type: 'negative',
        message: '已驗證過失敗',
        position: 'top',
      });
    }

    return;
  }

  resetSelect();
  getData(pagination);
}

// 搜尋篩選物件 (filters)
const { filters } = searchFiltersGenerator(addressPlatesVerifyConfig);

// 驗證結果篩選
type VerifyResult = { confirmed: boolean; withoutReason: boolean };
const verifyResult = ref<{ label: string; value: VerifyResult }>();
const verifyResultOptions = [
  {
    label: '尚未驗證',
    value: {
      confirmed: false,
      withoutReason: true,
    },
  },
  {
    label: '驗證成功',
    value: {
      confirmed: true,
      withoutReason: true,
    },
  },
  {
    label: '驗證失敗',
    value: {
      confirmed: false,
      withoutReason: false,
    },
  },
];

// 取得分頁資料
async function getData(
  pagination: blockRefType['pagination'] = {
    filters: '',
    page: 1,
    rowsPerPage: 12,
  },
) {
  console.log('pagination', pagination);
  const payload = useCloned(pagination).cloned.value;
  // 產出 filters 物件 (filtersObject)
  const searchText = pagination.filters.trim();
  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    filters,
    searchText,
    'Validate',
  );
  if (verifyResult.value) {
    // 產出驗證結果物件並加進 filtersObject
    const verifyResultColumn = generateFilterColumnForVerifyResult(
      verifyResult.value.value,
    );
    if (verifyResultColumn) filtersObject.push(...verifyResultColumn);
    console.log('now filtersObject', filtersObject);
  }

  const jsonFilters = JSON.stringify(filtersObject);
  payload.filters = jsonFilters;
  // 加上 buildingId
  payload.buildingId = Bid.value;

  await getDataMixin(API, payload);

  blockAttrs.value.blockData.forEach((item) => {
    item.user.roleAddressPlates.push({
      addressPlates: [item.addressPlate],
    });
  });
  setBlockLoading(blockRef);
}

onMounted(() => {
  tabChange(blockTabs[0]);
});

function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log('tabChange', tab);

  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
  blockAttrs.value.blockTitle = tab.value;
  dialogAttrs.value.dialogTitle = tab.label;

  if (activeTab.value.value === 'addressPlates') {
    API = AddressplateVerify;
    nextTick(() => {
      blockAttrs.value.tableConfig = addressPlatesVerifyConfig;
      blockAttrs.value.headerButtons = [];
      blockAttrs.value.tableButtons = [];
    });
  }
}

function generateFilterColumnForVerifyResult(
  verifyResultValue: VerifyResult,
): FilterColumnCollection[] {
  console.log('now generateFilterColumnForVerifyResult', verifyResultValue);
  return [
    {
      logical: FilterColumnLogical.And,
      columns: [
        {
          logical: FilterColumnLogical.And,
          columnKey: {
            fieldName: 'AddressPlateConfirmed',
            typeName: 'Validate',
          },
          value: verifyResultValue.confirmed,
        },
      ],
    },
    {
      logical: FilterColumnLogical.And,
      columns: [
        {
          logical: FilterColumnLogical.And,
          columnKey: {
            fieldName: 'AddressPlateReason6',
            typeName: 'Validate',
          },
          value: verifyResultValue.withoutReason,
        },
      ],
    },
  ];
}

const verifyTextStyle = computed(() => (data: UserAddressPlateViewModel) => {
  const StyleObj = {
    colorStyle: '',
    result: '',
  };

  if (data.addressPlateConfirmed) {
    StyleObj.colorStyle = 'text-positive';
    StyleObj.result = '驗證成功';
  } else if (data.addressPlateConfirmed === false && data.addressPlateReason) {
    StyleObj.colorStyle = 'text-negative';
    StyleObj.result = '驗證失敗';
  } else if (data.addressPlateConfirmed === false) {
    StyleObj.colorStyle = 'text-grey';
    StyleObj.result = '尚未驗證';
  }
  return StyleObj;
});
</script>
