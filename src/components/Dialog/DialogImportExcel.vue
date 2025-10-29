<template>
  <q-dialog ref="dialogRef">
    <q-card class="card" :style="{ width: cardWidth + 'px' }">
      <!-- <q-card-section class="full-width row items-center q-pt-none q-pb-md">
        <h2 class="text-h5 text-bold q-ma-none">匯入檔案</h2>
        <q-space />
        <q-btn icon="close" flat round dense @click.prevent="hide" />
      </q-card-section> -->

      <q-toolbar>
        <q-toolbar-title class="text-h5 text-bold q-ma-none">
          匯入檔案
        </q-toolbar-title>

        <q-space />

        <q-btn icon="close" flat round dense @click.prevent="hide" />
      </q-toolbar>

      <q-card-section
        class="flex-nowrap items-center q-pb-lg"
        style="gap: 1rem"
      >
        <q-file
          label="載入檔案"
          label-color="primary"
          v-model="fileModel"
          :icon="mdiFileUpload"
          filled
          counter
          :counter-label="counterLabelFunc"
          use-chips
          accept=".xlsx,.csv,.xls"
          max-file-size="500000"
          @update:model-value="updateFile"
          @rejected="handelReject"
          class="q-pa-none"
        >
          <template #prepend>
            <q-icon :name="mdiFileUpload" color="primary" />
          </template>
        </q-file>

        <q-btn
          color="primary"
          @click="downloadSampleFile"
          label="下載範例檔案"
        />

        <q-btn
          v-if="rowData && rowData.length"
          color="primary"
          @click="formatAndSaveFunc(rowData)"
          label="匯入資料"
        />
      </q-card-section>

      <!-- 預覽table -->
      <template v-if="rowData && tableConfig">
        <div class="q-py-md" ref="tableRef">
          <q-table
            title="預覽表格"
            :rows="rowData"
            :columns="tableConfig as QTableProps['columns']"
            row-key="name"
            hide-pagination
            :rows-per-page-options="[0]"
            style="height: 400px; overflow-y: auto"
          />
        </div>
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiFileUpload } from '@quasar/extras/mdi-v6';
import type { QTableProps, QRejectedEntry } from 'quasar';
import type { tableConfigItem, tempDataType } from 'src/utils/tableMixin';
import { read, utils } from 'xlsx';
const emit = defineEmits(['formatAndSaveFunc']);

const $q = useQuasar();

const dialogRef = ref();

const fileModel = ref();
const rowData = ref();
const tableConfig = ref<tableConfigItem[]>();
const tableRef = ref<HTMLDivElement>();
const cardWidth = computed(() =>
  tableRef.value ? tableRef.value.getBoundingClientRect().width + 48 : 450,
);

const props = defineProps<{
  formatImportData: (data: typeof rowData.value) => void;
  sampleFile: string;
  tableConfig: tableConfigItem[];
  sampleFileText?: string;
}>();

interface dataRowType {
  [key: string]: number | string;
}
export interface dataItem {
  [key: string]: any;
}
async function updateFile() {
  console.log('updateFile', fileModel.value);
  if (!fileModel.value) {
    rowData.value = undefined;
    tableConfig.value = undefined;
    return;
  }

  try {
    const wb = read(await fileModel.value.arrayBuffer()); // 讀取檔案
    const data = utils.sheet_to_json<dataRowType>(wb.Sheets[wb.SheetNames[0]]); // 獲取工作表1的數據

    console.log('wb', wb);
    console.log('data', data);

    tableConfig.value = props.tableConfig;
    console.log('tableConfig.value', tableConfig.value);

    rowData.value = props.formatImportData(data);
    console.log('rowData.value', rowData.value);
  } catch (err) {
    console.log(err);
  }
}

function formatAndSaveFunc(data: tempDataType) {
  emit('formatAndSaveFunc', data);
}
interface counterLabelEvent {
  totalSize: string;
  filesNumber: number;
  maxFiles: string | number;
}
function counterLabelFunc({
  filesNumber,
  maxFiles,
  totalSize,
}: counterLabelEvent): string {
  return filesNumber ? `${filesNumber} 個檔案 (大小: ${totalSize})` : '';
}

const errorMaps = {
  accept: '請上傳 xlsx 或是 csv 格式的檔案',
  'max-file-size': '檔案大小必須小於 500 kb',
  filter: '...沒用到所以沒有預設內容之後可以自己在這改',
  'max-total-size': '...沒用到所以沒有預設內容之後可以自己在這改',
};

function handelReject(rejectedFiles: QRejectedEntry[]) {
  rejectedFiles.forEach((rejectedFile) => {
    const errorMessage =
      errorMaps[rejectedFile.failedPropValidation as keyof typeof errorMaps];
    if (!errorMessage) return;
    $q.notify({
      message: errorMessage,
      color: 'negative',
      icon: 'warning',
    });
  });
}

// 下載範例檔案
function downloadSampleFile() {
  const a = document.createElement('a');
  a.href = props.sampleFile;
  a.download = props.sampleFileText || '範例檔案.xlsx';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// 關閉 dialog
function hide() {
  dialogRef.value.hide();
  rowData.value = undefined;
  fileModel.value = undefined;
}
defineExpose({ hide });
</script>

<style scoped lang="scss">
.q-dialog__inner--minimized > div {
  max-width: 85vw;
}
.card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem 1.5rem;
}
</style>
