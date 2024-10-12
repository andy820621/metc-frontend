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

<script setup name="CascaderItem">
const emit = defineEmits(["handleSelect"]);

const props = defineProps({
  options: {
    type: Array,
    required: false,
    default: () => [],
  },
  deep: {
    type: Number,
    required: false,
    default: 0,
  },
  modelLabel: {
    type: Array,
    required: false,
    default: () => [],
  },
});

function select(item, deep) {
  emit("handleSelect", item, deep);
}
</script>
<style lang="scss" scoped></style>
