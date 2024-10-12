<template>
  <q-page class="q-pa-md flex">
    <div class="flex-grow-1">
      <div
        class="text-bold q-mb-sm"
        :class="
          $q.screen.xs || $q.screen.sm ? 'text-h5 q-mb-md' : 'text-h4 q-py-md'
        "
      >
        系統設定
      </div>
      <div
        :class="{
          'border-1 rounded-lg overflow-hidden': $q.screen.xs || $q.screen.sm,
        }"
      >
        <q-tabs
          v-model="activeTab.value"
          class="text-inactiveTab"
          active-color="activeTab"
          indicator-color="activeTab"
          align="left"
          narrow-indicator
          :class="{
            'twoTabsPerRow bg-white': $q.screen.xs || $q.screen.sm,
          }"
        >
          <q-tab
            v-for="(tab, index) in blockTabs"
            :key="index"
            :name="tab.value"
            :label="tab.label"
            @click="tabChange(tab)"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels
          v-model="activeTab.value"
          :style="
            $q.screen.xs || $q.screen.sm
              ? 'height: calc(100vh - 300px)'
              : 'height: calc(100vh - 215px); background: transparent'
          "
          animated
          :swipeable="$q.screen.xs || $q.screen.sm"
        >
          <q-tab-panel
            v-for="(tab, index) in blockTabs"
            :key="index"
            :name="tab.value"
            class="q-pr-none"
          >
            <!-- 通用設定 -->
            <GeneralSettings v-if="tab.value === 'generalSettings'" />
            <!-- 緊急應變相關設定 -->
            <EmergencySettings v-else-if="tab.value === 'emergencySettings'" />
          </q-tab-panel>
        </q-tab-panels>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import GeneralSettings from "./components/generalSettings.vue";
import EmergencySettings from "./components/emergencySettings.vue";
import DeviceGlobalSettings from "./components/deviceGlobalSettings.vue";

const $q = inject("$q") as typeof QVueGlobals;

const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "通用設定",
    value: "generalSettings",
  },
  {
    label: "緊急應變相關設定",
    value: "emergencySettings",
  },
];

onMounted(tabChange);

function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log("tabChange", tab);

  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
}
</script>

<style lang="scss" scoped>
.screenSettingContainer {
  width: fit-content;
  display: grid;
  gap: 2rem;
  font-size: clamp(1rem, 1vw, 1.1rem);
  .title {
    font-size: 1.15rem;
    font-weight: 600;
  }
  .q-btn {
    justify-self: flex-end;
    margin-top: 1rem;
  }
}
.canHover {
  cursor: grab;
  padding-right: 1rem;
  transition: background-color 0.3s;
  border-radius: 0.24rem;
  &:hover {
    background-color: #d1d0d0b4;
  }
}
</style>
