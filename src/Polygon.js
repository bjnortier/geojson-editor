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

export default class Polygon extends EventEmitter {
  constructor (map, path, mapType, cursor) {
    super(map, mapType)
    this.map = map
    this.colorScheme = colorSchemes[mapType]
    const mapPolygon = new maps.Polygon({
      paths: [path],
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillOpacity: 0.1,
      cursor,
      ...this.colorScheme
    })
    mapPolygon.setMap(this.map)
    this.mapPolygon = mapPolygon
    this.mapMarkers = []

    this.handleClick = this.handleClick.bind(this)
    this.listeners = [
      mapPolygon.addListener('click', this.handleClick)
    ]
  }

  handleClick (e) {
    this.emit('click')
  }

  addMarker (latLng) {
    const marker = new maps.Marker({
      position: latLng,
      sName: 'coordinate-0',
      map: this.map,
      icon: this.createIcon()
    })
    this.mapMarkers.push(marker)
  }

  remove () {
    this.listeners.forEach(l => maps.event.removeListener(l))
    this.mapPolygon.setMap(null)
    this.mapMarkers.forEach(marker => {
      maps.event.clearInstanceListeners(marker)
      marker.setMap(null)
    })
  }

  setMapType (mapType) {
    this.colorScheme = colorSchemes[mapType]
    this.mapPolygon.setOptions(this.colorScheme)
    this.mapMarkers.forEach(marker => {
      marker.setIcon(this.createIcon())
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
}
