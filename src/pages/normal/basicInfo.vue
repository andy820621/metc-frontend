<template>
  <q-page class="q-pa-md row wrap">
    <h3
      v-if="$q.screen.xs || $q.screen.sm"
      class="text-left text-bold"
      style="font-size: 1.55rem; margin: 0"
    >
      基本資料
    </h3>
    <q-card class="col-12 q-my-md" style="height: 700px">
      <q-tabs
        v-model="activeTab.value"
        :class="
          $q.screen.xs || $q.screen.sm ? 'twoTabsPerRow' : 'mainTabsDesign'
        "
        :active-class="
          $q.screen.xs || $q.screen.sm ? undefined : 'mainTabsActiveClass'
        "
        active-color="activeTab"
        indicator-color="activeTab"
        :active-bg-color="$q.screen.xs || $q.screen.sm ? undefined : 'white'"
        content-class="bg-grey-1"
        align="justify"
        narrow-indicator
        outside-arrows
        inline-label
      >
        <q-tab
          v-for="(tab, index) in blockTabs"
          :key="index"
          :name="tab.value"
          :label="tab.label"
          :icon="
            $q.screen.xs || $q.screen.sm
              ? undefined
              : tab.value === activeTab.value
              ? mdiCheckCircle
              : ''
          "
          @click="tabChange(tab)"
        />
      </q-tabs>

      <q-separator />

      <q-tab-panels
        v-model="activeTab.value"
        animated
        :style="{
          height:
            $q.screen.xs || $q.screen.sm
              ? 'calc(100% - 150px)'
              : 'calc(100% - 50px)',
        }"
      >
        <q-tab-panel
          v-for="(tab, index) in blockTabs"
          :key="index"
          :name="tab.value"
        >
          <template v-if="tab.value === 'buildingRelevantData'">
            <div class="q-px-md">
              <FileUpload
                :containerHeight="$q.screen.xs || $q.screen.sm ? 538 : 650"
                :root="rootForBuilding"
                :highlightObj="buildingHighlightObj"
              >
                <template #btn="{ fullPath, fileModelArray }">
                  <q-btn
                    type="submit"
                    color="primary"
                    text-color="white"
                    label="防護計劃書"
                    @click.prevent="
                      setAsProtectionPlan(fullPath, fileModelArray)
                    "
                    v-close-popup
                  />
                  <q-btn
                    type="submit"
                    color="primary"
                    text-color="white"
                    label="組織架構圖"
                    @click.prevent="
                      setAsOrganizationChart(fullPath, fileModelArray)
                    "
                    v-close-popup
                  />
                </template>
              </FileUpload>
            </div>
          </template>
          <template v-else>
            <BlockComponent
              ref="blockRef"
              :blockAttrs="blockAttrs"
              v-on="blockEvent"
              v-model:filters="filters"
              custom-height="calc(100% - 30px)"
            >
              <template #customBlockField="{ data, config }">
                <div v-if="config.name === 'fullname'">
                  <span class="q-mr-sm">
                    {{ data.fullname }}
                  </span>
                  <span>
                    <q-btn
                      v-if="typeof data?.id === 'number'"
                      flat
                      size="xs"
                      text-color="white"
                      dense
                      padding="2px 4px"
                      class="text-bold q-mr-sm"
                      style="font-size: 12px; background: #d1cd57"
                    >
                      <span>附</span>
                      <q-tooltip
                        class="text-body2"
                        transition-show="scale"
                        transition-hide="scale"
                        anchor="top middle"
                        self="bottom middle"
                        :offset="[10, 10]"
                      >
                        附屬帳號
                      </q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      v-if="data.isDisability"
                      size="sm"
                      text-color="white"
                      dense
                      :icon="mdiWheelchair"
                      padding="3px 2px"
                      class="bg-positive"
                    >
                      <q-tooltip
                        class="text-body2"
                        transition-show="scale"
                        transition-hide="scale"
                        anchor="top middle"
                        self="bottom middle"
                        :offset="[10, 10]"
                      >
                        行動不便者
                      </q-tooltip>
                    </q-btn>
                  </span>
                </div>
              </template>
              <template
                #customCenterSlot
                v-if="activeTab.value === 'managementCommittee'"
              >
                <q-select
                  style="min-width: 250px"
                  :class="$q.screen.xs || $q.screen.sm ? 'q-mb-md' : ''"
                  dense
                  v-model="committeeModel"
                  :options="committeeOptions"
                  :option-label="(option) => `第 ${option.number} 屆管委會`"
                  :hint="
                    committeeModel
                      ? `期間: ${committeeModel.start} 至 ${committeeModel.end}`
                      : ''
                  "
                />
              </template>
              <template
                v-if="
                  tab.value === 'residentData' ||
                  tab.value === 'managementCommittee'
                "
                #customHeaderButtons
              >
                <q-btn
                  v-for="(btn, index) in customHeaderButtons"
                  :key="index"
                  @click="handleClickOption(btn)"
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
          </template>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>

    <div class="row col-grow" style="min-height: 700px; gap: 1.2rem">
      <FloorsForBasicInfo
        v-if="!($q.screen.xs || $q.screen.sm)"
        class="full-height"
        ref="floorsForBasicInfo"
        @handleSelect="handleSelect"
      />
      <div
        v-else
        class="flex items-center overflow-hidden full-width rounded-lg q-md-mt-lg"
      >
        <div
          class="flex-grow-1 bg-primary text-white q-pa-sm text-center text-bold fz-16"
        >
          樓層
        </div>
        <AllFloors
          ref="floorsForBasicInfo"
          dense
          filled
          @handleSelect="handleSelect"
          :initialStyle="false"
          class="flex-grow-1"
        />
      </div>
      <q-card
        class="col-grow overflow-hidden"
        :style="{ height: $q.screen.xs || $q.screen.sm ? '90%' : 'auto' }"
      >
        <q-tabs
          v-model="activeFloorTab.value"
          :class="
            $q.screen.xs || $q.screen.sm ? 'twoTabsPerRow' : 'mainTabsDesign'
          "
          :active-class="
            $q.screen.xs || $q.screen.sm ? undefined : 'mainTabsActiveClass'
          "
          active-color="activeTab"
          indicator-color="activeTab"
          :active-bg-color="$q.screen.xs || $q.screen.sm ? undefined : 'white'"
          content-class="bg-grey-1"
          align="justify"
          narrow-indicator
          outside-arrows
          inline-label
        >
          <q-tab
            v-for="(tab, index) in floorBlockTabs"
            :key="index"
            :name="tab.value"
            :label="tab.label"
            :icon="
              $q.screen.xs || $q.screen.sm
                ? undefined
                : tab.value === activeFloorTab.value
                ? mdiCheckCircle
                : ''
            "
            @click="floorTabChange(tab)"
          />
        </q-tabs>

        <q-separator />

        <q-tab-panels
          v-model="activeFloorTab.value"
          animated
          swipeable
          :style="{
            height:
              $q.screen.xs || $q.screen.sm
                ? 'calc(100% - 150px)'
                : 'calc(100% - 50px)',
          }"
          keep-alive
        >
          <q-tab-panel
            v-for="(tab, index) in floorBlockTabs"
            :key="index"
            :name="tab.value"
          >
            <template v-if="tab.value === 'floorAddressData'">
              <BlockComponent
                ref="floorBlockRef"
                v-model:filters="floorFilters"
                :expandAttrs="floorExpandAttrs"
                :blockAttrs="floorBlockAttrs"
                v-on="floorBlockEvent"
                :custom-height="
                  $q.screen.xs || $q.screen.sm
                    ? 'calc(100% - 50px)'
                    : 'calc(100% - 25px)'
                "
              >
              </BlockComponent>
            </template>
            <template v-if="tab.value === 'floorPlan'">
              <q-img
                v-if="floorImageUrl"
                :src="floorImageUrl"
                spinner-color="primary"
                fit="cover"
                position="center"
              />
              <div v-else class="text-center">
                <p class="text-h6">
                  請先到
                  <b
                    class="cursor-pointer text-primary"
                    @click="activeFloorTab.value = 'floorRelatedData'"
                  >
                    樓層相關資料
                  </b>
                  設定該樓層平面圖
                </p>
              </div>
            </template>
            <template v-if="tab.value === 'floorRelatedData'">
              <div class="q-px-md">
                <FileUpload
                  :containerHeight="$q.screen.xs || $q.screen.sm ? 450 : 790"
                  :root="rootForFloor"
                  :highlightObj="highlightObj"
                >
                  <template #btn="{ fullPath, fileModelArray }">
                    <q-btn
                      type="submit"
                      color="primary"
                      text-color="white"
                      label="避難引導圖"
                      @click.prevent="
                        setEvacuationFloorPlan(fullPath, fileModelArray)
                      "
                      v-close-popup
                    />
                    <q-btn
                      type="submit"
                      color="primary"
                      text-color="white"
                      label="起火樓層平面圖"
                      @click.prevent="
                        setFireFloorPlan(fullPath, fileModelArray)
                      "
                      v-close-popup
                    />
                  </template>
                </FileUpload>
              </div>
            </template>
          </q-tab-panel>
        </q-tab-panels>
      </q-card>
    </div>
  </q-page>

  <template>
    <DialogForm
      :dialogAttrs="dialogAttrs"
      :blockAttrs="blockAttrs"
      @hide="hideDialog"
      v-on="dialogEvent"
    >
      <template v-if="activeTab.value === 'supplierData'">
        <div>
          <q-select
            clearable
            v-model="dialogAttrs.tempData.system"
            label="類別 *"
            :options="dialogAttrs.selectOption"
            @focus="selectListChange('system')"
            :rules="[(val) => !!val || '此欄位不得為空']"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> 尚無資料 </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div>
          <q-input
            v-model="dialogAttrs.tempData.name"
            label="公司名稱 *"
            :rules="[(val) => !!val || '此欄位不得為空']"
          />
        </div>
        <div>
          <q-input
            v-model="dialogAttrs.tempData.businessProjects"
            label="經營項目"
            type="textarea"
            autogrow
          />
        </div>
        <!-- 聯絡人 -->
        <div class="separator">聯絡人</div>
        <div style="margin: -1rem 0 0 1rem">
          <q-input v-model="dialogAttrs.tempData.contactName" label="姓名" />
        </div>
        <q-input
          v-model="dialogAttrs.tempData.contactNumber"
          label="電話"
          :mask="phoneRulesMask(dialogAttrs.tempData)"
          unmasked-value
          lazy-rules
          :rules="[phoneRules]"
          @keydown="handleKeydown"
        />
        <div style="margin: -0.24rem 0 0 1rem">
          <q-input
            v-model="dialogAttrs.tempData.contactPhoneNumber"
            label="手機號碼"
            mask="####-###-###"
            unmasked-value
            lazy-rules
            hint="格式: 09xx-xxx-xxx"
            :rules="[mobilePhoneRules]"
          />
        </div>
        <div style="margin: -0.24rem 0 -0.8rem 1rem">
          <q-input
            type="email"
            v-model="dialogAttrs.tempData.contactEmail"
            label="Email"
            lazy-rules
            :rules="[
              (val) =>
                val ? emailRegex.test(val) || '請輸入正確的信箱格式' : true,
            ]"
          />
        </div>
        <!-- 主管 -->
        <div class="separator">主管</div>
        <div style="margin: -1rem 0 0 1rem">
          <q-input v-model="dialogAttrs.tempData.chargeName" label="姓名" />
        </div>
        <div>
          <q-input
            v-model="dialogAttrs.tempData.chargeNumber"
            label="電話"
            :mask="phoneRulesMask(dialogAttrs.tempData)"
            unmasked-value
            lazy-rules
            :rules="[phoneRules]"
          />
        </div>
        <div style="margin: -0.24rem 0 0 1rem">
          <q-input
            v-model="dialogAttrs.tempData.chargePhoneNumber"
            label="手機號碼"
            mask="####-###-###"
            unmasked-value
            lazy-rules
            hint="格式: 09xx-xxx-xxx"
            :rules="[mobilePhoneRules]"
          />
        </div>
        <div style="margin: -0.24rem 0 0 1rem">
          <q-input
            type="email"
            v-model="dialogAttrs.tempData.chargeEmail"
            label="Email"
            lazy-rules
            :rules="[
              (val) =>
                val ? emailRegex.test(val) || '請輸入正確的信箱格式' : true,
            ]"
          />
        </div>
        <div style="margin: -0.24rem 0 0 1rem">
          <q-input
            v-model="dialogAttrs.tempData.chargeFaxNumber"
            label="傳真號碼"
            :mask="phoneRulesMask(dialogAttrs.tempData)"
            :rules="[phoneRules]"
          />
        </div>
        <div>
          <q-input v-model="dialogAttrs.tempData.address" label="公司地址" />
        </div>

        <div class="separator">其他</div>
        <div style="margin-top: -1rem">
          <q-select
            :model-value="
              dialogAttrs.tempData.collaborate ? '配合中' : '未配合'
            "
            label="配合狀態"
            :options="dialogAttrs.selectOption"
            @focus="selectListChange('collaborate')"
            @update:model-value="
              (val) => (dialogAttrs.tempData.collaborate = val.value)
            "
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> 尚無資料 </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="q-mb-md">
          <q-input
            v-model="dialogAttrs.tempData.note"
            label="備註"
            type="textarea"
            autogrow
          />
        </div>
      </template>
    </DialogForm>
  </template>

  <!-- 下半部: 樓層 Block Dialog -->
  <DialogForm
    :dialogAttrs="floorDialogAttrs"
    :blockAttrs="floorBlockAttrs"
    @hide="hideFloorDialog"
    v-on="floorDialogEvent"
  >
    <template #default>
      <div v-for="config in floorBlockAttrs.tableConfig" :key="config.name">
        <div v-if="config.isDialogForm">
          <!-- 檢修申報 / 公安申報 -->
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
            v-model="floorDialogAttrs.tempData[config.name]"
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
            v-model="floorDialogAttrs.tempData[config.name]"
            :options="floorDialogAttrs.selectOption"
            :label="config.label + (config.required ? ' *' : '')"
            @focus="floorSelectListChange(config.name)"
            @update:model-value="
              $emit('updateLatestData', floorDialogAttrs.tempData)
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
          <!-- 多選select -->
          <q-select
            :disable="config.disable"
            v-if="config.formType === 'selectMany'"
            clearable
            multiple
            use-chips
            option-value="id"
            v-model="floorDialogAttrs.tempData[config.name]"
            :options="floorDialogAttrs.selectOption"
            :label="config.label + (config.required ? ' *' : '')"
            @focus="floorSelectListChange(config.name)"
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
                {{ scope.opt.fullname }}
              </q-chip>
            </template>
            <template v-slot:option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.fullname }}</q-item-label>
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
          <!-- Radio Select -->
          <div v-if="config.formType === 'radioOption'">
            {{ config.label + (config.required ? " *" : "") }}

            <q-field
              :disable="config.disable"
              hide-bottom-space
              borderless
              item-aligned
              :model-value="floorDialogAttrs.tempData[config.name]"
              class="QField q-pa-none"
              lazy-rules
              :rules="[(val: any) => config.required ? val !== undefined : true ]"
            >
              <template v-slot:default>
                <q-option-group
                  v-model="floorDialogAttrs.tempData[config.name]"
                  :options="declareRadioOptions(config.name)"
                  color="primary"
                  inline
                  dense
                  @update:model-value="
                    declareOptionAction(
                      config.name,
                      floorDialogAttrs.tempData[config.name],
                      floorBlockAttrs.tableConfig,
                      floorDialogAttrs.status
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
                          floorDialogAttrs.tempData[
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
            v-model="floorDialogAttrs.tempData[config.name]"
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

  <DialogUpload
    :dialogAttrs="floorDialogAttrs"
    rootPathName="AddressPlate"
    rootNameKey="houseNumber"
    @hide="hideFloorDialog"
    v-on="floorDialogEvent"
  />

  <!-- 改選 Dialog -->
  <q-dialog v-model="reElectionDialogModel" @hide="cancelReElection">
    <q-card class="reElectionDialogCard">
      <q-toolbar>
        <q-toolbar-title class="label"> 改選確認 </q-toolbar-title>

        <q-space></q-space>

        <q-btn dense flat icon="close" v-close-popup></q-btn>
      </q-toolbar>

      <q-card-actions class="main">
        <span class="title">請選擇新屆數任期起訖</span>

        <div class="dateBox">
          <DateSelect
            ref="dateSelectFrom"
            dense
            v-model:dateModel="committeeDate.from"
            width="100px"
            :rules="['date']"
          />
          <span class="text">開始</span>
          <DateSelect
            ref="dateSelectTo"
            dense
            v-model:dateModel="committeeDate.to"
            width="100px"
            :rules="['date']"
          />
          <span class="text">結束</span>
        </div>
      </q-card-actions>

      <q-card-actions align="center">
        <q-btn class="q-mr-md" label="取消" @click="cancelReElection" />
        <q-btn color="primary" label="確定" @click="reElectionCommittee" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
// api
import Floors, { FloorViewModel } from "src/api/floors";
import Committee, {
  CommunityUserViewModel,
  committeeConfig,
} from "src/api/managementCommittee";
import SupplierData, { supplierDataConfig } from "src/api/supplierData";
import Files from "src/api/file";
import AccountSetting, {
  UserViewModel,
  residentDataConfig,
  AddressPlateUserViewModel,
  FloorAddressPlateViewModel,
} from "src/api/accountSetting";
import System, { systemType } from "src/api/system";
import AddressPlate, {
  AddressPlateViewModel,
  addressPlatesConfig,
  residentExpandConfig,
} from "src/api/addressPlate";
import Building, { BuildingViewModel } from "src/api/building";
import Role, { RoleViewModel, roleType } from "src/api/role";
import { ApiResponse, FilterColumnLogical } from "src/api/api.type";

// utils
import { useCloned } from "@vueuse/core";
import fileRead from "src/utils/fileRead";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import { birthdayFormatAge } from "src/utils/formatUtils";
import { print, tdContent } from "src/utils/usePrint";
import declareMixin from "src/utils/declareMixin";
import {
  phoneRules,
  mobilePhoneRules,
  phoneRulesMask,
} from "src/utils/quasarRules";
import { dataItem } from "src/components/Dialog/DialogImportExcel.vue";

// type
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
import { mdiWheelchair, mdiHandshakeOutline } from "@quasar/extras/mdi-v7";
import { mdiCheckCircle } from "@quasar/extras/mdi-v6";
// pinia store
import { useBuildingStore } from "src/stores/building";
import { storeToRefs } from "pinia";
import { useUserStore } from "src/stores/user";
import { rolesTempDataType } from "src/components/UserForm.vue";
const userStore = useUserStore();

function handleKeydown(event: KeyboardEvent) {
  if (event.code.startsWith("Numpad") && event.key === "Process") {
    event.preventDefault();
    $q.notify({
      type: "warning",
      message: "您正在使用中文輸入法，請改成英文輸入法輸入，避免不必要的錯誤",
      position: "top",
    });
  }
}
// 驗證 email
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/; // 信箱驗證

const buildingStore = useBuildingStore();
const { Bid, buildingData } = storeToRefs(buildingStore);

// 上半部 table
// Block
const blockRef = ref<blockRefType>();
const {
  dialogAttrs,
  blockAttrs,
  handleBlockMixin,
  handleDialogMixin,
  handleSelectArray,
  hideDialog,
  getDataMixin,
} = tableMixin(blockRef as Ref<blockRefType>);

const blockEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getData,
  };
});
const dialogEvent = computed(() => {
  return {
    handleDialog,
    selectListChange,
    updateLatestData,
    selectStringFilterFn,
  };
});

// 在 block 上的操作
let API: typeof AccountSetting | typeof Committee | typeof SupplierData;
// 取得分頁資料
const { getFile } = fileRead();
async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  if (btn.status === "edit" && (API === AccountSetting || API === Committee)) {
    if (API === Committee) {
      const {
        mugShotFileId,
        phoneNumber,
        contactNumber,
        email,
        roleAddressPlates,
      } = data.user as UserViewModel;
      data.userMugShotUrl = await getFile(null, mugShotFileId);
      data.phone = contactNumber;
      data.phoneNumber = phoneNumber;
      data.email = email;
      data.houseNumber = roleAddressPlates.length
        ? roleAddressPlates
            .flatMap((p) => p.addressPlates.map((a) => a.houseNumber))
            .filter((value, index, self) => self.indexOf(value) === index)
            .join("、")
        : "";
      if (data.houseNumber) {
        data.user.fullname = data.user.fullname + ` (${data.houseNumber})`;
      }
    } else {
      data.userMugShotUrl = await getFile(null, data.mugShotFileId);
    }
  }
  console.log("now data", data);
  handleBlockMixin(btn, data, API, getData);
  // 格式化資料給 exportExcel
  if (btn.status === "exportExcel") {
    $q.loading.show({
      message: "資料加載中...",
      spinnerColor: "warning",
      messageColor: "warning",
    });
    let result;
    if (activeTab.value.value !== "residentData") {
      result = (await API.apiGetData({
        filters: "",
        page: 0,
        rowsPerPage: 0,
      })) as typeof AxiosResponse;
    } else {
      result = (await AccountSetting.apiGetResidentData({
        filters: "",
        page: 0,
        rowsPerPage: 0,
      })) as typeof AxiosResponse;
    }
    $q.loading.hide();
    if (result.data.rows) {
      fullBlockDataForExcel.value = formatBlockData(result.data.rows);
    }
  }
}

// 搜尋篩選物件 (filters)
const { filters: residentDataFilters } =
  searchFiltersGenerator(residentDataConfig);
const { filters: committeeFilters } = searchFiltersGenerator(committeeConfig);
const { filters: supplierDataFilters } =
  searchFiltersGenerator(supplierDataConfig);
const filters = computed(() => {
  if (activeTab.value.value === "residentData") return residentDataFilters;
  else if (activeTab.value.value === "managementCommittee") {
    return committeeFilters;
  } else if (activeTab.value.value === "supplierData") {
    return supplierDataFilters;
  }
  return [];
});

async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  },
  loading?: Ref<boolean>
) {
  console.log("pagination", pagination);
  const payload = useCloned(pagination).cloned.value;

  if (activeTab.value.value === "managementCommittee") {
    if (!committeeModel.value || !committeeModel.value?.id) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      if (!committeeModel.value || !committeeModel.value?.id) {
        $q.notify({
          type: "warning",
          message: "請先選擇管委會",
          position: "top",
        });
        return;
      }
    }
    payload.id = committeeModel.value.id;

    // 產出 filters 物件 (filtersObject)
    const searchText = pagination.filters.trim();
    const filtersObject: FilterColumnCollection[] = generateFiltersObject(
      filters.value,
      searchText,
      "Community"
    );
    const jsonFilters = JSON.stringify(filtersObject);
    payload.filters = jsonFilters;

    await getDataMixin(Committee, payload);
  } else if (activeTab.value.value === "residentData") {
    // 產出 filters 物件 (filtersObject)
    const searchText = pagination.filters.trim();
    const filtersObject: FilterColumnCollection[] = generateFiltersObject(
      filters.value,
      searchText,
      "User"
    );
    const jsonFilters = JSON.stringify(filtersObject);
    payload.filters = jsonFilters;

    if (payload) {
      const result = (await AccountSetting.apiGetResidentData(
        payload
      )) as typeof AxiosResponse;
      if (result.data?.rows) {
        blockAttrs.value.blockData = result.data.rows;
        blockAttrs.value.totalNum = result.data.rowsNumber;
      }
    }
  } else if (activeTab.value.value === "supplierData") {
    // 產出 filters 物件 (filtersObject)
    const searchText = pagination.filters.trim();
    const filtersObject: FilterColumnCollection[] = generateFiltersObject(
      filters.value,
      searchText,
      "Provider"
    );
    // 跳轉用
    if (route.query.search) {
      filtersObject.push({
        logical: FilterColumnLogical.And,
        columns: [
          {
            logical: FilterColumnLogical.And,
            columnKey: {
              fieldName: "Name",
              typeName: "Provider",
            },
            value: String(route.query.search),
          },
        ],
      });
      payload.page = 1;
      payload.rowsPerPage = 0;
    }
    const jsonFilters = JSON.stringify(filtersObject);
    payload.filters = jsonFilters;

    await getDataMixin(API, payload);
  } else {
    await getDataMixin(API, payload);
  }
  setDataForDataConfig(blockAttrs.value.blockData);

  setBlockLoading(blockRef);
}
// 在新增/編輯 dialog 上的操作
async function handleDialog(status: string, data: tempDataType) {
  if (activeTab.value.value === "managementCommittee" && status === "add") {
    data.community = committeeModel.value;
  }

  await handleDialogMixin(status, API, getData, data);
}

const userFormRef = ref<{
  rolesConfig: tableConfigItem[];
  rolesTempData: rolesTempDataType;
}>();

const userFormSelectOption = ref<tempDataType[]>([]);
let originalSelectOptions: any[] = []; // select Filter func 使用
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
    const result = (await Role.apiGetRoles([
      { type: roleType.role, isEmergency: null },
      { type: roleType.class, isEmergency: null },
    ])) as typeof AxiosResponse;

    dialogAttrs.value.selectOption = result.data;
  } else if (props === "system") {
    const result = (await System.apiGetSystemItem(
      systemType.ContactUnitOptions
    )) as typeof AxiosResponse;
    if (result.data) {
      console.log("now result", result.data);
      dialogAttrs.value.selectOption = result.data;
    }
  } else if (props === "collaborate") {
    dialogAttrs.value.selectOption = [
      { label: "配合中", value: true },
      { label: "未配合", value: false },
    ];
  } else if (
    activeTab.value.value === "managementCommittee" &&
    props === "user"
  ) {
    const result = await AccountSetting.apiGetResidentData({
      filters: "",
      page: 1,
      rowsPerPage: 0,
    });
    if (result?.data?.rows) {
      dialogAttrs.value.selectOption = originalSelectOptions = result.data.rows;
    }
  } else if (props === "title") {
    const result = await System.apiGetSystemItem(systemType.CommunityUserTitle);
    if (result.data) {
      console.log("now result", result.data);
      dialogAttrs.value.selectOption = result.data;
    }
  }
}

function selectStringFilterFn(
  inputValue: string,
  doneFn: (func: () => void) => void,
  abortFn: () => void
) {
  setTimeout(() => {
    doneFn(() => {
      const needle = inputValue.toLowerCase();
      dialogAttrs.value.selectOption = originalSelectOptions.filter((option) =>
        option.fullname.toLowerCase().includes(needle)
      );
    });
  }, 800);
}

// Table Custom Buttons
const customHeaderButtons = ref([
  {
    label: "列印全棟住戶資料",
    icon: "print",
    status: "printResidentData",
    isShow: true,
  },
]);

// Table Function
function handleClickOption(btn: {
  label: string;
  icon: string;
  status: string;
}) {
  if (btn.icon === "print") {
    handlePrint();
  } else if (btn.status === "reElection") {
    reElectionDialogModel.value = true;
  }
}

// Tab
const activeTab = ref({
  label: "",
  value: "",
});
const blockTabs = [
  {
    label: "全棟住戶資料",
    value: "residentData",
  },
  {
    label: "管委會",
    value: "managementCommittee",
  },
  {
    label: "廠商資料",
    value: "supplierData",
  },
  {
    label: "大樓相關資料",
    value: "buildingRelevantData",
  },
];
const route = useRoute();
const router = useRouter();

onMounted(async () => {
  // 如果有 跳轉Url 的話，跳到正確的 tab
  if (route.query && route.query.label && route.query.value) {
    tabChange(route.query as { label: string; value: string });
  } else tabChange();
});
async function tabChange(tab: { label: string; value: string } = blockTabs[0]) {
  console.log("tabChange tab", tab);
  if (activeTab.value.label === tab.label) return;
  blockAttrs.value.blockData.length = 0;

  const { label, value } = tab;
  activeTab.value.label = label;
  activeTab.value.value = value;
  blockAttrs.value.blockTitle = value;
  dialogAttrs.value.dialogTitle = label;
  if (router.currentRoute.value.query.type) {
    router.push(router.currentRoute.value.path);
  }
  router.replace({ query: { label, value } });

  console.log("route.query", route.query);

  if (activeTab.value.value === "residentData") {
    blockAttrs.value.tableConfig = residentDataConfig;
    API = AccountSetting;
    nextTick(() => {
      blockAttrs.value.tableConfig = residentDataConfig;
      blockAttrs.value.headerButtons = ["exportExcel"];
      blockAttrs.value.tableButtons = [];
      customHeaderButtons.value = [
        {
          label: "列印全棟住戶資料",
          icon: "print",
          status: "printResidentData",
          isShow: true,
        },
      ];
    });
  } else if (activeTab.value.value === "managementCommittee") {
    API = Committee;
    // 獲取管委會下拉選單
    const committeeData =
      (await Committee.apiCommitteeSearch()) as typeof AxiosResponse;
    committeeOptions.value = committeeData.data;
    if (committeeOptions.value.length > 0) {
      committeeModel.value =
        committeeOptions.value[committeeOptions.value.length - 1];
    }
    console.log("committeeModel.value", committeeModel.value);
    nextTick(() => {
      blockAttrs.value.tableConfig = committeeConfig;
      blockAttrs.value.headerButtons = [
        "updateMany",
        "deleteMany",
        "add",
        "exportExcel",
      ];
      blockAttrs.value.tableButtons = ["edit", "delete"];
      if (userStore.isMercury || userStore.isSystem) {
        customHeaderButtons.value = [
          {
            label: "管委會改選",
            icon: mdiHandshakeOutline,
            status: "reElection",
            isShow: true,
          },
        ];
      } else {
        customHeaderButtons.value = [];
      }
    });
  } else if (activeTab.value.value === "supplierData") {
    API = SupplierData;
    nextTick(() => {
      blockAttrs.value.tableConfig = supplierDataConfig;
      blockAttrs.value.headerButtons = [
        "updateMany",
        "deleteMany",
        "add",
        "exportExcel",
        "importExcel",
      ];
      blockAttrs.value.tableButtons = ["edit", "delete"];
    });
  } else if (activeTab.value.value === "buildingRelevantData") {
    console.log("buildingRelevantData, can do something here...");
  }
}

// 管委會下拉

const committeeModel = ref();
const committeeOptions = ref<{ id: number; label: string }[]>([]);
watch(
  committeeModel,
  async (val) => {
    if (val && val.id) {
      const blockPagination = Array.isArray(blockRef?.value)
        ? blockRef?.value[0]?.pagination
        : blockRef?.value?.pagination;
      blockPagination.filters = "";

      await getDataMixin(Committee, {
        filters: "",
        page: 1,
        rowsPerPage: 25,
        id: val.id,
      }); // 獲取新的管委會資料
    }
  },
  { deep: true }
);
// 管委會日期範圍選取
const committeeDate = ref({ from: "", to: "" }); // { from: "2020/07/08", to: "2020/07/17" }
// 改選管委會
const reElectionDialogModel = ref(false);
const dateSelectFrom = ref();
const dateSelectTo = ref();
async function reElectionCommittee() {
  // 觸發驗證方法
  dateSelectFrom.value.validate();
  dateSelectTo.value.validate();

  const { from, to } = committeeDate.value;
  if (!from || !to) {
    $q.notify({
      type: "warning",
      message: "請先填寫管委會日期",
      position: "top",
    });
    return;
  }
  const query = { start: from, end: to };

  const result = (await Committee.apiCommitteeReElection(
    query,
    dialogAttrs.value.selectArray as CommunityUserViewModel[]
  )) as typeof AxiosResponse;

  if (result.data) {
    // 獲取管委會下拉選單
    const committeeData =
      (await Committee.apiCommitteeSearch()) as typeof AxiosResponse;
    committeeOptions.value = committeeData.data;
    if (committeeOptions.value.length > 0) {
      committeeModel.value =
        committeeOptions.value[committeeOptions.value.length - 1];

      // 清空搜尋欄文字
      const blockPagination = Array.isArray(blockRef?.value)
        ? blockRef?.value[0]?.pagination
        : blockRef?.value?.pagination;
      blockPagination.filters = "";

      getDataMixin(Committee, {
        filters: "",
        page: 1,
        rowsPerPage: 25,
        id: committeeModel.value.id,
      });
    }
    $q.notify({
      type: "positive",
      message: "改選成功",
      position: "top",
    });
    reElectionDialogModel.value = false;
  } else {
    $q.notify({
      type: "negative",
      message: "改選失敗",
      position: "top",
    });
  }
}
function cancelReElection() {
  reElectionDialogModel.value = false;
  dialogAttrs.value.selectArray.length = 0;
  committeeDate.value = { from: "", to: "" };
}
// 大樓相關資料
const rootForBuilding = ref({ path: "", name: "首頁" });
watch(
  Bid,
  (val, oldVal) => {
    if (val && val !== oldVal) {
      rootForBuilding.value.path = `Building${val}:\\`;
    }
  },
  { immediate: true }
);
// FileUpload
async function setAsProtectionPlan(fullPath: string, fileModelArray: string[]) {
  if (fileModelArray.length > 1) {
    $q.notify({
      type: "warning",
      message: "請只選擇一張圖片",
      position: "top",
    });
    return;
  } else if (fileModelArray.length === 0) {
    $q.notify({
      type: "warning",
      message: "請選擇一張圖片",
      position: "top",
    });
    return;
  }
  console.log("setAsProtectionPlan", fullPath, fileModelArray);

  if (!Bid.value) {
    $q.notify({
      type: "warning",
      message: "未知問題，未能取大樓編號，請重整後在重新設定",
      position: "top",
    });
  }
  const encodedPath = encodeURI(fullPath + fileModelArray[0]);
  const result = (await Files.apiSetProtectionPlan(
    Bid.value as number,
    encodedPath
  )) as typeof AxiosResponse;

  if (result.data) {
    await buildingStore.getBuildingsData();
    console.log("now protectionFileId", buildingData.value?.protectionFileId);
    $q.notify({
      type: "positive",
      message: "設定防護計畫書成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "設定防護計畫書失敗",
      position: "top",
    });
  }
}
async function setAsOrganizationChart(
  fullPath: string,
  fileModelArray: string[]
) {
  if (fileModelArray.length > 1) {
    $q.notify({
      type: "warning",
      message: "請只選擇一張圖片",
      position: "top",
    });
    return;
  } else if (fileModelArray.length === 0) {
    $q.notify({
      type: "warning",
      message: "請選擇一張圖片",
      position: "top",
    });
    return;
  }
  console.log("setAsOrganizationChart", fullPath, fileModelArray);

  if (!Bid.value) {
    $q.notify({
      type: "warning",
      message: "未知問題，未能取大樓編號，請重整後在重新設定",
      position: "top",
    });
  }
  const encodedPath = encodeURI(fullPath + fileModelArray[0]);
  const result = (await Files.apiSetOrganizationChart(
    Bid.value as number,
    encodedPath
  )) as typeof AxiosResponse;

  if (result.data) {
    await buildingStore.getBuildingsData();
    console.log(
      "now organizationFileId",
      buildingData.value?.organizationFileId
    );
    $q.notify({
      type: "positive",
      message: "設定組織架構圖成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "設定組織架構圖失敗",
      position: "top",
    });
  }
}

// 下半部分
// 樓層示意圖
onMounted(floorTabChange); // init

const floorsForBasicInfo = ref();
const currentFloor = computed(() =>
  floorsForBasicInfo.value
    ? floorsForBasicInfo.value.currentFloor
    : { id: null, name: "Home" }
);

const rootForFloor = ref({ path: "", name: "Home" });
const highlightObj = ref<{ [path: string]: string }>({});
const buildingHighlightObj = ref<{ [path: string]: string }>({});

watch(
  () => buildingData.value,
  (val) => {
    if (val) {
      const { organizationFilePath, protectionFilePath } =
        val as BuildingViewModel;
      buildingHighlightObj.value = {};
      if (organizationFilePath) {
        buildingHighlightObj.value[organizationFilePath] = "red";
      }
      if (protectionFilePath) {
        buildingHighlightObj.value[protectionFilePath] = "blue";
      }
    }
  },
  { immediate: true, deep: true }
);

watch(
  () => currentFloor.value,
  (val) => {
    console.log("now val", val);
    if (val) {
      const { id, floorPlanFilePath, evacuationRouteFilePath } =
        val as FloorViewModel;
      highlightObj.value = {};
      if (floorPlanFilePath) highlightObj.value[floorPlanFilePath] = "red";
      if (evacuationRouteFilePath) {
        highlightObj.value[evacuationRouteFilePath] = "blue";
      }

      if (id) {
        rootForFloor.value.path = "Floor" + val.id + ":\\";
        rootForFloor.value.name = val.name;
      }
    }
  },
  { immediate: true, deep: true }
);
async function handleSelect(floorData: { id: number }, imageUrl?: string) {
  console.log("handleSelect floorData", floorData);
  console.log("handleSelect imageUrl", imageUrl);
  if (imageUrl) floorImageUrl.value = imageUrl;
  else floorImageUrl.value = "";

  getFloorData();
}

// 樓層 Tab
const activeFloorTab = ref({
  label: "",
  value: "",
});
const floorBlockTabs = [
  {
    label: "樓層地址資料",
    value: "floorAddressData",
  },
  {
    label: "樓層平面圖",
    value: "floorPlan",
  },
  {
    label: "樓層相關資料",
    value: "floorRelatedData",
  },
];
// 樓層平面圖
const floorImageUrl = ref();

function floorTabChange(
  tab: { label: string; value: string } = floorBlockTabs[0]
) {
  console.log("floorTabChange", tab);

  if (activeFloorTab.value.value !== tab.value) {
    activeFloorTab.value.value = tab.value;
    activeFloorTab.value.label = tab.label;
  }
}
// 樓層 FileUpload
// 按鈕
const $q = inject("$q") as typeof QVueGlobals;
async function setFloorPlan(
  fullPath: string,
  fileModelArray: string[],
  apiFunction: (id: number, path: string) => Promise<ApiResponse<boolean>>,
  successMessage: string,
  failureMessage: string
) {
  console.log("setFloorPlan", fullPath, fileModelArray);

  if (fileModelArray.length > 1) {
    $q.notify({
      type: "warning",
      message: "請只選擇一張圖片",
      position: "top",
    });
    return;
  } else if (fileModelArray.length === 0) {
    $q.notify({
      type: "warning",
      message: "請選擇一張圖片",
      position: "top",
    });
    return;
  }

  const encodedPath = encodeURI(fullPath + fileModelArray[0]);
  const result = await apiFunction(currentFloor.value.id, encodedPath);

  if (result.data) {
    if (floorsForBasicInfo.value) await floorsForBasicInfo.value.getAllFloors();

    $q.notify({
      type: "positive",
      message: successMessage,
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: failureMessage,
      position: "top",
    });
  }
}

// 使用重構後的函數
async function setEvacuationFloorPlan(
  fullPath: string,
  fileModelArray: string[]
) {
  await setFloorPlan(
    fullPath,
    fileModelArray,
    Floors.apiSetEvacuationFloorPlan,
    "設定平面圖成功",
    "設定平面圖失敗"
  );
}

async function setFireFloorPlan(fullPath: string, fileModelArray: string[]) {
  await setFloorPlan(
    fullPath,
    fileModelArray,
    Floors.apiSetFireFloorPlan,
    "設定起火樓層平面圖成功",
    "設定起火樓層平面圖失敗"
  );
}

// 下半部 table
// Block
const floorBlockRef = ref<blockRefType>();

const {
  dialogAttrs: floorDialogAttrs,
  blockAttrs: floorBlockAttrs,
  handleBlockMixin: handleFloorBlockMixin,
  handleDialogMixin: handleFloorDialogMixin,
  handleSelectArray: handleFloorSelectArray,
  hideDialog: hideFloorDialog,
  expandTableAttrs,
} = tableMixin(floorBlockRef as Ref<blockRefType>);

const floorExpandAttrs = computed(() => expandTableAttrs.value);

const floorBlockEvent = computed(() => {
  return {
    handleBlock: handleFloorBlock,
    handleSelectArray: handleFloorSelectArray,
    changeBlockData: getFloorData,
  };
});
const floorDialogEvent = computed(() => {
  return {
    handleDialog: handleFloorDialog,
    selectListChange: floorSelectListChange,
  };
});

// 申報相關
const { declareRadioOptions, declareOptionAction } = declareMixin();

// 更動 floorBlock table 按鈕
nextTick(() => {
  floorDialogAttrs.value.dialogTitle = "樓層地址";
  floorBlockAttrs.value.tableConfig = addressPlatesConfig;
  floorBlockAttrs.value.headerButtons = ["add", "updateMany", "deleteMany"];
  floorBlockAttrs.value.tableButtons = ["edit", "delete", "upload"];

  // 展開
  expandTableAttrs.value.isExpand = true;
  expandTableAttrs.value.expandKey = "members";
  expandTableAttrs.value.expandConfig = residentExpandConfig;
});

// 在 block 上的操作
const FloorAPI = AddressPlate;
// 取得分頁資料
async function handleFloorBlock(
  btn: { label: string; icon: string; status: string },
  data: AddressPlateViewModel | AddressPlateViewModel[]
) {
  handleFloorBlockMixin(btn, data, FloorAPI, getFloorData);
  const floorTempData = floorDialogAttrs.value.tempData;
  if (btn.status === "add") {
    floorTempData.inspectionPlaceSelf = false;
    floorTempData.publicPlaceSelf = false;
    const ownerConfigObj = floorBlockAttrs.value.tableConfig.find(
      (item) => item.name === "owner"
    );
    const headsConfigObj = floorBlockAttrs.value.tableConfig.find(
      (item) => item.name === "heads"
    );

    if (ownerConfigObj) ownerConfigObj.isDialogForm = false;
    if (headsConfigObj) headsConfigObj.isDialogForm = false;
  } else if (btn.status === "edit") {
    // 檢修申報
    declareOptionAction(
      "use",
      floorTempData.use,
      floorBlockAttrs.value.tableConfig,
      btn.status
    );
    declareOptionAction(
      "purpose",
      floorTempData.purpose,
      floorBlockAttrs.value.tableConfig,
      btn.status
    );

    floorTempData.inspectionPlaceDate = floorTempData.inspectionPlaceJob?.date;
    floorTempData.inspectionPlaceRemind =
      floorTempData.inspectionPlaceJob?.remind;
    floorTempData.inspectionPlaceDays = floorTempData.inspectionPlaceJob?.days;
    // 公安申報
    floorTempData.publicPlaceDate = floorTempData.publicPlaceJob?.date;
    floorTempData.publicPlaceRemind = floorTempData.publicPlaceJob?.remind;
    floorTempData.publicPlaceDays = floorTempData.publicPlaceJob?.days;
  }
}

const floorFilters = searchFiltersGenerator(addressPlatesConfig).filters;

async function getFloorData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  console.log("pagination Floor", floorFilters, pagination, currentFloor.value);
  if (!currentFloor.value) return;
  pagination.floorId = currentFloor.value.id;
  const payload = useCloned(pagination).cloned.value;

  // 產出 filters 物件 (filtersObject)
  const searchText = pagination.filters.trim();
  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    floorFilters,
    searchText,
    "AddressPlate"
  );
  const jsonFilters = JSON.stringify(filtersObject);
  payload.filters = jsonFilters;
  await getDataMixin(FloorAPI, payload, floorBlockAttrs.value);
  console.log("getFloorData", floorBlockAttrs.value.blockData);
  floorBlockAttrs.value.blockData.forEach(async (item) => {
    const result = (await AddressPlate.apiGetByLandLordAndResident(
      item.id
    )) as typeof AxiosResponse;
    item.members = result.data;
  });
  setBlockLoading(floorBlockRef);
}
// 在新增/編輯 dialog 上的操作
function handleFloorDialog(status: string, data: tempDataType) {
  data.floor = currentFloor.value;
  if (data.inspectionPlaceDate || data.inspectionPlaceRemind) {
    data.inspectionPlaceJob = {
      date: data.inspectionPlaceDate,
      remind: data.inspectionPlaceRemind,
      days: data.inspectionPlaceDays,
      current: new Date(),
      completed: false,
      next: new Date(),
    };
  }
  if (data.publicPlaceDate || data.publicPlaceRemind) {
    data.publicPlaceJob = {
      date: data.publicPlaceDate,
      remind: data.publicPlaceRemind,
      days: data.publicPlaceDays,
      current: new Date(),
      completed: false,
      next: new Date(),
    };
  }

  handleFloorDialogMixin(status, FloorAPI, getFloorData, data);
}
async function floorSelectListChange(props: string) {
  console.log("selectListChange", props);
  if (props === "inspectionPlaceDate") {
    const result = (await System.apiGetSystemItem(
      systemType.InspectionTypeOfTime
    )) as typeof AxiosResponse;
    floorDialogAttrs.value.selectOption = result.data;
  } else if (props === "publicPlaceDate") {
    const result = (await System.apiGetSystemItem(
      systemType.PublicSafeTypeOfTime
    )) as typeof AxiosResponse;
    floorDialogAttrs.value.selectOption = result.data;
  } else if (props === "owner") {
    const result = (await AddressPlate.apiGetByLandLordAndResident(
      floorDialogAttrs.value.tempData.id
    )) as typeof AxiosResponse;
    floorDialogAttrs.value.selectOption = result.data;
  } else if (props === "heads") {
    const result = (await AddressPlate.apiGetResident(
      floorDialogAttrs.value.tempData.id
    )) as typeof AxiosResponse;
    floorDialogAttrs.value.selectOption = result.data;
  }
}

// 全棟住戶資料 - 列印功能
const tableTitle = {
  houseNumber: "住址",
  fullname: "姓名",
  sex: "性別",
  age: "年齡",
  isDisability: "行動不便者",
  phoneNumber: "手機",
  phoneNumber2: "其他連絡電話",
  emergencyContact: "緊急聯絡人",
  emergencyNumber: "緊急電話",
  emergencyNumber2: "其他緊急連絡電話",
  note: "備註",
};

function formatAddressPlateUsersForTable(data: AddressPlateUserViewModel) {
  const tempData = {
    houseNumber: "",
    fullname: "",
    sex: "",
    age: "",
    isDisability: "",
    phoneNumber: "",
    phoneNumber2: "",
    emergencyContact: "",
    emergencyNumber: "",
    emergencyNumber2: "",
    note: "",
  };

  tempData.houseNumber += `<p>${data.addressPlate.houseNumber}</p>`;

  data.users.forEach((userData) => {
    tempData.fullname += `<p>${userData.fullname}</p>`;
    tempData.sex += `<p>${
      userData.sex ? "女" : userData.sex === false ? "男" : ""
    }</p>`;
    tempData.age += `<p>${
      userData.birthday ? birthdayFormatAge(userData.birthday) : ""
    }</p>`;
    tempData.isDisability += `<p>${userData.isDisability ? "是" : "否"}</p>`;
    tempData.phoneNumber += `<p>${userData.phoneNumber ?? ""}</p>`;
    tempData.phoneNumber2 += `<p>${
      userData.phoneNumber2?.length ? userData.phoneNumber2.join("、") : ""
    }</p>`;
    tempData.emergencyContact += `<p>${userData.emergencyContact ?? ""}</p>`;
    tempData.emergencyNumber += `<p>${userData.emergencyNumber ?? ""}</p>`;
    tempData.emergencyNumber2 += `<p>${
      userData.emergencyNumber2?.length
        ? userData.emergencyNumber2.join("<br>")
        : ""
    }</p>`;
    tempData.note += `<p>${userData.note ?? ""}</p>`;
  });

  return tempData;
}
const extraCss = `
  h3 {
    font-size: 1.6rem;
    margin: 2.4rem 0 1rem
  }
  .alertContent {
    color:red; border:solid 1px red; padding:5px;
  }
`;
interface formattedFloorData {
  floorTitle: string;
  tdContents: tdContent[];
}
function processFloorData(floorData: FloorAddressPlateViewModel) {
  let usersCount = 0;
  const tdContents: tdContent[] = [];

  floorData.addressPlates.forEach((addressPlate) => {
    usersCount += addressPlate.users.length;
    if (addressPlate.users.length > 0) {
      const content = formatAddressPlateUsersForTable(addressPlate);
      tdContents.push(content);
    }
  });

  return {
    floorTitle: `樓層: ${floorData.floor.name} (總人數: ${usersCount}人)`,
    tdContents,
  };
}
function generateFloorHTML(
  floorProcessedData: formattedFloorData,
  thObject: typeof tableTitle
) {
  const header = `<tr>${Object.values(thObject)
    .map((item) => `<th style="padding: 5px; width: 10%">${item}</th>`)
    .join("")}</tr>`;
  const body = floorProcessedData.tdContents
    .map(
      (content) =>
        `<tr>${Object.keys(thObject)
          .map((key) => `<td><div>${content[key]}</div></td>`)
          .join("")}</tr>`
    )
    .join("");

  return `<h3>${floorProcessedData.floorTitle}</h3><table>${
    header + body
  }</table>`;
}

async function handlePrint() {
  const nowBid = localStorage.getItem("Bid") as string;
  const result = await AccountSetting.apiGetResidentDataByBuilding(+nowBid);

  if (!result.data) return;

  let printTableContents =
    "<div class='alertContent'>持用本親等關聯資料，應依據個人資料保護法之相關規定，審慎處理及保護個人資訊，如違反規定，致當事人權益受損害者，須負法律責任。</div>";

  result.data.forEach((floorData) => {
    if (floorData.addressPlates.length > 0) {
      const processedData = processFloorData(floorData);
      const floorHTML = generateFloorHTML(processedData, tableTitle);
      printTableContents += floorHTML;
    }
  });

  print(printTableContents, "全棟住戶資料", true, extraCss);
}

async function updateLatestData(tempData: tempDataType) {
  if (activeTab.value.value === "managementCommittee" && tempData.user) {
    const {
      mugShotFileId,
      phoneNumber,
      contactNumber,
      email,
      roleAddressPlates,
    } = tempData.user as UserViewModel;
    tempData.userMugShotUrl = await getFile(null, mugShotFileId);
    tempData.phone = contactNumber;
    tempData.phoneNumber = phoneNumber;
    tempData.email = email;
    tempData.houseNumber = roleAddressPlates?.length
      ? roleAddressPlates
          .flatMap((p) => p.addressPlates.map((a) => a.houseNumber))
          .filter((value, index, self) => self.indexOf(value) === index)
          .join("、")
      : "";
  }
}
// Excel
const tableConfigForExcel = ref<blockAttrsType["tableConfig"]>([]);
const blockDataForExcel = ref<blockAttrsType["blockData"]>([]);
const fullBlockDataForExcel = ref<blockAttrsType["blockData"]>([]);

async function setDataForDataConfig(blockData: blockAttrsType["blockData"]) {
  const newBlockData = useCloned(blockData).cloned.value;
  if (activeTab.value.value === "supplierData") {
    tableConfigForExcel.value = supplierDataConfig;
  } else if (activeTab.value.value === "managementCommittee") {
    tableConfigForExcel.value = committeeConfig;
  } else if (activeTab.value.value === "residentData") {
    tableConfigForExcel.value = residentDataConfig;
  }
  console.log("newBlockData", newBlockData);

  blockDataForExcel.value = formatBlockData(newBlockData);
  tableConfigForExcel.value.forEach((item) => {
    const { label, name } = item;
    rowsChKeyToEngNameObject[label] = name;
  });
  console.log("tableConfigForExcel", tableConfigForExcel.value);
}
function formatBlockData(blockData: blockAttrsType["blockData"]) {
  if (activeTab.value.value === "supplierData") {
    return blockData.map((item) => {
      item.system = item.system.label;
      item.collaborate = item.collaborate ? "配合中" : "未配合";
      return item;
    });
  } else if (activeTab.value.value === "managementCommittee") {
    return blockData.map((item) => {
      item.phone = item.user.phone;
      item.phoneNumber = item.user.phoneNumber;
      item.email = item.user.email;
      item.houseNumber = item.user.roleAddressPlates?.length
        ? item.user.roleAddressPlates
            .flatMap((p: { addressPlates: AddressPlateViewModel[] }) =>
              p.addressPlates.map((a) => a.houseNumber)
            )
            .filter(
              (value: any, index: any, self: string | any[]) =>
                self.indexOf(value) === index
            )
            .join("、")
        : "";
      item.user = item.user.fullname;
      return item;
    });
  } else if (activeTab.value.value === "residentData") {
    return blockData.map((item) => {
      item.sex = item.sex ? "女" : item.sex === false ? "男" : "尚未設定";
      item.isDisability = item.isDisability ? "是" : "否";
      item.roles = item.roles
        ?.map((role: RoleViewModel) => role.description)
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
  } else {
    return [];
  }
}
// Excel 匯入 => 多筆新增
const dialogImportExcelRef = ref();
const sampleFile = computed(() => {
  if (activeTab.value.value === "supplierData") {
    return "/excelSample/廠商資料.xlsx";
  } else {
    return "";
  }
});
const rowsChKeyToEngNameObject = reactive<{ [key: string]: string }>({});

function formatImportData(data: dataItem[]) {
  const clonedData = useCloned(data).cloned.value;
  clonedData.map((item) => {
    for (const key in item) {
      const newKey = rowsChKeyToEngNameObject[key];
      if (newKey) {
        if (newKey === "system") {
          item[newKey as keyof typeof item] = JSON.parse(item[key]);
        } else {
          item[newKey as keyof typeof item] = item[key];
        }
      }
      delete item[key];
    }
    return item;
  });
  return clonedData;
}
async function saveImportData(formattedTableData: dataItem[]) {
  await handleDialogMixin("add", API, getData, formattedTableData);
  dialogImportExcelRef.value.hide();
}
</script>

<style scoped lang="scss">
.q-dialog__inner--minimized > .reElectionDialogCard {
  width: auto;
  max-width: initial;
  padding: 1rem;

  .q-input {
    margin-bottom: 0 !important;
  }
  .label {
    font-size: 1.5rem;
    font-weight: 800;
  }
  .main {
    display: grid;
    .title {
      font-size: 1.2rem;
    }
    .dateBox {
      margin-top: 1rem;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 1rem;
      .text {
        font-size: 1.2rem;
        margin-bottom: 1rem;
      }
    }
  }
}
</style>
