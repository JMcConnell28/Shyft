import { useRouterState } from "@tanstack/react-router"

// Matches change together with the outlet, including its pending/error state.
// location changes earlier and must only drive the requested nav selection.
function useRenderedPathname(): string {
  return useRouterState({
    select: (state) =>
      state.matches.at(-1)?.pathname ?? state.location.pathname,
  })
}

export { useRenderedPathname }
