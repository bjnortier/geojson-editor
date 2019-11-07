import EventEmitter from 'events'

const { maps } = window.google

export default class Polygon extends EventEmitter {
  constructor (map, latLng, colorScheme) {
    super()
    this.map = map
    this.colorScheme = colorScheme
    const polygon = new maps.Polygon({
      paths: [[latLng]],
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillOpacity: 0.1,
      cursor: 'crosshair',
      ...this.colorScheme
    })

    polygon.addListener('click', e => this.emit('polygonClick', e))
    polygon.addListener('mousemove', e => this.emit('polygonMouseMove', e))
    polygon.setMap(this.map)
    this.mapPolygon = polygon
    this.mapMarkers = []
  }

  remove () {
    maps.event.clearInstanceListeners(this.mapPolygon)
    this.mapPolygon.setMap(null)
    this.mapMarkers.forEach(marker => {
      maps.event.clearInstanceListeners(marker)
      marker.setMap(null)
    })
  }

  updateLast (latLng) {
    const path = this.mapPolygon.getPaths().getAt(0)
    path.setAt(path.getLength() - 1, latLng)
  }

  addCoordinate (latLng) {
    const path = this.mapPolygon.getPaths().getAt(0)
    path.setAt(path.getLength() - 1, latLng)
    path.push(latLng)

    const index = this.mapMarkers.length
    const marker = new maps.Marker({
      position: latLng,
      sName: 'coordinate-0',
      map: this.map,
      cursor: index === 0 ? 'pointer' : 'crosshair',
      icon: this.createIcon()
    })
    this.mapMarkers.push(marker)
    marker.addListener('click', e => this.emit('markerClick', e, index))
    marker.addListener('mousemove', e => this.emit('markerMouseMove', e, index))
  }

  createIcon () {
    return {
      path: maps.SymbolPath.CIRCLE,
      scale: 3,
      fillOpacity: 1,
      strokeWeight: 1,
      ...this.colorScheme
    }
  }

  canClose () {
    const path = this.mapPolygon.getPaths().getAt(0)
    return path.getLength() > 3
  }

  close () {
    const path = this.mapPolygon.getPaths().getAt(0)
    path.removeAt(path.getLength() - 1)
    this.mapPolygon.cursor = 'pointer'
  }

  setColorScheme (colorScheme) {
    this.colorScheme = colorScheme
    this.mapPolygon.setOptions(colorScheme)
    this.mapMarkers.forEach(marker => {
      marker.setIcon(this.createIcon())
    })
  }
}
