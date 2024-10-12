<template>
  <q-page class="q-pa-md flex">
    <div class="flex-grow-1">
      <div
        class="flex items-center q-mb-lg"
        :style="{ width: $q.screen.xs || $q.screen.sm ? '100%' : '15%' }"
      >
        <AllFloors
          class="full-width"
          @handleSelect="handleSelectFloorForCCTV"
          :initial-style="false"
          :just-floor-id="true"
        />
      </div>

      <div v-if="$q.screen.xs || $q.screen.sm">
        <div v-for="(item, index) in cctvList" :key="index">
          <CameraWebRTC
            class="q-mb-md"
            :device-id="item.deviceId"
            :title="item.title"
          />
        </div>
      </div>
      <div v-else style="height: calc(100vh - 160px)">
        <q-scroll-area class="fit" :visible="false" :thumb-style="thumbStyle">
          <div class="row q-col-gutter-md" v-if="cctvList.length">
            <div class="col-3" v-for="(item, index) in cctvList" :key="index">
              <CameraWebRTC :device-id="item.deviceId" :title="item.title" />
            </div>
          </div>
          <div v-else class="text-grey text-h6">
            此樓層尚未設置 <span class="text-bold">監視攝影機</span>
          </div>
        </q-scroll-area>
      </div>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { tempDataType } from "src/api/api.type";
import Device from "src/api/device";
const $q = inject("$q") as typeof QVueGlobals;

const thumbStyle = {
  right: "2px",
  borderRadius: "5px",
  backgroundColor: "white",
  width: "10px",
  opacity: "0.75",
};
const slide = ref<number>();

const cctvList = ref<
  {
    deviceId: number;
    title: string;
  }[]
>([]);

// 取得該樓層的cctv 資料
async function handleSelectFloorForCCTV(floorData: { id: number }) {
  const payload = { floorId: floorData.id };
  const result = (await Device.apiGetDeviceWithAddress(
    payload
  )) as typeof AxiosResponse;
  cctvList.value = [];
  nextTick(() => {
    result.data.forEach((data: tempDataType) => {
      if (
        data.deviceType.fullTypeValues.includes("nDeviceTypeList.OE.OE_CCTV")
      ) {
        const cctvData = {
          deviceId: data.id,
          title: `${data.location ? data.location + " - " : ""} ${data.name}`,
        };
        cctvList.value.push(cctvData);
      }
    });
    if (cctvList.value.length) slide.value = cctvList.value[0].deviceId;
  });
}
</script>

<style lang="scss" scoped>
.q-img__content > div {
  color: #000;
  background: rgba(243, 240, 240, 0.8);
}
.custom-caption {
  text-align: center;
  padding: 12px;
  color: #000;
  background: rgba(243, 240, 240, 0.8);
}
.q-carousel__slide,
.q-carousel .q-carousel--padding {
  padding: 0;
}
</style>
