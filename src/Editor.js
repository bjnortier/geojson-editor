import React, { Component } from 'react'
import styled from 'styled-components'
import { Button, HSpace } from 'minimui'

import { Toolbar, MapType, CreatPolygonTool } from './tools'
import Polygon from './Polygon'

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

const colorSchemes = {
  satellite: {
    strokeColor: '#fff',
    fillColor: '#6c6'
  },
  terrain: {
    strokeColor: '#000',
    fillColor: '#6a6'
  }
}

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mapType: 'satellite',
      mode: 'navigating',
      polygons: [],
      currentPolygon: null
    }
    this.mapRef = React.createRef()
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChangeMapType = this.handleChangeMapType.bind(this)
  }

  componentDidMount () {
    const map = new maps.Map(this.mapRef.current, {
      zoom: 3,
      center: new maps.LatLng(0, 0),
      mapTypeId: this.state.mapType,
      disableDefaultUI: true
    })

    map.addListener('mousemove', this.handleMouseMove)
    map.addListener('click', this.handleClick)
    this.map = map
  }

  componentWillUnmount () {
    maps.event.clearInstanceListeners(this.map)
  }

  handleMouseMove (e) {
    const { mapType, mode, currentPolygon } = this.state
    if (mode === 'drawing-polygon') {
      if (!currentPolygon) {
        const currentPolygon = new Polygon(this.map, e.latLng, colorSchemes[mapType])
        currentPolygon.on('polygonMouseMove', this.handleMouseMove)
        currentPolygon.on('polygonClick', this.handleClick)
        currentPolygon.on('markerClick', this.handleMarkerClick)
        this.setState({ currentPolygon })
      } else {
        currentPolygon.updateLast(e.latLng)
      }
    }
  }

  handleClick (e) {
    const { mode, currentPolygon } = this.state
    if (mode === 'drawing-polygon' && currentPolygon) {
      currentPolygon.addCoordinate(e.latLng)
      // Trigger a state change so the "Finish" button will be
      // rendered
      this.setState({ currentPolygon })
    }
  }

  handleCancel () {
    const { currentPolygon } = this.state
    if (currentPolygon) {
      currentPolygon.off('polygonMouseMove', this.handleMouseMove)
      currentPolygon.off('polygonClick', this.handleClick)
      currentPolygon.off('markerClick', this.handleMarkerClick)
      currentPolygon.remove()
    }

    this.setState({
      mode: 'navigating',
      currentPolygon: null
    })
  }

  handleKeyUp (e) {
    const { mode } = this.state
    // ESC cancels
    if (mode === 'drawing-polygon' && e.keyCode === 27) {
      this.handleCancel()
    }
  }

  handleMarkerClick (e, index) {
    if (index === 0) {
      this.handleClose()
    }
  }

  handleChangeMapType (e, mapType) {
    const { currentPolygon, polygons } = this.state
    if (currentPolygon) {
      currentPolygon.setColorScheme(colorSchemes[mapType])
    }
    polygons.forEach(polygon => polygon.setColorScheme(colorSchemes[mapType]))
    this.map.setMapTypeId(mapType)
    this.setState({ mapType })
  }

  handleClose () {
    const { currentPolygon, polygons: polygons0 } = this.state
    if (currentPolygon.canClose()) {
      currentPolygon.off('polygonMouseMove', this.handleMouseMove)
      currentPolygon.off('polygonClick', this.handleClick)
      currentPolygon.off('markerClick', this.handleMarkerClick)
      currentPolygon.close()
      const polygons1 = polygons0.slice()
      polygons1.push(currentPolygon)
      this.setState({
        mode: 'navigating',
        currentPolygon: null,
        polygons: polygons1
      })
    }
  }

  render () {
    const { mapType, mode, currentPolygon } = this.state
    return (
      <Main onKeyUp={this.handleKeyUp}>
        <MapDiv ref={this.mapRef} drawing={mode === 'drawing-polygon'} />
        <Toolbar>
          <MapType
            mapType={mapType} onChangeMapType={this.handleChangeMapType}
          />
          <CreatPolygonTool
            onClick={() => this.setState({
              mode: 'drawing-polygon'
            })}
            disabled={mode !== 'navigating'}
          />
          {mode === 'drawing-polygon'
            ? (
              <>
                <Button secondary label='Cancel' onClick={this.handleCancel} />
                {currentPolygon && currentPolygon.canClose()
                  ? <><HSpace /><Button secondary label='Finish' onClick={this.handleClose} /></>
                  : null}
              </>
            )
            : null}
        </Toolbar>

      </Main>
    )
  }
}

Editor.propTypes = {
}

export default Editor
