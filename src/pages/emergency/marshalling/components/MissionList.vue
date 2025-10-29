<template>
  <q-table
    :grid="$q.screen.xs"
    flat
    bordered
    :rows="tableRowsData"
    :columns="emgyMissionTableConfig as QTableProps['columns']"
    :visible-columns="visibleColumns"
    row-key="id"
    hide-pagination
    dense
    :rows-per-page-options="[0]"
  >
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th v-for="col in props.cols" :key="col.name" :props="props">
          {{ col.label }}
        </q-th>
        <q-th> </q-th>
      </q-tr>
    </template>

    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <div>{{ col.value }}</div>
        </q-td>
        <q-td class="text-center td-with-btnBox">
          <div class="btnBox">
            <template v-if="!props.row.isCancelled && !props.row.isCompleted">
              <slot
                name="desktopBtn"
                :id="props.row.id"
                :receiveUser="props.row.receiveUser"
              />
            </template>
          </div>
        </q-td>
      </q-tr>
    </template>
    <!-- 手機板的card style -->
    <template v-slot:item="props">
      <div class="q-pa-xs col-12 col-sm-6 col-md-4 col-lg-3">
        <q-card bordered flat class="q-mb-md">
          <q-list dense class="q-pt-sm">
            <q-item v-for="col in props.cols" :key="col.label">
              <q-item-section avatar style="min-width: 72px">
                {{ col.label }}
              </q-item-section>
              <q-item-section> {{ col.value }} </q-item-section>
            </q-item>
          </q-list>
          <q-card-section class="text-right btnBox">
            <slot
              name="mobileBtn"
              :id="props.row.id"
              :receiveUser="props.row.receiveUser"
            />
          </q-card-section>
        </q-card>
      </div>
    </template>
    <template v-slot:no-data="{ icon }">
      <div
        class="full-width row flex-center items-center text-primary q-gutter-sm"
        style="font-size: 18px"
      >
        <q-icon size="2em" :name="icon" />
        <span> 無相關資料 </span>
      </div>
    </template>
  </q-table>
</template>

<script setup lang="ts">
import type { QTableProps } from 'quasar';
import { emgyMissionTableConfig } from 'src/api/emergencyMission';
const $q = useQuasar();

const props = withDefaults(
  defineProps<{
    tableRowsData: object[];
    tableHeight?: string;
    unVisibleColumns?: string[];
  }>(),
  {
    unVisibleColumns: () => ['receiveTime'],
  },
);

// 這裡是指顯示部分config ，之後要改通用方式
const visibleColumns = computed(() => {
  return emgyMissionTableConfig
    ?.map((item) => item.name)
    .filter((item) => !props.unVisibleColumns?.includes(item));
});
</script>

<style lang="scss" scoped>
.td-with-btnBox {
  height: 1px;
  padding: 1px 1px 5px !important;
  min-width: 70px;
  .btnBox {
    width: 100%;
    height: 100%;
    word-wrap: normal;
    word-break: normal;
    white-space: nowrap;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
}
:deep(table) {
  // table-layout: fixed;
  box-sizing: border-box;
  & * {
    box-sizing: border-box;
  }
  td {
    div {
      width: max(100%, 45px);
      margin: 0 auto;
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
    }
  }
}
@media screen and (max-width: 1024px) {
  :deep(.q-table__middle) {
    display: none;
  }
  :deep(.q-table__grid-content) {
    height: 100%;
    overflow-y: auto;
  }
}
:deep(.my-sticky-header-block .q-table__bottom) {
  background: transparent;
}
</style>
