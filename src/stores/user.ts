import { defineStore } from "pinia";
import User, { loginDevice } from "src/api/user";
import { UserViewModel } from "src/api/accountSetting";

import FileReadMixin from "src/utils/fileRead";
// FCM
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  MessagePayload,
} from "firebase/messaging";
import { Notify } from "quasar";

const { getFile } = FileReadMixin();

export { loginDevice };

export const useUserStore = defineStore("user", () => {
  const userMugShotUrl = ref();
  const userData = ref<UserViewModel>({
    account: "",
    fullname: "",
    password: "",
    emailConfirmed: false,
    roleBuildings: [],
    roleAddressPlates: [],
    addressPlateConfirmeds: {},
    roles: [],
    switchs: 0,
    isCommunityUser: false,
  });
  const roleName = ref<string[]>([]);
  const marshallingName = ref<string>("");
  const marshallingId = ref<string>("");
  const fcmToken = ref<string>("");
  const roleChName = ref<string[]>([]);

  // 編組角色判斷
  const isManagerGroup = computed(
    () =>
      userData.value.isCommunityUser ||
      isCenter.value ||
      isManager.value ||
      isMercury.value ||
      isSystem.value
  );

  const isNormalUser = computed(() => roleName.value.includes("Member"));
  const isFire = computed(() => marshallingName.value === "Fire"); // 滅火班
  const isInfo = computed(() => marshallingName.value === "Inform"); // 通報班
  const isGuide = computed(() => marshallingName.value === "EvacuationGuide"); // 避難引導班
  const isProtection = computed(
    () => marshallingName.value === "SafetyProtection"
  ); // 安全防護班
  const isAmbulance = computed(() => marshallingName.value === "Ambulance"); // 救護班
  const isManager = computed(() => roleName.value.includes("Manager")); // 防火管理人
  const isCenter = computed(() => roleName.value.includes("Center")); // 防災中心
  const isMercury = computed(() => roleName.value.includes("Mercury")); // 水星
  const isSystem = computed(() => roleName.value.includes("System")); // 系統管理員

  // 按鈕選項

  function setMarshallingName(name: string) {
    marshallingName.value = name;
  }

  async function saveFCMToken(device: loginDevice, token: string) {
    fcmToken.value = token;
    await User.apiSaveFCMToken(device, token);
  }

  async function getUserData() {
    const result = await User.apiGetUserData();
    userData.value = result.data;
    console.log("getUserData result", result.data);

    if (!userData.value?.mugShotFileId) return;
    userMugShotUrl.value = await getFile(null, userData.value?.mugShotFileId);
  }

  async function initFirebase() {
    const firebaseConfig = {
      apiKey: "AIzaSyC3VstjYUdmYUMuqy2xDFeGfv5P3ys01jQ",
      authDomain: "mercuryfire-618cd.firebaseapp.com",
      projectId: "mercuryfire-618cd",
      storageBucket: "mercuryfire-618cd.appspot.com",
      messagingSenderId: "82407845910",
      appId: "1:82407845910:web:5f34186d6d937c6db40537",
      measurementId: "G-W8WVXXWT0G",
    };
    const app = initializeApp(firebaseConfig);
    if (!app) return;
    const messaging = getMessaging(app);
    if (messaging) {
      // Notify.create({
      //   type: "positive",
      //   message: "firebase messaging is working!!",
      //   position: "top",
      // });
      console.log("firebase messaging is working!!!");

      onMessage(messaging, (payload) => {
        if (Notification.permission !== "granted") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              showMessage(payload);
            }
          });
        } else {
          showMessage(payload);
        }
      });

      getToken(messaging, {
        vapidKey:
          "BJxtEotJRDFv9u2Gqe2KtnUpWkZAaCuFsKE3jKw3WZA7x4MEb0ot704YMAUe9Ks0N7TbXaxGcMTsoWlYIQDNBzU",
      })
        .then(async (currentToken) => {
          if (currentToken) {
            // Notify.create({
            //   type: "positive",
            //   message: "正確的取得 FCM token",
            //   position: "top",
            // });
            console.log("currentToken", currentToken);
            fcmToken.value = currentToken;
          } else {
            // Notify.create({
            //   type: "warning",
            //   message: "未能正確取得 FCM token",
            //   position: "top",
            // });
            console.error("未能正確取得 FCM token");
          }
        })
        .catch((err) => {
          if (err && err.length > 0) {
            // Notify.create({
            //   type: "warning",
            //   message: "獲取令牌時出現錯誤: " + err,
            //   position: "top",
            // });
            console.error(`獲取令牌時出現錯誤: ${err}`);
          } else {
            // Notify.create({
            //   type: "warning",
            //   message: "獲取令牌時出現未知錯誤",
            //   position: "top",
            // });
            console.error("獲取令牌時出現未知錯誤");
          }
          if (Notification.permission !== "granted") {
            // 請求通知權限
            Notification.requestPermission().then(async (permission) => {
              if (permission === "granted") {
                await initFirebase();
              } else if (permission === "denied") {
                Notify.create({
                  type: "warning",
                  message: "沒有開啟通知權限將無法收取任何推播內容!!",
                  position: "top",
                });
              }
            });
          }
        });
    }
  }

  function showMessage(payload: MessagePayload) {
    Notify.create({
      type: "info",
      message: payload.notification?.body,
      position: "top",
    });

    // 此處先註解: 因為在應用程式使用中時，Notification 不會發送通知
    // if ("Notification" in window) {
    //   const notificationTitle = payload.notification?.title || "";
    //   const notificationOptions = {
    //     body: payload.notification?.body,
    //     icon: "/icon.png",
    //     vibrate: [100, 50, 100],
    //     data: {
    //       dateOfArrival: Date.now(),
    //     },
    //   };
    //   // eslint-disable-next-line no-new
    //   new Notification(notificationTitle, notificationOptions);
    // } else {
    //   Notify.create({
    //     type: "warning",
    //     message: "瀏覽器不支援通知",
    //     position: "top",
    //   });
    // }
  }

  return {
    userMugShotUrl,
    roleName,
    marshallingName,
    roleChName,
    marshallingId,
    userData,
    getUserData,
    setMarshallingName,
    saveFCMToken,
    initFirebase,
    fcmToken,
    isNormalUser,
    isFire,
    isInfo,
    isGuide,
    isProtection,
    isAmbulance,
    isManager,
    isCenter,
    isManagerGroup,
    isMercury,
    isSystem,
  };
});
