import { defineStore, storeToRefs } from "pinia";
import basic, { LoginRequest } from "src/api/basic";

import { Cookies } from "quasar";
import { useUserStore } from "./user";

export const useAuthStore = defineStore("auth", () => {
  const userToken = ref<string>();

  const accessToken = computed(() =>
    userToken.value ? userToken.value : Cookies.get("accessToken")
  );

  // 登入
  async function login(loginData: LoginRequest) {
    const {
      account,
      email,
      phoneNumber,
      password,
      visitorId,
      loginProvider,
      token,
    } = loginData;
    const payload: Partial<LoginRequest> = {
      password,
      visitorId,
      loginProvider,
      token,
    };
    if (email?.length) payload.email = email;
    else if (phoneNumber?.length) payload.phoneNumber = phoneNumber;
    else if (account?.length) payload.account = account;
    else return;

    const result = await basic.apiPostLogin(payload as LoginRequest);

    const userStore = useUserStore();
    const { userData } = storeToRefs(userStore);

    console.log("now apiPostLogin's result=>", result);
    if (result.data) {
      const { accessToken, exp, roles, fullname, isCommunityUser } =
        result.data;
      userData.value.fullname = fullname;
      userData.value.isCommunityUser = JSON.parse(String(isCommunityUser));
      // 儲存 accessToken、處理過期
      const expires = ticksToDate(exp) as Date;
      Cookies.set("accessToken", accessToken, {
        expires,
        sameSite: "Lax",
        // secure: true,
        path: "/",
      });
      userToken.value = accessToken;

      // 儲存使用者資料到 cookies
      Cookies.set("roles", JSON.stringify(roles), {
        expires,
        sameSite: "Lax",
        // secure: true,
        path: "/",
      });
      Cookies.set("fullname", userData.value.fullname, {
        expires,
        sameSite: "Lax",
        // secure: true,
        path: "/",
      });
        Cookies.set("isCommunityUser", String(userData.value.isCommunityUser), {
          expires,
          sameSite: "Lax",
          path: "/",
        });

      return result.data;
    } else {
      console.log("error.response.status=>", result);
      alert("帳號密碼錯誤，請重新輸入");
      throw new Error("Failed to authenticate. Check your login data.");
    }
  }

  function logout() {
    console.log("Logout is invoked!!!");
    localStorage.removeItem("Bid");
    localStorage.removeItem("fireBuilding");
    localStorage.removeItem("fireFloor");
    localStorage.removeItem("fireDeviceId");
    localStorage.removeItem("ifAutoShowDeviceAlertDialog");
    Cookies.remove("roles", { path: "/" });
    Cookies.remove("accessToken", { path: "/" });
    Cookies.remove("fullname", { path: "/" });
  }

  function ticksToDate(ticks: number) {
    return Number.isInteger(ticks)
      ? new Date(ticks / 1e4 + new Date("0001-01-01T00:00:00Z").getTime())
      : null;
  }

  return { login, logout, accessToken, userToken };
});
