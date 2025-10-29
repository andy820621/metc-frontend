<template>
  <q-list>
    <q-item
      v-for="item in options"
      :key="item.id"
      clickable
      v-close-popup="!item.children || item.children.length === 0"
      @click="select(item, deep)"
      :active="modelLabel && modelLabel.indexOf(item) !== -1"
    >
      <q-item-section>
        {{ item.label }}
      </q-item-section>
      <q-item-section side v-if="item.children && item.children.length">
        <q-icon name="keyboard_arrow_right" />
      </q-item-section>
      <q-menu
        anchor="top end"
        self="top start"
        v-if="item.children && item.children.length"
      >
        <CascaderItem
          :options="item.children"
          @handleSelect="select"
          :deep="deep + 1"
          :modelLabel="modelLabel"
        />
      </q-menu>
    </q-item>
  </q-list>
</template>

<script setup name="CascaderItem" lang="ts">
export interface CascaderOption {
  id: string | number;
  label: string;
  value?: any;
  children?: CascaderOption[];
  [key: string]: any;
}

interface Props {
  options?: CascaderOption[];
  deep?: number;
  modelLabel?: CascaderOption[];
}

const emit = defineEmits<{
  handleSelect: [item: CascaderOption, deep: number];
}>();

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  deep: 0,
  modelLabel: () => [],
});

function select(item: CascaderOption, deep: number) {
  emit('handleSelect', item, deep);
}
</script>
<style lang="scss" scoped></style>
