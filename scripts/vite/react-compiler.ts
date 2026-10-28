import babel from "@rolldown/plugin-babel"
import { reactCompilerPreset } from "@vitejs/plugin-react"

export function reactCompiler(): ReturnType<typeof babel> {
  return babel({
    presets: [reactCompilerPreset()],
    // TanStack Start's split routes retain JSX/TS syntax and append a query.
    overrides: [
      {
        include: /\.tsx(?:\?|$)/,
        parserOpts: { plugins: ["typescript", "jsx"] },
      },
      {
        include: /\.ts(?:\?|$)/,
        parserOpts: { plugins: ["typescript"] },
      },
    ],
  })
}
