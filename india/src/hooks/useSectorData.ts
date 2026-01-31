import { useState, useCallback } from 'react'
import Papa from 'papaparse'
import type { DataPoint } from '../types'

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

function parseCSV(csvText: string): DataPoint[] {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  })
  const points: DataPoint[] = []
  const seen = new Set<string>()

  for (const row of parsed.data) {
    const latStr = (row.latitude ?? row.lat ?? '').trim()
    const lonStr = (row.longitude ?? row.lon ?? '').trim()
    const lat = parseFloat(latStr)
    const lon = parseFloat(lonStr)
    if (Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      const key = `${lat},${lon}`
      if (!seen.has(key)) {
        seen.add(key)
        points.push({ lat, lon })
      }
    }
  }
  return points
}

const cache = new Map<string, DataPoint[]>()

export function useSectorData() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadSectors = useCallback(async (fileNames: string[]): Promise<DataPoint[]> => {
    if (fileNames.length === 0) return []
    setLoading(true)
    setError(null)
    try {
      const allPoints: DataPoint[] = []
      const seen = new Set<string>()

      for (const file of fileNames) {
        const url = `${BASE}/data/${file}`
        let points = cache.get(url)
        if (points === undefined) {
          const res = await fetch(url)
          if (!res.ok) throw new Error(`No se pudo cargar ${file}`)
          const text = await res.text()
          points = parseCSV(text)
          cache.set(url, points)
        }
        for (const p of points) {
          const key = `${p.lat},${p.lon}`
          if (!seen.has(key)) {
            seen.add(key)
            allPoints.push(p)
          }
        }
      }
      return allPoints
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error cargando datos')
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  return { loadSectors, loading, error }
}
