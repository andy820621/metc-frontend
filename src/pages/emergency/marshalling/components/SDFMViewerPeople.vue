<template>
  <div class="row fit">
    <div v-if="$q.screen.xs || $q.screen.sm" class="col-12 q-mt-md">
      <q-btn
        color="primary fz-18"
        rounded
        @click="openMissionList"
        class="full-width"
        >任務清單
        <q-badge color="red" rounded floating v-if="props.unReadMissionCount">{{
          props.unReadMissionCount
        }}</q-badge></q-btn
      >
    </div>

    <div class="left col-md-2" v-if="!$q.screen.xs && !$q.screen.sm">
      <div class="bg-table-odd-row fit flex column flex-center border-1">
        <div class="q-mb-md text-center q-pa-md">
          <div class="q-mb-sm text-h5 text-bold">
            {{ marshallingClass.name }}
          </div>
          <div class="q-mb-sm text-h6 text-bold">
            共 {{ accountLists.length }} 人
          </div>
        </div>
        <div class="q-mb-lg">
          <div class="text-subtitle1 text-bold">
            未定位
            {{ marshallingClass.UnlocatedPplNum }}
            人
          </div>
          <div class="text-subtitle1 text-bold">
            未撤退
            {{ marshallingClass.unEvacuatedPplNum }}
            人
          </div>
        </div>

        <q-btn color="primary" rounded @click="openMissionList" class="fz-18"
          >任務清單
          <q-badge
            color="red"
            rounded
            floating
            v-if="props.unReadMissionCount"
            >{{ props.unReadMissionCount }}</q-badge
          ></q-btn
        >
      </div>
    </div>
    <div class="right col-12 col-md-10">
      <div
        class="bg-white border-1"
        :class="{ 'rounded-lg': $q.screen.xs || $q.screen.sm }"
        style="height: calc(100vh - 360px)"
      >
        <div
          class="flex q-pa-md fit"
          v-if="accountLists.length"
          style="overflow-y: auto; gap: 16px"
        >
          <template v-for="item in accountLists" :key="item.id">
            <q-card class="accountInfo" @click="openUser(item)">
              <div class="img-container">
                <q-img
                  v-if="item.mugShotUrl !== ''"
                  :src="item.mugShotUrl"
                  class="fit previewImg"
                  fit="cover"
                  placeholder-src="~assets/image/mugShotPlaceHolder.png"
                />
              </div>
              <div class="text-container">
                <div class="q-mt-sm">
                  <div class="flex flex-center text-h6 text-bold">
                    {{ item.fullname }}
                    <q-badge
                      color="primary"
                      text-color="white"
                      label="班長"
                      v-if="
                        props.marshallingClass.classLeaderUserId === item.id
                      "
                      class="q-ml-sm q-pa-xs"
                    />
                  </div>
                </div>

                <div class="phone text-subtitle1">
                  {{ item.phoneNumber || item.contactNumber }}
                </div>
                <div
                  class="text-subtitle1 text-bold text-positive"
                  :class="{
                    'text-negative':
                      item.state &&
                      !item.state.includes('已定位') &&
                      item.state.includes('尚未接收訊息'),
                  }"
                >
                  {{ item.state }}
                </div>
              </div>
            </q-card>
          </template>
        </div>
        <div
          v-else
          class="fit flex flex-center text-h6 text-bold text-grey bg-white"
        >
          尚未加入編組成員
        </div>
      </div>
    </div>
  </div>
  <!-- dialogTable -->
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
          {{ `${props.marshallingClass.name} - 任務清單` }}
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
        >
          <template #customBlockField="{ data, config }">
            <div v-if="config.name === 'status'">
              <q-icon
                class="text-h5 q-mr-sm"
                :class="missionTextStyle(setStatus(data)).colorStyle"
                :name="missionTextStyle(setStatus(data)).icon"
              ></q-icon>

              <span
                class="text-bold"
                :class="missionTextStyle(setStatus(data)).colorStyle"
              >
                {{ setStatus(data) }}</span
              >
            </div>
          </template>
        </BlockComponent>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { UserViewModel } from "src/api/accountSetting";
import emergencyMission, {
  missionListTableConfig,
} from "src/api/emergencyMission";
// utils
import tableMixin, { blockRefType } from "src/utils/tableMixin";
import { setStatus } from "src/utils/missionListFormater";
// icon
import {
  mdiCheckCircle,
  mdiAlertCircle,
  mdiCircleSlice8,
  mdiCloseCircle,
  mdiMinusCircle,
} from "@quasar/extras/mdi-v6";

const $q = inject("$q") as typeof QVueGlobals;

const emit = defineEmits(["handleOpenUser", "openMissionList"]);

const props = defineProps({
  processRunning: {
    type: Boolean,
    required: true,
  },
  marshallingClass: {
    type: Object,
    required: true,
  },
  unReadMissionCount: {
    type: Number,
  },
});

watch(
  () => props.processRunning,
  (newValue, oldValue) => {
    if (newValue && oldValue === false) {
      accountLists.value.forEach(
        (item: UserViewModel & { state: string }) =>
          (item.state = "尚未接收訊息")
      );
    }
  },
  { immediate: true }
);

const accountLists = computed(() => props.marshallingClass.members);

async function openUser(content: UserViewModel) {
  console.log("openUser content", content);
  emit("handleOpenUser", content);
}

// 任務清單
const blockRef = ref<blockRefType>();
const { tableAttrs } = tableMixin(blockRef as Ref<blockRefType>);

const tableEvent = computed(() => {
  return {
    changeBlockData: getTableData,
  };
});

const dialogTableVisible = ref(false);
async function getTableData(
  params = {
    filter: "",
    page: 1,
    rowsPerPage: 25,
    roleName: "",
  }
) {
  console.log("getTableData", props.marshallingClass.role.name);
  params.roleName = props.marshallingClass.role.name;

  const result = (await emergencyMission.apiGetMissionLists(
    params
  )) as typeof AxiosResponse;
  tableAttrs.value.blockData = result.data.rows;
  tableAttrs.value.totalNum = result.data.rowsNumber;
}

function openMissionList() {
  dialogTableVisible.value = true;
  nextTick(() => {
    tableAttrs.value.headerButtons = [];
    tableAttrs.value.tableButtons = [];
    tableAttrs.value.tableConfig = missionListTableConfig;
  });
  emit("openMissionList", props.marshallingClass);
}

// 任務清單未讀數量
const missionTextStyle = computed(() => (status: string) => {
  const StyleObj = {
    colorStyle: "",
    icon: "",
  };

  if (status === "已完成") {
    StyleObj.colorStyle = "text-positive";
    StyleObj.icon = mdiCheckCircle;
  } else if (status === "請求支援") {
    StyleObj.colorStyle = "text-negative";
    StyleObj.icon = mdiAlertCircle;
  } else if (status === "已接收") {
    StyleObj.colorStyle = "text-primary";
    StyleObj.icon = mdiCircleSlice8;
  } else if (status === "已取消") {
    StyleObj.colorStyle = "text-dark";
    StyleObj.icon = mdiCloseCircle;
  } else if (status === "待接收") {
    StyleObj.colorStyle = "text-grey";
    StyleObj.icon = mdiMinusCircle;
  }
  return StyleObj;
});
</script>

<style scoped lang="scss">
.accountInfo {
  width: 47%;
  height: 250px;
  border-radius: 8px;
  text-align: center;
  background-color: hsl(52, 8%, 88%);
  cursor: pointer;
  transition: 0.3s;
  @media screen and (min-width: 600px) {
    width: 20%;
    height: 280px;
  }
  .img-container {
    width: 100%;
    background-color: #fff;
    height: 120px;
    border-radius: 8px 8px 0 0;
    overflow: hidden;
    @media screen and (min-width: 600px) {
      height: 160px;
    }
    .previewImg {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
  }
  .text-container {
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    border-radius: 0 0 0.5rem 0.5rem;
    height: calc(100% - 160px);
    padding-bottom: 12px;
  }
}
.accountInfo:hover {
  transform: translateY(-0.25rem);
}
.bg-table-odd-row {
  background-color: $table-odd-row-bg;
}
</style>
