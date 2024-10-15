import { RouteRecordRaw } from 'vue-router';
import MainLayout from 'layouts/MainLayout.vue';

declare module 'vue-router' {
  interface RouteMeta {
    title: string;
    icon?: string;
    expanded?: boolean;
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: MainLayout,
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
            meta: { title: '圖控編輯', icon: 'graphic-control-edit' },
          },
          {
            path: 'viewerControl',
            name: 'viewerControl',
            component: () => import('pages/graphic/viewerControl.vue'),
            meta: { title: '圖控顯示', icon: 'graphic-control-system' },
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
            component: () =>
              import('pages/emergency/marshalling/sDFMViewer.vue'),
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
    ],
    meta: { title: '首頁' },
  },
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

export default routes;
