<template>
  <q-scroll-area class="fit" :visible="false" ref="scrollAreaRef">
    <div class="building" ref="floorDiv">
      <template
        v-for="formattedFloorOption in formattedFloorOptions"
        :key="formattedFloorOption.floorZindex"
      >
        <div
          class="cubeContainer"
          :style="{ zIndex: formattedFloorOption.floorZindex }"
        >
          <template
            v-for="floorData in formattedFloorOption.floorsData"
            :key="floorData.id"
          >
            <div
              class="cube"
              :class="[
                { select: floorData?.id == currentFloor?.id },
                { process: floorData?.id === fireFloor?.id },
                {
                  alert: alertFloor.find(
                    (floor) => floor?.id === floorData?.id
                  ),
                },
                {
                  spread: spreadFloor.find(
                    (floor) => floor?.id === floorData?.id
                  ),
                },
                { expandHover: formattedFloorOption.floorsData.length > 1 },
              ]"
              @click="handleSelect(floorData)"
            >
              <div class="face top">
                <span>{{ floorData.name }}</span>
              </div>
              <div class="face front"></div>
              <div class="face back"></div>
              <div class="face left"></div>
              <div class="face right"></div>
              <div class="face bottom"></div>
            </div>
          </template>
        </div>
      </template>
    </div>
  </q-scroll-area>
</template>
<script setup lang="ts">
// api
import { FloorViewModel } from "src/api/floors";
// pinia
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
import { TriggeredDeviceData, useSignalRStore } from "src/stores/signalR";
// utils
import fileRead from "src/utils/fileRead";
import { formatFloorsData } from "src/utils/formatUtils";
import { getFloorsData } from "src/utils/getFloorsData";

const signalRStore = useSignalRStore();
const { triggeredDevices, initialDetector } = storeToRefs(signalRStore);

const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);

const { getFile } = fileRead();
const $q = inject("$q") as typeof QVueGlobals;

const emit = defineEmits(["handleSelect"]);

const props = withDefaults(
  defineProps<{
    canvasContainerHeight: number;
  }>(),
  { canvasContainerHeight: 0 }
);

// 斷面圖樓層
watch(
  initialDetector,
  (val) => {
    if (val && Bid.value) {
      if (val.building.id !== Bid.value) return;

      fireFloor.value = (val as TriggeredDeviceData).floor;
      handleSelect(fireFloor.value);
    }
  },
  { deep: true }
);

onMounted(() => {
  const testtriggeredDevices = [
    {
      building: { id: Bid.value },
      floor: "floor1",
      floors: [],
      location: "",
      id: 1,
    },
    {
      building: { id: Bid.value },
      floor: "floor2",
      floors: ["floor2", "floor3", "floor4"],
      location: "",
      id: 2,
    },
    {
      building: { id: 2 },
      floor: "floor5",
      floors: [],
      location: "",
      id: 3,
    },
  ];

  function test(val: typeof testtriggeredDevices) {
    console.log("nowwwwwwwwwwww test val", val);

    const triggeredDevicesFloors = val
      .filter((item) => item.building.id === Bid.value)
      .flatMap((item) =>
        item.floors && item.floors.length > 0 ? item.floors : [item.floor]
      );

    // sort 值不重複
    // const uniqueSorts = Array.from(
    //   new Set(triggeredDevicesFloors.map((floor) => floor.sort))
    // );

    // // loop sort[] 找到对应的 floorOption[]
    // const correspondingFloorOptions = uniqueSorts.map((sort) =>
    //   floorOptions.find((floor) => floor.sort === sort)
    // ) as FloorViewModel[];

    return triggeredDevicesFloors;
  }

  const result = test(testtriggeredDevices);

  console.log("nowwwwwwwwwwww test", result);
});

watch(
  triggeredDevices,
  (val) => {
    // 產出延燒層
    if (val && Bid.value) {
      // 過濾出當前建築的被觸發的延燒探測器，並處理 floors/floor 數據
      const triggeredDevicesFloors = val
        .filter((item) => item.building.id === Bid.value)
        .flatMap((item) =>
          item.floors && item.floors.length > 0 ? item.floors : [item.floor]
        );

      // sort 值不重複
      const uniqueSorts = Array.from(
        new Set(triggeredDevicesFloors.map((floor) => floor.sort))
      );

      // loop sort[] 找到对应的 floorOption[]
      const correspondingFloorOptions = uniqueSorts.map((sort) =>
        floorOptions.find((floor) => floor.sort === sort)
      ) as FloorViewModel[];
      // filter 掉初始探測器樓層然後附值到 spreadFloor
      spreadFloor.value = correspondingFloorOptions.filter(
        (item) => item.id !== fireFloor.value?.id
      );
    }
  },
  { deep: true }
);

const currentFloor = ref<FloorViewModel>();
const floorOptions = reactive<FloorViewModel[]>([]);
const formattedFloorOptions = computed(() => formatFloorsData(floorOptions));
watch(
  formattedFloorOptions,
  (val) => {
    console.log("now formattedFloorOptions", val);
  },
  {
    immediate: true,
    deep: true,
  }
);
// 起火層
const fireFloor = ref();
//   {
//   id: 443,
// }
// 警示層
const alertFloor = ref<FloorViewModel[]>([]);
// 擴散層
const spreadFloor = ref<FloorViewModel[]>([]);
async function getAllFloors() {
  if (Bid.value) {
    floorOptions.length = 0;
    const floorResult = await getFloorsData(Bid.value);
    floorOptions.push(...floorResult);
    floorOptions.reverse();
    console.log("now floorOptions", floorOptions);
    if (floorOptions.length > 0) {
      if (
        initialDetector.value &&
        initialDetector.value.building.id === Bid.value
      ) {
        const { sort } = initialDetector.value.floor;
        if (sort) {
          currentFloor.value = fireFloor.value = floorOptions.find(
            (floor) => floor.sort === sort
          ) as FloorViewModel;
        }
      } else {
        currentFloor.value = floorOptions.find(
          (item) => item.sort === 1
        ) as FloorViewModel;
      }
      const floorZIndex: number[] = floorOptions
        .map((i, index) => index)
        .reverse();
      floorOptions.forEach((item, index) => {
        item.floorZIndex = floorZIndex[index];
      });
    }
  }
}
async function handleSelect(floorData: FloorViewModel) {
  await getFloorImage(floorData);
  scrollToFloor(floorData);
}
async function getFloorImage(floorData: FloorViewModel) {
  if (floorData) currentFloor.value = floorData;

  if (floorData?.floorPlanFileId) {
    const imageUrl = await getFile(null, floorData.floorPlanFileId);
    emit("handleSelect", currentFloor.value, imageUrl);
  } else {
    emit("handleSelect", currentFloor.value);
    $q.notify({
      type: "negative",
      message: "該樓層尚無平面圖",
      position: "top",
    });
  }
}

const floorDiv = ref();
const scrollAreaRef = ref();
watch(
  () => buildingStore.Bid,
  async (val) => {
    if (val) {
      await getAllFloors();
      if (currentFloor.value) handleSelect(currentFloor.value);
    }
  },
  { immediate: true }
);
// 找到 currentFloor 在 formattedFloorOptions 裡的索引
function findFloorIndex(targetFloorSort: number) {
  const nowFloorSort = targetFloorSort;
  const nowFloorIndex = formattedFloorOptions.value.findIndex(
    (formattedFloorOption) =>
      formattedFloorOption.floorZindex ===
      nowFloorSort * 2 + (formattedFloorOption.lastObjZindex as number)
  );
  return nowFloorIndex;
}
// 獲取滾動樓層資訊 & 滾動到樓層
function scrollToFloor(floor: FloorViewModel) {
  const { height } = floorDiv.value.getBoundingClientRect();
  const floorCount = formattedFloorOptions.value.length;
  const floorHeight = height / floorCount;
  const targetFloorIndex = findFloorIndex(floor.sort);
  const scrollDelta =
    targetFloorIndex * floorHeight - props.canvasContainerHeight / 2;

  nextTick(() => {
    scrollAreaRef.value.setScrollPosition("vertical", scrollDelta, 400);
  });

  // TODO: 確認上二下一警示是否還需要
  // 上二下一警示
  // if (!fireFloor.value) return;
  // const alertFloorArr = [];
  // for (let i = targetFloorIndex - 2; i <= targetFloorIndex + 1; i++) {
  //   if (i >= 0 && i < floorCount && i !== targetFloorIndex) {
  //     alertFloorArr.push(...formattedFloorOptions.value[i].floorsData);
  //   }
  // }
  // alertFloor.value = alertFloorArr;
  // console.log("alertFloor.value", alertFloor.value);
}
</script>
<style lang="scss" scoped>
.building {
  margin-top: 35px;
  width: 100%;
  padding-bottom: 50px;
}
.cubeContainer {
  // 顏色變數
  --floorColor: rgb(230, 235, 238);
  --floorLeftColor: rgb(175, 175, 175);
  --floorRightColor: rgb(131, 131, 131);
  --hoverColor: rgb(220, 165, 64);
  --processColor: #c61e1e;
  --alertColor: #f3a9a9;
  // 尺寸變數
  --floor-height: 10px;
  --cube-width: 180px;
  --cube-container-height: calc(var(--cube-width) * 7 / 20);
  --translate-delta: calc(var(--cube-width) / 2);

  position: relative;
  margin: 0 auto;
  // background-color: #ceacac98; // 測試用
  width: var(--cube-width);
  height: var(--cube-container-height);
  &:hover {
    .cube.expandHover {
      transform: rotateX(-30deg) rotateY(0deg)
        translateX(calc(-1 * var(--cube-width) / 2 - 10px));
      .top span {
        transform: rotateY(50deg) translateY(4rem);
      }
    }
    .cube.expandHover:nth-child(2) {
      transform: rotateX(-30deg) rotateY(0deg)
        translateX(calc(var(--cube-width) / 2 + 10px));
      span {
        display: initial;
      }
    }
  }
  .cube {
    // absolute position control
    position: absolute;
    top: 45%;
    left: 0;
    // style
    width: var(--cube-width);
    height: var(--floor-height);
    transform-style: preserve-3d;
    transform: rotateX(-30deg) rotateY(45deg);
    transition: 0.5s ease;
    cursor: pointer;
    &:nth-child(2) {
      z-index: -1;
      span {
        display: none;
      }
    }
    &:hover,
    &.select,
    &.process,
    &.alert {
      span {
        display: initial;
      }
    }

    &:hover {
      .top {
        background-color: var(--hoverColor);
      }
    }
    &.select {
      z-index: 1;
      .top {
        background-color: var(--hoverColor);
      }
    }
    &.process {
      z-index: 2;
      .top {
        color: #fff;
        background-color: var(--processColor);
        &:hover {
          box-shadow: 10px 10px 40px var(--processColor);
        }
      }
    }
    &.alert {
      z-index: 1;
      .top {
        background-color: var(--alertColor);
        &:hover {
          box-shadow: 10px 10px 40px var(--alertColor);
        }
      }
    }
    // 每一面都相同的設計
    .face {
      position: absolute;
      width: var(--cube-width);
      height: var(--cube-width);
      background: var(--floorColor);
      border: 1px solid #333;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 24px;
    }

    .left,
    .right,
    .back,
    .front {
      height: var(--floor-height);
    }

    .front {
      transform: translateZ(var(--translate-delta));
      background-color: var(--floorRightColor);
    }
    .back {
      transform: translateZ(calc(-1 * var(--translate-delta))) rotateY(180deg);
    }
    .left {
      background-color: var(--floorLeftColor);
      transform: rotateY(-90deg) translateZ(var(--translate-delta));
    }
    .right {
      transform: rotateY(90deg) translateZ(var(--translate-delta));
    }
    .top {
      transform: rotateX(90deg) translateZ(var(--translate-delta));
      span {
        text-align: center;
        font-size: 2rem;
        transform-style: preserve-3d;
        transition: all 0.5s ease;
        transform: rotateZ(45deg) rotateY(50deg) translateY(4rem) scaleY(1.2);
      }
    }
    .bottom {
      transform: rotateX(-90deg)
        translateZ(calc(-1 * (var(--translate-delta) - var(--floor-height))));
    }
  }
}
</style>
