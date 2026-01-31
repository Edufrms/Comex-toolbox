import type { SectorManifestItem } from '../types'

interface FilterPanelProps {
  sectors: SectorManifestItem[]
  selected: Set<string>
  onToggle: (id: string) => void
  onSelectAll: () => void
  onClear: () => void
  intensity: number
  onIntensityChange: (v: number) => void
  pointCount: number
  loading: boolean
  error: string | null
}

export function FilterPanel({
  sectors,
  selected,
  onToggle,
  onSelectAll,
  onClear,
  intensity,
  onIntensityChange,
  pointCount,
  loading,
  error,
}: FilterPanelProps) {
  const allSelected = sectors.length > 0 && selected.size === sectors.length

  return (
    <div className="panel">
      <h2>Sectores</h2>
      {error && <p className="error">{error}</p>}
      <div className="panel-actions">
        <button type="button" onClick={allSelected ? onClear : onSelectAll}>
          {allSelected ? 'Limpiar' : 'Seleccionar todo'}
        </button>
      </div>
      <div className="checkboxes">
        {sectors.map((s) => (
          <label key={s.id} className="checkbox-label">
            <input
              type="checkbox"
              checked={selected.has(s.id)}
              onChange={() => onToggle(s.id)}
            />
            <span>{s.label}</span>
          </label>
        ))}
      </div>
      <div className="slider-block">
        <label>
          Intensidad: <strong>{intensity}</strong>
        </label>
        <input
          type="range"
          min={5}
          max={80}
          value={intensity}
          onChange={(e) => onIntensityChange(Number(e.target.value))}
        />
      </div>
      <p className="point-count">
        {loading ? 'Cargando…' : `N puntos cargados: ${pointCount}`}
      </p>
    </div>
  )
}
