<template>
  <q-page :class="$q.screen.xs || $q.screen.sm ? 'homepage' : ''">
    <q-img
      v-if="!$q.screen.xs && !$q.screen.sm"
      src="/desktopHomePage/首頁底圖.jpg"
      class="fullscreen"
      style="z-index: 0"
    />

    <template v-if="$q.screen.xs || $q.screen.sm">
      <header class="row justify-between items-center">
        <h2 class="title">功能表</h2>
        <BuildingSelect
          color="tertiary"
          style="
            margin-top: 0.8rem;
            padding-block: 0.6rem;
            border-radius: 0.5rem;
          "
        />
      </header>
      <q-card class="user">
        <div class="flex q-gutter-md items-center">
          <q-avatar size="50px">
            <q-img
              class="fit"
              :src="userMugShotUrl"
              spinner-color="white"
              fit="cover"
              placeholder-src="~assets/image/mugShotPlaceHolder.png"
            />
          </q-avatar>

          <div class="text-h6 text-bold">
            {{ userData?.fullname }}
          </div>
        </div>

        <div class="flex q-gutter-sm">
          <!-- <q-btn
          color="grey-4"
          text-color="black"
          icon="power_settings_new"
          round
          @click.prevent="logout"
        />
        <q-btn
          :to="{ name: 'profile' }"
          color="grey-4"
          text-color="black"
          icon="settings"
          round
        /> -->
          <q-btn-dropdown
            class="no-arrow"
            rounded
            auto-close
            dense
            color="grey-6"
            icon="settings"
          >
            <div class="row column no-wrap q-py-md" style="min-width: 150px">
              <q-list dense class="text-right text-subtitle1 text-bold">
                <q-item clickable :to="{ name: 'profile' }">
                  <q-item-section> 個人資料 </q-item-section>
                </q-item>
              </q-list>
              <q-separator class="q-my-md" />
              <q-btn
                class="q-ml-auto q-mr-sm"
                color="primary"
                label="登出"
                size="md"
                push
                v-close-popup
                @click.prevent="logout"
              />
            </div>
          </q-btn-dropdown>
        </div>
      </q-card>
      <q-card class="dropdown">
        <q-list class="text-subtitle1 text-bold">
          <q-item dense clickable @click="openDialog">
            <q-item-section> 大樓基本資料 </q-item-section>
          </q-item>

          <template v-for="list in dropdownLists" :key="list.path">
            <q-item dense clickable :to="{ name: list.name }">
              <q-item-section> {{ list.label }} </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-card>
      <div class="menu">
        <!-- 固定 layout 設計的話 ↓ -->
        <!-- :style="{ 'grid-area': list.name }" -->
        <q-card class="menu-box" v-for="list in pageRouteData" :key="list.path">
          <div class="menuTitle">
            <q-icon
              size="2.5rem"
              :name="
                list.meta?.icon && list.meta?.icon.length > 50
                  ? list.meta?.icon
                  : `svguse:/svgIcons/${list.meta?.icon}.svg#${list.meta?.icon}`
              "
            />
            <span class="text-subtitle1">{{ list.meta?.title }}</span>
          </div>
          <q-list
            separator
            class="q-px-sm text-center text-bold text-primary text-subtitle1"
          >
            <!-- 當有子選單時 -->
            <template v-if="list.children?.length">
              <q-item
                v-for="child in list.children"
                :key="child.path"
                dense
                clickable
                :to="{ name: child.name }"
                style="padding: 0.3rem 0"
              >
                <q-item-section> {{ child.meta?.title }} </q-item-section>
              </q-item>
            </template>
            <!-- 當沒有子選單時 -->
            <template v-else>
              <q-item
                dense
                clickable
                :to="{ name: list.name }"
                style="padding: 0.3rem 0"
              >
                <q-item-section> {{ list.meta?.title }} </q-item-section>
              </q-item>
            </template>
          </q-list>
        </q-card>
      </div>
    </template>
    <template v-else>
      <div class="container">
        <div
          class="flex items-end text-bold text-right q-mb-md"
          v-if="pageRouteData.length <= 2"
        >
          <div>
            <div
              class="text-bold text-deepBrown"
              style="letter-spacing: 2px; font-size: 28px"
            >
              {{ nowDate }}
            </div>
            <div class="flex items-center text-h3 text-bold text-deepBrown">
              <div class="border-2 bg-white rounded-xl" style="padding: 14px">
                {{ nowTime.split(":")[0] }}
              </div>
              <span class="q-px-md">:</span>
              <div class="border-2 bg-white rounded-xl" style="padding: 14px">
                {{ nowTime.split(":")[1] }}
              </div>
            </div>
          </div>
          <!-- 個人設定 -->
          <q-btn-dropdown
            rounded
            auto-close
            dense
            size="xl"
            text-color="dark"
            icon="person"
            class="q-ml-sm text-h6"
            :menu-offset="[250, 12]"
            style="background-color: #d5d1bc"
          >
            <div class="row column no-wrap q-pa-md" style="min-width: 545px">
              <div class="flex justify-between items-center">
                <div class="flex q-gutter-md items-center">
                  <q-avatar size="64px">
                    <q-img
                      class="fit"
                      :src="userMugShotUrl"
                      spinner-color="white"
                      fit="cover"
                      placeholder-src="~assets/image/mugShotPlaceHolder.png"
                    />
                  </q-avatar>

                  <div class="text-h6 text-bold">
                    {{ userData?.fullname }}
                  </div>
                </div>

                <q-btn
                  color="primary"
                  label="登出"
                  push
                  v-close-popup
                  @click.prevent="logout"
                  class="text-h6 text-bold"
                />
              </div>
              <q-separator class="q-my-md" />
              <q-list class="column justify-center text-h6 text-bold">
                <q-item clickable :to="{ name: 'profile' }">
                  <q-item-section> 個人資料 </q-item-section>
                </q-item>
                <q-item clickable @click="openDialog">
                  <q-item-section> 大樓基本資料 </q-item-section>
                </q-item>
                <q-item
                  v-for="list in dropdownLists"
                  :key="list.path"
                  clickable
                  :to="{ name: list.name }"
                >
                  <q-item-section> {{ list.label }} </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-btn-dropdown>
          <!-- 大樓設定 -->
          <BuildingSelect
            rounded
            auto-close
            dense
            text-color="white"
            :menu-offset="[179, 12]"
            :hasBuildingName="false"
            minWidth="545px"
            class="q-ml-md"
            style="font-size: 1.25em; padding: 12px; background-color: #6f5f49"
          >
            <template #BNData="{ data }">
              <div
                class="flex justify-between items-center text-h6 text-bold full-width"
              >
                <span> {{ data.name }}</span>
                <q-badge
                  v-if="data.name === buildingData?.name"
                  color="primary"
                  class="text-h6 text-bold q-px-md"
                >
                  目前大樓
                </q-badge>
              </div>
            </template>
          </BuildingSelect>
        </div>
        <div class="waterfall">
          <div class="item" v-for="list in pageRouteData" :key="list.path">
            <div
              class="flex items-end text-bold text-right q-mb-md"
              v-if="list.name === 'historyAnalysis'"
            >
              <div>
                <div
                  class="text-bold text-deepBrown"
                  style="letter-spacing: 2px; font-size: 28px"
                >
                  {{ nowDate }}
                </div>
                <div class="flex items-center text-h3 text-bold text-deepBrown">
                  <div
                    class="border-2 bg-white rounded-xl"
                    style="padding: 14px"
                  >
                    {{ nowTime.split(":")[0] }}
                  </div>
                  <span class="q-px-md">:</span>
                  <div
                    class="border-2 bg-white rounded-xl"
                    style="padding: 14px"
                  >
                    {{ nowTime.split(":")[1] }}
                  </div>
                </div>
              </div>
              <!-- 個人設定 -->
              <q-btn-dropdown
                rounded
                auto-close
                dense
                size="xl"
                text-color="dark"
                icon="person"
                class="q-ml-sm text-h6"
                :menu-offset="[250, 12]"
                style="background-color: #d5d1bc"
              >
                <div
                  class="row column no-wrap q-pa-md"
                  style="min-width: 545px"
                >
                  <div class="flex justify-between items-center">
                    <div class="flex q-gutter-md items-center">
                      <q-avatar size="64px">
                        <q-img
                          class="fit"
                          :src="userMugShotUrl"
                          spinner-color="white"
                          fit="cover"
                          placeholder-src="~assets/image/mugShotPlaceHolder.png"
                        />
                      </q-avatar>

                      <div class="text-h6 text-bold">
                        {{ userData?.fullname }}
                      </div>
                    </div>

                    <q-btn
                      color="primary"
                      label="登出"
                      push
                      v-close-popup
                      @click.prevent="logout"
                      class="text-h6 text-bold"
                    />
                  </div>
                  <q-separator class="q-my-md" />
                  <q-list class="column justify-center text-h6 text-bold">
                    <q-item clickable :to="{ name: 'profile' }">
                      <q-item-section> 個人資料 </q-item-section>
                    </q-item>
                    <q-item clickable @click="openDialog">
                      <q-item-section> 大樓基本資料 </q-item-section>
                    </q-item>
                    <q-item
                      v-for="list in dropdownLists"
                      :key="list.path"
                      clickable
                      :to="{ name: list.name }"
                    >
                      <q-item-section> {{ list.label }} </q-item-section>
                    </q-item>
                  </q-list>
                </div>
              </q-btn-dropdown>
              <!-- 大樓設定 -->
              <BuildingSelect
                rounded
                auto-close
                dense
                text-color="white"
                :menu-offset="[179, 12]"
                :hasBuildingName="false"
                minWidth="545px"
                class="q-ml-md"
                style="
                  font-size: 1.25em;
                  padding: 12px;
                  background-color: #6f5f49;
                "
              >
                <template #BNData="{ data }">
                  <div
                    class="flex justify-between items-center text-h6 text-bold full-width"
                  >
                    <span> {{ data.name }}</span>
                    <q-badge
                      v-if="data.name === buildingData?.name"
                      color="primary"
                      class="text-h6 text-bold q-px-md"
                    >
                      目前大樓
                    </q-badge>
                  </div>
                </template>
              </BuildingSelect>
            </div>

            <q-card flat class="bg-transparent desktopIndexPic">
              <div
                class="border-1 text-white overflow-hidden"
                style="height: 185px; border-radius: 8px !important"
              >
                <q-img
                  v-if="!$q.screen.xs && !$q.screen.sm && list.meta?.title"
                  :src="getAssetsFile(list.meta?.title)"
                  class="fit"
                >
                  <div class="flex flex-center absolute-full">
                    <q-icon
                      size="4rem"
                      :name="
                        list.meta?.icon && list.meta?.icon.length > 50
                          ? list.meta?.icon
                          : `svguse:/svgIcons/${list.meta?.icon}.svg#${list.meta?.icon}`
                      "
                      class="q-mr-lg"
                    />
                    <span class="text-bold text-h3">{{
                      list.meta?.title
                    }}</span>
                  </div>
                </q-img>
              </div>
              <q-list
                separator
                class="text-center text-bold text-primary text-subtitle1"
              >
                <!-- 當有子選單時 -->
                <template v-if="list.children?.length">
                  <div class="flex">
                    <q-item
                      v-for="child in list.children"
                      :key="child.path"
                      dense
                      clickable
                      :to="{ name: child.name }"
                      class="rounded-lg border-2 bg-secondary text-bold text-dark flex-grow-1"
                      style="min-width: 50%; padding: 20px"
                    >
                      <q-item-section class="fz-32 font-bold">
                        {{ child.meta?.title }}
                      </q-item-section>
                    </q-item>
                  </div>
                </template>
                <!-- 當沒有子選單時 -->
                <template v-else>
                  <q-item
                    dense
                    clickable
                    :to="{ name: list.name }"
                    class="rounded-lg border-2 q-pa-md bg-secondary text-h6 text-bold text-dark"
                    style="padding: 20px"
                  >
                    <q-item-section class="fz-32 font-bold">
                      {{ list.meta?.title }}
                    </q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-card>
          </div>
        </div>
      </div>
    </template>
  </q-page>

  <!-- 大樓基本資料 dialog -->
  <q-dialog v-model="dialogAttrs.visible">
    <q-card
      :style="$q.screen.xs || $q.screen.sm ? 'width:100%' : 'min-width: 500px'"
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6 text-bold">{{ dialogAttrs.dialogTitle }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <q-list bordered :dense="$q.screen.xs || $q.screen.sm">
          <q-item v-for="item in dialogConfig" :key="item.name">
            <q-item-section>
              <q-item-label>{{ item.label }}</q-item-label>
            </q-item-section>
            <q-item-section side style="width: 70%">
              <span
                v-if="
                  item.name === 'chairman' || item.name === 'executiveSecretary'
                "
                >{{ dialogAttrs.tempData[item.name] }}</span
              >
              <span v-else-if="item.name === 'fireManagers'">{{
                fireManagerName(item)
              }}</span>
              <span v-else>{{ dialogAttrs.tempData[item.name] }}</span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useNow, useDateFormat, useCloned } from "@vueuse/core";

// pinia store
import { usePermissionStore } from "src/stores/permission";
import { useBuildingStore } from "src/stores/building.js";
import { useAuthStore } from "src/stores/auth";
import { useUserStore } from "src/stores/user";
import { storeToRefs } from "pinia";
// utils
import type { tableConfigItem } from "src/utils/tableMixin";
import tableMixin from "src/utils/tableMixin";
import { RouteRecordRaw } from "vue-router";

const buildingStore = useBuildingStore();
const userStore = useUserStore();

const { buildingData } = storeToRefs(buildingStore);
const { userData, userMugShotUrl, roleName } = storeToRefs(userStore);
const $q = inject("$q") as typeof QVueGlobals;
//  大樓基本資料 dialog
const { dialogAttrs } = tableMixin();
const dialogConfig = ref<tableConfigItem[]>([]);
async function openDialog() {
  dialogAttrs.value.visible = true;
  dialogAttrs.value.dialogTitle = "大樓基本資料";
  if (buildingData.value) dialogAttrs.value.tempData = buildingData.value;
  dialogConfig.value = buildingStore.buildingTableConfig.filter(
    (item) => item.isTable
  );
}

// 防火管理人姓名 format
const fireManagerName = computed(() => {
  return function (item: { name: string }) {
    return dialogAttrs.value.tempData[item.name]
      .map((data: { fullname: string }) => data.fullname)
      .join(" , ");
  };
});

// 下拉選單
const usePermission = usePermissionStore();
const { userDropdownOptionsRoutes } = storeToRefs(usePermission);

const dropdownLists = ref<{ [key: string]: string }[]>([]);
const stop = watch(
  userDropdownOptionsRoutes,
  (val) => {
    dropdownLists.value = val.map((item) => ({
      label: item.meta?.title as string,
      path: item.path,
      name: item.name as string,
    }));
  },
  { immediate: true }
);
onMounted(() => setTimeout(stop, 10000));

const nameOrderArray = computed(() => {
  if ($q.screen.xs || $q.screen.sm) {
    return [
      "historyAnalysis",
      "graphic",
      "accountSetting",
      "deviceData",
      // "systemTest", // 固定 layout 設計的話
      "normal",
      "emergency",
    ];
  }
  // 系統管理員
  return [
    "graphic",
    "normal",
    "deviceData",
    "emergency",
    "historyAnalysis",
    "accountSetting",
  ];
});

const filteredRoutes = computed(() => {
  if (roleName.value.includes("Mercury")) {
    return usePermission.sideBarMenuRoutes.filter(
      (item) => item.name !== "systemTest"
    );
  }
  return usePermission.sideBarMenuRoutes;
});

const pageRouteData = computed(() => {
  const orderMap = new Map(
    nameOrderArray.value.map((name, index) => [name, index])
  );

  // 使用 filteredRoutes 代替直接修改 sideBarMenuRoutes
  const routes = filteredRoutes.value;

  const sortedRoutes = routes.slice().sort((a, b) => {
    const indexA = orderMap.get(a.name as string) ?? Infinity;
    const indexB = orderMap.get(b.name as string) ?? Infinity;
    return indexA - indexB;
  });

  return sortedRoutes;
});

// 登出
const router = useRouter();
const authStore = useAuthStore();
function logout() {
  authStore.logout();
  // 清除該帳號權限才擁有的選單設定
  usePermission.userDropdownOptionsRoutes.length = 0;
  usePermission.sideBarMenuRoutes.length = 0;
  usePermission.permissionRouteNames.length = 0;
  nextTick(() => {
    router.push("/login");
  });
}

// 動態載入圖片
const getAssetsFile = (title: string) => {
  return new URL(`/desktopHomePage/${title}.jpg`, process.env.Url).href;
};

// 現在時間
const formatterDate = ref("YYYY/MM/DD (dd)");
const formatterTime = ref("HH:mm");
const nowDate = useDateFormat(useNow(), formatterDate);
const nowTime = useDateFormat(useNow(), formatterTime);
</script>

<style lang="scss" scoped>
.homepage {
  height: 100%;
  display: grid;
  justify-content: center;
  grid-template-columns: 1fr;
  grid-template-rows: min-content 5.3rem 4rem 1fr;
  padding: 0 1.25rem;
  .title {
    margin: 1rem 0 0 0.24rem;
    font-size: clamp(1.5rem, 6.7vw, 3rem);
    font-weight: bold;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .user {
    background-color: #fff;
    border-radius: 1rem;
    margin-bottom: 0.8rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 1.1rem;
  }
  .dropdown {
    background-color: #fff;
    border-radius: 1rem;
    margin-bottom: 0.8rem;
    .q-list {
      height: 100%;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: center;
      .q-item {
        padding: 0;
        width: stretch;
        text-align: center;
        & + .q-item {
          border-left: 2px solid #eee;
        }
      }
    }
  }
  .menu {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    // 固定 layout 設計的話 ↓
    // grid-template-rows: repeat(3, 1fr);
    // grid-template-areas:
    //   "historyAnalysis graphic accountSetting"
    //   "deviceData normal emergency"
    //   "systemTest normal emergency";

    .menu-box {
      border-radius: 0.8rem;
      height: min-content;
    }
    .menuTitle {
      width: 100%;
      background-color: $primary;
      color: white;
      aspect-ratio: 1;
      border-radius: 0.8rem;
      display: flex;
      justify-content: center;
      flex-direction: column;
      align-items: center;
      span {
        margin-top: 0.6rem;
      }
    }
  }
}
:deep(.no-arrow) {
  .q-btn-dropdown__arrow {
    display: none;
  }
}

.container {
  margin: 0 80px;
  position: absolute;
  top: 50%;
  left: auto;
  transform: translateY(-50%);
  .waterfall {
    width: 100%;
    margin: 0px auto;
    column-count: 3;
    /*欄數*/
    column-gap: 36px;
    /*每欄間隔*/
    .item {
      padding: 10px;
      box-sizing: border-box;
      margin: 0 auto 5px;
      break-inside: avoid;
      /*定義頁面、列或是區域發生中斷時的元素表現方式。 auto->元素中斷、acoid->元素不中斷*/
    }
  }
}
:deep(.desktopIndexPic) {
  .q-img__content > div {
    background: #3b3b3b78;
  }
  &:hover {
    .q-img__content > div {
      background: #a89249 !important;
    }
  }
}

.text-deepBrown {
  color: #6e5e48;
}

:deep(.q-btn-dropdown__arrow) {
  display: none;
}
</style>
