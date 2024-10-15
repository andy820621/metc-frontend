import { boot } from 'quasar/wrappers';
// 導入想註冊的元件
import SvgIcon from 'components/SvgIcon.vue';
import SvgBtn from 'components/SvgBtn.vue';
import SvgDropdownBtn from 'components/SvgDropdownBtn.vue';
// 導入想註冊的插件
import VueKonva from 'vue-konva';
import { register } from 'swiper/element/bundle';
// 想註冊的屬性

export default boot(async ({ app }) => {
  // 註冊元件 (全域)
  app.component('SvgIcon', SvgIcon);
  app.component('SvgBtn', SvgBtn);
  app.component('SvgDropdownBtn', SvgDropdownBtn);

  // 註冊插件
  app.use(VueKonva);
  register(); // 註冊 swiper => 不知道為什麼可以使用但 console 仍然會報錯: Failed to resolve component: swiper-container
  // 目前是在quasar.config.js 設置讓vue直接認識 "swiper-" 開頭的 tag => 可以等 swiper 9 官方會不會更新此問題
});
