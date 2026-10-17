import { useEffect, useState } from "react"
import type { TeamRow } from "../types"
import type { TeamFilter } from "../constants"

function filterDashboardTeam(
  rows: Array<TeamRow>,
  search: string,
  zone: string,
  status: TeamFilter
): Array<TeamRow> {
  const term = search.trim().toLocaleLowerCase()
  return rows.filter((row) => {
    if (term && !row.employeeName.toLocaleLowerCase().includes(term))
      return false
    if (zone && row.zone !== zone) return false
    if (status === "all") return true
    if (status === "scheduled") return Boolean(row.assignmentId)
    if (status === "review") return row.requiresReview
    if (status === "late") return row.lateMinutes > 0
    return row.status === status
  })
}
function useTeamFilters(rows: Array<TeamRow>, scope: string) {
  const [search, setSearch] = useState("")
  const [zone, setZone] = useState("")
  const [status, setStatus] = useState<TeamFilter>("all")
  const [page, setPage] = useState(1)
  useEffect(() => {
    setSearch("")
    setZone("")
    setStatus("all")
    setPage(1)
  }, [scope])
  const filtered = filterDashboardTeam(rows, search, zone, status)
  const pageSize = 25
  const currentPage = Math.min(
    page,
    Math.max(1, Math.ceil(filtered.length / pageSize))
  )
  return {
    search,
    zone,
    status,
    page: currentPage,
    setPage,
    total: filtered.length,
    pageSize,
    rows: filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    zones: [...new Set(rows.map((row) => row.zone))].sort(),
    setSearch: (value: string) => {
      setSearch(value)
      setPage(1)
    },
    setZone: (value: string) => {
      setZone(value)
      setPage(1)
    },
    setStatus: (value: TeamFilter) => {
      setStatus(value)
      setPage(1)
    },
    reset: () => {
      setSearch("")
      setZone("")
      setStatus("all")
      setPage(1)
    },
  }
}
export { useTeamFilters, filterDashboardTeam }
