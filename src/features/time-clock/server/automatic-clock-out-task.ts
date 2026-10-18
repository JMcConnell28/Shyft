import { defineTask } from "nitro/task"
import { processAutomaticClockOuts } from "./automatic-clock-out"

export default defineTask({
  meta: {
    name: "time-clock:process",
    description: "Remind and close overdue attendance entries.",
  },
  async run() {
    return { result: await processAutomaticClockOuts() }
  },
})
