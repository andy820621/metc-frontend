<template>
  <q-page class="q-pa-md">
    <h3 class="text-left text-bold" style="font-size: 1.55rem; margin: 0">
      展場設備控制
    </h3>
    <div class="row q-col-gutter-lg q-mt-md" style="font-size: 18px">
      <div class="col-3" v-for="item in deviceAddressControl" :key="item.id">
        {{ item.area }} {{ `${item.system}${item.number}` }}
        <q-btn @click="deviceControlAction(item)">動作</q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// api
import DeviceControl from "src/api/deviceControl";
// pinia
import { useDeviceAddressStore } from "src/stores/deviceAddress";
import { storeToRefs } from "pinia";
import { DeviceAddressViewModel } from "src/api/deviceAddress";
const deviceAddressStore = useDeviceAddressStore();
const { mitsubishi } = storeToRefs(deviceAddressStore);

const $q = inject("$q") as typeof QVueGlobals;

watch(
  mitsubishi,
  (newValue) => {
    console.log("mitsubishi", newValue);
  },
  { deep: true }
);

// 控制設備
async function deviceControlAction(deviceAddress: DeviceAddressViewModel) {
  const deviceId = deviceAddress.device.id;
  const { number } = deviceAddress;
  const result = (await DeviceControl.apiPostPresent(
    deviceId!,
    number!
  )) as typeof AxiosResponse;
  if (result.data.isSuccess) {
    $q.notify({
      type: "positive",
      message: "發送成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "發送失敗",
      position: "top",
    });
  }
}

// 讀取展場控制點位
const deviceAddressControl = ref<DeviceAddressViewModel[]>([]);
async function getPresentControl() {
  const result =
    (await DeviceControl.apiGetPresentControl()) as typeof AxiosResponse;
  deviceAddressControl.value = result.data;
}

onMounted(getPresentControl);
</script>
