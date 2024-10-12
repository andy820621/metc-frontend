<template>
  <q-btn :icon="`svguse:/svgIcons/${props.svgName}.svg#${props.svgName}`">
    <slot />
  </q-btn>
</template>

<script setup lang="ts">
const props = defineProps<{ svgName: string }>();
</script>
