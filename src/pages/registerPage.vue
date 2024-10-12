<template>
  <q-layout>
    <div class="fullscreen">
      <q-img
        v-if="$q.screen.xs || $q.screen.sm"
        src="~assets/image/login_bg_mobile.jpg"
        class="absolute"
      />
      <q-img v-else src="~assets/image/login_bg_2.jpg" class="absolute" />
      <div
        class="absolute-center"
        :style="$q.screen.xs || $q.screen.sm ? 'width: 90%;' : 'width: 700px'"
      >
        <q-card
          flat
          class="text-dark q-pa-xs-md q-pa-sm-lg"
          :style="$q.screen.xs || $q.screen.sm ? '' : 'max-height:700px'"
        >
          <q-tabs
            v-model="activeTab.value"
            class="text-grey"
            active-color="primary"
            indicator-color="primary"
            align="justify"
            active-class="bg-grey-1"
            narrow-indicator
            mobile-arrows
          >
            <q-tab
              v-for="(tab, index) in blockTabs"
              :key="index"
              :name="tab.value"
              :label="tab.label"
              style="
                cursor: none-allowed;
                pointer-events: none;
                font-size: 16px;
              "
            />
          </q-tabs>

          <q-separator />

          <q-tab-panels v-model="activeTab.value" animated>
            <q-tab-panel
              :name="tab.value"
              v-for="(tab, index) in blockTabs"
              :key="index"
              style="max-height: 620px"
            >
              <div v-if="activeTab.value === 'firstStep'">
                <q-option-group
                  :options="radioOptions"
                  type="radio"
                  v-model="applyRadio"
                  @update:model-value="selectClear"
                />
                <q-card-section align="center">
                  <q-btn
                    :disabled="applyRadio !== null ? false : true"
                    color="primary"
                    @click="
                      applyRadio === 'individual'
                        ? tabChange(blockTabs[index + 2])
                        : tabChange(blockTabs[index + 1])
                    "
                    >下一步</q-btn
                  >
                </q-card-section>
              </div>
              <div v-if="activeTab.value === 'secondStep'">
                <UserForm
                  ref="userFormRef"
                  @selectListChange="selectListChange"
                  @addOtherPhone="addOtherPhone"
                  :cellPhoneArr="cellPhoneArr"
                  :emgyCellPhoneArr="emgyCellPhoneArr"
                  :tableConfig="tableConfig"
                  :dialogAttrs="dialogAttrs"
                  :userFormSelectOption="userFormSelectOption"
                />
                <q-card-section
                  align="center"
                  :style="$q.screen.xs ? 'padding: 0 0 10px 0' : ''"
                >
                  <q-btn
                    :size="$q.screen.xs ? 'sm' : ''"
                    class="q-mr-xs-xs q-mr-sm-md"
                    outline
                    text-color="primary"
                    @click="tabChange(blockTabs[index - 1])"
                    >上一步</q-btn
                  >
                  <q-btn
                    :size="$q.screen.xs ? 'sm' : ''"
                    type="submit"
                    :disabled="
                      applyRadio !== 'individual'
                        ? dialogAttrs.tempData['roles'] &&
                          dialogAttrs.tempData['totalTabNum']
                          ? false
                          : true
                        : false
                    "
                    color="primary"
                    @click="tabChange(blockTabs[index + 1])"
                    >下一步</q-btn
                  >
                </q-card-section>
              </div>

              <div v-if="activeTab.value === 'thirdStep'">
                <!-- 多筆註冊 -->
                <div v-if="applyRadio === 'group'">
                  <q-splitter v-model="splitterModel">
                    <template v-slot:before>
                      <q-tabs
                        v-model="innerActiveTab.value"
                        vertical
                        class="text-primary"
                      >
                        <div class="flex flex-center">
                          <q-btn
                            size="xs"
                            round
                            class="q-mb-xs"
                            color="primary"
                            @click="addAccountTab"
                            icon="add"
                          ></q-btn>
                        </div>
                        <q-tab
                          v-for="(i, index) in dialogAttrs.selectArray"
                          :key="index"
                          :name="i.id"
                          @click="innerTabChange(i, index as number)"
                        >
                          <template v-slot>
                            <div class="flex flex-center">
                              <q-btn
                                round
                                icon="close"
                                size="xs"
                                class="q-mr-xs"
                                @click.stop="deleteAccountTab(index as number)"
                              />
                              <span>帳號{{ i.id }}</span>
                            </div>
                          </template>
                        </q-tab>
                      </q-tabs>
                    </template>

                    <template v-slot:after>
                      <q-tab-panels
                        v-model="innerActiveTab.value"
                        animated
                        transition-prev="slide-down"
                        transition-next="slide-up"
                        style="padding-left: 0"
                      >
                        <q-tab-panel
                          :name="i.id"
                          v-for="(i, idx) in dialogAttrs.selectArray"
                          :key="idx"
                          ref="formsRef"
                          style="max-height: 600px"
                        >
                          <div class="q-mb-md">
                            <q-form class="q-gutter-md" @submit="onSubmit">
                              <UserForm
                                ref="userFormRef"
                                @selectListChange="selectListChange"
                                @addOtherPhone="addOtherPhone"
                                :cellPhoneArr="cellPhoneArr"
                                :emgyCellPhoneArr="emgyCellPhoneArr"
                                :tableConfig="tableConfig"
                                :dialogAttrs="dialogAttrs"
                                :userFormSelectOption="userFormSelectOption"
                              />
                            </q-form>
                          </div>
                          <q-card-section
                            align="center"
                            v-if="dialogAttrs.selectArray.length - 1 === idx"
                            :style="$q.screen.xs ? 'padding: 0 0 10px 0' : ''"
                          >
                            <q-btn
                              :size="$q.screen.xs ? 'sm' : ''"
                              class="q-mr-xs-xs q-mr-sm-md"
                              outline
                              text-color="primary"
                              @click="innerTabChange(i, idx, 'pre')"
                              >上一筆</q-btn
                            >
                            <q-btn
                              :size="$q.screen.xs ? 'sm' : ''"
                              class="q-mr-xs-xs q-mr-sm-md"
                              color="primary"
                              @click="onSubmit"
                              >送出申請</q-btn
                            >
                          </q-card-section>
                          <q-card-section
                            align="center"
                            v-else
                            :style="$q.screen.xs ? 'padding: 0 0 10px 0' : ''"
                          >
                            <q-btn
                              :size="$q.screen.xs ? 'sm' : ''"
                              v-if="
                                innerActiveTab.value ===
                                dialogAttrs.selectArray[0].id
                              "
                              class="q-mr-xs-xs q-mr-sm-md"
                              outline
                              text-color="primary"
                              @click="tabChange(blockTabs[index - 1])"
                              >上一步</q-btn
                            >
                            <q-btn
                              :size="$q.screen.xs ? 'sm' : ''"
                              v-else
                              class="q-mr-xs-xs q-mr-sm-md"
                              outline
                              text-color="primary"
                              @click="innerTabChange(i, idx as number, 'pre')"
                              >上一筆</q-btn
                            >
                            <q-btn
                              :size="$q.screen.xs ? 'sm' : ''"
                              color="primary"
                              type="submit"
                              @click="innerTabChange(i, idx as number, 'next')"
                              >下一筆</q-btn
                            >
                          </q-card-section>
                        </q-tab-panel>
                      </q-tab-panels>
                    </template>
                  </q-splitter>
                </div>
                <div v-else>
                  <q-form class="q-gutter-md" @submit="onSubmit">
                    <UserForm
                      ref="userFormRef"
                      @selectListChange="selectListChange"
                      @addOtherPhone="addOtherPhone"
                      :cellPhoneArr="cellPhoneArr"
                      :emgyCellPhoneArr="emgyCellPhoneArr"
                      :tableConfig="tableConfig"
                      :dialogAttrs="dialogAttrs"
                      :userFormSelectOption="userFormSelectOption"
                    />
                  </q-form>
                  <q-card-section
                    align="center"
                    :style="$q.screen.xs ? 'padding: 0 0 10px 0' : ''"
                  >
                    <q-btn
                      :size="$q.screen.xs ? 'sm' : ''"
                      class="q-mr-xs-xs q-mr-sm-md"
                      outline
                      text-color="primary"
                      @click="
                        applyRadio === 'individual'
                          ? tabChange(blockTabs[index - 2])
                          : tabChange(blockTabs[index - 1])
                      "
                      >上一步</q-btn
                    >
                    <q-btn
                      :size="$q.screen.xs ? 'sm' : ''"
                      class="q-mr-xs-xs q-mr-sm-md"
                      color="primary"
                      @click="onSubmit"
                      >送出申請</q-btn
                    >
                  </q-card-section>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
      </div>
    </div>
  </q-layout>
</template>
<script setup lang="ts">
// utils
import tableMixin from "src/utils/tableMixin";
import cellPhoneMixin from "src/utils/cellPhoneMixin";
import { useCloned } from "@vueuse/core";
import type { tableConfigItem, tempDataType } from "src/utils/tableMixin";
// api
import Basic, { registerConfig } from "src/api/basic";
import Building, { BuildingViewModel } from "src/api/building";
import Floors, { FloorViewModel } from "src/api/floors";
// type
import Role, { RoleViewModel } from "src/api/role";

// pinia

import { useRouter } from "vue-router";
import { UserViewModel } from "src/api/accountSetting";

const router = useRouter();

const $q = inject("$q") as typeof QVueGlobals;
const { dialogAttrs } = tableMixin();
const tableConfig = ref<tableConfigItem[]>([]);

// 電話號碼處理
const { cellPhoneArr, emgyCellPhoneArr, addOtherPhone, formatPhoneNumber } =
  cellPhoneMixin(dialogAttrs.value);

const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "STEP 1 : 為誰申請",
    value: "firstStep",
  },
  {
    label: "STEP 2 : 多筆註冊身分 / 地址",
    value: "secondStep",
  },
  {
    label: "STEP 3 : 填寫資料",
    value: "thirdStep",
  },
];

// 多筆註冊的地址/人數
const groupConfig = [
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
  {
    label: "總人數",
    name: "totalTabNum",
    field: "totalTabNum",
    align: "left",
    formType: "inputNumber",
    message: "請輸入 總人數",
    isTable: false,
    isDialogForm: true,
    required: true,
  },
];

// 下拉選單
const userFormSelectOption = ref<tempDataType[]>([]);

async function selectListChange(props: string) {
  console.log("selectListChange", props);

  if (props === "buildings") {
    const result =
      (await Building.apiGetAnonymousAllBuilding()) as typeof AxiosResponse;
    userFormSelectOption.value = result.data;
  } else if (props === "floor") {
    if (
      Array.isArray(userFormRef.value) &&
      userFormRef.value[0]?.rolesTempData.buildings
    ) {
      const Bid = Array.isArray(userFormRef.value[0]?.rolesTempData.buildings)
        ? userFormRef.value[0]?.rolesTempData.buildings[0].id
        : userFormRef.value[0]?.rolesTempData.buildings.id;
      const result = (await Floors.apiGetAnonymousBuildingFloor(
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
    if (
      Array.isArray(userFormRef.value) &&
      userFormRef.value[0]?.rolesTempData.floor
    ) {
      const result = (await Floors.apiGetAnonymousBuildingFloorAddressplate(
        userFormRef.value[0]?.rolesTempData.floor.id
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
    const result =
      (await Role.apiGetAnonymousRolesList()) as typeof AxiosResponse;
    dialogAttrs.value.selectOption = result.data;
  }
}

// 多筆共用的角色(同角色、大樓、樓層、地址)
const commonRoles = ref(null);
// firstStep:為誰申請
const applyRadio = ref(null);
const radioOptions = ref<{ label: string; value: string }[]>([]);

function selectClear() {
  console.log("selectClear");
  dialogAttrs.value.selectArray = [];
  dialogAttrs.value.tempData = {
    id: 1,
    isDisability: false,
  };
  if (userFormRef.value) userFormRef.value.rolesTempData = {};
}

// thirdStep : 填寫資料
const innerActiveTab = ref({
  label: "",
  value: 0,
});
// step1-3 的tabChange
function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log("tabChange", tab);
  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
  if (activeTab.value.value === "firstStep") {
    radioOptions.value = [
      { label: "個人 用戶申請", value: "individual" },
      { label: "家庭 / 公司 / 多筆 用戶申請", value: "group" },
    ];
  } else if (activeTab.value.value === "secondStep") {
    tableConfig.value = groupConfig;
  } else if (activeTab.value.value === "thirdStep") {
    if (applyRadio.value === "group") {
      tableConfig.value = registerConfig;
      commonRoles.value = dialogAttrs.value.tempData.roles;
      if (dialogAttrs.value.selectArray.length === 0) {
        dialogAttrs.value.selectArray = Array.from(
          { length: dialogAttrs.value.tempData.totalTabNum },
          (i, index) => {
            return {
              id: index + 1,
              isDisability: false,
            };
          }
        );
        innerTabChange(
          {
            id: 1,
            isDisability: false,
          },
          0
        );
      }
    } else if (applyRadio.value === "individual") {
      console.log("individual");
      const { cloned } = useCloned(registerConfig);
      tableConfig.value = cloned.value;
    }
  }
}
onMounted(() => {
  tabChange(blockTabs[0]);
});

const splitterModel = ref(0);
onMounted(() => {
  if ($q.screen.xs || $q.screen.sm) {
    splitterModel.value = 28;
  } else {
    splitterModel.value = 15;
  }
});
// 新增多筆註冊的帳號
function addAccountTab() {
  if (dialogAttrs.value.selectArray.length > 0) {
    dialogAttrs.value.selectArray.push({
      id:
        dialogAttrs.value.selectArray[dialogAttrs.value.selectArray.length - 1]
          .id + 1,
      isDisability: false,
    });
  } else {
    dialogAttrs.value.selectArray.push({
      id: 1,
      isDisability: false,
    });
  }
  innerActiveTab.value.value =
    dialogAttrs.value.selectArray[dialogAttrs.value.selectArray.length - 1].id;
  dialogAttrs.value.tempData.totalTabNum = dialogAttrs.value.selectArray.length;
}
// 刪除多筆註冊的帳號
function deleteAccountTab(index: number) {
  dialogAttrs.value.selectArray.splice(index, 1);
  if (index < dialogAttrs.value.selectArray.length - 1) {
    innerActiveTab.value.value = dialogAttrs.value.selectArray[index].id;
  } else {
    innerActiveTab.value.value = dialogAttrs.value.selectArray[index - 1].id;
    dialogAttrs.value.tempData = dialogAttrs.value.selectArray[index - 1];
  }
  dialogAttrs.value.tempData.totalTabNum = dialogAttrs.value.selectArray.length;
}

const formsRef = ref(null);
// 多筆註冊的tabChange
function innerTabChange(item: tempDataType, index: number, status = "") {
  if (Array.isArray(formsRef.value)) (formsRef.value[0] as any).scrollTop = 0;

  if (
    dialogAttrs.value.selectArray &&
    dialogAttrs.value.selectArray.length > 0
  ) {
    innerActiveTab.value.value = item.id;
    if (!dialogAttrs.value.tempData.id) dialogAttrs.value.tempData.id = 1;
    const dialogDataIndex = dialogAttrs.value.selectArray?.findIndex(
      (item: tempDataType) => item.id === dialogAttrs.value.tempData.id
    );
    const { cloned } = useCloned(dialogAttrs.value.tempData);
    dialogAttrs.value.selectArray[dialogDataIndex] = cloned.value;
    dialogAttrs.value.tempData = dialogAttrs.value.selectArray[index];

    if (status === "pre") {
      if (errorHandle()) return;
      innerActiveTab.value.value = dialogAttrs.value.selectArray[index - 1].id;
      dialogAttrs.value.tempData = dialogAttrs.value.selectArray[index - 1];
    } else if (status === "next") {
      if (errorHandle()) return;
      innerActiveTab.value.value = dialogAttrs.value.selectArray[index + 1].id;
      dialogAttrs.value.tempData = dialogAttrs.value.selectArray[index + 1];
    }
    dialogAttrs.value.tempData.roles = dialogAttrs.value.selectArray[
      index
    ].roles = commonRoles.value;
  }
}
const userFormRef = ref<{
  rolesConfig: tableConfigItem[];
  rolesTempData: {
    role?: RoleViewModel;
    buildings?: BuildingViewModel | BuildingViewModel[];
    floor?: FloorViewModel;
  };
}>();

function errorHandle() {
  // 錯誤處理
  let error = false;
  tableConfig.value.forEach((item) => {
    if (item.required && dialogAttrs.value.tempData[item.name] === undefined) {
      error = true;
      $q.notify({
        type: "negative",
        message: `${item.label} 尚未填寫`,
        position: "top",
      });
    }
  });
  if (
    dialogAttrs.value.tempData.password2 !== dialogAttrs.value.tempData.password
  ) {
    error = true;
    $q.notify({
      type: "negative",
      message: "兩次密碼輸入不一致",
      position: "top",
    });
  }
  if (Array.isArray(userFormRef.value)) {
    userFormRef.value[0].rolesConfig.forEach((item: tableConfigItem) => {
      dialogAttrs.value.tempData.roles?.forEach((role: tempDataType) => {
        if (
          !role.rolesTempData[item.name] &&
          item.required &&
          item.isDialogForm
        ) {
          error = true;
          $q.notify({
            type: "negative",
            message: `${item.label} 尚未填寫 (位於角色/身分欄位裡)`,
            position: "top",
          });
        }
      });
    });
  }
  return error;
}

async function onSubmit() {
  if (errorHandle()) return;
  if (dialogAttrs.value.selectArray.length) {
    dialogAttrs.value.selectArray.forEach(async (item) => {
      if (item.phoneNumber2 || item.emergencyNumber2) {
        formatPhoneNumber(item);
      }
    });

    dialogAttrs.value.selectArray.forEach((normal, index) => {
      normal.id = String(normal.id);
      normal.emailConfirmed = false;
      normal.lockout = false;
      normal.switchs = 0;
      normal.sex = null;
      if (dialogAttrs.value.selectArray[0].roleAddressPlates && index > 0) {
        normal.roleAddressPlates =
          dialogAttrs.value.selectArray[0].roleAddressPlates;
      } else if (dialogAttrs.value.selectArray[0].roleBuildings && index > 0) {
        normal.roleBuildings = dialogAttrs.value.selectArray[0].roleBuildings;
      }
    });

    const result = (await Basic.apiPostRegister(
      dialogAttrs.value.selectArray as UserViewModel[]
    )) as typeof AxiosResponse;
    result.data.forEach((item: tempDataType) => {
      if (item) {
        $q.notify({
          type: "positive",
          message: "註冊成功",
          position: "top",
        });
        router.push("/login");
      } else {
        $q.notify({
          type: "negative",
          message: Object.values(result.errors).join("、"),
          position: "top",
        });
      }
    });
  } else if (Object.values(dialogAttrs.value.tempData).length > 0) {
    formatPhoneNumber(dialogAttrs.value.tempData);
    dialogAttrs.value.tempData.id = String(dialogAttrs.value.tempData.id);

    dialogAttrs.value.tempData.emailConfirmed = false;
    dialogAttrs.value.tempData.lockout = false;
    dialogAttrs.value.tempData.switchs = 0;
    const result = (await Basic.apiPostRegister([
      dialogAttrs.value.tempData as UserViewModel,
    ])) as typeof AxiosResponse;
    result.data.forEach((item: tempDataType) => {
      if (item) {
        $q.notify({
          type: "positive",
          message: "註冊成功",
          position: "top",
        });
        router.push("/login");
      } else {
        $q.notify({
          type: "negative",
          message: Object.values(result.errors).join("、"),
          position: "top",
        });
      }
    });
  }
}
</script>
