import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"

import { QueryProvider } from "@/components/providers/query-provider"
import { AdminPwaController } from "@/features/pwa/components/admin-pwa-controller"

import appCss from "../styles.css?url"

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      { title: "RocketRota Admin" },
      { name: "theme-color", content: "#0f172a" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Admin" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "icon", href: "/pwa/icon-192.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/pwa/icon-180.png" },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryProvider>
          {children}
          <AdminPwaController />
        </QueryProvider>
        <Scripts />
      </body>
    </html>
  )
}
