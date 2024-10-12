<template>
  <q-page class="q-pa-md flex">
    <q-layout class="flex-grow-1" style="min-height: 0px">
      <div class="row q-col-gutter-x-md full-height">
        <div
          :class="
            $q.screen.xs || $q.screen.sm ? 'col-12 q-mb-md' : 'col-custom-left'
          "
        >
          <q-scroll-area
            class="bg-white fit q-pa-md"
            :visible="true"
            style="box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1)"
          >
            <q-select
              :model-value="wfFilter"
              use-input
              hide-selected
              fill-input
              input-debounce="500"
              :options="wfFilterOptions"
              @filter="filterFn"
              @input-value="setModel"
              class="q-mb-md"
              placeholder="請輸入樓層或班別名稱"
            >
              <template v-if="wfFilter" v-slot:append>
                <q-icon
                  name="cancel"
                  @click.stop="wfFilter = ''"
                  class="cursor-pointer"
                />
              </template>

              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    沒有該樓層或班別名稱
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
            <!-- 流程圖 -->
            <div class="side q-mt-lg full-width">
              <div class="text-h6 text-bold q-mb-md">流程圖</div>
              <q-tree
                ref="wfTree"
                style="font-size: 18px"
                :nodes="wfNodes"
                selected-color="primary text-bold bg-grey-2"
                v-model:selected="selectedWfNodesId"
                node-key="id"
                @update:selected="wfNodesSelectAction()"
                accordion
                no-selection-unset
              >
                <!-- 消防編組的slot -->
                <template v-slot:header-marshalling="prop">
                  <div class="with-btn">
                    <div class="text-weight-bold text-primary">
                      {{ prop.node.label }}
                    </div>
                    <div class="btn-container">
                      <q-btn
                        size="xs"
                        color="primary"
                        dense
                        :icon="mdiPlus"
                        @click.stop="
                          handleAddProcess(
                            {
                              id: prop.key,
                              label: prop.node.label,
                            },
                            actionNames.addProcess
                          )
                        "
                      >
                        <q-tooltip
                          class="text-body2"
                          transition-show="scale"
                          transition-hide="scale"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[10, 10]"
                        >
                          新增
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>

                <!-- 消防編組下的 流程圖的 slot -->
                <template v-slot:header-process="prop">
                  <div class="with-btn" @click="handleClickProcess(prop)">
                    <div class="text-weight-bold text-primary">
                      {{ prop.node.label }}
                    </div>
                    <div class="btn-container">
                      <q-btn
                        size="xs"
                        color="primary"
                        dense
                        :icon="mdiPencil"
                        @click.stop="
                          handleEditProcess(
                            {
                              id: prop.key,
                              label: prop.node.label,
                              version: prop.node.version,
                            },
                            actionNames.editProcess as keyof flowProcessTableConfigsType
                          )
                        "
                      >
                        <q-tooltip
                          class="text-body2"
                          transition-show="scale"
                          transition-hide="scale"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[10, 10]"
                        >
                          編輯
                        </q-tooltip>
                      </q-btn>
                      <q-btn
                        size="xs"
                        color="primary"
                        dense
                        :icon="mdiDelete"
                        @click.stop="
                          handleDeleteProcess({
                            id: prop.key,
                            label: prop.node.label,
                          })
                        "
                      >
                        <q-tooltip
                          class="text-body2"
                          transition-show="scale"
                          transition-hide="scale"
                          anchor="top middle"
                          self="bottom middle"
                          :offset="[10, 10]"
                        >
                          刪除
                        </q-tooltip>
                      </q-btn>
                    </div>
                  </div>
                </template>
              </q-tree>
            </div>
            <!-- 節點資料 -->
            <div class="side q-mt-lg full-width">
              <div class="text-h6 text-bold q-mb-md">節點資料</div>
              <q-form class="row q-mb-lg" @submit.prevent="onSearch">
                <q-input
                  class="col-xs-12 col-sm-12 col-md-11"
                  dense
                  debounce="2000"
                  v-model="searchContent"
                  clearable
                  placeholder="請輸入關鍵字"
                  @clear="onSearch"
                >
                  <template v-slot:append>
                    <q-icon
                      name="search"
                      class="cursor-pointer"
                      @click="onSearch"
                    />
                  </template>
                </q-input>
              </q-form>

              <q-tree
                :nodes="formattedNodesData"
                selected-color="primary text-bold bg-grey-2"
                node-key="name"
                no-selection-unset
                ref="flowNodesTree"
              >
                <template v-slot:default-header="prop">
                  <!-- <div class="row items-center"> -->
                  <div class="text-h6 text-weight-bold text-primary">
                    {{ prop.node.label }}
                  </div>
                  <!-- </div> -->
                </template>
                <template v-slot:header-groupItem="prop">
                  <div
                    class="flowNode fit"
                    style="font-size: 20px"
                    :draggable="true"
                    @dragstart="onDragStart(prop.node)"
                  >
                    <div
                      class="labelColor q-mr-md"
                      style="margin-left: 0.24rem"
                      :style="{
                        'background-color':
                          prop.node.isStart === null
                            ? '#0075A9' // blue
                            : prop.node.isStart
                            ? 'red'
                            : 'black',
                      }"
                    ></div>
                    <q-icon :name="prop.node.iconString" class="q-mr-sm" />
                    <div class="flex justify-between items-center">
                      {{ prop.node.name }}
                    </div>
                  </div>
                </template>
              </q-tree>
            </div>
          </q-scroll-area>
        </div>

        <div
          :class="$q.screen.xs || $q.screen.sm ? 'col-12' : 'col-custom-right'"
        >
          <div
            class="fit"
            @drop="onDrop"
            style="box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1)"
          >
            <VueFlow
              class="bg-white"
              v-model="initialNodes"
              :default-zoom="1"
              :min-zoom="0.5"
              :max-zoom="4"
              fit-view-on-init
              @dragover="onDragOver"
            >
              <template #node-startNode="props">
                <StartNode :icon="props.data.icon" v-bind="props">
                  {{ props.label }}</StartNode
                >
              </template>
              <template #node-flowNode="props">
                <FlowNode :icon="props.data.icon" v-bind="props">
                  {{ props.label }}
                </FlowNode>
              </template>
              <template #node-endNode="props">
                <EndNode :icon="props.data.icon" v-bind="props">
                  {{ props.label }}</EndNode
                >
              </template>
              <Background />
              <Controls />
              <Panel :position="PanelPosition.TopLeft" class="controls">
                <q-btn
                  v-for="item in controlListIcon"
                  :key="item.icon"
                  dense
                  push
                  :icon="item.icon"
                  class="q-ml-md bg-white"
                  @click="item.function"
                  :disable="!nowProcess"
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
                <q-btn
                  dense
                  push
                  :icon="mdiTimerPlayOutline"
                  class="q-ml-md bg-white"
                  @click="testStartProgress"
                  :disable="!nowProcess"
                >
                  <q-tooltip
                    class="text-body2"
                    transition-show="scale"
                    transition-hide="scale"
                    anchor="top middle"
                    self="bottom middle"
                    :offset="[10, 10]"
                  >
                    開始跑流程圖
                  </q-tooltip>
                </q-btn>
              </Panel>
            </VueFlow>
          </div>

          <q-drawer
            side="right"
            v-model="openRightDrawer"
            :width="300"
            :breakpoint="500"
            elevated
            class="bg-grey-1"
          >
            <div
              class="q-pa-lg"
              v-if="selectedNode && typeof selectedNode.label === 'string'"
            >
              <q-select
                v-model="selectedNode.stepDefinition"
                :options="nodeTypeOptions"
                :option-label="(props: stepDefinition) => props.nodeType.value"
                label="節點類型"
                class="q-mb-md-md"
                disable
              />
              <q-input
                v-model="selectedNode.label"
                label="名稱"
                class="q-mb-md-md"
                @blur="addDataToHistoryArray"
              />
              <q-select
                v-if="hasRoleInput"
                v-model="selectedNode.roleNameObject"
                :options="roleNameObjectOptions"
                label="身分"
                option-value="id"
                option-label="description"
                class="q-mb-md-md"
                @blur="addDataToHistoryArray"
              />
              <!--  連接其他流程圖  -->
              <q-select
                v-if="
                  selectedNode.stepDefinition?.nodeType.key ===
                  iconLabels.SubWorkflow
                "
                v-model="selectedNode.nextWorkflowDefinitionId"
                :options="workFlowOptions"
                label="所屬流程圖"
                class="q-mb-md-md"
                @blur="addDataToHistoryArray"
              />

              <!-- <q-input
                v-model="selectedNode.message"
                label="訊息 *"
                type="textarea"
                autogrow
                readonly
                :rules="[(val) => !!val || '請輸入訊息']"
              /> -->
              <EditableTextarea
                v-if="hasMessageInput"
                label="訊息 *"
                v-model="selectedNode.message"
                v-model:isFocused="isTextareaFocused"
                :id="selectedNode.id"
                :blurFunc="addDataToHistoryArray"
                :buttons="[
                  {
                    label: '起火位置',
                    trueValue: '@NodeMessageFormat',
                  },
                ]"
              />

              <!-- // TODO: countDown Input -->
              <q-input
                v-if="
                  selectedNode.stepDefinition?.nodeType.key ===
                  iconLabels.CountDown
                "
                v-model="secondsNumber"
                label="時間秒數"
                type="number"
                @blur="addDataToHistoryArray"
              >
                <template #append>
                  <p class="text-subtitle1 q-mt-auto q-mb-xs">秒</p>
                </template>
              </q-input>

              <!-- <div class="balck-btn-container">
                <q-btn
                  v-for="item in blankSpaceBtnList"
                  :key="item.value"
                  :label="item.label"
                  color="primary"
                  @click="addBlankSpaceText(item)"
                />
              </div> -->
            </div>
            <div
              class="q-pa-lg"
              v-else-if="selectedEdge && typeof selectedEdge.label === 'string'"
            >
              <q-input
                v-model="selectedEdge.label"
                label="名稱"
                class="q-mb-md-md"
                @blur="addDataToHistoryArray"
              />
            </div>
          </q-drawer>
        </div>
      </div>
    </q-layout>
  </q-page>

  <DialogForm
    :blockAttrs="blockAttrs"
    :dialogAttrs="dialogAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
  </DialogForm>

  <q-dialog v-model="dialogTestProcessVisible" persistent>
    <q-card
      class="flex column"
      :style="
        $q.screen.xs || $q.screen.sm
          ? 'width:100%; height:100%'
          : 'min-width: 90%; height:80%'
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <q-select
          :model-value="processName"
          use-input
          hide-selected
          fill-input
          input-debounce="300"
          :options="processNameOptions"
          @input-value="(val) => (processName = val)"
          option-value="id"
          option-label="description"
          dense
        >
          <template v-if="processName" v-slot:append>
            <q-icon
              name="cancel"
              @click.stop.prevent="processName = ''"
              class="cursor-pointer"
            />
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey"> 沒有該物件 </q-item-section>
            </q-item>
          </template>
        </q-select>
      </q-card-section>

      <q-card-section class="flex-grow-1"> </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
// Vue、vueUse
import {
  useClipboard,
  onKeyDown,
  onKeyStroke,
  useCloned,
  useEventListener,
} from "@vueuse/core";
// 元件
import StartNode from "./workFlowNodes/StartNode.vue";
import FlowNode from "./workFlowNodes/FlowNode.vue";
import EndNode from "./workFlowNodes/EndNode.vue";
// ICON
import {
  matFireExtinguisher,
  matRedo,
  matUndo,
  matDelete,
  matContentCopy,
  matSave,
  matBorderClear,
  matFollowTheSigns,
  matHealthAndSafety,
  matReport,
} from "@quasar/extras/material-icons";
import {
  mdiMotherNurse,
  mdiPlus,
  mdiPencil,
  mdiDelete,
  mdiTimerPlayOutline,
} from "@quasar/extras/mdi-v6";
// utils
import tableMixin from "src/utils/tableMixin";
// API
import process, { workflowData } from "src/api/process";
import processInstruction from "src/api/processInstruction";
import Role, { roleType } from "src/api/role";
// quasar
import { uid } from "quasar";
import {
  iconObjectOptions,
  NodeGroup,
  iconLabels,
} from "src/pages/emergency/flow/processIconOptions";
// 類型、Config、Options
import type { QTreeNode } from "quasar";
import { wfNode, convertedNode, serverDataType } from "./flowTypes";
import {
  flowProcessTableConfigs,
  actionNames,
  flowProcessTableConfigsType,
} from "src/pages/emergency/flow/flowProcessTableConfigs";

// VueFlow 套件
import {
  VueFlow,
  MarkerType,
  Panel,
  PanelPosition,
  useVueFlow,
  Node,
  GraphEdge,
  GraphNode,
  FlowExportObject,
  NodeDragEvent,
  Elements,
  // Position,
} from "@vue-flow/core";
import { Background } from "@vue-flow/background";
import { Controls } from "@vue-flow/controls";
// pinia store
import { useBuildingStore } from "src/stores/building.js";
import WorkflowType from "src/api/workflowType";
import { tempDataType } from "src/api/api.type";

const buildingStore = useBuildingStore();

async function testStartProgress() {
  $q.dialog({
    title: "提示",
    message: "確定要啟動這張流程圖嗎?",
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(async () => {
    const { id, version } = nowProcess.value.node as {
      id: string;
      version: number;
    };
    const queryObject = {
      id,
      version,
      testable: true,
      // reference: "123",
    };
    const result = (await process.apiStartProcess(
      queryObject
    )) as typeof AxiosResponse;
    if (result.data) {
      const nowProcessId = result.data;
      console.log("now process id", nowProcessId);
    }
  });
}

interface stepDefinition {
  id: number;
  name: string;
  isStart: boolean;
  nodeType: {
    key: number;
    value: string;
  };
  icon: string;
  stepType: string;
  type: string;
  inputs: object;
  outputs: object;
}
onMounted(() => {
  console.log("iconObjectOptions", iconObjectOptions);
});

const $q = inject("$q") as typeof QVueGlobals;

// 左側workflow 流程圖 的node
const wfFilter = ref("");
const stringOptions: string[] = []; // 這裡之後可以寫在系統設定
const wfFilterOptions = ref(stringOptions);

let wfNodesString: wfNode[] = [];
const wfNodes = ref<QTreeNode[]>(wfNodesString);

// 取得樓層和班別名稱的下拉選單
function getFilterOptions() {
  wfNodesString.forEach((classes) => {
    stringOptions.push(classes.label);
    classes.children?.forEach((item) => {
      stringOptions.push(item.label);
    });
  });
}

function filterFn(val: string, update: (func: () => void) => void) {
  update(() => {
    const needle = val.toLocaleLowerCase();
    wfFilterOptions.value = stringOptions.filter(
      (v) => v.toLocaleLowerCase().indexOf(needle) > -1
    );
  });
}

function setModel(val: string) {
  wfFilter.value = val;
  //  filter 方法 (有三層結構但是這裡的filter只搜兩層)
  const { cloned } = useCloned<QTreeNode[]>(wfNodesString);
  const filterResult: QTreeNode[] = [];
  cloned.value.forEach((classes) => {
    const { children } = classes;
    let result;
    if (children) {
      const value = children.find((child) =>
        child.label?.includes(wfFilter.value)
      ) as QTreeNode;
      result = children?.includes(value);
    }

    if (result) {
      filterResult.push(classes);
    }
  });
  filterResult.forEach((classes: QTreeNode) => {
    classes.children = classes.children?.filter((workflow) =>
      workflow.label?.includes(wfFilter.value)
    );
  });

  if (wfFilter.value) {
    wfNodes.value = filterResult;
    wfTree.value.expandAll();
  } else {
    wfNodes.value = wfNodesString;
    wfTree.value.collapseAll();
  }
}

const selectedWfNodesId = ref("");
const wfTree: QTreeNode = ref(null);
function wfNodesSelectAction() {
  wfTree.value?.setExpanded(selectedWfNodesId.value, true);
  // const WfNodeObj = wfTree.value.getNodeByKey(selectedWfNodesId.value);
}
// 右側 節點屬性 drawer
interface myGraphNode extends GraphNode {
  stepDefinition?: stepDefinition;
  message?: string;
  countdown?: string;
  nextWorkflowDefinitionId?: string;
  roleNameObject?: {
    id: string;
    name: string;
    type: number;
    description: string;
    isEmergency: null | boolean;
  };
}
interface myGraphEdge extends GraphNode {
  source?: string;
  target?: string;
  sourceId?: string;
  targetId?: string;
  labelBgStyle?: string;
  labelStyle?: string;
  labelBgPadding?: string;
}
const selectedNode = ref<myGraphNode>();
const selectedEdge = ref<GraphEdge>();
const openRightDrawer = computed(
  () => !!selectedNode.value || !!selectedEdge.value
);
const secondsNumber = ref(0);
watch(secondsNumber, (newValue) => {
  if (newValue !== 0 && selectedNode.value) {
    selectedNode.value.countdown = formatSecondsToTime(newValue);
  }
});
function formatSecondsToTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  const formattedHours = String(hours).padStart(2, "0");
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

// 身分
const roleNameObjectOptions = ref();
// 節點類型
const nodeTypeOptions = ref();
// 流程圖 options
const workFlowOptions = ref([
  {
    label: "1 - 12F 救護班流程圖",
  },
  {
    label: "1 - 12F 救護班定位",
  },
  {
    label: "1 - 12F 救護班撤退",
  },
  {
    label: "1 - 12F 滅火班流程圖",
  },
  {
    label: "1 - 12F 滅火班定位",
  },
  {
    label: "1 - 12F 滅火班撤退",
  },
  {
    label: "1 - 12F 安全防護班流程圖",
  },
  {
    label: "1 - 12F 安全防護班定位",
  },
  {
    label: "1 - 12F 安全防護班撤退",
  },
]);

const isNodeChanging = ref(false);

onMounted(paneClickHandler);

// vue flow
const initialNodes = ref<Elements>();
const {
  removeNodes,
  removeEdges,
  onPaneReady,
  onPaneMouseEnter,
  onPaneMouseLeave,
  onNodeDragStop,
  onEdgeClick,
  onNodeClick,
  onPaneClick,
  onConnect,
  addEdges,
  addNodes,
  setNodes,
  setEdges,
  setTransform,
  toObject,
  findNode,
  project,
  vueFlowRef,
  getSelectedNodes,
  removeSelectedNodes,
} = useVueFlow();
// 線條連線方法
onConnect((params) => {
  const newLines = {
    id: uid(),
    source: params.source,
    target: params.target,
    // animated: true,
    markerEnd: MarkerType.ArrowClosed,
    // type: "smoothstep",
    label: "",
    labelBgStyle: { fill: "white", stroke: "grey" },
    labelStyle: { fill: "grey" },
    labelBgPadding: [5, 3],
  };
  addEdges([newLines]);
  addDataToHistoryArray();
});
// Flow上的事件監聽
onPaneReady((instance) => {
  instance.fitView({ padding: 0.25, includeHiddenNodes: true }); // 設定初始畫面符合容器
  const stop = instance.onViewportChange(() => {
    nowState.value = toObject(); // 設定初始State
  });
  setTimeout(stop.off, 1000);
});
onNodeDragStop((e: NodeDragEvent) => {
  selectedNode.value = e.node;
  if (selectedEdge.value) {
    selectedEdge.value.selected = false;
    selectedEdge.value = undefined;
  }
  if (JSON.stringify(nowState.value) === JSON.stringify(toObject())) return;
  addDataToHistoryArray();
});
onEdgeClick((props) => {
  const edge = props.edge;
  if (edge) {
    selectedEdge.value = edge;
    if (selectedNode.value) {
      selectedNode.value.selected = false;
      selectedNode.value = undefined;
    }
  }
});
onNodeClick((props) => {
  const node = props.node;
  if (node) {
    selectedNode.value = node;
    if (selectedEdge.value) {
      selectedEdge.value.selected = false;
      selectedEdge.value = undefined;
    }
    console.log("now selected node: ", selectedNode.value);
  }
});
onPaneClick(paneClickHandler);
function paneClickHandler() {
  if (selectedNode.value) selectedNode.value.class = "cursor-pointer";
  if (selectedNode.value) {
    selectedNode.value.selected = false;
    selectedNode.value = undefined;
  }
  if (selectedEdge.value) {
    selectedEdge.value.selected = false;
    selectedEdge.value = undefined;
  }
}
const isInVueFlow = ref(false);
onPaneMouseEnter(() => {
  isInVueFlow.value = true;
});
onPaneMouseLeave(() => {
  isInVueFlow.value = false;
});

// 新增節點的拖拉方法
const nodeData = ref<QTreeNode>({
  type: "",
  icon: "",
  name: "",
  nodeType: { key: "", label: "" },
});
function getNodeType(isStart: boolean | null) {
  if (isStart) return "startNode";
  else if (isStart === false) return "endNode";
  return "flowNode";
}
function onDragStart(node: QTreeNode) {
  if (!nowProcess.value) return;
  const typeString = getNodeType(node.isStart);

  node.type = typeString;
  node.icon = iconObjectOptions[node.nodeType.key].iconImg;

  nodeData.value = node;
}
function onDragOver(...args: unknown[]) {
  const event = args[0] as DragEvent;
  event.preventDefault();
}

function onDrop(event: DragEvent) {
  if (!nowProcess.value) {
    $q.notify({
      type: "warning",
      message: "請先選擇流程圖 或 建立一張新的流程圖",
      position: "top",
    });
    return;
  }

  // const type = event.dataTransfer?.getData("application/vueflow");
  const { left, top } = vueFlowRef.value?.getBoundingClientRect() as DOMRect;

  const position = project({
    x: event.clientX - left,
    y: event.clientY - top,
  });

  const newNode = {
    id: uid(),
    type: nodeData.value.type,
    position,
    label: nodeData.value.name,
    data: {
      icon: nodeData.value.icon,
    },
    stepDefinition: nodeData.value,
  };

  addNodes([newNode]);

  // align node position after drop, so it's centered to the mouse
  nextTick(() => {
    const node = findNode(newNode.id);
    const selectedNodes = getSelectedNodes.value;
    if (node) {
      if (inputRef.value && inputRef.value.textContent) {
        inputRef.value.textContent = "";
      }
      removeSelectedNodes(selectedNodes);
      const stop = watch(
        () => node?.dimensions,
        (dimensions) => {
          if (dimensions && dimensions.width > 0 && dimensions.height > 0) {
            node.position = {
              x: node.position.x - node.dimensions.width / 2,
              y: node.position.y - node.dimensions.height / 2,
            };
            stop();
            addDataToHistoryArray();
          }
        },
        { deep: true, flush: "post" }
      );

      selectedNode.value = node;
      selectedNode.value.selected = true;
    }
  });
}

enum controlListIconLabels {
  Undo = "上一步",
  Redo = "下一步",
  Delete = "刪除圖形",
  copy = "複製流程圖",
  saveFile = "儲存",
  clear = "清空畫布",
}
// 控制列
const controlListIcon = [
  {
    label: controlListIconLabels.Undo,
    icon: matUndo,
    function: doUndo,
  },
  {
    label: controlListIconLabels.Redo,
    icon: matRedo,
    function: doRedo,
  },
  {
    label: controlListIconLabels.copy,
    icon: matContentCopy,
    function: doCopy,
  },
  {
    label: controlListIconLabels.saveFile,
    icon: matSave,
    function: doSaveFile,
  },
  {
    label: controlListIconLabels.Delete,
    icon: matDelete,
    function: doDelete,
  },
  {
    label: controlListIconLabels.clear,
    icon: matBorderClear,
    function: doClear,
  },
];
// 上一步 / 下一步
const history = ref<FlowExportObject[]>([]);
const redoHistory = ref<FlowExportObject[]>([]);
const nowState = ref<FlowExportObject>(); // 現在狀態的JSON數據
// undo / redo
function doUndo() {
  if (history.value.length === 0) {
    $q.notify({
      type: "warning",
      message: "目前沒有動作可復原",
      position: "top",
    });
    return;
  }

  saveStateToArray(redoHistory.value);
  const lastFlow = history.value.pop();
  if (lastFlow) {
    setFlowDataToPage(lastFlow);
    nowState.value = lastFlow;

    nextTick(() => {
      if (selectedNode.value) checkIfResetSelectedNode(selectedNode);
      else checkIfResetSelectedNode(selectedEdge);
    });
  }
}
function doRedo() {
  if (redoHistory.value.length === 0) {
    $q.notify({
      type: "warning",
      message: "目前沒有動作可重作",
      position: "top",
    });
    return;
  }

  saveStateToArray(history.value);
  const nextFlow = redoHistory.value.pop();
  if (nextFlow) {
    setFlowDataToPage(nextFlow);
    nowState.value = nextFlow;

    nextTick(() => {
      if (selectedNode.value) checkIfResetSelectedNode(selectedNode);
      else checkIfResetSelectedNode(selectedEdge);
    });
  }
}
function setFlowDataToPage(flow: FlowExportObject) {
  const [x = 0, y = 0] = flow.position;
  setNodes(flow.nodes);
  setEdges(flow.edges);
  setTransform({ x, y, zoom: flow.zoom || 0 });
}
function saveStateToArray(stateArray: object[]) {
  stateArray.push(nowState.value as object);
}
function addDataToHistoryArray() {
  const lastState = history.value[history.value.length - 1];

  if (lastState && JSON.stringify(lastState) === JSON.stringify(toObject())) {
    return;
  }
  nextTick(() => {
    if (history.value.length && history.value.length === 30) {
      history.value.shift(); // 最多只儲存三十筆動作
    }
    saveStateToArray(history.value);
    nowState.value = toObject();
    redoHistory.value.length = 0; // 清空redo
  });
}
function checkIfResetSelectedNode(
  selected: typeof selectedNode | typeof selectedEdge,
  state = toObject()
) {
  const nodeExists = state.nodes.find((node) => node.id === selected.value?.id);
  if (nodeExists) {
    selected.value = nodeExists as typeof selected.value;
  } else {
    selected.value = undefined;
  }
}
// 上排控制列方法
function doCopy() {
  console.log("work");
}
interface withErrors {
  errors: string;
}
async function doSaveFile() {
  const payload = clientToServer();
  if (!payload) return;
  const isUpdated = (await process.apiSaveOrUpdateProcessNodeData(
    payload,
    nowProcess.value.node.isOldProcess
  )) as typeof AxiosResponse;

  if (isUpdated.data) {
    $q.notify({
      type: "positive",
      message: "儲存成功",
      position: "top",
    });
    if (!nowProcess.value.node.isOldProcess) {
      nowProcess.value.node.isOldProcess = true;
    }
    nowProcess.value.node.version += 1;
  } else {
    $q.notify({
      type: "negative",
      message: `儲存失敗 ${(isUpdated as unknown as withErrors).errors}`,
      position: "top",
    });
  }
}
function doDelete() {
  // 沒有選到節點線段時返回
  if (!selectedNode.value && !selectedEdge.value) {
    $q.notify({
      type: "warning",
      message: "請選擇節點或是線段再進行刪除動作",
      position: "top",
    });
    return;
  }
  // 提示是否刪除
  $q.dialog({
    title: "提示",
    message: selectedNode.value
      ? `確定要刪除名稱為【${selectedNode.value?.label}】的節點嗎?`
      : "確定要刪除所點擊的線嗎?",
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(() => {
    // 刪除節點
    if (selectedNode.value) {
      removeNodes([selectedNode.value]);
      selectedNode.value.selected = false;
      selectedNode.value = undefined;
    } else if (selectedEdge.value) {
      removeEdges([selectedEdge.value]);
      selectedEdge.value.selected = false;
      selectedEdge.value = undefined;
    }
    addDataToHistoryArray(); // 把刪除動作記錄到 Undo => 可復原
  });
}
function clearNodes() {
  setNodes([]);
  setEdges([]);
  setTransform({ x: 0, y: 0, zoom: 1 });
  initialNodes.value = [];
  if (selectedNode.value) {
    selectedNode.value.selected = false;
    selectedNode.value = undefined;
  }
  if (selectedEdge.value) {
    selectedEdge.value.selected = false;
    selectedEdge.value = undefined;
  }
}
function doClear() {
  addDataToHistoryArray();
  clearNodes();
}
function clearForChangeProcess() {
  redoHistory.value.length = 0;
  history.value.length = 0;
  clearNodes();
}
// 流程圖資料轉換: client ⇄ server
function clientToServer() {
  const processParentNode = findParentNode();
  console.log("now nowProcess.value", nowProcess.value);
  if (!processParentNode) {
    $q.notify({
      type: "negative",
      message: "找不到父節點, 請刷新重試",
      position: "top",
    });
    return false;
  }
  const nowState = toObject();
  const { cloned } = useCloned(nowState);
  console.log("clientToServer", buildingStore.Bid);
  const params: serverDataType = {
    id: nowProcess.value.key,
    version: nowProcess.value.node.version,
    buildingId: buildingStore.Bid as number,
    groupId: Number(processParentNode.id),
    description: nowProcess.value.node.label,
    type: nowProcess.value.node.type,
  };
  params.nodes = cloned.value.nodes.map((node) =>
    convertNodeForServerStructure(
      node as myGraphNode,
      cloned.value.edges as myGraphEdge[]
    )
  );
  for (const node of params.nodes) {
    if (checkIfWithMessageInput(node.stepDefinition?.nodeType.key)) {
      if (!node.message || node.message === "") {
        $q.notify({
          type: "negative",
          message: "訊息欄位不可為空",
          position: "top",
        });
        return false;
      }
    }
  }
  params.edges = cloned.value.edges.map((edge) =>
    convertEdgeForServerStructure(edge as myGraphEdge)
  );
  params.position = cloned.value.position;
  params.zoom = cloned.value.zoom || 1;
  console.log("params to server", JSON.stringify(params));
  return params;
}
function convertNodeForServerStructure(
  node: myGraphNode,
  edges: myGraphEdge[]
) {
  const convertedData: convertedNode = {
    type: node.type,
    stepDefinition: node.stepDefinition,
    id: node.id,
    position: [node.position.x, node.position.y],
    label: node.label as string,
    message: node.message,
    workflowDefinitionId: nowProcess.value.key,
    version: nowProcess.value.node.version,
    inputs: node.stepDefinition?.inputs ?? {},
    outputs: node.stepDefinition?.outputs ?? {},
    roleName: node.roleNameObject?.name, // 身分欄位資料
  };

  if (nowProcess.value.node.isOldProcess) {
    const tempNewId = uid();
    // 把新的節點 id 更新到 edges
    edges.forEach((edge: myGraphEdge) => {
      if (edge.source === node.id) edge.source = tempNewId;
      if (edge.target === node.id) edge.target = tempNewId;
    });
    convertedData.id = tempNewId; // 更新節點id
  }

  return convertedData;
}
function convertEdgeForServerStructure(edge: myGraphEdge) {
  delete edge.labelBgStyle;
  delete edge.labelStyle;
  delete edge.labelBgPadding;
  edge.sourceId = edge.source;
  edge.targetId = edge.target;
  delete edge.source;
  delete edge.target;
  if (nowProcess.value.node.isOldProcess) edge.id = uid();

  return edge;
}
function serverToClient(serverData: any) {
  serverData.nodes?.forEach((node: any) => {
    node.data = {};
    node.data.icon =
      iconObjectOptions[node.stepDefinition.nodeType.key].iconImg;
    node.position = { x: node.position[0], y: node.position[1] };
    node.workflowDefinitionId = nowProcess.value.key;
    node.version = nowProcess.value.node.version;
    node.type = getNodeType(node.stepDefinition.isStart);
    if (node.roleName) node.roleNameObject = getRoleName(node.roleName);
  });
  serverData.edges.forEach((edge: any) => {
    edge.labelBgStyle = { fill: "white", stroke: "grey" };
    edge.labelStyle = { fill: "grey" };
    edge.labelBgPadding = [5, 3];
    edge.source = edge.sourceId;
    edge.target = edge.targetId;
    delete edge.sourceId;
  });

  if (serverData.zoom === null) serverData.zoom = 1;

  setFlowDataToPage(serverData);
  setTimeout(() => {
    nowState.value = toObject();
    console.log("now nowState", nowState.value);
  }, 1000);
}
function getRoleName(roleName: string) {
  return roleNameObjectOptions.value.find(
    (item: { name: string }) => item.name === roleName
  );
}
// 找到 q-tree 中目前流程圖的父節點
function findParentNode(nowId?: string) {
  const nowProcessNodeParentNode = (
    wfTree.value.getExpandedNodes() as QTreeNode[]
  ).find((node: QTreeNode) => {
    const nowProcessNode = node.children?.find(
      (childrenNode) => childrenNode.id === (nowId ?? selectedWfNodesId.value)
    );
    if (nowProcessNode) return true;
    return false;
  });
  if (nowProcessNodeParentNode) return nowProcessNodeParentNode;
  return false;
}

// 鍵盤事件監聽
const cloneNode = ref<Node>();
const source = ref(""); // 複製的文字內容
const isTextareaFocused = ref(false); // EditableTextarea 用
onKeyDown("Delete", doDelete);
onKeyStroke((e) => {
  if (isTextareaFocused.value) return;
  const { copy } = useClipboard({ source });
  // 從其他瀏覽器複製過的文字內容
  document.addEventListener("paste", (event: ClipboardEvent) => {
    if (isInVueFlow.value) return;
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
  if (e.code === "KeyC" && e.ctrlKey) {
    const selection = window.getSelection()?.toString();
    if (selection) {
      source.value = selection;
      copy(source.value);
    } else {
      source.value = "";
    }
  }
  if (!source.value && isInVueFlow.value) {
    if (e.code === "KeyC" && e.ctrlKey && selectedNode.value) {
      // 複製
      if (!selectedNode.value) return;
      cloneNode.value = undefined;
      const { cloned } = useCloned(selectedNode.value);
      cloned.value.id = uid(); // 更新複製出來的節點 id
      cloned.value.position = {
        x:
          selectedNode.value.position.x +
          selectedNode.value.dimensions.width +
          20,
        y: selectedNode.value.position.y,
      }; // 更新複製出來的節點位置
      cloneNode.value = cloned.value;
    } else if (e.code === "KeyV" && e.ctrlKey && cloneNode.value) {
      // 貼上
      addNodes([cloneNode.value]);
      addDataToHistoryArray();
      const node = findNode(cloneNode.value.id);
      selectedNode.value = node;
      cloneNode.value = undefined;
    } else if (e.code === "KeyZ" && e.ctrlKey && !e.shiftKey) {
      if (openRightDrawer.value) return;
      doUndo(); // 上一步
    } else if (
      e.ctrlKey &&
      (e.code === "KeyY" || (e.code === "KeyZ" && e.shiftKey))
    ) {
      if (openRightDrawer.value) return;
      doRedo(); // 下一步
    }
  }
});

/*
左邊流程圖下拉資料 & 方法
*/
onMounted(async () => {
  await getRoleTreeForProcess();
});
// 獲取消防編組角色清單
interface classData {
  label: string;
  id: string;
  header?: string;
  icon?: string;
  children?: classData[] | { id: string; label: string }[];
}
async function getRoleTreeForProcess() {
  try {
    const result =
      (await process.apiGetFireMarchallingRoleLists()) as typeof AxiosResponse;
    console.log("getRoleTreeForProcess result", result.data);
    if (result.data) {
      const roleLists = formatRoleTreeData(result.data);
      // 把資料帶進wfNode
      wfNodes.value = wfNodesString = roleLists;
      getFilterOptions(); // 生出下拉資料
    } else console.error("apiGetFireMarchallingRoleLists() returned false");
  } catch (error) {
    console.error("getRoleTreeForProcess error:", error);
  }
}
function formatRoleTreeData(
  data: typeof AxiosResponse,
  depth = 0
): classData[] {
  return Object.entries(data).map(([key, value]) => {
    const [id, label] = key.split("_");
    let header = "";
    let children;
    if (depth === 1) {
      header = "marshalling";
      children = Object.entries(value as typeof AxiosResponse).map(
        ([key, label]) => {
          const [id, version] = key.split("_");
          return {
            id,
            label: label as string,
            header: "process",
            // isOldProcess: Number(version) !== 1,
            isOldProcess: true,
            version: Number(version),
          };
        }
      );
    } else {
      children = value ? formatRoleTreeData(value, depth + 1) : [];
    }

    if (depth === 0) {
      const icon = getIconToWfNode(label);
      return {
        id,
        label,
        icon,
        children,
      };
    }
    return {
      id,
      label,
      children,
      header,
    };
  });
}
onMounted(getRoleNameObjectOptions);
async function getRoleNameObjectOptions() {
  const payload = [
    { type: roleType.role, isEmergency: null },
    { type: roleType.class, isEmergency: null },
  ];
  const result = (await Role.apiGetRoles(payload)) as typeof AxiosResponse;
  if (result.data) {
    roleNameObjectOptions.value = result.data;
    console.log("roleNameObjectOptions.value: ", roleNameObjectOptions.value);
  }
}
// 新增 icon 給各班別的方法
// 之後有真實欄位後請後端回傳真實資料就可以把這個方法改成用 enum 去寫
function getIconToWfNode(label: string) {
  switch (label) {
    case "滅火班":
      return matFireExtinguisher;
    case "救護班":
      return matHealthAndSafety;
    case "避難引導班":
      return matFollowTheSigns;
    case "安全防護班":
      return mdiMotherNurse;
    case "通報班":
      return matReport;
  }
}

const { blockAttrs, dialogAttrs, handleDialogMixin, hideDialog } = tableMixin();
const dialogEvent = computed(() => ({ handleDialog, selectListChange }));

// API類別
const API = process;
// 在新增/編輯 dialog 上的操作
async function handleDialog(status: string, data: tempDataType) {
  if (status === actionNames.addProcess) {
    const tempData = { ...data };
    tempData.groupId = +tempData.marshalling.id;
    delete tempData.marshalling;
    const result = await process.apiAddNewProcess(tempData as workflowData);

    if (result.data) {
      const newProcess = {
        id: result.data,
        label: tempData.description,
        header: "process",
        isOldProcess: false,
        version: 1,
      };
      // 把新增的流程圖資訊show在畫面
      const groupId = String(tempData.groupId);
      const addGroup = wfTree.value.getNodeByKey(groupId);
      if (addGroup.children) addGroup.children.push(newProcess);
      else addGroup.children = [newProcess];
      wfTree.value.setExpanded(addGroup.id, true); // 展開流程圖
      selectedWfNodesId.value = newProcess.id;
      const nowProcess = {
        key: newProcess.id,
        node: newProcess,
      };

      await handleClickProcess(nowProcess);

      $q.notify({
        type: "positive",
        message: "新增成功",
        position: "top",
      });
      hideDialog();
    } else {
      $q.notify({
        type: "negative",
        message: "新增失敗",
        position: "top",
      });
    }
    return;
  } else if (status === actionNames.editProcess) {
    const result = await process.apiChangeProcessName(data as workflowData);

    if (result.data) {
      // 把更改後的流程圖名稱更新在畫面
      const process = wfTree.value.getNodeByKey(data.id);
      process.label = data.description;

      $q.notify({
        type: "positive",
        message: "更新成功",
        position: "top",
      });
      hideDialog();
    } else {
      $q.notify({
        type: "negative",
        message: "更新失敗",
        position: "top",
      });
    }
    return;
  }

  await handleDialogMixin(status, API);
}

function initDialog() {
  dialogAttrs.value.dialogTitle = "流程圖";
  dialogAttrs.value.status = "add";
}
onMounted(() => {
  initDialog();
});

// 左邊流程圖下拉按鈕方法
async function selectListChange(props: string, tempData?: tempDataType) {
  console.log("selectListChange", props);
  if (props === "type") {
    const result = await WorkflowType.apiGetAllFlowTypes();
    dialogAttrs.value.selectOption = result.data;
  }
}
function resetDialog(actionNames: keyof flowProcessTableConfigsType) {
  blockAttrs.value.tableConfig = flowProcessTableConfigs[actionNames];
  dialogAttrs.value.visible = true;
  dialogAttrs.value.status = actionNames;
  dialogAttrs.value.tempData = {};
}
function handleAddProcess(
  marshallingProps: { id: string; label: string },
  actionNames: keyof flowProcessTableConfigsType
) {
  resetDialog(actionNames);
  dialogAttrs.value.tempData.marshalling = marshallingProps;
}
async function handleEditProcess(
  processProps: { id: string; label: string; version: number },
  actionNames: keyof flowProcessTableConfigsType
) {
  const { id, version, label } = processProps;
  const result = await process.apiGetProcessNodeData(id, version);
  console.log("now handleEditProcess result", result);
  if (result.data) {
    resetDialog(actionNames);
    dialogAttrs.value.tempData.description = label;
    dialogAttrs.value.tempData.id = id;
    dialogAttrs.value.tempData.version = version;
    dialogAttrs.value.tempData.type = result.data.type;
  }
}
const nowProcess = ref();
async function handleClickProcess(
  prop: { key: string; node: object },
  force = false
) {
  if (!force && nowProcess.value && nowProcess.value.key === prop.key) return;
  // 清除畫布
  clearForChangeProcess();

  nowProcess.value = prop;
  nowState.value = toObject();
  saveStateToArray(history.value);
  const result = (await process.apiGetProcessNodeData(
    nowProcess.value.key,
    nowProcess.value.node.version
  )) as typeof AxiosResponse;
  if (result.data) {
    const { nodes, edges, type } = result.data;
    const hasNodesData = !(nodes.length === 0 && edges.length === 0);
    nowProcess.value.node.isOldProcess = hasNodesData;
    nowProcess.value.node.type = type;
    if (hasNodesData) {
      serverToClient(result.data);
    } else {
      nowState.value = toObject();
    }
  }
}
async function handleDeleteProcess(processProps: {
  id: string;
  label: string;
}) {
  // 提示是否刪除
  $q.dialog({
    title: "提示",
    message: `確定要刪除名稱為【${processProps.label}】的流程圖嗎?`,
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(async () => {
    const result = (await process.apiDeleteProcess(
      processProps.id
    )) as typeof AxiosResponse;
    if (result.data) {
      $q.notify({
        type: "positive",
        message: "刪除成功",
        position: "top",
      });
      // 清除畫布
      clearForChangeProcess();
      // 從 tree 刪除該流程圖
      const processParentNode = findParentNode(processProps.id); // 選擇樹狀結構的第二層(群組樓層的編組)
      if (processParentNode && processParentNode.children) {
        processParentNode.children = processParentNode.children.filter(
          (process: QTreeNode) => process.id !== processProps.id
        );
      }
    } else if (result.data === false) {
      $q.notify({
        type: "negative",
        message: "流程圖正在執行中，目前無法刪除",
        position: "top",
      });
    } else if (result.data === null) {
      $q.notify({
        type: "negative",
        message: "找不到流程圖id，刪除失敗",
        position: "top",
      });
    }
  });
}

// 取得節點資料
onMounted(getNodesData);
interface NodeData {
  icon: string;
  name: string;
  id: number;
  isStart?: boolean;
  nodeType: { key: number; value: string };
  stepType: string;
}
const nodesData = ref<NodeData[]>([]);
async function getNodesData(
  pagination = { filters: "", page: 1, rowsPerPage: 0 }
) {
  const result = (await processInstruction.apiGetData(
    pagination
  )) as typeof AxiosResponse;
  if (result.data) {
    nodesData.value = nodeTypeOptions.value = result.data.rows;
    console.log("now nodesData.value", nodesData.value);
    // nodeTypeOptions.value = result.data.rows;
  }
}
const formattedNodesData = computed(() => {
  return nodesData.value.reduce((a, b) => {
    const newNode = JSON.parse(JSON.stringify(b));
    const nodeTypeNumber = b.nodeType.key;
    const { group, iconImg } = iconObjectOptions[nodeTypeNumber];
    const groupChName = NodeGroup[group];
    newNode.iconString = iconImg;
    newNode.header = "groupItem";
    let groupData = a.find((item) => item.label === groupChName);
    if (!groupData) {
      groupData = { name: group, label: groupChName, children: [] };
      a.push(groupData);
    }
    groupData.children.push(newNode);
    return a;
  }, [] as { name?: string; label: string; children: NodeData[] }[]);
});
watch(
  formattedNodesData,
  (val) => {
    console.log("now formattedNodesData", formattedNodesData.value);
  },
  { deep: true }
);

// 搜尋節點
const searchContent = ref("");
const flowNodesTree = ref();
function onSearch() {
  if (!searchContent.value) {
    nodesData.value = nodeTypeOptions.value;
    flowNodesTree.value.collapseAll();
  } else {
    nodesData.value = nodeTypeOptions.value.filter((item: { name: string }) =>
      item.name.includes(searchContent.value)
    );
    flowNodesTree.value.expandAll();
  }
}
// 流程圖右側欄位顯示檢查
// 檢查身分 input 欄位
const hasRoleInput = computed(() => {
  return (
    selectedNode.value?.stepDefinition?.nodeType.key === iconLabels.Wait || // 等待
    selectedNode.value?.stepDefinition?.nodeType.key === iconLabels.Broadcast || // 全部通知
    selectedNode.value?.stepDefinition?.nodeType.key ===
      iconLabels.MessageSend || // 簡訊推播
    selectedNode.value?.stepDefinition?.nodeType.key === iconLabels.LinePush || // Line推播
    selectedNode.value?.stepDefinition?.nodeType.key ===
      iconLabels.NotificationSend || // 手機、電腦推播
    selectedNode.value?.stepDefinition?.nodeType.key === iconLabels.Begin // 統計開始
  );
});
// 檢查是否要加訊息 input 欄位
const hasMessageInput = computed(() => {
  return checkIfWithMessageInput(
    selectedNode.value?.stepDefinition?.nodeType.key
  );
});
function checkIfWithMessageInput(key: number | null | undefined) {
  if (!key) return false;
  return (
    key === iconLabels.Broadcast || // 全部通知
    key === iconLabels.MessageSend || // 簡訊推播
    key === iconLabels.LinePush || // Line推播
    key === iconLabels.NotificationSend || // 手機、電腦推播
    key === iconLabels.Voice || // 聲音推播
    key === iconLabels.Begin // 統計開始
  );
}

// 模擬試驗
const dialogTestProcessVisible = ref(false);
const processName = ref();
const processNameOptions = ref([]);

// 大樓名稱空位符
const inputRef = ref();
watch(
  selectedNode,
  (val, oldValue) => {
    // 檢查節點間的切換
    const nodeTypeKey = oldValue?.stepDefinition?.nodeType.key;
    let isHaveInput = false;
    if (nodeTypeKey) isHaveInput = checkIfWithMessageInput(nodeTypeKey);
    else {
      if (
        val &&
        oldValue &&
        val.id !== oldValue.id &&
        !isNodeChanging.value &&
        isHaveInput &&
        !oldValue.message
      ) {
        val.selected = false;
        returnToOldNode(oldValue);
      }
      // 檢查離開節點
      if (!val && oldValue && isHaveInput && !oldValue.message) {
        if (selectedEdge.value) {
          selectedEdge.value.selected = false;
          selectedEdge.value = undefined;
        }

        returnToOldNode(oldValue);
      }
    }
  },
  { deep: true }
);
function returnToOldNode(oldNode: myGraphNode) {
  console.log("oldNode", oldNode);

  isNodeChanging.value = true;
  oldNode.selected = true;
  setTimeout(() => {
    selectedNode.value = oldNode;
    $q.notify({
      type: "warning",
      message: "請輸入必填欄位",
      position: "top",
    });
    nextTick(() => {
      isNodeChanging.value = false;
    });
  }, 100);
}

useEventListener(inputRef, "paste", (e: ClipboardEvent) => {
  e.preventDefault();
  const text = e.clipboardData?.getData("text/plain"); // 獲取貼上的純文字內容
  document.execCommand("insertText", false, text); // 將純文字內容插入到編輯器中
});
function handleInput(e: Event) {
  const input = e.target as HTMLInputElement;
  console.log("now handleInput textContent", input.textContent);
  console.log("now handleInput innerHTML", input.innerHTML);
  if (input.textContent !== null && selectedNode.value) {
    const formatedText = formatAsMessage(input.textContent);
    selectedNode.value.message = formatedText;
    console.log("now selectedNode.value.message", selectedNode.value?.message);
  }
}
function formatAsMessage(text: string) {
  let clonedText = useCloned(text).cloned.value;
  // clonedText = clonedText.replaceAll("大樓名稱", "{buildingName}");
  // clonedText = clonedText.replaceAll("地址名稱", "{addressName}");
  clonedText = clonedText.replaceAll("起火位置", "@NodeMessageFormat");
  return clonedText || "";
}
const blankSpaceBtnList = [
  // { value: "buildingName", label: "大樓名稱" },
  // { value: "addressName", label: "地址名稱" },
  { value: "@NodeMessageFormat", label: "起火位置" },
];
function addBlankSpaceText(btn: { value: string; label: string }) {
  if (inputRef.value) {
    // 獲取光標位置
    if (typeof window.getSelection !== "undefined") {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
        const range = sel.getRangeAt(0); // 選中的範圍，表示用戶目前所選取的文字位置。
        // 把文字更新至當前光標
        const newText = `<span contentEditable="false">${btn.label}</span>`;
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = newText;
        const frag = document.createDocumentFragment();
        let node, // 用於迭代
          lastNode; // 用於保存
        while ((node = tempDiv.firstChild)) {
          lastNode = frag.appendChild(node);
        }
        range.insertNode(frag);

        if (lastNode) {
          const clonedRange = range.cloneRange();
          clonedRange.setStartAfter(lastNode);
          clonedRange.collapse(true); // 設定光標不選取任何文字，只純顯示在一個位置上。
          sel.removeAllRanges(); // 將原先的選取範圍移除 => 設定新的選取範圍。
          sel.addRange(clonedRange); // 將 clonedRange 設定為選取範圍 => 光標會定位在我們剛插入的節點之後。
        }

        const nowText = inputRef.value.textContent;
        if (nowText && selectedNode.value) {
          selectedNode.value.message = formatAsMessage(nowText);
        }
        tempDiv.remove();
      }
    }
  }
}
</script>

<style lang="scss">
/* these are necessary styles for vue flow */
@import "@vue-flow/core/dist/style.css";

/* this contains the default theme, these are optional styles */
@import "@vue-flow/core/dist/theme-default.css";
@import "@vue-flow/controls/dist/style.css";
.flowNode {
  outline: 1px solid #d3d3d3;
  border: none;
  &:hover {
    background: #f5f5f5;
    outline: 1px solid #aaa;
  }
}
.vue-flow__node {
  background: #fff;
  &.selected {
    background: #f5f5f5;
    .flowNode {
      outline: 1px solid #aaa;
    }
  }
}
// .textareaContainer {
//   position: relative;
//   textarea {
//     color: white;
//     opacity: 0;
//     visibility: hidden;
//   }
//   .contenteditableDIV {
//     outline: 0px solid transparent;
//     position: absolute;
//     inset: 25px 0 0;
//     pointer-events: initial;
//     line-height: 19px;
//     font-size: 16px;
//     font-weight: 400;
//     letter-spacing: 0.00937em;
//     span {
//       border-width: 1px;
//       border-style: dashed;
//       border-color: #ffac55;
//       padding: 0 2px;
//       margin: 0 5px;
//     }
//   }
// }
</style>
<style lang="scss" scoped>
main {
  --left-width: 20; // 流程圖下拉 & 節點資料 的容器寬度趴數值
  .col-custom-left {
    height: auto;
    width: calc(var(--left-width) * 1%);
  }
  .col-custom-right {
    height: auto;
    width: calc(calc(100 - var(--left-width)) * 1%);
  }
}
.with-btn {
  position: relative;
  width: 100%;
  .btn-container {
    padding-left: 1rem;
    right: 0;
    top: -1px;
    position: absolute;
    background-image: linear-gradient(
      to right,
      transparent,
      #fff 2rem,
      #fff 75%
    );
    .q-btn {
      width: 24px;
      height: 24px;
      margin-left: 6px;
      padding: 0;
    }
  }
}

.balck-btn-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  padding: 0.8rem;
  margin-top: 1rem;
}
</style>
