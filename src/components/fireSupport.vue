<template>
  <q-dialog seamless v-model="visible">
    <q-card
      :style="[
        dialogStyle,
        $q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 500px',
      ]"
    >
      <q-toolbar
        class="text-white bg-primary"
        style="cursor: grab"
        v-touch-pan.mouse="onPan"
      >
        <q-toolbar-title class="text-bold">消防支援</q-toolbar-title>
        <q-btn dense flat icon="close" v-close-popup />
      </q-toolbar>
      <div class="flex justify-center">
        <div class="flex-grow-1 column q-gutter-md q-pa-md">
          <div class="text-h6 text-bold text-negative text-center q-mb-lg">
            立即前往
          </div>
          <q-btn
            outline
            v-close-popup
            color="negative"
            @click="router.push('/emergency/emergencyPplStatus')"
          >
            前往人員名冊</q-btn
          >
          <q-btn
            outline
            v-close-popup
            color="negative"
            @click="router.push('/emergency/emergencyDeviceStatus')"
          >
            前往設備狀況
          </q-btn>
        </div>
        <div class="flex-grow-1">
          <AllFloors
            class="floors-select q-ma-md"
            @handleSelect="handleSelect"
            :justFloorId="true"
            :initialFloorId="nowFloorId"
            outlined
            filled
            dense
            :evacuationGuidePlan="true"
          />

          <q-card-section
            align="center"
            class="row justify-center column q-my-md"
            style="gap: 1rem"
          >
            <template
              v-if="
                formatedByDeviceType && Object.keys(formatedByDeviceType).length
              "
            >
              <q-btn
                outline
                v-for="btnName in Object.keys(formatedByDeviceType)"
                :key="btnName"
                :label="btnName"
                color="primary"
                :disable="!Object.keys(formatedByDeviceType[btnName]).length"
              >
                <q-menu>
                  <q-list dense style="min-width: 100px">
                    <template
                      v-for="([deviceType, deviceArray], idx) in Object.entries(
                        formatedByDeviceType[btnName]
                      )"
                      :key="idx"
                    >
                      <q-item clickable>
                        <q-item-section>{{ deviceType }}</q-item-section>
                        <q-item-section side>
                          <q-icon name="keyboard_arrow_right" />
                        </q-item-section>

                        <q-menu anchor="top end" self="top start">
                          <q-list>
                            <q-item
                              v-for="device in deviceArray"
                              :key="device.id"
                              dense
                              :disable="!device.control.length"
                            >
                              <!-- <template v-if="btnName === '連動停止狀態'">
                            <q-item-section>{{ device.name }}</q-item-section>
                          </template> -->

                              <q-item-section class="q-mr-md">
                                {{ device.name }}
                              </q-item-section>

                              <template v-if="device.control.length">
                                <q-separator vertical />

                                <q-item-section side>
                                  <div class="row q-my-xs" style="gap: 0.5rem">
                                    <template
                                      v-for="(item, i) in device.control"
                                      :key="i"
                                    >
                                      <q-btn-group push>
                                        <q-btn
                                          dense
                                          padding=".24rem .8rem"
                                          push
                                          :label="btn.name"
                                          :color="
                                            btn.name === device.value
                                              ? 'primary'
                                              : undefined
                                          "
                                          v-for="btn in item.deviceStatuses"
                                          :key="btn.name"
                                          @click="
                                            handleClickDeviceBtn(
                                              btn,
                                              item.deviceAddress,
                                              item.deviceStatuses.length,
                                              device
                                            )
                                          "
                                        />
                                      </q-btn-group>
                                    </template>
                                  </div>
                                </q-item-section>
                              </template>
                            </q-item>
                          </q-list>
                        </q-menu>
                      </q-item>
                    </template>
                  </q-list>
                </q-menu>
              </q-btn>
            </template>
          </q-card-section>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
// pinia
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
// api
import Device, { DeviceStatusViewModel, DeviceStatus } from "src/api/device";
import DeviceControl from "src/api/deviceControl";
// utils
import { useVModel } from "@vueuse/core";
// type
import {
  fatek03Control,
  useDeviceAddressStore,
} from "src/stores/deviceAddress";
import type { DeviceAddressViewModel } from "src/api/device";
import { TouchPanValue } from "quasar";
import type { FloorViewModel } from "src/api/floors";

const deviceAddressStore = useDeviceAddressStore();
const { fatek03 } = storeToRefs(deviceAddressStore);

const buildingStore = useBuildingStore();
const { nowFloorId } = storeToRefs(buildingStore);

const router = useRouter();

const $q = inject("$q") as typeof QVueGlobals;

interface FormatedDeviceData {
  [addressString: string]: DeviceStatusViewModel;
}
interface FormatedDeviceDataObject {
  [driver: string]: FormatedDeviceData;
}
const formatedByDeviceType = ref<{
  [supportBtnName: string]: {
    [deviceTypeName: string]: DeviceStatusViewModel[];
  };
}>({});
const formatedDeviceDataObject: FormatedDeviceDataObject = {};

const props = withDefaults(
  defineProps<{
    visible: boolean;
  }>(),
  { visible: false }
);
const emit = defineEmits(["update:visible"]);

const visible = useVModel(props, "visible", emit);

function handleSelect(floorData: FloorViewModel) {
  nowFloorId.value = floorData.id;
}

async function getFireSupportObject(payload: { floorId: number }) {
  const result = (await Device.apiGetFireSupports(
    payload
  )) as typeof AxiosResponse;
  if (result.data) {
    console.log("now result", result.data);
    for (const key in result.data) {
      formatedByDeviceType.value[key] = {};
      console.log("now key", key);
      result.data[key].forEach((device: DeviceStatusViewModel) => {
        // 根據設備 dviceType 分類
        const { name } = device.deviceType;
        if (!formatedByDeviceType.value[key][name]) {
          formatedByDeviceType.value[key][name] = [];
        }
        formatedByDeviceType.value[key][name].push(device);

        // 跟據點位產出對照用的物件
        device.state.forEach((point) => {
          const { master, system, address, number } = point;
          if (!master) return;
          const { driver } = master.deviceType as { driver: string };
          const addressString = `${system}-${address}-${number}`;

          if (!formatedDeviceDataObject[driver]) {
            formatedDeviceDataObject[driver] = {};
          }

          if (fatek03.value && fatek03.value.points[addressString]) {
            device.value = fatek03.value.points[addressString];
          }

          formatedDeviceDataObject[driver][addressString] = device;
        });
      });
    }
  }
}

watch(
  nowFloorId,
  async (val) => {
    if (val && visible.value) {
      await getFireSupportObject({
        floorId: val,
      });
    }
  },
  { immediate: true }
);
watch(
  visible,
  async (val) => {
    if (val) {
      if (nowFloorId.value) {
        await getFireSupportObject({
          floorId: nowFloorId.value,
        });
      }
    }
  },
  { immediate: true }
);

// 導引
const dialogPos = ref({
  x: 0,
  y: 0,
});

const dialogStyle = computed(
  () => `transform: translate(${dialogPos.value.x}px, ${dialogPos.value.y}px);`
);

const onPan: TouchPanValue = (details) => {
  const { x, y } = details?.delta ?? {};
  if (x) {
    dialogPos.value.x += x;
  }
  if (y) {
    dialogPos.value.y += y;
  }
};

// 設備控制按鈕方法
async function handleClickDeviceBtn(
  btn: DeviceStatus,
  deviceAddress: DeviceAddressViewModel,
  btnCount: number,
  device: DeviceStatusViewModel
) {
  if (device.value === btn.name) return;
  device.value = btn.name;
  // 發送控制 fatek 設備的 api
  if (fatek03.value) {
    const deviceId = device.id as number;
    // 獲得 control Index
    const { system, address, number } = deviceAddress;
    const addressStr = `${system}-${address}-${number}`;
    const controlIndex =
      fatek03Control[addressStr as keyof typeof fatek03Control];
    let controlValue = 1;
    console.log("now device.control.length < 2", device.control.length < 2);
    if (btnCount >= 2) {
      controlValue = btn.value;
    }
    const controlArray = deviceAddressStore.getFatek03ControlArray();
    controlArray[controlIndex] = controlValue;

    console.log("now", { deviceId, controlArray });

    if (!device.gateway) return; // 避免 gateway 無值
    const result = await DeviceControl.apiDeviceControl(
      device.gateway,
      deviceId,
      controlArray
    );
    console.log("now result", result);
    if (result.data.length && result.data[0].isSuccess) {
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
  } else {
    $q.notify({
      type: "warning",
      message: "尚未取得設備資料，請稍等片刻再重新嘗試",
      position: "top",
    });
  }
}
</script>
