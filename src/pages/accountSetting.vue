<template>
  <q-page
    class="q-pa-md grid"
    :style="$q.screen.xs || $q.screen.sm ? 'grid-template-rows: 60px 1fr' : ''"
  >
    <h3
      v-if="$q.screen.xs || $q.screen.sm"
      class="text-left text-bold"
      style="font-size: 1.55rem; margin: 0"
    >
      帳號管理
    </h3>
    <q-card class="q-pa-md flex-grow-1">
      <BlockComponent
        ref="blockRef"
        :blockAttrs="blockAttrs"
        v-on="blockEvent"
        v-model:filters="filters"
        tabHeight="0px"
      >
        <template #customHeaderButtons>
          <q-btn
            v-for="(btn, index) in customHeaderButtons"
            :key="index"
            @click="handleClickOption(btn)"
            :color="btn.status === 'accountStatusMany' ? 'positive' : undefined"
            dense
            :icon="btn.icon"
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
              {{ btn.label }}
            </q-tooltip>
          </q-btn>
        </template>
        <template #customTableButtons="scoped">
          <q-btn
            v-for="(btn, index) in customTableButtons"
            :key="index"
            @click="handleClickOption(btn, scoped.data)"
            :color="
              btn.status === 'accountStatus'
                ? scoped?.data?.lockout
                  ? undefined
                  : 'positive'
                : undefined
            "
            dense
            :icon="
              btn.status === 'accountStatus'
                ? scoped?.data?.lockout
                  ? mdiToggleSwitchOff
                  : mdiToggleSwitch
                : btn.icon
            "
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
              {{
                btn.status === "accountStatus"
                  ? scoped?.data?.lockout
                    ? "未啟用"
                    : "啟用中"
                  : btn.label
              }}
            </q-tooltip>
          </q-btn>
        </template>
      </BlockComponent>
    </q-card>
  </q-page>

  <DialogForm
    :dialogAttrs="dialogAttrs"
    :blockAttrs="dialogTableVisible ? tableAttrs : blockAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
    <template #default="{ data }">
      <UserForm
        ref="userFormRef"
        v-if="dialogAttrs.visible"
        @selectListChange="selectListChange"
        @addOtherPhone="addOtherPhone"
        :customTableConfig="roleTableConfig"
        :cellPhoneArr="cellPhoneArr"
        :emgyCellPhoneArr="emgyCellPhoneArr"
        :tableConfig="
          dialogTableVisible ? beControlledDataConfig : userTableConfig
        "
        :dialogAttrs="data"
        :userFormSelectOption="userFormSelectOption"
      />
    </template>
  </DialogForm>

  <DialogExportExcel
    v-model="dialogAttrs.exportExcelVisible"
    :blockData="blockDataForExcel"
    :tableConfig="userTableConfig"
    :fullBlockData="fullBlockDataForExcel"
  />
  <!-- dialogTable -->
  <!--  之後可以做成component block部分用slot -->
  <q-dialog v-model="dialogTableVisible" persistent>
    <q-card
      class="flex column"
      :style="
        $q.screen.xs || $q.screen.sm
          ? 'width:100%; height:100%'
          : 'min-width: 90%; height:80%'
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">
          {{ dialogAttrs.dialogTitle }}
          {{ dialogTableTitle ? `- ${dialogTableTitle}` : "" }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="flex-grow-1">
        <BlockComponent
          ref="blockRef"
          :blockAttrs="tableAttrs"
          v-on="tableEvent"
          :isSearch="false"
          :isDialogTable="true"
          :custom-height="'calc(100% - 20px)'"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
  <DialogExportExcel
    v-model="dialogAttrs.exportExcelVisible"
    :blockData="blockDataForExcel"
    :tableConfig="tableConfigForExcel"
    :fullBlockData="fullBlockDataForExcel"
  />
  <DialogImportExcel
    ref="dialogImportExcelRef"
    v-model="dialogAttrs.importExcelVisible"
    @formatAndSaveFunc="saveImportData"
    :formatImportData="formatImportData"
    :tableConfig="blockAttrs.tableConfig.filter((item) => item.isTable)"
    :sampleFile="sampleFile"
  />
</template>
<script setup lang="ts">
// api
import AccountSetting, {
  UserViewModel,
  userTableConfig,
} from "src/api/accountSetting";
import Building, { BuildingViewModel } from "src/api/building";
import Floors, { FloorViewModel } from "src/api/floors";
import Role, { RoleViewModel, roleType } from "src/api/role";
import AddressPlate, { AddressPlateViewModel } from "src/api/addressPlate";
import UserAccount, { beControlledDataConfig } from "src/api/userAccount";

// utils
import cellPhoneMixin from "src/utils/cellPhoneMixin";
import { useCloned } from "@vueuse/core";
import FileReadMixin from "src/utils/fileRead";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import { dataItem } from "src/components/Dialog/DialogImportExcel.vue";

import type {
  blockRefType,
  tempDataType,
  tableConfigItem,
  blockAttrsType,
} from "src/utils/tableMixin";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
import type { FilterColumn, FilterColumnCollection } from "src/api/api.type";
// icon
import {
  mdiToggleSwitch,
  mdiToggleSwitchOff,
  mdiAccount,
  mdiAccountAlert,
} from "@quasar/extras/mdi-v6";
import { formatExcelDate } from "src/utils/formatUtils";
import { rolesTempDataType } from "src/components/UserForm.vue";

const $q = inject("$q") as typeof QVueGlobals;

// 客製 button
const customHeaderButtons = ref([
  {
    label: "多筆啟用",
    icon: mdiToggleSwitch,
    status: "accountStatusMany",
  },
  {
    label: "多筆更改角色",
    icon: mdiAccountAlert,
    status: "changeRolesMany",
  },
]);
const customTableButtons = ref([
  {
    label: "附屬帳號",
    icon: mdiAccount,
    status: "accounts",
  },
  {
    label: "是否啟用",
    icon: mdiToggleSwitchOff,
    status: "accountStatus",
  },
]);
function handleClickOption(
  btn: {
    label: string;
    icon: string;
    status: string;
  },
  data?: UserViewModel
) {
  if (data) {
    handleBlock(btn, data);
  } else {
    handleBlock(btn, dialogAttrs.value.selectArray);
  }
}
// block
const blockRef = ref<blockRefType>();
const {
  dialogAttrs,
  blockAttrs,
  tableAttrs,
  handleBlockMixin,
  handleDialogMixin,
  handleSelectArray,
  hideDialog,
  getDataMixin,
  getTableMixin,
} = tableMixin(blockRef as Ref<blockRefType>);

const dialogEvent = computed(() => {
  return {
    handleDialog,
    selectListChange,
  };
});
const blockEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getData,
  };
});
const tableEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getTableData,
  };
});
const roleTableConfig = ref<tableConfigItem[]>([
  {
    label: "角色/身分",
    name: "roles",
    field: "roles",
    align: "left",
    formType: "selectMany",
    message: "請選擇 角色/身分",
    isTable: true,
    isDialogForm: true,
    required: true,
  },
]);
// API類別
let API: typeof AccountSetting | typeof UserAccount;
const normalAccountData = ref<UserViewModel>();
// 在 block 上的操作
const { getFile } = FileReadMixin();
async function handleBlock<T>(
  btn: { label: string; icon: string; status: string },
  data: T extends UserViewModel ? T : tempDataType
) {
  const userMugShotFileConfigObj = userTableConfig.find(
    (item) => item.name === "mugShotFileId"
  );
  const accountsMugShotFileConfigObj = beControlledDataConfig.find(
    (item) => item.name === "mugShotFileId"
  );
  const passwordConfigObj = userTableConfig.find(
    (item) => item.name === "password"
  );
  if (btn.status === "edit" || btn.status === "updateMany") {
    if (btn.status === "edit") {
      data.userMugShotUrl = await getFile(null, data.mugShotFileId);
    } else {
      dialogAttrs.value.selectArray.forEach(async (item) => {
        item.userMugShotUrl = await getFile(null, data.mugShotFileId);
      });
    }
    if (passwordConfigObj) passwordConfigObj.isDialogForm = false;
    if (userMugShotFileConfigObj) userMugShotFileConfigObj.isDialogForm = true;
    if (accountsMugShotFileConfigObj) {
      accountsMugShotFileConfigObj.isDialogForm = true;
    }
  } else if (btn.status === "add") {
    cellPhoneArr.value = [""];
    emgyCellPhoneArr.value = [""];
    if (passwordConfigObj) passwordConfigObj.isDialogForm = true;
    if (userMugShotFileConfigObj) userMugShotFileConfigObj.isDialogForm = false;
    if (accountsMugShotFileConfigObj) {
      accountsMugShotFileConfigObj.isDialogForm = false;
    }
  }

  if (API === UserAccount) {
    if (btn.status === "edit") {
      readPhoneNumber(data);
    }

    if (data?.isDisability === null) {
      data.isDisability = false;
    }
    await handleBlockMixin(btn, data, API, getTableData);
  } else {
    handleBlockMixin(btn, data, API, getData);

    if (btn.status === "edit") {
      readPhoneNumber(dialogAttrs.value.tempData);
    } else if (btn.status === "updateMany") {
      dialogAttrs.value.selectArray.forEach((item) => {
        readPhoneNumber(item);
      });
    }
    if (data?.isDisability === null) {
      data.isDisability = false;
    }
  }
  // 帳號是否啟用
  if (btn.status === "accountStatus") {
    $q.dialog({
      title: "提示",
      message: `目前帳號為「${
        data.lockout ? "未啟用" : "啟用"
      } 」狀態，是否將帳號設定為 「${data.lockout ? "啟用" : "不啟用"}」?`,
      persistent: true,
      ok: {
        push: true,
        label: "確定",
      },
      cancel: "取消",
    }).onOk(async () => {
      const accountStatus: { [key: string]: boolean } = {};
      accountStatus[data.id] = !data.lockout;
      const result = (await AccountSetting.apiLockoutUser(
        accountStatus
      )) as typeof AxiosResponse;
      if (result.data) {
        $q.notify({
          type: "positive",
          message: "更改成功",
          position: "top",
        });
        getData();
      } else {
        $q.notify({
          type: "negative",
          message: "更改失敗",
          position: "top",
        });
      }
    });
  } else if (btn.status === "accountStatusMany") {
    if (
      dialogAttrs.value.selectArray &&
      dialogAttrs.value.selectArray.length > 0
    ) {
      $q.dialog({
        title: "提示",
        message: "是否啟用目前所選取的帳號?",
        persistent: true,
        ok: {
          push: true,
          label: "確定",
        },
        cancel: "取消",
      }).onOk(async () => {
        const accountStatus: { [key: string]: boolean } = {};
        dialogAttrs.value.selectArray.forEach((item) => {
          accountStatus[item.id] = false;
        });
        const result = (await AccountSetting.apiLockoutUser(
          accountStatus
        )) as typeof AxiosResponse;
        if (result.data) {
          $q.notify({
            type: "positive",
            message: "更改成功",
            position: "top",
          });
          getData();
        } else {
          $q.notify({
            type: "negative",
            message: "更改失敗",
            position: "top",
          });
        }
      });
    } else {
      $q.notify({
        type: "negative",
        message: "請勾選要更新的資料列",
        position: "top",
      });
    }
  } else if (btn.status === "exportExcel") {
    $q.loading.show({
      message: "資料加載中...",
      spinnerColor: "warning",
      messageColor: "warning",
    });
    const result = (await AccountSetting.apiGetData({
      filters: "",
      page: 0,
      rowsPerPage: 0,
    })) as typeof AxiosResponse;
    $q.loading.hide();
    if (result.data.rows) {
      fullBlockDataForExcel.value = formatBlockData(result.data.rows);
    }
  } else if (btn.status === "accounts") {
    normalAccountData.value = data as UserViewModel;

    const { cloned } = useCloned(data);
    dialogAttrs.value.tempData = cloned.value;
    dialogTableVisible.value = true;
    dialogTableTitle.value = "附屬帳號";
    nextTick(() => {
      tableAttrs.value.tableConfig = beControlledDataConfig;
      tableAttrs.value.headerButtons = ["add", "deleteMany"];
      tableAttrs.value.tableButtons = ["edit", "delete"];
    });
  } else if (btn.status === "changeRolesMany") {
    // 多筆更改角色
    if (
      dialogAttrs.value.selectArray &&
      dialogAttrs.value.selectArray.length > 0
    ) {
      cellPhoneArr.value = [""];
      emgyCellPhoneArr.value = [""];
      dialogAttrs.value.visible = true;
      dialogAttrs.value.tempData.roles = [];
      dialogAttrs.value.tempData.id = 1;
    } else {
      $q.notify({
        type: "negative",
        message: "請勾選要更新的資料列",
        position: "top",
      });
    }
  }
}

// 在新增/編輯 dialog 上的操作
// 電話號碼處理
const {
  cellPhoneArr,
  emgyCellPhoneArr,
  addOtherPhone,
  readPhoneNumber,
  formatPhoneNumber,
} = cellPhoneMixin(dialogAttrs.value);

async function handleDialog(status: string, data: tempDataType) {
  if (Array.isArray(data)) {
    data.forEach((item) => {
      formatPhoneNumber(item);
    });
  } else {
    formatPhoneNumber(data);
  }
  if (API === UserAccount) {
    if (status === "add") {
      data.user = normalAccountData.value;
    }
    handleDialogMixin(status, API, getTableData, data);
  } else {
    if (status === "add") {
      data.emailConfirmed = false;
      data.lockout = false;
      data.switchs = 0;
    }
    if (status === "changeRolesMany") {
      // 多筆更改角色
      const { roleBuildings, roleAddressPlates, roles } = data;
      dialogAttrs.value.selectArray.forEach((item) => {
        if (roles?.length) item.roles = roles;
        if (roleBuildings?.length) item.roleBuildings = roleBuildings;
        if (roleAddressPlates?.length) {
          item.roleAddressPlates = roleAddressPlates;
        }
      });
      handleDialogMixin("edit", API, getData, dialogAttrs.value.selectArray);
    } else {
      handleDialogMixin(status, API, getData, data);
    }
  }
  if (Array.isArray(data)) {
    data.forEach((item) => {
      readPhoneNumber(item);
    });
  } else {
    readPhoneNumber(data);
  }
}

// 取得分頁資料
const { filters } = searchFiltersGenerator(userTableConfig);
async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 25,
  }
) {
  API = AccountSetting;
  // 產出 filters 物件 (filtersObject)
  const searchText = pagination.filters;
  console.log("searchText", searchText);
  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    filters,
    searchText,
    "User"
  );
  const jsonFilters = JSON.stringify(filtersObject);
  const payload = useCloned(pagination).cloned.value;
  payload.filters = jsonFilters;
  await getDataMixin(API, payload);

  setDataForDataConfig(blockAttrs.value.blockData as tempDataType[]);

  setBlockLoading(blockRef);
}
// dialogTable
const dialogTableVisible = ref(false);
const dialogTableTitle = ref("");
async function getTableData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  API = UserAccount;
  pagination.userId = normalAccountData.value?.id;
  await getTableMixin(API, pagination);
}
function init() {
  dialogAttrs.value.dialogTitle = "帳號管理";
  blockAttrs.value.tableConfig = userTableConfig;
  blockAttrs.value.headerButtons = [
    "updateMany",
    "add",
    "deleteMany",
    "importExcel",
    "exportExcel",
  ];
  blockAttrs.value.tableButtons = ["edit", "delete"];
}
onMounted(() => {
  init();
});

// 每次點取變換下拉選單內容
const userFormRef = ref<{
  rolesConfig: tableConfigItem[];
  rolesTempData: rolesTempDataType;
}>();
const userFormSelectOption = ref<tempDataType[]>([]);
async function selectListChange(props: string) {
  console.log("selectListChange", props);
  if (props === "buildings") {
    const result = (await Building.apiGetAllBuilding()) as typeof AxiosResponse;
    userFormSelectOption.value = result.data;
  } else if (props === "floor") {
    const Bid = Array.isArray(userFormRef.value?.rolesTempData.buildings)
      ? userFormRef.value?.rolesTempData.buildings[0].id
      : userFormRef.value?.rolesTempData.buildings?.id;
    if (userFormRef.value?.rolesTempData.buildings) {
      const result = (await Floors.apiGetBuildingFloor(
        Bid
      )) as typeof AxiosResponse;
      userFormSelectOption.value = result.data;
    } else {
      $q.notify({
        type: "warning",
        message: "請先選擇大樓，再選擇樓層",
        position: "top",
      });
      userFormSelectOption.value = [];
    }
  } else if (props === "addressPlates") {
    if (userFormRef.value?.rolesTempData.floor?.id) {
      const result = (await AddressPlate.apiGetAddressPlate(
        userFormRef.value?.rolesTempData.floor.id
      )) as typeof AxiosResponse;

      userFormSelectOption.value = result.data;
    } else {
      $q.notify({
        type: "warning",
        message: "請先選擇樓層，再選擇地址",
        position: "top",
      });
      userFormSelectOption.value = [];
    }
  } else if (props === "roles") {
    // 系統角色
    const result = await Role.apiGetRoles([
      { type: roleType.role, isEmergency: null },
      { type: roleType.class, isEmergency: null },
    ]);

    // 手動更改角色名稱
    dialogAttrs.value.selectOption = result.data.map((item) => {
      if (item.name === "Manager") item.description = "防火管理人";
      return item;
    });
  }
}

// Excel
const tableConfigForExcel = ref<blockAttrsType["tableConfig"]>([]);
const blockDataForExcel = ref<blockAttrsType["blockData"]>([]);
const fullBlockDataForExcel = ref<blockAttrsType["blockData"]>([]);

async function setDataForDataConfig(blockData: blockAttrsType["blockData"]) {
  const newBlockData = useCloned(blockData).cloned.value;
  tableConfigForExcel.value = userTableConfig;
  console.log("newBlockData", newBlockData);

  blockDataForExcel.value = formatBlockData(newBlockData);
  tableConfigForExcel.value.forEach((item) => {
    const { label, name } = item;
    rowsChKeyToEngNameObject[label] = name;
  });
  console.log("tableConfigForExcel", tableConfigForExcel.value);
}
function formatBlockData(blockData: blockAttrsType["blockData"]) {
  return blockData.map((item) => {
    item.sex = item.sex ? "女" : item.sex === false ? "男" : "尚未設定";
    item.isDisability = item.isDisability ? "是" : "否";
    item.roles = item.roles
      .map((role: RoleViewModel) => role.description)
      .join("、");
    item.houseNumber = item.roleAddressPlates?.length
      ? item.roleAddressPlates
          .flatMap((p: { addressPlates: AddressPlateViewModel[] }) =>
            p.addressPlates.map((a) => a.houseNumber)
          )
          .filter(
            (value: any, index: any, self: string | any[]) =>
              self.indexOf(value) === index
          )
          .join("、")
      : "";
    return item;
  });
}
// Excel 匯入 => 多筆新增
const dialogImportExcelRef = ref();
const sampleFile = computed(() => {
  return "/excelSample/帳號資料.xlsx";
});
const rowsChKeyToEngNameObject = reactive<{ [key: string]: string }>({});

function formatImportData(data: dataItem[]) {
  const clonedData = useCloned(data).cloned.value;
  clonedData.map((item) => {
    for (const key in item) {
      const newKey = rowsChKeyToEngNameObject[key];
      if (newKey) {
        if (newKey === "sex") {
          item[newKey as keyof typeof item] = JSON.parse(item[key]);
        } else {
          item[newKey as keyof typeof item] = item[key];
        }
      }
      delete item[key];
    }
    item.birthday = formatExcelDate(item.birthday);
    item.password = "1234"; // 預設密碼
    item.emailConfirmed = false;
    item.lockout = false;
    item.switchs = 0;
    return item;
  });
  return clonedData;
}

async function saveImportData(formattedTableData: dataItem[]) {
  await handleDialogMixin("add", API, getData, formattedTableData);
  dialogImportExcelRef.value.hide();
}
</script>
