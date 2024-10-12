<template>
  <div class="tile">
    <audio autoPlay playsInline :srcObject="audioSource">
      <track kind="captions" />
    </audio>

    <template v-if="participant.tracks.video.state">
      <video autoPlay muted playsInline :srcObject="videoSource"></video>
      <p class="participant-name">{{ username }}</p>
    </template>

    <template v-else>
      <NoVideoTile :username="username"></NoVideoTile>
    </template>

    <template v-if="participant.local">
      <CallControls
        :handle-video-click="handleVideoClick"
        :handle-audio-click="handleAudioClick"
        :handle-screenshare-click="handleScreenshareClick"
        :participant="participant"
        :leave-call="leaveCall"
        :disable-screen-share="disableScreenShare"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import CallControls from "./CallControls.vue";
import NoVideoTile from "./NoVideoTile.vue";
import type { DailyParticipant } from "@daily-co/daily-js";

const props = defineProps<{
  participant: DailyParticipant;
  handleVideoClick: () => void;
  handleAudioClick: () => void;
  handleScreenshareClick: () => void;
  leaveCall: () => void;
  disableScreenShare?: boolean;
}>();

const videoSource = ref<MediaStream | null>(null);
const audioSource = ref<MediaStream | null>(null);
const username = ref("Guest");

const handleVideo = (participant: DailyParticipant) => {
  // If the participant has their video off,
  // early out.
  console.log("nowww handleVideo", participant);
  if (participant?.tracks.video.state === "off") return;

  const track = participant.tracks.video.persistentTrack;
  if (track) {
    const newStream = updateSource(videoSource.value, track);
    if (newStream) {
      videoSource.value = newStream;
    }
  }
};

const handleAudio = (participant: DailyParticipant) => {
  // If the participant is local or has their audio off,
  // early out.
  console.log("nowww hadleAudio", participant);
  if (
    !participant ||
    participant.local ||
    participant.tracks.audio.state === "off"
  ) {
    return;
  }

  const track = participant.tracks.audio.persistentTrack;
  if (track) {
    const newStream = updateSource(audioSource.value, track);
    if (newStream) {
      audioSource.value = newStream;
    }
  }
};

const updateSource = (
  stream: MediaStream | null,
  newTrack: MediaStreamTrack
) => {
  const existingTracks = stream?.getTracks();
  if (!existingTracks || existingTracks.length === 0) {
    return new MediaStream([newTrack]);
  }
  if (existingTracks.length > 1) {
    console.warn(
      `expected 1 track, found ${existingTracks.length}. Only using the first one.`
    );
  }
  const existingTrack = existingTracks[0];
  if (newTrack.id !== existingTrack.id) {
    stream?.removeTrack(existingTrack);
    stream?.addTrack(newTrack);
  }
  return null;
};

onMounted(() => {
  username.value = props.participant?.user_name;
  handleVideo(props.participant);
  handleAudio(props.participant);
});

// onUpdated(() => {
//   username.value = props.participant?.user_name;
//   handleVideo(props.participant);
//   handleAudio(props.participant);
// });
watch(
  props.participant,
  (newParticipant) => {
    if (newParticipant) {
      username.value = newParticipant.user_name;
      handleVideo(newParticipant);
      handleAudio(newParticipant);
    }
  },
  { deep: true }
);
</script>

<style scoped>
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
.participant-name {
  position: absolute;
  color: #fff;
  top: 12px;
  right: 12px;
  margin: 0;
}

@media screen and (max-width: 700px) {
  .tile {
    max-width: 100%;
    margin: 10px 20px;
  }
}
</style>
