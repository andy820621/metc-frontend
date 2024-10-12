<template>
  <q-dialog :maximized="isFullscreen" @hide="isFullscreen = false">
    <q-card
      :style="
        isFullscreen
          ? 'width:100%'
          : $q.platform.is.mobile
          ? 'width:100%'
          : 'width: max(60%, 1000px)'
      "
      class="q-pa-md"
    >
      <q-toolbar>
        <q-toolbar-title class="text-h6 text-bold"> 檔案預覽 </q-toolbar-title>

        <q-space />

        <q-btn
          flat
          class="q-px-sm q-mr-sm"
          :icon="isFullscreen ? 'fullscreen_exit' : 'fullscreen'"
          @click="isFullscreen = !isFullscreen"
        />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <q-card-section align="center" class="q-pb-none q-px-none">
        <template v-if="imageUrl !== ''">
          <q-img :src="imageUrl" />
        </template>
        <template v-else-if="iframeUrl !== ''">
          <iframe
            :src="iframeUrl"
            frameborder="0"
            style="width: 100%"
            :style="{ height: isFullscreen ? '88vh' : '80vh' }"
          ></iframe>
          <q-btn
            class="download-btn"
            flat
            icon="cloud_download"
            type="a"
            download
            color="primary"
            v-if="downloadUrl"
            :href="downloadUrl"
          />
        </template>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
const $q = inject("$q") as typeof QVueGlobals;

withDefaults(
  defineProps<{
    imageUrl?: string;
    iframeUrl?: string;
    downloadUrl?: string;
  }>(),
  {}
);

const isFullscreen = ref(false);
</script>

<style scoped lang="scss">
.q-dialog__inner--minimized > div {
  max-width: 85vw;
  max-height: calc(100vh - 32px);
}
.shorten-pdf {
  height: calc(100% - 30px);
}

// .fullscreen-btn {
//   position: absolute;
//   right: 0;
//   bottom: 0;
//   backdrop-filter: blur(8px);
// }
.download-btn {
  position: absolute;
  right: 0;
  top: 0;
  backdrop-filter: blur(8px);
}
</style>
