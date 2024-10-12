<template>
  <div>
    <div class="flowNode selectable fit">
      <div class="labelColor" :style="{ 'background-color': 'red' }"></div>
      <div class="flex justify-between items-center" style="padding: 2px 10px">
        <q-icon :name="props.icon" class="q-mr-sm" />
        <slot />
      </div>
    </div>
    <Handle id="b" type="source" :position="Position.Bottom" />
  </div>
</template>
<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
const props = defineProps<{ icon: string }>();
</script>

<style lang="scss">
.flowNode {
  border: 1px solid #d3d3d3;
  border-radius: 3px;
  color: #333;
  font-size: 12px;
  display: flex;
  align-items: center;
  max-width: 250px;
  overflow: hidden;
}
.labelColor {
  height: 22px;
  min-width: 3px;
  border-radius: 2px 0 0 2px;
}
</style>
