import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import { defineConfig, globalIgnores } from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts']),

  {
    rules: {
      'no-console': 'warn',

      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@/views/*/*', // Block: @/views/post/shared, @/views/post/queries, etc.
                '@/views/*/*/**', // Block: @/views/post/queries/get-posts, etc.
                '!@/views/*/server', // Allow: @/views/post/server (public server barrel)
              ],
              message:
                'Deep imports into features are forbidden. Use `@/views/feature` (client) or `@/views/feature/server` (server). For internal imports, use relative paths.',
            },
          ],
        },
      ],
    },
  },

  // ─── Shared infrastructure cannot import features ──────
  // Only list folders that should be blocked.
  // src/components is intentionally EXCLUDED so it can import features.
  {
    files: [
      'src/{config,constants,helpers,hooks,layout,lib,store,styles,types}/**/*',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/views/**', '@/views'],
              message: 'Shared infrastructure cannot import from features.',
            },
          ],
        },
      ],
    },
  },
])

export default eslintConfig
