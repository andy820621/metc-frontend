import { boot } from 'quasar/wrappers';
import { LoadingBar, Cookies } from 'quasar';
import { usePermissionStore } from '../stores/permission';

const usePermission = usePermissionStore();

// const authStore = useAuthStore();
const whiteList = [
  '/login',
  '/register',
  '/swagger',
  '/register',
  '/swagger/index.html',
]; // no redirect whitelist

export default boot(async ({ router }) => {
  // 透過路由守衛控制登入登出、路由導航權限...等
  router.beforeEach(async (to, from, next) => {
    console.log('to', to);

    // 紀錄訪問的頁面
    const pages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
    if (!pages.includes(to.path)) {
      pages.push(to.path);
      localStorage.setItem('visitedPages', JSON.stringify(pages));
    }

    // 多螢幕控制
    // 可以參考舊 code 的 permission.js

    document.title = `${
      to.meta.title == null ? '載入中' : to.meta.title
    } - 智慧消防管理平台`;

    LoadingBar.start();

    const hasToken = Cookies.has('accessToken');

    if (hasToken) {
      console.log('has token!!!!!!!!!!');
      if (to.path === '/login' || to.path === '/register') {
        next({ path: '/' });
        LoadingBar.stop();
        return;
      }

      console.log(
        'now usePermission.permissionRouteNames',
        usePermission.permissionRouteNames
      );
      if (usePermission.hasPermissionRoutes) {
        if (to.path === '/' || to.name === '404' || to.name === 'liveStream') {
          next();
          LoadingBar.stop();
          return;
        }
        if (usePermission.permissionRouteNames.includes(to.name as string)) {
          next();
          LoadingBar.stop();
        } else {
          next({ name: '404' });
          LoadingBar.stop();
        }
      } else {
        await usePermission.getPermissionRoutes();

        // only 展場用
        if (to.path === '/presentControl') {
          next();
          LoadingBar.stop();
          return;
        }

        next(to);
        LoadingBar.stop();
      }
    } else {
      console.log('no token');
      if (whiteList.indexOf(to.path) !== -1) {
        // 直接通行
        next();
        LoadingBar.stop();
      } else {
        next(`/login?redirect=${to.path}`);
        LoadingBar.stop();
      }
    }
  });

  router.afterEach((to, from) => {
    // 刪除離開的頁面
    const pages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
    const pageIndex = pages.indexOf(from.path);
    if (pageIndex > -1) {
      pages.splice(pageIndex, 1);
      localStorage.setItem('visitedPages', JSON.stringify(pages));
    }

    LoadingBar.stop();
  });
});
