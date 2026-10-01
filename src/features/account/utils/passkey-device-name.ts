function getPasskeyDeviceName(userAgent: string): string {
  if (/iPhone|iPod/u.test(userAgent)) return "iPhone"
  if (/iPad/u.test(userAgent)) return "iPad"
  if (/Android/u.test(userAgent)) return "Android device"
  if (/Windows/u.test(userAgent)) return "Windows device"
  if (/Macintosh|Mac OS/u.test(userAgent)) return "Mac"
  return "My device"
}

export { getPasskeyDeviceName }
