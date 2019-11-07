import React, { Component } from 'react'
import styled from 'styled-components'

import { Toolbar, CreatPolygonTool } from './tools'

const { maps } = window.google

const Main = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const MapDiv = styled.div`
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  .gm-style:first-of-type > div:nth-child(1) {
    cursor: ${({ drawing }) => drawing ? 'crosshair !important' : 'inherit'};
  }
`

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mode: 'navigating',
      currentPolygon: null,
      polygons: []
    }
    this.mapRef = React.createRef()
    this.handleCreatePolygonClick = this.handleCreatePolygonClick.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
  }

  componentDidMount () {
    const map = new maps.Map(this.mapRef.current, {
      zoom: 3,
      center: new maps.LatLng(0, 0),
      mapTypeId: 'satellite',
      disableDefaultUI: true,
      mapTypeControl: true
    })

    map.addListener('mousemove', this.handleMouseMove)
    map.addListener('click', this.handleClick)
    this.map = map
  }

  componentWillUnmount () {
    maps.event.clearInstanceListeners(this.map)
  }

  handleCreatePolygonClick () {
    this.setState({
      mode: 'drawing-polygon'
    })
  }

  handleMouseMove (e) {
    const { mode, currentPolygon } = this.state
    if (mode === 'drawing-polygon') {
      if (!currentPolygon) {
        const currentPolygon = this.createPolygon(e.latLng)
        this.setState({ currentPolygon })
      } else {
        const path = currentPolygon.getPaths().getAt(0)
        path.setAt(path.getLength() - 1, e.latLng)
      }
    }
  }

  handleClick (e) {
    const { mode, currentPolygon } = this.state
    if (mode === 'drawing-polygon' && currentPolygon) {
      const path = currentPolygon.getPaths().getAt(0)
      this.createMarker(path.getLength() - 1, e.latLng)
      path.push(e.latLng)
    }
  }

  handleClose () {
    const { currentPolygon, polygons: polygons0 } = this.state
    const polygons1 = polygons0.slice()
    polygons1.push(currentPolygon)
    this.setState({
      mode: 'navigating',
      currentPolygon: null,
      polygons: polygons1
    })
  }

  createPolygon (latLng) {
    const polygon = new maps.Polygon({
      paths: [[latLng]],
      strokeColor: '#fff',
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: 'yellow',
      fillOpacity: 0.1,
      cursor: 'crosshair'
    })
    polygon.addListener('click', this.handleClick)
    polygon.addListener('mousemove', this.handleMouseMove)
    polygon.setMap(this.map)
    return polygon
  }

  createMarker (index, latLng) {
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
    if (index === 0) {
      marker.addListener('click', this.handleClose)
    }
    marker.addListener('mousemove', this.handleMouseMove)
    return marker
  }

  render () {
    const { mode } = this.state
    console.log('mode:', this.state.mode)
    return (
      <Main>
        <MapDiv ref={this.mapRef} drawing={mode === 'drawing-polygon'} />
        <Toolbar>
          <CreatPolygonTool
            onClick={this.handleCreatePolygonClick}
            disabled={mode !== 'navigating'}
          />
        </Toolbar>
      </Main>
    )
  }
}

Editor.propTypes = {
}

export default Editor
