export function toDate(value: unknown): Date | null {
  if (!value) return null
  // Firestore Timestamp has toDate()
  if (typeof value === 'object' && value !== null) {
    const v = value as any
    if (typeof v.toDate === 'function') {
      try {
        return v.toDate()
      } catch {
        // fallthrough
      }
    }
    if (typeof v.seconds === 'number') {
      return new Date(v.seconds * 1000)
    }
  }
  if (typeof value === 'number') return new Date(value)
  if (typeof value === 'string') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  if (value instanceof Date) return value
  return null
}

export function formatDate(value: unknown, locale: string = 'fr-FR') {
  const d = toDate(value)
  if (!d) return 'N/A'
  return d.toLocaleString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}


