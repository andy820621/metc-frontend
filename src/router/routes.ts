import { RouteRecordRaw } from 'vue-router';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    icon?: string;
    expanded?: boolean;
    needLogin?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'index',
        alias: ['/index', '/home', '/main'],
        component: () => import('pages/HomePage.vue'),
        meta: { title: '首頁' },
      },
      {
        path: 'profile',
        name: 'profile',
        component: () => import('pages/profilePage.vue'),
        meta: { title: '個人資料' },
      },
    ],
    meta: { title: '首頁' },
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/login',
    name: 'login',
    component: () => import('pages/LoginPage.vue'),
    meta: { title: '登入' },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('pages/registerPage.vue'),
    meta: { title: '註冊' },
  },
  {
    path: '/liveStream',
    name: 'liveStream',
    component: () => import('pages/JitsiMeet/index.vue'),
    meta: { title: '視訊直播間' },
  },
  {
    path: '/notFound',
    name: '404',
    component: () => import('pages/ErrorNotFound.vue'),
    meta: { title: '404 Not Found' },
  },
  {
    path: '/:catchAll(.*)*',
    redirect: '/notFound',
  },
];

export const sideBarMenuPages: RouteRecordRaw[] = [
  // 圖控
  {
    path: 'graphic',
    name: 'graphic',
    redirect: { name: 'drawingControl' },
    meta: { title: '圖控系統', icon: 'graphic-control', expanded: false },
    children: [
      {
        path: 'drawingControl',
        name: 'drawingControl',
        component: () => import('pages/graphic/DrawingControl.vue'),
        meta: {
          title: '圖控編輯',
          icon: 'graphic-control-edit',
          needLogin: true,
        },
      },
      {
        path: 'viewerControl',
        name: 'viewerControl',
        component: () => import('pages/graphic/viewerControl.vue'),
        meta: {
          title: '圖控顯示',
          icon: 'graphic-control-system',
          needLogin: true,
        },
      },
    ],
  },
  // 平時管理
  {
    path: 'normal',
    name: 'normal',
    redirect: { name: 'drawingControl' },
    meta: { title: '平時管理', icon: 'normal', expanded: false },
    children: [
      {
        path: 'announcementMgmt',
        name: 'announcementMgmt',
        component: () => import('pages/normal/announcementMgmt.vue'),
        meta: {
          title: '公告欄',
          icon: 'announcement',
        },
      },
      {
        path: 'basic',
        name: 'basic',
        component: () => import('pages/normal/basicInfo.vue'),
        meta: {
          title: '基本資料',
          icon: 'basic-info',
        },
      },
      {
        path: 'maintenance',
        name: 'maintenance',
        component: () => import('pages/normal/maintenancePage.vue'),
        meta: {
          title: '維護保養',
          icon: 'maintenance',
        },
      },
      {
        path: 'routineInsp',
        name: 'routineInsp',
        component: () => import('pages/normal/routineInsp.vue'),
        meta: {
          title: '例行檢查',
          icon: 'inspect',
        },
      },
      {
        path: 'verifyDataMgmt',
        name: 'verifyDataMgmt',
        component: () => import('pages/normal/verifyDataMgmt.vue'),
        meta: {
          title: '驗證頁面',
          icon: 'verify',
        },
      },
      {
        path: 'fire-safety-guide',
        name: 'fireSafetyGuide',
        component: () => import('pages/normal/fireSafetyGuide.vue'),
        meta: {
          title: '消防安全指南',
          icon: 'fireSafetyGuide',
        },
      },
    ],
  },
  // 設備清單
  {
    path: 'deviceData',
    name: 'deviceData',
    redirect: { name: 'devicesManagement' },
    meta: { title: '設備資料', icon: 'deviceData', expanded: false },
    children: [
      {
        path: 'devicesManagement',
        name: 'devicesManagement',
        component: () => import('pages/deviceData/DevicesManagement.vue'),
        meta: { title: '設備清單', icon: 'devicesManagement' },
      },
      {
        path: 'deviceAddressManagement',
        name: 'deviceAddressManagement',
        component: () => import('pages/deviceData/DeviceAddress.vue'),
        meta: { title: '設備點位', icon: 'switchboard' },
      },
    ],
  },
  // 緊急應變
  {
    path: 'emergency',
    name: 'emergency',
    redirect: { name: 'instruction' },
    meta: { title: '緊急應變', icon: 'emergency', expanded: false },
    children: [
      {
        path: 'instruction',
        name: 'instruction',
        component: () => import('pages/emergency/flow/flowInstruction.vue'),
        meta: { title: '流程指令', icon: 'process-instruction' },
      },
      {
        path: 'process',
        name: 'process',
        component: () => import('pages/emergency/flow/flowProcess.vue'),
        meta: { title: '流程編輯', icon: 'process-edit' },
      },
      {
        path: 'sDFMViewer',
        name: 'sDFMViewer',
        component: () => import('pages/emergency/marshalling/sDFMViewer.vue'),
        meta: { title: '消防編組', icon: 'fire-marshalling' },
      },
      {
        path: 'sDFMEdit',
        name: 'sDFMEdit',
        component: () => import('pages/emergency/marshalling/sDFMEdit.vue'),
        meta: { title: '編輯編組', icon: 'sDFMEdit' },
      },
      {
        path: 'cctv',
        name: 'cctv',
        component: () => import('pages/emergency/cctvPage.vue'),
        meta: { title: '監視畫面', icon: 'cctv' },
      },
      {
        path: 'emergencyDeviceStatus',
        name: 'emergencyDeviceStatus',
        component: () => import('pages/emergency/deviceStatus.vue'),
        meta: { title: '設備狀況', icon: 'equipment-device-status' },
      },
      {
        path: 'emergencyPplStatus',
        name: 'emergencyPplStatus',
        component: () => import('pages/emergency/pplStatus/index.vue'),
        meta: { title: '人員名冊', icon: 'personal-status' },
      },
      {
        path: 'fireCrewOperations',
        name: 'fireCrewOperations',
        component: () =>
          import('pages/emergency/marshalling/fireCrewOperations.vue'),
        meta: { title: '人員操作', icon: 'fireCrewOperations' },
      },
    ],
  },
  {
    path: 'historyAnalysis',
    name: 'historyAnalysis',
    component: () => import('pages/historyRecord.vue'),
    meta: { title: '歷史紀錄', icon: 'historyRecord' },
  },
  {
    path: 'accountSetting',
    name: 'accountSetting',
    component: () => import('pages/accountSetting.vue'),
    meta: { title: '帳號管理', icon: 'accountSetting' },
  },
  {
    path: 'systemTest', // ! 測試用 之後要拔掉
    name: 'systemTest',
    component: () => import('pages/systemTest.vue'),
    meta: { title: '系統測試', icon: 'icon' },
  },
  {
    path: 'presentControl',
    name: 'presentControl',
    component: () => import('pages/presentControl.vue'),
    meta: { title: '展場設備控制', icon: 'icon' },
  },
];

export const userDropdownOptionsPages: RouteRecordRaw[] = [
  {
    path: 'settings',
    name: 'settings',
    component: () => import('pages/systemSetting/settingPage.vue'),
    meta: { title: '系統設定' },
  },

  {
    path: 'communityAndBuilding',
    name: 'communityAndBuilding',
    component: () => import('pages/communityAndBuilding.vue'),
    meta: { title: '編輯社區/大樓' },
  },
];

routes[0].children?.push(...sideBarMenuPages, ...userDropdownOptionsPages);

export default routes;

function generatePathMap(
  routes: RouteRecordRaw[],
  parentPath = ''
): { [key: string]: string } {
  return routes.reduce((pathMap, route) => {
    const currentPath = `${parentPath}/${route.path}`.replace(/\/+/g, '/'); // 確保路徑不會有多於的斜線
    if (route.name) {
      pathMap[route.name as string] = currentPath; // 假定 name 是 string
    }
    if (route.children) {
      Object.assign(pathMap, generatePathMap(route.children, currentPath)); // 遞迴子路由
    }
    return pathMap;
  }, {} as { [key: string]: string });
}
function generateTitleMap(routes: RouteRecordRaw[]): { [key: string]: string } {
  return routes.reduce((titleMap, route) => {
    if (route.name) {
      titleMap[route.name as string] = route.meta?.title as string; // 假定 title 是 string
    }
    if (route.children) {
      Object.assign(titleMap, generateTitleMap(route.children)); // 遞迴子路由
    }
    return titleMap;
  }, {} as { [key: string]: string });
}

export const sideBarPathMaps = generatePathMap([
  ...routes,
  ...sideBarMenuPages,
  ...userDropdownOptionsPages,
]);
export const sideBarTitleMaps = generateTitleMap([
  ...routes,
  ...sideBarMenuPages,
  ...userDropdownOptionsPages,
]);
