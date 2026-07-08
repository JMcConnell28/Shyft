import { Search } from "lucide-react"

import { Field } from "@/components/ui/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { useRotaWorkspace } from "@/features/rota/components/rota-workspace-provider"

function EmployeeSearch() {
  const { searchQuery, setSearchQuery } = useRotaWorkspace()

  return (
    <Field className="gap-0">
      <InputGroup className="h-9 rounded-lg border-[#dfe5f0] bg-white shadow-none">
        <InputGroupInput
          value={searchQuery}
          placeholder="Search team"
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-9 text-sm font-semibold text-[#11245a] placeholder:text-[#8b95ad]"
        />
        <InputGroupAddon className="text-[#7a86a4]">
          <Search className="size-4" />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

export default EmployeeSearch
