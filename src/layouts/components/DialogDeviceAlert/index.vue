<template>
  <q-dialog ref="dialogRef" @show="deviceAlertStore.getDeviceNotifyData">
    <q-card
      :style="$q.platform.is.mobile ? 'width:auto' : 'min-width: 1100px'"
      class="q-pa-md"
    >
      <q-toolbar>
        <q-toolbar-title class="text-bold"> 異常警示通知 </q-toolbar-title>

        <div class="alertSetting">
          <span class="text-subtitle1"> 是否允許永遠自動彈出該視窗? </span>
          <span class="radios">
            <q-radio
              v-model.number="ifAutoShowDeviceAlertDialog"
              :val="1"
              label="是"
            />
            <q-radio
              v-model.number="ifAutoShowDeviceAlertDialog"
              :val="0"
              label="否"
            />
          </span>
        </div>

        <q-btn
          :icon="fasMinus"
          flat
          round
          dense
          v-close-popup
          style="margin-left: auto"
        />
      </q-toolbar>

      <q-card-section>
        <q-tabs
          v-model="activeTab"
          class="text-primary text-bold alertTabs text-subtitle1"
          :class="{ twoTabsPerRow: $q.screen.xs || $q.screen.sm }"
          align="justify"
          :active-color="$q.screen.xs || $q.screen.sm ? '' : 'white'"
          :active-bg-color="$q.screen.xs || $q.screen.sm ? '' : 'primary'"
          :indicator-color="$q.screen.xs || $q.screen.sm ? '' : 'primary'"
          narrow-indicator
        >
          <q-tab
            :name="blockTabNames.notProcessedYet"
            @click="tabChange(blockTabNames.notProcessedYet)"
          >
            未處理 ({{ processingAlertDevice.length }})
          </q-tab>
          <q-tab
            :name="blockTabNames.processed"
            @click="tabChange(blockTabNames.processed)"
          >
            已通知 ({{ processedAlertDevice.length }})
          </q-tab>
        </q-tabs>

        <!-- <q-separator /> -->
        <div class="flex q-my-md" style="gap: 1rem">
          <q-btn
            v-if="showCheckedBtn && processedAlertDevice.length"
            :color="checkAlll ? 'primary' : undefined"
            class="q-px-md"
            @click="checkAlll = !checkAlll"
            dense
          >
            全選
          </q-btn>
          <q-btn
            v-if="showDeleteAllBtn && processedAlertDevice.length"
            color="primary"
            class="q-px-md"
            @click="handleDeleteAll"
            dense
          >
            刪除勾選的項目
          </q-btn>
        </div>

        <q-tab-panels
          v-model="activeTab"
          style="background: transparent"
          animated
          :swipeable="$q.screen.xs || $q.screen.sm"
        >
          <q-tab-panel
            :name="blockTabNames.notProcessedYet"
            class="q-pa-none"
            :style="{
              'margin-block':
                processingAlertDevice.length && processedAlertDevice.length
                  ? '1rem'
                  : 'inherit',
            }"
          >
            <template v-if="processingAlertDevice.length">
              <AlertPannel
                :btn-control="{ showProccessedBtn: true }"
                :alertDevicesDatas="processingAlertDevice"
              />
            </template>
            <div
              v-else
              class="no-data-message"
              :class="{
                withMargin:
                  !processingAlertDevice.length && processedAlertDevice.length,
              }"
            >
              <div class="before">尚未有資料</div>
              <div class="after">尚未有資料</div>
            </div>
          </q-tab-panel>

          <q-tab-panel :name="blockTabNames.processed" class="q-pa-none">
            <template v-if="processedAlertDevice.length">
              <AlertPannel
                ref="alertPannelWithDeleteBtn"
                v-model:checkAlllBtn="checkAlll"
                :btn-control="{ showDeleteBtn: true, showCheckedBtn }"
                :alertDevicesDatas="processedAlertDevicesDatas"
              />
            </template>
            <div v-else class="no-data-message">
              <div class="before">尚未有資料</div>
              <div class="after">尚未有資料</div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// icon
import { fasMinus } from "@quasar/extras/fontawesome-v6";
// pinia store
import { storeToRefs } from "pinia";
import deviceNotify from "src/api/deviceNotify";
import { useDeviceAlertStore } from "src/stores/deviceAlert";

const deviceAlertStore = useDeviceAlertStore();
const {
  ifAutoShowDeviceAlertDialog,
  processingAlertDevice,
  processedAlertDevice,
} = storeToRefs(deviceAlertStore);

// 已通知資料新增 isChecked 屬性 (用於多選)
const processedAlertDevicesDatas = computed(() =>
  processedAlertDevice.value.map((item) => {
    item.isChecked = false;
    return item;
  })
);

onMounted(deviceAlertStore.getDeviceNotifyData);

// Tabs
const activeTab = ref();
const blockTabNames = {
  notProcessedYet: "notProcessedYet",
  processed: "processed",
};
// Tabs Data

// Tabs Methods
onMounted(tabChange);
function tabChange(tab = blockTabNames.notProcessedYet) {
  activeTab.value = tab;
}

// 是否允許設備異常永遠自動彈出該視窗?
watch(ifAutoShowDeviceAlertDialog, (newValue) => {
  localStorage.setItem("ifAutoShowDeviceAlertDialog", `${newValue}`);
});

const $q = inject("$q") as typeof QVueGlobals;

// 多選刪除相關參數與邏輯
const alertPannelWithDeleteBtn = ref();
const checkAlll = ref(false);
const seletedAlertDataIds = computed<number[]>(() => {
  return alertPannelWithDeleteBtn.value
    ? alertPannelWithDeleteBtn.value.selectedTabIds
    : [];
});
const showCheckedBtn = computed(
  () => activeTab.value === blockTabNames.processed
);
const showDeleteAllBtn = computed(
  () => showCheckedBtn && seletedAlertDataIds.value.length
);
async function handleDeleteAll() {
  const result = await deviceNotify.apiDeleteData(seletedAlertDataIds.value);

  if (result.data) {
    await deviceAlertStore.getDeviceNotifyData();
    $q.notify({
      type: "positive",
      message: "刪除成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "刪除失敗",
      position: "top",
    });
  }

  if (alertPannelWithDeleteBtn.value) {
    alertPannelWithDeleteBtn.value.clearSlectedTabIds();
  }
}
</script>

<style scoped lang="scss">
.q-toolbar {
  display: grid;
  align-items: center;
  grid-template-columns: auto 1fr auto;
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }

  .alertSetting {
    display: flex;
    align-items: center;
    justify-content: center;
    justify-content: flex-end;
    margin-right: 2.4rem;
    & > span:nth-child(1) {
      color: #888;
    }
    @media screen and (max-width: 768px) {
      grid-row: 2 / 3;
      grid-column: 1 / 3;
      display: flex;
      justify-content: space-between;
      margin-right: 0;
      padding: 0 0.6rem;
    }
  }
}
.q-toolbar__title {
  font-size: 27px;
  @media screen and (max-width: 768px) {
    font-size: 20px;
  }
}
:deep(.twoTabsPerRow) {
  .q-tabs__content {
    padding: 0;
  }
}
@media screen and (max-width: 768px) {
  .q-tab-panel,
  .q-toolbar {
    padding: 0;
  }
  .q-card__section {
    padding: 0.5rem 0;
  }
}
.alertTabs {
  border: 2px solid rgb(196, 196, 196);
  @media screen and (max-width: 768px) {
    border: none;
  }
}

.no-data-message {
  --pannel-height: 490px;

  &.withMargin {
    margin-block: 18px;
  }

  text-align: center;
  font-size: 1.4rem;
  color: #666;
  display: flex;
  justify-content: space-between;
  gap: 1rem;

  .before,
  .after {
    border: 2px solid rgb(196, 196, 196);
    height: var(--pannel-height);
    display: grid;
    place-items: center;
  }
  .before {
    width: 326px;
  }
  .after {
    flex: 1;
  }

  @media screen and (max-width: 768px) {
    --pannel-height: 455px;
    flex-direction: column;

    .before,
    .after {
      border-radius: 0.4rem;
      overflow: hidden;
    }
    .before {
      display: none;
    }
    .after {
      flex: initial;
    }
  }
}
</style>
