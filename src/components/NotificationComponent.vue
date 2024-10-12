<template>
  <!-- 右側通知設計 -->
  <q-drawer
    v-model="visible"
    side="right"
    overlay
    behavior="mobile"
    elevated
    :width="$q.screen.xs || $q.screen.sm ? $q.screen.width : 500"
    class="text-dark bg-secondary"
    no-swipe-open
  >
    <div class="q-pt-md text-left q-ml-lg text-h5 text-bold">通知</div>

    <q-scroll-area
      :style="$q.screen.xs || $q.screen.sm ? 'height: 77vh' : 'height:85vh'"
    >
      <q-list padding v-if="notifications.length">
        <q-card
          rounded
          bordered
          class="notify-card q-ma-md"
          :class="{ 'bg-white': notification.read }"
          v-for="notification in notifications"
          :key="notification.id"
        >
          <q-card-section>
            <div class="flex justify-between items-center">
              <div class="flex items-center">
                <q-icon
                  color="primary"
                  class="q-mr-sm"
                  :name="matError"
                  size="md"
                />
                <div>
                  <div class="text-subtitle1 text-bold flex items-center">
                    {{ notification.title }}
                  </div>
                  <div>
                    {{ notification.dateTime }}
                  </div>
                </div>
              </div>
              <q-btn
                class="deleteIcon"
                round
                color="grey"
                :icon="matClose"
                size="sm"
                @click="deleteNotification(notification.id)"
              />
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section
            class="text-body2 cursor-pointer"
            @click="handleReadNotify(notification)"
          >
            {{ notification.message }}
          </q-card-section>
        </q-card>
      </q-list>
      <q-list class="text-grey absolute-center text-h6 text-bold" v-else>
        尚未有通知訊息
      </q-list>
    </q-scroll-area>

    <div
      class="row q-px-md q-pt-md q-col-gutter-md"
      :style="$q.screen.xs || $q.screen.sm ? '' : 'border-top: solid 1px #ddd'"
    >
      <div class="col-6">
        <q-btn
          label="全部清除"
          color="white"
          text-color="dark"
          @click="clearAll"
          class="q-px-md text-subtitle1 text-bold full-width"
          style="border-radius: 10px"
        />
      </div>
      <div class="col-6">
        <q-btn
          label="顯示所有通知"
          color="primary"
          @click="showAllNotifications"
          class="q-px-md text-subtitle1 text-bold full-width"
          style="border-radius: 10px"
        />
      </div>
    </div>
  </q-drawer>

  <!-- 全部通知 Dialog Table -->
  <q-dialog v-model="notifyDialogTableModel" persistent>
    <q-card
      class="flex column"
      :style="
        $q.screen.xs || $q.screen.sm
          ? 'width:100%; height:100%'
          : 'min-width: 90%; height:80%'
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">全部通知</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="flex-grow-1">
        <BlockComponent
          ref="blockRef"
          :blockAttrs="notifyTableAttrs"
          v-on="notifyTableEvent"
          :isSearch="false"
          :isDialogTable="true"
          :custom-height="'calc(100% - 20px)'"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { date } from "quasar";
// api
import Notify, { NotifyReadViewModel } from "src/api/notify";
// utils
import tableMixin, {
  blockRefType,
  setBlockLoading,
} from "src/utils/tableMixin";
import { useCloned } from "@vueuse/core";

// pinia
import { useUserStore } from "src/stores/user";
import { useSignalRStore } from "src/stores/signalR";
import { storeToRefs } from "pinia";

// icon
import { matError, matClose } from "@quasar/extras/material-icons";

const userStore = useUserStore();
const signalRStore = useSignalRStore();

const { userData } = storeToRefs(userStore);
const { notifyWsData } = storeToRefs(signalRStore);

const $q = inject("$q") as typeof QVueGlobals;

// 右側通知設計
enum NotifySwitchs {
  "個人資料異動通知" = 1,
  "家庭成員異動通知" = 2,
  "新設備登入帳號通知" = 4,
  "公告欄通知" = 8,
}
const visible = ref(false);
const originalNotificationsData = ref<NotifyReadViewModel[]>([]);
const notifications = computed(() => {
  if (!userData.value?.id) return [];
  else {
    return originalNotificationsData.value
      .filter((data) => data.user.id === userData.value?.id)
      .map((data) => {
        const { cloned } = useCloned(data);
        cloned.value.title = NotifySwitchs[cloned.value.switch];
        cloned.value.dateTime = date.formatDate(
          new Date(cloned.value.notify.dateTime),
          "YYYY-MM-DD HH:mm:ss"
        );
        return cloned.value;
      });
  }
});
const hasNewNotification = ref(false);

async function getNotifyData() {
  const result = await Notify.apiGetData({
    filters: "",
    page: 1,
    rowsPerPage: 20,
  });
  originalNotificationsData.value = result.data?.rows as NotifyReadViewModel[];
}

function handleNotifyDrawer() {
  visible.value = !visible.value;
  hasNewNotification.value = false;
}

onBeforeMount(() => {
  notifications.value.length = 0;
  getNotifyData();
});

watch(
  notifyWsData,
  (val) => {
    if (val) {
      console.log("now notifyWsData", val);
      // 檢查是否有重複值
      const isRepeated = notifications.value.some(
        (notify) => notify.id === val.id
      );
      if (isRepeated) return;
      hasNewNotification.value = true;
      val.title = NotifySwitchs[val.switch];
      val.dateTime = date.formatDate(
        new Date(val.notify.dateTime),
        "YYYY-MM-DD HH:mm:ss"
      );
      notifications.value.push(val);
    }
  },
  { immediate: true }
);

async function deleteNotification(id: string) {
  const result = (await Notify.apiDeleteData([id])) as typeof AxiosResponse;
  if (result.data) {
    await getNotifyData();
    $q.notify({
      type: "positive",
      message: "通知已刪除",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "通知刪除失敗",
      position: "top",
    });
  }
}
async function clearAll() {
  const idArray = notifications.value.map((item) => item.id);
  const result = (await Notify.apiDeleteData(idArray)) as typeof AxiosResponse;
  if (result.data) {
    notifications.value.length = 0;
    $q.notify({
      type: "positive",
      message: "通知已刪除",
      position: "top",
    });
  } else {
    $q.notify({
      type: "negative",
      message: "通知刪除失敗",
      position: "top",
    });
  }
}
async function handleReadNotify(notification: NotifyReadViewModel) {
  console.log("notification", notification);
  if (!notification.read) {
    const result = (await Notify.apiPatchData([
      notification,
    ])) as typeof AxiosResponse;
    if (result.data) {
      notification.read = true;
      $q.notify({
        type: "positive",
        message: "該通知已設為已讀",
        position: "top",
      });
    } else {
      // 還原更改
      notification.read = false;
      $q.notify({
        type: "negative",
        message: "設為已讀失敗",
        position: "top",
      });
    }
  }
}
// 全部通知 Dialog Table
const notifyDialogTableModel = ref(false);
const {
  tableAttrs: notifyTableAttrs,
  handleBlockMixin: notifyHandleBlockMixin,
  getTableMixin: notifyGetTableMixin,
  handleSelectArray: notifyHandleSelectArray,
} = tableMixin();

const notifyTableEvent = computed(() => {
  return {
    handleBlock: notifyHandleBlock,
    handleSelectArray: notifyHandleSelectArray,
    changeBlockData: getNotifyTableData,
  };
});
async function showAllNotifications() {
  notifyDialogTableModel.value = true;
  notifyTableAttrs.value.tableConfig = [
    {
      label: "標題",
      name: "title",
      field: "title",
      align: "left",
      formType: "inputString",
      isTable: true,
    },
    {
      label: "內容",
      name: "message",
      field: "message",
      align: "left",
      formType: "inputString",
      isTable: true,
    },
    {
      label: "時間",
      name: "dateTime",
      field: (row: NotifyReadViewModel) => row.notify.dateTime,
      align: "left",
      formType: "inputString",
      isTable: true,
    },
  ];
  nextTick(() => {
    notifyTableAttrs.value.headerButtons = ["deleteMany"];
    notifyTableAttrs.value.tableButtons = ["delete"];
  });
}
async function notifyHandleBlock(
  btn: { label: string; icon: string; status: string },
  data: NotifyReadViewModel | NotifyReadViewModel[]
) {
  notifyHandleBlockMixin(btn, data, Notify, getNotifyTableData);
}
const blockRef = ref<blockRefType>();
async function getNotifyTableData(
  pagination: blockRefType["pagination"] = {
    filters: "",
    page: 1,
    rowsPerPage: 12,
  }
) {
  await notifyGetTableMixin(Notify, pagination);
  // format data
  notifyTableAttrs.value.blockData.forEach((notification) => {
    notification.notify.dateTime = date.formatDate(
      new Date(notification.notify.dateTime),
      "YYYY-MM-DD HH:mm:ss"
    );
    notification.title = NotifySwitchs[notification.switch];
  });
  setBlockLoading(blockRef);
}

defineExpose({
  handleNotifyDrawer,
  hasNewNotification,
  visible,
});
</script>

<style scoped lang="scss">
.notify-card {
  background-color: #f8e3d1;
  transition: 0.3s;
  box-shadow: 0 0;
  border-radius: 10px;
  &:hover {
    transform: translateY(-0.24rem);
    box-shadow: 0 5px 10px #cbcbcb;
  }
}
.deleteIcon .q-icon > svg {
  color: black;
}
</style>
