<template>
  <div ref="jitsiContainer" style="height: 100%; width: 100%"></div>
</template>

<script setup lang="ts">
import type {
  JitsiMeetExternalApi,
  JitsiMeetExternalApiOptions,
  IJitsiMeetExternalApi,
  executeCommandArgs,
} from "./type";

declare const JitsiMeetExternalAPI: JitsiMeetExternalApi;

const props = withDefaults(
  defineProps<{ domain: string; options: JitsiMeetExternalApiOptions }>(),
  {
    domain: "meet.jit.si",
    options: () => ({}),
  }
);

const jitsiContainer = ref<HTMLElement>();
const jitsiApi = ref<IJitsiMeetExternalApi>();

onMounted(() => {
  loadScript(`https://${props.domain}/external_api.js`, () => {
    if (!JitsiMeetExternalAPI) {
      throw new Error("Jitsi Meet External API not loaded");
    }
    embedJitsiWidget();
  });
});

onBeforeUnmount(() => {
  removeJitsiWidget();
});

function loadScript(src: string, cb: () => void) {
  const scriptEl = document.createElement("script");
  scriptEl.src = src;
  scriptEl.async = true;
  const head = document.querySelector("head");
  console.log("now head", head);
  if (head) head.appendChild(scriptEl);
  scriptEl.addEventListener("load", cb);
}

function embedJitsiWidget() {
  const opts = {
    ...props.options,
    parentNode: jitsiContainer.value,
  };
  jitsiApi.value = new JitsiMeetExternalAPI(props.domain, opts);
}

 
function executeCommand(command: string, ...value: executeCommandArgs) {
  if (jitsiApi.value) jitsiApi.value.executeCommand(command, ...value);
}

 
function addEventListener(event: string, fn: () => void) {
  if (jitsiApi.value) jitsiApi.value.on(event, fn);
}

function removeJitsiWidget() {
  if (jitsiApi.value) jitsiApi.value.dispose();
}
</script>

<style>
html,
body,
#q-app {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
}
</style>
