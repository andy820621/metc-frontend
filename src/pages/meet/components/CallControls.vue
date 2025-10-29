<template>
  <div class="controls">
    <div class="devices">
      <q-btn
        :icon="participant.tracks.audio.state ? matMic : matMicOff"
        @click="handleAudioClick"
      />

      <q-btn
        :icon="
          participant.tracks.video.state ? evaVideoOutline : evaVideoOffOutline
        "
        @click="handleVideoClick"
      />

      <template v-if="supportsScreenshare">
        <q-btn
          :disable="disableScreenShare"
          :icon="symRoundedScreenShare"
          @click="handleScreenshareClick"
        />
      </template>
    </div>

    <q-btn class="leave" :icon="matTimeToLeave" @click="leaveCall" />
  </div>
</template>
<script setup lang="ts">
import daily from '@daily-co/daily-js';
import type { DailyParticipant } from '@daily-co/daily-js';

import {
  matTimeToLeave,
  matMicOff,
  matMic,
} from '@quasar/extras/material-icons';
import { symRoundedScreenShare } from '@quasar/extras/material-symbols-rounded';
import { evaVideoOutline, evaVideoOffOutline } from '@quasar/extras/eva-icons';

defineProps<{
  participant: DailyParticipant;
  handleVideoClick: () => void;
  handleAudioClick: () => void;
  handleScreenshareClick: () => void;
  leaveCall: () => void;
  disableScreenShare?: boolean;
}>();

const supportsScreenshare = ref(false);

// 在組件掛載時檢查屏幕共享支持
onMounted(() => {
  supportsScreenshare.value = daily.supportedBrowser().supportsScreenShare;
});
</script>

<style scoped>
.q-btn {
  color: white;
}
.controls {
  position: absolute;
  bottom: 12px;
  left: 8px;
  justify-content: space-between;
  display: flex;
  width: calc(100% - 16px);
}

.devices {
  border-radius: 12px;
  background-color: #121a24;
  opacity: 0.85;
  padding: 14px 10px 15px;
}
button {
  background-color: transparent;
  border: none;
  cursor: pointer;
}
button:not(.leave) {
  margin: 0 4px;
  width: 36px;
  height: 26px;
}
button.leave {
  background-color: #f63135;
  opacity: 0.85;
  padding: 14px 16px 15px;
  border-radius: 12px;
}
button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
.icon {
  height: 24px;
}
</style>
