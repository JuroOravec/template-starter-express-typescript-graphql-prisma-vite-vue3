module.exports = {
  "extends": [
    "eslint:recommended",
    "plugin:prettier/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  "plugins": [
    "prettier",
    "@typescript-eslint",
  ],
  "env": {
    "node": true,
    "es6": true
  },
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "sourceType": "module",
    "ecmaVersion": "latest",
    // "project": "tsconfig.json"
  },
  "ignorePatterns": [
    "node_modules",
    "build",
    "dist",
    "public"
  ],
  "rules": {
    "no-console": "warn",
    "prettier/prettier": "error",
    "@typescript-eslint/explicit-member-accessibility": 'off',
    "@typescript-eslint/no-explicit-any": 'off',
    "@typescript-eslint/ban-ts-comment": 'warn',
    'max-len': 'off',
    
  },
  // "overrides": [
  //   {
  //     files: ['*.ts', '*.tsx'], // Your TypeScript files extension
  //     parserOptions: {
  //       project: ['./tsconfig.json'], // Specify it only for TypeScript files
  //     },
  //   },
  // ],
};
