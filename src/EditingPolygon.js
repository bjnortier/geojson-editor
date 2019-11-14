import EventEmitter from 'events'
const { maps } = window.google

const colorSchemes = {
  satellite: {
    strokeColor: '#fff',
    fillColor: '#6c6'
  },
  terrain: {
    strokeColor: '#000',
    fillColor: '#6a6'
  },
  selected: {
    satellite: {
      strokeColor: '#fff',
      fillColor: 'yellow'
    },
    terrain: {
      strokeColor: '#000',
      fillColor: 'yellow'
    }
  }
}

export default class EditingPolygon extends EventEmitter {
  constructor (map, mapType) {
    super()
    this.map = map
    this.colorScheme = colorSchemes[mapType]
    const mapPolygon = new maps.Polygon({
      paths: [new maps.LatLng({ lat: 0, lng: 0 })],
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillOpacity: 0.1,
      cursor: 'crosshair',
      ...this.colorScheme
    })
    mapPolygon.setMap(this.map)
    this.mapPolygon = mapPolygon
    this.mapMarkers = []

    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
    this.listeners = [
      map.addListener('mousemove', this.handleMouseMove),
      map.addListener('click', this.handleClick),
      mapPolygon.addListener('mousemove', this.handleMouseMove),
      mapPolygon.addListener('click', this.handleClick)
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
    const marker = new maps.Marker({
      position: latLng,
      sName: 'coordinate-0',
      map: this.map,
      cursor: index === 0 ? 'pointer' : 'crosshair',
      icon: this.createIcon()
    })
    this.mapMarkers.push(marker)
    this.listeners.push(marker.addListener('click', e => this.handleMarkerClick(e, index)))

    this.emit('coordinateAdded', latLng)
  }

  handleMarkerClick (e, index) {
    if (index === 0 && this.canClose()) {
      this.emit('close')
    }
  }

  remove () {
    this.listeners.forEach(l => maps.event.removeListener(l))
    this.mapPolygon.setMap(null)
    this.mapMarkers.forEach(marker => {
      maps.event.clearInstanceListeners(marker)
      marker.setMap(null)
    })
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

  setMapType (mapType) {
    const colorScheme = colorSchemes[mapType]
    this.mapPolygon.setOptions(colorScheme)
    this.mapMarkers.forEach(marker => {
      marker.setIcon(this.createIcon())
    })
  }
}
