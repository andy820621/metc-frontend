<template>
  <q-dialog v-model="dialogAttrs.visible" persistent @keyup.esc="closeDialog">
    <q-card
      class="relative-position"
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 600px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">
          {{ dialogStatusTitle }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>
      <q-form @submit="handleDialog">
        <q-card-section class="q-mb-md">
          <q-tabs
            v-model="dialogActiveTab.value"
            active-color="activeTab"
            indicator-color="activeTab"
            outside-arrows
            mobile-arrows
            v-if="
              dialogAttrs.status === 'updateMany' &&
              dialogAttrs.selectArray &&
              dialogAttrs.selectArray.length > 1
            "
          >
            <q-tab
              v-for="(item, index) in dialogAttrs.selectArray"
              :key="index"
              :name="item?.id"
              :label="
                item.houseNumber ||
                item.fullname ||
                item.name ||
                item.item ||
                item.device.name
              "
              @click="DialogTabChange(item)"
            />
          </q-tabs>
          <q-separator
            v-if="
              dialogAttrs.status === 'updateMany' &&
              dialogAttrs.selectArray &&
              dialogAttrs.selectArray.length > 1
            "
          />
          <q-tab-panels class="full-height" v-model="dialogActiveTab.value">
            <q-tab-panel :name="dialogActiveTab.value">
              <div style="max-height: calc(100vh - 295px)" class="q-gutter-md">
                <slot :data="dialogAttrs">
                  <div v-for="config in tableConfig" :key="config.name">
                    <div v-if="config.isDialogForm">
                      <!-- inputString -->
                      <q-input
                        :disable="config.disable"
                        v-if="config.formType === 'inputString'"
                        v-model="dialogAttrs.tempData[config.name]"
                        :label="config.label + (config.required ? ' *' : '')"
                        lazy-rules
                        :rules="[(val: any) => config.required ? !!val : (typeof val === 'string' || !val )  ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
                      >
                        <template v-slot:error>
                          {{ config.message }}
                        </template>
                      </q-input>
                      <!-- 數字 -->
                      <q-input
                        :disable="config.disable"
                        v-if="config.formType === 'inputNumber'"
                        v-model.number="dialogAttrs.tempData[config.name]"
                        :label="config.label + (config.required ? ' *' : '')"
                        type="number"
                        min="0"
                        lazy-rules
                        :rules="[(val: any) => config.required ? !!val && val > 0 : (typeof val === 'number' || !val )  ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
                      >
                        <template v-slot:error>
                          {{ config.message }}
                        </template>
                      </q-input>

                      <!-- 單選select -->
                      <q-select
                        clearable
                        :disable="config.disable"
                        v-if="config.formType === 'selectString'"
                        v-model="dialogAttrs.tempData[config.name]"
                        :options="dialogAttrs.selectOption"
                        :option-label="config.optionLabel ?? 'name'"
                        :label="config.label + (config.required ? ' *' : '')"
                        @focus="
                          selectListChange(config.name, dialogAttrs.tempData)
                        "
                        @update:model-value="handleSelectString"
                        :rules="[(val: any) => config.required ? !!val : typeof val === 'object'|| !val ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
                      >
                        <template v-slot:hint v-if="config.showHint">
                          <template
                            v-if="typeof config.showHint === 'function'"
                          >
                            {{ config.showHint(dialogAttrs.tempData) }}
                          </template>
                          <template v-else>
                            {{ config.showHint }}
                          </template>
                        </template>

                        <template
                          v-slot:before
                          v-if="config.linkUrl && config.linkUrl !== 'onlyOpen'"
                        >
                          <q-btn
                            @click="
                              linkUrlAction(
                                dialogAttrs.tempData,
                                config.linkUrl,
                                config.name
                              )
                            "
                            size="sm"
                            color="white"
                            text-color="primary"
                            round
                            dense
                            :icon="matKeyboardTab"
                            padding="5px 5px"
                          >
                            <q-tooltip
                              class="text-body2"
                              transition-show="scale"
                              transition-hide="scale"
                              anchor="top middle"
                              self="bottom middle"
                              :offset="[10, 10]"
                            >
                              資料細節
                            </q-tooltip>
                          </q-btn>
                        </template>

                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              尚無資料
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-slot:error>
                          {{ config.message }}
                        </template>
                      </q-select>

                      <!-- 多選select -->
                      <q-select
                        :disable="config.disable ?? selectManyDisable"
                        v-if="config.formType === 'selectMany'"
                        clearable
                        multiple
                        use-chips
                        option-value="id"
                        v-model="dialogAttrs.tempData[config.name]"
                        :options="dialogAttrs.selectOption"
                        :label="config.label + (config.required ? ' *' : '')"
                        @focus="
                          selectListChange(config.name, dialogAttrs.tempData)
                        "
                        class="q-mb-md"
                        :rules="[(val: any) => config.required ? val?.length > 0 : true || config.message]"
                      >
                        <template v-slot:selected-item="scope">
                          <q-chip
                            removable
                            @remove="scope.removeAtIndex(scope.index)"
                            :tabindex="scope.tabindex"
                            dense
                          >
                            {{
                              scope.opt.description ||
                              scope.opt.fullname ||
                              scope.opt.label ||
                              scope.opt.name
                            }}
                          </q-chip>
                        </template>
                        <template v-slot:option="scope">
                          <q-item v-bind="scope.itemProps">
                            <q-item-section>
                              <q-item-label>{{
                                scope.opt.description ||
                                scope.opt.label ||
                                scope.opt.name ||
                                scope.opt.fullname
                              }}</q-item-label>
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              尚無資料
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-slot:error>
                          {{ config.message }}
                        </template>
                      </q-select>

                      <!-- 有搜尋功能的單選 select -->
                      <q-select
                        clearable
                        :disable="config.disable"
                        v-if="config.formType === 'searchableSingleSelect'"
                        v-model="dialogAttrs.tempData[config.name]"
                        :options="dialogAttrs.selectOption"
                        :option-label="config.optionLabel ?? 'name'"
                        :label="config.label + (config.required ? ' *' : '')"
                        @focus="
                          selectListChange(config.name, dialogAttrs.tempData)
                        "
                        @update:model-value="handleSelectString"
                        :rules="[(val: any) => config.required ? !!val : typeof val === 'object'|| !val ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
                        use-input
                        input-debounce="0"
                        @filter="selectStringFilterFn"
                      >
                        <template v-slot:hint v-if="config.showHint">
                          <template
                            v-if="typeof config.showHint === 'function'"
                          >
                            {{ config.showHint(dialogAttrs.tempData) }}
                          </template>
                          <template v-else>
                            {{ config.showHint }}
                          </template>
                        </template>

                        <template
                          v-slot:before
                          v-if="config.linkUrl && config.linkUrl !== 'onlyOpen'"
                        >
                          <q-btn
                            @click="
                              linkUrlAction(
                                dialogAttrs.tempData,
                                config.linkUrl,
                                config.name
                              )
                            "
                            size="sm"
                            color="white"
                            text-color="primary"
                            round
                            dense
                            :icon="matKeyboardTab"
                            padding="5px 5px"
                          >
                            <q-tooltip
                              class="text-body2"
                              transition-show="scale"
                              transition-hide="scale"
                              anchor="top middle"
                              self="bottom middle"
                              :offset="[10, 10]"
                            >
                              資料細節
                            </q-tooltip>
                          </q-btn>
                        </template>

                        <template v-slot:no-option>
                          <q-item>
                            <q-item-section class="text-grey">
                              尚無資料
                            </q-item-section>
                          </q-item>
                        </template>
                        <template v-slot:error>
                          {{ config.message }}
                        </template>
                      </q-select>

                      <!-- 日期 -->
                      <!-- TODO: 維保的完成時間不能為Null  -->
                      <q-input
                        :disable="config.disable"
                        v-if="config.formType === 'date'"
                        :model-value="
                          dialogAttrs.tempData[config.name]
                            ? date.formatDate(
                                new Date(dialogAttrs.tempData[config.name]),
                                'YYYY-MM-DD'
                              )
                            : null
                        "
                        stack-label
                        :label="config.label + (config.required ? ' *' : '')"
                        :clearable="config.name !== 'completionDate'"
                        type="date"
                        @click="handleDate(config.name)"
                        @update:model-value="(val:any) => updateDate(val,config.name)"
                        :rules="[(val: any) => config.required ? !!val : (typeof val === 'string' || !val )  ? true :false || config.message?config.message:`請輸入 ${config.label}`]"
                      >
                        <template v-slot:hint v-if="config.showHint">
                          {{ config.showHint }}
                        </template>
                        <template v-slot:error>
                          {{ config.message }}
                        </template>
                      </q-input>

                      <!-- 備註 -->
                      <q-input
                        :disable="config.disable"
                        v-if="config.formType === 'textArea'"
                        v-model="dialogAttrs.tempData[config.name]"
                        :label="config.label + (config.required ? ' *' : '')"
                        type="textarea"
                        autogrow
                        :rules="
                          config.required
                            ? [(val) => !!val || '這是必填項']
                            : []
                        "
                      >
                        <template v-slot:error>
                          {{ config.message }}
                        </template>
                      </q-input>
                      <!-- Toggle Boolean -->
                      <q-toggle
                        v-if="config.formType === 'toggle'"
                        v-model="dialogAttrs.tempData[config.name]"
                        :indeterminate-value="false"
                        color="primary"
                        left-label
                      >
                        <span class="text-grey-8 fz-16 q-mr-xs"
                          >{{ config.label }}
                          {{ config.required ? " *" : "" }}</span
                        >
                      </q-toggle>
                      <!-- 電話 -->
                      <q-input
                        v-if="config.formType === 'phone'"
                        v-model="dialogAttrs.tempData[config.name]"
                        :label="config.label + (config.required ? ' *' : '')"
                        :mask="phoneRulesMask(dialogAttrs.tempData)"
                        unmasked-value
                        :hint="
                          '格式:' +
                          (dialogAttrs.tempData[config.name]?.[1] === '2'
                            ? '(02)-####-####'
                            : '(0#)-###-####')
                        "
                        lazy-rules
                        :rules="[phoneRules]"
                      />
                      <slot
                        name="custom"
                        :dialogAttrs="dialogAttrs"
                        :config="config"
                        :disable="config.disable"
                      />
                    </div>
                  </div>
                </slot>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card-section>
        <q-btn
          class="fit q-pa-md"
          type="submit"
          color="primary"
          text-color="white"
          :label="dialogAttrs.status === 'updateMany' ? '全部儲存' : '儲存'"
        />
      </q-form>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { date } from "quasar";

// api
import User from "src/api/user";
// utils
import type {
  dialogAttrsType,
  blockAttrsType,
  tempDataType,
  tableConfigItem,
} from "src/utils/tableMixin";
import { useCloned } from "@vueuse/core";
import { phoneRules, phoneRulesMask } from "src/utils/quasarRules";
import { linkUrlAction } from "src/utils/urlActions";
// icon

import { matKeyboardTab } from "@quasar/extras/material-icons";
import tableMixin from "src/utils/tableMixin";

const $q = inject("$q") as typeof QVueGlobals;

const emit = defineEmits([
  "handleDialog",
  "selectListChange",
  "updateLatestData",
  "handleDate",
  "selectStringFilterFn",
]);
const props = withDefaults(
  defineProps<{
    dialogAttrs: dialogAttrsType;
    blockAttrs?: blockAttrsType;
    customTableConfig?: tableConfigItem[]; // 選擇樓層
    selectManyDisable?: boolean;
  }>(),
  {
    selectManyDisable: false,
  }
);

const { dialogAttrs, blockAttrs, hideDialog } = tableMixin();

const tableConfig = computed(() => {
  if (
    dialogAttrs.value.status === "add" ||
    dialogAttrs.value.status === "edit" ||
    dialogAttrs.value.status === "updateMany"
  ) {
    return blockAttrs.value.tableConfig;
  } else if (props.customTableConfig?.length) {
    return props.customTableConfig;
  }
});
const dialogActiveTab = ref({
  label: "",
  value: "",
});
watch(
  () => props.blockAttrs?.tableConfig,
  (val) => {
    if (val) blockAttrs.value.tableConfig = val;
  },
  {
    deep: true,
  }
);
const isSave = ref(false);
watch(
  () => [props.dialogAttrs.tempData, props.dialogAttrs.visible],
  (newVal, oldVal) => {
    dialogAttrs.value = useCloned(props.dialogAttrs).cloned.value;
    if (dialogAttrs.value.visible) {
      if (dialogAttrs.value.status === "updateMany") {
        if (
          newVal[0] !== oldVal[0] &&
          Object.getOwnPropertyNames(oldVal[0]).length === 0
        ) {
          DialogTabChange(dialogAttrs.value.selectArray[0]);
        } else {
          DialogTabChange(dialogAttrs.value.tempData);
        }
      } else {
        DialogTabChange(dialogAttrs.value.tempData);
      }
    }
  },
  {
    deep: true,
  }
);
watch(
  () => dialogAttrs.value.tempData,
  (newVal, oldVal) => {
    if (Object.getOwnPropertyNames(oldVal).length === 0) {
      isSave.value = true;
    } else {
      isSave.value = false;
    }
  },
  {
    deep: true,
  }
);
watch(
  () => props.dialogAttrs.selectOption,
  () => {
    const { cloned } = useCloned(props.dialogAttrs.selectOption);
    dialogAttrs.value.selectOption = cloned.value;
  }
);

const dialogStatusTitle = computed(() => {
  const result =
    dialogAttrs.value.status === "add"
      ? "- 新增"
      : dialogAttrs.value.status === "edit"
      ? "- 編輯"
      : dialogAttrs.value.status === "updateMany"
      ? "- 多筆編輯"
      : "";

  return `${dialogAttrs.value.dialogTitle} ${result}`;
});

function handleDialog() {
  isSave.value = true;
  if (isSave.value) {
    console.log("handleDialog", dialogAttrs.value.status);

    if (dialogAttrs.value.status === "updateMany") {
      emit(
        "handleDialog",
        dialogAttrs.value.status,
        dialogAttrs.value.selectArray
      );
    } else {
      emit(
        "handleDialog",
        dialogAttrs.value.status,
        dialogAttrs.value.tempData
      );
    }
  }
}
function DialogTabChange(tempData: tempDataType) {
  if (
    dialogAttrs.value.selectArray &&
    dialogAttrs.value.selectArray?.length > 0
  ) {
    const dialogDataIndex = dialogAttrs.value.selectArray?.findIndex(
      (item: tempDataType) => item.id === tempData.id
    );

    if (dialogDataIndex) {
      dialogAttrs.value.selectArray[dialogDataIndex] = tempData;
      if (dialogDataIndex === 0) {
        return;
      }
    }
  }

  if (dialogAttrs.value.status === "add") {
    dialogActiveTab.value.value = "add";
  } else if (Object.getOwnPropertyNames(tempData).length > 0) {
    dialogActiveTab.value = {
      label: tempData.name,
      value: tempData.id,
    };
  }
  dialogAttrs.value.tempData = tempData;
}
function selectListChange(configName: string, tempData: tempDataType) {
  emit("selectListChange", configName, tempData);
}
function selectStringFilterFn(
  inputValue: string,
  doneFn: (func: () => void) => void,
  abortFn: () => void
): void {
  emit("selectStringFilterFn", inputValue, doneFn, abortFn);
}

function handleSelectString() {
  if (dialogAttrs.value.status === "updateMany") {
    emit(
      "updateLatestData",
      dialogAttrs.value.tempData,
      dialogAttrs.value.selectArray
    );
  } else {
    emit("updateLatestData", dialogAttrs.value.tempData);
  }
}
function updateDate(val: string, configName: string) {
  dialogAttrs.value.tempData[configName] = val;
  emit("updateLatestData", dialogAttrs.value.tempData);
}

function handleDate(configName: string) {
  emit("handleDate", configName);
}
export interface radioOptionsType {
  label: string;
  value: string | number | null;
}

function closeDialog() {
  if (isSave.value) {
    hideDialog();
  } else {
    setTimeout(() => {
      $q.dialog({
        title: "提示",
        message: "是否確定關閉視窗?",
        ok: "確定",
        cancel: "取消",
      }).onOk(() => {
        hideDialog();
      });
    }, 0);
  }
}
</script>

<style scoped lang="scss">
:deep(
    .q-field--auto-height .q-field__control,
    .q-field--auto-height .q-field__native
  ) {
  min-height: 0;
}
:deep(.q-field__marginal) {
  height: 28px;
}
.avatarHover {
  &:hover {
    background-color: grey;
    opacity: 0.8;
  }
}

.myDisabled .q-img {
  cursor: not-allowed;
  &:hover {
    background-color: grey;
    opacity: 0.8;
  }
}

:deep(.q-field) {
  align-items: center;
}
:deep(
    .q-field--auto-height .q-field__control,
    .q-field--auto-height .q-field__native
  ) {
  align-items: center;
}

:deep(.q-field__native[type="date"]::-webkit-calendar-picker-indicator) {
  cursor: pointer;
  position: absolute;
  right: 0;
  padding-left: 100%;
}
:deep(.q-field__control) {
  align-items: center;
}
</style>
