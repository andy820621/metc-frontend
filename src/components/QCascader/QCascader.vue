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

<script setup name="QCascader" lang="ts">
import CascaderItem, { type CascaderOption } from './CascaderItem.vue';

const $q = useQuasar();

interface FullTypeData {
  value: string;
  [key: string]: any;
}

interface Props {
  modelValue?: (string | number)[];
  options?: CascaderOption[];
  label?: string;
  fullTypeAllData: Record<string, FullTypeData>;
}

const emit = defineEmits<{
  'update:modelValue': [
    value: (string | number)[],
    modelLabel: CascaderOption[] | string[] | null,
    drivers?: string | null,
  ];
}>();

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => [],
  options: () => [],
  label: '',
});

const currentValue = ref<(string | number)[]>([]);
const modelLabel = ref<CascaderOption[]>([]);
const selected = ref<CascaderOption[]>([]);

function handleSelect(item: CascaderOption, deep: number) {
  if (deep === 0) {
    selected.value = [item];
  } else {
    selected.value[deep] = item;
  }
  modelLabel.value = selected.value;
  const valueList: (string | number)[] = [];
  let drivers: string | null = null;
  modelLabel.value.forEach((item) => {
    if (item.drivers) {
      drivers = Array.isArray(item.drivers) ? item.drivers[0] : item.drivers;
    }
    valueList.push(item.value);
  });
  currentValue.value = valueList;
  emit('update:modelValue', valueList, modelLabel.value, drivers);
}

function handleClear() {
  emit('update:modelValue', [], null);
}

const cascaderLabel = ref('');

watch(
  () => props.modelValue,
  () => {
    currentValue.value = props.modelValue;
    readCascaderLabel();
  },
  {
    immediate: true,
  },
);

watch(
  () => currentValue.value,
  () => {
    readCascaderLabel();
  },
);

function readCascaderLabel() {
  const ValueString = currentValue.value.join(',');
  const fullTypeData = props.fullTypeAllData[ValueString];
  if (fullTypeData?.value) {
    cascaderLabel.value = fullTypeData.value;
    // 當從 fullTypeAllData 讀取時，modelLabel 暫時設為空陣列
    // 因為我們只有字串標籤，沒有完整的 CascaderOption 物件
    modelLabel.value = [];
  }
}
</script>
