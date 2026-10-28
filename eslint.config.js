//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"
import reactHooks from "eslint-plugin-react-hooks"

export default [
  ...tanstackConfig,
  {
    ignores: [".output/**/*"],
  },
  {
    ...reactHooks.configs.flat.recommended,
    files: ["src/**/*.{ts,tsx}", "apps/admin/src/**/*.{ts,tsx}"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-duplicate-imports": "error",
    },
  },
  {
    files: ["src/components/**/*.{ts,tsx}", "src/routes/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/db",
              message:
                "Route and UI modules should consume server/data helpers instead of importing the database directly.",
            },
          ],
        },
      ],
    },
  },
]
