<template>
  <q-card flat class="alertPannel">
    <q-splitter
      :horizontal="$q.screen.xs || $q.screen.sm"
      :unit="$q.screen.xs || $q.screen.sm ? '%' : 'px'"
      v-model="splitterModel"
    >
      <template v-slot:before>
        <q-tabs
          v-model="activeTab"
          vertical
          active-color="primary"
          active-bg-color="grey-4"
          class="alertSideTabs"
        >
          <q-tab
            v-for="tab in blockTabs"
            :key="tab.receiveDeviceAddressId"
            :name="tab.receiveDeviceAddressId"
            @click="tabChange(tab.receiveDeviceAddressId)"
          >
            <div class="row q-gutter-sm">
              <q-checkbox
                v-if="btnControl.showCheckedBtn"
                v-model="tab.isChecked"
              />
              <div class="deviceInfo">
                <div class="time">{{ tab.dateTime }}</div>
                <div class="label">{{ tab.device.name }}</div>
              </div>
            </div>
          </q-tab>
        </q-tabs>
      </template>

      <template v-slot:after>
        <q-tab-panels
          v-model="activeTab"
          animated
          swipeable
          vertical
          transition-prev="jump-up"
          transition-next="jump-up"
          class="full-height"
          style="background: transparent"
        >
          <q-tab-panel
            v-for="tab in blockTabs"
            :key="tab.receiveDeviceAddressId"
            :name="tab.receiveDeviceAddressId"
            class="deviceContent"
          >
            <AlertDeviceContent
              :deviceData="tab"
              :btnControl="btnControl"
              :invokeTabChange="tabChange"
            />
          </q-tab-panel>
        </q-tab-panels>
      </template>
    </q-splitter>
  </q-card>
</template>
<script setup lang="ts">
import { DeviceNotifyViewModel } from "src/api/deviceNotify";
// utils
import { useVModel } from "@vueuse/core";

// type
const $q = inject("$q") as typeof QVueGlobals;

// 左側導覽的寬度(%)
const splitterModel = ref($q.screen.xs || $q.screen.sm ? 50 : 326);
const props = withDefaults(
  defineProps<{
    alertDevicesDatas: DeviceNotifyViewModel[];
    checkAlllBtn?: boolean | null;
    btnControl: {
      showProccessedBtn?: boolean;
      showDeleteBtn?: boolean;
      showCheckedBtn?: boolean;
    };
  }>(),
  {
    btnControl: () => ({
      showProccessedBtn: false,
      showDeleteBtn: false,
      showCheckedBtn: false,
    }),
  }
);

const emit = defineEmits(["update:checkAlllBtn"]);
const checkAlllBtn = useVModel(props, "checkAlllBtn", emit);

const blockTabs = computed(() => props.alertDevicesDatas);
const activeTab = ref<DeviceNotifyViewModel["receiveDeviceAddressId"]>(
  blockTabs.value[0].receiveDeviceAddressId
);
let activeIndex = 0;
onMounted(() => {
  console.log("now blockTabs", blockTabs.value);
});

onMounted(tabChange);
async function tabChange(tab = blockTabs.value[0].receiveDeviceAddressId) {
  if (activeTab.value !== tab) {
    activeTab.value = tab;
    activeIndex = blockTabs.value.findIndex(
      (item) => item.receiveDeviceAddressId === tab
    );
  }
}

watch(
  () => blockTabs.value.length,
  () => {
    const newIndex = activeIndex - 1;
    const newTab = blockTabs.value[newIndex || 0];
    if (newTab) tabChange(newTab.receiveDeviceAddressId);
    else tabChange();
  }
);

// 多選
const selectedTabIds = computed(() => {
  return blockTabs.value
    .filter((item) => item.isChecked)
    .map((item) => item.receiveDeviceAddressId);
});

function clearSlectedTabIds() {
  blockTabs.value.forEach((item) => {
    item.isChecked = false;
  });
}

watch(
  selectedTabIds,
  (val) => {
    if (val.length === blockTabs.value.length && !checkAlllBtn.value) {
      checkAlllBtn.value = true;
    } else if (
      val.length !== blockTabs.value.length &&
      (checkAlllBtn.value || checkAlllBtn.value === null)
    ) {
      if (val.length === 0) checkAlllBtn.value = false;
      else checkAlllBtn.value = null;
    }
  },
  { immediate: true }
);
watch(checkAlllBtn, (val) => {
  if (val) {
    if (selectedTabIds.value.length !== blockTabs.value.length) {
      blockTabs.value.forEach((item) => {
        item.isChecked = true;
      });
    }
  } else if (val === false) clearSlectedTabIds();
});

defineExpose({
  selectedTabIds,
  clearSlectedTabIds,
});
</script>

<style lang="scss">
.alertPannel {
  --pannel-height: 490px;
  @media screen and (max-width: 768px) {
    --pannel-height: 250px;
    .q-splitter__panel {
      // padding-top: 1rem;
      &.q-splitter__before,
      &.q-splitter__after {
        border-radius: 0.4rem;
        overflow: hidden;
      }
    }
  }
  .q-splitter__before {
    border: 2px solid rgb(196, 196, 196);
    padding: 0;
  }
  .q-splitter__after {
    border: 2px solid rgb(196, 196, 196);
    padding: 0;
    @media screen and (max-width: 768px) {
      margin-top: 1rem;
    }
  }

  .deviceInfo {
    width: fit-content;
    .time {
      font-size: 17px;
      letter-spacing: 0.1rem;
      @media screen and (max-width: 768px) {
        font-size: 14px;
      }
    }
    .label {
      font-size: 22px;
      font-weight: bold;
      letter-spacing: 0.15rem;
      @media screen and (max-width: 768px) {
        font-size: 18px;
      }
    }
  }

  .alertSideTabs {
    // border: 2px solid rgb(196, 196, 196);
    height: var(--pannel-height);
    .q-tab {
      text-align: left;
      justify-content: flex-start;
      border-bottom: 2px solid rgb(196, 196, 196);
      padding: 0.2rem 0.8rem;
    }

    .q-tabs__content {
      overflow: scroll;
    }
  }
  .q-splitter__separator {
    margin-right: 1.5rem;
  }
  .deviceContent {
    height: var(--pannel-height);
    // border: 2px solid rgb(196, 196, 196);
    padding: 1rem 1.6rem;
    @media screen and (max-width: 768px) {
      padding: 18px 21px;
    }
  }
}
:deep(.q-splitter__panel.q-splitter__before) {
  margin-top: 0 !important;
}
</style>
