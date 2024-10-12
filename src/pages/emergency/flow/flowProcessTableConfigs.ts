import type { tableConfigItem } from "src/utils/tableMixin";

export const actionNames = {
  addProcess: "add" as const,
  editProcess: "edit" as const,
};
export interface flowProcessTableConfigsType {
  [actionNames.addProcess]: tableConfigItem[];
  [actionNames.editProcess]: tableConfigItem[];
}
export const flowProcessTableConfigs: flowProcessTableConfigsType = {
  [actionNames.addProcess]: [
    {
      label: "編組",
      name: "marshalling",
      field: "marshalling",
      align: "left",
      formType: "selectString",
      message: "請選擇編組",
      isDialogForm: true,
      required: false,
      disable: true,
      optionLabel: "label",
    },
    {
      label: "流程圖類型",
      name: "type",
      field: "type",
      align: "left",
      formType: "selectString",
      message: "請選擇流程圖類型",
      isDialogForm: true,
      required: true,
    },
    {
      label: "流程圖名稱",
      name: "description",
      field: "description",
      align: "left",
      formType: "inputString",
      message: "請輸入流程圖名稱",
      isDialogForm: true,
      required: true,
    },
  ],
  [actionNames.editProcess]: [
    {
      label: "流程圖名稱",
      name: "description",
      field: "description",
      align: "left",
      formType: "inputString",
      message: "請輸入流程圖名稱",
      isTable: true,
      isDialogForm: true,
      required: true,
    },
    {
      label: "流程圖類型",
      name: "type",
      field: "type",
      align: "left",
      formType: "selectString",
      message: "請選擇流程圖類型",
      isDialogForm: true,
      required: true,
    },
  ],
};
