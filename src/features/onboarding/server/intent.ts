import { getDatabase } from "@/lib/db"

type OnboardingIntent = "manage" | "join"

async function getOnboardingIntentForUser(
  userId: string,
): Promise<OnboardingIntent> {
  const result = await getDatabase().query<{ intent: OnboardingIntent }>(
    `select intent
     from public.user_onboarding_preferences
     where user_id = $1`,
    [userId],
  )

  return result.rows.at(0)?.intent ?? "manage"
}

async function saveOnboardingIntentForEmail({
  email,
  intent,
}: {
  email: string
  intent: OnboardingIntent
}) {
  const result = await getDatabase().query<{ id: string }>(
    `select id
     from public."user"
     where lower(email) = lower($1)
     limit 1`,
    [email],
  )
  const userId = result.rows.at(0)?.id

  if (!userId) {
    return { success: true }
  }

  await getDatabase().query(
    `insert into public.user_onboarding_preferences (user_id, intent)
     values ($1, $2)
     on conflict (user_id) do update
       set intent = excluded.intent,
           updated_at = now()`,
    [userId, intent],
  )

  return { success: true }
}

export { getOnboardingIntentForUser, saveOnboardingIntentForEmail }
export type { OnboardingIntent }
