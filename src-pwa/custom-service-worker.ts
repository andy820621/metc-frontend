/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config.js > pwa > workboxMode is set to "injectManifest"
 */

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';

self.__WB_DISABLE_DEV_LOGS = true; // ? 停用 console.log
void self.skipWaiting();

clientsClaim();

precacheAndRoute(self.__WB_MANIFEST); // 使用預缓存

cleanupOutdatedCaches(); // 清理过时的缓存

// 非 SSR 情况下回退到 index.html
// Production SSR fallback to offline.html (except for dev)
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(process.env.PWA_FALLBACK_HTML),
      { denylist: [/sw\.js$/, /workbox-(.)*\.js$/] },
    ),
  );
}

// 解決 workbox console alert => 緩存 SVG 圖檔
registerRoute(
  ({ url }) => url.pathname.startsWith('/svgIcons/'),
  new StaleWhileRevalidate({
    cacheName: 'svg-icon-cache',
  }),
);
