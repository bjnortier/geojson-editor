import Polygon from './Polygon'

export default class FinishedPolygon extends Polygon {
  constructor (map, path, mapType) {
    super(map, path, mapType, 'pointer')
    for (let i = 0; i < path.length; ++i) {
      const latLng = path[i]
      this.addMarker(latLng)
    }

    this.handleClick = this.handleClick.bind(this)
    this.listeners.push(this.mapPolygon.addListener('click', this.handleClick))
  }

  handleClick (e) {
    this.emit('click', e)
  }
}
