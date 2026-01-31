import { MapContainer, TileLayer } from 'react-leaflet'
import { HeatmapLayer } from './HeatmapLayer'
import type { DataPoint } from '../types'
import 'leaflet/dist/leaflet.css'

const INDIA_CENTER: [number, number] = [20.5937, 78.9629]
const INDIA_ZOOM = 5

interface MapViewProps {
  points: DataPoint[]
  radius: number
  blur: number
  maxIntensity: number
}

export function MapView({ points, radius, blur, maxIntensity }: MapViewProps) {
  return (
    <div className="map-container">
      <MapContainer
        center={INDIA_CENTER}
        zoom={INDIA_ZOOM}
        className="map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatmapLayer
          points={points}
          radius={radius}
          blur={blur}
          maxIntensity={maxIntensity}
        />
      </MapContainer>
    </div>
  )
}
