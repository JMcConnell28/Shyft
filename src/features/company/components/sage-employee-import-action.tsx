import { useSageEmployeeImportAccess } from "../hooks/use-sage-employee-import-access"
import { SageEmployeeImportDialog } from "./sage-employee-import-dialog"
import type { SageEmployeeImportDialogProps } from "../types"

function SageEmployeeImportAction(props: SageEmployeeImportDialogProps) {
  const enabled = useSageEmployeeImportAccess({
    organizationId: props.organizationId,
    locationId: props.locationId,
    userId: props.userId,
  })
  return enabled ? <SageEmployeeImportDialog {...props} /> : null
}
export { SageEmployeeImportAction }
