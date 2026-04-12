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
    <Field>
      <InputGroup>
        <InputGroupInput
          value={searchQuery}
          placeholder="Search team members"
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
      </InputGroup>
    </Field>
  )
}

export default EmployeeSearch
