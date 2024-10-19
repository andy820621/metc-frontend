import { req } from "boot/axios";
import { ApiResponse } from "./api.type";
export interface RoleViewModel {
  id: string;
  name: string;
  type: number;
  description?: string;
  isEmergency?: boolean | null;
  order?: number | null;
}
export enum roleType {
  role = 1,
  class = 2,
  screen = 4,
}
type apiGetRolesPayload = {
  type: roleType; // 用來選擇要撈哪些 type
  isEmergency: boolean | null; // 用來選擇要撈 type 裡的哪些身分 (null 撈該身分的全部)
}[];

const Role = {
  //   查詢系統角色身分下拉
  apiGetRoles(payload: apiGetRolesPayload) {
    return req<ApiResponse<RoleViewModel[]>>(
      "post",
      "/Role/collection",
      payload
    );
  },

  // 獲取 menu 清單
  apiGetRoleMenu() {
    return req("get", "/Role/menus");
  },
  // 取得編組下拉 > 查詢班別角色
  apiGetsDFMList() {
    return req("post", "/Role/grouproles");
  },

  // 註冊頁面用
  // 取得編組下拉 > 查詢班別角色
  apiGetAnonymousSDFMList() {
    return req("post", "/anonymous/grouproles");
  },
  // 查詢系統角色
  apiGetAnonymousRolesList() {
    return req("post", "/anonymous/defaultroles");
  },
};

export default Role;
