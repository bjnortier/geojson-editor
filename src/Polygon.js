import EventEmitter from 'events'
const { maps } = window.google

const colorSchemes = {
  unselected: {
    satellite: {
      strokeColor: '#fff',
      fillColor: '#6c6'
    },
    terrain: {
      strokeColor: '#000',
      fillColor: '#6a6'
    }
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
    super()
    this._id = Polygon.nextId++
    this._map = map
    this._mapType = mapType
    this._colorScheme = colorSchemes.unselected[mapType]
    const mapPolygon = new maps.Polygon({
      paths: [path],
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillOpacity: 0.1,
      cursor,
      ...this._colorScheme
    })
    mapPolygon.setMap(map)
    this._mapPolygon = mapPolygon
    this._mapMarkers = []
    this._listeners = []
    this._selected = false
  }

  get id () {
    return this._id
  }

  addMarker (latLng, cursor) {
    const marker = new maps.Marker({
      position: latLng,
      sName: 'coordinate-0',
      map: this._map,
      icon: this.createIcon()
    })
    this._mapMarkers.push(marker)
    return marker
  }

  remove () {
    this._listeners.forEach(l => maps.event.removeListener(l))
    this._mapPolygon.setMap(null)
    this._mapMarkers.forEach(marker => {
      maps.event.clearInstanceListeners(marker)
      marker.setMap(null)
    })
    this.removeAllListeners()
  }

  set mapType (mapType) {
    this._mapType = mapType
    this.updateAppearance()
  }

  set selected (selected) {
    this._selected = selected
    this.updateAppearance()
  }

  get selected () {
    return this._selected
  }

  set generateMouseEvents (generate) {
    this._mapPolygon.setOptions({ clickable: generate })
  }

  get path () {
    return this._mapPolygon.getPaths().getAt(0)
  }

  updateAppearance () {
    this._colorScheme = this._selected
      ? colorSchemes.selected[this._mapType]
      : colorSchemes.unselected[this._mapType]
    this._mapPolygon.setOptions(this._colorScheme)
    this._mapMarkers.forEach(marker => {
      marker.setIcon(this.createIcon())
    })
  }

  createIcon () {
    return {
      path: maps.SymbolPath.CIRCLE,
      scale: 3,
      fillOpacity: 1,
      strokeWeight: 1,
      ...this._colorScheme
    }
  }
}

Polygon.nextId = 0
