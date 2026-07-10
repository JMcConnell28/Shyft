import { notFound } from "@tanstack/react-router"

import { HelpArticle } from "@/features/help-center/components/help-article"
import { HelpCenterHome } from "@/features/help-center/components/help-center-home"
import { HelpCenterShell } from "@/features/help-center/components/help-center-shell"
import { getHelpPage } from "@/features/help-center/source"

type HelpCenterPageProps = {
  slug?: string[]
}

function HelpCenterPage({ slug }: HelpCenterPageProps) {
  const currentSlug = slug?.join("/") ?? ""

  if (!currentSlug) {
    return (
      <HelpCenterShell>
        <HelpCenterHome />
      </HelpCenterShell>
    )
  }

  const page = getHelpPage(slug)

  if (!page) {
    throw notFound()
  }

  return (
    <HelpCenterShell currentSlug={page.slug}>
      <HelpArticle page={page} />
    </HelpCenterShell>
  )
}

export { HelpCenterPage }
