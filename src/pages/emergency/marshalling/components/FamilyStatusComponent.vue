<template>
  <q-drawer
    v-model="visible"
    side="right"
    overlay
    behavior="mobile"
    elevated
    :width="$q.screen.width"
    class="text-dark bg-secondary"
    no-swipe-open
  >
    <q-page class="flex column">
      <template v-if="isNormalUser">
        <div class="q-mt-md q-ml-md text-h5 text-bold">家庭成員</div>

        <q-card class="q-pb-md q-ma-md rounded-lg">
          <q-card-section
            class="row items-center full-width"
            style="background-color: #e2dfcd"
          >
            <div class="text-h6 text-bold flex items-center">
              <q-icon
                :name="matError"
                color="primary"
                class="q-mr-sm"
                style="font-size: 28px"
              />
              <span>家庭成員狀況一覽</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pb-none text-center">
            <div
              class="flex border-1 overflow-hidden rounded-lg"
              v-if="showedFormattedMembers.length"
            >
              <div
                style="width: 25%"
                v-for="(member, index) in showedFormattedMembers"
                :key="index"
              >
                <div
                  class="q-pa-sm border-1 text-subtitle1 text-bold"
                  style="background-color: #fefcf8; min-height: 46px"
                >
                  {{ member.fullname }}
                </div>
                <div
                  v-if="isBegin"
                  class="q-pa-sm border-1 text-subtitle1 text-bold full-height"
                  :class="
                    member.statusConfirmObj?.status === 'Completed'
                      ? 'text-positive'
                      : member.statusConfirmObj?.status === 'Ask'
                      ? 'text-red'
                      : !member.statusConfirmObj?.status
                      ? 'text-grey'
                      : 'text-primary'
                  "
                  style="min-height: 46px"
                >
                  {{
                    member.statusConfirmObj && member.statusConfirmObj?.status
                      ? statusOptions.find(
                          (item) =>
                            item.value === member.statusConfirmObj?.status
                        )?.label
                      : member.id
                      ? "尚未回報"
                      : ""
                  }}
                </div>
              </div>
            </div>
            <div v-else class="text-grey fz-18">無家庭成員資料</div>
          </q-card-section>
        </q-card>

        <q-card class="q-ma-md flex-grow-1" v-if="isBegin">
          <q-card-section
            class="row items-center full-width"
            style="background-color: #e2dfcd"
          >
            <div class="text-h6 text-bold flex items-center">
              <q-icon
                :name="matError"
                color="primary"
                class="q-mr-sm"
                style="font-size: 28px"
              />
              <span>家庭成員狀況確認</span>
            </div>
          </q-card-section>
          <q-card-section class="q-pb-none">
            <div class="flex justify-between">
              <div class="q-mb-sm text-primary text-bold">
                已選擇
                {{
                  formattedMembers.filter(
                    (item) => item.statusConfirmObj.checked === true
                  ).length
                }}
                項
              </div>
              <div>共 {{ formattedMembers?.length }} 項</div>
            </div>
          </q-card-section>

          <q-card-section
            class="q-pt-none"
            style="height: calc(50vh - 150px); overflow-y: auto"
          >
            <div
              v-for="(member, index) in formattedMembers"
              :key="index"
              class="border-1 q-mb-sm rounded-md"
            >
              <div class="flex justify-between items-center q-pa-sm border">
                <div>
                  <q-checkbox
                    disable
                    v-model="member.statusConfirmObj.checked"
                    :val="member.id"
                    color="primary"
                  >
                    <span class="fz-16">{{ member.fullname }}</span>
                    <q-btn
                      v-if="member.statusConfirmObj.isAccount"
                      flat
                      size="xs"
                      text-color="white"
                      dense
                      padding="2px 4px"
                      class="text-bold q-ml-sm"
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
                  </q-checkbox>
                </div>

                <div
                  class="fz-16 text-bold"
                  :class="
                    member.statusConfirmObj?.status === 'Completed'
                      ? 'text-positive'
                      : member.statusConfirmObj?.status === 'Ask'
                      ? 'text-red'
                      : !member.statusConfirmObj?.status
                      ? 'text-grey'
                      : 'text-primary'
                  "
                >
                  {{
                    member.statusConfirmObj && member.statusConfirmObj?.status
                      ? statusOptions.find(
                          (item) =>
                            item.value === member.statusConfirmObj?.status
                        )?.label
                      : member.id
                      ? "尚未回報"
                      : ""
                  }}
                </div>
              </div>
              <div class="q-pa-md">
                <q-option-group
                  v-model="member.statusConfirmObj.status"
                  :options="statusOptions"
                  color="primary"
                  inline
                  dense
                  class="fz-16"
                  @update:model-value="
                    handleStatusSelect(
                      member as AccountViewModel | UserViewModel
                    )
                  "
                />
              </div>
              <div
                class="q-mr-lg q-mb-md"
                style="margin-left: 30px; margin-top: -16px"
                v-if="member.statusConfirmObj.status === 'Ask'"
              >
                <q-input
                  v-model="member.statusConfirmObj.message"
                  autogrow
                  placeholder="請輸入請求協助內容"
                />
              </div>

              <ul
                class="q-px-md q-pb-md"
                v-if="member.statusConfirmObj.checkedStatus?.length"
              >
                <li
                  v-for="(list, liIndex) in member.statusConfirmObj
                    .checkedStatus"
                  :key="liIndex"
                  class="text-dark"
                  style="list-style: none"
                >
                  於
                  {{
                    date.formatDate(
                      new Date(list.responseTime),
                      "YYYY/MM/DD HH:mm"
                    )
                  }}
                  被 {{ list.user.fullname }} 編輯過狀況
                </li>
              </ul>
            </div>
          </q-card-section>
          <q-card-section
            class="row q-px-md q-pt-md q-col-gutter-md"
            :style="
              $q.screen.xs || $q.screen.sm ? '' : 'border-top: solid 1px #ddd'
            "
          >
            <div class="col-6">
              <q-btn
                flat
                @click="visible = false"
                class="bg-grey-4 full-width text-bold fz-16"
                >取消</q-btn
              >
            </div>
            <div class="col-6">
              <q-btn
                color="primary"
                class="q-ml-md full-width text-bold fz-16"
                @click="handleStatusAction"
                >更改確認</q-btn
              >
            </div>
          </q-card-section>
        </q-card>
      </template>

      <template v-else>
        <h3
          class="text-left text-bold"
          style="font-size: 1.55rem; margin: 1.2rem 1.6rem"
        >
          家庭成員
        </h3>
        <NoPermissionCard>
          此頁面僅開放
          <span class="text-primary">住戶 / 店家</span>
          查看同地址之住戶
        </NoPermissionCard>
      </template>
    </q-page>
  </q-drawer>
</template>

<script setup lang="ts">
import { date } from "quasar";

// type
import { FireAckStatus } from "src/pages/emergency/pplStatus/index.type";
import { tempDataType } from "src/utils/tableMixin";
// api
import FireCheck, {
  FamilyViewModel,
  FireAccountAckRequest,
  FireAckRequest,
} from "src/api/fireCheck";
import { AccountViewModel } from "src/api/userAccount";

// pinia store
import { useUserStore } from "src/stores/user";
import { useSignalRStore } from "src/stores/signalR";
import { storeToRefs } from "pinia";
const signalRStore = useSignalRStore();
const { fireWorkflowId, isBegin } = storeToRefs(signalRStore);
const userStore = useUserStore();
const { userData, isNormalUser } = storeToRefs(userStore);
// icon
import { matError } from "@quasar/extras/material-icons";
const $q = inject("$q") as typeof QVueGlobals;

import { useCloned } from "@vueuse/core";
import { UserViewModel } from "src/api/accountSetting";

// 家庭成員狀況
const visible = ref(false);
defineExpose({ visible });

const statusOptions = [
  {
    value: "Ask",
    label: "請求協助",
  },
  {
    value: "NotThere",
    label: "不在現場",
  },
  {
    value: "Completed",
    label: "避難完成",
  },
];

const memberData = ref<FamilyViewModel>(); // 一般帳號

async function getMemberData() {
  const result = (await FireCheck.apiGetUserFamily()) as typeof AxiosResponse;
  memberData.value = result.data;
  console.log("getMemberData", result.data);
}

async function getMemberStatus() {
  const result = (await FireCheck.apiGetUserFamilyStatus(
    fireWorkflowId.value
  )) as typeof AxiosResponse;
  return result.data;
}
async function getMemberAccountStatus(userId: UserViewModel["id"]) {
  const result = (await FireCheck.apiGetUserAccountFamilyStatus(
    fireWorkflowId.value,
    userId!
  )) as typeof AxiosResponse;
  return result.data;
}
const formattedMembers = ref<tempDataType[]>([]);
const showedFormattedMembers = computed(() => {
  const result = useCloned(formattedMembers.value).cloned.value;
  if (result.length % 4 !== 0) {
    const length = result.length;
    const remainder = length % 4;
    const add = 4 - remainder;
    for (let i = 0; i < add; i++) {
      result.push({
        statusConfirmObj: undefined,
      });
    }
  }
  return result;
});
watch(
  () => visible.value,
  async () => {
    // 待重構
    if (visible.value) {
      await getMemberData();
      let memberAccountStatusObj: { [key: number]: any } = {};
      let memberStatusObj: { [key: string]: any } = {};
      if (fireWorkflowId.value && isBegin.value) {
        memberStatusObj = await getMemberStatus();
        console.log("memberStatusObj", memberStatusObj);
        const familyUsers = memberData.value?.familyUsers.map(
          (item) => item.user
        );
        if (familyUsers) {
          for (const item of familyUsers) {
            const result = await getMemberAccountStatus(item.id!);
            memberAccountStatusObj = { ...memberAccountStatusObj, ...result };
          }
        }
        if (userData.value?.id) {
          const result = await getMemberAccountStatus(userData.value?.id);
          memberAccountStatusObj = { ...memberAccountStatusObj, ...result };
        }

        console.log("memberAccountStatusObj", memberAccountStatusObj);
      }
      formattedMembers.value = [];
      memberData.value?.accounts.forEach((account) => {
        if (account && account.id) {
          account.statusConfirmObj = {
            isAccount: true,
            status: "",
            checkedStatus: {},
            message: "",
            checked: false,
          };
          let checkedStatus = account.statusConfirmObj.checkedStatus;
          if (memberAccountStatusObj[account.id]) {
            checkedStatus =
              memberAccountStatusObj[account.id][
                memberAccountStatusObj[account.id!]?.length - 1
              ];
          }
          if (checkedStatus?.status) {
            account.statusConfirmObj.status =
              FireAckStatus[checkedStatus.status];
          }
          if (checkedStatus?.message) {
            account.statusConfirmObj.message = checkedStatus.message;
          }
          formattedMembers.value.push(account);
        }
      });
      memberData.value?.familyUsers.forEach((item) => {
        if (item.user && item.user.id) {
          item.user.statusConfirmObj = {
            status: "",
            checkedStatus: {},
            message: "",
            checked: false,
          };
          let checkedStatus = item.user.statusConfirmObj.checkedStatus;

          if (memberStatusObj[item.user.id]) {
            checkedStatus =
              memberStatusObj[item.user.id]?.[
                memberStatusObj[item.user.id]?.length - 1
              ];
          }
          if (checkedStatus?.status) {
            item.user.statusConfirmObj.status =
              FireAckStatus[checkedStatus.status];
          }
          if (checkedStatus?.message) {
            item.user.statusConfirmObj.message = checkedStatus.message;
          }
          formattedMembers.value.push(item.user);

          item.accounts.forEach((account) => {
            if (account && account.id) {
              account.statusConfirmObj = {
                isAccount: true, // 確認是附屬帳號
                status: "",
                checkedStatus: memberAccountStatusObj[account.id] || {},
                message: "",
                checked: false,
              };
              let checkedStatus = account.statusConfirmObj.checkedStatus;
              if (memberAccountStatusObj[account.id]) {
                checkedStatus =
                  memberAccountStatusObj[account.id]?.[
                    memberAccountStatusObj[account.id]?.length - 1
                  ];
              }
              if (checkedStatus?.status) {
                account.statusConfirmObj.status =
                  FireAckStatus[checkedStatus.status];
              }
              if (checkedStatus?.message) {
                account.statusConfirmObj.message = checkedStatus.message;
              }
              formattedMembers.value.push(account);
            }
          });
        }
      });
      console.log("memberData", formattedMembers.value);
    }
  }
);

function handleStatusSelect(
  member: AccountViewModel | UserViewModel,
  status?: string
) {
  console.log("handleStatusSelect", member);
  if (member.statusConfirmObj) {
    if (status === "clear") {
      member.statusConfirmObj.status = "";
      member.statusConfirmObj.checked = false;
    } else {
      member.statusConfirmObj.checked = true;
    }
  }
}
async function handleStatusAction() {
  const confirmMember = formattedMembers.value.filter(
    (item) => item.statusConfirmObj.checked && !item.statusConfirmObj.isAccount
  );
  const confirmMemberAccount = formattedMembers.value.filter(
    (item) => item.statusConfirmObj.checked && item.statusConfirmObj.isAccount
  );
  const confirmMemberPayload = confirmMember.map((item) => {
    return {
      synUser: item,
      user: userData.value,
      status: FireAckStatus[item.statusConfirmObj.status],
      message: item.statusConfirmObj.message,
      responseTime: new Date().toISOString(),
    };
  });
  const confirmMemberAccountPayload = confirmMemberAccount.map((item) => {
    return {
      synAccount: item,
      user: userData.value,
      status:
        FireAckStatus[
          item.statusConfirmObj.status as keyof typeof FireAckStatus
        ],
      message: item.statusConfirmObj.message,
      responseTime: new Date().toISOString(),
    };
  });
  if (confirmMemberPayload.length > 0) {
    const result = (await FireCheck.apiPostFireFamily(
      fireWorkflowId.value,
      confirmMemberPayload as unknown as FireAckRequest[]
    )) as typeof AxiosResponse;
    if (result.data) {
      $q.notify({
        type: "positive",
        message: "傳送成功",
        position: "top",
      });
      visible.value = false;
    } else {
      $q.notify({
        type: "negative",
        message: "傳送失敗",
        position: "top",
      });
    }
  }
  if (confirmMemberAccountPayload.length > 0) {
    const result = (await FireCheck.apiPostFireAccount(
      fireWorkflowId.value,
      confirmMemberAccountPayload as FireAccountAckRequest[]
    )) as typeof AxiosResponse;
    if (result.data) {
      $q.notify({
        type: "positive",
        message: "傳送成功",
        position: "top",
      });
      visible.value = false;
    } else {
      $q.notify({
        type: "negative",
        message: "傳送失敗",
        position: "top",
      });
    }
  }
  if (
    confirmMemberPayload.length === 0 &&
    confirmMemberAccountPayload.length === 0
  ) {
    $q.notify({
      type: "negative",
      message: "尚未選擇家庭成員狀況",
      position: "top",
    });
  }
}
</script>
