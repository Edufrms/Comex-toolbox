declare module 'leaflet.heat' {
  import type { LatLngTuple, LayerOptions } from 'leaflet'
  interface HeatLayerOptions extends LayerOptions {
    minOpacity?: number
    maxZoom?: number
    max?: number
    radius?: number
    blur?: number
    gradient?: Record<number, string>
  }
  function heatLayer(latlngs: LatLngTuple[] | Array<[number, number, number]>, options?: HeatLayerOptions): import('leaflet').Layer
}
