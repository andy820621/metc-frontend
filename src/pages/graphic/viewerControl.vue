<template>
  <q-page
    class="q-px-md q-pt-md"
    ref="viewerPageRef"
    :class="$q.screen.xs || $q.screen.sm ? 'flex column' : ''"
  >
    <div v-if="$q.screen.xs || $q.screen.sm" class="text-h5 text-bold q-mb-md">
      圖控顯示
    </div>
    <!-- 圖控查看的控制列 -->
    <div
      class="flex justify-end"
      :class="{ 'q-mt-md': $q.screen.xs || $q.screen.sm }"
      :style="{ order: $q.screen.xs || $q.screen.sm ? 1 : 0 }"
    >
      <q-btn-group
        push
        :flat="!$q.screen.xs && !$q.screen.sm"
        class="controlLis q-mb-sm"
      >
        <q-btn
          v-if="
            !fireGuide?.guideDialogVisible && fireGuide?.guideContent?.title
          "
          :color="
            fireGuide?.guideContent?.ePage === 'noneFire' ||
            fireGuide?.guideContent?.ePage === 'lift'
              ? 'positive'
              : 'negative'
          "
          @click="fireGuide.guideDialogVisible = true"
          >{{ fireGuide?.guideContent?.title }}</q-btn
        >
        <q-btn
          v-for="item in controlListIcon"
          :flat="!$q.screen.xs && !$q.screen.sm"
          :key="item.icon"
          :icon="item.icon"
          color="white"
          text-color="dark"
          style="font-size: 12px"
          :style="{
            'border-right':
              $q.screen.xs || $q.screen.sm
                ? 'solid 1px rgb(204, 204, 204)'
                : '',
          }"
          @click="handleClickControlBtn(item)"
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
      </q-btn-group>
    </div>
    <div
      class="flex flex-nowrap"
      ref="viewerPageRef"
      :class="{ column: $q.screen.xs || $q.screen.sm }"
    >
      <div
        v-if="$q.screen.xs || $q.screen.sm"
        class="flex items-center q-mb-md overflow-hidden rounded-lg"
      >
        <div
          class="flex-grow-1 bg-primary text-white q-pa-sm text-center text-bold fz-16"
        >
          起火樓層平面圖
        </div>
        <AllFloors
          dense
          filled
          @handleSelect="handleSelect"
          :initialStyle="false"
          class="flex-grow-1"
        />
      </div>

      <div class="floorBlock" v-else>
        <FloorsForViewer
          @handleSelect="handleSelect"
          :canvasContainerHeight="canvasContainerHeight"
        />
      </div>
      <div class="canvasBlock flex column">
        <!-- 圖控 -->
        <!-- Canvas 容器 -->
        <div
          class="bg-white overflow-hidden rounded-sm"
          :style="[
            {
              width:
                $q.screen.xs || $q.screen.sm
                  ? `${$q.screen.width - 32}px`
                  : `${canvasWidth}px`,
            },
            {
              height:
                $q.screen.xs || $q.screen.sm
                  ? '100%'
                  : 'height: calc(100vh - 173px)',
            },
          ]"
          style="outline: 1px solid #ccc"
        >
          <CanvasStage ref="canvasStage" />
        </div>

        <!-- 下方控制列 -->
        <div
          class="row items-center fz-16"
          :style="{ order: $q.screen.xs || $q.screen.sm ? -1 : 0 }"
        >
          <div class="flex items-center col-xs-12 col-md-9">
            <span class="fz-20 text-bold q-mr-md">顯示設備</span>
            <div :class="{ 'q-gutter-sm': !$q.screen.xs && !$q.screen.sm }">
              <q-radio
                v-for="item in deviceFilterOptions"
                :key="item.value"
                v-model="deviceFilter"
                checked-icon="task_alt"
                unchecked-icon="panorama_fish_eye"
                :val="item.value"
                :label="item.label"
                color="primary"
              />
            </div>
          </div>
          <div class="col-xs-12 col-md-3" v-if="!$q.screen.xs && !$q.screen.sm">
            <span>綜合操作裝置電源</span>
            <q-toggle
              v-model="deviceOperatingPower"
              color="primary"
              val="xl"
              disable
            />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
// components
import CanvasStage from './components/CanvasStage.vue';

// icon
import {
  matRoom,
  matZoomIn,
  matZoomOut,
  // matAnimation,
  // matClose,
  // matArrowRight,
  // matSquare,
} from '@quasar/extras/material-icons';
// utils
import { useResizeObserver } from '@vueuse/core';

const $q = inject('$q') as typeof QVueGlobals;
const deviceOperatingPower = ref(true);
const fireGuide = ref();
// 選擇設備
const deviceFilter = ref(0);
provide('deviceFilter', deviceFilter);
const deviceFilterOptions = reactive([
  {
    label: '全選',
    value: 0,
  },
  {
    label: '消防設備及防火避難設施',
    value: 1,
  },
  {
    label: '一般設備',
    value: 2,
  },
]);
// 圖控查看的控制列
enum controlListIconLabels {
  restorePosition = '復原位置',
  zoomIn = '放大',
  zoomOut = '縮小',
  // animate = "動畫",
  // animateClose = "關閉動畫",
  // deviceStatusTrigger = "其他設備為觸發狀態",
  // openGuide = "開啟導引",
}
const controlListIcon = [
  {
    label: controlListIconLabels.restorePosition,
    icon: matRoom,
  },
  {
    label: controlListIconLabels.zoomIn,
    icon: matZoomIn,
  },
  {
    label: controlListIconLabels.zoomOut,
    icon: matZoomOut,
  },
  // {
  //   label: controlListIconLabels.deviceStatusTrigger,
  //   icon: matArrowRight,
  // },
  // {
  //   label: controlListIconLabels.animate,
  //   icon: matAnimation,
  // },
  // {
  //   label: controlListIconLabels.animateClose,
  //   icon: matClose,
  // },
  // {
  //   label: controlListIconLabels.openGuide,
  //   icon: matSquare,
  // },
];

// Konva
const viewerPageRef = ref();
const canvasWidth = ref(0);
useResizeObserver(viewerPageRef, (entries) => {
  const entry = entries[0];
  const { width } = entry.contentRect;
  canvasWidth.value = width - 420;
  console.log('now canvasWidth.value', canvasWidth.value, width);
});

const canvasStage = ref();
const canvasContainerHeight = computed(() =>
  canvasStage.value ? canvasStage.value.canvasContainer.clientHeight : 0
);

// 點擊控制列
function handleClickControlBtn(target: { label: string; icon: string }) {
  if (target.label === controlListIconLabels.restorePosition) {
    canvasStage.value.resetCanvas();
  } else if (target.label === controlListIconLabels.zoomIn) {
    canvasStage.value.zoomCanvas(1);
  } else if (target.label === controlListIconLabels.zoomOut) {
    canvasStage.value.zoomCanvas(-1);
  }
  // else if (target.label === controlListIconLabels.animate) {
  //   canvasStage.value.animate();
  // } else if (target.label === controlListIconLabels.animateClose) {
  //   canvasStage.value.closeAnimate();
  //   canvasStage.value.resetCanvas();
  // }
  // else if (target.label === controlListIconLabels.deviceStatusTrigger) {
  //   // 設備狀態為1時變色
  //   canvasStage.value.deviceStatusTrigger();
  // }
  // else if (target.label === controlListIconLabels.openGuide) {
  //   guideDialogVisible.value = true;
  // }
}

async function handleSelect(floorData: { id: number }, imageUrl?: string) {
  // 如果有 floorsForViewer 裡面有拿到 floorImage 且 emit handleSelect 的話 => 載入 Canvas 資料，並設定舞台尺寸
  canvasStage.value.clearCanvas();
  if (!imageUrl) return;
  nextTick(async () => {
    canvasStage.value.loadBackgroundImage(imageUrl);
    const jsonData = await canvasStage.value.getFloorGraphicJson(floorData.id);
    canvasStage.value.setStageSize(); // 先設定 Stage Size
    if (jsonData) canvasStage.value.loadShapeFromJson(jsonData); // 載入JsonData
    setTimeout(canvasStage.value.canvasObserver.stop, 1000); // 再次調整 Stage Size
    deviceFilter.value = 0;
    canvasStage.value.resetCanvas();
  });
}
</script>

<style scoped lang="scss">
.floorBlock {
  min-width: 420px;
}
.canvasBlock {
  flex: 1;
}
</style>
