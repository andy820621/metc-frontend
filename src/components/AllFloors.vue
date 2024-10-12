<template>
  <q-select
    v-model="currentFloor"
    :options="floorOptions"
    option-label="name"
    @update:model-value="handleSelect($event)"
    :class="{ 'q-mr-md': initialStyle }"
  >
    <template v-slot:selected-item="scope">
      <span>{{ `樓層 ${scope.opt.name}` }}</span>
    </template>
  </q-select>
</template>

<script setup lang="ts">
// api
import { FloorViewModel } from "src/api/floors";
// pinia store
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
import { useSignalRStore } from "src/stores/signalR";
import AddressPlate from "src/api/addressPlate";
// utils
import { getFloorsData } from "src/utils/getFloorsData";

import fileRead from "src/utils/fileRead";
const { getFile } = fileRead();

const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);

const signalRStore = useSignalRStore();
const { initialDetector } = storeToRefs(signalRStore);

const props = withDefaults(
  defineProps<{
    initialStyle?: boolean;
    evacuationGuidePlan?: boolean;
    justFloorId?: boolean;
    initialFloorId?: number;
  }>(),
  {
    initialStyle: true,
  }
);

const $q = inject("$q") as typeof QVueGlobals;

const emit = defineEmits(["handleSelect", "resetData"]);
// 樓層 select
const floorOptions = ref<FloorViewModel[]>([]);
const currentFloor = ref();

watch(
  Bid,
  async (val) => {
    if (val) await getAllFloors();
  },
  { immediate: true }
);
async function getAllFloors() {
  if (Bid.value) {
    if (!floorOptions.value.length) {
      floorOptions.value = await getFloorsData(Bid.value); // 獲取樓層資料
    }
    if (floorOptions.value.length > 0) {
      console.log("now currentFloor.value", currentFloor.value);
      console.log("now props.initialFloorId", props.initialFloorId);
      if (currentFloor.value) {
        handleSelect(currentFloor.value);
      } else if (props.initialFloorId) {
        const initialFloor = floorOptions.value.find(
          (item) => item.id === props.initialFloorId
        );
        if (initialFloor) handleSelect(initialFloor);
      } else if (initialDetector.value) {
        if (props.evacuationGuidePlan) {
          const pagination = {
            filters: "",
            page: 1,
            rowsPerPage: 25,
          };
          const result = (await AddressPlate.apiGetDataByUser(
            pagination
          )) as typeof AxiosResponse;
          handleSelect(result.data.rows[0].floor);
        } else {
          handleSelect(initialDetector.value.floor);
        }
      } else {
        console.log("now go to firstfloor");
        const firstFloor = floorOptions.value.find((item) => item.sort === 1);
        if (firstFloor) handleSelect(firstFloor);
      }
    }
  }
}

// watch(
//   initialDetector,
//   (val) => {
//     if (val && Bid.value) {
//       if (val.building.id !== Bid.value) return;
//       handleSelect((val as TriggeredDeviceData).floor);
//     }
//   },
//   { deep: true }
// );
function handleSelect(floorData: FloorViewModel) {
  if (props.justFloorId) {
    currentFloor.value = floorData;
    emit("handleSelect", floorData);
  } else {
    getFloorImage(floorData);
    console.log("floorData", floorData);
  }
}
async function getFloorImage(floorData: FloorViewModel) {
  if (floorData) currentFloor.value = floorData;

  // 選擇避難引導圖
  if (props.evacuationGuidePlan) {
    if (floorData.evacuationRouteFileId) {
      const imageUrl = await getFile(null, floorData.evacuationRouteFileId);
      emit("handleSelect", currentFloor.value, imageUrl);
    } else {
      $q.notify({
        type: "negative",
        message: "該樓層尚無平面圖",
        position: "top",
      });
      emit("resetData");
      emit("handleSelect", currentFloor.value);
    }
  } else {
    // 選擇起火樓層平面圖
    if (floorData.floorPlanFileId) {
      const imageUrl = await getFile(null, floorData.floorPlanFileId);
      emit("handleSelect", currentFloor.value, imageUrl);
    } else {
      $q.notify({
        type: "negative",
        message: "該樓層尚無平面圖",
        position: "top",
      });
      emit("resetData");
      emit("handleSelect", currentFloor.value);
    }
  }

  console.log("currentFloor.value", currentFloor.value);
}
defineExpose({ currentFloor, getAllFloors, handleSelect });
</script>
