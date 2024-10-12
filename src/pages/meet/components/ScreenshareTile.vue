<template>
  <div class="screen-share-tile">
    <video autoPlay muted playsInline :srcObject="videoSource"></video>
  </div>
</template>

<script setup lang="ts">
import type { DailyParticipant } from "@daily-co/daily-js";

const props = defineProps<{
  participant: DailyParticipant;
}>();

const videoSource = ref<MediaStream | null>(null);

onMounted(() => {
  handleVideo(props.participant);
});

const handleVideo = (participant: DailyParticipant) => {
  if (!participant?.tracks.screenVideo.state) return;
  const videoTrack = participant?.tracks.screenVideo.persistentTrack;

  if (videoTrack) {
    const source = new MediaStream([videoTrack]);
    videoSource.value = source;
  }
};
</script>

<style scoped>
.screen-share-tile {
  margin: 10px 20px;
  position: relative;
  max-width: 670px;
}
.tile {
  max-width: 50%;
  flex: 1 1 350px;
  margin: 10px 20px;
  position: relative;
}
video {
  width: 100%;
  border-radius: 16px;
}
</style>
