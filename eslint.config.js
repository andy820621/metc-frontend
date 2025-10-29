import js from '@eslint/js';
import globals from 'globals';
import pluginVue from 'eslint-plugin-vue';
import pluginQuasar from '@quasar/app-vite/eslint';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from '@vue/eslint-config-typescript';

// Auto-import globals
import autoImportGlobals from './.eslintrc-auto-import.json' with { type: 'json' };

// Optional: Prettier integration
import prettierSkipFormatting from '@vue/eslint-config-prettier/skip-formatting';

export default defineConfigWithVueTs(
  {
    /**
     * Ignore the following files.
     * Please note that pluginQuasar.configs.recommended() already ignores
     * the "node_modules" folder for you (and all other Quasar project
     * relevant folders and files).
     */
    ignores: ['.eslintrc-auto-import.json'],
  },

  pluginQuasar.configs.recommended(),
  js.configs.recommended,

  /**
   * https://eslint.vuejs.org
   *
   * pluginVue.configs['flat/essential']
   *   -> base, plus rules to prevent errors or unintended behavior.
   * pluginVue.configs['flat/strongly-recommended']
   *   -> Above, plus rules to considerably improve code readability and/or dev experience.
   * pluginVue.configs['flat/recommended']
   *   -> Above, plus rules to enforce subjective community defaults to ensure consistency.
   */
  pluginVue.configs['flat/essential'],

  {
    files: ['**/*.ts', '**/*.vue'],
    rules: {
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports' },
      ],
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      'require-await': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
    },
  },
  vueTsConfigs.recommendedTypeChecked,

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
        ...globals.node, // SSR, Electron, config files
        ...autoImportGlobals.globals, // Auto-imported Vue & Router APIs

        // Quasar specific
        process: 'readonly', // process.env.*
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly', // BEX related
        browser: 'readonly', // BEX related
      },
    },

    // Your custom rules
    rules: {
      // Generator & Arrow functions
      'generator-star-spacing': 'off',
      'arrow-parens': 'off',
      'one-var': 'off',
      'no-void': 'off',
      'multiline-ternary': 'off',

      'prefer-promise-reject-errors': 'off',

      // TypeScript specific
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',

      'no-unused-vars': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

      // Formatting
      semi: 0,
      'comma-dangle': [
        'error',
        {
          arrays: 'ignore',
          objects: 'ignore',
          imports: 'ignore',
          exports: 'ignore',
          functions: 'ignore',
        },
      ],
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'ignore',
          named: 'ignore',
          asyncArrow: 'always',
        },
      ],
      'quote-props': ['error', 'as-needed'],
      indent: ['off', 2],
      'func-call-spacing': 'off',

      // Vue specific
      'vue/valid-v-model': 'off',
      'vue/multi-word-component-names': [
        'error',
        {
          ignores: ['index'],
        },
      ],
      'vue/no-dupe-keys': 'off',
    },
  },

  // PWA Service Worker specific
  {
    files: ['src-pwa/custom-service-worker.ts'],
    languageOptions: {
      globals: {
        ...globals.serviceworker,
      },
    },
  },

  prettierSkipFormatting, // Optional, if you want prettier
);
