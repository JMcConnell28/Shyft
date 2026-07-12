import { randomUUID } from "node:crypto"

import { sendPushToUser } from "@/features/push-notifications/server/push-service"

const userIndex = process.argv.indexOf("--user")
const userId = userIndex >= 0 ? process.argv[userIndex + 1]?.trim() : undefined

if (!userId) {
  throw new Error("Usage: npm run push:test -- --user <user-id>")
}

const summary = await sendPushToUser(userId, {
  title: "RocketRota notifications are working",
  body: "This device is ready to receive rota updates.",
  tag: "push-cli-test",
  data: { notificationId: randomUUID(), url: "/dashboard" },
})

console.info("Push test complete", summary)
