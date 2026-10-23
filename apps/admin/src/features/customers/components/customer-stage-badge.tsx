import { customerStageLabels } from "../constants"
import type { CustomerStage } from "../types"
import { StatusBadge } from "@/components/ui/status-badge"

function CustomerStageBadge({ stage }: { stage: CustomerStage }) {
  return (
    <StatusBadge
      tone={
        stage === "active" ? "good" : stage === "trial" ? "warning" : "neutral"
      }
    >
      {customerStageLabels[stage]}
    </StatusBadge>
  )
}
export { CustomerStageBadge }
