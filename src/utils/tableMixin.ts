import { Dialog, Notify } from 'quasar';
import { useCloned } from '@vueuse/core';
import type { FilterTypes, pagination } from 'src/api/api.type';

export interface tempDataType {
  [index: string]: any;
}

export interface blockRefType {
  resetSelect: () => void;
  pagination: pagination;
  loading: boolean;
}
export interface selectOption {
  label: string;
  value: boolean | string | number;
}
export interface SearchOption {
  label?: string;
  startVal?: string;
  endVal?: string;
  val?: string;
  type?: string | undefined;
  options?: selectOption[];
  style?: string;
  startString?: string;
  endString?: string;
  isDefault?: boolean;
  disableFuture?: boolean;
}
export interface tableConfigItem {
  label: string;
  name: string;
  field: string | ((row: any) => any);
  align: string;
  formType?: string;
  message?: string;
  isTable?: boolean;
  isDialogForm?: boolean;
  required?: boolean;
  disable?: boolean;
  withLabel?: boolean;
  linkUrl?: string;
  func?: (row: any) => any;
  config?: tableConfigItem[];
  showHint?: string | ((row: any) => string);
  optionLabel?: string | ((row: any) => string);
  optionValue?: string | ((row: any) => string);
  isTableSlot?: boolean; // 欄位在table上要有特殊的顯示
  isDialogConfig?: boolean; // 判斷該config是否在dialogConfig裡面
  searchTitle?: string; // 進階搜尋使用
  searchType?: string; // 進階搜尋使用
  searchOption?: SearchOption; // 進階搜尋使用
}
export interface blockAttrsType {
  blockTitle: string;
  headerButtons: string[];
  tableButtons: string[];
  tableConfig: tableConfigItem[];
  blockData: tempDataType[];
  totalNum: number;
}

export interface dialogAttrsType {
  dialogTitle: string;
  visible: boolean;
  uploadVisible?: boolean;
  exportExcelVisible?: boolean;
  importExcelVisible?: boolean;
  selectArray: tempDataType[];
  status: string;
  tempData: tempDataType;
  selectOption: tempDataType[];
}
export interface expandAttrsType {
  isExpand: boolean; // 是否為展開
  expandKey: string; // 展開 config
  expandConfig: tableConfigItem[];
}
export default function tableMixin(blockRef?: Ref<blockRefType>) {
  const expandTableAttrs = ref<expandAttrsType>({
    isExpand: false,
    expandKey: '',
    expandConfig: [],
  });
  /** Block */
  const blockAttrs = ref<blockAttrsType>({
    blockTitle: '',
    headerButtons: [],
    tableButtons: [],
    tableConfig: [],
    blockData: [],
    totalNum: 0,
  });
  const tableAttrs = ref<blockAttrsType>({
    blockTitle: '',
    headerButtons: [],
    tableButtons: [],
    tableConfig: [],
    blockData: [],
    totalNum: 0,
  });
  // handleBlock 的預設方法
  function handleBlockMixin(
    btn: { label: string; icon: string; status: string; isShow?: boolean },
    data: tempDataType,
    API?: any,
    getData?: (pagination?: blockRefType['pagination']) => void | Promise<void>,
  ) {
    dialogAttrs.value.status = btn.status;
    if (btn.status === 'edit' || btn.status === 'add') {
      dialogAttrs.value.visible = true;
      if (btn.status === 'edit') {
        const { cloned } = useCloned(data);
        dialogAttrs.value.tempData = cloned.value;
      } else if (btn.status === 'add') {
        dialogAttrs.value.tempData = {};
      }
    } else if (btn.status === 'updateMany') {
      if (
        dialogAttrs.value.selectArray &&
        dialogAttrs.value.selectArray.length > 0
      ) {
        dialogAttrs.value.visible = true;
        dialogAttrs.value.tempData = dialogAttrs.value.selectArray[0];
        console.log('updateMany', dialogAttrs.value.selectArray);
      } else {
        Notify.create({
          type: 'negative',
          message: '請勾選要更新的資料列',
          position: 'top',
        });
      }
    } else if (btn.status === 'delete') {
      console.log('delete', data);
      Dialog.create({
        title: '提示',
        message: '是否確定刪除該筆資料?',
        ok: '確定',
        cancel: '取消',
      })
        .onOk(() => {
          void (async () => {
            const result = (await API.apiDeleteData([
              data.id,
            ])) as typeof AxiosResponse;
            if (result.data[data.id]) {
              Notify.create({
                type: 'positive',
                message: '刪除成功',
                position: 'top',
              });
              const pagination = Array.isArray(blockRef?.value)
                ? blockRef?.value[0]?.pagination
                : blockRef?.value?.pagination;
              if (getData) getData(pagination);
            } else {
              Notify.create({
                type: 'negative',
                message: '刪除失敗',
                position: 'top',
              });
            }
          })();
        })
        .onCancel(() => {
          resetSelect();
        });
    } else if (btn.status === 'deleteMany') {
      if (
        dialogAttrs.value.selectArray &&
        dialogAttrs.value.selectArray.length > 0
      ) {
        const deleteArray = dialogAttrs.value.selectArray.map(
          (item: tempDataType) => item.id,
        );
        console.log('deleteArray', deleteArray);
        Dialog.create({
          title: '提示',
          message: '是否確定刪除所勾選的資料?',
          ok: '確定',
          cancel: '取消',
        })
          .onOk(() => {
            void (async () => {
              const result = (await API.apiDeleteData(
                deleteArray,
              )) as typeof AxiosResponse;

              deleteArray.forEach((id: string) => {
                if (result.data[id]) {
                  Notify.create({
                    type: 'positive',
                    message: '刪除成功',
                    position: 'top',
                  });
                } else {
                  Notify.create({
                    type: 'negative',
                    message: '刪除失敗',
                    position: 'top',
                  });
                }
              });
              const pagination = Array.isArray(blockRef?.value)
                ? blockRef?.value[0]?.pagination
                : blockRef?.value?.pagination;
              if (getData) getData(pagination);
            })();
          })
          .onCancel(() => {
            resetSelect();
          });
      } else {
        Notify.create({
          type: 'negative',
          message: '請勾選要刪除的資料列',
          position: 'top',
        });
      }
    } else if (btn.status === 'upload') {
      dialogAttrs.value.uploadVisible = true;
      dialogAttrs.value.tempData = data;
    } else if (btn.status === 'exportExcel') {
      console.log('exportExcel', btn, data);
      console.log('exportExcel dialogAttrs.value', dialogAttrs.value);
      dialogAttrs.value.exportExcelVisible = true;
    } else if (btn.status === 'importExcel') {
      console.log('importExcel', btn, data);
      console.log('importExcel dialogAttrs.value', dialogAttrs.value);
      dialogAttrs.value.importExcelVisible = true;
    }
  }

  /** Dialog */
  const dialogAttrs = ref<dialogAttrsType>({
    dialogTitle: '',
    visible: false,
    selectArray: [],
    status: '',
    tempData: {},
    selectOption: [],
  });

  // handleDialog 的預設方法
  async function handleDialogMixin(
    status: string,
    API: any,
    getData?: (pagination?: blockRefType['pagination']) => void | Promise<void>,
    data?: tempDataType,
  ) {
    if (status === 'edit' && data) {
      const tempDataResult = Array.isArray(data) ? data : [data];
      const result = (await API.apiPatchData(
        tempDataResult,
      )) as typeof AxiosResponse;

      tempDataResult.forEach((item: tempDataType) => {
        if (result.data[item.id]) {
          Notify.create({
            type: 'positive',
            message: '修改成功',
            position: 'top',
          });
          // hideDialog();
        } else {
          Notify.create({
            type: 'negative',
            message: '修改失敗',
            position: 'top',
          });
        }
      });
      console.log('編輯', result.data);
    } else if (status === 'add') {
      const tempDataResult: tempDataType = Array.isArray(data) ? data : [data];
      const result = (await API.apiPostData(
        tempDataResult,
      )) as typeof AxiosResponse;
      console.log('nowwww result', result);

      result.data.forEach((id: string, index: number) => {
        if (!Array.isArray(tempDataResult)) {
          tempDataResult.id = id;
        } else {
          tempDataResult[index].id = id;
        }
        if (id) {
          Notify.create({
            type: 'positive',
            message: '新增成功',
            position: 'top',
          });

          hideDialog();
        } else {
          Notify.create({
            type: 'negative',
            message: '新增失敗',
            position: 'top',
          });
        }
      });
      resetSelect();
      console.log('新增', result.data);
    } else if (status === 'updateMany') {
      const result = (await API.apiPatchData(data)) as typeof AxiosResponse;
      data?.forEach((item: { id: string }) => {
        if (result.data[item.id]) {
          Notify.create({
            type: 'positive',
            message: '修改成功',
            position: 'top',
          });
          // hideDialog();
        } else {
          Notify.create({
            type: 'negative',
            message: '修改失敗',
            position: 'top',
          });
        }
      });
      resetSelect();
    }
    const pagination = Array.isArray(blockRef?.value)
      ? blockRef?.value[0]?.pagination
      : blockRef?.value?.pagination;
    if (getData) getData(pagination);
  }
  // 隱藏 dialog 觸發的方法
  function hideDialog() {
    console.log('hideDialog');
    dialogAttrs.value.visible = false;
    dialogAttrs.value.uploadVisible = false;
    dialogAttrs.value.tempData = {};
    resetSelect();
  }

  // getDataMixin
  async function getDataMixin(
    API: any,
    pagination?: blockRefType['pagination'],
    dataAttrs = blockAttrs.value,
  ) {
    if (pagination) {
      const result = (await API.apiGetData(pagination)) as typeof AxiosResponse;
      dataAttrs.blockData = result.data.rows;
      dataAttrs.totalNum = result.data.rowsNumber;
      console.log('getData', dataAttrs.blockData);
    }
  }
  async function getTableMixin(
    API: any,
    pagination: blockRefType['pagination'],
  ) {
    if (pagination) {
      const result = (await API.apiGetTableData(
        pagination,
      )) as typeof AxiosResponse;
      tableAttrs.value.blockData = result.data.rows;
      tableAttrs.value.totalNum = result.data.rowsNumber;
      console.log('getTableData', tableAttrs.value.blockData);
    }
  }
  // 取得多選資料的內容
  function handleSelectArray(selected: tempDataType[]) {
    if (Array.isArray(selected)) {
      dialogAttrs.value.selectArray = selected;
    }
    console.log('selectArray', dialogAttrs.value.selectArray);
  }
  // 清除多選資料的內容
  function resetSelect() {
    if (Array.isArray(blockRef?.value)) {
      blockRef?.value.forEach((block) => {
        block.resetSelect();
      });
    } else {
      blockRef?.value?.resetSelect();
    }
  }

  function updateLatestData(
    tempData: tempDataType,
    selectArray: tempDataType[],
  ) {
    dialogAttrs.value.tempData = tempData;
    if (selectArray) dialogAttrs.value.selectArray = selectArray;
  }

  return {
    expandTableAttrs,
    dialogAttrs,
    blockAttrs,
    tableAttrs,
    handleBlockMixin,
    handleDialogMixin,
    handleSelectArray,
    hideDialog,
    getDataMixin,
    getTableMixin,
    updateLatestData,
    resetSelect,
  };
}

export // 設定 loading 狀態
function setBlockLoading(
  blockRef: Ref<blockRefType | undefined>,
  loading: boolean = false,
) {
  if (Array.isArray(blockRef?.value)) {
    blockRef?.value.forEach((block) => {
      block.loading = loading;
    });
    // console.log("setBlockLoading & blockRef is Array", blockRef?.value);
  } else {
    if (blockRef?.value?.loading) blockRef.value.loading = loading;
    // console.log("setBlockLoading & blockRef is not Array", blockRef?.value);
  }
}
