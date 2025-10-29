<template>
  <q-page
    class="q-pa-md flex"
    :class="{ 'flex-col': $q.screen.xs || $q.screen.sm }"
  >
    <h2>設備狀況</h2>
  </q-page>
</template>

<script setup lang="ts">
const $q = useQuasar();
</script>
