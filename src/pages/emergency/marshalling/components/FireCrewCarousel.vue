<template>
  <swiper-container
    v-if="props.carouselData.length"
    ref="swiperRef"
    class="swiper-container"
    :slides-per-view="1"
    :loop="true"
    :navigation="true"
    :allowTouchMove="allowTouchMove"
  >
    <swiper-slide
      class="swiper-slide"
      v-for="item in props.carouselData"
      :key="item.id"
      style="height: calc(100vh - 630px)"
    >
      <div class="flex full-width rounded-lg overflow-hidden q-mb-sm">
        <div
          class="flex items-center flex-grow-1 bg-primary text-white fz-16 text-bold q-pl-md"
          style="min-height: 52px"
        >
          {{ item.title }}
        </div>
        <AllFloors
          v-if="item.value === 'EvacuationGuideMap'"
          class="flex-grow-1"
          @handleSelect="handleSelectFloorForEva"
          @reset-data="evacuationRouteImg = ''"
          :initial-style="false"
          outlined
          filled
          dense
          :evacuationGuidePlan="true"
        />
        <AllFloors
          v-else-if="item.value === 'FireFloorPlan'"
          class="flex-grow-1"
          @handleSelect="handleSelectFireFloor"
          @reset-data="fireFloorImgUrl = ''"
          :initial-style="false"
          outlined
          filled
          dense
        />
        <AllFloors
          v-else-if="item.value === 'CameraScreen'"
          class="flex-grow-1"
          @handleSelect="handleSelectFloorForCCTV"
          :initial-style="false"
          outlined
          filled
          dense
          :just-floor-id="true"
        />
      </div>
      <!-- 避難引導圖 -->
      <template v-if="item.value === 'EvacuationGuideMap'">
        <span
          v-if="!evacuationRouteImg"
          class="flex flex-center text-grey fz-16 full-height"
        >
          請至相關資料設定避難引導圖
        </span>
        <div class="q-mx-lg" v-else>
          <img
            :src="evacuationRouteImg"
            @click="previewFileModel = true"
            alt="Evacuation Route Image"
          />
          <DialogFilePreview
            v-model="previewFileModel"
            :image-url="evacuationRouteImg"
          />
        </div>
      </template>
      <!-- 起火樓層平面圖 -->
      <template v-else-if="item.value === 'FireFloorPlan'">
        <span
          v-if="!fireFloorImgUrl"
          class="flex flex-center text-grey fz-16 full-height"
        >
          請至相關資料設定起火樓層平面圖
        </span>
        <div class="q-mx-lg" v-else>
          <CanvasStage ref="canvasStage" />
        </div>
      </template>
      <!-- 防災中心訊息框 -->
      <template v-else-if="item.value === 'EmergencyCenterMessage'">
        <div
          v-if="!separateData.emergencyMsgArray?.length"
          class="flex flex-center text-grey fz-16 full-height"
        >
          尚未有防災中心訊息
        </div>
        <div
          class="fz-16 q-px-lg"
          style="height: calc(100vh - 630px); overflow-y: auto"
          v-else
        >
          <div v-for="item in separateData.emergencyMsgArray" :key="item">
            <span>{{ item.submissionTime }}</span>
            <span>&nbsp; - &nbsp;</span>
            <span>
              <a
                v-if="item.textContent.includes('https://')"
                :href="item.textContent"
                target="_blank"
                style="text-decoration: underline; color: darkblue"
              >
                {{ item.textContent }}
              </a>
              <span v-else>{{ item.textContent }}</span>
            </span>
          </div>
        </div>
      </template>
      <!-- 設備動作狀況 -->
      <template v-else-if="item.value === 'EquipmentActionStatus'">
        <div
          v-if="!separateData?.deviceContentList?.length"
          class="flex flex-center text-grey fz-16 full-height"
        >
          尚未有設備動作狀況資料
        </div>
        <div
          class="fz-16 q-px-lg"
          style="height: calc(100vh - 630px); overflow-y: auto"
          v-else
        >
          <div
            v-for="(item, index) in separateData.deviceContentList"
            :key="index"
          >
            <div>
              <span>{{ item.dateTime }}</span>
              <span>&nbsp; - &nbsp;</span>
              <span v-if="item.buildingName">
                {{ item.buildingName }}&nbsp;
              </span>
              <span v-if="item.addressName || item.floorName">
                {{ item.addressName || item.floorName }}&nbsp;
              </span>
              <span v-if="item.areaName">
                {{ item.areaName }}&nbsp;&nbsp;
              </span>
              <span v-if="item.deviceName">
                {{ item.deviceName }}&nbsp;&nbsp;
              </span>
              <span v-if="item.status">{{ item.status }}</span>
            </div>
          </div>
        </div>
      </template>
      <!-- 攝影機畫面 -->
      <template v-else-if="item.value === 'CameraScreen'">
        <div
          style="height: calc(100vh - 630px); overflow-y: auto"
          v-if="cctvList.length"
        >
          <div
            class="q-mb-md q-pl-lg q-pr-md"
            v-for="(item, index) in cctvList"
            :key="index"
            :name="item.deviceId"
          >
            <CameraWebRTC :device-id="item.deviceId" :title="item.title" />
          </div>
        </div>
        <div v-else class="flex flex-center text-grey fz-16 full-height">
          該樓層沒有攝影機畫面
        </div>
      </template>
    </swiper-slide>
  </swiper-container>
</template>

<script setup lang="ts">
import Device, { DeviceViewModel } from "src/api/device";
import { carouselDataType, separateDataCarousel } from "../marshalling.type";
import AllFloors from "src/components/AllFloors.vue";
import CanvasStage from "src/pages/graphic/components/CanvasStage.vue";
// pinia
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";

import { TriggeredDeviceData, useSignalRStore } from "src/stores/signalR";
import { FloorViewModel } from "src/api/floors";

const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);

const signalRStore = useSignalRStore();
const { initialDetector, processRunning } = storeToRefs(signalRStore);

const $q = inject("$q") as typeof QVueGlobals;

const props = withDefaults(
  defineProps<{
    carouselData: carouselDataType[];
    separateData: separateDataCarousel;
  }>(),
  {
    carouselData: () => [],
    separateData: () => ({}),
  }
);

const allowTouchMove = ref(false);
const carouselData = computed(() => props.carouselData);
watch(
  carouselData,
  (newData) => {
    allowTouchMove.value =
      !!newData.find((item) => item.value === "FireFloorPlan") ||
      !!newData.find((item) => item.value === "CameraScreen");
  },
  { deep: true, immediate: true }
);

// Swiper
const swiperRef = ref();

// 斷面圖樓層

// 樓層 select
const evacuationRouteImg = ref("");
const fireFloorImgUrl = ref("");
const EvacuationGuideMapFloors = ref();
const FireFloorPlanFloors = ref();

watch(
  initialDetector,
  (val) => {
    if (val && Bid.value) {
      if (val.building.id !== Bid.value) return;
      if (processRunning.value) {
        handleSelectFireFloor((val as TriggeredDeviceData).floor);
      }
    }
  },
  { immediate: true, deep: true }
);

// if (floorsForBasicInfo.value) await floorsForBasicInfo.value.getAllFloors();

function handleSelectFloorForEva(
  floorData: { id: string; floorPlanID: number },
  url?: string
) {
  if (url) evacuationRouteImg.value = url;
}
const canvasStage = ref();
function handleSelectFireFloor(floorData: FloorViewModel, url?: string) {
  console.log("handleSelectFireFloor", floorData);

  if (!url) return;
  fireFloorImgUrl.value = url;
  nextTick(async () => {
    if (!canvasStage.value) return;
    canvasStage.value[0].clearCanvas();
    canvasStage.value[0].loadBackgroundImage(url);
    canvasStage.value[0].setStageSize(); // 先設定 Stage Size
    const jsonData = await canvasStage.value[0].getFloorGraphicJson(
      floorData.id
    );
    if (jsonData) canvasStage.value[0].loadShapeFromJson(jsonData); // 載入JsonData
    setTimeout(canvasStage.value[0].canvasObserver.stop, 1000); // 再次調整 Stage Size
    canvasStage.value[0].resetCanvas();
  });
}

// CCTV
const slide = ref<number>();

const cctvList = ref<
  {
    deviceId: number;
    title: string;
  }[]
>([
  // {
  //   deviceId: 34,
  //   title: "01 - 影印室",
  // },
]);

// 取得該樓層的cctv 資料
async function handleSelectFloorForCCTV(floorData: FloorViewModel) {
  const payload = { floorId: floorData.id };
  const result = (await Device.apiGetDeviceWithAddress(
    payload
  )) as typeof AxiosResponse;
  result.data.forEach((data: DeviceViewModel) => {
    if (data.deviceType.fullTypeValues.includes("nDeviceTypeList.OE.OE_CCTV")) {
      if (data.id) {
        const cctvData = {
          deviceId: data.id,
          title: `${data.location ? data.location + " - " : ""} ${data.name}`,
        };
        cctvList.value.push(cctvData);
      }
    }
  });
  if (cctvList.value.length) slide.value = cctvList.value[0].deviceId;
}

// 避難引導圖 preview
const previewFileModel = ref(false);
</script>

<style scoped lang="scss">
.swiper-container {
  // 左右鍵樣式控制
  --swiper-navigation-size: 26px;
  --swiper-navigation-top-offset: 55%;
  --swiper-navigation-sides-offset: 0px;
  --swiper-navigation-color: $primary;
  width: 100%;
  display: flex;
  flex-grow: 1;
  .swiper-slide {
    height: 100%;
    width: 100%;
  }
}
img {
  width: 100%;
  object-fit: contain;
}
:deep(.q-field--filled .q-field__control) {
  background: #f2f0e3;
}
</style>
