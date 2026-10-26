import { defineTask } from "nitro/task"
import { expirePersonalDataResponses } from "./maintenance"
import { sendPersonalDataNotifications } from "./notifications"

export default defineTask({
  meta: {
    name: "privacy:process",
    description:
      "Expire personal data responses and deliver request notifications.",
  },
  async run() {
    await expirePersonalDataResponses()
    const sent = await sendPersonalDataNotifications()
    return { result: { notificationsSent: sent } }
  },
})
