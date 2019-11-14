import Polygon from './Polygon'
const { maps } = window.google

export default class EditingPolygon extends Polygon {
  constructor (map, mapType) {
    super(map, [{ lat: 0, lng: 0 }], mapType, 'pointer')
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
    this.listeners = [
      map.addListener('mousemove', this.handleMouseMove),
      map.addListener('click', this.handleClick),
      this.mapPolygon.addListener('mousemove', this.handleMouseMove),
      this.mapPolygon.addListener('click', this.handleClick)
    ]
  }

  handleMouseMove (e) {
    const path = this.mapPolygon.getPaths().getAt(0)
    path.setAt(path.getLength() - 1, e.latLng)
  }

  handleClick (e) {
    const { latLng } = e
    const path = this.mapPolygon.getPaths().getAt(0)
    path.setAt(path.getLength() - 1, latLng)
    path.push(latLng)

    const index = this.mapMarkers.length
    const marker = this.addMarker(latLng, index === 0 ? 'pointer' : 'crosshair')
    this.listeners.push(marker.addListener('click', e => this.handleMarkerClick(e, index)))
    this.emit('coordinateAdded', latLng)
  }

  handleMarkerClick (e, index) {
    if (index === 0 && this.canClose()) {
      this.emit('close')
    }
  }

  canUndo () {
    const path = this.mapPolygon.getPaths().getAt(0)
    return path.getLength() > 1
  }

  undo () {
    const path = this.mapPolygon.getPaths().getAt(0)
    path.setAt(path.length - 2, path.getAt(path.length - 1))
    path.removeAt(path.length - 1)

    const lastMarker = this.mapMarkers[path.length - 1]
    maps.event.clearInstanceListeners(lastMarker)
    lastMarker.setMap(null)
    this.mapMarkers.pop()
  }

  canClose () {
    const path = this.mapPolygon.getPaths().getAt(0)
    return path.getLength() > 3
  }

  close () {
    const path = this.mapPolygon.getPaths().getAt(0)
    path.removeAt(path.getLength() - 1)
    return path
  }
}
