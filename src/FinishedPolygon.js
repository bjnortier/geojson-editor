import Polygon from './Polygon'

export default class FinishedPolygon extends Polygon {
  constructor (maps, map, path, mapType) {
    super(maps, map, path, mapType, 'pointer')
    this.handleClick = this.handleClick.bind(this)
    this._listeners.push(this._mapPolygon.addListener('click', this.handleClick))
  }

  handleClick (e) {
    this.emit('click', e, this.id)
  }
}
