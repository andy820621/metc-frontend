import { defineStore } from 'pinia';
import { computed, reactive } from 'vue';
import routes from '../router/routes';
import type { RouteRecordRaw } from 'vue-router';

export const usePermissionStore = defineStore('permission', () => {
  const sideBarMenuRoutes = reactive<RouteRecordRaw[]>([]);
  const userDropdownOptionsRoutes = reactive<RouteRecordRaw[]>([]);

  // 初始化 sideBarMenuRoutes 和 userDropdownOptionsRoutes
  function initRoutes() {
    const mainRoute = routes.find((route) => route.path === '/');
    if (mainRoute && mainRoute.children) {
      sideBarMenuRoutes.push(
        ...mainRoute.children.filter(
          (route) => route.meta && route.meta.icon && route.path !== ''
        )
      );

      // 假設這些路由應該出現在用戶下拉選單中
      const userDropdownPaths = ['profile', 'settings', 'accountSetting'];
      userDropdownOptionsRoutes.push(
        ...mainRoute.children.filter((route) =>
          userDropdownPaths.includes(route.path)
        )
      );
    }
  }

  // 立即調用初始化函數
  initRoutes();

  const hasPermissionRoutes = computed(() => sideBarMenuRoutes.length > 0);

  return {
    sideBarMenuRoutes,
    userDropdownOptionsRoutes,
    hasPermissionRoutes,
  };
});
