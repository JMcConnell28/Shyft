const piccPlaceholder = "0".repeat(32)
const cmacPlaceholder = "0".repeat(16)

function createClockTagSetupUrl(appBaseUrl: string, publicId: string): string {
  const url = new URL("/clock", appBaseUrl)
  url.searchParams.set("tag", publicId)
  url.searchParams.set("picc", piccPlaceholder)
  url.searchParams.set("cmac", cmacPlaceholder)
  return url.toString()
}

export { createClockTagSetupUrl }
