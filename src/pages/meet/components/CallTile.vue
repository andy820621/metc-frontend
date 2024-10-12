<template>
  <main>
    <!-- loading is true when the call is in the "joining-meeting" meeting state -->
    <template v-if="loading">
      <div class="loading-spinner">
        <q-spinner v-if="loading" color="white" size="3em" />
      </div>
    </template>

    <template v-else>
      <div class="wrapper">
        <template v-if="error">
          <p class="q-ma-lg text-h4 error-text">{{ error }}</p>
          <!-- refreshing will leave the call and reset the app state -->
          <q-btn
            :icon="matRefresh"
            class="error-button"
            @click="leaveAndCleanUp"
            >重新整理</q-btn
          >
        </template>

        <template v-if="showPermissionsError">
          <permissions-error-msg :reset="leaveAndCleanUp" />
        </template>

        <template v-else>
          <div
            :class="screen ? 'tile-container' : 'tile-container full-height'"
          >
            <template v-if="screen">
              <screenshare-tile :participant="screen" />
            </template>

            <div v-if="participants" class="participants-container">
              <template v-for="p in participants" :key="p.session_id">
                <video-tile
                  :participant="p"
                  :handle-video-click="handleVideoClick"
                  :handle-audio-click="handleAudioClick"
                  :handle-screenshare-click="handleScreenshareClick"
                  :leave-call="leaveAndCleanUp"
                  :disable-screen-share="((screen && !screen?.local) as boolean)"
                />
              </template>

              <template v-if="count === 1">
                <waiting-card :url="roomUrl" />
              </template>
            </div>
          </div>
        </template>

        <chat-tile :send-message="sendMessage" :messages="messages" />
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import daily from "@daily-co/daily-js";
import type {
  DailyCall,
  DailyParticipant,
  DailyEventObjectParticipants,
  DailyEventObjectParticipant,
  DailyEventObjectParticipantLeft,
  DailyEventObjectAppMessage,
  DailyEventObjectFatalError,
} from "@daily-co/daily-js";

import WaitingCard from "./WaitingCard.vue";
import ChatTile from "./ChatTile.vue";
import VideoTile from "./VideoTile.vue";
import ScreenshareTile from "./ScreenshareTile.vue";
import PermissionsErrorMsg from "./PermissionsErrorMsg.vue";

import { matRefresh } from "@quasar/extras/material-icons";

// 使用 props 定義組件的屬性
// const props = defineProps(["leaveCall", "name", "roomUrl"]);
const props = defineProps<{
  name: string;
  roomUrl: string;
  leaveCall: () => void;
}>();

// 定義響應式變量
const callObject = ref<DailyCall>() as Ref<DailyCall>; // 如果 daily-js 提供了類型，可以替換 any
const participants: Ref<DailyParticipant[]> = ref([]);
const count = ref<number>(0);
const messages = ref<{ name: string; message: string }[]>([]); // 如果消息有特定的結構，可以替換 any
const error = ref<string>("");
const loading = ref(false);
const showPermissionsError = ref(false);
const screen = ref<DailyParticipant | null>();

// 定義組件的生命週期方法
onMounted(() => {
  const option = {
    url: props.roomUrl,
  };

  // 創建 Daily 調用對象的實例
  const co = daily.createCallObject(option);
  callObject.value = co;

  // 加入通話並設定名字
  co.join({ userName: props.name });

  // 添加調用和參與者事件處理程序
  co.on("joining-meeting", handleJoiningMeeting)
    .on(
      "joined-meeting",
      updateParticpants<DailyEventObjectParticipants | undefined>
    )
    .on(
      "participant-joined",
      updateParticpants<DailyEventObjectParticipant | undefined>
    )
    .on(
      "participant-updated",
      updateParticpants<DailyEventObjectParticipant | undefined>
    )
    .on(
      "participant-left",
      updateParticpants<DailyEventObjectParticipantLeft | undefined>
    )
    .on("error", handleError)
    .on("camera-error", handleDeviceError)
    .on("app-message", updateMessages);
});

onUnmounted(() => {
  if (!callObject.value) return;
  callObject.value
    .off("joining-meeting", handleJoiningMeeting)
    .off("joined-meeting", updateParticpants)
    .off("participant-joined", updateParticpants)
    .off("participant-updated", updateParticpants)
    .off("participant-left", updateParticpants)
    .off("error", handleError)
    .off("camera-error", handleDeviceError)
    .off("app-message", updateMessages);
});

// 定義方法
function updateParticpants<T>(e: T) {
  console.log("[EVENT] ", e);
  if (!callObject.value) return;

  const p = callObject.value.participants();
  count.value = Object.values(p).length;
  participants.value = Object.values(p);

  const screenParticipant = participants.value.filter(
    (p: DailyParticipant) => p.tracks.screenVideo.persistentTrack
  );
  if (screenParticipant?.length && !screen.value) {
    console.log("[SCREEN]", screenParticipant);
    screen.value = screenParticipant[0];
  } else if (!screenParticipant?.length && screen.value) {
    screen.value = null;
  }
  loading.value = false;
}
const updateMessages = (e: DailyEventObjectAppMessage | undefined) => {
  console.log("[MESSAGE] ", e?.data);
  messages.value.push(e?.data);
};

const handleError = (e: DailyEventObjectFatalError | undefined) => {
  console.log("[ERROR] ", e);
  if (e) error.value = e?.errorMsg;
  loading.value = false;
};

const handleJoiningMeeting = () => {
  loading.value = true;
};

const handleAudioClick = () => {
  const audioOn = callObject.value.localAudio();
  callObject.value.setLocalAudio(!audioOn);
};

const handleVideoClick = () => {
  const videoOn = callObject.value.localVideo();
  callObject.value.setLocalVideo(!videoOn);
};

const handleDeviceError = () => {
  showPermissionsError.value = true;
};

const handleScreenshareClick = () => {
  if (screen.value?.local) {
    callObject.value.stopScreenShare();
    screen.value = null;
  } else {
    callObject.value.startScreenShare();
  }
};

const sendMessage = (text: string) => {
  // Attach the local participant's username to the message to be displayed in ChatTile.vue
  const local = callObject.value.participants().local;
  const message = { message: text, name: local?.user_name || "Guest" };
  messages.value.push(message);
  callObject.value.sendAppMessage(message, "*");
};

const leaveAndCleanUp = () => {
  if (screen.value?.local) {
    callObject.value.stopScreenShare();
  }
  callObject.value.leave().then(() => {
    callObject.value.destroy();

    screen.value = null;
    props.leaveCall();
  });
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Ropa+Sans&display=swap");
main {
  font-family: "Ropa Sans", sans-serif;
  background-color: #121a24;
  height: 100%;
  position: relative;
}
.wrapper {
  max-width: 1200px;
  margin: auto;
  padding: 0 16px;
  height: 100%;
}
.loading-spinner {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.tile-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.participants-container {
  display: flex;
  margin: 0 -20px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  width: 100%;
  background-color: #121a24;
  height: inherit;
}
p {
  color: white;
}
.error-text {
  color: #e71115;
}
.full-height {
  height: 100%;
}
.error-button {
  color: #fff;
  background-color: #121a24;
  border: none;
  font-size: 12px;
  border: 1px solid #2b3f56;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}
</style>
