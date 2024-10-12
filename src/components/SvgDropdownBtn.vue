<template>
  <q-btn-dropdown
    :icon="`svguse:/svgIcons/${props.svgName}.svg#${props.svgName}`"
  >
    <slot />
  </q-btn-dropdown>
</template>

<script setup lang="ts">
const props = defineProps<{ svgName: string }>();
</script>
