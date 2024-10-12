<template>
  <SvgDropdownBtn
    text-color="black"
    auto-close
    svgName="building"
    :label="props.hasBuildingName ? buildingData?.name : ''"
  >
    <q-list
      separator
      padding
      :style="`min-width:${$props.minWidth}`"
      v-if="buildingDataList?.length"
    >
      <q-item
        clickable
        v-for="item in buildingDataList"
        :key="item.id"
        @click="selectBuilding(item)"
      >
        <slot name="BNData" :data="item">
          <q-item-section> {{ item.name }} </q-item-section>
        </slot>
      </q-item>
    </q-list>
  </SvgDropdownBtn>
</template>

<script setup lang="ts">
import { useBuildingStore } from "src/stores/building.js";
import { storeToRefs } from "pinia";
import { BuildingViewModel } from "src/api/building";

const buildingStore = useBuildingStore();
const { buildingData, buildingDataList } = storeToRefs(buildingStore);

const props = withDefaults(
  defineProps<{
    hasBuildingName?: boolean;
    minWidth?: string;
  }>(),
  {
    hasBuildingName: true,
    minWidth: "100px",
  }
);
// 選擇大樓
function selectBuilding(item: BuildingViewModel) {
  buildingData.value = item;
  // location.reload();
  if (buildingData.value) {
    localStorage.setItem("Bid", String(buildingData.value.id));
  }
  history.go(0);
}

defineExpose({ selectBuilding });
</script>

<style scoped></style>
