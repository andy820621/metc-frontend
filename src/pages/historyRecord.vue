<template>
  <q-page
    class="q-pa-md row grid"
    :style="$q.screen.xs || $q.screen.sm ? 'grid-template-rows: 60px 1fr' : ''"
  >
    <h2>歷史記錄</h2>
  </q-page>
</template>

<script setup lang="ts">
const $q = useQuasar();
</script>
