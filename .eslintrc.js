/** @format */

module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'prettier', 'plugin:jsdoc/recommended'],
  plugins: ['prettier', 'jsdoc'],
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    'prettier/prettier': ['error'],
    'linebreak-style': ['error', 'unix'],
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'no-unused-vars': ['error'],
    'no-var': ['error'],
    'no-constructor-return': ['error'],
    'no-promise-executor-return': ['error'],
    'no-self-compare': ['error'],
    'no-template-curly-in-string': ['error'],
    'no-unmodified-loop-condition': ['error'],
    'no-unreachable-loop': ['error'],
    'capitalized-comments': [
      'error',
      'always',
      { ignoreInlineComments: true, ignoreConsecutiveComments: true },
    ],
    'default-case-last': ['error'],
    'default-param-last': ['error'],
    'func-name-matching': ['error'],
    'no-else-return': ['error'],
    camelcase: 'off',
    'prefer-const': [2, { destructuring: 'any' }],
    'no-duplicate-imports': ['error', { includeExports: true }],
  },
};
