/**
 * .eslint.js
 *
 * ESLint configuration file.
 */

module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'vuetify',
    '@vue/eslint-config-typescript',
    './.eslintrc-auto-import.json',
  ],
  rules: {
    'vue/multi-word-component-names': 'off',
    'vue/no-mutating-props': 'off',
    'vue/custom-event-name-casing': 'off', // No idea why this is a vue default as it breaks the event listeners!!
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'public/',
  ],
}
