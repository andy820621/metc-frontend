<template>
  <q-page class="q-pa-md flex">
    <div class="flex-grow-1 full-width">
      <div class="flex justify-between q-mb-md">
        <div
          class="row items-center nowrap"
          :style="{ width: $q.screen.xs || $q.screen.sm ? '100%' : '30%' }"
        >
          <!-- 樓層選擇 -->
          <AllFloors @handleSelect="handleSelect" @resetCanvas="resetCanvas" />
          <span> 最後編輯時間 : {{ jsonData?.attrs.editTime }}</span>
        </div>

        <!-- Header 右側 -->
        <div class="q-gutter-sm">
          <q-checkbox
            v-for="item in blockTypeOptions"
            :key="item"
            v-model="blockType"
            :val="item"
            :label="item"
            color="primary"
            @update:model-value="blockTypeVisible"
          />
        </div>
      </div>

      <div
        class="row q-col-gutter-md overflow-hidden"
        :style="{
          height: $q.screen.xs || $q.screen.sm ? '' : 'calc(100vh - 138px)',
        }"
      >
        <!-- 左側: Canvas 容器 & 圖控功能列 -->
        <div class="col-xs-12 col-md-9">
          <div class="flex justify-between q-mb-sm">
            <!-- 左側功能列 -->
            <div class="funcList">
              <q-btn-dropdown
                auto-close
                dense
                flat
                color="dark"
                :icon="matKeyboard"
              >
                <q-list style="min-width: 100px">
                  <q-item v-for="(item, index) in hotKeyList" :key="index">
                    <q-item-section>
                      {{ index + 1 }}. {{ item }}
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
              <q-btn
                v-for="item in funcListIcon"
                :key="item.icon"
                dense
                flat
                color="dark"
                class="toolBtn"
                :class="{ active: activeToolBtn === item.label }"
                :icon="item.icon"
                @click="handleClickToolBtn($event, item)"
              >
                <q-tooltip
                  class="text-body2"
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ item.label }}
                </q-tooltip>
              </q-btn>
            </div>
            <!-- 右側控制列 -->
            <div class="controlList">
              <q-btn
                v-for="item in controlListIcon"
                :key="item.icon"
                dense
                flat
                color="dark"
                :icon="item.icon"
                style="font-size: 12px; margin: 0 5px"
                @click="handleClickControlBtn($event, item)"
              >
                <q-tooltip
                  class="text-body2"
                  transition-show="scale"
                  transition-hide="scale"
                  anchor="top middle"
                  self="bottom middle"
                  :offset="[10, 10]"
                >
                  {{ item.label }}
                </q-tooltip>
              </q-btn>
            </div>
          </div>
          <!-- Canvas 容器 -->
          <div
            class="bg-white overflow-hidden rounded-sm"
            style="outline: 1px solid #ccc"
            @dragover.prevent="getAbsoluteMousePos"
            @drop="drop"
            ref="canvasContainer"
          >
            <v-stage
              ref="stage"
              :config="stageConfig"
              @mousedown="handleStageMouseDown"
              @wheel="handleStageZoom"
              @touchstart="handleStageMouseDown"
              @mousemove="handleStageMouseMove"
              @touchmove="handleStageMouseMove"
              @mouseup="handleStageMouseUp"
              @touchend="handleStageMouseUp"
            >
              <v-layer ref="layer">
                <v-image :config="bgImageConfig" />
              </v-layer>

              <!-- graphicLayer Layer -->
              <v-layer ref="graphicLayer">
                <v-rect
                  @mouseenter="hoverCursorPointer"
                  v-for="config in rectangleConfigs"
                  :key="config.id"
                  :config="config"
                />
                <v-text
                  @mouseenter="hoverCursorPointer"
                  v-for="config in textConfigs"
                  :key="config.id"
                  :config="config"
                  @dblclick="handleDoubleClick"
                  @dbltap="handleDoubleClick"
                  @transform="handleTransform"
                />
                <v-line
                  @mouseenter="hoverCursorPointer"
                  v-for="config in polygonConfigs"
                  :key="config.id"
                  :config="config"
                  @transform="handleLineTransform"
                />
                <v-path
                  @mouseenter="hoverCursorPointer"
                  v-for="config in iconImageConfigs"
                  ref="iconImage"
                  :key="config.id"
                  :config="config"
                />
              </v-layer>
              <v-layer>
                <!-- 選取物件用Rect -->
                <v-rect :config="selectionRectangleConfig" />
                <v-transformer ref="transformer" @dragend="addDataToUndo" />
              </v-layer>
            </v-stage>
          </div>
        </div>
        <!-- 右側: Svg圖例容器 & 圖例Filter -->
        <div class="col-xs-12 col-md-3">
          <div v-if="isGraphicOpen" class="full-height">
            <q-card class="full-height">
              <q-card-section
                v-if="activeObjectNode.length && activeObjectNode.length === 1"
              >
                <q-input
                  class="q-mb-md-md"
                  v-model="graphicObj.name"
                  label="名稱"
                />
                <div
                  v-if="
                    activeObjectNode[0].getClassName() === 'Rect' ||
                    activeObjectNode[0].getClassName() === 'Line'
                  "
                >
                  <q-select
                    @update:model-value="blockTypeChange"
                    v-model="graphicObj.blockType"
                    :options="blockTypeOptions"
                    label="區塊"
                    class="q-mb-md-md"
                  />
                  <q-input
                    v-model="graphicObj.fill"
                    :rules="['anyColor']"
                    hint="With color verification"
                    class="my-input q-mb-md-md"
                    label="填充"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-color
                            v-model="graphicObj.fill"
                            default-view="palette"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                  <q-input
                    v-model="graphicObj.stroke"
                    hint="With color verification"
                    :rules="['anyColor']"
                    class="my-input q-mb-md-md"
                    label="邊框"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-color
                            v-model="graphicObj.stroke"
                            default-view="palette"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                </div>
                <div v-else-if="activeObjectNode[0].getClassName() === 'Text'">
                  <q-input
                    v-model.number="graphicObj.fontSize"
                    type="number"
                    label="文字大小"
                    class="q-mb-md-md"
                  />
                  <q-input
                    v-model="graphicObj.fill"
                    hint="With color verification"
                    :rules="['anyColor']"
                    class="my-input q-mb-md-md"
                    label="文字顏色"
                  >
                    <template v-slot:append>
                      <q-icon name="colorize" class="cursor-pointer">
                        <q-popup-proxy
                          cover
                          transition-show="scale"
                          transition-hide="scale"
                        >
                          <q-color
                            v-model="graphicObj.fill"
                            default-view="palette"
                          />
                        </q-popup-proxy>
                      </q-icon>
                    </template>
                  </q-input>
                  <q-input
                    v-model.number="graphicObj.hazardTime"
                    type="number"
                    min="0"
                    label="危害時間(秒數)"
                    class="q-mb-md-md"
                  />
                </div>

                <div v-if="activeObjectNode[0].getClassName() === 'Path'">
                  <q-select
                    v-if="
                      activeObjectNode[0].getAttrs().deviceData.iconId !==
                        'fire_o3' &&
                      activeObjectNode[0].getAttrs().deviceData.iconId !==
                        'fire_p7' &&
                      activeObjectNode[0].getAttrs().deviceData?.addressData
                        ?.length > 0
                    "
                    v-model="modelMultiple"
                    multiple
                    :options="[]"
                    use-chips
                    stack-label
                    label="點位"
                    class="q-mb-md-md"
                    disable
                    readonly
                  />

                  <q-select
                    v-if="
                      activeObjectNode[0].getAttrs().deviceData.iconId !==
                        'fire_o3' &&
                      activeObjectNode[0].getAttrs().deviceData.iconId !==
                        'fire_p7'
                    "
                    @add="connectAction($event.value, 'addItem')"
                    @remove="connectAction($event.value, 'deleteItem')"
                    clearable
                    multiple
                    use-chips
                    v-model="graphicObj.connectArray"
                    :options="connectArray"
                    label="設備關聯"
                    class="q-mb-md-md"
                  >
                    <template v-slot:no-option>
                      <q-item>
                        <q-item-section class="text-grey">
                          尚無關聯物件
                        </q-item-section>
                      </q-item>
                    </template></q-select
                  >

                  <div
                    v-if="
                      activeObjectNode[0].getAttrs().deviceData.iconId ===
                      'fire_p7'
                    "
                  >
                    <q-select
                      clearable
                      multiple
                      use-chips
                      v-model="graphicObj.positionNode"
                      :options="positionNodeOptions"
                      label="編組人員定位節點"
                      class="q-mb-md-md"
                    >
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            尚無定位節點
                          </q-item-section>
                        </q-item>
                      </template></q-select
                    >
                  </div>
                </div>
                <!-- 純粹作為顯示的關聯 -->
                <q-select
                  v-if="
                    activeObjectNode[0].getAttrs().deviceData?.iconId ===
                      'fire_o3' ||
                    activeObjectNode[0].getAttrs().deviceData?.iconId ===
                      'fire_p7' ||
                    activeObjectNode[0].getClassName() !== 'Path'
                  "
                  disable
                  readonly
                  multiple
                  use-chips
                  v-model="graphicObj.connectArray"
                  :options="connectArray"
                  label="設備關聯"
                  class="q-mb-md-md"
                />
              </q-card-section>
            </q-card>
          </div>
          <div class="flex column full-height" v-else>
            <q-select
              :model-value="deviceName"
              use-input
              hide-selected
              fill-input
              input-debounce="500"
              :options="deviceNameOptions"
              @filter="filterFn"
              @input-value="setModel"
              class="q-mb-md"
              placeholder="請輸入種類名稱"
            >
              <template v-if="deviceName" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop.prevent="deviceName = ''"
                  class="cursor-pointer"
                />
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    沒有該圖例
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-card class="flex-grow-1">
              <q-tabs
                v-model="graphicIconTab"
                :class="
                  $q.screen.xs || $q.screen.sm
                    ? 'twoTabsPerRow'
                    : 'mainTabsDesign'
                "
                :active-class="
                  $q.screen.xs || $q.screen.sm
                    ? undefined
                    : 'mainTabsActiveClass'
                "
                active-color="activeTab"
                indicator-color="activeTab"
                :active-bg-color="
                  $q.screen.xs || $q.screen.sm ? undefined : 'white'
                "
                content-class="bg-grey-1"
                align="justify"
                narrow-indicator
                outside-arrows
                @update:model-value="tabChange"
              >
                <q-tab name="deviceAddress" label="樓層設備" />
                <q-tab name="iconImage" label="圖例" />
              </q-tabs>

              <q-separator />

              <q-tab-panels
                v-model="graphicIconTab"
                style="height: calc(100vh - 230px)"
                animated
              >
                <q-tab-panel :name="tabValue">
                  <q-scroll-area class="fit" :visible="false">
                    <div v-if="equipIconFilter.length > 0">
                      <span
                        draggable="true"
                        v-for="icon in equipIconFilter"
                        :key="icon.deviceId"
                        @dragstart="dragstart(icon)"
                        :style="graphicLayer
                              ?.getNode()
                              .getChildren()
                              .find((item:any) => item.attrs.deviceData?.deviceId === icon.deviceId) && tabValue === 'deviceAddress'?'cursor: not-allowed':'cursor: grab'"
                      >
                        <SvgIcon
                          auto-close
                          dense
                          flat
                          color="text-primary"
                          :svgName="icon.iconId"
                          font-size="43px"
                          style="padding: 10px"
                          class="svgIcon"
                          :class="{
                          'no-pointer-events bg-grey-3': graphicLayer
                              ?.getNode()
                              .getChildren()
                              .find((item:any) => item.attrs.deviceData?.deviceId === icon.deviceId) && tabValue === 'deviceAddress'
                        }"
                        >
                          <q-tooltip
                            class="text-body2"
                            transition-show="scale"
                            transition-hide="scale"
                            anchor="top middle"
                            self="bottom middle"
                            :offset="[10, 10]"
                          >
                            {{
                              icon.location
                                ? `${icon.name} - ${icon.location}`
                                : icon.name
                            }}
                          </q-tooltip>
                        </SvgIcon>
                      </span>
                    </div>
                    <div v-else class="text-grey">
                      尚無{{
                        tabValue === "deviceAddress" ? "點位" : "圖例"
                      }}資料
                    </div>
                  </q-scroll-area>
                </q-tab-panel>
              </q-tab-panels>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- json viewer -->
    <q-dialog v-model="isJsonViewer">
      <q-card style="width: 500px; max-width: 80vw">
        <q-card-section>
          <div class="text-h6 text-center text-bold">Json 數據</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <JsonEditor :height="400" :data="jsonData" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { uid, QSelectProps, date } from "quasar";

// vue-Json
import JsonEditor from "vue-json-pretty";
import "vue-json-pretty/lib/styles.css";
// vueUse
import {
  // useResizeObserver,
  useClipboard,
  onKeyDown,
  onKeyUp,
  onKeyStroke,
} from "@vueuse/core";
// icon
import {
  mdiShapeSquarePlus,
  mdiShapePolygonPlus,
  mdiCodeJson,
  mdiCheckCircle,
} from "@quasar/extras/mdi-v6";
import {
  matKeyboard,
  matTextFields,
  matRedo,
  matUndo,
  matDelete,
  matRoom,
  matSave,
  matBorderClear,
} from "@quasar/extras/material-icons";
import { mdiTestTube } from "@quasar/extras/mdi-v7";
import { ppBezierCurve } from "quasar-extras-svg-icons/phosphor-icons";
import equipIcons from "src/constant/equipment";

// konva
import Konva from "konva";
import { IRect } from "konva/lib/types";
// api
import Floors, { FloorViewModel } from "src/api/floors";
import Device, { DeviceStatusViewModel } from "src/api/device";
// pinia store
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
import { tempDataType } from "src/api/api.type";
const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);

// 全域變數
const $q = inject("$q") as typeof QVueGlobals;

// 點擊圖示 區塊 文字的客製參數
const isGraphicOpen = ref(false);
const graphicObj = ref<Konva.NodeConfig>({});
const connectArray = ref<Array<QSelectProps>>([]);
const positionNodeOptions = ref<Array<QSelectProps>>([]); // 消防編組人員定位節點

// 取得關聯 : 圖面上所有圖示除了自己
interface connectArrayType {
  label: string;
  id: string;
}
function getConnectArray() {
  const graphicLayerNode = graphicLayer.value?.getNode().getChildren();
  let result;
  if (activeObjectNode.length === 1) {
    // 只有探測器的關聯下拉看的到包含危害時間的文字
    if (activeObjectNode[0].attrs.deviceData?.iconId !== "fire_a2") {
      result = graphicLayerNode.filter(
        (item: Konva.Node) =>
          item.attrs.id !== activeObjectNode[0].attrs.id &&
          !item.attrs.hazardTime
      );
    } else {
      result = graphicLayerNode.filter(
        (item: Konva.Node) => item.attrs.id !== activeObjectNode[0].attrs.id
      );
    }
    if (result.length > 0) {
      connectArray.value = result.map((item: Konva.Node) => {
        return {
          label: item.attrs.name,
          id: item.attrs.id,
        };
      });
    }
  }
}
// 相互關聯
function connectAction(connectData: connectArrayType, status: string) {
  const graphicLayerNode = graphicLayer.value?.getNode().getChildren();
  getConnectArray();
  nextTick(() => {
    const activeItem = {
      label: activeObjectNode[0].attrs.name,
      id: activeObjectNode[0].attrs.id,
    };
    if (status === "addItem") {
      // 新增
      const addNode = graphicLayerNode.find(
        (node: Konva.Node) => node.attrs.id === connectData.id
      );
      addNode.attrs.connectArray.push(activeItem);
    } else if (status === "deleteItem") {
      // 刪除
      const deleteNode = graphicLayerNode.find(
        (node: Konva.Node) => node.attrs.id === connectData.id
      );
      const activeNodeItemIndex = deleteNode.attrs.connectArray.findIndex(
        (item: connectArrayType) => item.id === activeItem.id
      );
      deleteNode.attrs.connectArray.splice(activeNodeItemIndex, 1);
    }
  });
}
// 警示區塊
const graphicIconTab = ref("deviceAddress");
const blockType = ref<string[]>([]);
enum BlockTypeLabels {
  unclassified = "未分類",
  warningArea = "警戒區",
  protectedArea = "防護區",
  radiationArea = "放射區",
  sprinklerArea = "撒水區",
}
const blockTypeOptions = reactive([
  BlockTypeLabels.unclassified,
  BlockTypeLabels.warningArea,
  BlockTypeLabels.protectedArea,
  BlockTypeLabels.radiationArea,
  BlockTypeLabels.sprinklerArea,
]);
// blockType 顯示與否
function blockTypeVisible() {
  const graphicLayerNode = graphicLayer.value?.getNode().getChildren();
  const transformerNode = transformer.value?.getNode() as Konva.Transformer;
  graphicLayerNode.forEach((node: Konva.Node) => {
    if (node.className === "Rect" || node.className === "Line") {
      const result = blockType.value.find(
        (blockType) => blockType === node.attrs.blockType
      );
      if (result) node.show();
      else node.hide();
    }
  });
  transformerNode.hide();
  isGraphicOpen.value = false;
}

// 切換 blockType
function blockTypeChange() {
  nextTick(() => {
    if (graphicObj.value.blockType === BlockTypeLabels.unclassified) {
      graphicObj.value.stroke = "#0a0a0a"; // 黑
    } else if (graphicObj.value.blockType === BlockTypeLabels.warningArea) {
      graphicObj.value.stroke = "#e31717"; // 紅
    } else if (graphicObj.value.blockType === BlockTypeLabels.protectedArea) {
      graphicObj.value.stroke = "#3fb067"; // 綠
    } else if (graphicObj.value.blockType === BlockTypeLabels.radiationArea) {
      graphicObj.value.stroke = "#2e629e"; // 藍
    } else if (graphicObj.value.blockType === BlockTypeLabels.sprinklerArea) {
      graphicObj.value.stroke = "#f0d229"; // 黃
    }
    graphicLayer.value.getNode().batchDraw();
  });
}
// 更改顏色、邊框、文字大小
watch(
  () => [
    graphicObj.value.fill,
    graphicObj.value.stroke,
    graphicObj.value.fontSize,
  ],
  () => {
    graphicLayer.value.getNode().batchDraw();
  }
);

// 點位圖示篩選
const deviceName = ref("");
const deviceNameOptions = ref<string[]>([]);

interface equipIconType {
  id: string;
  iconId: string;
  deviceId?: number;
  name: string;
  location?: string;
  addressData?: object[];
  control?: object[];
  powerAddressData?: object[];
  powerControl?: object[];
  activeColor?: string;
  useType?: number;
}
function filterFn(val: string, update: (func: () => void) => void) {
  update(() => {
    const needle = val.toLocaleLowerCase();
    if (tabValue.value === "deviceAddress") {
      const options = EquipData.value.map((item) => item.name);
      deviceNameOptions.value = options.filter(
        (v) => v.toLocaleLowerCase().indexOf(needle) > -1
      );
    } else {
      const options = equipIcons.map((item) => item.name);
      deviceNameOptions.value = options.filter(
        (v) => v.toLocaleLowerCase().indexOf(needle) > -1
      );
    }
  });
}

const equipIconFilter = ref<equipIconType[]>([]);
const tabValue = ref("");
function tabChange(tab: string) {
  tabValue.value = tab;
  getEquipIconData();
}
// 取得樓層設備的資料
const EquipData = ref<equipIconType[]>([]);
async function getEquipData(floorData: FloorViewModel) {
  const payload = { floorId: floorData.id };
  const result = (await Device.apiGetDeviceWithAddress(
    payload
  )) as typeof AxiosResponse;
  console.log("getEquipData", result.data);
  if (result.data) {
    EquipData.value = result.data.map((data: tempDataType) => {
      return {
        gateway: data.gateway,
        iconId: data.iconId,
        deviceId: data.id,
        name: data.name,
        location: data.location,
        addressData: data.state.map((state: tempDataType) => {
          return {
            area: state.area,
            addressStr:
              state.system || state.address || state.number
                ? `${state.system || ""}${
                    state.address ? "-" + state.address : ""
                  }${state.number ? "-" + state.number : ""}`
                : "",
            driver: state.master.deviceType.driver,
            color: state.color,
          };
        }),
        control: data.control.map((item: tempDataType) => {
          return {
            deviceStatuses: item.deviceStatuses,
            deviceAddress: {
              system: item.deviceAddress.system,
              address: item.deviceAddress.address,
              number: item.deviceAddress.number,
            },
          };
        }),

        powerAddressData: data.powerState.map((state: tempDataType) => {
          return {
            area: state.area,
            addressStr:
              state.system || state.address || state.number
                ? `${state.system || ""}${
                    state.address ? "-" + state.address : ""
                  }${state.number ? "-" + state.number : ""}`
                : "",
            driver: state.master.deviceType.driver,
          };
        }),
        powerControl: data.powerControl,
        useType: data.deviceType.useType,
      };
    });
  }

  console.log("EquipData", EquipData.value);
}

function getEquipIconData() {
  if (tabValue.value === "deviceAddress") {
    equipIconFilter.value = EquipData.value;
  } else {
    equipIconFilter.value = equipIcons;
  }
}
function setModel(val: string) {
  deviceName.value = val;
  if (val !== "") {
    equipIconFilter.value = equipIconFilter.value.filter((item) =>
      item.name.includes(val)
    );
  } else {
    getEquipIconData();
  }
}

onMounted(() => {
  tabValue.value = "deviceAddress";
  getEquipIconData();
});

// 快捷鍵
const hotKeyList = [
  "【滑鼠滾輪】：放大&縮小",
  "【Ctrl】+【C】：複製",
  "【Ctrl】+【V】：貼上",
  "【Ctrl】+【Z】：上一步",
  "【Ctrl】+【Y】：下一步",
  "【Ctrl】+【滑鼠左鍵】：多選圖形",
  "【Delete】：刪除",
  "【Alt】+【➚】+【滑鼠左鍵】：平移",
  "【Shift】+【➚】+【滑鼠左鍵】：多選拖曳",
  "繪製多邊形時，按住【Shift】：正交功能",
];

// 圖控左側功能列
enum FuncListIconLabels {
  Text = "文字",
  Rectangle = "四邊形",
  Polygon = "多邊形",
  Undo = "上一步",
  Redo = "下一步",
  Delete = "刪除圖形",
  AddCurveAnchor = "新增多邊形圓弧錨點",
  Test = "測試用按鈕",
}
const funcListIcon = [
  {
    label: FuncListIconLabels.Text,
    icon: matTextFields,
  },
  {
    label: FuncListIconLabels.Rectangle,
    icon: mdiShapeSquarePlus,
  },
  {
    label: FuncListIconLabels.Polygon,
    icon: mdiShapePolygonPlus,
  },
  {
    label: FuncListIconLabels.AddCurveAnchor,
    icon: ppBezierCurve,
  },
  {
    label: FuncListIconLabels.Undo,
    icon: matUndo,
  },
  {
    label: FuncListIconLabels.Redo,
    icon: matRedo,
  },
  {
    label: FuncListIconLabels.Delete,
    icon: matDelete,
  },
  {
    label: FuncListIconLabels.Test,
    icon: mdiTestTube,
  },
];
enum controlListIconLabels {
  jsonViewer = "查看 JSON 數據",
  restorePosition = "復原位置",
  saveFile = "儲存",
  clear = "清空畫布",
}
// 圖控右側控制列
const controlListIcon = [
  {
    label: controlListIconLabels.jsonViewer,
    icon: mdiCodeJson,
  },
  {
    label: controlListIconLabels.restorePosition,
    icon: matRoom,
  },
  {
    label: controlListIconLabels.saveFile,
    icon: matSave,
  },
  {
    label: controlListIconLabels.clear,
    icon: matBorderClear,
  },
];

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
  getNode: () => Konva.Path;
}
interface vueTransformer {
  getStage: () => Konva.Transformer;
  getNode: () => Konva.Transformer;
}

const canvasContainer = ref<HTMLDivElement>();
// Konva 變數們
const stage = ref<vueStage>();
const layer = ref<vueLayer>();
const iconImage = ref<vuePath[]>();
const scaleX = 1; // 寬度比
// const scaleY = 1; // 高度比
const initialStageSize = {
  width: $q.screen.xs || $q.screen.sm ? 500 : 1500,
  height: $q.screen.xs || $q.screen.sm ? 250 : 900,
};
const stageConfig = reactive({
  width: initialStageSize.width,
  height: initialStageSize.height,
  fill: "white",
  editTime: "",
  scale: { x: 1, y: 1 },
  draggable: false,
});
const bgImageConfig = ref<{
  width: number;
  height: number;
  image?: HTMLImageElement;
  name: string;
  scaleX?: number;
  scaleY?: number;
}>({
  width: initialStageSize.width,
  height: initialStageSize.height,
  name: "background",
  scaleX: 1,
  scaleY: 1,
});

function cofigDraggableChange(bol: boolean) {
  rectangleConfigs.forEach((config) => (config.draggable = bol));
  textConfigs.forEach((config) => (config.draggable = bol));
  polygonConfigs.forEach((config) => (config.draggable = bol));
  iconImageConfigs.forEach((config) => (config.draggable = bol));
}
watch(
  () => stageConfig.draggable,
  (val) => {
    // 當 stage 可拖動時 => 限制圖形、物件不能移動
    if (val) cofigDraggableChange(false);
    else cofigDraggableChange(true);
  }
);
// 圖形 - 鍵盤事件
onKeyDown("Alt", () => {
  stageConfig.draggable = true;
});
onKeyUp("Alt", () => {
  if (stageConfig.draggable) stageConfig.draggable = false;
});
onKeyDown("Shift", () => {
  if (polygonCircles.length) {
    const calculatedPosition = calculateMousePosition({
      x: mousePos.value.x,
      y: mousePos.value.y,
    });
    // 更新位置
    updatePositions(calculatedPosition);
  }
});
onKeyUp("Shift", () => {
  if (polygonCircles.length) {
    updatePositions({ x: mousePos.value.x, y: mousePos.value.y });
  }
});
const cloneNode = reactive<Konva.Shape[]>([]);
const source = ref(""); // 複製的文字內容

// 複製物件
function copyConfigs() {
  nextTick(() => {
    cloneNode.length = 0;
    activeObjectNode.forEach((node, idx) => {
      const name = node.attrs.name.split(" - ")[0]
        ? node.attrs.name.split(" - ")[0]
        : node.attrs.name;

      let resultNum = 0;
      const className = node.getClassName();

      if (className === "Path") {
        resultNum = iconImageConfigs.filter(
          (item) =>
            item.deviceData?.deviceId === node.attrs.deviceData?.deviceId
        ).length;
      } else if (className === "Rect") {
        resultNum = rectangleConfigs.length;
      } else if (className === "Text") {
        resultNum = textConfigs.length;
      } else if (className === "Line") {
        resultNum = polygonConfigs.length;
      }
      cloneNode.push(
        node.clone({
          name: name + ` - ${resultNum}`,
          x: node.x() + 50,
          y: node.y(),
          id: uid(),
        })
      );
    });
  });
}
onKeyStroke((e) => {
  const { copy } = useClipboard({ source });
  // 從其他瀏覽器複製過的文字內容
  document.addEventListener("paste", (event: ClipboardEvent) => {
    // 取得剪貼簿的內容
    const clipboardData = event.clipboardData;
    // 取得剪貼簿中的文字內容
    const text = clipboardData?.getData("text");
    if (text) {
      source.value = text;
      copy(source.value);
    }
  });
  // 預設的複製貼上文字功能
  if ((e.code === "KeyC" || e.code === "KeyV") && e.ctrlKey) {
    const selection = window.getSelection()?.toString();
    if (selection) {
      source.value = selection;
      copy(source.value);
    } else {
      source.value = "";
    }
  }

  if (!source.value) {
    if (
      e.code === "KeyC" &&
      e.ctrlKey &&
      activeObjectNode.length &&
      !isTyping
    ) {
      // 複製
      copyConfigs();
    } else if (
      e.code === "KeyV" &&
      e.ctrlKey &&
      cloneNode.length &&
      !isTyping
    ) {
      // 貼上
      selectedShapeId.length = 0;
      cloneNode.forEach((node) => {
        const className = node.getClassName();
        if (className === "Rect") rectangleConfigs.push(node.attrs);
        else if (className === "Text") textConfigs.push(node.attrs);
        else if (className === "Line") polygonConfigs.push(node.attrs);
        else if (className === "Path") {
          iconImageConfigs.push(node.attrs);
        }
        selectedShapeId.push(node.attrs.id);
      });

      updateGraphic();
      nextTick(addDataToUndo);
      cloneNode.length = 0;
      copyConfigs();
    } else if (e.code === "Delete" && !isTyping) {
      // 刪除
      deleteGraphic();
      nextTick(addDataToUndo);
    } else if (e.code === "KeyZ" && e.ctrlKey && !e.shiftKey && !isTyping) {
      doUndo(); // 上一步
    } else if (
      e.ctrlKey &&
      !isTyping &&
      (e.code === "KeyY" || (e.code === "KeyZ" && e.shiftKey))
    ) {
      doRedo(); // 下一步
    }
  }
  if (e.code === "Escape") {
    if (selectTool.value === FuncListIconLabels.Polygon) finishDrawingPolygon();
  }
});

// 載入背景圖
function loadBackgroundImage(imageUrl: string) {
  const image = new window.Image();
  image.src = imageUrl;
  image.onload = () => {
    let scale;
    const { width, height } = image;
    if (width / height > 1) scale = stageConfig.width / width; // 橫的圖片
    else scale = stageConfig.height / height; // 直的圖片
    bgImageConfig.value = {
      image,
      width,
      height,
      scaleX: scaleX * scale,
      scaleY: scaleX * scale,
      name: "background",
    };
    nextTick(() => {
      nowState = stage.value?.getStage().toJSON() as string;
    });
  };
}
// 背景放大與縮小
const zoom = ref(1);
function handleStageZoom(e: Konva.KonvaEventObject<WheelEvent>) {
  const getStage = stage.value?.getStage();
  const zoomStep = 0.05; // 每次縮放的比例
  const oldScale = getStage?.scaleX();
  if (oldScale && getStage && canvasContainer.value) {
    zoom.value = Math.max(0.5, zoom.value);
    zoom.value = Math.min(5, zoom.value);
    zoom.value =
      e.evt.deltaY > 0 ? -zoomStep + zoom.value : zoomStep + zoom.value;
    const center = {
      x: canvasContainer.value.getBoundingClientRect().width / 2,
      y: canvasContainer.value.getBoundingClientRect().height / 2,
    };
    getStage?.scale({
      x: zoom.value,
      y: zoom.value,
    });
    const mousePointTo = {
      x: (center.x - getStage.x()) / oldScale,
      y: (center.y - getStage.y()) / oldScale,
    };
    const newPosition = {
      x: center.x - mousePointTo.x * zoom.value,
      y: center.y - mousePointTo.y * zoom.value,
    };
    getStage?.position(newPosition);
  }
}

// 取得滑鼠與在 canvas 的動態座標
const mousePos = ref<{
  x: number;
  y: number;
}>({
  x: 0,
  y: 0,
});
// 圖例

const iconImageConfigs = reactive<Array<Konva.PathConfig>>([]);
function getIconImageConfig(
  x: number,
  y: number,
  data: string,
  iconImageData: equipIconType
) {
  return {
    x,
    y,
    width: 300,
    height: 300,
    scaleX: 0.1,
    scaleY: 0.1,
    data,
    draggable: true,
    fill: "#2970c2", // 深藍
    connectArray: [],
    id: iconImageData.id,
    name: iconImageData.name,
    deviceData: iconImageData,
    hitFunc: function (context: Konva.Context, shape: Konva.Shape) {
      const { width, height } = shape.attrs;
      context.beginPath();
      context.rect(0, 0, width, height);
      context.closePath();
      context.fillStrokeShape(shape);
    },
  };
}

// 拖曳 SvgIcon 進畫布
const iconImageData = ref();
function dragstart(icon: equipIconType) {
  iconImageData.value = icon;
  iconImageData.value.url = `/svgIcons/${icon.iconId}.svg#${icon.iconId}`;
  iconImageData.value.activeColor = icon.activeColor;
  iconImageData.value.id = uid();
}

interface OriginalMouseEvents extends MouseEvent, DragEvent {}
type KonvaMouseEvents =
  | Konva.KonvaEventObject<MouseEvent>
  | Konva.KonvaPointerEvent;
function getAbsoluteMousePos(e: OriginalMouseEvents | KonvaMouseEvents) {
  const absolutePos = stage.value?.getStage().absolutePosition();
  const zoom = stage.value?.getStage().scaleX();

  if (absolutePos && zoom) {
    let pos = { x: 0, y: 0 };

    if ((e as OriginalMouseEvents).offsetX !== undefined) {
      pos = {
        x: ((e as OriginalMouseEvents).offsetX - absolutePos.x) / zoom,
        y: ((e as OriginalMouseEvents).offsetY - absolutePos.y) / zoom,
      };
    } else if (
      (e as KonvaMouseEvents).evt &&
      (e as KonvaMouseEvents).evt.offsetX !== undefined
    ) {
      pos = {
        x: ((e as KonvaMouseEvents).evt.offsetX - absolutePos.x) / zoom,
        y: ((e as KonvaMouseEvents).evt.offsetY - absolutePos.y) / zoom,
      };
    }

    // 檢查是否按下 Shift 鍵
    const shiftPressed =
      (e as OriginalMouseEvents).shiftKey ||
      (e as KonvaMouseEvents).evt?.shiftKey;

    // 如果按下 Shift 鍵，則使用 calculateMousePosition 處理位置
    if (shiftPressed && polygonCircles.length) {
      mousePos.value = calculateMousePosition(pos);
    } else {
      mousePos.value = pos;
    }
  }
}

async function drop() {
  mousePos.value.x = mousePos.value.x - 15;
  mousePos.value.y = mousePos.value.y - 15;
  const data = await loadSvg(iconImageData.value.url);
  const basicIconImageConfig = getIconImageConfig(
    mousePos.value.x,
    mousePos.value.y,
    data,
    iconImageData.value
  );
  iconImageConfigs.push(basicIconImageConfig);

  nextTick(() => {
    selectedShapeId.length = 0;
    selectedShapeId.push(basicIconImageConfig.id);
    updateGraphic();
    addDataToUndo();
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
// 取得最新的物件資料
function updateGraphic() {
  nextTick(() => {
    updateTransformer();
    // 綁定物件屬性
    if (activeObjectNode.length && activeObjectNode.length === 1) {
      graphicObj.value = activeObjectNode[0].attrs;
      isGraphicOpen.value = true;
    } else {
      graphicObj.value = {};
      isGraphicOpen.value = false;
    }
  });
}

// 點擊控制列
const isJsonViewer = ref(false);
const jsonData = ref();
let isPainting = false;
let isControlAnchoring = false;
const selectTool = ref("");
const activeToolBtn = ref("");

function handleClickToolBtn(
  e: Event,
  target: {
    label: string;
    icon: string;
  }
) {
  selectTool.value = activeToolBtn.value = target.label;
  if (
    target.label === FuncListIconLabels.Text ||
    target.label === FuncListIconLabels.Rectangle ||
    target.label === FuncListIconLabels.Polygon
  ) {
    isPainting = true;
  } else {
    if (target.label === FuncListIconLabels.Delete && !isTyping) {
      deleteGraphic();
    } else if (target.label === FuncListIconLabels.Undo && !isTyping) doUndo();
    else if (target.label === FuncListIconLabels.Redo && !isTyping) doRedo();
    else if (target.label === FuncListIconLabels.Test && !isTyping) testFunc();
    else if (target.label === FuncListIconLabels.AddCurveAnchor && !isTyping) {
      addCurveAnchor();
    }

    closeToolActive();
  }
}
const anchorLists = [];
function addCurveAnchor() {
  if (!polygonAnchorPoints.length) {
    $q.notify({
      type: "warning",
      message: "請先選擇一個多邊形",
      position: "top",
    });
    return;
  }
  isControlAnchoring = true;
}
// TODO: 測試用方法 之後要刪掉
function testFunc() {
  console.log("testFunc");
  // const layer = graphicLayer.value?.getStage();
  // console.log("now layer", layer);
  // if (layer) layer.toggleHitCanvas();

  // activeObjectNode[0].setAttrs({ x: 0, y: 0 }); // 移動物件至 (0, 0)

  // activeObjectNode[0].setAttrs({ offsetX: 10, offsetY: 10 }); // 移動物件 offset
}
function getJsonData() {
  jsonData.value = stage.value?.getStage().toJSON()
    ? JSON.parse(stage.value?.getStage().toJSON())
    : "";
}
function handleClickControlBtn(
  e: Event,
  target: {
    label: string;
    icon: string;
  }
) {
  // 復原位置
  if (target.label === controlListIconLabels.restorePosition) {
    stage.value?.getStage().x(0);
    stage.value?.getStage().y(0);
    stage.value?.getStage().scale({
      x: 1,
      y: 1,
    });
    zoom.value = 1;
  } else if (target.label === controlListIconLabels.jsonViewer) {
    // 查看 JSON 位置
    isJsonViewer.value = true;
    getJsonData();
  } else if (target.label === controlListIconLabels.saveFile) {
    // 儲存圖控
    saveGraphicFile();
  } else if (target.label === controlListIconLabels.clear) {
    // 清空畫布
    clearCanvas();
    clearAnchorPointsAndResetPolyId();
  }
}
const currentFloor = ref<FloorViewModel>();
async function handleSelect(floorData: FloorViewModel, imageUrl?: string) {
  console.log("now floorData", floorData);
  // 儲存 Canvas 資料，並清空畫布
  resetCanvas();
  if (!imageUrl) return;
  // 如果有 AllFloors 裡面有拿到 floorImage 且 emit handleSelect 的話 => 載入圖片
  Object.values(BlockTypeLabels).forEach((label) => {
    blockType.value.push(label);
  });
  blockTypeVisible();
  loadBackgroundImage(imageUrl);
  currentFloor.value = floorData;
  const jsonData = await getFloorGraphicJson(floorData.id as number);
  if (jsonData) loadShapeFromJson(jsonData);
  // load 出樓層點位
  await getEquipData(floorData);
  getEquipIconData();
}
async function getFloorGraphicJson(floorId: number) {
  const result = (await Floors.apiGetFloorGraphicFile(
    floorId
  )) as typeof AxiosResponse;
  if (result.data) {
    const decodedData = atob(result.data);
    const jsonData = new TextDecoder().decode(
      // 將二進制數據轉換成 UTF-8 編碼的字串
      new Uint8Array([...decodedData].map((char) => char.charCodeAt(0)))
    );
    return jsonData;
  } else {
    return "";
  }
}

async function saveGraphicFile() {
  // 儲存圖控資料之前要先把被點選變色後的 icon 還原
  const transformerNode = transformer.value?.getNode() as Konva.Transformer;
  transformerNode.nodes([]);
  selectAndChangeIconColor("#bdbbbb"); // 灰
  getJsonData();
  if (jsonData.value) {
    jsonData.value.attrs.editTime = date.formatDate(
      new Date().toISOString(),
      "YYYY-MM-DD HH:mm"
    );
  }
  const jsonStr = JSON.stringify(jsonData.value);
  const fileContent = new File([jsonStr], currentFloor.value?.floor1 + ".txt", {
    type: "",
  });
  console.log("fileContent", fileContent);
  const formData = new FormData();
  const fileName = `${Bid}_${currentFloor.value?.id}.txt`;
  formData.append("file", fileContent, fileName);
  const result = await Floors.apiSaveFloorGraphicFile(
    currentFloor.value?.id as number,
    formData
  );
  if (result) {
    $q.notify({
      type: "positive",
      message: "儲存圖控成功",
      position: "top",
    });
    selectAndChangeIconColor();
  } else {
    $q.notify({
      type: "negative",
      message: "儲存圖控失敗",
      position: "top",
    });
  }
  console.log("saveGraphicFile", result);
}
function clearCanvas() {
  // 清除節點
  // 清除節點config
  rectangleConfigs.length = 0;
  textConfigs.length = 0;
  polygonConfigs.length = 0;
  iconImageConfigs.length = 0;
  // 隱藏 transformer
  const transformerNode = transformer.value?.getNode() as Konva.Transformer;
  transformerNode.nodes([]);
  transformerNode.hide();
}
function closeToolActive() {
  // 關掉已選擇的 selectTool
  selectTool.value = activeToolBtn.value = "";
  isPainting = false;
}

// 上一步 / 下一步
const undo: string[] = [];
const redo: string[] = [];
let nowState = ""; // 現在狀態的JSON數據
// undo / redo
function doUndo() {
  if (isPainting) {
    $q.notify({
      type: "negative",
      message: "請完成繪畫再進行復原操作",
      position: "top",
    });
    return;
  }
  if (undo.length === 0) {
    $q.notify({
      type: "warning",
      message: "目前沒有動作可復原",
      position: "top",
    });
    return;
  }
  saveJsonStateToArray(redo);
  clearCanvas();
  const lastJson = undo.pop() as string;
  nextTick(() => {
    loadShapeFromJson(lastJson);
    nowState = lastJson;
  });
}
function doRedo() {
  if (isPainting) {
    $q.notify({
      type: "negative",
      message: "請完成繪畫再進行重作操作",
      position: "top",
    });
    return;
  }
  if (redo.length === 0) {
    $q.notify({
      type: "warning",
      message: "目前沒有動作可重作",
      position: "top",
    });
    return;
  }
  saveJsonStateToArray(undo);
  clearCanvas();
  const nextJson = redo.pop() as string;
  nextTick(() => {
    loadShapeFromJson(nextJson);
    nowState = nextJson;
  });
}
function loadShapeFromJson(json: string) {
  JSON.parse(json).children[1].children.forEach((shape: Konva.Shape) => {
    if (shape.className === "Rect") rectangleConfigs.push(shape.attrs);
    else if (shape.className === "Text") textConfigs.push(shape.attrs);
    else if (shape.className === "Line") polygonConfigs.push(shape.attrs);
    else if (shape.className === "Path") {
      iconImageConfigs.push(shape.attrs);
    }
    stageConfig.editTime = JSON.parse(json).attrs.editTime;
  });
  jsonData.value = JSON.parse(json);
  nextTick(selectAndChangeIconColor);
}
function saveJsonStateToArray(jsonStateArray: string[]) {
  jsonStateArray.push(nowState as string);
}
function addDataToUndo() {
  const lastState = undo[undo.length - 1];
  if (lastState === nowState) return;
  nextTick(() => {
    if (undo.length && undo.length === 10) undo.shift(); // 最多只儲存十筆動作
    saveJsonStateToArray(undo);
    nowState = stage.value?.getStage().toJSON() as string;
    redo.length = 0; // 清空redo
  });
}
// Konva 繪製形狀相關邏輯
const activeObjectNode = reactive<Konva.Node[]>([]); // 目前選取到的物件

// 選擇物件方型區域參數設定
const selectionRectangleConfig = reactive<Konva.RectConfig>({
  fill: "#d3d3d3", // 淺灰
  opacity: 0.3,
  visible: false,
  name: "selectionRectangle",
});
const selectionRectangleConfigPos = reactive({ x1: 0, x2: 0, y1: 0, y2: 0 });
// 刪除圖形
function deleteGraphic() {
  if (!activeObjectNode.length) {
    $q.notify({
      type: "warning",
      message: "目前沒有選擇任何物件",
      position: "top",
    });
    return;
  }

  deleteConfigData(selectedShapeId);

  if (currentPolyId.value) clearAnchorPointsAndResetPolyId();

  activeObjectNode.length = selectedShapeId.length = 0;
  selectTool.value = activeToolBtn.value = "";
  isGraphicOpen.value = false;
  const transformerNode = transformer.value?.getNode() as Konva.Transformer;
  transformerNode.nodes([]);
}
function deleteConfigData(idArray: string[]) {
  idArray.forEach((id, i) => {
    const className = activeObjectNode[i].getClassName();
    if (className === "Rect") {
      const index = rectangleConfigs.findIndex((rect) => rect.id === id);
      rectangleConfigs.splice(index, 1);
    } else if (className === "Text") {
      const index = textConfigs.findIndex((text) => text.id === id);
      textConfigs.splice(index, 1);
    } else if (className === "Line") {
      const index = polygonConfigs.findIndex((line) => line.id === id);
      polygonConfigs.splice(index, 1);
    } else if (className === "Path") {
      const index = iconImageConfigs.findIndex((image) => image.id === id);
      iconImageConfigs.splice(index, 1);
    }
  });
}

// 處理繪製多邊形時點擊 Stage 外的意外行為
watch(selectTool, (newval, oldval) => {
  if (newval === FuncListIconLabels.Polygon) setupGlobalClickListener();
  else if (oldval === FuncListIconLabels.Polygon) finishDrawingPolygon();
});
function setupGlobalClickListener() {
  setTimeout(() => {
    document.addEventListener("click", handleGlobalClick);
  }, 0);
}
function removeGlobalClickListener() {
  document.removeEventListener("click", handleGlobalClick);
}
function handleGlobalClick(event: MouseEvent) {
  // 檢查點擊是否發生在 Konva stage 之外
  const clickedOutsideStage = !(event.target as HTMLElement).closest(
    ".konvajs-content"
  );
  if (clickedOutsideStage && selectTool.value === FuncListIconLabels.Polygon) {
    finishDrawingPolygon();
  }
}
function finishDrawingPolygon() {
  // 將多邊形的最後一個點連接到起始點
  if (polygonCircles.length > 3) {
    points[points.length - 2] = polygonCircles[0].x();
    points[points.length - 1] = polygonCircles[0].y();
    closeLinePath();
  } else {
    // 清除所有繪製的圓點
    polygonCircles.forEach((circle) => circle.destroy());
    polygonCircles.length = 0;
    // 清除繪製的線條
    const drawingLine = stage.value?.getStage().findOne(".DrawingLine");
    drawingLine?.destroy();
    points.length = 0; // 重置 points 陣列
    // selectedShapeId.length = 0; // TODO: 因為畫完時沒有正確的附加 Transformer 所以先註解，待確認不會造成錯誤可刪除
    updateGraphic();
  }
  removeGlobalClickListener(); // 刪除全局點擊監聽器
  closeToolActive(); // 你可能還需要其他清理邏輯
}

// 處理點擊 Stage 時的相關行為
// ! 此處邏輯複雜，修改時請多加注意
// TODO: 可以考慮猜分邏輯
function handleStageMouseDown(e: Konva.KonvaEventObject<MouseEvent>) {
  getAbsoluteMousePos(e);
  // 如果點擊右鍵 => 什麼事都不做
  if (e.evt.button === 2) return;

  // 檢查是否點擊的是角點
  if (e.target.id() && e.target.id().startsWith("anchor_")) return;

  if (stageConfig.draggable) return; // 按住 Alt 拖曳時不動作

  // 若是點擊在 transformer => 什麼事都不做
  // Tip: e.target.getParent() 可 e.target.parent 替代
  if (e.target.getParent()?.className === "Transformer") return;

  clearAnchorPointsAndResetPolyId();

  // 繪製 polygon
  if (selectTool.value === FuncListIconLabels.Polygon) {
    // 第一次點擊 => 開始繪製
    if (polygonCircles.length === 0) {
      drawCircle(mousePos.value.x, mousePos.value.y);
      drawLine(points);
      // 開始繪製 polygon 後清除選擇的物件
      const transformerNode = transformer.value?.getNode() as Konva.Transformer;
      if (transformerNode) {
        updateSelected([]);
        transformerNode.nodes([]);
      }
    }
    // 如果點擊在初始錨點時結束這個 Polygon 的繪製
    if (polygonCircles.length > 3 && isInsideCircle()) {
      // 把第一個錨點的位置附給 line 作為結尾點
      points[points.length - 2] = polygonCircles[0].x();
      points[points.length - 1] = polygonCircles[0].y();
      // 關閉 LinePath
      closeLinePath();
      closeToolActive();
      nextTick(addDataToUndo);
      return;
    }
    // 如果circle數量大於二，且點擊在倒數第二個circle上時 => 就不繪製新的circle
    if (
      polygonCircles.length > 2 &&
      isInsideCircle(polygonCircles.length - 2)
    ) {
      return;
    }
    drawCircle(mousePos.value.x, mousePos.value.y);
    return;
  }

  // 點擊在物件上
  const clickRectangle = e.target.className === "Rect";
  const clickText = e.target.className === "Text";
  const clickPolygon = e.target.className === "Line";
  const clickImageIcon = e.target.className === "Path";
  const isClickOnShape =
    clickRectangle || clickText || clickPolygon || clickImageIcon;
  if (isClickOnShape) {
    const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
    const transformerNode = transformer.value?.getNode() as Konva.Transformer;
    const isSelected = transformerNode.nodes().indexOf(e.target) >= 0;
    let nodes;
    if (!metaPressed && !isSelected && !isPainting) {
      // 如果沒有按meta鍵且節點未被選中 => 只選擇一個
      updateSelected([e.target]);
      transformerNode.nodes([e.target]);

      if (clickPolygon) {
        const poly = e.target as Konva.Line;
        const newPolyId = poly.id();

        if (currentPolyId.value === newPolyId) return;
        clearAnchorPointsAndResetPolyId(); // 清空 polygonAnchorPoints
        currentPolyId.value = newPolyId;

        // 針對 poly 本身的事件處理
        poly.on("dragmove", (e) => {
          const points = (e.target as Konva.Line).points();
          const scaleX = poly.scaleX();
          const scaleY = poly.scaleY();
          const offsetX = poly.offsetX();
          const offsetY = poly.offsetY();
          // 更新 anchorPoints 的位置
          polygonAnchorPoints.forEach((circle, index) => {
            const startIndex = index * 2;
            const newX = points[startIndex] * scaleX + poly.x() - offsetX;
            const newY = points[startIndex + 1] * scaleY + poly.y() - offsetY;
            circle.position({ x: newX, y: newY });
          });

          graphicLayer.value.getStage().draw();
        });

        // 針對 poly 上的錨點的事件處理
        const points = poly.points();
        points.forEach((point, index) => {
          if (index % 2 === 0) {
            const isFirstPoint = index === points.length - 2;
            const scaleX = poly.scaleX();
            const scaleY = poly.scaleY();
            const offsetX = poly.offsetX();
            const offsetY = poly.offsetY();

            const circle = new Konva.Circle({
              x: point * scaleX + poly.x() - offsetX,
              y: points[index + 1] * scaleY + poly.y() - offsetY,
              radius: 5,
              fill: "red",
              draggable: true,
              id: `anchor_${poly.id()}_${index / 2}`,
            });

            graphicLayer.value.getStage().add(circle);
            polygonAnchorPoints.push(circle); // 保存錨點

            const stageNode = stage.value?.getNode() as Konva.Stage;

            circle.on("mouseover", () => {
              circle.stroke("#306478");
              circle.shadowColor("#306478");
              circle.shadowBlur(8);
              circle.scale({ x: 1.1, y: 1.1 });
              graphicLayer.value.getStage().draw();
            });

            circle.on("mouseout", () => {
              circle.fill("red");
              circle.stroke("");
              circle.shadowColor("");
              circle.shadowBlur(0);
              circle.scale({ x: 1, y: 1 });
              graphicLayer.value.getStage().draw();
            });

            circle.on("dragmove", (e) => {
              const scaleX = poly.scaleX();
              const scaleY = poly.scaleY();
              const offsetX = poly.offsetX(); // ? offset 值不知道為什麼都是 0
              const offsetY = poly.offsetY(); // ? offset 值不知道為什麼都是 0
              const newPoints = [...poly.points()];
              const circleAttrs = circle.getAttrs();
              const absPos = circle.getAbsolutePosition();

              const stageNode = stage.value?.getStage();
              if (!stageNode) return;
              const stageScale = stageNode.scaleX(); // 假設 X 和 Y 縮放相同
              const stagePosition = stageNode.position();
              // 計算縮放後的全局座標到物件本地座標的轉換
              const localX =
                (absPos.x - stagePosition.x) / stageScale - poly.x() + offsetX;
              const localY =
                (absPos.y - stagePosition.y) / stageScale - poly.y() + offsetY;
              // 考慮到物件自身的縮放
              const deltaX = localX / scaleX;
              const deltaY = localY / scaleY;

              newPoints[index] = deltaX;
              newPoints[index + 1] = deltaY;

              if (isFirstPoint) {
                // 第一個點也需要跟著移動
                newPoints[0] = deltaX;
                newPoints[1] = deltaY;
                // 更新圓圈位置
                const firstCircle = graphicLayer.value
                  .getStage()
                  .findOne(`#anchor_${poly.id()}_${0 / 2}`);
                const firstCircleId = firstCircle.getAttrs().id;
                firstCircle.setAttrs({ ...circleAttrs, id: firstCircleId });
              }

              poly.points(newPoints);
              graphicLayer.value.getStage().draw();
            });
          }
        });
        graphicLayer.value.getStage()?.draw();
      }
    } else if (metaPressed && isSelected) {
      // 如果我們按下鍵並且節點已被選中過 => 我們需要將其從選擇中移除：
      nodes = transformerNode.nodes().slice(); // 拷貝節點
      nodes.splice(nodes.indexOf(e.target), 1); // remove node from array
      updateSelected(nodes);
      transformerNode.nodes(nodes);
    } else if (metaPressed && !isSelected) {
      nodes = transformerNode.nodes().concat([e.target]);
      updateSelected(nodes);
      transformerNode.nodes(nodes);
    }
    updateGraphic();
    //  如果只抓到圖控 icon 的話，更改transformer config成只能旋轉
    if (clickImageIcon) {
      transformerNode.setAttrs({
        rotationSnaps: [0, 90, 180, 270],
        enabledAnchors: [],
      });
    } else {
      transformerNode.setAttrs({
        rotationSnaps: [0, 90, 180, 270],
        enabledAnchors: [
          "middle-left",
          "middle-right",
          "top-left",
          "top-center",
          "top-right",
          "bottom-left",
          "bottom-center",
          "bottom-right",
        ],
      });
    }
  } else if (
    selectTool.value === "" &&
    !isPainting &&
    !stageConfig.draggable &&
    !isClickOnShape
  ) {
    // 如果不是點擊在物件節點上，且沒有選擇Tool => 執行方法讓 selectionRectangle 可見
    // 開始繪製多選功能的Rect
    selectionRectangleConfigPos.x1 = mousePos.value.x;
    selectionRectangleConfigPos.x2 = mousePos.value.x;
    selectionRectangleConfigPos.y1 = mousePos.value.y;
    selectionRectangleConfigPos.y2 = mousePos.value.y;

    selectionRectangleConfig.visible = true;
    selectionRectangleConfig.width = 0;
    selectionRectangleConfig.height = 0;
  } else if (isPainting && !isClickOnShape) {
    // 如果不是點擊在物件節點上，且 isPainting 為真 => 新增圖形
    // 繪製 Rect || Text
    if (selectTool.value === FuncListIconLabels.Rectangle) {
      const basicRect = getBasicRect(mousePos.value.x, mousePos.value.y);
      rectangleConfigs.push(basicRect);
      selectedShapeId.length = 0;
      selectedShapeId.push(basicRect.id);
    } else if (selectTool.value === FuncListIconLabels.Text) {
      const basicTextConfig = getBasicTextConfig(
        mousePos.value.x,
        mousePos.value.y
      );
      textConfigs.push(basicTextConfig);
      selectedShapeId.length = 0;
      selectedShapeId.push(basicTextConfig.id);
    }
    closeToolActive();
    updateGraphic();
    nextTick(addDataToUndo);
  }
}

function handleStageMouseMove(e: Konva.KonvaPointerEvent) {
  getAbsoluteMousePos(e);
  // 區域選擇設定
  if (selectTool.value === "" && !isPainting && !stageConfig.draggable) {
    selectionRectangleConfigPos.x2 = mousePos.value.x;
    selectionRectangleConfigPos.y2 = mousePos.value.y;

    selectionRectangleConfig.x = Math.min(
      selectionRectangleConfigPos.x1,
      selectionRectangleConfigPos.x2
    );
    selectionRectangleConfig.y = Math.min(
      selectionRectangleConfigPos.y1,
      selectionRectangleConfigPos.y2
    );
    selectionRectangleConfig.width = Math.abs(
      selectionRectangleConfigPos.x2 - selectionRectangleConfigPos.x1
    );
    selectionRectangleConfig.height = Math.abs(
      selectionRectangleConfigPos.y2 - selectionRectangleConfigPos.y1
    );
  }

  if (!polygonCircles.length) return;

  updatePositions(mousePos.value);
}
function updatePositions(position: { x: number; y: number }) {
  const len = points.length;
  // 更新 points 的最後兩個值來 update Line position
  if (len >= 2) {
    points[len - 2] = position.x;
    points[len - 1] = position.y;
  }

  // 更新 polygonCircles 的最後一個 circle 來 update circle position
  if (lastCircle.value) {
    lastCircle.value.setAttrs({
      x: position.x,
      y: position.y,
    });
  }
}
// 計算正交位置
enum AngleComparison {
  Horizontal,
  Vertical,
  Diagonal,
}
function compareAngle(angle: number): AngleComparison {
  const normalizedAngle = Math.round(angle) % 360;
  const isDiagonal = normalizedAngle % 45 === 0 && normalizedAngle % 90 !== 0;

  if (isDiagonal) {
    return AngleComparison.Diagonal;
  } else if (normalizedAngle === 0 || normalizedAngle === 180) {
    return AngleComparison.Horizontal;
  } else if (normalizedAngle === 90 || normalizedAngle === 270) {
    return AngleComparison.Vertical;
  } else {
    // 如果角度不是垂直或水平，找出距離最近的45度倍數
    const closestMultipleOf45 = Math.round(normalizedAngle / 45) * 45;
    if (closestMultipleOf45 % 180 === 0) {
      return AngleComparison.Horizontal;
    } else if (closestMultipleOf45 % 90 === 0) {
      return AngleComparison.Vertical;
    }
    return AngleComparison.Diagonal;
  }
}
function calculateMousePosition({ x, y }: { x: number; y: number }) {
  const len = points.length;
  const previousPoint = { x: points[len - 4], y: points[len - 3] };

  const deltaX = x - previousPoint.x;
  const deltaY = y - previousPoint.y;

  // 將角度轉換為 0 到 360 度
  const angleInDegrees = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
  const angle = (angleInDegrees + 360) % 360;
  // 計算角度與主要方向的差異
  const angleComparison = compareAngle(angle);

  if (angleComparison === AngleComparison.Diagonal) {
    const closest45Mult = Math.round(angle / 45) * 45; // 找到最近的45度倍數角度
    const slope = Math.tan((closest45Mult * Math.PI) / 180); // 計算斜率
    const intercept = previousPoint.y - slope * previousPoint.x; // 找到直線方程式 y = mx + b 的 y 截距 b
    // 計算交點
    const crossX = (slope * x + y - intercept) / (slope + 1 / slope);
    const crossY = slope * crossX + intercept;

    return { x: crossX, y: crossY };
  } else if (angleComparison === AngleComparison.Horizontal) {
    return { x, y: previousPoint.y };
  } else if (angleComparison === AngleComparison.Vertical) {
    return { x: previousPoint.x, y };
  }

  return { x, y };
}

function handleStageMouseUp() {
  if (!selectionRectangleConfig.visible) return;
  nextTick(() => {
    selectionRectangleConfig.visible = false;
  });

  const stageNode = stage.value?.getStage();
  const selectionRectangle = stageNode?.findOne(".selectionRectangle");
  const clientRect = selectionRectangle?.getClientRect();
  const shapeNodes = graphicLayer.value?.getNode().children;
  const selected = shapeNodes.filter((shape: Konva.Node) =>
    Konva.Util.haveIntersection(clientRect as IRect, shape.getClientRect())
  ) as Konva.Node[];
  // 更新 activeObjectNode 和 selectedShapeId
  updateSelected(selected);
  updateGraphic();
  const transformerNode = transformer.value?.getNode() as Konva.Transformer;
  transformerNode.nodes(selected);

  // 如果只抓到單一圖控 icon 的話，更改transformer config成只能旋轉
  const allImage = selected.every((node) => node.getClassName() === "Path");
  if (selected && allImage) {
    transformerNode.setAttrs({
      enabledAnchors: [],
      rotationSnaps: [0, 90, 180, 270],
    });
  } else {
    transformerNode.setAttrs({
      rotationSnaps: [0, 90, 180, 270],
      enabledAnchors: [
        "middle-left",
        "middle-right",
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    });
  }
  if (selected.length > 0) {
    getConnectArray();
    isGraphicOpen.value = true;
  }
}
function isInsideCircle(circleIndex = 0) {
  const testCircleIndex = polygonCircles[circleIndex].attrs;
  const distance = Math.sqrt(
    (mousePos.value.x - testCircleIndex.x + testCircleIndex.radius) ** 2 +
      (mousePos.value.y - testCircleIndex.y + testCircleIndex.radius) ** 2
  );
  return distance < testCircleIndex.radius * 2.4;
}
function closeLinePath() {
  // 繪製 Polygon
  polygonConfigs.push({
    name: "Line" + (polygonConfigs.length + 1),
    points: JSON.parse(JSON.stringify(points)),
    fill: "#ededed",
    draggable: true,
    closed: true,
    strokeScaleEnabled: false,
    opacity: 0.5,
    stroke: "#0a0a0a",
    strokeWidth: 5,
    blockType: "未分類",
    connectArray: [],
    id: uid(),
  });
  // 刪除節點並初始化 circle, points 給新的 line 用
  const drawingLine = stage.value?.getStage().findOne(".DrawingLine");
  drawingLine?.destroy();
  points.length = 0;
  polygonCircles.forEach((circle) => circle.destroy());
  polygonCircles.length = 0;
  // 把 Transformer 節點附屬到該 polygon
  selectedShapeId.length = 0;
  selectedShapeId.push(polygonConfigs[polygonConfigs.length - 1].id as string);
  updateGraphic();
}
function updateTransformer() {
  // 這裡我們需要手動把 Transformer 節點附屬或者脫離
  const transformerNode = transformer.value?.getNode() as Konva.Transformer;
  const stageNode = stage.value?.getStage();
  // 更新 activeObjectNode
  activeObjectNode.length = 0;
  selectedShapeId.forEach((id) => {
    const node = stageNode?.findOne(`#${id}`);
    if (node) activeObjectNode.push(node);
  });

  nextTick(selectAndChangeIconColor);
  getConnectArray();

  // 附加到另一個節點
  if (activeObjectNode.length) {
    transformerNode.nodes(activeObjectNode as Konva.Node[]);
  } else transformerNode.nodes([]); // remove Transformer

  // 若為 iconImage 則取消 anchors
  const allImage = activeObjectNode.every(
    (node) => node.getClassName() === "Path"
  );
  if (allImage) {
    transformerNode.setAttrs({
      rotationSnaps: [0, 90, 180, 270],
      enabledAnchors: [],
    });
  } else {
    transformerNode.setAttrs({
      rotationSnaps: [0, 90, 180, 270],
      enabledAnchors: [
        "middle-left",
        "middle-right",
        "top-left",
        "top-center",
        "top-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ],
    });
  }
  transformerNode.show();
}
function updateSelected(nodes: Konva.Node[]) {
  // 更新 activeObjectNode 和 selectedShapeId
  activeObjectNode.length = selectedShapeId.length = 0;
  nodes.forEach((node) => {
    activeObjectNode.push(node);
    selectedShapeId.push(node.attrs.id);
  });
}

// iconImage，選擇後變為藍色，反之變回原色
function selectAndChangeIconColor(defaultColor = "#2970c2") {
  const transformerNode = transformer.value?.getNode() as Konva.Transformer;
  let clickColor = "";
  const originColor = defaultColor;
  const activeIconColor = "#73b5eb";
  iconImageConfigs.forEach((config) => {
    const selectedNode = transformerNode
      .nodes()
      .find((transformNode) => transformNode.attrs.id === config.id);
    if (config.id === selectedNode?.attrs.id) {
      clickColor = activeIconColor;
    } else {
      clickColor = originColor;
    }
    config.fill = clickColor;
  });
}

// Rect 相關邏輯
const rectangleConfigs = reactive<Array<Konva.RectConfig>>([]);
const transformer = ref<vueTransformer>();
const selectedShapeId = reactive<string[]>([]);
function getBasicRect(x: number, y: number) {
  return {
    rotation: 0,
    x,
    y,
    width: 100,
    height: 100,
    scaleX: 1,
    scaleY: 1,
    fill: "#ededed", // 淺灰
    name: "Rect" + (rectangleConfigs.length + 1),
    opacity: 0.5,
    stroke: "#0a0a0a", // 黑
    draggable: true,
    strokeWidth: 5,
    strokeScaleEnabled: false,
    visible: true,
    blockType: "未分類",
    connectArray: [],
    id: uid(),
  };
}

// 文字相關邏輯
const textConfigs = reactive<Array<Konva.TextConfig>>([]);
let isTyping = false;
function getBasicTextConfig(x: number, y: number) {
  return {
    x,
    y,
    text: "請輸入文字",
    fontSize: 20,
    draggable: true,
    name: "Text" + (textConfigs.length + 1),
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    fill: "#0a0a0a", // 黑
    connectArray: [],
    id: uid(),
  };
}
// 點擊文字物件兩下進入編輯模式
function handleDoubleClick(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
  isTyping = true;
  const textNode = e.target as Konva.Text;
  const transformerNode = transformer.value?.getNode() as Konva.Transformer;
  const stageNode = stage.value?.getNode() as Konva.Stage;
  // 隱藏 Text Node 和 Transformer
  textNode.hide();
  transformerNode.hide();
  // 使用絕對位置在畫布上創建文本區域
  const textPosition = textNode.absolutePosition();
  const areaPosition = {
    x: stageNode.container().getBoundingClientRect().x + textPosition.x,
    y: stageNode.container().getBoundingClientRect().y + textPosition.y,
  };

  // 創建文本區域並設置樣式
  const textarea = document.createElement("textarea");
  document.body.appendChild(textarea);

  textarea.value = textNode.text();
  textarea.style.position = "absolute";
  textarea.style.top = areaPosition.y - 1 + "px"; // 不知道為什麼需要扣掉 1 位置會比較準
  textarea.style.left = areaPosition.x + "px";
  textarea.style.width = textNode.width() - textNode.padding() * 2 + "px";
  textarea.style.height = textNode.height() - textNode.padding() * 2 + 5 + "px";
  textarea.style.fontSize = textNode.fontSize() + "px";
  textarea.style.border = "none";
  textarea.style.padding = "0px";
  textarea.style.margin = "0px";
  textarea.style.overflow = "hidden";
  textarea.style.background = "none";
  textarea.style.outline = "none";
  textarea.style.resize = "none";
  textarea.style.lineHeight = textNode.lineHeight().toString();
  textarea.style.fontFamily = textNode.fontFamily().toString();
  textarea.style.transformOrigin = "left top";
  textarea.style.textAlign = textNode.align();
  textarea.style.color = textNode.fill();
  const rotation = textNode.rotation();
  let transform = "";
  if (rotation) {
    transform += "rotateZ(" + rotation + "deg)";
  }

  let px = 0;
  // 修正 firefox 上稍微偏移的文本區域
  const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
  if (isFirefox) {
    px += 2 + Math.round(textNode.fontSize() / 20);
  }
  transform += "translateY(-" + px + "px)";

  textarea.style.transform = transform;

  // 重置高度
  textarea.style.height = "auto";
  // 瀏覽器調整大小後，我們可以設置實際值
  textarea.style.height = textarea.scrollHeight + 3 + "px";
  textarea.focus();

  // 紀錄初始狀態
  const initialText = textarea.value;

  function removeTextarea() {
    isTyping = false;
    textarea.removeEventListener("keydown", textareaKeyDownHandler);
    textarea.parentNode?.removeChild(textarea);
    window.removeEventListener("click", handleOutsideClick);
    textNode.show();
    transformerNode.show();
    transformerNode.forceUpdate();
    // 比對前後文字內容有無改變，有的話才把新狀態裝進undo
    if (initialText !== textarea.value) addDataToUndo();
  }

  function setTextareaWidth(newWidth: number) {
    // some extra fixes on different browsers
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
    if (isSafari || isFirefox) newWidth = Math.ceil(newWidth);

    const isEdge = /Edge/.test(navigator.userAgent);
    if (isEdge) newWidth += 1;

    textarea.style.width = newWidth + "px";
  }
  function textareaKeyDownHandler(e: KeyboardEvent) {
    // 設定文字區域寬高樣式
    // setTextareaWidth(textNode.width() * textNode.getAbsoluteScale().x);
    setTextareaWidth((textNode.text().length + 1) * textNode.fontSize());
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + textNode.fontSize() + "px";

    // 按下 enter 後隱藏
    // 但不隱藏 shift + enter
    if (e.keyCode === 13 && !e.shiftKey) {
      textNode.text(textarea.value);
      removeTextarea();
    }
    // 在按下 esc 上不要將值設置回 Text Node
    if (e.keyCode === 27) {
      removeTextarea();
    }
  }
  textarea.addEventListener("keydown", textareaKeyDownHandler);

  function handleOutsideClick(e: MouseEvent) {
    if (e.target !== textarea) {
      textNode.text(textarea.value);
      removeTextarea();
    }
  }
  setTimeout(() => {
    window.addEventListener("click", handleOutsideClick);
  });
}
// 這裡泛型是什麼不確定 也可能是 UIEvent 或是 MouseEvent
function handleTransform(e: Konva.KonvaEventObject<TransitionEvent>) {
  const node = e.target as Konva.Text;
  const minWidth = 20;

  node.setAttrs({
    width: Math.max(node.width() * node.scaleX(), minWidth),
    scaleX: node.scaleY(),
    fontSize: Math.floor(node.fontSize() * node.scaleY()),
  });
}
function handleLineTransform(e: Konva.KonvaEventObject<TransitionEvent>) {
  const poly = e.target as Konva.Line;
  const points = poly.points();
  const scaleX = poly.scaleX();
  const scaleY = poly.scaleY();
  const offsetX = poly.offsetX();
  const offsetY = poly.offsetY();

  // 更新角点位置
  polygonAnchorPoints.forEach((circle, index) => {
    const startIndex = index * 2;
    if (startIndex < points.length) {
      // 考虑缩放和偏移
      const newX = points[startIndex] * scaleX + poly.x() - offsetX;
      const newY = points[startIndex + 1] * scaleY + poly.y() - offsetY;
      circle.position({ x: newX, y: newY });
    }
  });

  graphicLayer.value.getStage().draw();
}

// Polygon 相關邏輯
const graphicLayer = ref();
const polygonCircles = reactive<Konva.Circle[]>([]);
const polygonConfigs = reactive<Array<Konva.LineConfig>>([]);
const points = reactive<number[]>([]);
const lastCircle = computed(() => polygonCircles[polygonCircles.length - 1]);

const polygonAnchorPoints = reactive<Konva.Circle[]>([]);
const currentPolyId = ref<string>();

function drawCircle(x: number, y: number) {
  const nowScale = stage.value?.getStage().scaleX() as number;
  const circle = new Konva.Circle({
    name: "Circle" + (polygonCircles.length + 1),
    x,
    y,
    radius: 5 / nowScale / graphicLayer.value.getStage().scaleX(),
    fill: "red",
    stroke: "black",
    draggable: false,
    strokeWidth: 0.5,
    strokeScaleEnabled: false,
  });

  graphicLayer.value.getStage().add(circle);
  polygonCircles.push(circle);
  points.push(...[circle.x(), circle.y()]);

  const stageNode = stage.value?.getNode() as Konva.Stage;
  circle.on("mouseover", () => {
    stageNode.container().style.cursor = "pointer";
  });
  circle.on("mousedown", () => {
    stageNode.container().style.cursor = "default";
  });
}
function drawLine(points: number[]) {
  const line = new Konva.Line({
    name: "DrawingLine",
    points,
    stroke: "#aaa",
    fill: "#d1edec55",
    strokeWidth: 1,
    draggable: false,
    closed: true,
    strokeScaleEnabled: false,
    opacity: 1,
  });
  graphicLayer.value.getStage().add(line);
}
function clearAnchorPointsAndResetPolyId() {
  polygonAnchorPoints.forEach((circle) => circle.destroy());
  polygonAnchorPoints.length = 0;
  currentPolyId.value = undefined;
}

function hoverCursorPointer() {
  const stageNode = stage.value?.getNode() as Konva.Stage;
  const graphicLayerNode = graphicLayer.value?.getNode() as Konva.Stage;
  graphicLayerNode.getChildren().forEach((item) => {
    item.on("mouseenter", () => {
      stageNode.container().style.cursor = "pointer";
    });
    item.on("mouseleave", () => {
      stageNode.container().style.cursor = "default";
    });
  });
}

function resetCanvas() {
  clearCanvas();
  if (bgImageConfig.value.image) delete bgImageConfig.value.image; // 刪除舊圖片
}
// 點位欄位顯示
const modelMultiple = computed(() =>
  graphicObj.value.deviceData.addressData?.map(
    (item: { addressStr: string }) => item.addressStr
  )
);
</script>

<style lang="scss" scoped>
.svgIcon {
  &:hover {
    background-color: #e0e0e0;
  }
  &:active {
    background-color: transparent;
  }
}
.toolBtn {
  font-size: 12px;
  margin: 0 5px;
  transition: 0.3s ease;
  &.active {
    box-shadow: 0 0 0 1px #999;
    background-color: #ddd;
    transform: scale(1.1);
  }
}
</style>
