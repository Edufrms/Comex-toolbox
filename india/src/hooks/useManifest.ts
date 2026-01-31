import { useState, useEffect } from 'react'
import type { SectorManifestItem } from '../types'

export function useManifest(): { sectors: SectorManifestItem[]; loading: boolean; error: string | null } {
  const [sectors, setSectors] = useState<SectorManifestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const base = import.meta.env.BASE_URL || ''
    fetch(`${base}data/manifest.json`)
      .then((res) => {
        if (!res.ok) throw new Error('No se pudo cargar manifest.json')
        return res.json()
      })
      .then((data: SectorManifestItem[]) => {
        setSectors(Array.isArray(data) ? data : [])
        setError(null)
      })
      .catch((err) => {
        setError(err.message || 'Error cargando sectores')
        setSectors([])
      })
      .finally(() => setLoading(false))
  }, [])

  return { sectors, loading, error }
}
