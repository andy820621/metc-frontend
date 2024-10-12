<template>
  <VueJitsiMeet
    ref="jitsiRef"
    domain="meet.jit.si"
    :options="jitsiOptions"
  ></VueJitsiMeet>
</template>

<script setup lang="ts">
// https://github.com/jitsi/lib-jitsi-meet
// https://github.com/jitsi/jitsi-meet-vue-sdk //  之後可以考慮直接用他

import VueJitsiMeet from "./jitsiMeeting.vue";

const roomName = ref("Mercuryfire Room");
roomName.value = "Mercuryfire" + new Date().getTime().toString();

const meetUrl = computed(() => {
  return "https://meet.jit.si/" + roomName.value;
});
const jitsiOptions = {
  roomName: roomName.value,
  noSSL: false,
  userInfo: {
    email: "user@email.com",
    displayName: "",
  },
  configOverwrite: {
    enableNoisyMicDetection: false,
    // disableDeepLinking: true, // 關閉跳轉到app
  },
  interfaceConfigOverwrite: {
    SHOW_JITSI_WATERMARK: false,
    SHOW_WATERMARK_FOR_GUESTS: false,
    SHOW_CHROME_EXTENSION_BANNER: false,
    // LANG_DETECTION: false,
  },
  onload: onIFrameLoad,
  lang: "zhTW",
};

onMounted(() => {
  console.log("now url", meetUrl.value);
});

// Methods
function onIFrameLoad() {
  // do stuff
}
</script>
