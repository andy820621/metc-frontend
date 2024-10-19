/* eslint-env node */

/*
 * This file runs in a Node context (it's NOT transpiled by Babel), so use only
 * the ES6 features that are supported by your Node version. https://node.green/
 */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-js

// import vue from '@vitejs/plugin-vue'

const { QuasarResolver } = require('unplugin-vue-components/resolvers');
const { visualizer } = require('rollup-plugin-visualizer');

const { configure } = require('quasar/wrappers');
const path = require('path');
const fs = require('fs');

module.exports = configure(function (ctx) {
  return {
    supportTS: true,
    eslint: {
      fix: true,
      // include = [],
      // exclude = [],
      // rawOptions = {},
      warnings: true,
      errors: true,
    },

    // https://v2.quasar.dev/quasar-cli-vite/prefetch-feature
    // preFetch: true,

    // app boot file (/src/boot)
    // --> boot files are part of "main.js"
    // https://v2.quasar.dev/quasar-cli-vite/boot-files
    boot: ['global-registration', 'axios'],

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#css
    css: ['app.scss'],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      // 'ionicons-v4',
      // 'mdi-v5',
      // 'fontawesome-v6',
      // 'eva-icons',
      // 'themify',
      // 'line-awesome',
      // 'roboto-font-latin-ext', // this or either 'roboto-font', NEVER both!

      'roboto-font', // optional, you are not bound to it
      'material-icons', // optional, you are not bound to it
    ],

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#build
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16',
        alias: {
          '@': path.join(__dirname, './src'),
          '@assets': path.join(__dirname, './src/assets'),
        },
      },

      vueRouterMode: 'history', // available values: 'hash', 'history'
      // vueRouterBase,
      // vueDevtools,
      // vueOptionsAPI: false,

      // rebuildCache: true, // rebuilds Vite/linter/etc cache on startup

      publicPath: '/',
      // analyze: true,
      env: {
        // API: ctx.dev ? "https://localhost:5001" : "http://172.17.0.7/",
        // Local: ctx.dev ? "https://localhost:5000" : "https://dahua.metcfire.com.tw/",
        API: ctx.dev
          ? 'https://localhost:5001'
          : 'https://present.metcfire.com.tw',
        Url: ctx.dev
          ? 'https://localhost:5001'
          : 'https://present.metcfire.com.tw',
      },
      // rawDefine: {}
      // ignorePublicFolder: true,
      // minify: false,
      // polyfillModulePreload: true,
      // distDir

      extendViteConf(viteConf) {
        viteConf.base = '/';
      },
      viteVuePluginOptions: {
        template: {
          compilerOptions: {
            isCustomElement: (tag) => tag.startsWith('swiper-'),
          },
        },
      },

      vitePlugins: [
        [
          'unplugin-auto-import/vite',
          {
            dts: true,
            include: [/\.[tj]sx?$/, /\.vue$/],
            imports: [
              'vue',
              'vue-router',
              {
                // "@vueuse/core": [
                // named imports
                // "useMouse", // import { useMouse } from '@vueuse/core',
                // alias
                // ["useFetch", "useMyFetch"], // import { useFetch as useMyFetch } from '@vueuse/core',
                // ],
                axios: [
                  // default imports
                  ['default', 'axios'], // import { default as axios } from 'axios',
                ],
              },
            ],
            resolvers: [], // 第三方ui
            eslintrc: {
              enabled: false, // @default false
              filepath: './.eslintrc-auto-import.json', // @default './.eslintrc-auto-import.json'
              globalsPropValue: true, // @default true 可設置 boolean | 'readonly' | 'readable' | 'writable' | 'writeable'
            },
          },
        ],
        [
          'unplugin-vue-components/vite',
          {
            dts: true,
            dirs: [
              'src/components',
              'src/components/Dialog',
              'src/layouts/components',
              'src/pages/emergency/marshalling/components',
            ],
            resolvers: [QuasarResolver()],
            deep: true,
          },
        ],
        visualizer({
          open: true,
          filename: 'visualizer.html',
          gzipSize: true, // 蒐集 gzip 壓縮檔案到圖表
          brotliSize: true, // 蒐集 brotli 壓縮檔案到圖表
          emitFile: false, // 在 dist 也生出分析文件
          // sourcemap: true, // 使用 sourcemap 計算大小
        }),
      ],
    },
    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#devServer
    devServer: {
      https: true,
      // https: {
      //   // quasar 官方提供: https://nodejs.org/api/https.html#https_https_createserver_options_requestlistener
      //   // mkcert 安裝: https://medium.com/easons-murmuring/%E4%BD%BF%E7%94%A8-mkcert-%E5%9C%A8%E6%9C%AC%E5%9C%B0%E7%AB%AF%E5%AF%A6%E7%8F%BE-https-%E4%BB%A5-node-js-nuxt-js-vue-cli-%E5%8F%8A-create-react-app-%E7%82%BA%E4%BE%8B-dafcb72ff835
      //   key: fs.readFileSync('./SSL/mkcert/localhost-key.pem', 'utf8'),
      //   cert: fs.readFileSync('./SSL/mkcert/localhost.pem', 'utf8'),
      // },
      open: true, // opens browser window automatically
      port: ctx.mode.spa ? 5001 : ctx.mode.pwa ? 9000 : 9090,
      proxy: {
        // 將所有以/api開頭的請求代理
        '/api': {
          target: 'https://localhost:5001/',
          changeOrigin: true,
        },
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#framework
    framework: {
      cssAddon: true,
      config: {
        brand: {
          primary: 'rgb(139, 105, 78)',
          secondary: '#f8f3e9',
          negative: '#C10015',
          accent: '#e7e5d8',
          dark: '#1d1d1d',
          blue: '#26A69A',
          positive: '#21BA45',
          info: '#31CCEC',
          warning: '#f8b600',
        },
        loadingBar: { color: 'cyan-8' },
      },

      // iconSet: 'material-icons', // Quasar icon set
      lang: 'zh-TW', // Quasar language pack

      // For special cases outside of where the auto-import strategy can have an impact
      // (like functional components as one of the examples),
      // you can manually specify Quasar components/directives to be available everywhere:
      //
      // components: [],
      // directives: [],

      // Quasar plugins
      plugins: [
        'AppFullscreen',
        'Notify',
        'LoadingBar',
        'Dialog',
        'Loading',
        'LocalStorage',
      ],
    },

    // animations: 'all', // --- includes all animations
    // https://v2.quasar.dev/options/animations
    animations: [],

    // https://v2.quasar.dev/quasar-cli-vite/developing-ssr/configuring-ssr
    ssr: {
      // ssrPwaHtmlFilename: 'offline.html', // do NOT use index.html as name!
      // will mess up SSR

      // extendSSRWebserverConf (esbuildConf) {},
      // extendPackageJson (json) {},

      pwa: false,

      // manualStoreHydration: true,
      // manualPostHydrationTrigger: true,

      prodPort: 3000, // The default port that the production server should use
      // (gets superseded if process.env.PORT is specified at runtime)

      middlewares: [
        'render', // keep this as last one
      ],
    },

    // https://v2.quasar.dev/quasar-cli-vite/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'generateSW', // "generateSW" or 'injectManifest'
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      // useFilenameHashes: true,
      // extendGenerateSWOptions (cfg) {}
      // extendInjectManifestOptions (cfg) {},
      // extendManifestJson (json) {}
      // extendPWACustomSWConf (esbuildConf) {}
    },
    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-js#sourcefiles
    sourceFiles: {
      // rootComponent: 'src/App.vue',
      // router: 'src/router/index',
      // store: 'src/store/index',
      // registerServiceWorker: 'src-pwa/register-service-worker',
      // serviceWorker: 'src-pwa/custom-service-worker',
      // pwaManifestFile: 'src-pwa/manifest.json',
      // electronMain: 'src-electron/electron-main',
      // electronPreload: 'src-electron/electron-preload'
      pwaRegisterServiceWorker: 'src-pwa/register-service-worker',
      pwaServiceWorker: 'src-pwa/custom-service-worker',
      pwaManifestFile: 'src-pwa/manifest.json',
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true, // uncomment only if you know what you are doing
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true,
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-electron-apps/configuring-electron
    electron: {
      // extendElectronMainConf (esbuildConf)
      // extendElectronPreloadConf (esbuildConf)

      inspectPort: 5858,

      bundler: 'packager', // 'packager' or 'builder'

      packager: {
        // https://github.com/electron-userland/electron-packager/blob/master/docs/api.md#options
        // OS X / Mac App Store
        // appBundleId: '',
        // appCategoryType: '',
        // osxSign: '',
        // protocol: 'myapp://path',
        // Windows only
        // win32metadata: { ... }
      },

      builder: {
        // https://www.electron.build/configuration/configuration

        appId: 'metc-frontend',
      },
    },

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/developing-browser-extensions/configuring-bex
    bex: {
      contentScripts: ['my-content-script'],

      // extendBexScriptsConf (esbuildConf) {}
      // extendBexManifestJson (json) {}
    },
  };
});
