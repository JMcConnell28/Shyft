# RocketRota design system

Paths in this reference start at the repository root. Recheck the relevant source when working on a screen because values and feature boundaries can evolve.

## Brand and styling

| Source | Current values and how to use them |
| --- | --- |
| `src/styles.css` | Tailwind CSS v4 CSS-first configuration with `@theme inline`, `tw-animate-css`, and shadcn styles. `--font-sans` is `"Manrope Variable", sans-serif` and headings use the same family. Light background is `#f7f8fb`, card and popover are white, primary is `oklch(0.5 0.134 242.749)`, primary foreground is `oklch(0.977 0.013 236.62)`, and base radius is `0.625rem`. The stylesheet defines a `.dark` palette. Verify theme support in the affected surface before claiming it works. |
| `src/components/ui/button.tsx` | `default` uses semantic primary tokens. The separate `brand` variant uses `#0868f7`, with `#005de2` on hover. Prefer the variant used by the surrounding flow. Compact primitive sizes often need a larger touch hit area in mobile features. |
| `src/components/app/brand.tsx` and `dashboard-shell.tsx` | Reuse `BrandMark` or `BrandLockup` with `/brand/rocketrota-logo-small.webp`. The mobile text lockup uses `#0d1b3d` for “Rocket” and `#2f6bff` for “Rota”. Use the existing assets under `public/brand/` for artwork and wordmarks. |
| `public/manifest.json` and `src/routes/__root.tsx` | PWA and browser chrome use `#0b2b67`. The manifest specifies standalone display, portrait-primary orientation and versioned icons. Preserve those asset and chrome conventions. |
| `src/features/marketing/styles/landing-preview.css` | Public landing preview uses `#182565` ink, `#627394` muted and `#325cff` accent. These are scoped marketing values. Use the authenticated app palette for workspace UI. |

Start with semantic utilities such as `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `border-border` and `ring-ring`. Older feature surfaces still contain scoped hex values. Match their intent when integrating and prefer existing semantic roles when creating shared styles. Change a global token only when the task calls for a system-level change and its consumers have been checked.

- **Type and density.** The dashboard title uses `text-xl` on mobile and `sm:text-2xl` with semibold tight tracking. Panel headings use `text-sm` and 15 px from `sm`. Use weight and position for hierarchy before increasing size. Compact metadata can sit below the main line. Keep shift times, names, statuses and instructions easy to read. Use tabular figures for repeated hours and totals.
- **Spacing and edges.** `DashboardLayout` uses `px-4 sm:px-6`, `gap-4`, a 96rem max width and safe-area bottom padding. `DashboardPanel` uses `rounded-xl border bg-card`; its header uses a 3.5 or 4 spacing-unit inset. The board uses much tighter gaps to preserve seven columns. Align headings, row content and controls to common edges within a screen. Use dividers for repeated rows, a border for a meaningful group and restrained elevation for overlays.
- **Icons and controls.** `components.json` specifies shadcn `base-mira`, CSS variables and Lucide. Use the Base UI wrappers in `src/components/ui/` and their variants or slots. Follow the local `render` pattern for composing a button-style link with TanStack Router. Use `src/components/forms/` for established field, error and submit behavior and `src/components/shared/date-step-controls.tsx` for stepped dates.

## Architecture and navigation

- The workspace UI lives under `src/routes/_authed/_verified/app/$workspaceSlug/`. Route files handle parameters, search, loading and assembly. Feature UI, query options, hooks and typed data boundaries live under `src/features/`. Shared primitives live under `src/components/ui/`. Keep form schemas, persistence, access and schedule calculations out of presentational UI.
- `src/components/app/dashboard-shell.tsx` owns the sticky branded header on mobile, desktop breadcrumbs, notifications and the workspace content scroll area. `src/components/app/shell/app-sidebar.tsx` and `nav-items.ts` own the capability-aware navigation. `src/components/ui/sidebar.tsx` uses a Sheet on mobile and a collapsible rail on desktop. Reuse these so a feature does not introduce competing navigation.
- Use `src/features/navigation/components/workspace-route-pending.tsx` and `workspace-route-error.tsx` as route-state examples. Use feature-level skeletons or a scoped retry for partial data. `src/components/providers/app-toaster.tsx` configures Sonner with a safe-area-aware mobile offset.
- Follow the primitive's open and closed states. Existing dialogs use short fades and scale changes. The brand lockup, rota skeleton and dashboard section scrolling already demonstrate reduced-motion handling. Use motion for orientation or feedback and respect reduced-motion preferences for new transitions, pulses and smooth scrolling.
- For account entry, inspect `src/components/app/auth-shell.tsx`, `auth-card.tsx`, `branded-artwork-shell.tsx` and `onboarding-shell.tsx`. Reuse the established form and branded artwork treatment where the route calls for it.
