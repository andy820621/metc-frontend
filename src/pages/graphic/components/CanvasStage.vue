<template>
  <div ref="canvasContainer">
    <v-stage ref="stage" :config="stageConfig" @wheel="handleStageZoomByWheel">
      <v-layer ref="layer">
        <v-image :config="bgImageConfig" />
      </v-layer>

      <!-- graphicLayer Layer -->
      <v-layer ref="graphicLayer">
        <v-rect
          v-for="config in rectangleConfigs"
          :key="config.id"
          :config="config"
        />
        <v-text
          v-for="config in textConfigs"
          :key="config.id"
          :config="config"
        />
        <v-line
          v-for="config in polygonConfigs"
          :key="config.id"
          :config="config"
        />
        <v-path
          @click="deviceDataOpen(config.deviceData)"
          @mouseenter="hoverCursorPointer"
          v-for="config in iconImageConfigs"
          ref="iconImage"
          :key="config.id"
          :config="config"
        />
      </v-layer>
    </v-stage>
  </div>

  <!-- 點擊後彈跳視窗 -->
  <q-dialog v-model="isDeviceDataOpen" @hide="dialogClose">
    <q-card
      :style="
        $q.screen.xs || $q.screen.sm
          ? 'width:100%'
          : 'min-width: 700px;max-width: 80vw'
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-center text-bold">
          {{ deviceData.name }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-list class="rounded-borders q-mb-md" v-if="deviceData.addressData">
          <q-item>
            <q-item-section>
              <div class="flex items-center justify-between">
                <div>
                  <div
                    v-for="(address, index) in deviceData.addressData"
                    :key="index"
                    style="font-size: 16px"
                    class="q-mb-xs-md q-mb-md-none"
                  >
                    {{ address.area }}<span> : {{ address.status }}</span>
                  </div>
                  <div
                    v-for="(address, index) in deviceData.powerAddressData"
                    :key="index"
                    style="font-size: 16px"
                    class="q-mb-xs-md q-mb-md-none"
                  >
                    {{ address.area }}<span> : {{ address.status }}</span>
                  </div>
                </div>
                <div class="row q-gutter-md">
                  <template v-if="deviceData.control.length">
                    <template v-for="(item, i) in deviceData.control" :key="i">
                      <q-btn-group push>
                        <q-btn
                          dense
                          padding=".24rem .8rem"
                          push
                          :label="btn.name"
                          :color="
                            btn.name === deviceData.value
                              ? 'primary'
                              : undefined
                          "
                          v-for="btn in item.deviceStatuses"
                          :key="btn.name"
                          @click="
                            handleClickDeviceBtn(
                              btn,
                              item.deviceAddress,
                              deviceData
                            )
                          "
                        />
                      </q-btn-group>
                    </template>
                  </template>
                </div>
              </div>
            </q-item-section>
          </q-item>
          <q-separator spaced />
        </q-list>
        <div class="q-mb-md">
          <q-form
            @submit="handlePostMission"
            class="q-gutter-md-md flex items-center full-width"
          >
            <q-select
              :model-value="dialogClassName"
              use-input
              hide-selected
              fill-input
              input-debounce="2000"
              :options="classOptions"
              @filter="classSelectFilterFunc"
              @input-value="(val) => (dialogClassName = val)"
              option-value="id"
              option-label="description"
              :class="$q.screen.xs || $q.screen.sm ? 'full-width' : ''"
              :label="!!dialogClassName ? '' : '班別 *'"
              :rules="[
                (val: string) =>
                  !val
                    ? '請輸入 班別'
                    : classOptions
                        ?.map((item) => item.description)
                        .includes(val)
                    ? true
                    : '班別欄位的值非有效值，請重新選取',
              ]"
              ref="dialogClassNameSelect"
              @update:model-value="dialogClassNameSelectUpdateFunc"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    沒有該物件
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-select
              :model-value="dialogMissionContent"
              use-input
              hide-selected
              fill-input
              input-debounce="300"
              :options="missionLazyTextOptions"
              @filter="classSelectFilterFunc"
              @input-value="(val) => (dialogMissionContent = val)"
              option-value="id"
              option-label="label"
              :class="$q.screen.xs || $q.screen.sm ? 'full-width' : ''"
              :label="!!dialogMissionContent ? '' : '任務內容 *'"
              lazy-rules="ondemand"
              :rules="[(val: any) => !!val || '請輸入 任務內容']"
              ref="dialogMissionContentSelect"
              @update:model-value="dialogMissionContentSelectUpdateFunc"
            >
              <template v-if="dialogMissionContent" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop.prevent="dialogMissionContent = ''"
                  class="cursor-pointer"
                />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    沒有該任務內容
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <q-btn
              color="primary"
              label="發布任務"
              class="flex-grow-1"
              type="submit"
            />
          </q-form>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
  <q-dialog seamless v-model="isCctv">
    <q-card
      :style="[
        dialogStyle,
        $q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 600px;',
      ]"
      class="q-pa-none block"
    >
      <q-btn
        dense
        flat
        icon="close"
        class="absolute-top-right q-ma-xs"
        color="white"
        v-close-popup
      />
      <CameraWebRTC
        v-touch-pan.mouse="onPan"
        style="cursor: grab"
        :device-id="deviceData.deviceId"
        :title="`${deviceData.location ? deviceData.location + ' - ' : ''}
      ${deviceData.name}`"
      />
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// konva
import Konva from "konva";
// quasar
import { date } from "quasar";
import { useResizeObserver } from "@vueuse/core";
// API
import emergencyMission, { postMissionParams } from "src/api/emergencyMission";
import Role, { roleType } from "src/api/role";
import System, { systemType } from "src/api/system";
import DeviceControl from "src/api/deviceControl";
import Device from "src/api/device";
import Floors from "src/api/floors";

// types
import {
  fatek03Control,
  useDeviceAddressStore,
} from "src/stores/deviceAddress";
import type {
  DeviceAddressViewModel,
  DeviceStatusViewModel,
  DeviceStatus,
} from "src/api/device";
// websocket signalR
import { useSignalRStore } from "src/stores/signalR";
import { storeToRefs } from "pinia";
// utils
import { tempDataType } from "src/api/api.type";

const deviceAddressStore = useDeviceAddressStore();
const { nohmi03, fatek03, amsamotion02, mitsubishi } =
  storeToRefs(deviceAddressStore);
const signalRStore = useSignalRStore();
const { processRunning, initialDetector, triggerTime } =
  storeToRefs(signalRStore);
const $q = inject("$q") as typeof QVueGlobals;

// 選擇設備
const deviceFilter = inject<Ref<number | string>>(
  "deviceFilter",
  ref("not provided")
);

if (deviceFilter && deviceFilter.value !== "not provided") {
  watch(
    () => deviceFilter.value,
    () => {
      const layerNode = graphicLayer.value?.getNode();
      iconImageConfigs.forEach((config) => {
        const ImageNode = layerNode?.findOne(`#${config.id}`) as Konva.Path;
        if (deviceFilter.value === 2) {
          config.visible =
            ImageNode.attrs.deviceData.useType === deviceFilter.value;
        } else if (deviceFilter.value === 1) {
          config.visible = ImageNode.attrs.deviceData.useType !== 2;
        } else {
          config.visible = true;
        }
      });
    }
  );
}
// 設備控制
const deviceControlOptions = ref([]);

const isDeviceDataOpen = ref(false);
const isCctv = ref(false);
const deviceData: Konva.NodeConfig = ref({});
const positionNodeConfig: Konva.NodeConfig = ref({});
function deviceDataOpen(data: Konva.NodeConfig) {
  console.log("deviceDataOpen", data);
  deviceData.value = positionNodeConfig.value = data;
  deviceControlOptions.value =
    deviceData.value.control?.flatMap(
      (item: {
        deviceStatuses: tempDataType[];
        deviceAddress: { address: number; number: number; system: string };
      }) => {
        return item.deviceStatuses.map((status) => {
          return {
            label: status.name,
            value: status.value,
            deviceAddress: item.deviceAddress,
          };
        });
      }
    ) || [];

  dialogMissionContent.value =
    deviceData.value.name + " 設備出現異常，請前往確認";

  nextTick(selectAndChangeIconColor);
  if (deviceData.value.iconId === "fire_o3") {
    // 監視攝影機
    isCctv.value = true;
  } else {
    isDeviceDataOpen.value = true;
  }
}
watch(isCctv, (newVal) => {
  if (newVal === false) {
    deviceData.value = null;
    nextTick(selectAndChangeIconColor);
  }
});
async function handleClickDeviceBtn(
  btn: DeviceStatus,
  deviceAddress: DeviceAddressViewModel,
  deviceData: tempDataType
) {
  if (deviceData.value === btn.name) return;
  deviceData.value = btn.name;
  const { system, address, number } = deviceAddress;
  const addressStr = `${system}-${address}-${number}`;
  const controlIndex =
    fatek03Control[addressStr as keyof typeof fatek03Control];
  let controlArray = deviceAddressStore.getFatek03ControlArray();

  if (controlIndex) {
    controlArray[controlIndex] = btn.value;
  }
  // 點位 300 系列 寫死
  // 探測器 = 202
  if (deviceData.deviceId === 202) {
    controlArray = [];
    for (let i = 0; i < 16; i++) {
      controlArray.push(0);
    }
    controlArray[9] = btn.value;
  } else if (deviceData.deviceId === 201) {
    // PLC 復歸
    controlArray = [];
    for (let i = 0; i < 16; i++) {
      controlArray.push(0);
    }
    controlArray[10] = btn.value;
  } else if (deviceData.deviceId === 204) {
    // 空調 = 204 => 模擬探測器
    controlArray[7] = btn.value;
  }
  if (controlArray.length > 0) {
    const result = await DeviceControl.apiDeviceControl(
      deviceData.gateway,
      deviceData.deviceId,
      controlArray
    );
    if (result.data.length && result.data[0].isSuccess) {
      $q.notify({
        type: "positive",
        message: "發送成功",
        position: "top",
      });
      dialogClose();
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
      message: "尚未取得設備點位完整資料，請稍等片刻再重新嘗試",
      position: "top",
    });
  }
}
// 發布任務
// Select 共用方法
interface optionItem {
  id: string;
  name: string;
  value: string;
  description: string;
  [key: string]: number | string;
}
function filterFunc<T = object>(
  val: string,
  update: (func: () => void) => void,
  refOptions: Ref<T[]>,
  options: T[],
  optionLabelKey = "name"
) {
  update(() => {
    console.log("now val", val);
    console.log("now refOptions", refOptions);
    console.log("now options", options);
    console.log("now optionLabelKey", optionLabelKey);
    const needle = val.toLocaleLowerCase();
    refOptions.value = options.filter((option) =>
      (option[optionLabelKey as keyof typeof option] as string)
        .toLocaleLowerCase()
        .includes(needle)
    );
  });
}

// 班別 select 下拉
interface ClassOption {
  description: string;
  id: string;
  isEmergency: boolean | null;
  name: string;
  type: number;
}
const classData: ClassOption[] = [];
const classOptions = ref<ClassOption[]>([]);

onMounted(async () => {
  const result = (await Role.apiGetRoles([
    { type: roleType.class, isEmergency: null },
  ])) as typeof AxiosResponse;
  if (result.data) {
    classData.length = 0;
    classData.push(...result.data);
    classOptions.value = classData;
    console.log("now classData", classData);
  }
});
function classSelectFilterFunc(
  val: string,
  update: (func: () => void) => void
) {
  filterFunc<ClassOption>(val, update, classOptions, classData);
}

// 任務內容 Dialog Select 下拉
const dialogClassName = ref("");
const dialogMissionContent = ref("");
const dialogClassNameSelect = ref();
const dialogMissionContentSelect = ref();
function dialogClassNameSelectUpdateFunc() {
  dialogClassNameSelect.value.resetValidation();
}
function dialogMissionContentSelectUpdateFunc() {
  dialogMissionContentSelect.value.resetValidation();
}

const lazyTexts: optionItem[] = [];
const missionLazyTextOptions = ref();

onMounted(async () => {
  const result = (await System.apiGetSystemItem(
    systemType.EmergencyNotice
  )) as typeof AxiosResponse;
  if (result.data) {
    lazyTexts.length = 0;
    lazyTexts.push(...result.data);
    missionLazyTextOptions.value = lazyTexts;
  }
});

// 發布任務方法
async function handlePostMission() {
  const roleName = classData.find(
    (data) => data.description === dialogClassName.value
  )?.name;

  if (roleName) {
    const params: postMissionParams = {
      roleName,
      deviceId: deviceData.value.deviceId,
      content: dialogMissionContent.value,
    };
    // 打 api 發布
    const result = (await emergencyMission.apiPostMission(
      params
    )) as typeof AxiosResponse;
    if (result.data) {
      $q.notify({
        type: "positive",
        message: "發布任務成功",
        position: "top",
      });
      dialogClose();
    } else {
      $q.notify({
        type: "negative",
        message: "發布任務失敗",
        position: "top",
      });
    }
  }
}
function dialogClose() {
  deviceData.value = null;
  isDeviceDataOpen.value = false;
  dialogClassName.value = "";
  nextTick(selectAndChangeIconColor);
}

// iconImage，選擇後變為藍色，反之變回原色
function selectAndChangeIconColor(defaultColor = "#bdbbbb") {
  let clickColor = "";
  const originColor = defaultColor;
  const activeIconColor = "#2088e8"; // 藍
  iconImageConfigs.forEach((config) => {
    const selectedNode = deviceData.value;
    if (config.id === selectedNode?.id) {
      clickColor = activeIconColor;
    } else {
      clickColor = originColor;
    }
    config.fill = clickColor;
  });
}

// Konva
interface vueStage {
  getStage: () => Konva.Stage;
  getNode: () => Konva.Stage;
}
interface vueLayer {
  getStage: () => Konva.Layer;
  getNode: () => Konva.Layer;
}
interface vuePath {
  getStage: () => Konva.Path;
}
const graphicLayer = ref<vueLayer>();

function setEmergencyStartView(startId: string) {
  if (startId) {
    const stageNode = stage.value?.getStage();
    const layerNode = graphicLayer.value?.getNode();
    const startNode = layerNode?.findOne(`#${startId}`) as Konva.Path;
    if (!startNode) return; // 避免在非探測器的樓層有錯誤
    const startPos = {
      // 計算出起始點(點位)的中心座標位置
      x: startNode?.x() + (startNode.attrs.width * startNode.scaleX()) / 2,
      y: startNode?.y() + (startNode.attrs.height * startNode.scaleY()) / 2,
    };
    const stageContainer = canvasContainer.value as HTMLDivElement;
    const center = {
      x: stageContainer.getBoundingClientRect().width / 2,
      y: stageContainer.getBoundingClientRect().height / 2,
    };

    const deltaNow = {
      x: center.x - startPos.x,
      y: center.y - startPos.y, // 容器與起始點位置的距離差
    };
    const oldScale = stageNode?.scaleX(); // 舊的縮放比
    if (oldScale && stageNode) {
      zoom.value = $q.screen.xs || $q.screen.sm ? 0.5 : 1.7; // 要放大的數值設定
      stageNode?.scale({
        x: zoom.value,
        y: zoom.value,
      });

      const centerOriginPos = {
        // 計算出中心到左上角(縮放參考點)的最原始(zoom = 1)時的距離
        x:
          $q.screen.xs || $q.screen.sm
            ? (center.x - stageNode.x()) / oldScale / 4
            : (center.x - stageNode.x()) / oldScale,
        y: $q.screen.xs || $q.screen.sm ? center.y / 2 : center.y,
      };
      // console.log("centerOriginPos", centerOriginPos);
      const newTopLeftCorner = {
        // 計算出新的左上角(縮放參考點)的位置 => 移動後Stage的中心會在正中間
        x: center.x - centerOriginPos.x * zoom.value,
        y: center.y - centerOriginPos.y * zoom.value,
      };
      // console.log("newTopLeftCorner", newTopLeftCorner);

      const { x, y } = {
        // 新位置還必須 + 新的容器與起始點位置的距離差
        x: newTopLeftCorner.x + deltaNow.x * zoom.value,
        y: newTopLeftCorner.y + deltaNow.y * zoom.value,
      };
      stageNode?.setAttrs({ x, y });
    }
  }
}

const triggerDeviceNode = ref<Konva.Node>(); // 觸發的設備
interface connectArrayType {
  label: string;
  id: string;
}
// 觸發探測器時顯示危害時間，有起火層才要顯示避難時間
watch(processRunning, (newValue) => {
  if (newValue) {
    nextTick(() => {
      countDown();
      animate();
    });
  }
});

function countDown() {
  const graphicLayerNode = graphicLayer.value?.getNode().getChildren();

  const resultNode = graphicLayerNode?.find(
    (item) => item.attrs?.deviceData?.deviceId === initialDetector.value?.id
  );
  if (resultNode) triggerDeviceNode.value = resultNode;
  console.log("triggerDeviceNode", triggerDeviceNode);

  if (triggerDeviceNode.value) {
    const triggerConnectArray: Konva.NodeConfig[] = []; // 關聯陣列

    triggerConnectArray.push(triggerDeviceNode.value?.attrs.connectArray);

    const hazardTimeNodeArr: Konva.Node[] = [];
    let connectCctvData = null;
    // 取得 危害時間 Node
    if (triggerConnectArray.length > 0) {
      triggerConnectArray.forEach((connectArray) => {
        connectArray.forEach((item: connectArrayType) => {
          const result = graphicLayerNode?.find(
            (node: Konva.Node) => node.attrs.id === item.id
          );
          if (result?.attrs.deviceData?.iconId === "fire_o3") {
            connectCctvData = result?.attrs.deviceData;
          }

          if (result?.attrs.hazardTime && !hazardTimeNodeArr.includes(result)) {
            hazardTimeNodeArr.push(result);
          }
        });
      });
    }

    hazardTimeNodeArr.forEach((node) => {
      const hazardTime = date.addToDate(triggerTime.value, {
        seconds: node.attrs.hazardTime,
      });
      node.setAttrs({
        text: `預估 ${date.formatDate(
          hazardTime,
          "HH:mm"
        )} 造成人體危害，請盡快撤離`, // 格式化過的時間
      });
    });
    showFireImage();
    // 觸發探測器關聯的cctv
    if (connectCctvData) deviceDataOpen(connectCctvData);
  }
}

// 探測器為火災時換成火災圖片
async function showFireImage() {
  iconImageConfigs.forEach(async (config) => {
    if (
      config.deviceData?.deviceId ===
      triggerDeviceNode.value?.attrs.deviceData?.deviceId
    ) {
      config.data = await loadSvg("/svgIcons/fire_fs.svg#fire_fs");
    }
  });
}
async function loadSvg(url: string) {
  const svgString = await fetch(url).then((res) => res.text());
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, "image/svg+xml");
  const pathArray = doc.querySelectorAll("path");
  let data;
  if (pathArray.length > 1) {
    const dArray: string[] = [];
    pathArray.forEach((path) => {
      dArray.push(path.getAttribute("d") as string);
    });
    data = dArray.join(" ");
  } else {
    data = pathArray[0]?.getAttribute("d") as string;
  }
  return data;
}

const canvasContainer = ref<HTMLDivElement>();
const canvasObserver = useResizeObserver(canvasContainer, handleCanvasResize);

// Konva 變數們
const stage = ref<vueStage>();
const layer = ref<vueLayer>();
const iconImage = ref<vuePath[]>();

// 畫布容器 & Stage 尺寸相關變數
const initialStageSize = {
  width: 1500,
  height: $q.screen.xs || $q.screen.sm ? 250 : 750,
};
const stageConfig = reactive<Konva.ShapeConfig>({
  width: initialStageSize.width,
  height: initialStageSize.height,
  fill: "white",
  scale: { x: 1, y: 1 },
  draggable: true,
  x: 0,
  y: 0,
});
const bgImageConfig = ref<{
  width: number;
  height: number;
  image?: HTMLImageElement;
  name: string;
  scaleX: number;
  scaleY: number;
}>({
  width: initialStageSize.width,
  height: initialStageSize.height,
  name: "background",
  scaleX: 1,
  scaleY: 1,
});

// 調整舞台寬高和縮放比例
function resetCanvas() {
  const stageNode = stage.value?.getStage() as Konva.Stage;
  stageNode.x(0);
  stageNode.y(0);
  stageConfig.x = 0; // 這裡因為之原因需要兩個地方值都調整才能正常歸零
  stageConfig.y = 0;
  nextTick(() => {
    if (bgImageConfig.value && stageConfig.width && stageConfig.height) {
      const scale = stageConfig.width / initialStageSize.width;
      stageConfig.scale = { x: scale, y: scale };

      const { width, height, scaleX, scaleY } = bgImageConfig.value;
      const nowHeight = height * scaleY * scale;
      if (nowHeight > stageConfig.height) {
        // 圖片高還是太大
        const scaleForHeight = stageConfig.height / nowHeight;
        const newScale = scale * scaleForHeight;
        stageConfig.scale = { x: newScale, y: newScale };
        // 計算X軸偏移
        const newWidth = width * scaleX * newScale;
        const deltaX = (stageConfig.width - newWidth) / 2;

        stageConfig.x = deltaX;
        zoom.value = newScale;
      } else {
        zoom.value = scale;
      }
      // 計算Y軸偏移
      const nowImgHeight = height * scaleY * zoom.value;
      const deltaY = (stageConfig.height - nowImgHeight) / 2;
      stageConfig.y = deltaY;
    }
  });
}

defineExpose({
  clearCanvas,
  loadBackgroundImage,
  setStageSize,
  loadShapeFromJson,
  getFloorGraphicJson,
  canvasContainer,
  canvasObserver,
  resetCanvas,
  zoomCanvas,
  animate,
  closeAnimate,
  deviceStatusTrigger,
});

// 初次載入
function handleCanvasResize() {
  setStageSize();
}

// 畫布容器 & Stage 尺寸相關邏輯
function setStageSize() {
  if (canvasContainer.value) {
    const { width, height } = canvasContainer.value.getBoundingClientRect();
    stageConfig.width = width;
    stageConfig.height = height;
  }
}
function loadBackgroundImage(imageUrl: string) {
  const image = new window.Image();
  image.src = imageUrl;
  image.onload = () => {
    let scale;
    const { width, height } = image;
    if (width / height > 1) {
      scale = initialStageSize.width / width; // 橫的圖片
    } else scale = initialStageSize.height / height; // 直的圖片
    bgImageConfig.value = {
      image,
      width,
      height,
      scaleX: scale,
      scaleY: scale,
      name: "background",
    };
  };
}
function loadShapeFromJson(json: string) {
  JSON.parse(json).children[1].children.forEach((shape: Konva.Shape) => {
    shape.attrs.draggable = false;
    if (shape.className === "Rect") {
      shape.attrs.visible = false;
      rectangleConfigs.push(shape.attrs);
    } else if (shape.className === "Text") textConfigs.push(shape.attrs);
    else if (shape.className === "Line") {
      shape.attrs.visible = false;
      polygonConfigs.push(shape.attrs);
    } else if (shape.className === "Path") {
      iconImageConfigs.push(shape.attrs);
    }
  });

  allDeviceAddressDataFormat();
  nextTick(() => {
    selectAndChangeIconColor();
    getDeviceStatus();
    if (processRunning.value) {
      countDown();
      animate();
    }
  });
}
async function getFloorGraphicJson(floorId: number) {
  const result = (await Floors.apiGetFloorGraphicFile(
    floorId
  )) as typeof AxiosResponse;
  if (result.data) {
    const decodedData = atob(result.data);
    // 將二進制數據轉換成UTF-8編碼的字串
    const jsonData = new TextDecoder().decode(
      new Uint8Array([...decodedData].map((char) => char.charCodeAt(0)))
    );
    return jsonData;
  } else {
    return "";
  }
}
// 將設備點位資料轉成 Object
const allAddressDataObj: { [key: string]: any } = {};

// 之後把 fatek03 & nohmi03 合寫在一個watch裡判斷
watch(
  nohmi03,
  (newValue) => {
    console.log("nohmi03 Canvas", newValue);
    if (newValue) {
      const addressArr = Object.keys(newValue.points);
      addressArr.forEach((item) => {
        if (
          allAddressDataObj[newValue.driver] &&
          allAddressDataObj[newValue.driver][item]
        ) {
          allAddressDataObj[newValue.driver][item].status =
            newValue.points[item];
        }
      });
      nextTick(deviceStatusTrigger);
    }
  },
  {
    deep: true,
  }
);

watch(
  fatek03,
  (newValue) => {
    console.log("fatek03 canvas", newValue);
    if (newValue) {
      const addressArr = Object.keys(newValue.points);
      addressArr.forEach((item) => {
        if (
          allAddressDataObj[newValue.driver] &&
          allAddressDataObj[newValue.driver][item]
        ) {
          allAddressDataObj[newValue.driver][item].status =
            newValue.points[item];
        }
      });

      nextTick(deviceStatusTrigger);
    }
  },
  {
    deep: true,
  }
);
watch(
  amsamotion02,
  (newValue) => {
    console.log("amsamotion02 canvas", newValue);
    if (newValue) {
      const addressArr = Object.keys(newValue.points);
      addressArr.forEach((item) => {
        if (
          allAddressDataObj[newValue.driver] &&
          allAddressDataObj[newValue.driver][item]
        ) {
          allAddressDataObj[newValue.driver][item].status =
            newValue.points[item];
        }
      });
      nextTick(deviceStatusTrigger);
    }
  },
  { deep: true }
);

watch(
  mitsubishi,
  (newValue) => {
    if (newValue) {
      const addressArr = Object.keys(newValue.points);
      addressArr.forEach((item) => {
        if (
          allAddressDataObj[newValue.driver] &&
          allAddressDataObj[newValue.driver][item]
        ) {
          allAddressDataObj[newValue.driver][item].status =
            newValue.points[item];
        }
      });
      nextTick(deviceStatusTrigger);
    }
  },
  { deep: true }
);
function allDeviceAddressDataFormat() {
  iconImageConfigs.forEach((item) => {
    item.deviceData.addressData?.forEach(
      (address: { addressStr: string; driver: string }) => {
        if (address.driver && address.addressStr) {
          if (allAddressDataObj[address.driver]) {
            allAddressDataObj[address.driver][address.addressStr] = address;
          } else {
            allAddressDataObj[address.driver] = {};
            allAddressDataObj[address.driver][address.addressStr] = address;
          }
        }
      }
    );
  });
  // 狀態寫進去
  const deviceSignals = [
    fatek03.value,
    nohmi03.value,
    amsamotion02.value,
    mitsubishi.value,
  ];
  deviceSignals.forEach((signal) => {
    if (signal) {
      const addressArr = Object.keys(signal.points);
      addressArr.forEach((item: string) => {
        if (
          signal &&
          allAddressDataObj[signal.driver] &&
          allAddressDataObj[signal.driver][item]
        ) {
          allAddressDataObj[signal.driver][item].status = signal?.points[item];
        }
      });
    }
  });
  nextTick(deviceStatusTrigger);
}
// 背景放大與縮小
const zoom = ref(1);

function handleStageZoomByWheel(e: Konva.KonvaEventObject<WheelEvent>) {
  zoomCanvas(e.evt.deltaY * -1);
}
// zoomIn: zoomValue必須帶正數、zoomOut: zoomValue必須帶負數
function zoomCanvas(zoomValue: number) {
  const stageNode = stage.value?.getStage();
  const zoomStep = 0.05; // 每次縮放的比例
  const oldScale = stageNode?.scaleX();
  if (oldScale && stageNode && canvasContainer.value) {
    zoom.value = Math.max(0.3, zoom.value);
    zoom.value = Math.min(5, zoom.value);
    zoom.value = zoomValue < 0 ? -zoomStep + zoom.value : zoomStep + zoom.value;
    stageNode?.scale({
      x: zoom.value,
      y: zoom.value,
    });
    const center = {
      x: canvasContainer.value.getBoundingClientRect().width / 2,
      y: canvasContainer.value.getBoundingClientRect().height / 2,
    };
    const centerOriginPos = {
      x: (center.x - stageNode.x()) / oldScale,
      y: (center.y - stageNode.y()) / oldScale,
    };
    const newPosition = {
      x: center.x - centerOriginPos.x * zoom.value,
      y: center.y - centerOriginPos.y * zoom.value,
    };
    stageNode?.position(newPosition);
  }
}

// 圖例
const iconImageConfigs = reactive<Array<Konva.PathConfig>>([]);

// Rect 相關邏輯
const rectangleConfigs = reactive<Array<Konva.RectConfig>>([]);

// 文字相關邏輯
const textConfigs = reactive<Array<Konva.TextConfig>>([]);

// Polygon 相關邏輯
const polygonConfigs = reactive<Array<Konva.LineConfig>>([]);

// Shape Cursor Style
function hoverCursorPointer() {
  const stageNode = stage.value?.getNode() as Konva.Stage;
  const graphicLayerNode = graphicLayer.value?.getNode() as Konva.Layer;
  graphicLayerNode.getChildren().forEach((item) => {
    if (item.getClassName() === "Path") {
      item.on("mouseenter", () => {
        stageNode.container().style.cursor = "pointer";
      });
      item.on("mouseleave", () => {
        stageNode.container().style.cursor = "default";
      });
    }
  });
}

function animate() {
  const layerNode = graphicLayer.value?.getNode();
  nextTick(() => {
    const connectIdArr: string[] = [];
    // 塞入關聯設備 id
    const connectObjArr = triggerDeviceNode.value?.attrs.connectArray;
    if (connectObjArr?.length) {
      connectObjArr.forEach((item: connectArrayType) => {
        connectIdArr.push(item.id);
      });
    }
    connectIdArr.push(triggerDeviceNode.value?.attrs.id); // 塞入觸發設備本身 id
    if (connectIdArr.length > 0) {
      const blockConfigs = [rectangleConfigs, polygonConfigs];
      blockConfigs.forEach((blockConfig) => {
        blockConfig.forEach((config) => {
          const blockId = connectIdArr?.find((id) => id === config.id);
          const blockNode = layerNode?.findOne(`#${blockId}`) as
            | Konva.Rect
            | Konva.Line;
          if (blockNode) {
            config.visible = true;
            const tween = new Konva.Tween({
              node: blockNode,
              duration: 1,
              fill: blockNode.attrs.stroke, // "rgb(235,50,50)"
              yoyo: true,
              repeat: Infinity,
            });

            blockNode.setAttr("tween", tween);
            blockNode.getAttr("tween").play();
          }
        });
      });
      iconImageConfigs.forEach((config) => {
        const imageId = connectIdArr?.find((id) => id === config.id);
        const iconNode = layerNode?.findOne(`#${imageId}`) as Konva.Path;
        if (iconNode) {
          const tween = new Konva.Tween({
            node: iconNode,
            duration: 1,
            fill: "#e31717",
            yoyo: true,
            repeat: Infinity,
          });

          iconNode.setAttr("tween", tween);
          iconNode.getAttr("tween").play();
        }
      });
    }
    // 緊急應變時改變圖片大小並置中到起始點點位位置
    canvasObserver.stop();
    if (triggerDeviceNode) {
      setEmergencyStartView(triggerDeviceNode.value?.attrs.id);
    }
  });
}
function closeAnimate() {
  const layerNode = graphicLayer.value?.getNode();
  const blockConfigs = [rectangleConfigs, polygonConfigs];
  blockConfigs.forEach((blockConfig) => {
    blockConfig.forEach((config) => {
      config.visible = false;
      const rectNode = layerNode?.findOne(`#${config.id}`) as
        | Konva.Rect
        | Konva.Line;
      if (rectNode?.getAttr("tween")) rectNode?.getAttr("tween").reset();
    });
  });

  iconImageConfigs.forEach((config) => {
    const iconNode = layerNode?.findOne(`#${config.id}`) as Konva.Path;
    if (iconNode?.getAttr("tween")) iconNode?.getAttr("tween").reset();
  });
}
// 設備狀態為開時變色
function deviceStatusTrigger() {
  iconImageConfigs.forEach((config) => {
    if (
      config.deviceData.iconId !== "fire_a2" &&
      config.deviceData.iconId !== "fire_p7" &&
      config.deviceData.iconId !== "fire_o3"
    ) {
      const layerNode = graphicLayer.value?.getNode();
      const iconNode = layerNode?.findOne(`#${config.id}`) as Konva.Path;
      config.deviceData.addressData?.forEach((item: { status: string }) => {
        if (item.status === "開" && !iconNode?.getAttr("tween")) {
          const tween = new Konva.Tween({
            node: iconNode,
            duration: 1,
            fill: config.deviceData.addressData[0].color,
            yoyo: true,
            repeat: Infinity,
          });
          iconNode.setAttr("tween", tween);
          iconNode.getAttr("tween").play();
        } else if (item.status === "關" && iconNode?.getAttr("tween")) {
          iconNode?.getAttr("tween")?.reset();
        }
      });
    }
  });
}

function clearCanvas() {
  // 清除節點
  // graphicLayer.value.getStage().removeChildren();
  // 清除節點config
  if (bgImageConfig.value.image) delete bgImageConfig.value.image;
  rectangleConfigs.length = 0;
  textConfigs.length = 0;
  polygonConfigs.length = 0;
  iconImageConfigs.length = 0;
}
// 取得設備初始狀態
async function getDeviceStatus() {
  iconImageConfigs.forEach(async (item) => {
    const result = (await Device.apiGetDeviceStatus(
      item.deviceData.deviceId
    )) as typeof AxiosResponse;
    result.data.forEach((status: any) => {
      const { value, deviceAddress } = status;
      const { system, address, number, master } = deviceAddress;
      if (!master) return;
      const { driver } = master.deviceType as { driver: string };
      const addressStr = address
        ? `${system}-${address}-${number}`
        : `${system}-${number}`;
      const trueValue = value === "False" ? "關" : "開";

      allAddressDataObj[driver][addressStr].status = trueValue;

      // 附值給 fatek、amsamotion、mitsubishi
      if (driver === "fatek" && allAddressDataObj.fatek[addressStr]) {
        if (fatek03.value) fatek03.value.points[addressStr] = trueValue;
      } else if (
        driver === "amsamotion" &&
        allAddressDataObj.amsamotion[addressStr] &&
        amsamotion02.value
      ) {
        amsamotion02.value.points[addressStr] = trueValue;
      } else if (
        driver === "mitsubishi" &&
        allAddressDataObj.mitsubishi[addressStr] &&
        mitsubishi.value
      ) {
        mitsubishi.value.points[addressStr] = trueValue;
      }
    });
    console.log("getDeviceStatus", result.data);
  });
}

// 移動端 Zoom
Konva.hitOnDragEnabled = true; // 在拖動時啟用點擊檢測(出於性能原因，默認情況下是 false)
interface FingerTouch {
  x: globalThis.Touch["clientX"];
  y: globalThis.Touch["clientY"];
}
function getDistance(p1: FingerTouch, p2: FingerTouch) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function getCenter(p1: FingerTouch, p2: FingerTouch) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2,
  };
}
onMounted(() => {
  let lastCenter: FingerTouch | null = null;
  let lastDist = 0;

  const konvaStage = stage.value?.getStage();
  if (konvaStage) {
    konvaStage.on("touchmove", (e) => {
      e.evt.preventDefault();
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];

      if (touch1 && touch2) {
        // 如果 Konva Stage 處於拖曳狀態下 => 停止它，並改用兩指移動實現的 zoomIn / zoomOut
        if (konvaStage.isDragging()) {
          konvaStage.stopDrag();
        }

        const p1 = {
          x: touch1.clientX,
          y: touch1.clientY,
        };
        const p2 = {
          x: touch2.clientX,
          y: touch2.clientY,
        };

        if (!lastCenter) {
          lastCenter = getCenter(p1, p2);
          return;
        }
        const newCenter = getCenter(p1, p2);

        const dist = getDistance(p1, p2);

        if (!lastDist) {
          lastDist = dist;
        }

        // 中心點坐標
        const pointTo = {
          x: (newCenter.x - konvaStage.x()) / konvaStage.scaleX(),
          y: (newCenter.y - konvaStage.y()) / konvaStage.scaleX(),
        };

        let scale = konvaStage.scaleX() * (dist / lastDist);

        scale = Math.max(0.05, scale);
        scale = Math.min(5, scale);

        konvaStage.scaleX(scale);
        konvaStage.scaleY(scale);

        // 計算 konvaStage 的新位置
        const dx = newCenter.x - lastCenter.x;
        const dy = newCenter.y - lastCenter.y;

        const newPos = {
          x: newCenter.x - pointTo.x * scale + dx,
          y: newCenter.y - pointTo.y * scale + dy,
        };

        konvaStage.position(newPos);

        lastDist = dist;
        lastCenter = newCenter;
      }
    });

    konvaStage.on("touchend", () => {
      lastDist = 0;
      lastCenter = null;
    });
  }
});
// cctv 顯示
const dialogPos = ref({
  x: 600,
  y: -130,
});

const dialogStyle = computed(
  () => `transform: translate(${dialogPos.value.x}px, ${dialogPos.value.y}px);`
);

function onPan(evt: any) {
  dialogPos.value.x = dialogPos.value.x + evt.delta.x;
  dialogPos.value.y = dialogPos.value.y + evt.delta.y;
}
</script>
