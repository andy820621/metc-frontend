<template>
  <div class="marquee-container" v-if="marqueeData?.length">
    <div
      class="marquee-wrapper"
      :style="{ transform: `rotateX(${180 * flipCount}deg)` }"
      v-if="marqueeData?.length > 1"
      @transitionend="handleTransitionEnd"
    >
      <q-item
        v-if="bindToBack"
        class="back"
        @click="openDialog(bindToBack)"
        clickable
      >
        <q-icon :name="mdiBullhorn" class="text-h6 q-mr-sm text-dark" />
        <div class="text-wrapper">{{ bindToBack.marquee }}</div>
      </q-item>
      <q-item
        v-if="bindToFront"
        class="front"
        @click="openDialog(bindToFront)"
        clickable
      >
        <q-icon :name="mdiBullhorn" class="text-h6 q-mr-sm text-dark" />
        <div class="text-wrapper">{{ bindToFront.marquee }}</div>
      </q-item>
    </div>
    <div class="marquee-wrapper" v-else>
      <q-item class="front" @click="openDialog(marqueeData[0])" clickable>
        <q-icon :name="mdiBullhorn" class="text-h6 q-mr-sm text-dark" />
        <div class="text-wrapper">{{ marqueeData[0].marquee }}</div>
      </q-item>
    </div>
  </div>

  <DialogDataRowPreview
    v-if="dialogData"
    v-model:visible="visible"
    :dataLabel="dialogData.title"
    :dialog-config="announcementConfig"
    :dialog-data="dialogData"
    :isArray="true"
  >
    <template #btn>
      <q-btn
        outline
        class="q-mr-md"
        color="primary"
        @click="marqueeOrderChange('pre')"
        >上一則</q-btn
      >
      <q-btn outline color="primary" @click="marqueeOrderChange('next')"
        >下一則</q-btn
      >
    </template>
  </DialogDataRowPreview>
</template>

<script setup lang="ts">
import Board, { BoardViewModel, announcementConfig } from "src/api/board";

const flipCount = ref(0);

let lastTime = 0;
const triggerTime = 5000;
const isAnimating = ref(false);
// icon
import { mdiBullhorn } from "@quasar/extras/mdi-v6";
// const remainingTime = ref(triggerTime / 1000); // 初始化剩餘時間 (測試用)

function animate(currentTime: number) {
  let deltaTime = currentTime - lastTime;
  if (deltaTime >= triggerTime) {
    isAnimating.value = true;
    flipCount.value++;
    lastTime = currentTime;
    deltaTime = 0; // 重置計時器
  }
  // remainingTime.value = +((triggerTime - deltaTime) / 1000).toFixed(1); // 更新剩餘時間
  requestAnimationFrame(animate);
}

function handleTransitionEnd(e: TransitionEvent) {
  isAnimating.value = false;
}

onMounted(async () => {
  animate(0);

  // 更新跑馬燈資料
  const result = await Board.apiGetMarquee();
  if (result.data) {
    console.log("now 跑馬燈資料", result);
    marqueeData.value = result.data;
  }
});

const marqueeData = ref<BoardViewModel[]>([]);
function marqueeOrderChange(status: string) {
  if (status === "next") {
    dialogData.value = frontData.value;
  } else if (status === "pre") {
    dialogData.value = backData.value;
  }
}
const marqueeDataLength = computed(() => marqueeData.value.length);
const frontData = computed(
  () => marqueeData.value[flipCount.value % marqueeDataLength.value]
);

const backData = computed(() => {
  let index = (flipCount.value + 1) % marqueeDataLength.value;
  if (isAnimating.value) {
    // 這裡將索引向後移動2個位置，並使用模數運算確保索引在有效範圍內
    index = (index - 2 + marqueeDataLength.value) % marqueeDataLength.value;
  }
  return marqueeData.value[index];
});

const bindToFront = computed(() =>
  flipCount.value % 2 === 0 ? frontData.value : backData.value
);
const bindToBack = computed(() =>
  flipCount.value % 2 === 0 ? backData.value : frontData.value
);

// Dialog
const visible = ref(false);
const dialogData = ref<BoardViewModel>();

function openDialog(data: BoardViewModel) {
  visible.value = true;
  dialogData.value = data;
}
</script>

<style scoped>
.marquee-container {
  display: grid;
  perspective: 800px;
  width: 300px;
  height: 50px;
}
.marquee-wrapper {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.81s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.front,
.back {
  width: 100%;
  height: 100%;
  position: absolute;
  color: black;
  display: flex;
  align-items: center;
  background-color: rgb(255, 253, 238);
}
.text-wrapper {
  /* 文字溢出省略 */
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.back {
  transform: rotateZ(-180deg) rotateY(180deg);
}
.front {
  backface-visibility: hidden;
}
</style>
