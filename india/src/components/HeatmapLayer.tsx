import { useEffect, useRef } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.heat'
import type { DataPoint } from '../types'

interface HeatmapLayerProps {
  points: DataPoint[]
  radius?: number
  blur?: number
  maxIntensity?: number
}

export function HeatmapLayer({ points, radius = 25, blur = 15, maxIntensity = 1 }: HeatmapLayerProps) {
  const map = useMap()
  const layerRef = useRef<L.Layer | null>(null)

  useEffect(() => {
    if (layerRef.current) {
      map.removeLayer(layerRef.current)
      layerRef.current = null
    }
    if (points.length === 0) return

    const heatLayerFn = (L as unknown as { heatLayer: (latlngs: [number, number, number][], options?: object) => L.Layer }).heatLayer
    const heat = heatLayerFn(
      points.map((p) => [p.lat, p.lon, 0.5] as [number, number, number]),
      {
        radius,
        blur,
        max: maxIntensity,
        minOpacity: 0.3,
        maxZoom: 18,
      }
    )
    heat.addTo(map)
    layerRef.current = heat

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [map, points, radius, blur, maxIntensity])

  return null
}
