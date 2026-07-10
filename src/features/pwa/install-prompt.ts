type InstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

let installPrompt: InstallPromptEvent | null = null
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function setInstallPrompt(prompt: InstallPromptEvent | null) {
  installPrompt = prompt
  emitChange()
}

function getInstallPrompt() {
  return installPrompt
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export { getInstallPrompt, setInstallPrompt, subscribe }
export type { InstallPromptEvent }
