
export const addDayToDateStr = (dateStr: string, days: number = 1): string => {
  if (!dateStr || typeof dateStr !== 'string') return dateStr
  const parts = dateStr.split('/')
  if (parts.length !== 3) return dateStr
  
  const [d, m, y] = parts.map(Number)
  if (isNaN(d) || isNaN(m) || isNaN(y)) return dateStr
  
  const date = new Date(y, m - 1, d)
  date.setDate(date.getDate() + days)
  
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
}
