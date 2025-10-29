/* eslint-env node */

// Configuration for your app
// https://v2.quasar.dev/quasar-cli-vite/quasar-config-file

import { configure } from 'quasar/wrappers';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { QuasarResolver } from 'unplugin-vue-components/resolvers';
import { visualizer } from 'rollup-plugin-visualizer';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default configure((ctx: any) => {
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

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#css
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

    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#build
    build: {
      target: {
        browser: ['es2019', 'edge88', 'firefox78', 'chrome87', 'safari13.1'],
        node: 'node16',
      },
      alias: {
        '@': path.join(rootDir, './src'),
        '@assets': path.join(rootDir, './src/assets'),
        components: path.join(rootDir, './src/components'),
        layouts: path.join(rootDir, './src/layouts'),
        pages: path.join(rootDir, './src/pages'),
        assets: path.join(rootDir, './src/assets'),
        boot: path.join(rootDir, './src/boot'),
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
      distDir: ctx.mode.spa ? 'dist/spa' : `dist/${ctx.modeName}`,

      extendViteConf(viteConf: any) {
        viteConf.base = '/';
      },
      viteVuePluginOptions: {
        template: {
          compilerOptions: {
            isCustomElement: (tag: string) => tag.startsWith('swiper-'),
          },
        },
      },

      // Casting to any to satisfy strict Quasar TS types for heterogeneous plugin tuples
      vitePlugins: [
        [
          'vite-plugin-checker',
          {
            vueTsc: true,
            eslint: {
              lintCommand:
                'eslint -c ./eslint.config.js "./src/**/*.{ts,js,mjs,cjs,vue}" "./src-pwa/**/*.{ts,js,mjs,cjs,vue}"',
              useFlatConfig: true,
            },
          },
          { server: false },
        ],
        [
          'unplugin-auto-import/vite',
          {
            dts: true,
            include: [/\.[tj]sx?$/, /\.vue$/],
            imports: [
              'vue',
              'vue-router',
              'quasar',
              'pinia',
              {
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
      ] as any,
    },
    // Full list of options: https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#devserver
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
          secure: false, // 允許自簽名證書
        },
      },
    },

    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#framework
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
      workboxMode: 'GenerateSW',
      injectPwaMetaTags: true,
      swFilename: 'sw.js',
      manifestFilename: 'manifest.json',
      useCredentialsForManifestTag: false,
      // 確保 base URL 正確
      workboxOptions: {
        cleanupOutdatedCaches: true,
        skipWaiting: true,
        clientsClaim: true,
      },
    },
    // https://v2.quasar.dev/quasar-cli-vite/quasar-config-file#sourcefiles
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

    // bex configuration removed (not used in this project)
  };
});
