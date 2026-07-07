export const DESKTOP_APP_DOWNLOAD_URL =
  process.env.NEXT_PUBLIC_DESKTOP_APP_DOWNLOAD_URL ||
  'https://github.com/Mueez1727/clipflow-desktop-app/releases/download/v1.0.2/ClipFlow.Setup.1.0.2.exe'

export const DESKTOP_APP_PROTOCOL = 'clipflow://record'

export const buildDesktopRecordUrl = (clerkUserId?: string | null) => {
  if (!clerkUserId) return DESKTOP_APP_PROTOCOL
  return `${DESKTOP_APP_PROTOCOL}?userId=${encodeURIComponent(clerkUserId)}`
}
