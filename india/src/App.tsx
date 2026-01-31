import { useState, useEffect, useCallback } from 'react'
import { useManifest } from './hooks/useManifest'
import { useSectorData } from './hooks/useSectorData'
import { MapView } from './components/MapView'
import { FilterPanel } from './components/FilterPanel'
import type { DataPoint } from './types'
import './App.css'

export default function App() {
  const { sectors, loading: manifestLoading, error: manifestError } = useManifest()
  const { loadSectors, loading: dataLoading, error: dataError } = useSectorData()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [points, setPoints] = useState<DataPoint[]>([])
  const [intensity, setIntensity] = useState(35)

  const loadData = useCallback(() => {
    const files = sectors
      .filter((s) => selected.has(s.id))
      .map((s) => s.file)
    loadSectors(files).then(setPoints)
  }, [sectors, selected, loadSectors])

  useEffect(() => {
    if (selected.size === 0) {
      setPoints([])
      return
    }
    loadData()
  }, [selected, loadData])

  const onToggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const onSelectAll = () => setSelected(new Set(sectors.map((s) => s.id)))
  const onClear = () => setSelected(new Set())

  const radius = Math.round(15 + (intensity / 80) * 35)
  const blur = Math.round(10 + (intensity / 80) * 25)
  const maxIntensity = 0.5 + (intensity / 80) * 1.5

  return (
    <div className="app">
      <header className="header">
        <h1>India – Mapa de calor por sectores</h1>
      </header>
      <div className="main">
        <FilterPanel
          sectors={sectors}
          selected={selected}
          onToggle={onToggle}
          onSelectAll={onSelectAll}
          onClear={onClear}
          intensity={intensity}
          onIntensityChange={setIntensity}
          pointCount={points.length}
          loading={manifestLoading || dataLoading}
          error={manifestError ?? dataError}
        />
        <div className="map-wrapper">
          {manifestError ? (
            <p className="error-banner">{manifestError}</p>
          ) : (
            <MapView
              points={points}
              radius={radius}
              blur={blur}
              maxIntensity={maxIntensity}
            />
          )}
        </div>
      </div>
    </div>
  )
}
