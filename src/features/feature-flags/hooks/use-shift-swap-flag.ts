import { useQuery } from "@tanstack/react-query"
import { getShiftSwapAvailability } from "@/features/shift-swaps/server-fns"

function useShiftSwapFlag(
  organizationId: string | undefined,
  userId: string,
  fallback: boolean
) {
  const query = useQuery({
    queryKey: ["feature-access", "shift-swaps", organizationId, userId],
    queryFn: () =>
      getShiftSwapAvailability({
        data: { organizationId: organizationId ?? "", userId },
      }),
    enabled: Boolean(organizationId),
    staleTime: 0,
    refetchInterval: 20000,
    refetchOnWindowFocus: "always",
  })
  return query.data ?? fallback
}
export { useShiftSwapFlag }
