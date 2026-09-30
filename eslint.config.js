// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*'],
              message:
                'src/ runs on the phone too. Node built-ins belong in plugin/.',
            },
          ],
          paths: ['fs', 'path', 'os', 'child_process'].map((name) => ({
            name,
            message:
              'src/ runs on the phone too. Node built-ins belong in plugin/.',
          })),
        },
      ],
    },
  },
  require('eslint-plugin-prettier/recommended'),
]);
