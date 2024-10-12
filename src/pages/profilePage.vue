<template>
  <q-page class="q-pa-md flex">
    <div class="flex-grow-1">
      <div
        class="text-bold q-mb-sm"
        :class="
          $q.screen.xs || $q.screen.sm ? 'text-h5 q-mb-md' : 'text-h4 q-py-md'
        "
      >
        個人資料
      </div>
      <div
        :class="{
          'border-1 rounded-lg overflow-hidden': $q.screen.xs || $q.screen.sm,
        }"
      >
        <q-tabs
          v-model="activeTab.value"
          class="text-activeTab"
          active-color="activeTab"
          indicator-color="activeTab"
          align="left"
          narrow-indicator
          :class="{
            'twoTabsPerRow bg-white': $q.screen.xs || $q.screen.sm,
          }"
        >
          <q-tab
            v-for="(tab, index) in blockTabs"
            :key="index"
            :name="tab.value"
            :label="tab.label"
            @click="tabChange(tab)"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels
          v-model="activeTab.value"
          :style="
            $q.screen.xs || $q.screen.sm
              ? activeTab.value === 'profile'
                ? { height: 'calc(100vh - 365px)' }
                : { height: 'calc(100vh - 295px)' }
              : { height: 'calc(100vh - 220px)', background: 'transparent' }
          "
          animated
          :swipeable="$q.screen.xs || $q.screen.sm"
        >
          <q-tab-panel
            v-for="(tab, index) in blockTabs"
            :key="index"
            :name="tab.value"
            :class="{ 'q-pr-none': !($q.screen.xs || $q.screen.sm) }"
            style="overflow-y: auto"
          >
            <!-- 個人資料 -->
            <q-card
              flat
              style="background: transparent"
              v-if="activeTab.value === 'profile'"
              class="row q-col-gutter-md"
            >
              <q-card-section
                class="flex justify-between no-wrap col-12 col-md-3 q-mb-md-md"
              >
                <q-item
                  class="column items-center full-width"
                  :class="$q.screen.xs || $q.screen.sm ? 'q-py-md' : 'q-py-xl'"
                  :style="{
                    height: $q.screen.xs || $q.screen.sm ? 'auto' : '390px',
                  }"
                >
                  <q-item-section
                    avatar
                    class="q-mb-md q-pr-none column items-center"
                  >
                    <q-avatar size="128px" class="q-mb-md">
                      <q-img
                        class="fit"
                        :src="userStore.userMugShotUrl || ''"
                        spinner-color="white"
                        fit="cover"
                        placeholder-src="~assets/image/mugShotPlaceHolder.png"
                      />
                    </q-avatar>
                    <q-btn
                      size="sm"
                      color="white"
                      text-color="primary"
                      round
                      dense
                      :icon="matCloudUpload"
                      padding="5px 5px"
                      @click="open()"
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
                      </q-tooltip>
                    </q-btn>
                  </q-item-section>

                  <q-item-section class="column items-center q-mb-md">
                    <q-item-label
                      class="q-mb-xs text-bold"
                      style="font-size: 20px; color: #6b6a6a"
                      >{{ userData?.fullname }}</q-item-label
                    >
                    <q-item-label vertical caption style="font-size: 14px"
                      >{{ userStore.roleChName.join("、") }}
                    </q-item-label>
                    <q-item-label vertical caption style="font-size: 14px">
                      {{
                        RoleNameToChName[
                          userStore.marshallingName as keyof typeof RoleNameToChName
                        ]
                      }}
                    </q-item-label>
                  </q-item-section>
                  <div
                    class="flex"
                    :class="
                      $q.screen.xs || $q.screen.sm ? 'q-gutter-md' : 'column'
                    "
                  >
                    <q-btn
                      :outline="showPage !== 'profile'"
                      color="primary"
                      label="基本資料"
                      :class="{ 'q-mb-md': !($q.screen.xs || $q.screen.sm) }"
                      @click="toggleForm('profile')"
                    />
                    <q-btn
                      :outline="showPage !== 'editPassword'"
                      color="primary"
                      label="修改密碼"
                      :class="{ 'q-mb-md': !($q.screen.xs || $q.screen.sm) }"
                      @click="toggleForm('editPassword')"
                    />
                    <q-btn
                      v-if="isWithAddress"
                      :outline="showPage !== 'beControlled'"
                      color="primary"
                      label="附屬帳號"
                      @click="toggleForm('beControlled')"
                    />
                  </div>
                </q-item>
                <q-separator
                  vertical
                  inset
                  v-if="!($q.screen.xs || $q.screen.sm)"
                />
              </q-card-section>
              <q-card-section class="col-12 col-md-9">
                <q-item>
                  <q-item-section>
                    <q-form class="q-gutter-md" @submit="onSubmit">
                      <div class="flex justify-between items-center">
                        <div class="q-py-sm text-bold text-h6">
                          {{
                            showPage === "profile"
                              ? "基本資料"
                              : showPage === "editPassword"
                              ? "修改密碼"
                              : "附屬帳號"
                          }}
                        </div>
                        <Teleport
                          to=".submitArea"
                          v-if="showPage !== 'beControlled'"
                          :disabled="!($q.screen.xs || $q.screen.sm)"
                        >
                          <div
                            :class="{
                              'flex q-pa-md full-width bg-white':
                                $q.screen.xs || $q.screen.sm,
                            }"
                          >
                            <q-btn
                              flat
                              label="取消"
                              class="bg-grey-4 q-mr-md"
                              :class="{
                                'flex-grow-1': $q.screen.xs || $q.screen.sm,
                              }"
                              @click="getUserData"
                            />
                            <q-btn
                              type="submit"
                              color="primary"
                              label="儲存"
                              :class="{
                                'flex-grow-1': $q.screen.xs || $q.screen.sm,
                              }"
                              @click="onSubmit"
                            />
                          </div>
                        </Teleport>
                      </div>
                      <q-separator />
                      <UserForm
                        v-if="showPage !== 'beControlled'"
                        @selectListChange="selectListChange"
                        @getUserData="getUserData"
                        @addOtherPhone="addOtherPhone"
                        :cellPhoneArr="cellPhoneArr"
                        :emgyCellPhoneArr="emgyCellPhoneArr"
                        :tableConfig="tableConfig"
                        :dialogAttrs="dialogAttrs"
                        :isVerifyEmail="true"
                      />
                    </q-form>
                  </q-item-section>
                </q-item>

                <BlockComponent
                  v-if="showPage === 'beControlled'"
                  ref="blockRef"
                  :blockAttrs="tableAttrs"
                  v-on="blockEvent"
                  :isSearch="false"
                  :isCheckbox="false"
                >
                  <template #customTableButtons="scope">
                    <q-btn
                      v-for="(btn, index) in customTableButtons"
                      :key="index"
                      @click="handleClickOption(btn, scope.data)"
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
                </BlockComponent>
              </q-card-section>
            </q-card>

            <!-- 設定 -->
            <template v-if="activeTab.value === 'settings'">
              <div v-if="$q.screen.xs || $q.screen.sm">
                <q-tabs
                  v-model="settingTab"
                  active-color="activeTab"
                  indicator-color="activeTab"
                  narrow-indicator
                  class="mainTabsDesign"
                  active-class="mainTabsActiveClass"
                  content-class="bg-grey-1"
                  active-bg-color="white"
                  outside-arrows
                  mobile-arrows
                >
                  <q-tab
                    name="notificationSetting"
                    :icon="outlinedEditNotifications"
                    label="通知開關設置區"
                  />
                  <q-tab
                    name="customizeScreen"
                    :icon="matSplitscreen"
                    label="自訂手機螢幕畫面"
                  />
                </q-tabs>
                <q-separator />

                <q-tab-panels
                  v-model="settingTab"
                  animated
                  swipeable
                  vertical
                  transition-prev="jump-up"
                  transition-next="jump-up"
                  class="transparent"
                  v-if="$q.screen.xs || $q.screen.sm"
                >
                  <q-tab-panel name="notificationSetting">
                    <div class="q-pl-md">
                      <q-option-group
                        v-model="infoModel"
                        :options="infoOptions"
                        color="primary"
                        type="toggle"
                        size="3rem"
                        left-label
                        @update:model-value="debounceUpdate"
                      >
                        <template #label="{ label }">
                          <div class="text-h6 q-pr-md text-weight-medium">
                            {{ label }}
                          </div>
                        </template>
                      </q-option-group>
                    </div>
                  </q-tab-panel>

                  <q-tab-panel name="customizeScreen">
                    <div class="screenSettingContainer">
                      <template
                        v-if="screenOptions.length && screenModel.length"
                      >
                        <div v-for="index in screenOptions.length" :key="index">
                          <div class="title">螢幕 {{ index }}</div>
                          <draggable
                            v-model="screenOptions[index - 1]"
                            group="people"
                            @start="drag = true"
                            @end="drag = false"
                            item-key="id"
                          >
                            <template #item="{ element }">
                              <q-checkbox
                                v-model="element.selected"
                                :label="element.label"
                                color="primary"
                                class="canHover"
                                @update:model-value="
                                  handleScreenCheckBoxChange(
                                    element.value,
                                    index - 1
                                  )
                                "
                              />
                            </template>
                          </draggable>
                        </div>

                        <q-btn
                          type="submit"
                          color="primary"
                          text-color="white"
                          label="儲存變更"
                          @click.prevent="handleSaveScreenSetting"
                        />
                      </template>

                      <template v-else>
                        <p>未能獲取螢幕資料</p>
                      </template>
                    </div>
                  </q-tab-panel>
                </q-tab-panels>
              </div>
              <q-card
                flat
                style="background: transparent"
                class="flex-nowrap flex-col q-col-gutter-md full-height"
                v-else
              >
                <q-splitter
                  v-model="settingSplitterModel"
                  unit="px"
                  class="flex-grow-1 q-pb-md q-pr-md"
                >
                  <template v-slot:before>
                    <q-tabs
                      v-model="settingTab"
                      vertical
                      active-color="primary"
                      active-bg-color="grey-4"
                    >
                      <q-tab
                        name="notificationSetting"
                        :icon="outlinedEditNotifications"
                        label="通知開關設置區"
                      />
                      <q-tab
                        name="customizeScreen"
                        :icon="matSplitscreen"
                        label="自訂手機螢幕畫面"
                      />
                    </q-tabs>
                  </template>

                  <template v-slot:after>
                    <q-tab-panels
                      v-model="settingTab"
                      animated
                      swipeable
                      vertical
                      transition-prev="jump-up"
                      transition-next="jump-up"
                      class="transparent"
                    >
                      <q-tab-panel name="notificationSetting">
                        <div class="q-pl-md">
                          <q-option-group
                            v-model="infoModel"
                            :options="infoOptions"
                            color="primary"
                            type="toggle"
                            size="3rem"
                            left-label
                            @update:model-value="debounceUpdate"
                          >
                            <template #label="{ label }">
                              <div class="text-h6 q-pr-md text-weight-medium">
                                {{ label }}
                              </div>
                            </template>
                          </q-option-group>
                        </div>
                      </q-tab-panel>

                      <q-tab-panel name="customizeScreen">
                        <div class="screenSettingContainer">
                          <template
                            v-if="screenOptions.length && screenModel.length"
                          >
                            <div
                              v-for="index in screenOptions.length"
                              :key="index"
                            >
                              <div class="title">螢幕 {{ index }}</div>
                              <draggable
                                v-model="screenOptions[index - 1]"
                                group="people"
                                @start="drag = true"
                                @end="drag = false"
                                item-key="id"
                              >
                                <template #item="{ element }">
                                  <q-checkbox
                                    v-model="element.selected"
                                    :label="element.label"
                                    color="primary"
                                    class="canHover"
                                    @update:model-value="
                                      handleScreenCheckBoxChange(
                                        element.value,
                                        index - 1
                                      )
                                    "
                                  />
                                </template>
                              </draggable>
                            </div>

                            <q-btn
                              type="submit"
                              color="primary"
                              text-color="white"
                              label="儲存變更"
                              @click.prevent="handleSaveScreenSetting"
                            />
                          </template>

                          <template v-else>
                            <p>未能獲取螢幕資料</p>
                          </template>
                        </div>
                      </q-tab-panel>
                    </q-tab-panels>
                  </template>
                </q-splitter>
              </q-card>
            </template>

            <!-- 地址資料 -->
            <q-card
              flat
              style="background: transparent"
              v-if="activeTab.value === 'addressplate'"
              class="flex-nowrap flex-col q-col-gutter-md full-height"
              :class="{ 'q-pr-md': $q.screen.xs || $q.screen.sm }"
            >
              <BlockComponent
                ref="blockRef"
                :blockAttrs="tableAttrs"
                v-on="blockEvent"
                :isSearch="false"
              />
            </q-card>
          </q-tab-panel>
        </q-tab-panels>
        <div
          class="submitArea"
          :style="
            $q.screen.xs || $q.screen.sm ? 'border-top: solid 1px #ddd' : ''
          "
        />
      </div>
    </div>
  </q-page>

  <DialogForm
    :dialogAttrs="dialogAttrs"
    :blockAttrs="tableAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  >
    <template #default="{ data }" v-if="showPage === 'beControlled'">
      <UserForm
        ref="userFormRef"
        v-if="dialogAttrs.visible"
        @selectListChange="selectListChange"
        @addOtherPhone="addOtherPhone"
        :cellPhoneArr="cellPhoneArr"
        :emgyCellPhoneArr="emgyCellPhoneArr"
        :tableConfig="beControlledDataConfig"
        :dialogAttrs="data"
      />
    </template>
    <template #default v-else-if="activeTab.value === 'addressplate'">
      <div v-for="config in tableAttrs.tableConfig" :key="config.name">
        <div v-if="config.isDialogForm">
          <div
            v-if="
              config.name === 'inspectionPlaceSelf' ||
              config.name === 'publicPlaceSelf'
            "
            class="q-mb-sm"
          >
            <span class="text-h6 text-bold">{{
              config.name === "inspectionPlaceSelf" ? "檢修申報" : "公安申報"
            }}</span>
            <q-separator class="q-pb-xs q-mb-md q-mt-sm" />
          </div>
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
          <!-- 單選select -->
          <q-select
            clearable
            :disable="config.disable"
            v-if="config.formType === 'selectString'"
            v-model="dialogAttrs.tempData[config.name]"
            :options="dialogAttrs.selectOption"
            :label="config.label + (config.required ? ' *' : '')"
            @focus="selectListChange(config.name)"
            @update:model-value="
              $emit('updateLatestData', dialogAttrs.tempData)
            "
            :rules="[(val: any) => config.required ? !!val : typeof val === 'object'|| !val ? true :false || config.message ? config.message :`請輸入 ${config.label}`]"
          >
            <template v-slot:selected-item="scope">
              <span>{{ scope.opt.fullname || scope.opt.label }}</span>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{
                    scope.opt.fullname || scope.opt.label
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

          <div v-if="config.formType === 'radioOption'">
            {{ config.label + (config.required ? " *" : "") }}

            <q-field
              :disable="config.disable"
              hide-bottom-space
              borderless
              item-aligned
              :model-value="dialogAttrs.tempData[config.name]"
              class="QField q-pa-none"
              lazy-rules
              :rules="[(val: any) => config.required ? val !== undefined : true ]"
            >
              <template v-slot:default>
                <q-option-group
                  v-model="dialogAttrs.tempData[config.name]"
                  :options="declareRadioOptions(config.name)"
                  color="primary"
                  inline
                  dense
                  @update:model-value="
                    declareOptionAction(
                      config.name,
                      dialogAttrs.tempData[config.name],
                      tableAttrs.tableConfig,
                      dialogAttrs.status
                    )
                  "
                >
                  <template v-slot:label="opt">
                    <div class="row items-center">
                      <q-input
                        @click.stop
                        v-if="opt.value === 2"
                        dense
                        v-model="
                          dialogAttrs.tempData[
                            config.name === 'inspectionPlaceRemind'
                              ? 'inspectionPlaceDays'
                              : 'publicPlaceDays'
                          ]
                        "
                        :placeholder="'自訂天數'"
                        style="width: 100px"
                        ><template v-slot:append>
                          <span class="text-subtitle1">天</span>
                        </template></q-input
                      >
                      <span else>{{ opt.label }}</span>
                    </div>
                  </template>
                </q-option-group>
              </template>

              <template v-slot:error>
                {{ config.message }}
              </template>
            </q-field>
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
    </template>
  </DialogForm>

  <q-dialog v-model="toUserVisible" v-if="toUserObj">
    <q-card style="min-width: 350px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">升級一般帳號</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-input v-model="toUserObj.username" label="帳號" />
        <q-input v-model="toUserObj.password" label="密碼" />
      </q-card-section>

      <q-card-section align="center">
        <q-btn color="primary" label="送出" @click="handleToUser" />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import draggable from "vuedraggable";
// api
import AccountSetting, {
  AccountRequest,
  UserViewModel,
} from "src/api/accountSetting";
import AddressPlate, {
  AddressPlateViewModel,
  addressPlatesConfig,
} from "src/api/addressPlate";
import UserAccount, { beControlledDataConfig } from "src/api/userAccount";
import User, { userDataConfig, passwordConfig } from "src/api/user";
import System, { systemType } from "src/api/system";
import AddressplateValidate from "src/api/AddressplateVerify";
// constant
import screenData from "src/constant/screenData";

// utils
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import cellPhoneMixin from "src/utils/cellPhoneMixin";
import FileReadMixin from "src/utils/fileRead";
import declareMixin from "src/utils/declareMixin";
import { RoleNameToChName } from "src/stores/signalR";
import type {
  blockAttrsType,
  blockRefType,
  tempDataType,
} from "src/utils/tableMixin";
import {
  maskToNumberArrayAndUpdateToModel,
  numberToBitMask,
  flagOption,
} from "src/utils/bitMask";
import { useCloned, useDebounceFn, useFileDialog } from "@vueuse/core";

// icon
import { matCloudUpload, matSplitscreen } from "@quasar/extras/material-icons";
import { outlinedEditNotifications } from "@quasar/extras/material-icons-outlined";
import { mdiAccountArrowUp } from "@quasar/extras/mdi-v6";
// pinia store
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/user";
const userStore = useUserStore();
const { roleName } = storeToRefs(userStore);

const $q = inject("$q") as typeof QVueGlobals;

const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "個人資料",
    value: "profile",
  },
  {
    label: "設定",
    value: "settings",
  },
  {
    label: "地址資料",
    value: "addressplate",
  },
];

const blockRef = ref<blockRefType>();
const tableConfig = ref<blockAttrsType["tableConfig"]>([]);
const {
  dialogAttrs,
  tableAttrs,
  blockAttrs,
  handleSelectArray,
  handleBlockMixin,
  handleDialogMixin,
  getTableMixin,
  hideDialog,
} = tableMixin();
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
    changeBlockData: getTableData,
  };
});
// 申報相關
const { declareRadioOptions, declareOptionAction } = declareMixin();
// 附屬帳號升級
const toUserVisible = ref(false);
const toUserObj = ref<AccountRequest>();
async function handleToUser() {
  if (toUserObj.value) {
    const result = (await AccountSetting.apiPatchAccountToUser([
      toUserObj.value,
    ])) as typeof AxiosResponse;
    if (result.data[toUserObj.value.id]) {
      $q.notify({
        type: "positive",
        message: "升級成功",
        position: "top",
      });
      toUserVisible.value = false;

      await getTableMixin(UserAccount, {
        filters: "",
        page: 1,
        rowsPerPage: 25,
        userId: userData.value?.id,
      });
      toUserObj.value = {
        id: 0,
        username: "",
        password: "",
      };
    } else {
      $q.notify({
        type: "negative",
        message: "升級失敗",
        position: "top",
      });
    }
  }
}
async function handleBlock<T>(
  btn: { label: string; icon: string; status: string },
  data: T extends AddressPlateViewModel ? AddressPlateViewModel : tempDataType
) {
  if (showPage.value === "beControlled") {
    const accountsMugShotFileConfigObj = beControlledDataConfig.find(
      (item) => item.name === "mugShotFileId"
    );
    if (btn.status === "edit") {
      if (accountsMugShotFileConfigObj) {
        accountsMugShotFileConfigObj.isDialogForm = true;
      }
      readPhoneNumber(data);
    } else if (btn.status === "toUser") {
      toUserVisible.value = true;
      if (toUserObj.value && data.id) toUserObj.value.id = data.id;
    }

    await handleBlockMixin(btn, data, UserAccount, getTableData);
    if (btn.status === "add") {
      cellPhoneArr.value = [""];
      emgyCellPhoneArr.value = [""];
      dialogAttrs.value.tempData.isDisability = false;
      if (accountsMugShotFileConfigObj) {
        accountsMugShotFileConfigObj.isDialogForm = false;
      }
    }
  } else if (activeTab.value?.value === "addressplate") {
    if (btn.status !== "add") {
      // 檢修申報
      declareOptionAction(
        "use",
        data.use,
        tableAttrs.value.tableConfig,
        btn.status
      );
      declareOptionAction(
        "purpose",
        data.purpose,
        tableAttrs.value.tableConfig,
        btn.status
      );

      data.inspectionPlaceDate = data.inspectionPlaceJob?.date;
      data.inspectionPlaceRemind = data.inspectionPlaceJob?.remind;
      data.inspectionPlaceDays = data.inspectionPlaceJob?.days;
      // 公安申報
      data.publicPlaceDate = data.publicPlaceJob?.date;
      data.publicPlaceRemind = data.publicPlaceJob?.remind;
      data.publicPlaceDays = data.publicPlaceJob?.days;
    }
    handleBlockMixin(btn, data, AddressPlate, getTableData);

    if (btn.status === "add") {
      dialogAttrs.value.tempData.inspectionPlaceSelf = false;
      dialogAttrs.value.tempData.publicPlaceSelf = false;
    }
  }
}
async function handleDialog(
  status: string,
  tempData: AddressPlateViewModel & { user?: UserViewModel }
) {
  if (showPage.value === "beControlled") {
    formatPhoneNumber(tempData);
    tempData.user = userData.value;
    handleDialogMixin(status, UserAccount, getTableData, tempData);
    readPhoneNumber(tempData);
  } else if (activeTab.value.value === "addressplate") {
    if (tempData.inspectionPlaceDate && tempData.inspectionPlaceRemind) {
      tempData.inspectionPlaceJob = {
        date: tempData.inspectionPlaceDate,
        remind: tempData.inspectionPlaceRemind,
        days: tempData.inspectionPlaceDays,
        current: new Date(),
        completed: false,
        next: new Date(),
      };
    }
    if (tempData.publicPlaceDate && tempData.publicPlaceRemind) {
      tempData.publicPlaceJob = {
        date: tempData.publicPlaceDate,
        remind: tempData.publicPlaceRemind,
        days: tempData.publicPlaceDays,
        current: new Date(),
        completed: false,
        next: new Date(),
      };
    }
    handleDialogMixin(status, AddressPlate, getTableData, tempData);
  }
}
async function getTableData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 25,
  }
) {
  if (activeTab.value.value === "addressplate") {
    dialogAttrs.value.dialogTitle = "地址資料";
    tableAttrs.value.tableConfig = addressPlatesConfig;
    tableAttrs.value.headerButtons = ["add", "deleteMany"];
    tableAttrs.value.tableButtons = [];
    const result = (await AddressPlate.apiGetDataByUser(
      pagination
    )) as typeof AxiosResponse;

    // 判斷當前用戶是否為該地址戶長
    result.data.rows?.forEach(async (item: { id: number }) => {
      const result = (await AddressplateValidate.apiUserIsHead(
        item.id
      )) as typeof AxiosResponse;
      if (result.data) {
        tableAttrs.value.tableButtons = ["edit", "delete"];
      }
    });
    tableAttrs.value.blockData = result.data.rows;
    tableAttrs.value.totalNum = result.data.rowsNumber;
    console.log("tableAttrs.value.blockData", tableAttrs.value.blockData);
  } else if (showPage.value === "beControlled") {
    dialogAttrs.value.dialogTitle = "附屬帳號";
    tableAttrs.value.tableConfig = beControlledDataConfig;
    tableAttrs.value.headerButtons = ["add"];
    tableAttrs.value.tableButtons = ["edit", "delete"];
    pagination.userId = userData.value?.id;
    await getTableMixin(UserAccount, pagination);
  }
  setBlockLoading(blockRef);
}
const API = User;
function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log("tabChange", tab);
  if (activeTab.value.value !== tab.value) activeTab.value.value = tab.value;
  activeTab.value.label = tab.label;
  if (activeTab.value.value === "profile") {
    tableConfig.value = userDataConfig;
    if (!showPage.value) showPage.value = "profile";
  } else {
    showPage.value = "";
  }
}

// 取得 userData
const { getFile } = FileReadMixin();
const userData = ref<UserViewModel>();
const { files, open } = useFileDialog();

watch(files, async (files) => {
  if (files) {
    await updateHeadShotPhoto(files[0]);
  }
});

// 上傳大頭貼
async function updateHeadShotPhoto(headShotData: File) {
  const { name } = headShotData;
  const formData = new FormData();
  formData.append("file", headShotData, name);
  const result = (await User.apiUploadHeadShot(
    formData
  )) as typeof AxiosResponse;
  if (result.data) {
    $q.notify({
      type: "positive",
      message: "上傳成功",
      position: "top",
    });
    userStore.userMugShotUrl = await getFile(result.data, null);
  } else {
    $q.notify({
      type: "negative",
      message: "上傳失敗",
      position: "top",
    });
  }
}

// 包含地址驗證的帳號
const withAddressRolesArr = ["Landlord", "Member", "User"];
const isWithAddress = ref(false);
async function getUserData() {
  dialogAttrs.value.status = "edit";

  await userStore.getUserData();
  if (userStore.userData) {
    dialogAttrs.value.tempData = useCloned(userStore.userData).cloned.value;
  }
  if (!dialogAttrs.value.tempData.isDisability) {
    dialogAttrs.value.tempData.isDisability = false;
  }

  userData.value = useCloned(
    dialogAttrs.value.tempData as UserViewModel
  ).cloned.value;
  readPhoneNumber(dialogAttrs.value.tempData);
  for (let i = 0; i < roleName.value?.length; i++) {
    const role = roleName.value[i];
    if (withAddressRolesArr.includes(role)) {
      isWithAddress.value = true;
    }
  }
}

const showPage = ref("profile");
function toggleForm(status: string) {
  showPage.value = status;
  if (status === "editPassword") {
    dialogAttrs.value.tempData = {};

    tableConfig.value = passwordConfig;
  } else if (status === "profile") {
    getUserData();
    tableConfig.value = userDataConfig;
  }
}
async function patchUserData() {
  const result = (await API.apiPatchData(
    dialogAttrs.value.tempData as UserViewModel
  )) as typeof AxiosResponse;
  if (result.data) {
    $q.notify({
      type: "positive",
      message: "修改成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "修改失敗",
      position: "top",
    });
  }
  getUserData();
}
async function onSubmit() {
  if (showPage.value === "profile") {
    // 修改個人資料
    if (Object.keys(dialogAttrs.value.tempData).length > 0) {
      formatPhoneNumber(dialogAttrs.value.tempData);
      patchUserData();
      readPhoneNumber(dialogAttrs.value.tempData);
    }
  } else if (showPage.value === "editPassword") {
    const result = (await API.apiPatchPassword(
      dialogAttrs.value.tempData.currentPassword,
      dialogAttrs.value.tempData.newPassword
    )) as typeof AxiosResponse;
    if (result.data) {
      $q.notify({
        type: "positive",
        message: "修改成功",
        position: "top",
      });
      // p@$$w0rd
      toggleForm("profile");
      showPage.value = "profile";
    } else {
      $q.notify({
        type: "negative",
        message: "修改失敗",
        position: "top",
      });
    }
  }
}

onMounted(() => {
  tabChange(blockTabs[0]);
  getUserData();
});

// 電話號碼處理
const {
  cellPhoneArr,
  emgyCellPhoneArr,
  addOtherPhone,
  readPhoneNumber,
  formatPhoneNumber,
} = cellPhoneMixin(dialogAttrs.value);

// 下拉選單
async function selectListChange(props: string) {
  console.log("selectListChange", props);
  if (props === "inspectionPlaceDate") {
    const result = (await System.apiGetSystemItem(
      systemType.InspectionTypeOfTime
    )) as typeof AxiosResponse;
    dialogAttrs.value.selectOption = result.data;
  } else if (props === "publicPlaceDate") {
    const result = (await System.apiGetSystemItem(
      systemType.PublicSafeTypeOfTime
    )) as typeof AxiosResponse;
    dialogAttrs.value.selectOption = result.data;
  }
}

// 設定 tab
const settingSplitterModel = ref(200);
const settingTab = ref("notificationSetting");

// 通知開關設置區
const infoModel = ref<number[]>([]);

const infoOptions = reactive<flagOption[]>([
  {
    label: "個人資料異動通知",
    value: 1,
  },
  {
    label: "設備登入異動通知",
    value: 2,
  },
  {
    label: "家庭成員異動通知",
    value: 4,
  },
  {
    label: "公告欄通知",
    value: 8,
  },
]);

watch(
  () => userStore.userData,
  (newValue, oldValue) => {
    if (newValue) {
      // 把得到的 mask 轉換並更新 infoModel
      if (newValue) {
        if (!oldValue) {
          const { switchs } = newValue;
          maskToNumberArrayAndUpdateToModel(switchs, infoModel, infoOptions);
          console.log("now", infoModel.value);
        } else if (newValue.switchs !== oldValue.switchs) {
          const { switchs } = newValue;
          maskToNumberArrayAndUpdateToModel(switchs, infoModel, infoOptions);
          console.log("now", infoModel.value);
        }
      }
    }
  },
  { immediate: true, deep: true }
);
const debounceUpdate = useDebounceFn(updateInfoModel, 500);
async function updateInfoModel(arr: number[]) {
  const mask = numberToBitMask(arr);
  try {
    const result = (await User.apiPatchSwitch(mask)) as typeof AxiosResponse;
    if (result.data) {
      $q.notify({
        type: "positive",
        message: "更新成功",
        position: "top",
      });
    }
  } catch {
    const errorMsg = "更新通知設置失敗";
    $q.notify({
      type: "negative",
      message: errorMsg,
      position: "top",
    });
    console.error(errorMsg);
  }
}

// 螢幕設定
interface Option {
  label: string;
  value: string;
  selected?: boolean;
}
onMounted(async () => {
  const result = (await User.apiGetScreenSettings()) as typeof AxiosResponse;
  if (result.data) {
    dataFromServer.value = result.data;
    const permissionArray = Object.values(result.data).flat();
    authorizedScreen.value = screenData.filter((screen) =>
      permissionArray.includes(screen.value)
    );
  }

  screenOptions.length = 0;
  Object.values(dataFromServer.value).forEach((value) => {
    screenModel.push(value);
    const clonedServerData = useCloned(value).cloned.value;
    const clonedPermissionOption = useCloned(authorizedScreen.value).cloned
      .value;
    const screenData: Option[] = [];
    clonedServerData.forEach((data) => {
      const index = clonedPermissionOption.findIndex(
        (option) => option.value === data
      );
      clonedPermissionOption[index].selected = true;
      screenData.push(clonedPermissionOption[index]);
      clonedPermissionOption.splice(index, 1);
    });
    clonedPermissionOption.forEach((option) => {
      option.selected = false;
    });
    screenData.push(...clonedPermissionOption);

    screenOptions.push(screenData);
  });
});
const drag = ref(false);
const screenModel = reactive<string[][]>([]);
const dataFromServer = ref({
  1: ["EvacuationGuideMap", "FireFloorPlan", "EmergencyCenterMessage"],
  2: ["CameraScreen", "EquipmentActionStatus"],
});
const authorizedScreen = ref<Option[]>([]);

const screenOptions = reactive<Option[][]>([]);
// 篩選讓螢幕選擇為唯一值
let isChanging = false;
function handleScreenCheckBoxChange(value: string, index: number) {
  if (isChanging) return;
  isChanging = true;
  if (index === 0) {
    const screen = screenOptions[1].find((item) => item.value === value);
    if (screen && screen.selected !== null) {
      screen.selected = !screen.selected;
    }
  } else {
    const screen = screenOptions[0].find((item) => item.value === value);
    if (screen && screen.selected !== null) {
      screen.selected = !screen.selected;
    }
  }
  nextTick(() => {
    isChanging = false;
  });
}
function handleSaveScreenSetting() {
  const data: { [key: string]: string[] } = {};
  screenOptions.forEach((screen, index) => {
    const key = index + 1;
    data[key] = [];
    screen.forEach((option) => {
      if (option.selected) {
        data[key].push(option.value);
      }
    });
  });
  $q.dialog({
    title: "提示",
    message: "確定要儲存更動的資料嗎?",
    persistent: true,
    ok: {
      push: true,
      label: "確定",
    },
    cancel: "取消",
  }).onOk(async () => {
    const result = (await User.apiChangeScreenSettings(
      data
    )) as typeof AxiosResponse;
    if (result.data) {
      $q.notify({
        type: "positive",
        message: "儲存成功",
        position: "top",
      });
    } else {
      $q.notify({
        type: "negative",
        message: "儲存失敗",
        position: "top",
      });
    }
  });
}

// 客製 button
const customTableButtons = ref([
  {
    label: "升級成一般帳號",
    icon: mdiAccountArrowUp,
    status: "toUser",
    isShow: true,
  },
]);

function handleClickOption(
  btn: {
    label: string;
    icon: string;
    status: string;
  },
  data?: AddressPlateViewModel
) {
  console.log("handleClickOption", { btn, data });
  if (data) {
    handleBlock<AddressPlateViewModel>(btn, data);
  } else {
    handleBlock<AddressPlateViewModel[]>(btn, dialogAttrs.value.selectArray);
  }
}
</script>

<style lang="scss" scoped>
.screenSettingContainer {
  width: fit-content;
  display: grid;
  gap: 2rem;
  font-size: clamp(1rem, 1vw, 1.1rem);
  .title {
    font-size: 1.15rem;
    font-weight: 600;
  }
  .q-btn {
    justify-self: flex-end;
    margin-top: 1rem;
  }
}
.canHover {
  cursor: grab;
  padding-right: 1rem;
  transition: background-color 0.3s;
  border-radius: 0.24rem;
  &:hover {
    background-color: #d1d0d0b4;
  }
}
</style>
