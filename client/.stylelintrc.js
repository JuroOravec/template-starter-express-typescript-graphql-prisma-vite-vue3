// NOTE: DISABLED because I keep getting `CssSyntaxError` error in vue files:
// ```
// app.vue
// 1:1  ✖  Unknown word  CssSyntaxError
// 
// 1 problem (1 error, 0 warnings)
// ```

// See https://stylelint.io/user-guide/configure/
// Config inspired by https://github.com/stylelint/stylelint/issues/5634#issuecomment-1332900268
module.exports = {
  // extends: [
  // 'stylelint-config-html',
  // 'stylelint-config-recommended-vue/scss',
  // 'stylelint-prettier/recommended',
  // ],
  // customSyntax: 'postcss-html',
  // plugins: ['stylelint-order', 'stylelint-prettier'],
  rules: {
    // 'declaration-empty-line-before': 'never',
    // 'font-family-name-quotes': 'always-unless-keyword',
    // 'order/order': ['custom-properties', 'declarations'],
    // 'order/properties-alphabetical-order': true,
    // 'prettier/prettier': true,
  },
  overrides: [
    // {
    // files: ['**/*.vue'],
    // customSyntax: 'postcss-scss',
    // },
    //   {
    //     files: ['**/*.cjs'],
    //     customSyntax: 'css-in-js',
    //   },
  ],
};
