//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    ignores: [".output/**/*"],
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
