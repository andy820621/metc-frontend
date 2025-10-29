<template>
  <q-dialog ref="dialogRef">
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 450px'"
      class="q-pa-md"
    >
      <q-toolbar>
        <q-toolbar-title class="text-h6 text-bold"> 模擬試驗 </q-toolbar-title>

        <q-space />

        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <q-card-section>
        <q-select
          dense
          filled
          v-model="modelMultiple"
          multiple
          :options="selectOptions"
          option-value="id"
          option-label="name"
          options-selected-class="bg-grey-3"
          use-chips
          hint="請選擇要啟動的流程圖"
        >
          <template v-slot:prepend v-if="!modelMultiple.length">
            <span style="font-size: 1.1rem; color: #66666666">
              請選擇要發送的對象
            </span>
          </template>
        </q-select>
      </q-card-section>

      <q-card-section align="center">
        <div class="btn-container">
          <q-btn
            class="q-mr-md"
            color="secondary"
            text-color="primary"
            label="測試流程圖"
            @click.prevent="testProcess"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import TestProcess from 'src/utils/testProcess';
const $q = useQuasar();

const dialogRef = ref();

const props = defineProps<{
  simulationTestVisible: boolean;
}>();
const selectOptions = ref<{ id: string; name: string; version: number }[]>([]);
const { modelMultiple, initOptions, testProcess } = TestProcess(dialogRef);

watch(
  () => props.simulationTestVisible,
  async (val) => {
    if (val) {
      if (!selectOptions.value.length) {
        await initOptions();
        selectOptions.value = modelMultiple.value;
      }
      modelMultiple.value = selectOptions.value; // 預設全選
    } else if (val === false) {
      modelMultiple.value = [];
    }
  },
);
</script>

<style scoped lang="scss">
.card {
  display: grid;
  place-items: center;
  padding: 1rem 1.5rem;
  h2 {
    margin: 0;
    font-size: 1.7rem;
    font-weight: 600;
  }
  .q-input {
    width: 90%;
  }
  .btn-container {
    margin: 2.4rem 0 1rem;
    display: flex;
    gap: 2rem;
  }
}
</style>
