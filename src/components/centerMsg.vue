<template>
  <q-drawer
    v-model="emergencyMsgVisible"
    side="right"
    overlay
    behavior="mobile"
    elevated
    :width="$q.screen.xs || $q.screen.sm ? $q.screen.width : 500"
    class="text-dark bg-secondary"
    no-swipe-open
  >
    <div class="q-py-md text-left q-ml-lg text-h5 text-bold">
      防災中心訊息框
    </div>
    <div
      v-if="!messageArray.length"
      class="flex flex-center text-grey fz-16 full-height"
    >
      尚未有防災中心訊息
    </div>
    <div
      class="fz-16 q-pa-lg"
      style="height: calc(100vh - 160px); overflow-y: auto"
      v-else
    >
      <div v-for="item in messageArray" :key="item.submissionTime">
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
        </span>
      </div>
    </div>
  </q-drawer>
</template>

<script setup lang="ts">
import { date } from "quasar";
// api
import fireMarshalling from "src/api/fireMarshalling";
// pinia
import { storeToRefs } from "pinia";
import { useBuildingStore } from "src/stores/building.js";
import { useUserStore } from "src/stores/user";
import { useSignalRStore } from "src/stores/signalR";

const signalRStore = useSignalRStore();
const userStore = useUserStore();
const buildingStore = useBuildingStore();
const { Bid } = storeToRefs(buildingStore);
const { roleName, marshallingName } = storeToRefs(userStore);
const { emergencyMsg, emergencyMsgVisible } = storeToRefs(signalRStore);

const $q = inject("$q") as typeof QVueGlobals;

const messageArray = ref<
  {
    submissionTime: string;
    textContent: string;
  }[]
>([]);

watch(
  emergencyMsgVisible,
  async (newValue) => {
    if (newValue && Bid.value) {
      const result = (await fireMarshalling.apiGetHistoryMessage(
        Bid.value
      )) as typeof AxiosResponse;

      if (result && result.data) {
        messageArray.value = [];
        // 檢查並 format 獲取到的歷史資料
        result.data.forEach((msgObj: { dateTime: string; log: string }) => {
          if (!msgObj.log) return;
          const { Message, BuildingId, RoleNames } = JSON.parse(msgObj.log);
          if (BuildingId !== Bid.value || !RoleNames) return;

          if (
            RoleNames.includes(marshallingName.value) ||
            RoleNames.some((item: string) => roleName.value.includes(item))
          ) {
            const submissionTime = date.formatDate(
              new Date(msgObj.dateTime),
              "YYYY-MM-DD HH:mm:ss"
            );
            const textContent = Message;
            messageArray.value.push({ submissionTime, textContent });
          }
        });
        console.log("messageArray", messageArray.value);
      }
    }
  },
  { immediate: true }
);

watch(
  emergencyMsg,
  (newValue, oldValue) => {
    if (
      newValue &&
      newValue.notice !== oldValue?.notice &&
      newValue.dateTime !== oldValue?.dateTime
    ) {
      console.log("now emergencyMsg", newValue, oldValue);
      const { roleNames, message } = newValue.notice!;
      const isInRole = roleNames.some((role) => roleName.value.includes(role));
      if (roleNames.includes(marshallingName.value) || isInRole) {
        const messageItem = {
          submissionTime: newValue?.dateTime,
          textContent: message,
        };
        messageArray.value.push(messageItem);
      }
    }
  },
  { deep: true }
);
</script>
