<template>
  <q-dialog ref="dialogRef">
    <q-card
      :style="$q.platform.is.mobile ? 'width:85%' : 'min-width: 450px'"
      class="q-pa-md"
    >
      <q-toolbar>
        <q-toolbar-title class="text-h6 text-bold"> 匯出檔案 </q-toolbar-title>

        <q-space />

        <q-btn icon="close" flat round dense v-close-popup />
      </q-toolbar>

      <q-card-section>
        <q-input v-model="fileTitle" label="檔案名稱" />
      </q-card-section>

      <q-card-section align="center">
        <div class="btn-container">
          <q-btn
            class="q-mr-md"
            :icon="mdiFileExport"
            color="secondary"
            text-color="primary"
            label="匯出全部"
            @click.prevent="exportAllData"
          />
          <q-btn
            :icon="mdiFileExport"
            color="primary"
            label="匯出本頁"
            @click.prevent="exportPageData"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { mdiFileExport } from '@quasar/extras/mdi-v6';
import type { blockAttrsType } from 'src/utils/tableMixin';
import { is } from 'quasar';
import { write, utils } from 'xlsx';
import { saveAs } from 'file-saver';

const $q = useQuasar();

const dialogRef = ref();

const props = defineProps<{
  blockData: blockAttrsType['blockData'];
  tableConfig: blockAttrsType['tableConfig'];
  fullBlockData: blockAttrsType['blockData'];
}>();

const fileTitle = ref('');
// 匯出所有資料
function exportAllData() {
  const rowData = formatData(props.fullBlockData);
  exportFile(rowData);
}
// 匯出該頁面
function exportPageData() {
  // 轉換資料格式
  const rowData = formatData(props.blockData);
  exportFile(rowData);
}
// 判斷是否為物件
// 轉換成要匯出的資料
function formatData(needFormatData: typeof props.blockData) {
  console.log('now needFormatData', needFormatData);
  console.log('now tableConfig', props.tableConfig);
  const chHeaderObject = props.tableConfig.reduce(
    (obj: Record<string, unknown>, currentConfig) => {
      obj[currentConfig.name] = currentConfig.label;
      return obj;
    },
    {},
  );
  console.log('now chHeaderObject', chHeaderObject);
  const exportKeys = Object.keys(chHeaderObject);
  console.log('now exportKeys', exportKeys);
  const rowData = needFormatData.map((config) => {
    const newObj = {} as { [key: string]: unknown };
    Object.entries(config).forEach(([key, value]) => {
      if (exportKeys.includes(key)) {
        const chKey = chHeaderObject[key];
        newObj[chKey as keyof typeof newObj] = is.object(value)
          ? value.name
          : value;
      }
    });
    return newObj;
  });
  console.log('now rowData', rowData);
  return rowData;
}
// 匯出到本機
function exportFile(rowData: { [key: string]: unknown }[]) {
  const ws = utils.json_to_sheet(rowData); // 將 rowData 資料轉換為 SheetJS 中的工作表（worksheet）物件。
  // 設定每個欄位的寬度
  const columns = Object.keys(rowData[0]); // 假設第一筆資料包含所有可能的欄位
  const columnWidths = columns.map((column) => ({
    wch: calculateColumnWidth(column, rowData), // 自訂計算欄位寬度的函數
  }));
  ws['!cols'] = columnWidths;
  const wb = utils.book_new(); // 創建一個空的工作簿（workbook）物件，作為整個 Excel 檔案的容器。
  utils.book_append_sheet(wb, ws, '工作表1'); //  將 ws 附加 wb 中，並指定工作表的名稱為 "工作表1"。
  const wbout = write(wb, { bookType: 'xlsx', type: 'array' }); // 將 wb 寫入到 Excel 檔案中。

  /* 匯出檔案到本機 */
  const filename =
    fileTitle.value.length > 0 ? fileTitle.value + '.xlsx' : '清單.xlsx';
  const url = URL.createObjectURL(
    new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
  );
  try {
    saveAs(url, filename);
    $q.dialog({
      title: '提示',
      message: '成功匯出檔案 ' + filename,
      ok: {
        push: true,
        label: '完成',
      },
    }).onOk(() => {
      dialogRef.value.hide();
    });
  } catch (e) {
    $q.notify({
      type: 'negative',
      message: '匯出檔案出現問題!!',
      position: 'top',
    });
    setTimeout(() => dialogRef.value.hide(), 1000);
  }
}
function calculateColumnWidth(
  column: string,
  rowData: { [key: string]: unknown }[],
): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  let maxWidth = 0;
  if (context) {
    context.font = '12px Arial'; // 設定預設字型和大小
    maxWidth = context.measureText(column.toString()).width / 4;
  }

  // 迭代所有資料列，計算每個欄位的寬度
  rowData.forEach((row) => {
    const value = row[column];
    if (value && context) {
      const displayValue = is.object(value) ? value.name : value;
      const textWidth = context.measureText(displayValue.toString()).width / 6; // 測量文字寬度 => 4, 6 是個神祕數字
      maxWidth = Math.max(maxWidth, textWidth); // 更新最大寬度
    }
  });

  const extraWidth = 8; // 加上額外的寬度裕度，可根據需求調整
  maxWidth += extraWidth;

  return maxWidth;
}
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
