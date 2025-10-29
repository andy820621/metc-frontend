<template>
  <div v-for="config in tableConfig" :key="config.name">
    <div v-if="config.isDialogForm">
      <div class="flex flex-center" v-if="config.formType === 'mugShotFile'">
        <q-avatar
          square
          size="150px"
          class="q-mb-md cursor-pointer avatarHover"
          @click="() => console.log('test')"
        >
          <q-img
            class="fit"
            :src="dialogAttrs.tempData.userMugShotUrl || ''"
            spinner-color="white"
            fit="cover"
            placeholder-src="~assets/image/mugShotPlaceHolder.png"
          >
            <q-tooltip
              class="text-body2"
              transition-show="scale"
              transition-hide="scale"
              anchor="top middle"
              self="bottom middle"
              :offset="[10, 10]"
            >
              上傳大頭貼
            </q-tooltip></q-img
          >
        </q-avatar>
      </div>

      <q-input
        v-if="config.formType === 'inputString'"
        v-model="dialogAttrs.tempData[config.name]"
        :label="config.label + (config.required ? ' *' : '')"
        lazy-rules
        :rules="[
          (val: any) =>
            config.required
              ? !!val
              : typeof val === 'string' || !val
                ? true
                : false || config.message
                  ? config.message
                  : `請輸入 ${config.label}`,
        ]"
      >
        <template v-slot:error>
          {{ config.message }}
        </template>
      </q-input>
      <q-input
        v-if="config.formType === 'inputNumber'"
        v-model.number="dialogAttrs.tempData[config.name]"
        :label="config.label + (config.required ? ' *' : '')"
        type="number"
        lazy-rules
        :rules="[
          (val: any) =>
            config.required
              ? !!val
              : typeof val === 'number' || !val
                ? true
                : false || config.message
                  ? config.message
                  : `請輸入 ${config.label}`,
        ]"
      />
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

      <div v-if="config.formType === 'cellPhone'">
        <q-input
          v-for="(item, index) in config.name === 'phoneNumber2'
            ? cellPhoneArr
            : config.name === 'emergencyNumber2'
              ? emgyCellPhoneArr
              : config.name === 'phoneNumber' ||
                  config.name === 'emergencyNumber'
                ? [dialogAttrs.tempData[config.name]]
                : []"
          :key="index"
          class="q-mb-md"
          v-model="
            dialogAttrs.tempData[index > 0 ? config.name + index : config.name]
          "
          :label="
            index === 0
              ? config.label + (config.required ? ' *' : '')
              : `${config.label} ${index}`
          "
          mask="####-###-###"
          unmasked-value
          lazy-rules
          hint="格式: 09xx-xxx-xxx"
          :rules="[mobilePhoneRules]"
        >
          <template
            v-slot:after
            v-if="
              (config.name === 'phoneNumber2' ||
                config.name === 'emergencyNumber2') &&
              index ===
                (config.name === 'phoneNumber2'
                  ? cellPhoneArr.length - 1
                  : emgyCellPhoneArr.length - 1) &&
              index + 1 !== (config.name === 'phoneNumber2' ? 3 : 2)
            "
          >
            <q-btn
              size="sm"
              color="primary"
              text-color="white"
              round
              dense
              icon="add"
              padding="5px 5px"
              @click="addOtherPhone(config.name)"
            >
              <q-tooltip
                class="text-body2"
                transition-show="scale"
                transition-hide="scale"
                anchor="top middle"
                self="bottom middle"
                :offset="[10, 10]"
              >
                {{
                  config.name === 'phoneNumber2'
                    ? '新增聯絡電話( 最多三組)'
                    : '新增緊急聯絡電話( 最多兩組)'
                }}
              </q-tooltip>
            </q-btn>
          </template>
          <template v-slot:error>
            {{ config.message }}
          </template>
        </q-input>
      </div>

      <!-- email -->
      <q-input
        v-if="config.formType === 'email'"
        autocomplete="nope"
        type="email"
        v-model="dialogAttrs.tempData[config.name]"
        :label="config.label + (config.required ? ' *' : '')"
        lazy-rules
        :rules="[
          (val: string) =>
            !!val ? emailRegex.test(val) || '請輸入正確的信箱格式' : true,
        ]"
      >
        <template
          v-slot:before
          v-if="dialogAttrs.tempData[config.name] !== '' && props.isVerifyEmail"
        >
          <q-btn
            size="sm"
            color="white"
            text-color="primary"
            round
            dense
            icon="email"
            padding="5px 5px"
            @click="() => console.log('test')"
          >
            <q-tooltip
              class="text-body2"
              transition-show="scale"
              transition-hide="scale"
              anchor="top middle"
              self="bottom middle"
              :offset="[10, 10]"
            >
              {{
                dialogAttrs.tempData.isEmailConfirmed
                  ? '已驗證電子信箱'
                  : '尚未驗證電子信箱'
              }}
            </q-tooltip>
          </q-btn>
        </template>
      </q-input>

      <!-- 密碼 -->
      <q-input
        v-if="config.formType === 'password'"
        autocomplete="nope"
        v-model="dialogAttrs.tempData[config.name]"
        :type="isPwd ? 'password' : 'text'"
        :label="config.label + (config.required ? ' *' : '')"
        :rules="[
          (val: any) =>
            config.required
              ? !!val
              : typeof val === 'string' || !val
                ? true
                : false || config.message
                  ? config.message
                  : `請輸入 ${config.label}`,
        ]"
      >
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
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
        :label="config.label + (config.required ? ' *' : '')"
        @focus="selectListChange(config.name)"
        :rules="[
          (val: any) =>
            config.required
              ? !!val
              : typeof val === 'object' || !val
                ? true
                : false || config.message
                  ? config.message
                  : `請輸入 ${config.label}`,
        ]"
      >
        <template v-slot:before v-if="config.name === 'beControlled'">
          <q-btn
            size="sm"
            color="white"
            text-color="primary"
            round
            dense
            :icon="matErrorOutline"
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
              選擇一般帳號時，可替家庭內其他成員資料進行更動。
              選擇附屬帳號者，除自己資料可更動外，無法替家庭內其他成員資料進行更動，
              日後仍可透過一般帳號成員協助修改為一般帳號。
            </q-tooltip>
          </q-btn>
        </template>
        <template v-slot:selected-item="scope">
          <span>{{
            scope.opt.description ||
            scope.opt.name ||
            scope.opt.fullname ||
            scope.opt.label
          }}</span>
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section>
              <q-item-label>{{
                scope.opt.description ||
                scope.opt.fullname ||
                scope.opt.name ||
                scope.opt.label ||
                scope.opt.label
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> 尚無資料 </q-item-section>
          </q-item>
        </template>
        <template v-slot:error>
          {{ config.message }}
        </template>
      </q-select>
      <!-- 多選select -->
      <q-select
        :disable="config.disable"
        v-if="config.formType === 'selectMany'"
        clearable
        multiple
        use-chips
        option-value="id"
        v-model="dialogAttrs.tempData[config.name]"
        :options="dialogAttrs.selectOption"
        :label="config.label + (config.required ? ' *' : '')"
        @focus="selectListChange(config.name)"
        class="q-mb-md-md"
        :rules="[
          (val: any) =>
            config.required ? val?.length > 0 : true || config.message,
        ]"
      >
        <template v-slot:before v-if="config.name === 'roles'">
          <q-btn
            size="sm"
            color="white"
            text-color="primary"
            round
            dense
            :icon="matErrorOutline"
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
              請點擊角色/身分之標籤以填寫大樓、樓層、地址
            </q-tooltip>
          </q-btn>
        </template>

        <template v-slot:selected-item="scope">
          <q-chip
            clickable
            removable
            @remove="() => console.log('test')"
            :tabindex="scope.tabindex"
            dense
            @click.prevent.stop="() => console.log('test')"
          >
            {{ scope.opt.description || scope.opt.fullname || scope.opt.name }}
          </q-chip>
        </template>
        <template v-slot:option="scope">
          <q-item v-bind="scope.itemProps" @click="() => console.log('test')">
            <q-item-section>
              <q-item-label>{{
                scope.opt.description || scope.opt.fullname || scope.opt.name
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey"> 尚無資料 </q-item-section>
          </q-item>
        </template>
        <template v-slot:error>
          {{ config.message }}
        </template>
      </q-select>
      <!-- 日期 -->
      <q-input
        v-if="config.formType === 'date'"
        v-model="dialogAttrs.tempData[config.name]"
        stack-label
        :label="config.label + (config.required ? ' *' : '')"
        clearable
        type="date"
        @update:model-value="validateDate"
        :rules="[
          (val: any) =>
            config.required
              ? !!val
              : typeof val === 'string' || !val
                ? true
                : false || config.message
                  ? config.message
                  : `請輸入 ${config.label}`,
        ]"
      />
      <!-- radio -->
      <div v-else-if="config.formType === 'radioOption'">
        {{ config.label + (config.required ? ' *' : '') }}
        <q-field
          :disable="config.disable"
          hide-bottom-space
          borderless
          item-aligned
          :model-value="dialogAttrs.tempData[config.name]"
          class="QField q-pa-none"
          lazy-rules
          :rules="[(val: any) => (config.required ? val !== undefined : true)]"
        >
          <q-option-group
            v-model="dialogAttrs.tempData[config.name]"
            :options="radioOption"
            color="primary"
            inline
            dense
          />
          <template v-slot:error>
            {{ config.message }}
          </template>
        </q-field>
      </div>
      <!-- checkbox -->
      <div v-if="config.formType === 'checkbox'">
        <div class="text-grey-6">
          {{ config.label + (config.required ? ' *' : '') }}
        </div>
        <span>
          <q-btn
            size="sm"
            color="white"
            text-color="primary"
            round
            dense
            :icon="matErrorOutline"
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
              當有災害發生時，行動不便者名冊資料將優先提供給消防人員，
              做為救援之優先順序。
            </q-tooltip>
          </q-btn></span
        >
        <q-checkbox
          v-model="dialogAttrs.tempData[config.name]"
          :label="config.label"
        />
        <span class="q-ml-md"
          >(請在備註內描述行動不便狀況，例如:走路不方便。)</span
        >
      </div>
      <!-- 備註 -->
      <q-input
        :disable="config.disable"
        v-if="config.formType === 'textArea'"
        v-model="dialogAttrs.tempData[config.name]"
        :label="config.label + (config.required ? ' *' : '')"
        type="textarea"
        autogrow
      >
        <template v-slot:error>
          {{ config.message }}
        </template>
      </q-input>
    </div>
  </div>

  <q-dialog v-model="rolesDialogVisible" persistent v-if="rolesTempData?.role">
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 450px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ rolesTempData?.role?.description }}</div>
        <q-space />
        <q-btn
          icon="close"
          flat
          round
          dense
          @click="() => console.log('test')"
        />
      </q-card-section>

      <q-card-section>
        <div v-for="config in rolesConfig" :key="config.name">
          <div v-if="config.isDialogForm">
            <!-- 單選select -->
            <q-select
              :disable="config.disable"
              v-if="config.formType === 'selectString'"
              v-model="rolesTempData[config.name as keyof any]"
              :options="userFormSelectOption"
              :label="config.label + (config.required ? ' *' : '')"
              @focus="selectListChange(config.name)"
              :rules="[
                (val: any) =>
                  config.required
                    ? !!val
                    : typeof val === 'object' || !val
                      ? true
                      : false || config.message
                        ? config.message
                        : `請輸入 ${config.label}`,
              ]"
            >
              <template v-slot:before v-if="config.name === 'beControlled'">
                <q-btn
                  size="sm"
                  color="white"
                  text-color="primary"
                  round
                  dense
                  :icon="matErrorOutline"
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
                    選擇一般帳號時，可替家庭內其他成員資料進行更動。
                    選擇附屬帳號者，除自己資料可更動外，無法替家庭內其他成員資料進行更動，
                    日後仍可透過一般帳號成員協助修改為一般帳號。
                  </q-tooltip>
                </q-btn>
              </template>
              <template v-slot:selected-item="scope">
                <span>{{
                  scope.opt.description || scope.opt.name || scope.opt.fullname
                }}</span>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{
                      scope.opt.description ||
                      scope.opt.fullname ||
                      scope.opt.name ||
                      scope.opt.label
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> 尚無資料 </q-item-section>
                </q-item>
              </template>
              <template v-slot:error>
                {{ config.message }}
              </template>
            </q-select>
            <!-- 多選select -->
            <q-select
              :disable="config.disable"
              v-if="config.formType === 'selectMany'"
              clearable
              multiple
              use-chips
              option-value="id"
              v-model="rolesTempData[config.name as any]"
              :options="userFormSelectOption"
              :label="config.label + (config.required ? ' *' : '')"
              @focus="selectListChange(config.name)"
              class="q-mb-md-md"
              :rules="[
                (val: any) =>
                  config.required ? !!val : true || config.message,
              ]"
            >
              <template v-slot:before v-if="config.name === 'roles'">
                <q-btn
                  size="sm"
                  color="white"
                  text-color="primary"
                  round
                  dense
                  :icon="matErrorOutline"
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
                    請點擊角色/身分之標籤以填寫大樓、樓層、地址
                  </q-tooltip>
                </q-btn>
              </template>

              <template v-slot:selected-item="scope">
                <q-chip
                  clickable
                  removable
                  @remove="scope.removeAtIndex(scope.index)"
                  :tabindex="scope.tabindex"
                  dense
                >
                  {{
                    scope.opt.houseNumber ||
                    scope.opt.description ||
                    scope.opt.fullname ||
                    scope.opt.name
                  }}
                </q-chip>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{
                      scope.opt.houseNumber ||
                      scope.opt.description ||
                      scope.opt.fullname ||
                      scope.opt.name
                    }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey"> 尚無資料 </q-item-section>
                </q-item>
              </template>
              <template v-slot:error>
                {{ config.message }}
              </template>
            </q-select>
          </div>
        </div>
      </q-card-section>
      <q-card-section align="center">
        <q-btn
          color="primary"
          label="確定"
          @click="() => console.log('test')"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { date } from 'quasar';

// utils
import type {
  tableConfigItem,
  dialogAttrsType,
  tempDataType,
} from 'src/utils/tableMixin';
import FileReadMixin from 'src/utils/fileRead';
import { useCloned, useFileDialog } from '@vueuse/core';
import {
  phoneRules,
  mobilePhoneRules,
  phoneRulesMask,
} from 'src/utils/quasarRules';
// icon
import { matErrorOutline } from '@quasar/extras/material-icons';

const $q = useQuasar();

const emit = defineEmits(['selectListChange', 'getUserData', 'addOtherPhone']);

const props = defineProps<{
  dialogAttrs: dialogAttrsType;
  tableConfig: tableConfigItem[];
  customTableConfig?: tableConfigItem[];
  isVerifyEmail?: boolean;
  userFormSelectOption?: tempDataType[];
  cellPhoneArr: string[];
  emgyCellPhoneArr: string[];
}>();

const tableConfig = computed(() => props.tableConfig);
const dialogAttrs = computed(() => props.dialogAttrs);
const userFormSelectOption = computed(() => props.userFormSelectOption);

const cellPhoneArr = computed(() => props.cellPhoneArr);
const emgyCellPhoneArr = computed(() => props.emgyCellPhoneArr);

const radioOption = [
  {
    label: '男',
    value: false,
  },
  {
    label: '女',
    value: true,
  },
];
// 驗證 email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // 信箱驗證

function addOtherPhone(props: string) {
  emit('addOtherPhone', props);
}
const isPwd = ref(true);

function selectListChange(props: string) {
  emit('selectListChange', props);
}
// 驗證日期
function validateDate() {
  if (dialogAttrs.value.tempData.birthday) {
    const nowDate = date.formatDate(Date.now(), 'YYYY-MM-DD');
    const diff = date.getDateDiff(
      nowDate,
      dialogAttrs.value.tempData.birthday,
      'years',
    );
    if (diff > 100) {
      dialogAttrs.value.tempData.birthday = '';
      $q.notify({
        type: 'negative',
        message: '請輸入正確的生日年份',
        position: 'top',
      });
    }
  }
}
// 角色 / 身分 dialog
const rolesDialogVisible = ref(false);

const rolesTempData = ref<any>();
// 角色 / 身分內置欄位
const rolesConfig = ref<tableConfigItem[]>([
  {
    label: '大樓',
    name: 'buildings',
    field: 'buildings',
    align: 'left',
    formType: 'selectMany',
    message: '請選擇 大樓',
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: '樓層',
    name: 'floor',
    field: 'floor',
    align: 'left',
    formType: 'selectString',
    message: '請選擇 樓層',
    isTable: true,
    isDialogForm: true,
    required: true,
  },
  {
    label: '地址',
    name: 'addressPlates',
    field: 'addressPlates',
    align: 'left',
    formType: 'selectMany',
    message: '請選擇 地址',
    isTable: true,
    isDialogForm: true,
    required: true,
  },
]);

// 根據角色判斷顯示的欄位
const onlyBuildingRolesArr = [
  'System',
  'SecurityGuard',
  'Center',
  'Provider',
  'FireBrigade',
  'Community',
  'Manager',
  'Mercury',
  'Fire',
  'Inform',
  'EvacuationGuide',
  'SafetyProtection',
  'Ambulance',
];
const withAddressRolesArr = ['Landlord', 'Member', 'User'];
const isOnlyBuilding = ref(false);
const isWithAddress = ref(false);
function rolesTableConfigChange() {
  const floorConfigObj = rolesConfig.value.find(
    (item) => item.name === 'floor',
  );
  const addressPlatesConfigObj = rolesConfig.value.find(
    (item) => item.name === 'addressPlates',
  );
  const buildingConfigObj = rolesConfig.value.find(
    (item) => item.name === 'buildings',
  );
  if (isOnlyBuilding.value || !isWithAddress.value) {
    if (floorConfigObj) floorConfigObj.isDialogForm = false;
    if (addressPlatesConfigObj) addressPlatesConfigObj.isDialogForm = false;
    if (buildingConfigObj) buildingConfigObj.formType = 'selectMany';
  } else if (isWithAddress.value || !isOnlyBuilding.value) {
    if (floorConfigObj) floorConfigObj.isDialogForm = true;
    if (addressPlatesConfigObj) addressPlatesConfigObj.isDialogForm = true;
    if (buildingConfigObj) buildingConfigObj.formType = 'selectString';
  }
}

watch(
  () => rolesTempData.value?.buildings,
  (newVal, oldVal) => {
    if (
      !Array.isArray(newVal) &&
      !Array.isArray(oldVal) &&
      newVal &&
      oldVal &&
      newVal.id !== oldVal.id
    ) {
      if (rolesTempData.value) {
        rolesTempData.value.floor = undefined;
        rolesTempData.value.addressPlates = [];
      }
    }
  },
);

watch(
  () => rolesTempData.value?.floor,
  (newVal, oldVal) => {
    if (newVal && oldVal && newVal.id !== oldVal.id) {
      if (rolesTempData.value) rolesTempData.value.addressPlates = [];
    }
  },
);

defineExpose({
  rolesConfig,
  rolesTempData,
});

const accountType = ref('');
</script>
<style lang="scss" scoped>
.avatarHover {
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

:deep(.q-field__native[type='date']::-webkit-calendar-picker-indicator) {
  cursor: pointer;
  position: absolute;
  right: 0;
  padding-left: 100%;
}
</style>
