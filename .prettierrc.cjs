module.exports = {
  singleQuote: true,
  trailingComma: 'es5',
  arrowParens: 'always',
  printWidth: 80,
  tabWidth: 4,
  plugins: ["@trivago/prettier-plugin-sort-imports"],
   importOrder: [
    "^[react]",
    "^./hooks",
    "^~/icons",
    "^@(?!/)",
    "^@/entities",
    "^@/features",
    "^@/widget",
    "^@/shared",
    "^./ui",
    "^[./]"
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,

  overrides: [
    {
      files: ['*.json'],
      options: {
        semi: true,
        tabWidth: 2,
      },
    },
  ],
};