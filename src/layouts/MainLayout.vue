<template>
  <q-layout view="lHh Lpr lFf">
    <q-header
      v-if="!isInHomePage && $q.screen.gt.md"
      class="bg-accent shadow-1"
      flat
      ref="header"
    >
      <q-toolbar>
        <!-- Hamburger -->
        <q-btn
          flat
          dense
          round
          color="dark"
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <NavBarComponent />
      </q-toolbar>
    </q-header>

    <!-- 左側導航設計 -->
    <q-page-sticky
      position="left"
      style="z-index: 2500; top: 80vh"
      v-if="$q.screen.xs || $q.screen.sm"
    >
      <q-btn
        dense
        round
        color="primary"
        size="lg"
        icon="menu"
        aria-label="Menu"
        class="absolute-top-left"
        style="left: -25px"
        @click="toggleLeftDrawer"
      />
    </q-page-sticky>
    <q-drawer
      v-if="($q.screen.gt.md && !isInHomePage) || !$q.screen.gt.md"
      v-model="leftDrawerShowing"
      :mini="!leftDrawerShowing || miniState"
      :width="230"
      :breakpoint="500"
      :show-if-above="false"
      bordered
      @mouseenter="menuMouseEnter"
      @mouseleave="menuMouseLeave"
      class="z-top"
      style="background: #fffdee"
    >
      <div
        class="absolute"
        style="top: 80vh; right: -25px; z-index: -1"
        v-if="$q.screen.xs || $q.screen.sm"
      >
        <q-btn
          dense
          round
          color="primary"
          size="lg"
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
      </div>
      <q-list
        bordered
        style="background-color: #f5f1d3"
        v-if="!miniState"
        class="shadow-1"
      >
        <q-item>
          <q-item-section
            avatar
            class="fz-16 text-bold full-width items-center"
          >
            功能選單
          </q-item-section>
        </q-item>
      </q-list>
      <q-list v-for="list in RouteData" :key="list.path">
        <q-expansion-item
          v-if="list.children"
          :icon="`svguse:/svgIcons/${list.meta?.icon}.svg#${list.meta?.icon}`"
          dense-toggle
          group="somegroup"
          :label="list.meta?.title"
          ref="expansionItems"
          class="fz-16 q-ma-xs text-bold"
          :labelLines="list.name?.toString()"
          :expand-icon-class="{ 'text-white': list.name === nowActiveListName }"
        >
          <q-item
            class="text-deepPrimary q-mt-sm text-bold"
            clickable
            v-for="child in list.children"
            :key="child.path"
            active-class="active fz-16 "
            :inset-level="0.5"
            tag="a"
            :to="{ name: child.name }"
            style="border-radius: 5px"
          >
            <q-item-section avatar>
              <q-icon
                :name="
                  child.meta?.icon && child.meta?.icon.length > 50
                    ? child.meta?.icon
                    : `svguse:/svgIcons/${child.meta?.icon}.svg#${child.meta?.icon}`
                "
              />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ child.meta?.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- q-item -->
        <q-item
          v-else
          clickable
          tag="a"
          exact
          :to="{ name: list.name }"
          active-class="text-white bg-primary"
          class="fz-16 q-ma-xs text-bold"
          style="border-radius: 5px"
        >
          <q-item-section avatar>
            <q-icon
              :name="`svguse:/svgIcons/${list.meta?.icon}.svg#${list.meta?.icon}`"
            />
          </q-item-section>

          <q-item-section>
            <q-item-label>{{ list.meta?.title }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <q-page style="background-color: #fefbf5">
        <!-- 小幫手 -->
        <MetcHelper v-if="!notificationComponent?.visible" />

        <router-view />

        <template v-if="$q.screen.xs || $q.screen.sm">
          <q-footer bordered class="bg-white text-dark" style="z-index: 3500">
            <q-tabs
              no-caps
              style="background-color: #dbd7bf"
              v-model="mobileNavbarTabs"
              switch-indicator
            >
              <q-tab
                style="padding: 0 12px"
                align="justify"
                v-for="(item, idx) in mobileNavbar"
                :key="idx"
                :name="item.label"
                :icon="item.icon"
                :label="item.label"
                @click="mobileMenuChange(item.label)"
              >
                <q-badge v-if="showBadge(item)" floating color="red" rounded />
              </q-tab>
            </q-tabs>
          </q-footer>
        </template>
      </q-page>
    </q-page-container>

    <!-- 提醒事項 -->
    <RemindList v-model="remindListVisible" />
  </q-layout>
</template>

<script setup lang="ts">
// utils
import type { QExpansionItem } from 'quasar';
// pinia store
import { storeToRefs } from 'pinia';
import { usePermissionStore } from 'src/stores/permission';
// icon
import {
  mdiAccountDetails,
  mdiFlagVariant,
  mdiAccountMultiple,
  mdiTextBoxEdit,
} from '@quasar/extras/mdi-v6';

const $q = useQuasar();
const router = useRouter();

// 控制選單開合
const leftDrawerShowing = ref(true);
const leftMenuOpen = ref(false);
const miniState = ref(false);

// 取得選單路由
const usePermission = usePermissionStore();
const RouteData = usePermission.sideBarMenuRoutes;
// 取得目前選單位置
function toggleLeftDrawer() {
  if ($q.screen.xs || $q.screen.sm) {
    leftDrawerShowing.value = !leftDrawerShowing.value;
  } else {
    leftMenuOpen.value = !leftMenuOpen.value;
    miniState.value = !miniState.value;
  }
}

// 選單開合
const mouseIn = ref(false);
function menuMouseEnter() {
  if (!leftMenuOpen.value || mouseIn.value) return;
  mouseIn.value = true;
  miniState.value = false;
}
function menuMouseLeave() {
  if (!leftMenuOpen.value) return;
  mouseIn.value = false;
  miniState.value = true;
}

const route = useRoute();
const isInHomePage = computed(() => route.path === '/');

watch(
  () => route.path,
  (newPath) => {
    console.log('newPath', newPath);
    handleRoutePathChange(newPath);
  },
);

const expansionItems = ref<QExpansionItem[]>([]);
const nowActiveListName = ref('');

function handleRoutePathChange(path: string): void {
  nowActiveListName.value = path.split('/')[1];
  expansionItems.value.forEach((expansionItem) => {
    const expansionHeader = expansionItem.$el.childNodes[0].childNodes[0];
    if (expansionItem.labelLines === nowActiveListName.value) {
      expansionItem.show();
      expansionHeader.classList.add('activeList');
    } else {
      expansionItem.hide();
      expansionHeader.classList.remove('activeList');
    }
  });
}
onMounted(() => {
  if ($q.screen.xs) {
    leftDrawerShowing.value = false;
  } else if (
    route.path === '/graphic/drawingControl' ||
    route.path === '/graphic/viewerControl' ||
    $q.screen.sm
  ) {
    miniState.value = true;
    leftMenuOpen.value = false;
  }
  handleRoutePathChange(route.path);
});

const header = ref();
const headerHeight = computed(() =>
  header.value ? header.value.$el.getBoundingClientRect().height : 0,
);
provide('headerHeight', headerHeight);

// 手機版導覽
const mobileNavbarTabs = ref('功能表');
enum mobileNavbarEnum {
  familyMemberStatus = '家庭成員',
  remindLists = '提醒事項',
  missionLists = '任務列表',
  notifications = '通知',
  centerMag = '防災訊息',
  menu = '功能表',
}

const mobileNavbar = computed(() => [
  {
    icon: mdiAccountMultiple,
    label: mobileNavbarEnum.familyMemberStatus,
  },
  {
    icon: mdiTextBoxEdit,
    label: mobileNavbarEnum.remindLists,
  },
  {
    icon: mdiFlagVariant,
    label: mobileNavbarEnum.missionLists,
  },
  {
    icon: 'notifications',
    label: mobileNavbarEnum.notifications,
  },
  {
    icon: mdiAccountDetails,
    label: mobileNavbarEnum.menu,
  },
]);
const centerMsgComponent = ref();
// 通知
const notificationComponent = ref();
// 家庭成員
const familyStatusComponent = ref();
// 任務列表
const missionListDialog = ref();
const withNewMission = computed(() => missionListDialog.value?.withNewMission);
// 提醒事項
const remindListVisible = ref(false);
provide('remindListVisible', remindListVisible);
function mobileMenuChange(label: string) {
  if (label === mobileNavbarEnum.menu) {
    router.push('/');
    if (
      notificationComponent.value.visible ||
      familyStatusComponent.value.visible ||
      remindListVisible.value
    ) {
      notificationComponent.value.visible = false;
      familyStatusComponent.value.visible = false;
      remindListVisible.value = false;
    }
  } else if (label === mobileNavbarEnum.centerMag) {
    if (centerMsgComponent.value.visible) {
      notificationComponent.value.visible = false;
      familyStatusComponent.value.visible = false;
      remindListVisible.value = false;
    }
  } else if (label === mobileNavbarEnum.notifications) {
    notificationComponent.value.handleNotifyDrawer();
    if (notificationComponent.value.visible) {
      familyStatusComponent.value.visible = false;
      remindListVisible.value = false;
    }
  } else if (label === mobileNavbarEnum.missionLists) {
    console.log('todo');
  } else if (label === mobileNavbarEnum.remindLists) {
    remindListVisible.value = !remindListVisible.value;
    if (remindListVisible.value && notificationComponent.value) {
      notificationComponent.value.visible = false;
      familyStatusComponent.value.visible = false;
    }
  } else if (label === mobileNavbarEnum.familyMemberStatus) {
    familyStatusComponent.value.visible = !familyStatusComponent.value.visible;
    if (familyStatusComponent.value.visible) {
      notificationComponent.value.visible = false;
      remindListVisible.value = false;
    }
  }
}

function showBadge(item: { icon: string; label: mobileNavbarEnum }) {
  if (item.label === mobileNavbarEnum.notifications) {
    return notificationComponent.value?.hasNewNotification;
  } else if (item.label === mobileNavbarEnum.missionLists) {
    return withNewMission.value;
  }
}
</script>

<style lang="scss" scoped>
:deep(.activeList) {
  color: #fff;
  font-weight: bold;
  background-color: var(--q-primary);
  border-radius: 5px;
}
.active {
  background-color: #eee6c9 !important;
  overflow: hidden;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 10px;
    height: 100%;
    background-color: var(--q-primary);
  }
}
.text-deepPrimary {
  color: #664d39;
}
</style>
