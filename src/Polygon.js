import EventEmitter from 'events'

const { maps } = window.google

export default class Polygon extends EventEmitter {
  constructor (map, latLng) {
    super()
    this.map = map
    const polygon = new maps.Polygon({
      paths: [[latLng]],
      strokeColor: '#fff',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: 'yellow',
      fillOpacity: 0.1,
      cursor: 'crosshair'
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
      icon: {
        path: maps.SymbolPath.CIRCLE,
        scale: 3,
        fillColor: 'green',
        fillOpacity: 1,
        strokeColor: '#fff',
        strokeWeight: 1
      }
    })
    this.mapMarkers.push(marker)
    marker.addListener('click', e => this.emit('markerClick', e, index))
    marker.addListener('mousemove', e => this.emit('markerMouseMove', e, index))
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
}
