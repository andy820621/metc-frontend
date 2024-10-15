<template>
  <q-drawer
    ref="drawerRef"
    side="right"
    overlay
    behavior="mobile"
    no-swipe-open
    :width="$q.screen.width"
    class="bg-secondary"
  >
    <h3
      class="text-left text-bold"
      style="font-size: 1.55rem; margin: 1.2rem 1.6rem"
    >
      提醒事項
    </h3>

    無相關提醒事項
  </q-drawer>
</template>

<script setup lang="ts">
const $q = inject('$q') as typeof QVueGlobals;

const drawerRef = ref();
</script>

<style lang="scss" scoped>
// :deep(drawerRef) {
//   .q-drawer {
//     z-index: 2; // 避免蓋到左側 Menu
//   }
//   .q-drawer__backdrop {
//     z-index: 1; // 避免蓋到左側 Menu
//     background-color: transparent !important;
//     pointer-events: none;
//   }
//   .q-drawer {
//     background-color: #fff;
//   }
// }

.listContainer {
  counter-reset: section; /* 在最外層容器上重置計數器 */

  /* 為第一層的 ul 設置樣式 */
  & > ul {
    list-style-type: none;
    padding-left: 0;

    & > li::before {
      counter-increment: section; /* 每個 li 項目增加計數器的值 */
      content: counter(section) '. '; /* 顯示計數器的值和點 */
      padding-right: 5px;
    }

    ul {
      list-style-type: none;
      counter-reset: subsection; /* 設置子計數器 */
      padding-left: 20px;
      /* 為第二層的 ul 設置樣式 */
      & > li::before {
        counter-increment: subsection; /* 每個嵌套 li 項目增加計數器的值 */
        content: '(' counter(subsection) ') '; /* 顯示計數器的值，用括號括起來 */
        padding-right: 5px;
      }
    }
  }
}
</style>
