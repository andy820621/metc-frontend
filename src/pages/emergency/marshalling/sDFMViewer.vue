<template>
  <q-page class="q-pa-md" v-touch-swipe.mouse="handleSwipe">
    <div v-if="$q.screen.xs || $q.screen.sm" class="text-h5 text-bold q-mb-md">
      消防編組
    </div>
    <div
      class="row"
      :class="[
        {
          'q-pa-md bg-white border-1 rounded-lg': $q.screen.xs || $q.screen.sm,
        },
        { 'q-col-gutter-md': !($q.screen.xs || $q.screen.sm) },
      ]"
    >
      <!-- 左側: 消防編組成員即時狀況顯示 -->
      <div
        class="row full-width q-mb-md q-pa-sm rounded-lg"
        v-if="$q.screen.xs || $q.screen.sm"
        style="background-color: #f3eee7"
      >
        <div class="col-6">
          <q-btn
            :flat="mobileDisplayStatus !== 'peopleList'"
            color="white"
            text-color="primary"
            label="編組名單"
            size="lg"
            class="full-width text-bold"
            style="border-radius: 10px"
            @click="mobileDisplayStatus = 'peopleList'"
          />
        </div>
        <div class="col-6">
          <q-btn
            :flat="mobileDisplayStatus !== 'emgyAction'"
            color="white"
            text-color="primary"
            label="緊急通知紀錄"
            size="lg"
            class="full-width text-bold"
            style="border-radius: 10px"
            @click="mobileDisplayStatus = 'emgyAction'"
          />
        </div>
        <q-separator></q-separator>
      </div>

      <div
        class="col-12 col-md-9"
        v-if="
          $q.screen.xs || $q.screen.sm
            ? mobileDisplayStatus === 'peopleList'
            : true
        "
      >
        <!-- Header  -->
        <div class="flex justify-between items-center q-mb-md">
          <div
            class="flex items-center q-mb-xs-md q-mb-sm-none"
            :style="{ width: $q.screen.xs || $q.screen.sm ? '100%' : '25%' }"
          >
            <!-- 樓層群組選擇 -->
            <q-select
              style="width: 50%"
              v-model="currentFloorGroup"
              :options="floorGroupOptions"
              emit-value
              map-options
              class="q-mr-md"
            >
              <template v-slot:selected-item="scope">
                <span>{{ scope.opt.name }}</span>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section>
                    <q-item-label>{{ scope.opt.name }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
            </q-select>

            <!-- 按鈕: 列印 -->
            <q-btn
              outline
              color="primary"
              :icon="mdiPrinter"
              @click.prevent="print(tableContent, '消防編組清單', true)"
            >
              <q-tooltip
                class="text-body2"
                transition-show="scale"
                transition-hide="scale"
                anchor="top middle"
                self="bottom middle"
                :offset="[10, 10]"
              >
                列印
              </q-tooltip>
            </q-btn>
          </div>
        </div>
        <div class="flex q-mb-md q-col-gutter-md">
          <div
            v-for="(item, index) in Object.values(peopleList)"
            :key="index"
            class="cardContainer"
          >
            <q-card
              :flat="item.id !== currentGroupData.id"
              bordered
              class="q-pa-md q-pa-lg-md text-center cursor-pointer fit"
              @click="currentGroupData = item"
              style="border-width: 2px; background: #f3eee7"
              :class="{ 'bg-white shadow-3': item.id === currentGroupData.id }"
            >
              <div
                class="bg-red absolute-right q-ma-md"
                style="border-radius: 50%; height: 10px; width: 10px"
                v-if="
                  item.unReadMissionCount && item.id !== currentGroupData.id
                "
              ></div>

              <q-icon
                v-if="item.id === currentGroupData.id"
                :name="mdiCheckCircle"
                color="primary"
                size="sm"
                class="absolute-right q-ma-sm"
              ></q-icon>
              <div class="flex column justify-between fit">
                <div class="text-bold text-h6 q-mb-sm">
                  {{ item.name }} {{ item.members.length }}人
                </div>
                <div>
                  <div class="text-bold text-body1">
                    未定位
                    {{ 10 }}
                    人
                  </div>
                  <div class="text-bold text-body1">
                    未撤退
                    {{ 10 }}
                    人
                  </div>
                </div>
              </div>
            </q-card>
          </div>
        </div>
        <!-- 消防編組全員呼叫指示 -->
        <q-card
          v-if="$q.screen.xs || $q.screen.sm"
          ref="instructionRef"
          class="marshalling-instructions"
          bordered
        >
          <div class="title">消防編組全員呼叫指示</div>
          <div class="btn-container">
            <q-btn
              class="q-py-sm text-h6 text-bold full-width bg-red text-white"
              @click="handleBtnClick()"
              :disable="isCommonCommunityUser"
            >
              定位
            </q-btn>
            <q-btn
              class="q-py-sm text-h6 text-bold full-width bg-positive text-white"
              @click="handleBtnClick('retreat')"
              :disable="isCommonCommunityUser"
            >
              撤退
            </q-btn>
          </div>
        </q-card>
        <div class="row" id="print-area">
          <div class="col-4 col-md-2" v-if="!($q.screen.xs || $q.screen.sm)">
            <div
              class="flex flex-center bg-header-row fit text-subtitle1 text-bold q-pa-sm border-1"
            >
              班別
            </div>
          </div>
          <div class="col-8 col-md-10" v-if="!($q.screen.xs || $q.screen.sm)">
            <div
              class="flex flex-center bg-header-row fit text-subtitle1 text-bold q-pa-sm border-1"
            >
              編組成員
            </div>
          </div>
          <div class="full-width">
            <!-- <SDFMViewerPeople
              v-if="currentGroupData"
              :marshallingClass="currentGroupData"
              :processRunning="processRunning"
              :unReadMissionCount="currentGroupData.unReadMissionCount"
              @handleOpenUser="handleOpenUser"
              @openMissionList="clearUnReadMissionCount"
            /> -->
          </div>
        </div>
      </div>
      <!-- 右側 -->
      <div
        class="col-12 col-md-3"
        ref="rightRef"
        v-if="
          $q.screen.xs || $q.screen.sm
            ? mobileDisplayStatus === 'emgyAction'
            : true
        "
      >
        <q-splitter
          class="full-height"
          v-model="splitterModel"
          horizontal
          :limits="[50, splitterHeight + 30]"
          unit="px"
        >
          <template v-slot:before>
            <!-- 人員位置紀錄 & 防護編組事件處理紀錄 -->
            <q-card flat class="full-width q-pb-xs" bordered>
              <q-tabs
                v-model="tab"
                class="text-grey"
                active-color="primary"
                indicator-color="primary"
                align="justify"
                narrow-indicator
                outside-arrows
                mobile-arrows
                inline-label
              >
                <q-tab
                  label="人員位置紀錄"
                  name="人員位置紀錄"
                  :icon="tab === '人員位置紀錄' ? mdiCheckCircle : undefined"
                />
                <q-tab
                  label="防護編組事件處理紀錄"
                  name="防護編組事件處理紀錄"
                  :icon="
                    tab === '防護編組事件處理紀錄' ? mdiCheckCircle : undefined
                  "
                />
                <q-tab
                  label="緊急通知訊息對話框"
                  name="緊急通知訊息對話框"
                  :icon="
                    tab === '緊急通知訊息對話框' ? mdiCheckCircle : undefined
                  "
                />
              </q-tabs>

              <q-separator />

              <q-tab-panels v-model="tab" animated>
                <q-tab-panel
                  name="人員位置紀錄"
                  :style="`height: ${topPanelHeight}px`"
                >
                  <div class="text-grey text-center">尚未有資料</div>
                </q-tab-panel>

                <q-tab-panel
                  name="防護編組事件處理紀錄"
                  :style="`height: ${topPanelHeight}px`"
                >
                  <div class="text-grey text-center">尚未有資料</div>
                </q-tab-panel>

                <q-tab-panel
                  name="緊急通知訊息對話框"
                  :style="`height: ${topPanelHeight}px`"
                >
                  <div
                    v-if="!emergencyMsgArray.length"
                    class="text-grey text-center"
                  >
                    尚未有資料
                  </div>
                  <div v-for="(item, idx) in emergencyMsgArray" :key="idx">
                    <div>
                      <span>{{ item.submissionTime }}</span>
                      <span>&nbsp; - &nbsp;</span>
                      <span>
                        <a
                          v-if="item.textContent.includes('https://')"
                          :href="item.textContent"
                          target="_blank"
                          style="text-decoration: underline; color: darkblue"
                        >
                          {{ item.textContent }}
                        </a>
                        <span v-else>{{ item.textContent }}</span>
                        <span> (給{{ item.role }})</span>
                      </span>
                    </div>
                  </div>
                </q-tab-panel>
              </q-tab-panels>
            </q-card>
          </template>

          <template v-slot:separator>
            <q-avatar
              color="primary"
              text-color="white"
              size="40px"
              :icon="mdiArrowSplitHorizontal"
              style="left: initial; right: -16px"
            />
          </template>

          <template v-slot:after>
            <div class="full-height q-pt-xs">
              <q-scroll-area
                class="fit"
                :visible="false"
                :style="{
                  'min-height': $q.screen.xs || $q.screen.sm ? '300px' : '',
                }"
              >
                <!-- 消防編組全員呼叫指示 -->
                <q-card
                  v-if="!($q.screen.xs || $q.screen.sm)"
                  ref="instructionRef"
                  class="marshalling-instructions"
                  bordered
                >
                  <div class="title">消防編組全員呼叫指示</div>
                  <div class="btn-container">
                    <q-btn
                      class="q-py-sm text-h6 text-bold full-width bg-red text-white"
                      @click="handleBtnClick()"
                      :disable="isCommonCommunityUser"
                    >
                      定位
                    </q-btn>
                    <q-btn
                      class="q-py-sm text-h6 text-bold full-width bg-positive text-white"
                      @click="handleBtnClick('retreat')"
                      :disable="isCommonCommunityUser"
                    >
                      撤退
                    </q-btn>
                  </div>
                </q-card>

                <!-- 緊急通知訊息對話框 -->
                <q-card
                  v-if="!isCommonCommunityUser"
                  flat
                  ref="notificationRef"
                  class="emergency-notification-message border-1"
                  :class="{ 'q-mt-md': !($q.screen.xs || $q.screen.sm) }"
                  bordered
                >
                  <div class="title">緊急通知訊息對話框</div>
                  <div
                    class="select-container flex-nowrap flex-col"
                    style="gap: 1rem"
                  >
                    <q-select
                      dense
                      filled
                      v-model="modelMultiple"
                      multiple
                      :options="selectOptions"
                      option-value="id"
                      option-label="description"
                      options-selected-class="bg-grey-3"
                      use-chips
                      hint="請選擇要發送的對象，或透過下方群組按鈕快速選擇"
                    >
                      <template v-slot:prepend v-if="!modelMultiple.length">
                        <span style="font-size: 1.1rem; color: #66666666">
                          請選擇要發送的對象
                        </span>
                      </template>
                    </q-select>
                    <div class="select-btnBox row">
                      <q-btn-group flat class="row q-col-gutter-md flex-grow-1">
                        <div
                          class="col-6"
                          v-for="item in btnOptions"
                          :key="item.value"
                        >
                          <q-btn
                            :size="$q.screen.xs || $q.screen.sm ? 'md' : ''"
                            :label="item.label"
                            :class="[
                              { selected: item.selected },
                              {
                                'q-mt-sm full-width':
                                  $q.screen.xs || $q.screen.sm,
                              },
                            ]"
                            class="q-px-md"
                            dense
                            @click="handleClickGroupBtn(item)"
                          />
                        </div>
                      </q-btn-group>
                    </div>
                  </div>
                  <div class="submit-container">
                    <q-select
                      dense
                      filled
                      v-model="emergencyMessage"
                      use-input
                      hide-selected
                      fill-input
                      input-debounce="0"
                      :options="messageOptions"
                      @filter="handleFilterMessageOptions"
                      @focus="isFocused = true"
                      @blur="isFocused = false"
                      @input-value="setEmergencyMessage"
                    >
                      <template
                        v-slot:prepend
                        v-if="!isFocused && emergencyMessage === ''"
                      >
                        <span style="font-size: 1.1rem; color: #66666666">
                          請輸入訊息內容
                        </span>
                      </template>
                      <template v-slot:no-option>
                        <q-item>
                          <q-item-section class="text-grey">
                            沒有找到相符的罐頭訊息
                          </q-item-section>
                        </q-item>
                      </template>
                    </q-select>

                    <q-btn
                      label="送出"
                      type="submit"
                      color="primary"
                      @click.prevent="submitMessage"
                    />
                  </div>
                </q-card>
              </q-scroll-area>
            </div>
          </template>
        </q-splitter>
      </div>
    </div>
  </q-page>

  <DialogContact :account="accountData" v-model="visible" />
</template>

<script setup lang="ts">
// quasar
import { mdiPrinter, mdiCheckCircle } from '@quasar/extras/mdi-v6';

// icon
import { mdiArrowSplitHorizontal } from '@quasar/extras/mdi-v7';

// pinia store
import { storeToRefs } from 'pinia';
import { useBuildingStore } from 'src/stores/building.js';

// utils
import { print, getTable } from 'src/utils/usePrint';
import FileReadMixin from 'src/utils/fileRead';
import { useCloned } from '@vueuse/core';
import { compareByDateTime } from 'src/utils/formatUtils';

// type
import { iconLabels } from '../flow/processIconOptions';

// assets
import mugShotUrl from 'src/assets/image/mugShotPlaceHolder.png';
import { date, useQuasar } from 'quasar';
import { useUserStore } from 'src/stores/user';

const userStore = useUserStore();
const { userData } = storeToRefs(userStore);

const { isSystem, isManager, isCenter } = storeToRefs(userStore);
const isCommonCommunityUser = computed(() => {
  return (
    userData.value.isCommunityUser &&
    !isSystem.value &&
    !isManager.value &&
    !isCenter.value
  );
});

const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);

const $q = useQuasar();

// DialogContact 部分
const visible = ref(false);
const accountData = ref<any>();
function handleOpenUser(content: any) {
  visible.value = true;
  accountData.value = content;
}

const currentFloorGroup = ref<any>();
const floorGroupOptions = ref<any[]>([]);
const currentGroupData = ref();
// watch(
//   Bid,
//   async (val) => {
//     if (val) {
//       await getAreaData(val);
//       currentFloorGroup.value = floorGroupOptions.value[0];
//     }
//   },
//   { immediate: true }
// );
watch(currentFloorGroup, () => {
  if (currentFloorGroup.value) {
    getSDFMData();
  }
});
const tableContent = '';

const { getFile } = FileReadMixin();
function getSDFMData() {
  console.log('getSDFMData');
}

const peopleList = ref<{
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  [id: number]: any & { unReadMissionCount: number };
}>({});
const classMembersObject = ref<{
  [id: number]: any[];
}>({});

// Spitter 設定
const splitterModel = ref(350); // unit is px
const splitterHeight = ref(700);
const rightRef = ref();
const instructionRef = ref();
const notificationRef = ref();

// 固定高度參數
const SPLITTER_LINE_HEIGHT = 20;
const TOP_TABS_HEIGHT = 36;
const TOP_PADDING = 10;

onMounted(() => {
  splitterHeight.value = rightRef.value?.getBoundingClientRect().height ?? 700;

  console.log('now topPanelHeight', splitterHeight.value, topPanelHeight.value);
});
const topPanelHeight = computed(
  () =>
    splitterModel.value -
    TOP_TABS_HEIGHT -
    TOP_PADDING -
    SPLITTER_LINE_HEIGHT / 2,
);

// 消防編組全員呼叫指示
function handleBtnClick(btnType: string | null = null) {
  console.log('handleBtnClick');
  const submitData = {
    RoleNames: marshallingOptions.map((role) => role.name),
    BuildingId: Bid.value,
  };

  if (btnType === 'retreat') {
    $q.dialog({
      title: '提示',
      message: '確定要編組成員全員撤退嗎?',
      persistent: true,
      ok: {
        push: true,
        label: '確定',
      },
      cancel: '取消',
    }).onOk(() => {
      console.log('OK');
    });
  } else {
    $q.dialog({
      title: '提示',
      message: '確定要編組成員全員定位嗎?',
      persistent: true,
      ok: {
        push: true,
        label: '確定',
      },
      cancel: '取消',
    }).onOk(() => {
      console.log('OK');
    });
  }
}

const tab = ref('人員位置紀錄');

// 緊急通知訊息對話框
// Select
interface roleSelectOptions {
  id: string;
  type: number;
  name: string;
  description: string;
  isEmergency: boolean;
}

const modelMultiple = ref<roleSelectOptions[]>([]);
const roleOptions = reactive<roleSelectOptions[]>([]);
const marshallingOptions = reactive<roleSelectOptions[]>([]);
const selectOptions = computed(() => [...roleOptions, ...marshallingOptions]);

const btnOptions = reactive([
  { value: 'all', label: '全選所有身分類別', selected: false },
  { value: 'allMarshalling', label: '全選所有消防編組', selected: false },
]);
function handleClickGroupBtn(btn: { value: string; selected: boolean }) {
  if (btn.value === 'all') {
    if (btn.selected) modelMultiple.value = [];
    else modelMultiple.value = [...roleOptions, ...marshallingOptions];
  } else {
    if (btn.selected) {
      modelMultiple.value = modelMultiple.value.filter(
        (item) => !marshallingOptions.some((option) => option.id === item.id),
      );
    } else {
      const missingOptions = marshallingOptions.filter(
        (option) => !modelMultiple.value.some((item) => item.id === option.id),
      );
      modelMultiple.value = [...modelMultiple.value, ...missingOptions];
    }
  }
}
watch(modelMultiple, (newValue) => {
  const allSelected = newValue.length === selectOptions.value.length;
  btnOptions[0].selected = allSelected;
  if (allSelected) {
    btnOptions[1].selected = allSelected;
    return;
  }
  const hasAllMarshalling = marshallingOptions.every((option) =>
    newValue.some((item) => item.id === option.id),
  );
  btnOptions[1].selected = hasAllMarshalling;
});

// Submit
let stringOptions: string[] = [];
const messageOptions = ref<string[]>([]);
const emergencyMessage = ref('');
const isFocused = ref(false);

onMounted(() => {
  // messageOptions.value = stringOptions = result.data.map(
  //   (item: SystemViewModel) => item.label
  // );
  messageOptions.value = stringOptions = [];
});
function handleFilterMessageOptions(
  val: string,
  update: (fn: () => void) => void,
) {
  update(() => {
    const needle = val.toLowerCase();
    messageOptions.value = stringOptions.filter((option) =>
      option.toLowerCase().includes(needle),
    );
  });
}
function submitMessage() {
  if (!modelMultiple.value || !modelMultiple.value.length) {
    $q.notify({
      type: 'warning',
      message: '請先選擇發送對象',
      position: 'top',
    });
    return;
  }
  if (emergencyMessage.value === '') {
    $q.notify({
      type: 'warning',
      message: '請先輸入要發送的內容',
      position: 'top',
    });
    return;
  }

  const submitData = {
    RoleNames: modelMultiple.value.map((role) => role.name),
    Message: emergencyMessage.value,
    BuildingId: Bid.value,
  };

  console.log('submitMessage submitData: ', submitData);
  // signalRStore.emergencyHub?.sendEmergencyMessage?.(submitData); // TODO: 待實作
}
function setEmergencyMessage(val: string) {
  emergencyMessage.value = val;
}

// 列印
const tableTitle = {
  dutyType: '班別模式',
  className: '班別',
  position: '職位',
  photo: '照片',
  fullname: '姓名',
  phoneNumber: '電話',
  areaName: '樓層群組',
};
function getTdContent(data: any[]) {
  return data.map((classes) => {
    // console.log("classes", classes);
    const tempData = {
      dutyType: '',
      className: '',
      position: '',
      photo: '',
      fullname: '',
      phoneNumber: '',
      areaName: '',
    };

    tempData.className += `<p>${classes.name}</p>`;
    tempData.areaName += `<p>${classes.area ? classes.area.name : ''}</p>`;
    tempData.dutyType += `<p>${dutyTypeNumToName(classes).join('<br>')}</p>`;

    [...classes.members].forEach((member) => {
      tempData.position += `<p>${
        classes.classLeaderUserId === member.id
          ? "<span style='color:red;'>班長 ✔</span>"
          : ''
      }</p>`;
      if (member.mugShotFileId) {
        tempData.photo += `
            <div>
              <img src="${member.mugShotUrl}" alt="image">
            </div>
            `;
      } else {
        tempData.photo += `
            <div>
              <img src="${mugShotUrl}" alt="image">
            </div>
            `;
      }
      tempData.fullname += `<p>${member.fullname}</p>`;
      tempData.phoneNumber += `<p>${member.phoneNumber || '尚未設定'}</p>`;
    });

    return tempData;
  });
}
const dutyType = {
  1: '平日',
  2: '夜間',
  4: '假日',
  8: '其他',
};
function dutyTypeNumToName(data: any) {
  const dutyTypeNum: number[] = [];
  const dutyTypeArr = Object.keys(dutyType).map(Number);
  dutyTypeArr.forEach((num) => {
    const result = data.dutyType & num;
    if (result === num) dutyTypeNum.push(num);
  });
  return dutyTypeNum.map((item) => dutyType[item as keyof typeof dutyType]);
}

const mobileDisplayStatus = ref('peopleList');

function handleSwipe(ev: any) {
  if (ev.touch && ev.direction === 'right') {
    mobileDisplayStatus.value = 'peopleList';
  } else if (ev.touch && ev.direction === 'left') {
    mobileDisplayStatus.value = 'emgyAction';
  }
}

// 應變訊息框
const emergencyMsgArray = ref<
  {
    role: string;
    submissionTime: string;
    textContent: string;
  }[]
>([]);
watch(
  Bid,
  (val) => {
    if (val) {
      console.log('new Bid', val);
    }
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.bg-header-row {
  background-color: $table-header-row-bg;
}

// 消防編組全員呼叫指示
.marshalling-instructions,
.emergency-notification-message {
  width: 100%;
  padding: 0.75rem;
  background-color: #fff;
  display: grid;
  gap: 1rem;
  .title {
    text-align: center;
    background-color: $table-header-row-bg;
    color: $tab-row-text;
    font-size: 1.5em;
    font-weight: 600;
    padding: 0.8rem;
  }
}
.btn-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}
// 緊急通知訊息對話框
.select-container {
  display: flex;
  .q-btn-group {
    .q-btn {
      border: solid 1px grey;
      color: grey;
      font-size: 1.1rem;
      &.selected {
        color: #fff;
        background: $primary;
      }
    }
  }
}
.submit-container {
  display: flex;
  gap: 1rem;
  label {
    flex: 1;
  }
}

.cardContainer {
  width: 50%;
  @media screen and (min-width: 600px) {
    width: 20%;
  }
}
</style>
