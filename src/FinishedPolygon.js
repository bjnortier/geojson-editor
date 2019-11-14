import Polygon from './Polygon'

export default class FinishedPolygon extends Polygon {
  constructor (map, path, mapType) {
    super(map, path, mapType, 'pointer')
    for (let i = 0; i < path.length; ++i) {
      const latLng = path[i]
      this.addMarker(latLng)
    }
  }
}
