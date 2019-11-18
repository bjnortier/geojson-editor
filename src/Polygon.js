import EventEmitter from 'events'
const { maps } = window.google

const colorSchemes = {
  unselected: {
    hybrid: {
      strokeColor: '#58c0ff',
      fillColor: '#58c0ff',
      markerFillColor: 'white'
    },
    terrain: {
      strokeColor: '#2468bf',
      fillColor: '#2468bf',
      markerFillColor: 'black'
    }
  },
  selected: {
    hybrid: {
      strokeColor: '#ffb62c',
      fillColor: '#ffb62c'
    },
    terrain: {
      strokeColor: '#ffa805',
      fillColor: '#ffa805'
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
      strokeOpacity: 1.0,
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
      ...this._colorScheme,
      fillColor: this._colorScheme.markerFillColor
    }
  }
}

Polygon.nextId = 0
