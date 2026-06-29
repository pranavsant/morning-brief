module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh', 'import'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'error',

    /* ── Clean Architecture import guards ───────────────────────────────── */
    // Prevent domain from importing outside itself
    'no-restricted-imports': 'off',
    'import/no-restricted-paths': [
      'error',
      {
        zones: [
          // domain must not import from any other layer
          {
            target: './src/domain',
            from: ['./src/application', './src/infrastructure', './src/interfaces'],
            message: 'Domain layer must not import from outer layers.',
          },
          // application must not import from infrastructure or interfaces
          {
            target: './src/application',
            from: ['./src/infrastructure', './src/interfaces'],
            message: 'Application layer must not import from infrastructure or interfaces.',
          },
          // interfaces must not import directly from infrastructure
          {
            target: './src/interfaces',
            from: ['./src/infrastructure'],
            message: 'Interfaces layer must not import directly from infrastructure — go through use cases.',
          },
        ],
      },
    ],
  },
};
