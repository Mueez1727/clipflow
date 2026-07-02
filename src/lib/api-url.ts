const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const resolveApiBaseUrl = () => {
  const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL
  if (configuredApiUrl) {
    return trimTrailingSlash(configuredApiUrl)
  }

  if (typeof window !== 'undefined') {
    return `${trimTrailingSlash(window.location.origin)}/api`
  }

  const configuredHostUrl = process.env.NEXT_PUBLIC_HOST_URL
  if (configuredHostUrl) {
    return `${trimTrailingSlash(configuredHostUrl)}/api`
  }

  return '/api'
}

export const buildApiUrl = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${resolveApiBaseUrl()}${normalizedPath}`
}
