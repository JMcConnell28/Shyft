import { BellIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useAccountPreferences } from "@/features/account/hooks/use-account-preferences"
import { NotificationSettingsCard } from "@/features/push-notifications/components/notification-settings-card"
import { SettingsSection } from "@/features/settings/components/settings-section"

function AccountPreferencesPage({ userId }: { userId: string }) {
  const { query, mutation } = useAccountPreferences(userId)

  return (
    <div className="settings-content min-w-0 space-y-3">
      <SettingsSection
        title="Notification preferences"
        icon={BellIcon}
        description="Choose which push notifications you receive across all your devices. Changes save automatically."
      >
        {query.isPending ? (
          <p role="status" className="py-3 text-xs text-[#657398]">
            Loading preferences...
          </p>
        ) : query.isError ? (
          <div role="alert" className="space-y-2 py-3 text-xs">
            <p>We could not load your preferences.</p>
            <Button variant="outline" onClick={() => void query.refetch()}>
              Try again
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-4 py-3">
            <div>
              <label
                htmlFor="announcement-push"
                className="text-xs font-bold text-[#14214a]"
              >
                Announcement notifications
              </label>
              <p
                id="announcement-push-description"
                className="mt-1 text-xs text-[#7180a2]"
              >
                Receive a push notification when a new announcement is posted
                for your team. Enabled by default.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {mutation.isPending ? (
                <span role="status" className="text-xs">
                  Saving...
                </span>
              ) : null}
              <Switch
                id="announcement-push"
                aria-describedby="announcement-push-description"
                checked={
                  mutation.isPending
                    ? mutation.variables.announcementPushEnabled
                    : query.data.announcementPushEnabled
                }
                disabled={mutation.isPending}
                onCheckedChange={(announcementPushEnabled) =>
                  mutation.mutate({ announcementPushEnabled })
                }
              />
            </div>
          </div>
        )}
      </SettingsSection>
      <NotificationSettingsCard />
    </div>
  )
}

export { AccountPreferencesPage }
