import nextConfig from 'eslint-config-next'

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'scripts/**/*.js',
      'examples/**/*.ts',
      '.bmad/**',
      '.claude/**',
    ],
  },
]

export default eslintConfig
