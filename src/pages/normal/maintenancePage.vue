<template>
  <q-page class="q-pa-md flex column">
    <h3
      v-if="$q.screen.xs || $q.screen.sm"
      class="text-left text-bold"
      style="font-size: 1.55rem; margin: 0"
    >
      維護保養
    </h3>
    <div class="flex q-gutter-md q-mb-md">
      <q-card
        v-for="(item, index) in remindBlock"
        :key="index"
        class="q-pa-xs-md q-pa-md-lg cursor-pointer flex items-center justify-between"
        :style="$q.screen.xs ? 'flex-grow:1' : 'width: 210px'"
        @click="openMaintainDialog(item)"
      >
        <q-icon
          :color="item.value === 'Fault' ? 'red' : 'primary'"
          :name="item.icon"
          class="q-mr-md icon text-h2"
        />
        <div class="flex column">
          <div class="text-h6 text-bold">{{ item.label }}</div>
          <div
            class="text-h6 text-bold"
            :style="
              $q.screen.xs || $q.screen.sm ? 'order:-1; text-align:center' : ''
            "
          >
            {{ item.num }}
          </div>
        </div></q-card
      >
    </div>
    <span class="flex flex-grow-1">
      <q-card class="q-pa-md full-width">
        <BlockComponent
          ref="blockRef"
          :blockAttrs="blockAttrs"
          v-on="blockEvent"
          v-model:filters="filters"
          custom-height="calc(100% - 20px)"
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

          <template #customBlockField="{ data, config }">
            <div
              class="flex justify-end items-center absolute-full q-px-sm"
              v-if="config.formType === 'progressPercent'"
            >
              <q-linear-progress
                :style="{ width: $q.screen.xs || $q.screen.sm ? '50%' : '70%' }"
                size="25px"
                :value="data.completePercent"
                color="primary"
                rounded
              >
                <div class="absolute-full flex flex-end">
                  <q-badge
                    :color="
                      data.completePercent >= 0.05 ? 'primary' : 'transparent'
                    "
                    :text-color="
                      data.completePercent >= 0.05 ? 'white' : 'primary'
                    "
                    class="text-bold"
                    :label="data.completePercent * 100 + '%'"
                  />
                </div>
              </q-linear-progress>
              <div
                :style="{ width: $q.screen.xs || $q.screen.sm ? '10%' : '25%' }"
                class="text-subtitle2 q-px-xs"
              >
                {{ data.completedItemNum }}/{{ data.totalItemNum }}
              </div>
            </div>
          </template>
        </BlockComponent>
      </q-card>
    </span>
  </q-page>

  <DialogUpload
    :rootPathName="dialogTableVisible ? 'DeviceMaintain' : 'Maintain'"
    :setCoverFunc="Maintain.apiSetCover"
    :updateBlockData="getData"
    :isDisable="dialogTableVisible ? false : true"
    :dialogAttrs="dialogAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  />

  <!-- 事件處理紀錄的DialogUpload -->
  <DialogUpload
    rootPathName="MaintainRecord"
    :dialogAttrs="tableInTableDialogAttrs"
    @hide="hideTableInTableDialog"
    v-on="tableInTableDialogEvent"
  />

  <!-- 保養提醒和待維修 dialog -->
  <q-dialog v-model="dialogVisible" persistent>
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 900px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">
          {{ currentBlockType?.label + " 建立" }}
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-tabs
          v-model="tab"
          class="mainTabsDesign"
          active-class="mainTabsActiveClass"
          active-color="activeTab"
          indicator-color="activeTab"
          active-bg-color="white"
          content-class="bg-grey-1"
          align="justify"
          narrow-indicator
          outside-arrows
          inline-label
          :shrink="$q.screen.xs || $q.screen.sm"
        >
          <q-tab
            name="step1"
            :icon="tab === 'step1' ? mdiCheckCircle : undefined"
            label="【步驟一】選擇設備項目"
            disable
          />
          <q-tab
            name="step2"
            :icon="tab === 'step2' ? mdiCheckCircle : undefined"
            label="【步驟二】建立維修保養單"
            disable
          />
        </q-tabs>

        <q-separator />
        <!-- 保養提醒與待維修的tab -->
        <q-tab-panels v-model="tab" animated>
          <q-tab-panel :name="tab" v-if="currentBlockType">
            <div class="row q-col-gutter-md items-center q-mb-md">
              <div class="flex-grow-1">
                <!-- 單選select -->
                <q-select
                  :disable="tab === 'step2'"
                  filled
                  v-model="currentBlockType.deviceType"
                  :options="deviceTypesSelectOptions"
                  option-label="name"
                  :label="`${currentBlockType.label} 設備種類`"
                  @focus="
                    selectListChange(
                      currentBlockType.value,
                      dialogAttrs.tempData
                    )
                  "
                  :rules="[(val: any) =>  !!val  ? true : `請選擇需進行 ${currentBlockType?.label} 的種類`]"
                >
                  <template v-slot:no-option>
                    <q-item>
                      <q-item-section class="text-grey">
                        尚無資料
                      </q-item-section>
                    </q-item>
                  </template>
                  <template v-slot:error>
                    {{ "請選擇設備種類" }}
                  </template>
                </q-select>
              </div>
              <div class="flex-grow-1" v-if="tab === 'step2'">
                <q-select
                  :disable="tab === 'step2'"
                  filled
                  multiple
                  use-chips
                  option-value="id"
                  v-model="currentBlockType.deviceSelectResult"
                  :options="deviceSelectOptions"
                  :label="`${currentBlockType.label} 設備`"
                  @focus="
                    selectListChange(
                      currentBlockType.value,
                      dialogAttrs.tempData
                    )
                  "
                  :rules="[(val: any) =>  !!val && val.length > 0 ?true : `請選擇需進行 ${currentBlockType?.label} 的設備`]"
                >
                  <template v-slot:selected-item="scope">
                    <q-chip
                      removable
                      @remove="scope.removeAtIndex(scope.index)"
                      :tabindex="scope.tabindex"
                      dense
                    >
                      {{ scope.opt.name }}
                    </q-chip>
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps">
                      <q-item-section>
                        <q-item-label>{{ scope.opt.name }}</q-item-label>
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
                    {{ "請選擇設備" }}
                  </template>
                </q-select>
              </div>
              <q-btn
                outline
                class="q-ml-md q-pb-md flex-grow-1"
                color="primary"
                v-if="tab === 'step2'"
                label="上一步"
                @click="tab = 'step1'"
              />
              <q-btn
                outline
                class="q-ml-md q-pb-md"
                v-if="tab === 'step1'"
                color="primary"
                label="下一步"
                @click="handleNextStep"
              />
            </div>

            <q-table
              v-if="tab === 'step1'"
              :grid="$q.screen.xs || $q.screen.sm"
              flat
              bordered
              :rows="currentBlockType?.deviceSelectResult"
              :columns="(deviceListConfig as QTableProps['columns'])"
              row-key="id"
              hide-selected-banner
              hide-pagination
              :rows-per-page-options="[0]"
              separator="cell"
            >
              <!-- 手機板的card style -->
              <template v-slot:item="props">
                <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 fit">
                  <q-card bordered flat class="q-mb-md">
                    <q-list dense class="q-mt-md">
                      <q-item v-for="col in props.cols" :key="col.name">
                        <q-item-section>
                          <q-item-label style="width: 60%">{{
                            col.label
                          }}</q-item-label>
                        </q-item-section>
                        <q-item-section side style="width: 60%">
                          <div
                            v-if="
                              col.formType === 'inputString' ||
                              col.formType === 'inputNumber' ||
                              col.formType === 'deviceAddress'
                            "
                          >
                            {{ col.value }}
                          </div>
                          <div v-else-if="col.formType === 'selectString'">
                            <span
                              v-if="col.linkUrl"
                              class="text-primary cursor-pointer text-bold"
                            >
                              {{ col.value?.name }}
                            </span>
                            <span v-else>{{
                              col.value?.description ||
                              col.value?.label ||
                              col.value?.name
                            }}</span>
                          </div>
                          <div v-else-if="col.formType === 'selectIcon'">
                            <q-icon
                              :name="col.value.iconImg"
                              style="font-size: 24px"
                            />
                            <span class="q-ml-sm">{{ col.value.value }}</span>
                          </div>
                          <div v-else-if="col.formType === 'selectSvgIcon'">
                            <SvgIcon
                              dense
                              color="text-dark"
                              :svgName="
                                col.value.iconId || col.value.icon || ''
                              "
                              font-size="20px"
                              class="svgIcon"
                            />
                            <span class="q-ml-sm">{{ col.value.name }}</span>
                          </div>
                          <div v-else>{{ col.value }}</div>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </div>
              </template>
              <template v-slot:no-data="{ icon }">
                <div
                  class="full-width row flex-center items-center text-primary q-gutter-sm"
                  style="font-size: 18px"
                >
                  <q-icon size="2em" :name="icon" />
                  <span> 無相關資料 </span>
                </div>
              </template>
            </q-table>
            <q-form v-if="tab === 'step2'" @submit="onSubmit">
              <div class="row q-col-gutter-md">
                <div
                  v-for="config in maintainListTableConfig"
                  :key="config.name"
                  :style="!config.isDialogForm ? 'padding:0px' : ''"
                  :class="
                    config.isDialogForm &&
                    (config.formType === 'inputString' ||
                    config.formType === 'selectMany'
                      ? 'col-6'
                      : config.formType === 'date'
                      ? 'col-4'
                      : 'col-12')
                  "
                >
                  <div v-if="config.isDialogForm">
                    <q-input
                      v-if="config.formType === 'inputString'"
                      v-model="dialogAttrs.tempData[config.name]"
                      :label="config.label + (config.required ? ' *' : '')"
                      lazy-rules
                      :rules="[(val: any) => config.required ? !!val : (typeof val === 'string' || !val )  ? true :false || config.message?config.message:`請輸入 ${config.label}`]"
                    >
                      <template v-slot:error>
                        {{ config.message }}
                      </template>
                    </q-input>
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
                      @focus="
                        selectListChange(config.name, dialogAttrs.tempData)
                      "
                      class="q-mb-md-md"
                      :rules="[(val: any) => config.required ? !!val : true || config.message]"
                    >
                      <template v-slot:selected-item="scope">
                        <q-chip
                          v-if="scope.opt"
                          removable
                          @remove="scope.removeAtIndex(scope.index)"
                          :tabindex="scope.tabindex"
                          dense
                        >
                          {{
                            scope.opt?.fullname ||
                            scope.opt.label ||
                            scope.opt.name
                          }}
                        </q-chip>
                      </template>
                      <template v-slot:option="scope">
                        <q-item v-bind="scope.itemProps">
                          <q-item-section>
                            <q-item-label>{{
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
                    <!-- 日期 -->
                    <q-input
                      :disable="config.disable"
                      v-if="config.formType === 'date'"
                      v-model="dialogAttrs.tempData[config.name]"
                      stack-label
                      :label="config.label + (config.required ? ' *' : '')"
                      clearable
                      type="date"
                      @click="handleDate(config.name)"
                      :rules="[(val: any) => config.required ? !!val : (typeof val === 'string' || !val )  ? true :false || config.message?config.message:`請輸入 ${config.label}`]"
                    >
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
                    >
                      <template v-slot:error>
                        {{ config.message }}
                      </template>
                    </q-input>
                  </div>
                </div>
              </div>

              <q-card-section align="center">
                <q-btn type="submit" color="primary" label="儲存" />
              </q-card-section>
            </q-form>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>

  <DialogForm
    :dialogAttrs="dialogAttrs"
    :blockAttrs="dialogTableVisible ? tableAttrs : blockAttrs"
    @hide="hideDialog"
    v-on="dialogEvent"
  />

  <!-- 事件處理紀錄的dialog -->
  <DialogForm
    :dialogAttrs="tableInTableDialogAttrs"
    :blockAttrs="tableInTableBlockAttrs"
    @hide="hideTableInTableDialog"
    v-on="tableInTableDialogEvent"
  />

  <!-- mail Dialog -->
  <q-dialog v-model="mailDialogVisible">
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 550px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">電子郵件寄發通知</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md-lg">
        是否將
        <span class="text-bold text-primary">{{
          currentMaintainData?.name || dialogAttrs.tempData.name
        }}</span>
        寄送電子郵件通知負責廠商?
      </q-card-section>

      <q-card-actions align="center" class="q-mb-md">
        <q-btn
          label="前往寄出"
          border
          v-close-popup
          @click="sendEmail(dialogAttrs.tempData)"
        />
        <q-btn label="不需寄送" border v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- dialogTable -->
  <!-- 維保細項 -->
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
        <div class="flex justify-end q-mr-md">
          <q-markup-table flat bordered separator="vertical">
            <thead>
              <tr>
                <th class="text-left">寄送郵件</th>
                <th class="text-left">聯絡時間</th>
                <th class="text-left">進場時間</th>
                <th class="text-left">完成時間</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  class="flex items-center"
                  :class="
                    currentMaintainData?.isEmailSent
                      ? 'text-positive'
                      : 'text-negative'
                  "
                >
                  <q-icon
                    :name="
                      currentMaintainData?.isEmailSent
                        ? mdiCheckCircle
                        : mdiCloseCircle
                    "
                    class="q-pr-xs"
                    style="font-size: 24px"
                  />
                  <span class="text-bold">{{
                    currentMaintainData?.isEmailSent ? "已寄送" : "未寄送"
                  }}</span>
                </td>
                <td class="text-left">
                  {{
                    currentMaintainData?.contactDate
                      ? date.formatDate(
                          new Date(currentMaintainData?.contactDate),
                          "YYYY-MM-DD"
                        )
                      : ""
                  }}
                </td>
                <td class="text-left">
                  {{
                    currentMaintainData?.entryDate
                      ? date.formatDate(
                          new Date(currentMaintainData?.entryDate),
                          "YYYY-MM-DD"
                        )
                      : ""
                  }}
                </td>
                <td class="text-left">
                  {{
                    currentMaintainData?.completionDate
                      ? date.formatDate(
                          new Date(currentMaintainData?.completionDate),
                          "YYYY-MM-DD"
                        )
                      : ""
                  }}
                </td>
              </tr>
            </tbody>
          </q-markup-table>
        </div>

        <BlockComponent
          ref="blockRef"
          :blockAttrs="tableAttrs"
          v-on="tableEvent"
          :isSearch="false"
          :isDialogTable="true"
          v-model:filters="filters"
          :custom-height="'calc(100% - 155px)'"
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
          <template #customHeaderButtons>
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
          <template #customBlockField="{ data, config }">
            <q-checkbox
              v-if="config.formType === 'checkbox'"
              v-model="data.isDone"
              :label="data.isDone ? '已完成' : '未完成'"
              :checked-icon="mdiCheckCircle"
              :unchecked-icon="mdiCloseCircle"
              :color="data.isDone ? 'positive' : 'negative'"
              :class="data.isDone ? 'text-positive' : 'text-negative'"
              keep-color
              @update:model-value="handleCheckbox(data)"
            />
          </template>
        </BlockComponent>
      </q-card-section>
    </q-card>
  </q-dialog>
  <!-- 事件處理紀錄 -->
  <q-dialog v-model="dialogTableInTableVisible" persistent>
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
        <q-tabs
          v-model="tableActiveTab.value"
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
          v-if="
            (dialogAttrs.status === 'maintainRecordMany' ||
              dialogAttrs.status === 'switchAllClose') &&
            maintainDeviceSelectArray &&
            maintainDeviceSelectArray.length > 1
          "
        >
          <q-tab
            v-for="(item, index) in maintainDeviceSelectArray"
            :key="index"
            :name="String(item?.id)"
            :icon="
              $q.screen.xs || $q.screen.sm
                ? undefined
                : tableActiveTab.value === String(item?.id)
                ? mdiCheckCircle
                : undefined
            "
            :label="item.device?.name"
            @click="tableTabChange(item as DeviceMaintainViewModel)"
          />
        </q-tabs>
        <q-separator
          v-if="
            (dialogAttrs.status === 'maintainRecordMany' ||
              dialogAttrs.status === 'switchAllClose') &&
            maintainDeviceSelectArray &&
            maintainDeviceSelectArray.length > 1
          "
        />
        <q-tab-panels
          :style="
            dialogAttrs.status === 'maintainRecordMany'
              ? 'height: 95%'
              : 'height: 100%'
          "
          v-model="tableActiveTab.value"
          ><q-tab-panel :name="tableActiveTab.value">
            <BlockComponent
              ref="tableInTableRef"
              :blockAttrs="tableInTableBlockAttrs"
              v-on="tableInTableBlockEvent"
              :isSearch="false"
              :isDialogTable="true"
              :custom-height="
                dialogAttrs.status === 'maintainRecordMany'
                  ? 'calc(100% - 60px)'
                  : 'calc(100% - 20px)'
              "
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
              <template #customHeaderButtons>
                <q-btn
                  v-for="(btn, index) in customHeaderButtons"
                  :key="index"
                  @click="handleClickOption(btn)"
                  round
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
              <template #customBlockField="{ data, config }">
                <div>
                  <q-toggle
                    v-if="config.formType === 'toggle'"
                    v-model="data.isDisplay"
                    color="positive"
                    :indeterminate-value="false"
                    @update:model-value="updateToggle(data)"
                  />
                  <span :class="data.isDisplay ? 'text-positive' : 'text-grey'">
                    {{ data.isDisplay ? "顯示" : "隱藏" }}
                  </span>
                </div>
              </template>
            </BlockComponent>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
// config
import { deviceListConfig } from "src/utils/linkUrlConfig";
// api
import Maintain, {
  MaintainTypes,
  maintainListTableConfig,
} from "src/api/maintain";
import MaintainDevice, {
  DeviceMaintainViewModel,
  maintainDeviceTableConfig,
} from "src/api/maintainDevice";
import type { DeviceViewModel } from "src/api/device";
import type { DeviceTypeViewModel } from "src/api/deviceType";
import MaintainRecord, {
  MaintainRecordViewModel,
  maintainRecordTableConfig,
} from "src/api/maintainRecord";
// utils
import { date, type QTableProps } from "quasar";
import { useCloned } from "@vueuse/core";
import tableMixin, { setBlockLoading } from "src/utils/tableMixin";
import type {
  blockRefType,
  tableConfigItem,
  tempDataType,
} from "src/utils/tableMixin";
import type { ProviderViewModel } from "src/api/supplierData";

// icon
import {
  matError,
  matHomeRepairService,
  matEmail,
  matDriveFileMove,
} from "@quasar/extras/material-icons";
import {
  mdiCheckCircle,
  mdiToggleSwitchOff,
  mdiCloseCircle,
} from "@quasar/extras/mdi-v6";
import { tabCheckupList } from "quasar-extras-svg-icons/tabler-icons-v2";

// pinia
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building";
import { useUserStore } from "src/stores/user";
import searchFiltersGenerator, {
  generateFiltersObject,
} from "src/utils/advancedSearchFilters";
import {
  FilterColumn,
  FilterColumnCollection,
  FilterColumnLogical,
} from "src/api/api.type";

const userStore = useUserStore();
const buildingStore = useBuildingStore();

const { userData } = storeToRefs(userStore);
const { buildingData, Bid } = storeToRefs(buildingStore);

const $q = inject("$q") as typeof QVueGlobals;
// 客製 btn
const customHeaderButtons = computed(() => {
  if (dialogTableInTableVisible.value) {
    return [
      {
        label: "全部關閉",
        icon: mdiToggleSwitchOff,
        status: "switchAllClose",
      },
    ];
  } else if (dialogTableVisible.value) {
    return [
      {
        label: "多筆完成",
        icon: mdiCheckCircle,
        status: "isDoneMany",
      },
      {
        label: "多筆事件處理紀錄",
        icon: tabCheckupList,
        status: "maintainRecordMany",
      },
    ];
  } else {
    return [];
  }
});

const customTableButtons = computed(() => {
  if (dialogTableInTableVisible.value) {
    return [];
  } else if (dialogTableVisible.value) {
    return [
      {
        label: "事件處理紀錄",
        icon: tabCheckupList,
        status: "maintainRecord",
      },
    ];
  } else {
    return [
      {
        label: "發送Email",
        icon: matEmail,
        status: "sendEmail",
      },
      {
        label: "維保細項",
        icon: matDriveFileMove,
        status: "maintainDevice",
      },
    ];
  }
});

function handleClickOption(
  btn: {
    label: string;
    icon: string;
    status: string;
  },
  data?: tempDataType
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
  resetSelect,
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
    handleDate,
  };
});
const tableEvent = computed(() => {
  return {
    handleBlock,
    handleSelectArray,
    changeBlockData: getTableData,
  };
});
// API類別
let API: typeof Maintain | typeof MaintainDevice;

// 在 block 上的操作
const currentMaintainData = ref<tempDataType>();
const currentMaintainDeviceData = ref<tempDataType>();

async function handleBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  console.log("handleBlock", btn, data);

  if (dialogTableVisible.value) {
    API = MaintainDevice;
    tableAttrs.value.tableConfig = maintainDeviceTableConfig;
    await handleBlockMixin(btn, data, API, getTableData);
  } else {
    API = Maintain;
    currentMaintainData.value = data;
    await handleBlockMixin(btn, data, API, getData);
  }
  if (btn.status === "maintainDevice") {
    dialogTableVisible.value = true;
    dialogTableTitle.value = "維保細項";

    nextTick(() => {
      tableAttrs.value.tableConfig = maintainDeviceTableConfig;
      tableAttrs.value.headerButtons = [];
      tableAttrs.value.tableButtons = ["upload"];
    });
    tableAttrs.value.blockData = [];
    tableAttrs.value.totalNum = 0;
  } else if (btn.status === "maintainRecord") {
    dialogTableInTableVisible.value = true;
    dialogTableTitle.value = "事件處理紀錄";
    tableInTableDialogAttrs.value.dialogTitle = "事件處理紀錄";
    currentMaintainDeviceData.value = data;
    tableTabChange(currentMaintainDeviceData.value as DeviceMaintainViewModel);
  } else if (btn.status === "maintainRecordMany") {
    if (dialogAttrs.value.selectArray?.length > 1) {
      dialogTableInTableVisible.value = true;
      dialogTableTitle.value = "多筆事件處理紀錄";
      currentMaintainDeviceData.value = dialogAttrs.value.selectArray[0];
      tableTabChange(
        dialogAttrs.value.selectArray[0] as DeviceMaintainViewModel
      );
      const { cloned } = useCloned(dialogAttrs.value.selectArray);
      maintainDeviceSelectArray.value =
        cloned.value as DeviceMaintainViewModel[];
    } else {
      $q.notify({
        type: "negative",
        message: "請勾選一筆以上的資料列",
        position: "top",
      });
    }
  } else if (btn.status === "switchAllClose") {
    if (tableInTableDialogAttrs.value?.selectArray.length) {
      tableInTableDialogAttrs.value.selectArray.forEach((item) => {
        item.isDisplay = false;
      });
      updateToggle(
        tableInTableDialogAttrs.value.selectArray as MaintainRecordViewModel[]
      );
      TableInTableResetSelect();
    } else {
      $q.notify({
        type: "negative",
        message: "請勾選要更新的資料列",
        position: "top",
      });
    }
  } else if (btn.status === "sendEmail") {
    mailDialogVisible.value = true;
  } else if (btn.status === "isDoneMany") {
    if (dialogAttrs.value.selectArray?.length) {
      const idArr: string[] = [];
      dialogAttrs.value.selectArray.forEach(async (item) => {
        item.isDone = true;
        idArr.push(item.id);
      });
      dialogAttrs.value.selectArray.forEach((item) => {
        item.device.keeperUnit = null;
      });
      await handleDialogMixin(
        "updateMany",
        MaintainDevice,
        getData,
        dialogAttrs.value.selectArray
      );
      idArr.forEach(async (id) => {
        // 新增事件處理紀錄
        await handleDialogMixin("add", MaintainRecord, getTableData, [
          {
            deviceMaintainId: id,
            user: userData.value,
            message: `${userData.value.fullname} 確認為已完成`,
            isDisplay: true,
          },
        ]);
      });
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
function handleDialog(status: string, data: tempDataType) {
  if (dialogTableVisible.value) {
    if (status === "add") data.maintainId = currentMaintainData.value?.id;
    handleDialogMixin(status, API, getTableData, data);
  } else {
    handleDialogMixin(status, API, getData, data);
  }
}

// 取得分頁資料
const route = useRoute();
const router = useRouter();
const { filters } = searchFiltersGenerator(maintainListTableConfig);

async function getData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  await getRemindBlockData();

  API = Maintain;

  if (Bid.value) pagination.buildingId = Bid.value;
  console.log("pagination", pagination);

  const payload = useCloned(pagination).cloned.value;
  // 產出 filters 物件 (filtersObject)
  const searchText = pagination.filters.trim();
  console.log("searchText", searchText);
  const filtersObject: FilterColumnCollection[] = generateFiltersObject(
    filters,
    searchText,
    "Maintain"
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
            typeName: "Maintain",
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

  blockAttrs.value.blockData.forEach((item) => {
    const isDone = item.deviceMaintains.filter(
      (item: DeviceMaintainViewModel) => item.isDone
    );
    item.completePercent =
      isDone?.length % item.deviceMaintains?.length
        ? Number((isDone?.length / item.deviceMaintains?.length).toFixed(2))
        : isDone?.length / item.deviceMaintains?.length;
    item.completedItemNum = isDone?.length;
    item.totalItemNum = item.deviceMaintains?.length;
  });

  // 若搜尋維保單筆數 > 1，則不自動打開該維保單細項畫面)
  if (route.query.search && blockAttrs.value.blockData?.length === 1) {
    console.log("here");
    handleBlock(
      {
        label: "維保細項",
        icon: matDriveFileMove,
        status: "maintainDevice",
      },
      blockAttrs.value.blockData[0]
    );
    router.replace({ query: {} });
  }

  setBlockLoading(blockRef);
}

// 保養提醒和待維修
interface blockType {
  label: string;
  icon: string;
  value: string;
  num: number;
  deviceSelectResult: DeviceViewModel[];
  deviceType: DeviceTypeViewModel | null;
  type: MaintainTypes;
}
const dialogVisible = ref(false);
const currentBlockType = ref<blockType>();

function openMaintainDialog(block: blockType) {
  dialogAttrs.value.status = "add";
  dialogAttrs.value.tempData = {};
  dialogVisible.value = true;
  tab.value = "step1";

  const { cloned } = useCloned(block);
  currentBlockType.value = cloned.value;
}

const tab = ref<string>();
function handleNextStep() {
  if (!currentBlockType.value?.deviceType) {
    $q.notify({
      type: "warning",
      message: "尚未選擇待保養 / 維修設備種類",
      position: "top",
    });
    return;
  }
  tab.value = "step2";
  // 新增維保單
  if (currentBlockType.value?.deviceSelectResult) {
    dialogAttrs.value.tempData.deviceMaintains =
      currentBlockType.value?.deviceSelectResult.map((item) => {
        return {
          maintainId: 0,
          device: item,
        };
      });
  } else {
    $q.notify({
      type: "warning",
      message: "請先選擇待保養/待維修設備",
      position: "top",
    });
    return;
  }

  dialogAttrs.value.tempData.providers =
    currentBlockType.value?.deviceSelectResult
      .map((item) => item.maintainVendor)
      .filter(
        (value, index, self) =>
          self.findIndex((item) => item?.id === value?.id) === index &&
          value !== null
      );

  dialogAttrs.value.tempData.deviceType = currentBlockType.value?.deviceType;
  dialogAttrs.value.tempData.type = currentBlockType.value?.type;
  dialogAttrs.value.tempData.building = buildingData.value;
  dialogAttrs.value.tempData.creationDate = new Date();

  const maintainListNameArr = currentBlockType.value?.deviceSelectResult
    .map((item) => item.maintainVendor?.name)
    .filter(
      (value, index, self) =>
        self.indexOf(value) === index && value !== null && value !== undefined
    );
  dialogAttrs.value.tempData.name =
    maintainListNameArr?.length > 1
      ? `${maintainListNameArr.join("、")} 【${
          dialogAttrs.value.tempData.deviceType.name
        } 維修保養單】`
      : `${maintainListNameArr} 【${
          dialogAttrs.value.tempData.deviceType.name
        } ${
          dialogAttrs.value.tempData.type === MaintainTypes.Maintain
            ? "保養單"
            : "維修單"
        }】`;
}
const remindBlock = ref<blockType[]>([
  {
    label: "保養提醒",
    icon: matHomeRepairService,
    value: "Maintain",
    num: 0,
    deviceSelectResult: [],
    deviceType: null,
    type: MaintainTypes.Maintain,
  },
  {
    label: "待維修",
    icon: matError,
    value: "Fault",
    num: 0,
    deviceSelectResult: [],
    deviceType: null,
    type: MaintainTypes.Fault,
  },
]);

const maintainRemindDeviceAllData = ref<DeviceViewModel[]>([]);
const faultRemindDeviceAllData = ref<DeviceViewModel[]>([]);

function getRemindBlockData() {
  remindBlock.value.forEach(async (item) => {
    if (item.value === "Maintain") {
      const maintainRemindResult =
        (await Maintain.apiGetMaintainDevices()) as typeof AxiosResponse;

      item.deviceSelectResult = maintainRemindResult.data;
      item.num = maintainRemindResult.data.length;
      maintainRemindDeviceAllData.value = maintainRemindResult.data;
    } else if (item.value === "Fault") {
      const FaultResult =
        (await Maintain.apiGetFaultyDevices()) as typeof AxiosResponse;
      item.deviceSelectResult = FaultResult.data;
      item.num = FaultResult.data.length;
      faultRemindDeviceAllData.value = FaultResult.data;
    }
  });
  console.log("remindBlock.value", remindBlock.value);
}

onMounted(async () => {
  dialogAttrs.value.dialogTitle = "維護保養單";
  blockAttrs.value.tableConfig = maintainListTableConfig as tableConfigItem[];
  blockAttrs.value.headerButtons = ["deleteMany"];
  await getData();
});
watch(
  () => currentBlockType.value?.deviceType,
  (newVal) => {
    // 只要選擇了設備種類，預設所選設備為該種類的所有設備。
    if (newVal && currentBlockType.value) {
      let allDataType;
      if (currentBlockType.value.value === "Maintain") {
        allDataType = maintainRemindDeviceAllData.value;
      } else if (currentBlockType.value.value === "Fault") {
        allDataType = faultRemindDeviceAllData.value;
      }
      if (allDataType) {
        currentBlockType.value.deviceSelectResult = allDataType.filter(
          (item: DeviceViewModel) =>
            item.deviceType.id === currentBlockType.value?.deviceType?.id
        );
      }
    }
  }
);

const deviceSelectOptions = ref<DeviceViewModel[]>([]);
const deviceTypesSelectOptions = ref<DeviceTypeViewModel[]>([]);

async function selectListChange(props: string, tempData: tempDataType) {
  console.log("selectListChange", props);
  if (props === "Maintain") {
    const result =
      (await Maintain.apiGetMaintainDevices()) as typeof AxiosResponse;
    deviceSelectOptions.value = result.data;

    const set = new Set();
    deviceTypesSelectOptions.value = deviceSelectOptions.value
      .map((item: DeviceViewModel) => item.deviceType)
      .filter((item) => (!set.has(item.id) ? set.add(item.id) : false));

    deviceSelectOptions.value = result.data.filter(
      (item: DeviceViewModel) =>
        item.deviceType.id === currentBlockType.value?.deviceType?.id
    );
  } else if (props === "Fault") {
    const result =
      (await Maintain.apiGetFaultyDevices()) as typeof AxiosResponse;
    deviceSelectOptions.value = result.data;

    const set = new Set();
    deviceTypesSelectOptions.value = deviceSelectOptions.value
      .map((item: DeviceViewModel) => item.deviceType)
      .filter((item) => (!set.has(item.id) ? set.add(item.id) : false));
    deviceSelectOptions.value = result.data.filter(
      (item: DeviceViewModel) =>
        item.deviceType.id === currentBlockType.value?.deviceType?.id
    );
  }
}

// 建立維修保養單
async function onSubmit() {
  // 開啟email視窗
  mailDialogVisible.value = true;
  dialogAttrs.value.tempData.deviceMaintains.forEach((item: tempDataType) => {
    item.device.keeperUnit = null;
  });
  await handleDialog("add", dialogAttrs.value.tempData);
  await getData();
  dialogVisible.value = false;

  console.log("onSubmit", dialogAttrs.value.tempData);
}
// mail
const mailDialogVisible = ref(false);
async function sendEmail(tempData: tempDataType) {
  // 更新維保大項的寄送郵件欄位為true
  const currentData = Object.keys(tempData).length
    ? tempData
    : currentMaintainData.value;
  console.log("sendEmail", currentData);
  if (currentData) {
    const mailObj = {
      mail: [
        ...currentData.providers.map(
          (item: ProviderViewModel) => item.chargeEmail
        ),
        ...currentData.providers.map(
          (item: ProviderViewModel) => item.contactEmail
        ),
      ]
        .filter((item) => item)
        .join(","),

      deviceType: currentData?.deviceType.name,
      type: currentData?.type,
    };
    // 撈出該細項的資料，組成郵件內容。
    window.location.href = `mailto:${mailObj.mail}?subject=【維護保養通知】${
      currentData?.name
    }&body=
    (系統發送維保通知)
    %0D%0A%0D%0A
    大樓資訊 : ${buildingData.value?.name} | ${buildingData.value?.address}
    %0D%0A%0D%0A
    維保種類 : ${mailObj.deviceType}
    %0D%0A%0D%0A
    維保內容 : ${
      mailObj.type === MaintainTypes.Maintain
        ? "年度例行保養通知"
        : "設備故障通知"
    }
    %0D%0A%0D%0A
    請設備廠商盡快與相關人員聯繫保養事宜。`;

    if (!currentData.isEmailSent) {
      currentData.isEmailSent = true;
      await handleDialog("edit", currentData);
    }
  }
}

// dialogTable
const dialogTableVisible = ref(false);
const dialogTableInTableVisible = ref(false);
const dialogTableTitle = ref("");
const maintainDeviceSelectArray = ref<DeviceMaintainViewModel[]>([]);

watch(dialogTableVisible, (newVal) => {
  if (!newVal) {
    getData();
    resetSelect();
  }
});
watch(dialogTableInTableVisible, (newVal) => {
  if (!newVal) {
    dialogTableTitle.value = "維保細項";
    getTableData();
    resetSelect();
  }
});
async function getTableData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  API = MaintainDevice;
  pagination.maintainId = currentMaintainData.value?.id;
  await getTableMixin(API, pagination);
}

// table in table
// 事件處理紀錄
const tableInTableRef = ref<blockRefType>();

const tableInTableMixin = tableMixin(tableInTableRef as Ref<blockRefType>);
const tableInTableDialogAttrs = tableInTableMixin.dialogAttrs;
const tableInTableBlockAttrs = tableInTableMixin.blockAttrs;
const handleTableInTableSelectArray = tableInTableMixin.handleSelectArray;
const handleTableInTableMixin = tableInTableMixin.handleBlockMixin;
const handleTableInTableDialogMixin = tableInTableMixin.handleDialogMixin;
const TableInTableResetSelect = tableInTableMixin.resetSelect;
const hideTableInTableDialog = tableInTableMixin.hideDialog;

const tableInTableBlockEvent = computed(() => {
  return {
    handleBlock: handleTableInTableBlock,
    handleSelectArray: handleTableInTableSelectArray,
    changeBlockData: getTableInTableData,
  };
});
const tableInTableDialogEvent = computed(() => {
  return {
    handleDialog: handleTableInTableDialog,
  };
});

const maintainRecordAPI = MaintainRecord;
async function handleTableInTableBlock(
  btn: { label: string; icon: string; status: string },
  data: tempDataType
) {
  await handleTableInTableMixin(
    btn,
    data,
    maintainRecordAPI,
    getTableInTableData
  );
  if (btn.status === "add") {
    tableInTableDialogAttrs.value.tempData.isDisplay = true;
    tableInTableDialogAttrs.value.tempData.user = userData.value;
  }
}
async function getTableInTableData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  pagination.deviceMaintainId = currentMaintainDeviceData.value?.id;
  await getDataMixin(
    maintainRecordAPI,
    pagination,
    tableInTableBlockAttrs.value
  );
  setBlockLoading(tableInTableRef);
}

// 在新增/編輯 dialog 上的操作
function handleTableInTableDialog(status: string, data: tempDataType) {
  if (status === "add") {
    data.deviceMaintainId = currentMaintainDeviceData.value?.id;
  }
  handleTableInTableDialogMixin(
    status,
    maintainRecordAPI,
    getTableInTableData,
    data
  );
}

const tableActiveTab = ref({
  label: "",
  value: "",
});
async function tableTabChange(tempData: DeviceMaintainViewModel) {
  console.log("tableTabChange", tempData);
  if (tempData) {
    tableActiveTab.value = {
      label: tempData.device?.name || "",
      value: String(tempData.id),
    };
  }
  currentMaintainDeviceData.value = tempData;
  if (dialogAttrs.value.status === "maintainRecord") {
    nextTick(() => {
      tableInTableBlockAttrs.value.tableConfig =
        maintainRecordTableConfig as tableConfigItem[];
      tableInTableBlockAttrs.value.headerButtons = ["add", "deleteMany"];
    });
  } else {
    nextTick(() => {
      tableInTableBlockAttrs.value.tableConfig =
        maintainRecordTableConfig as tableConfigItem[];
      tableInTableBlockAttrs.value.headerButtons = [];
      tableInTableBlockAttrs.value.tableButtons = [];
    });
  }
}

async function updateToggle(
  tempData: MaintainRecordViewModel | MaintainRecordViewModel[]
) {
  console.log("updateToggle", tempData);
  await handleTableInTableDialog("edit", tempData);
}

async function handleCheckbox(tempData: DeviceMaintainViewModel) {
  console.log("handleCheckbox", tempData);
  await handleDialog("edit", tempData);
  // 新增事件處理紀錄
  await handleDialogMixin("add", MaintainRecord, getTableData, [
    {
      deviceMaintainId: tempData.id,
      user: userData.value,
      message: `${userData.value.fullname} 確認為${
        tempData.isDone ? "已完成" : "未完成"
      }`,
      isDisplay: true,
    },
  ]);
}

// 完成日期提醒
function handleDate(configName: string) {
  console.log("handleDate", configName);
  if (
    configName === "completionDate" &&
    !dialogAttrs.value.tempData[configName]
  ) {
    $q.dialog({
      title: "提示",
      message:
        "完成日期一旦填寫並儲存後，並不能刪除，只能進行日期編修，請二次確認該單完成後再填寫。",
      ok: "確定",
      cancel: "取消",
    });
  }
}
</script>
<style scoped lang="scss">
:deep(.q-field__native[type="date"]::-webkit-calendar-picker-indicator) {
  cursor: pointer;
  position: absolute;
  right: 0;
  padding-left: calc(100% - 40px);
  padding-right: 10px;
}
</style>
