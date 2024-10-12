<template>
  <div id="meet" ref="meet"></div>
</template>

<script setup lang="ts">
declare const JitsiMeetExternalAPI: any;

const meet = ref(null);

onMounted(() => {
  const domain = "meet.jit.si";
  const options = {
    roomName: "YourRoomName",
    width: "100%",
    height: "100%",
    parentNode: meet.value,
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
    },
    onload: onIFrameLoad,
  };
  const api = new JitsiMeetExternalAPI(domain, options);
});

function onIFrameLoad() {
  console.log("onIFrameLoad");
}
</script>

<style>
html,
body,
#q-app {
  height: 100%;
  margin: 0;
  padding: 0;
}

#meet {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}
</style>
