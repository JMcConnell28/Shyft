import Title from "@/components/title"
import type {
  OrganizationSummary,
  WorkspaceSummary,
} from "@/features/onboarding/types"

function LocationName({
  activeOrganization,
  activeWorkspace,
}: {
  activeOrganization: OrganizationSummary | null
  activeWorkspace: WorkspaceSummary | null
}) {
  return (
    <>
      <div className="flex items-center gap-4 px-6 pt-8 pb-8 text-[#071a54] md:hidden">
        <div className="flex aspect-[1.55] h-8 items-center justify-center">
          <img
            src="/brand/rocketrota-logo.png"
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
        <Title />
      </div>

      <div className="hidden w-full items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#4c5675] group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:self-center group-data-[collapsible=icon]:px-0 first:pt-0 md:flex">
        <div className="flex aspect-square size-8 items-center justify-center rounded-lg p-1">
          <img
            src="/brand/rocketrota-logo.png"
            alt="RocketRota"
            className="size-full object-contain"
          />
        </div>
        <div className="text-md grid flex-1 overflow-hidden text-left text-lg leading-tight transition-[width,opacity] duration-200 ease-linear group-data-[collapsible=icon]:hidden">
          <span className="truncate font-medium">
            {activeWorkspace?.name ?? activeOrganization?.name ?? "RocketRota"}
          </span>
        </div>
      </div>
    </>
  )
}

export default LocationName
