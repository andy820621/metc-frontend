<template>
  <home-screen v-if="appState === 'idle'" :join-call="joinCall" />
  <call-tile
    v-else-if="appState === 'incall'"
    :leave-call="leaveCall"
    :name="name"
    :room-url="roomUrl"
  />
</template>

<script setup lang="ts">
// https://dashboard.daily.co/
// https://prebuilt-ui.netlify.app/
// https://github.com/daily-demos

import CallTile from "./components//CallTile.vue";
import HomeScreen from "./components//HomeScreen.vue";

// Reactive state
const appState = ref("idle");
const name = ref("Guest");
const roomUrl = ref("https://barz.daily.co/barz");

// Methods
const joinCall = (nameValue: string, url: string) => {
  name.value = nameValue;
  roomUrl.value = url;
  appState.value = "incall";
};

const leaveCall = () => {
  appState.value = "idle";
};
</script>

<style>
html,
body,
#q-app {
  height: 100%;
  margin: 0;
  padding: 0;
}
#q-app {
  text-align: center;
  color: #2c3e50;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background-color: #121a24;
  letter-spacing: 2.4px;
}
a {
  text-decoration: none;
  color: #2c3e50;
  display: flex;
  align-items: center;
}
body {
  margin: 0;
}
</style>
