import { req } from "boot/axios";

const Misc = {
  // 圖控導引設定
  apiGetGuide() {
    return req("get", "/Misc/guide");
  },
  // 多螢幕設定
  apiGetScreens() {
    return req("get", "/Misc/screens");
  },

};

export default Misc;
