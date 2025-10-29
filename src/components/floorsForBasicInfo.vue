<template>
  <q-card class="this-page-variable col-shrink" style="height: fit-content">
    <q-toolbar class="text-primary text-h6 text-bold justify-center q-pt-md">
      樓層示意圖
    </q-toolbar>

    <q-toolbar
      class="q-py-md justify-center"
      style="width: clamp(300px, 20vw, 450px)"
    >
      <q-tabs
        v-model="floorTab"
        shrink
        active-color="white"
        active-bg-color="primary"
        dense
        outside-arrows
      >
        <q-tab
          v-for="item in floorsTabsArray"
          :key="item.key"
          :name="item.key"
          :label="item.key"
          @click="handleClickFloorGroup(item)"
        />
      </q-tabs>
    </q-toolbar>

    <q-card-section class="building" ref="floorDiv">
      <!-- <div class="building" ref="floorDiv"> -->
      <template
        v-for="formattedFloorOption in finalFloorsData"
        :key="formattedFloorOption.floorZindex"
      >
        <div
          class="cubeContainer"
          :style="{ zIndex: formattedFloorOption.floorZindex }"
        >
          <template
            v-for="(floorData, index) in formattedFloorOption.floorsData"
            :key="index"
          >
            <div
              class="cube"
              :class="[
                { select: floorData.id == currentFloor?.id },
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
      <!-- </div> -->
    </q-card-section>
  </q-card>
</template>
<script setup lang="ts">
// api
import type { FloorViewModel } from 'src/api/floors';
// pinia store
import { useBuildingStore } from 'src/stores/building.js';
import { storeToRefs } from 'pinia';

// utils
import useFileRead from 'src/utils/fileRead';
import { formatFloorsData } from 'src/utils/formatUtils';
import type { formattedFloorOption } from 'src/utils/formatUtils';
import { getFloorsData } from 'src/utils/getFloorsData';

const { getFile } = useFileRead();
const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);
const $q = useQuasar();

const emit = defineEmits(['handleSelect']);

// 斷面圖樓層
const floorsData = reactive<FloorViewModel[]>([]);

const currentFloor = ref<FloorViewModel>();
defineExpose({ currentFloor, getAllFloors });

// 分層斷面圖
const undergroundFloorsObject = computed(() => {
  const undergroundFloors = floorsData.filter((floor) => floor.isUnderground);
  return { 地下樓層: formatFloorsData(undergroundFloors) };
});
const overgroundFloorsObject = computed(() => {
  const overgroundFloors = floorsData.filter((floor) => !floor.isUnderground);

  const result: { [key: string]: formattedFloorOption[] } = {};
  const tempArray: FloorViewModel[] = [];
  let startKey = 0;
  const range = 10;
  let endNum = startKey + range;

  overgroundFloors.forEach((floor, index) => {
    const floorNum = floor.sort;
    if (floorNum > startKey && floorNum < endNum) {
      tempArray.push(floor);
    } else {
      const keyName =
        tempArray[0].name + ' ~ ' + tempArray[tempArray.length - 1].name;
      result[keyName] = [...formatFloorsData(tempArray)];
      tempArray.length = 0;
      startKey = endNum;
      endNum += range;
      tempArray.push(floor);
    }
    if (index === overgroundFloors.length - 1) {
      const keyName =
        tempArray[0].name + ' ~ ' + tempArray[tempArray.length - 1].name;
      result[keyName] = [...formatFloorsData(tempArray)];
    }
  });
  return result;
});
const combinedFloorsObject = computed(() => ({
  ...undergroundFloorsObject.value,
  ...overgroundFloorsObject.value,
}));

const floorTab = ref();
const floorsTabsArray = ref<{ key: string }[]>([]);

watch(
  () => combinedFloorsObject.value,
  async (val) => {
    if (floorsData.length && val && Object.keys(val).length) {
      floorsTabsArray.value.length = 0;
      Object.keys(val).forEach((key) => {
        floorsTabsArray.value.push({ key });
      });

      if (currentFloor.value) {
        const currentTab = floorTab.value;
        const currentFinalFloorsData = val[currentTab as keyof typeof val];
        finalFloorsData.value = currentFinalFloorsData;

        const newCurrentFloor = currentFinalFloorsData
          .flatMap((item) => item.floorsData)
          .find((floor) => floor.id === currentFloor.value.id);
        if (newCurrentFloor) {
          currentFloor.value = newCurrentFloor;
        }

        await handleSelect(currentFloor.value);
      } else {
        const [activeKey, activeValue] = Object.entries(
          overgroundFloorsObject.value,
        )[0];

        if (activeKey) {
          floorTab.value = activeKey;
          finalFloorsData.value = activeValue;
          const firstFloor = finalFloorsData.value.find(
            (item) => item.floorsData[0].sort === 1,
          )?.floorsData[0];
          if (firstFloor) await handleSelect(firstFloor);
        }
      }
    }
  },
);
const finalFloorsData = ref<formattedFloorOption[]>([]);

async function getAllFloors() {
  if (Bid.value) {
    const result = await getFloorsData(Bid.value);
    floorsData.length = 0;
    floorsData.push(...(result as FloorViewModel[]));
  }
}
function setFloorZIndex(array: FloorViewModel[]) {
  const floorZIndex: number[] = array.map((i, index) => index);
  array.forEach((item, index) => {
    item.floorZIndex = floorZIndex[index];
  });
}
async function handleSelect(floorData: FloorViewModel) {
  await getFloorImage(floorData);
}
async function getFloorImage(floorData: FloorViewModel) {
  console.log('now getFloorImage', floorData);
  if (!floorData) return;
  currentFloor.value = floorData;

  if (!floorData.floorPlanFileId) {
    emit('handleSelect', currentFloor.value);
    return;
  }

  if (floorData.floorPlanFileId) {
    console.log('now floorPlanFileId', floorData.floorPlanFileId);
    const imageUrl = await getFile(null, floorData.floorPlanFileId);
    emit('handleSelect', currentFloor.value, imageUrl);
  } else {
    emit('handleSelect', currentFloor.value);
    $q.notify({
      type: 'negative',
      message: '該樓層尚無平面圖',
      position: 'top',
    });
  }
}

const floorDiv = ref();
watch(
  () => buildingStore.Bid,
  async (val) => {
    if (val) await getAllFloors();
  },
  { immediate: true },
);

function handleClickFloorGroup(group: { key: string }) {
  setFinalFloorsData(group.key);
}
function setFinalFloorsData(key: string) {
  finalFloorsData.value =
    combinedFloorsObject.value[key as keyof typeof combinedFloorsObject.value];
}
</script>

<style lang="scss" scoped>
.this-page-variable {
  --building-margin-top: 30px;
  padding-bottom: var(--building-margin-top);
}
.building {
  margin-top: var(--building-margin-top);
  width: 100%;
}
.cubeContainer {
  // 顏色變數
  --floorColor: rgb(230, 235, 238);
  --floorLeftColor: rgb(175, 175, 175);
  --floorRightColor: rgb(131, 131, 131);
  --hoverColor: rgb(220, 165, 64);
  --processColor: #ff4e4e;
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
