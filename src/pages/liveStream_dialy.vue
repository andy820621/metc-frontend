<template>
  <div ref="videoContainer" class="video-container">
    <button @click="startCall">開始通話</button>
    <button v-if="inCall" @click="leaveCall">離開通話</button>
    <!-- 其他控制按鈕如需要可以在此添加 -->
  </div>
</template>

<script setup lang="ts">
declare const DailyIframe: any;

const videoContainer = ref(null);
const inCall = ref(false);
let callObject: any;

const startCall = async () => {
  callObject = DailyIframe.createFrame(videoContainer.value, {
    url: 'https://barz.daily.co/barz',
    showLeaveButton: true,
    // 其他 Daily.co 設置選項
  });
  await callObject.join({ userName: 'Quasar User' });
  inCall.value = true;
};

const leaveCall = () => {
  if (callObject) callObject.leave();
  inCall.value = false;
};

onMounted(() => {
  // 初始化視頻通話或執行其他準備工作
});

onUnmounted(leaveCall);
</script>

<style scoped>
html,
body,
#q-app {
  height: 100%;
  margin: 0;
  padding: 0;
}
.video-container {
  width: 100%;
  height: 100%;
  min-height: 500px;
}
</style>
