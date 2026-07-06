const STREAM_BASE = process.env.NEXT_PUBLIC_CLOUD_FRONT_STREAM_URL ?? ''

export async function fetchVideoFileSize(source: string): Promise<number> {
  if (!source || !STREAM_BASE) return 0
  try {
    const res = await fetch(`${STREAM_BASE}/${source}`, {
      method: 'HEAD',
      next: { revalidate: 3600 },
    })
    const length = res.headers.get('content-length')
    return length ? Number.parseInt(length, 10) : 0
  } catch {
    return 0
  }
}

export async function computeTotalStorageBytes(sources: string[]): Promise<number> {
  if (sources.length === 0) return 0
  const batchSize = 12
  let total = 0
  for (let i = 0; i < sources.length; i += batchSize) {
    const batch = sources.slice(i, i + batchSize)
    const sizes = await Promise.all(batch.map(fetchVideoFileSize))
    total += sizes.reduce((sum, n) => sum + n, 0)
  }
  return total
}
