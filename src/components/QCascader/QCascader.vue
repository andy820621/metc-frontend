<template>
  <q-select
    v-model="modelLabel"
    :options="[{}]"
    :label="label"
    clearable
    @clear="handleClear"
  >
    <template v-slot:selected>
      <template v-if="modelLabel">
        <span>{{ cascaderLabel }}</span>
      </template>

      <template v-else />
    </template>
    <template v-slot:option>
      <CascaderItem
        :style="$q.screen.xs || $q.screen.sm ? 'width:50%' : ''"
        :options="options"
        @handleSelect="handleSelect"
        :modelLabel="modelLabel"
      />
    </template>
  </q-select>
</template>

<script setup name="QCascader">
import CascaderItem from "./CascaderItem.vue";

const emit = defineEmits(["update:modelValue"]);
const props = defineProps({
  modelValue: {
    type: Array,
    required: false,
    default: () => [],
  },
  options: {
    type: Array,
    required: false,
    default: () => [],
  },
  label: {
    type: String,
    required: false,
    default: "",
  },
  fullTypeAllData: {
    type: Object,
    required: true,
  },
});
const currentValue = ref([]);
const modelLabel = ref([]);
const selected = ref([]);
function handleSelect(item, deep) {
  if (deep === 0) {
    selected.value = [item];
  } else {
    selected.value[deep] = item;
  }
  modelLabel.value = selected.value;
  const valueList = [];
  let drivers = null;
  modelLabel.value.forEach((item) => {
    if (item.drivers) {
      drivers = Array.isArray(item.drivers) ? item.drivers[0] : item.drivers;
    }
    valueList.push(item.value);
  });
  currentValue.value = valueList;
  emit("update:modelValue", valueList, modelLabel.value, drivers);
}
function handleClear() {
  emit("update:modelValue", [], null);
}

const cascaderLabel = ref("");

watch(
  () => props.modelValue,
  () => {
    currentValue.value = props.modelValue;
    readCascaderLabel();
  },
  {
    immediate: true,
  }
);
watch(
  () => currentValue.value,
  () => {
    readCascaderLabel();
  }
);
function readCascaderLabel() {
  const ValueString = currentValue.value.join(",");
  cascaderLabel.value = props.fullTypeAllData[ValueString]?.value;
  modelLabel.value = cascaderLabel.value?.split(" / ");
}
</script>
