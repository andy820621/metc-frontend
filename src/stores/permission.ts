import { defineStore } from "pinia";
import { AxiosResponse } from "axios";
import { computed, reactive } from "vue";
import { sideBarMenuPages, userDropdownOptionsPages } from "./../router/routes";
import { RouteRecordRaw } from "vue-router";
import { extend } from "quasar";
import Role from "src/api/role";

export const usePermissionStore = defineStore("permission", () => {
  const sideBarMenuRoutes = reactive<RouteRecordRaw[]>([]);
  const userDropdownOptionsRoutes = reactive<RouteRecordRaw[]>([]);
  const permissionRouteNames = reactive<string[]>([]);

  const hasPermissionRoutes = computed(() => sideBarMenuRoutes.length);

  async function getPermissionRoutes() {
    const result = (await Role.apiGetRoleMenu()) as AxiosResponse;
    if (result.data) {
      permissionRouteNames.push(...result.data);
      setPermissionRoutes(result.data);
      return result.data;
    }
    return [];
  }

  function setPermissionRoutes(data: string[]) {
    sideBarMenuRoutes.length = 0;

    sideBarMenuPages.forEach((route) => {
      const addRoute = extend({}, route) as RouteRecordRaw;
      if (data.includes(addRoute.name as string)) {
        sideBarMenuRoutes.push(addRoute);
      }

      if (addRoute.children && addRoute.children.length) {
        addRoute.children = addRoute.children?.filter((child) =>
          data.includes(child.name as string)
        );
        if (addRoute.children && addRoute.children.length) {
          sideBarMenuRoutes.push(addRoute);
        }
      }
    });

    userDropdownOptionsPages.forEach((route) => {
      const addRoute = extend({}, route) as RouteRecordRaw;
      if (data.includes(addRoute.name as string)) {
        userDropdownOptionsRoutes.push(addRoute);
      }
    });
  }

  return {
    sideBarMenuRoutes,
    userDropdownOptionsRoutes,
    permissionRouteNames,
    hasPermissionRoutes,
    setPermissionRoutes,
    getPermissionRoutes,
  };
});
