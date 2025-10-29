<template>
  <q-dialog no-esc-dismiss no-backdrop-dismiss seamless>
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:90%' : 'min-width: 700px'"
      :class="`border-${bgType}`"
      class="rounded-xl"
    >
      <q-toolbar :class="`bg-${bgType}`" class="text-white">
        <q-icon
          :name="fasTriangleExclamation"
          style="color: #ffe65c"
          class="text-h5"
        />
        <q-toolbar-title class="fz-18 text-bold"> 警報 </q-toolbar-title>
      </q-toolbar>

      <q-card-section class="fz-18 text-bold text-center">
        <slot />
        <q-btn
          outline
          @click="handleClick"
          :color="bgType"
          class="text-bold q-mt-sm"
        >
          收到
        </q-btn>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { fasTriangleExclamation } from '@quasar/extras/fontawesome-v6';
const $q = useQuasar();

const props = withDefaults(
  defineProps<{
    bgType: string;
  }>(),
  {
    bgType: 'process',
    messageBtnText: '關閉',
  },
);

const emit = defineEmits(['handleAlertMessageBox']);

function handleClick() {
  emit('handleAlertMessageBox');
}
</script>

<style scoped lang="scss">
.border-process {
  border: solid 2px #c61e1e;
}

.border-warning {
  border: solid 2px var(--q-warning);
}
</style>
