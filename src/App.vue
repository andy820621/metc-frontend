<!-- eslint-disable quotes -->
<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar, Cookies, date } from 'quasar';
// pinia Store
import { storeToRefs } from 'pinia';
// utils
import { useEventListener } from '@vueuse/core';
import { openMultipleMonitors } from './utils/openMultipleMonitors';
import PullToRefresh from 'pulltorefreshjs';

const $q = useQuasar();
provide('$q', $q);

// 解決 IOS pwa 下無法下拉重新整理的問題
if ($q.platform.is.ios) {
  onMounted(() => {
    const isSingleTouch = ref(false);
    function touchStartHandler(event: TouchEvent) {
      isSingleTouch.value = event.touches.length === 1;
    }

    document.addEventListener('touchstart', touchStartHandler);

    PullToRefresh.init({
      mainElement: 'body', // 指定下拉刷新作用的元素
      // distThreshold: 81, // 觸發刷新所需的最小距離 — 預設為 60
      // distMax: 90, // 元素可能的最大距離 — 預設為 80
      onRefresh: () => window.location.reload(),
      shouldPullToRefresh: () => isSingleTouch.value,
    });

    onBeforeUnmount(() => {
      document.removeEventListener('touchstart', touchStartHandler);

      PullToRefresh.destroyAll();
    });
  });
}

useEventListener(window, 'beforeunload', () => {
  const pages = JSON.parse(localStorage.getItem('visitedPages') || '[]');
  const currentPage = window.location.pathname;
  const pageIndex = pages.indexOf(currentPage);
  if (pageIndex > -1) {
    pages.splice(pageIndex, 1);
    localStorage.setItem('visitedPages', JSON.stringify(pages));
  }
});

window.addEventListener('storage', (event) => {
  if (event.key === 'refreshPages' && event.newValue === 'true') {
    setTimeout(() => {
      const refreshPages = localStorage.getItem('refreshPages');
      if (refreshPages) localStorage.removeItem('refreshPages');

      history.go(0);
    }, 2000);
  }
});

// Pwa 用
const broadcast = new BroadcastChannel('app-update');

broadcast.onmessage = (event) => {
  if (event.data === 'update') {
    location.reload();
  }
};
</script>

<style lang="scss">
// q-tabs 客製化設計 (手機專用)
.twoTabsPerRow {
  // & * {
  //   white-space: word-wrap;
  // }
  .q-tabs__content {
    padding: 1rem;
    row-gap: 0.24rem;
    // flex-wrap: wrap;
    display: grid;
    grid-template-columns: repeat(2, 50%);
    .q-tab {
      // flex: 0 0 50%;
      background-color: #f8f3e9;
      &.q-tab--active {
        background-color: #f8f3e9;
        .q-tab__content {
          background-color: white;
          box-shadow: 2px 2px 0 0 rgba(100, 100, 100, 0.5);
          .q-tab__label {
            font-weight: bolder;
          }
        }
      }
      .q-tab__content {
        width: 100%;
        margin: 0.4rem 0;
        transition: all 0.2s ease;
        border-radius: 0.75rem;
        color: black;
        .q-tab__label {
          font-size: 1.1rem;
          width: 100%;
          padding: 0 0.4rem;
          // word-wrap: break-all;
          // overflow-wrap: break-word;

          overflow-x: auto;
          &::-webkit-scrollbar {
            // height: 1px;
            display: none;
          }

          // white-space: nowrap;
          // overflow: hidden;
          // text-overflow: ellipsis;
        }
      }
      .q-tab__indicator {
        display: none;
      }
      /* 奇數  */
      &:nth-child(odd) {
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
        padding-right: 0.5rem;
      }

      /* 偶數 */
      &:nth-child(even) {
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        padding-left: 0.5rem;
      }
    }
  }
}
// q-tabs 客製化設計 (大部分於桌機使用)
.mainTabsDesign {
  color: grey;
  .q-tab__content {
    .q-tab__label {
      @media screen and (min-width: 700px) {
        font-size: 1.3rem;
        font-weight: bolder;
      }
    }
  }
  .mainTabsActiveClass {
    box-shadow: 0 2px 5px rgba(171, 171, 171, 0.8);
  }
}
</style>
