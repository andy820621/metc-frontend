<template>
  <div>
    <div class="flowNode selectable fit">
      <div class="labelColor" :style="{ 'background-color': 'black' }"></div>
      <div class="flex justify-between items-center" style="padding: 2px 10px">
        <q-icon :name="props.icon" class="q-mr-sm" />
        <slot />
      </div>
    </div>
    <Handle id="a" type="target" :position="Position.Top" />
  </div>
</template>
<script setup lang="ts">
import { Handle, Position } from "@vue-flow/core";
const props = defineProps<{ icon: string }>();
</script>
