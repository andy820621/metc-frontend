<template>
  <q-icon
    :name="`svguse:/svgIcons/${props.svgName}.svg#${props.svgName}`"
    :style="{ fontSize: props.fontSize }"
    :class="props.color"
  >
    <slot />
  </q-icon>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    svgName: string;
    fontSize: string;
    color: string;
  }>(),
  {
    color: "svgIcon",
  }
);
</script>

<style lang="scss" scoped>
.svgIcon {
  color: #00a0e9;
}
</style>
