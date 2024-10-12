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
                    {{ UnlocatedPplNum(item) }}
                    人
                  </div>
                  <div class="text-bold text-body1">
                    未撤退
                    {{ unEvacuatedPplNum(item) }}
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
            <SDFMViewerPeople
              v-if="currentGroupData"
              :marshallingClass="currentGroupData"
              :processRunning="processRunning"
              :unReadMissionCount="currentGroupData.unReadMissionCount"
              @handleOpenUser="handleOpenUser"
              @openMissionList="clearUnReadMissionCount"
            />
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
                  <div
                    v-if="!positionAndRetreatLists.length"
                    class="text-grey text-center"
                  >
                    尚未有資料
                  </div>
                  <div
                    v-for="(item, index) in positionAndRetreatLists"
                    :key="index"
                  >
                    <div>
                      <span>
                        {{ item.dateTime }}
                      </span>
                      <span> - </span>
                      <template v-if="item.user?.fullname">
                        <span>{{ item.user.fullname }}&nbsp;</span>
                      </template>
                      <template v-if="!item.user && item.positionUser">
                        <span>{{ item.positionUser.fullname }}&nbsp;</span>
                      </template>

                      <template v-if="item.nodeLabel">
                        <span
                          v-if="
                            item.nodeType === iconLabels.Fire ||
                            item.nodeType === iconLabels.Not
                          "
                        >
                          確認</span
                        >
                        <span>{{ item.nodeLabel }}</span>
                      </template>
                    </div>
                  </div>
                </q-tab-panel>

                <q-tab-panel
                  name="防護編組事件處理紀錄"
                  :style="`height: ${topPanelHeight}px`"
                >
                  <div
                    v-if="!sDFMNodesLists.length"
                    class="text-grey text-center"
                  >
                    尚未有資料
                  </div>
                  <div v-for="(item, index) in sDFMNodesLists" :key="index">
                    <div>
                      <span>
                        {{ item.dateTime }}
                      </span>
                      <span> - </span>

                      <template v-if="item.user?.fullname">
                        <span>{{ item.user.fullname }}&nbsp;</span>
                      </template>

                      <template
                        v-if="
                          item.nodeType === iconLabels.Wait && item.chRoleName
                        "
                      >
                        <span>{{ item.chRoleName }}&nbsp;</span>
                      </template>

                      <template v-if="item.nodeLabel">
                        <span>{{ item.nodeLabel }}</span>
                      </template>
                    </div>
                  </div>
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
import { mdiPrinter, mdiCheckCircle } from "@quasar/extras/mdi-v6";

// icon
import { mdiArrowSplitHorizontal } from "@quasar/extras/mdi-v7";

// api
import Area from "src/api/area";
import sDFM from "src/api/sDFM";
import type { GroupViewModel, GroupMember } from "src/api/sDFM";
import Role, { roleType } from "src/api/role";
import EmergencyHistory, {
  RecordTypes,
  EmergencyRecordViewModel,
} from "src/api/emergencyHistory";
import System, { SystemViewModel, systemType } from "src/api/system";

// pinia store
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
import { useSignalRStore, RoleNameToChName } from "src/stores/signalR"; // websocket signalR
import fireMarshalling from "src/api/fireMarshalling";

// utils
import { print, getTable } from "src/utils/usePrint";
import FileReadMixin from "src/utils/fileRead";
import { useCloned } from "@vueuse/core";
import { compareByDateTime } from "src/utils/formatUtils";

// type
import type { SendViewModel } from "src/stores/signalR";
import type { UserViewModel } from "src/api/accountSetting";
import { iconLabels } from "../flow/processIconOptions";

// assets
import mugShotUrl from "src/assets/image/mugShotPlaceHolder.png";
import { date } from "quasar";
import { useUserStore } from "src/stores/user";

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

const signalRStore = useSignalRStore();
const {
  processRunning,
  nodeRecord,
  locationRecordByGroupId,
  nodeResultFormatAsNodeRecord,
  emgMissionWs,
  emergencyMsg,
  isSavedEmergencyRecordData,
} = storeToRefs(signalRStore);

const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);

const $q = inject("$q") as typeof QVueGlobals;

watch(
  processRunning,
  async (newValue, oldValue) => {
    if (newValue === false && oldValue) {
      // 儲存緊急應變歷史紀錄
      const payload: EmergencyRecordViewModel[] = [];
      const nodeIdArray: string[] = [];

      reversedMessage.value.forEach((msg) => {
        const nodeId = msg.externalNode?.id as string;

        nodeIdArray.push(nodeId); // 記錄用

        const data = {
          nodeId,
          recordType: RecordTypes.EventHandlingRecord,
          dateTimeString: new Date(msg.dateTime).toISOString(),
          name:
            (msg.nodeType === iconLabels.Wait && msg.chRoleName
              ? msg.chRoleName
              : msg.user?.fullname) ?? "",
          label: msg.nodeLabel,
        };
        payload.push(data);
      });

      positionAndRetreatLists.value.forEach((msg) => {
        const nodeId = msg.externalNode?.id as string;

        if (nodeIdArray.includes(nodeId)) return;

        const data = {
          nodeId,
          recordType: RecordTypes.PersonnelLocationRecord,
          dateTimeString: new Date(msg.dateTime).toISOString(),
          name:
            (!msg.user && msg.positionUser
              ? msg.positionUser.fullname
              : msg.user?.fullname) ?? "",
          label: msg.nodeLabel,
        };
        payload.push(data);
      });
      console.log("緊急應變結束 payload", payload);

      const result = (await EmergencyHistory.apiPostData(
        payload
      )) as typeof AxiosResponse;

      console.log("緊急應變結束 result: ", result);
      if (result.data) {
        $q.notify({
          type: "positive",
          message: "緊急應變/人員操作紀錄已被儲存",
          position: "top",
        });
      } else {
        $q.notify({
          type: "negative",
          message: "儲存歷史紀錄失敗",
          position: "top",
        });
      }

      isSavedEmergencyRecordData.value = true;

      reversedMessage.value.length = 0;

      // 結束後清空未讀任務
      Object.values(peopleList.value).forEach((item) => {
        if (item.unReadMissionCount) {
          item.unReadMissionCount = 0;
          $q.localStorage.set("unReadMissionCountObj", 0);
        }
      });
    }
  },
  { immediate: true }
);

// DialogContact 部分
const visible = ref(false);
const accountData = ref<UserViewModel>();
function handleOpenUser(content: UserViewModel) {
  visible.value = true;
  accountData.value = content;
}

const currentFloorGroup = ref<GroupViewModel>();
const floorGroupOptions = ref<GroupViewModel[]>([]);
const currentGroupData = ref();
// 取得消防編組資料
watch(
  nodeRecord,
  (newValue) => {
    if (newValue) {
      console.log("new nodeRecord", newValue);
    }
  },
  { deep: true }
);
watch(
  locationRecordByGroupId,
  (newValue) => {
    if (newValue) {
      console.log("new locationRecordByGroupId", newValue);
    }
  },
  { deep: true, immediate: true }
);
watch(
  Bid,
  async (val) => {
    if (val) {
      await getAreaData(val);
      currentFloorGroup.value = floorGroupOptions.value[0];
    }
  },
  { immediate: true }
);
watch(currentFloorGroup, () => {
  if (currentFloorGroup.value) {
    getSDFMData();
  }
});
async function getAreaData(bid: number) {
  const result = (await Area.apiGetArea(bid)) as typeof AxiosResponse;
  floorGroupOptions.value = result.data;
}
let tableContent = "";

const { getFile } = FileReadMixin();
async function getSDFMData() {
  peopleList.value = {};
  if (currentFloorGroup.value) {
    const areaGroupResult = (await sDFM.apiGetGroupByArea(
      currentFloorGroup.value?.id
    )) as typeof AxiosResponse;

    const allFloorGroup = (await sDFM.apiGetGroupByArea(
      null,
      Bid.value
    )) as typeof AxiosResponse;
    console.log("now allFloorGroup", allFloorGroup.data);

    if (areaGroupResult.data && allFloorGroup.data) {
      const combinedData = [...areaGroupResult.data, ...allFloorGroup.data];
      for (const currentList of combinedData) {
        const { id, members, classLeaderUserId } = currentList;

        for (const ppl of currentList.members) {
          if (ppl.mugShotFileId) {
            ppl.mugShotUrl = ppl.mugShotFileId
              ? await getFile(null, ppl.mugShotFileId)
              : "";
          }
        }
        // 找到班長的 index
        const classLeaderIndex = members.findIndex(
          (member: { id: string }) => member.id === classLeaderUserId
        );
        // 把班長移到第一位
        if (classLeaderIndex !== -1) {
          const classLeader = members.splice(classLeaderIndex, 1)[0];
          members.unshift(classLeader);
        }

        classMembersObject.value[id] = members;
        console.log("nowww members", members);
        peopleList.value[id] = currentList;
      }
      currentGroupData.value = Object.values(peopleList.value)[0];

      console.log("now peopleList", peopleList.value);
      for (const currentList of combinedData) {
        currentList.members.forEach(
          async (item: UserViewModel & { mugShotUrl: string }) => {
            item.mugShotUrl = await item.mugShotUrl;
          }
        );
        setTimeout(() => {
          const tdContent = getTdContent(combinedData.flat());
          tableContent = getTable(tableTitle, tdContent);
        }, 100);
      }

      getUnReadMissionCountData();
    }
  }
}

const peopleList = ref<{
  [id: number]: GroupViewModel & { unReadMissionCount: number };
}>({});
const classMembersObject = ref<{
  [id: number]: UserViewModel[];
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

  console.log("now topPanelHeight", splitterHeight.value, topPanelHeight.value);
});
const topPanelHeight = computed(
  () =>
    splitterModel.value -
    TOP_TABS_HEIGHT -
    TOP_PADDING -
    SPLITTER_LINE_HEIGHT / 2
);

// 人員統計/撤退統計 & 防護編組事件處理紀錄
const tab = ref("人員位置紀錄");
watch(nodeResultFormatAsNodeRecord, () => {
  console.log(
    "now nodeResultFormatAsNodeRecord",
    nodeResultFormatAsNodeRecord.value
  );
});
const reversedMessage = computed<SendViewModel[]>(() => {
  if (nodeResultFormatAsNodeRecord.value.length) {
    return nodeResultFormatAsNodeRecord.value.sort(compareByDateTime).reverse();
  }
  return Object.values(nodeRecord.value)
    .flat()
    .sort(compareByDateTime)
    .reverse();
});
watch(reversedMessage, () => {
  console.log("now reversedMessage", reversedMessage.value);
});
const marshallingTeam = [
  "Fire",
  "Inform",
  "EvacuationGuide",
  "SafetyProtection",
  "Ambulance",
];
const reversedMessageAboutPositioning = computed<SendViewModel[]>(() =>
  reversedMessage.value.filter((record) => {
    const { nodeType, roleName } = record;
    if (nodeType === iconLabels.Wait && !marshallingTeam.includes(roleName)) {
      return false;
    }
    return (
      nodeType === iconLabels.Wait ||
      nodeType === iconLabels.InPosition ||
      nodeType === iconLabels.Retreat ||
      nodeType === iconLabels.Fire ||
      nodeType === iconLabels.Not ||
      nodeType === iconLabels.Success ||
      nodeType === iconLabels.Failure ||
      nodeType === iconLabels.False ||
      nodeType === iconLabels.BootSuccess ||
      nodeType === iconLabels.BootFailure ||
      nodeType === iconLabels.CustomForSendLogViewModel
    );
  })
);

watch(
  reversedMessageAboutPositioning,
  () => {
    console.log(
      "now reversedMessageAboutPositioning",
      reversedMessageAboutPositioning.value
    );
  },
  { immediate: true }
);
// 防護編組事件處理紀錄篩選掉等待節點
const sDFMNodesLists = computed<SendViewModel[]>(() =>
  reversedMessage.value.filter((item) => item.nodeType !== iconLabels.Wait)
);
const positionAndRetreatLists = computed<SendViewModel[]>(() =>
  reversedMessageAboutPositioning.value.reduce((acc, cur) => {
    if (cur.nodeType === iconLabels.Wait) {
      const workflowGroupId = cur.workflowGroupId
        ? cur.workflowGroupId
        : cur.group.id;
      const members = classMembersObject.value[workflowGroupId];
      // TODO: 之後考慮跟以前一樣用 nCMD 或其他方式去做
      if (
        cur.nodeLabel.includes("定位") ||
        cur.nodeLabel.includes("尚未接收訊息")
      ) {
        members?.forEach((member) => {
          const { cloned } = useCloned(cur);
          cloned.value.nodeLabel = "尚未接收訊息";
          cloned.value.positionUser = member;
          acc.push(cloned.value);
        });
      } else {
        const locationRecordObjByGroupId =
          locationRecordByGroupId.value[workflowGroupId];
        if (!locationRecordObjByGroupId) return acc;
        const keys = Object.keys(locationRecordObjByGroupId);
        const InPositionKey = keys.find((key) => key.includes("定位"));
        if (!InPositionKey) return acc;
        const isInPosition =
          locationRecordByGroupId.value[workflowGroupId][InPositionKey];

        if (isInPosition && members) {
          const isInPositionMembers = members.filter((member) =>
            isInPosition.includes(member.id as string)
          );
          isInPositionMembers?.forEach((member) => {
            const { cloned } = useCloned(cur);
            cloned.value.positionUser = member;
            acc.push(cloned.value);
          });
          console.log("isInPositionMembers", isInPositionMembers);
        }
      }
    } else {
      acc.push(cur);
    }
    return acc;
  }, [] as SendViewModel[])
);

watch(
  positionAndRetreatLists,
  () => {
    console.log("now positionAndRetreatLists", positionAndRetreatLists.value);
  },
  { immediate: true }
);

const positionAndRetreatListsSpiltByGroupId = computed(() =>
  positionAndRetreatLists.value.reduce((acc, cur) => {
    const workflowGroupId = cur.workflowGroupId
      ? cur.workflowGroupId
      : cur.group.id;
    if (!acc[workflowGroupId]) {
      acc[workflowGroupId] = [cur];
    } else {
      acc[workflowGroupId].push(cur);
    }
    return acc;
  }, {} as { [id: number]: SendViewModel[] })
);

watch(positionAndRetreatListsSpiltByGroupId, () => {
  console.log(
    "now positionAndRetreatListsSpiltByGroupId",
    positionAndRetreatListsSpiltByGroupId.value
  );
  for (const id in positionAndRetreatListsSpiltByGroupId.value) {
    console.log("now groupId", id);
    const groupPplData = peopleList.value[id];
    console.log("now groupPplData", groupPplData);
    if (!groupPplData) continue;
    const groupLocationData =
      positionAndRetreatListsSpiltByGroupId.value[id].sort(compareByDateTime);
    console.log("now groupLocationData", groupLocationData);
    let isInPosition = false;
    let isRetreat = false;
    const groupLocationObjectByUserId = groupLocationData.reduce(
      (acc, cur) => {
        const { nodeLabel, positionUser, user, nodeType, roleName } = cur;

        if (nodeType === iconLabels.InPosition) {
          isInPosition = true;
        }

        if (nodeType === iconLabels.Retreat) {
          isRetreat = true;
        }
        // 如果是防災中心確認火災的話
        if (
          nodeType === iconLabels.Fire &&
          user?.roles.find((item) => item.name === "Center")
        ) {
          isInPosition = false;
          isRetreat = false;
        }

        if (positionUser) {
          acc[positionUser.id as string] = {
            nodeLabel,
            isInPosition,
            isRetreat,
          };
        }
        if (user) {
          acc[user.id as string] = {
            nodeLabel,
            isInPosition,
            isRetreat,
          };
        }

        return acc;
      },
      {} as {
        [userId: string]: {
          nodeLabel: string;
          isInPosition: boolean;
          isRetreat: boolean;
        };
      }
    );
    console.log("now groupLocationObjectByUserId", groupLocationObjectByUserId);
    groupPplData.members.forEach((acc) => {
      const { id } = acc;
      if (id) {
        acc.state = groupLocationObjectByUserId[id].nodeLabel || "尚未接收訊息";
        acc.isInPosition = groupLocationObjectByUserId[id].isInPosition;
        acc.isRetreat = groupLocationObjectByUserId[id].isRetreat;
      }
    });
    console.log("now peopleList", peopleList.value);
  }
});

// 消防編組全員呼叫指示
function handleBtnClick(btnType: string | null = null) {
  console.log("handleBtnClick");
  const submitData = {
    RoleNames: marshallingOptions.map((role) => role.name),
    BuildingId: Bid.value as number,
  };

  if (btnType === "retreat") {
    $q.dialog({
      title: "提示",
      message: "確定要編組成員全員撤退嗎?",
      persistent: true,
      ok: {
        push: true,
        label: "確定",
      },
      cancel: "取消",
    }).onOk(() => {
      signalRStore.emergencyHub?.sendRetreatRequest?.(submitData);
    });
  } else {
    $q.dialog({
      title: "提示",
      message: "確定要編組成員全員定位嗎?",
      persistent: true,
      ok: {
        push: true,
        label: "確定",
      },
      cancel: "取消",
    }).onOk(() => {
      signalRStore.emergencyHub?.sendLocationRequest?.(submitData);
    });
  }
}

// 緊急通知訊息對話框
// Select
interface roleSelectOptions {
  id: string;
  type: number;
  name: string;
  description: string;
  isEmergency: boolean;
}
onMounted(getRoleOptions);
async function getRoleOptions() {
  const payload = [
    { type: roleType.role, isEmergency: true },
    { type: roleType.class, isEmergency: null },
  ];

  const result = (await Role.apiGetRoles(payload)) as typeof AxiosResponse;
  if (result.data) {
    roleOptions.length = 0;
    marshallingOptions.length = 0;

    result.data.forEach((role: roleSelectOptions) => {
      if (role.type === 1) {
        roleOptions.push(role);
      } else if (role.type === 2) {
        marshallingOptions.push(role);
      }
    });
  }
}

const modelMultiple = ref<roleSelectOptions[]>([]);
const roleOptions = reactive<roleSelectOptions[]>([]);
const marshallingOptions = reactive<roleSelectOptions[]>([]);
const selectOptions = computed(() => [...roleOptions, ...marshallingOptions]);

const btnOptions = reactive([
  { value: "all", label: "全選所有身分類別", selected: false },
  { value: "allMarshalling", label: "全選所有消防編組", selected: false },
]);
function handleClickGroupBtn(btn: { value: string; selected: boolean }) {
  if (btn.value === "all") {
    if (btn.selected) modelMultiple.value = [];
    else modelMultiple.value = [...roleOptions, ...marshallingOptions];
  } else {
    if (btn.selected) {
      modelMultiple.value = modelMultiple.value.filter(
        (item) => !marshallingOptions.some((option) => option.id === item.id)
      );
    } else {
      const missingOptions = marshallingOptions.filter(
        (option) => !modelMultiple.value.some((item) => item.id === option.id)
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
    newValue.some((item) => item.id === option.id)
  );
  btnOptions[1].selected = hasAllMarshalling;
});

// Submit
let stringOptions: string[] = [];
const messageOptions = ref<string[]>([]);
const emergencyMessage = ref("");
const isFocused = ref(false);

onMounted(async () => {
  const result = (await System.apiGetSystemItem(
    systemType.EmergencyNotice
  )) as typeof AxiosResponse;
  messageOptions.value = stringOptions = result.data.map(
    (item: SystemViewModel) => item.label
  );
});
function handleFilterMessageOptions(
  val: string,
  update: (fn: () => void) => void
) {
  update(() => {
    const needle = val.toLowerCase();
    messageOptions.value = stringOptions.filter((option) =>
      option.toLowerCase().includes(needle)
    );
  });
}
function submitMessage() {
  if (!modelMultiple.value || !modelMultiple.value.length) {
    $q.notify({
      type: "warning",
      message: "請先選擇發送對象",
      position: "top",
    });
    return;
  }
  if (emergencyMessage.value === "") {
    $q.notify({
      type: "warning",
      message: "請先輸入要發送的內容",
      position: "top",
    });
    return;
  }

  const submitData = {
    RoleNames: modelMultiple.value.map((role) => role.name),
    Message: emergencyMessage.value,
    BuildingId: Bid.value as number,
  };

  console.log("submitMessage submitData: ", submitData);
  signalRStore.emergencyHub?.sendEmergencyMessage?.(submitData);
}
function setEmergencyMessage(val: string) {
  emergencyMessage.value = val;
}

// 列印
const tableTitle = {
  dutyType: "班別模式",
  className: "班別",
  position: "職位",
  photo: "照片",
  fullname: "姓名",
  phoneNumber: "電話",
  areaName: "樓層群組",
};
function getTdContent(data: GroupViewModel[]) {
  return data.map((classes) => {
    // console.log("classes", classes);
    const tempData = {
      dutyType: "",
      className: "",
      position: "",
      photo: "",
      fullname: "",
      phoneNumber: "",
      areaName: "",
    };

    tempData.className += `<p>${classes.name}</p>`;
    tempData.areaName += `<p>${classes.area ? classes.area.name : ""}</p>`;
    tempData.dutyType += `<p>${dutyTypeNumToName(classes).join("<br>")}</p>`;

    [...classes.members].forEach(async (member) => {
      tempData.position += `<p>${
        classes.classLeaderUserId === member.id
          ? "<span style='color:red;'>班長 ✔</span>"
          : ""
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
      tempData.phoneNumber += `<p>${member.phoneNumber || "尚未設定"}</p>`;
    });

    return tempData;
  });
}
const dutyType = {
  1: "平日",
  2: "夜間",
  4: "假日",
  8: "其他",
};
function dutyTypeNumToName(data: GroupViewModel) {
  const dutyTypeNum: number[] = [];
  const dutyTypeArr = Object.keys(dutyType).map(Number);
  dutyTypeArr.forEach((num) => {
    const result = data.dutyType & num;
    if (result === num) dutyTypeNum.push(num);
  });
  return dutyTypeNum.map((item) => dutyType[item as keyof typeof dutyType]);
}

// 未定位、未撤退人員計算
// 未定位
const UnlocatedPplNum = computed(
  () => (classes: GroupViewModel & { UnlocatedPplNum?: number }) => {
    if (processRunning.value) {
      classes.UnlocatedPplNum = classes.members?.filter(
        (item) => !item.isInPosition
      ).length;
    } else {
      classes.UnlocatedPplNum = 0;
    }

    return classes.UnlocatedPplNum;
  }
);
// 未撤退
const unEvacuatedPplNum = computed(
  () => (classes: GroupViewModel & { unEvacuatedPplNum?: number }) => {
    if (processRunning.value) {
      classes.unEvacuatedPplNum = classes.members.filter(
        (item) => !item.isRetreat
      ).length;
    } else {
      classes.unEvacuatedPplNum = 0;
    }

    return classes.unEvacuatedPplNum;
  }
);

// 計算任務異動與清空(用localStorage存)
const unReadMissionCountData = ref<{ [key: string]: number }>({});
watch(
  emgMissionWs,
  (newVal, oldVal) => {
    if (
      newVal &&
      newVal.id !== oldVal.id &&
      newVal.content !== oldVal.content
    ) {
      // 計算任務異動
      const group = Object.values(peopleList.value).find(
        (ppl) => newVal.role.id === ppl.role.id
      );
      if (group) {
        if (!group.unReadMissionCount) group.unReadMissionCount = 0;
        group.unReadMissionCount++;
        unReadMissionCountData.value[group.id] = group.unReadMissionCount;

        $q.localStorage.set(
          "unReadMissionCountObj",
          unReadMissionCountData.value
        );
      }
    }
  },
  { deep: true }
);

function getUnReadMissionCountData() {
  let unReadMissionCountData: { [key: GroupViewModel["id"]]: number } =
    $q.localStorage.getItem("unReadMissionCountObj");
  if (!unReadMissionCountData) {
    unReadMissionCountData = {};
  }
  Object.entries(unReadMissionCountData)?.forEach((item) => {
    for (const key in peopleList.value) {
      if (item[0] === key) {
        peopleList.value[key].unReadMissionCount = item[1] as number;
      }
    }
  });
  console.log("test", peopleList.value);
}

function clearUnReadMissionCount(
  classes: GroupViewModel & { unReadMissionCount: number }
) {
  classes.unReadMissionCount = 0;
  unReadMissionCountData.value[classes.id] = classes.unReadMissionCount;
  $q.localStorage.set("unReadMissionCountObj", unReadMissionCountData.value);
}

const mobileDisplayStatus = ref("peopleList");

function handleSwipe(ev: any) {
  if (ev.touch && ev.direction === "right") {
    mobileDisplayStatus.value = "peopleList";
  } else if (ev.touch && ev.direction === "left") {
    mobileDisplayStatus.value = "emgyAction";
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
  async (val) => {
    if (val) {
      const result = await fireMarshalling.apiGetHistoryMessage(val);
      if (result?.data) {
        console.log("now apiGetHistoryMessage", result.data);
        result.data.forEach((msgObj) => {
          const { Message, RoleNames } = JSON.parse(msgObj.log);

          RoleNames.forEach((role: string) => {
            const chName =
              RoleNameToChName[role as keyof typeof RoleNameToChName];
            const messageItem = {
              role: chName,
              submissionTime: date.formatDate(
                new Date(msgObj.dateTime),
                "YYYY-MM-DD HH:mm:ss"
              ),
              textContent: Message,
            };
            emergencyMsgArray.value.push(messageItem);
          });
        });
      }
    }
  },
  { immediate: true }
);
watch(
  emergencyMsg,
  (newValue) => {
    if (newValue) {
      console.log("now emergencyMsg", newValue);
      const { roleNames, message } = newValue.notice!;
      roleNames.forEach((role) => {
        const chName = RoleNameToChName[role as keyof typeof RoleNameToChName];
        const messageItem = {
          role: chName,
          submissionTime: date.formatDate(
            new Date(newValue?.dateTime),
            "YYYY-MM-DD HH:mm:ss"
          ),
          textContent: message,
        };
        emergencyMsgArray.value.push(messageItem);
      });
    }
  },
  { deep: true }
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
