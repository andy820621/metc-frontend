<template>
  <q-drawer
    side="right"
    overlay
    behavior="mobile"
    no-swipe-open
    ref="missionLists"
    :width="$q.screen.width"
    class="bg-secondary"
  >
    <div
      class="tab-container"
      v-if="isFire || isInfo || isGuide || isProtection || isAmbulance"
    >
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
          v-for="(tab, index) in tabTitle"
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
        >
          <q-badge
            v-if="tabContentCount[tab.value]"
            :style="
              $q.screen.xs || $q.screen.sm
                ? { top: '1.5%', right: '3%' }
                : undefined
            "
            :color="tab.value === 'postedTasks' ? 'red' : 'primary'"
            floating
          >
            {{ tabContentCount[tab.value] }}
          </q-badge>
        </q-tab>
      </q-tabs>

      <q-separator />

      <q-tab-panels
        v-model="activeTab.value"
        animated
        swipeable
        class="bg-transparent"
        style="height: calc(100vh - 155px); overflow: hidden"
      >
        <!-- 發布任務內容 -->
        <q-tab-panel :name="tabTitle[0].value">
          <MissionList
            :tableRowsData="Object.values(postedTasksData)"
            :unVisibleColumns="[
              'sendUserName',
              'receiveUserClass',
              'receiveTime',
            ]"
          >
            <template #desktopBtn="{ id, receiveUser }">
              <span v-if="receiveUser" class="text-primary">
                {{ receiveUser.fullname }}
              </span>
              <q-btn
                v-else
                color="white"
                text-color="black"
                label="接收任務"
                @click.prevent="acceptMission(id)"
              />
            </template>
            <template #mobileBtn="{ id, receiveUser }">
              <span v-if="receiveUser" class="text-primary">
                {{ receiveUser.fullname }}
              </span>
              <q-btn
                v-else
                color="white"
                text-color="black"
                label="接收任務"
                @click.prevent="acceptMission(id)"
              />
            </template>
          </MissionList>
        </q-tab-panel>
        <!-- 當前接收任務 -->
        <q-tab-panel :name="tabTitle[1].value">
          <MissionList
            :tableRowsData="Object.values(acceptedTasksData)"
            :tableHeight="tableHeight"
            :unVisibleColumns="['sendUserName', 'receiveUserClass']"
          >
            <template #desktopBtn="{ id }">
              <q-btn
                color="white"
                text-color="black"
                label="請求支援"
                @click.prevent="requestSupport(id)"
              />
              <q-btn
                color="white"
                text-color="black"
                label="完成"
                style="margin-left: 10px"
                @click.prevent="missionAccomplished(id)"
              />
            </template>
            <template #mobileBtn="{ id }">
              <q-btn
                color="white"
                text-color="black"
                label="請求支援"
                @click.prevent="requestSupport(id)"
              />
              <q-btn
                color="white"
                text-color="black"
                label="完成"
                style="margin-left: 10px"
                @click.prevent="missionAccomplished(id)"
              />
            </template>
          </MissionList>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <!-- 無瀏覽此頁面的權限 -->
    <template v-else>
      <h3
        class="text-left text-bold"
        style="font-size: 1.55rem; margin: 1.2rem 1.6rem"
      >
        任務列表
      </h3>
      <NoPermissionCard>
        此頁面為
        <span class="text-primary">自衛消防編組</span>
        之成員任務收發使用，一般用戶緊急應變時請於「提醒事項」查看。
      </NoPermissionCard>
    </template>
  </q-drawer>
</template>

<script setup lang="ts">
// API
import emergencyMission, { GroupTaskViewModel } from "src/api/emergencyMission";
// utils
import { useResizeObserver } from "@vueuse/core";
// ws store
import { storeToRefs } from "pinia";
import { useSignalRStore } from "src/stores/signalR";
import { useUserStore } from "src/stores/user";
import { mdiCheckCircle } from "@quasar/extras/mdi-v6";
const signalRStore = useSignalRStore();
const userStore = useUserStore();
const { emgMission } = storeToRefs(signalRStore);
const {
  userData,
  roleName,
  marshallingId,
  marshallingName,
  isNormalUser,
  isFire,
  isInfo,
  isGuide,
  isProtection,
  isAmbulance,
} = storeToRefs(userStore);

const tableHeight = ref("300px");
const panelHeight = ref(0);
onMounted(() => {
  useResizeObserver(missionLists, () => {
    const { height } = missionLists.value.$el
      .querySelector(".q-drawer__content")
      .getBoundingClientRect();
    console.log("now newValue height: ", height);
    if (panelHeight.value === height) return;

    panelHeight.value = height;
    tableHeight.value = panelHeight.value - 48 - 33 + "px"; // ? 33 不知道是哪邊撐開的
  });
});

const $q = inject("$q") as typeof QVueGlobals;

const missionLists = ref();

// tab
const activeTab = ref({
  label: "發布任務內容",
  value: "postedTasks",
});
const tabTitle = [
  {
    label: "發布任務內容",
    value: "postedTasks",
  },
  {
    label: "當前接收任務",
    value: "acceptedTasks",
  },
];
const tabContentCount = computed(() => ({
  [tabTitle[0].value]: postedTasksData.value
    ? Object.keys(postedTasksData.value).length
    : 0,
  [tabTitle[1].value]: acceptedTasksData.value
    ? Object.keys(acceptedTasksData.value).length
    : 0,
}));
const withNewMission = computed(
  () => tabContentCount.value[tabTitle[0].value] > 0
);
defineExpose({ withNewMission });
function tabChange(tab: typeof activeTab.value) {
  console.log("tabChange", tab);
}
// Table
// 獲取任務歷史清單
const sDFMMissionLists = ref<{ [key: string | number]: GroupTaskViewModel }>(
  {}
);
watch(
  emgMission,
  (newValue) => {
    if (newValue) {
      for (const key in newValue) {
        if (newValue[key].role.id !== marshallingId.value) continue;

        sDFMMissionLists.value[key] = newValue[key];
      }
      console.log("watch sDFMMissionLists", sDFMMissionLists.value);
    }
  },
  { immediate: true, deep: true }
);

onMounted(getMissionLists);
async function getMissionLists() {
  if (!marshallingId.value) return;
  const params = {
    filter: "",
    page: 1,
    rowsPerPage: 0,
    roleName: marshallingName.value,
  };
  const result = (await emergencyMission.apiGetMissionLists(
    params
  )) as typeof AxiosResponse;
  sDFMMissionLists.value = result.data.rows.reduce(
    (obj: Record<string, GroupTaskViewModel>, row: GroupTaskViewModel) => {
      obj[row.id] = row;
      return obj;
    },
    {}
  );
}
// 發布任務內容
const postedTasksData = computed(() => {
  return sDFMMissionLists.value
    ? Object.entries(sDFMMissionLists.value).reduce(
        (
          obj: Record<string, GroupTaskViewModel>,
          [key, row]: [string, GroupTaskViewModel]
        ) => {
          if (!row.receiveUser && !row.isCancelled && !row.isCompleted) {
            obj[key] = row;
          }
          return obj;
        },
        {}
      )
    : [];
});
async function acceptMission(id: number) {
  // console.log("acceptMission", id);
  const result = (await emergencyMission.apiReceiveMission(
    id
  )) as typeof AxiosResponse;
  if (result.data) {
    $q.notify({
      type: "positive",
      message: "接收任務成功",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "接收任務失敗",
      position: "top",
    });
  }
}
// 當前接收任務
const acceptedTasksData = computed(() => {
  return sDFMMissionLists.value
    ? Object.entries(sDFMMissionLists.value).reduce(
        (
          obj: Record<string, GroupTaskViewModel>,
          [key, row]: [string, GroupTaskViewModel]
        ) => {
          if (
            row.receiveUser &&
            !row.isCancelled &&
            !row.isCompleted &&
            !row.needSupport &&
            row.receiveUser?.id === userData.value?.id
          ) {
            obj[key] = row;
          }
          return obj;
        },
        {}
      )
    : [];
});

async function requestSupport(id: number) {
  const result = (await emergencyMission.apiSupportRequest(
    id
  )) as typeof AxiosResponse;
  if (result.data) {
    $q.notify({
      type: "positive",
      message: "成功請求支援",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "請求支援失敗",
      position: "top",
    });
  }
}
async function missionAccomplished(id: number) {
  const result = (await emergencyMission.apiMissionAccomplished(
    id
  )) as typeof AxiosResponse;
  if (result.data) {
    $q.notify({
      type: "positive",
      message: "任務完成",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "未能成功通知任務完成",
      position: "top",
    });
  }
}
</script>

<style scoped lang="scss">
@media screen and (max-width: 1024px) {
  :deep(.q-table__grid-content) {
    gap: 0;
    flex-direction: column;
    & > div {
      height: min-content;
    }
  }
}
</style>
