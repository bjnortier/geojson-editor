import React, { Component } from 'react'
import styled from 'styled-components'
import { Button, HSpace } from 'minimui'

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

const Instructions = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  padding: 4px;
  display: flex;
  pointer-events: none;
  > .spacer {
    flex-grow: 1;
  }
  .buttons {
    pointer-events: auto;
  }
`

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mode: 'navigating',
      currentArea: null,
      areas: []
    }
    this.mapRef = React.createRef()
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
  }

  componentDidMount () {
    const map = new maps.Map(this.mapRef.current, {
      zoom: 3,
      center: new maps.LatLng(0, 0),
      mapTypeId: 'satellite',
      disableDefaultUI: true,
      mapTypeControl: false
    })

    map.addListener('mousemove', this.handleMouseMove)
    map.addListener('click', this.handleClick)
    this.map = map
  }

  componentWillUnmount () {
    maps.event.clearInstanceListeners(this.map)
  }

  handleMouseMove (e) {
    const { mode, currentArea } = this.state
    if (mode === 'drawing-area') {
      if (!currentArea) {
        const polygon = this.createPolygon(e.latLng)
        this.setState({ currentArea: { polygon, markers: [] } })
      } else {
        const path = currentArea.polygon.getPaths().getAt(0)
        path.setAt(path.getLength() - 1, e.latLng)
      }
    }
  }

  handleClick (e) {
    const { mode, currentArea: currentArea0 } = this.state
    if (mode === 'drawing-area' && currentArea0) {
      const path = currentArea0.polygon.getPaths().getAt(0)
      path.push(e.latLng)
      const marker = this.createMarker(path.getLength() - 2, e.latLng)
      const markers1 = currentArea0.markers.slice()
      markers1.push(marker)
      const currentArea1 = { polygon: currentArea0.polygon, markers: markers1 }
      this.setState({ currentArea: currentArea1 })
    }
  }

  handleCancel () {
    const { currentArea } = this.state
    maps.event.clearInstanceListeners(currentArea.polygon)
    currentArea.polygon.setMap(null)
    currentArea.markers.forEach(m => {
      maps.event.clearInstanceListeners(m)
      m.setMap(null)
    })
    this.setState({
      mode: 'navigating',
      currentArea: null
    })
  }

  handleKeyUp (e) {
    const { mode } = this.state
    // ESC cancels
    if (mode === 'drawing-area' && e.keyCode === 27) {
      this.handleCancel()
    }
  }

  handleClose () {
    const { currentArea, areas: areas0 } = this.state
    const path = currentArea.polygon.getPaths().getAt(0)
    if (path.getLength() > 3) {
      path.removeAt(path.getLength() - 1)
      currentArea.polygon.cursor = null
      const areas1 = areas0.slice()
      areas1.push(currentArea)
      this.setState({
        mode: 'navigating',
        currentArea: null,
        areas: areas1
      })
    }
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
    const { mode, currentArea } = this.state
    return (
      <Main onKeyUp={this.handleKeyUp}>
        <MapDiv ref={this.mapRef} drawing={mode === 'drawing-area'} />
        <Toolbar>
          <CreatPolygonTool
            onClick={() => this.setState({
              mode: 'drawing-area'
            })}
            disabled={mode !== 'navigating'}
          />
        </Toolbar>
        {mode === 'drawing-area'
          ? (
            <Instructions>
              <div className='spacer' />
              <div className='buttons'>
                <Button secondary label='Cancel' onClick={this.handleCancel} />
                {currentArea &&
                currentArea.polygon.getPaths().getAt(0).getLength() > 3
                  ? <><HSpace /><Button secondary label='Close' onClick={this.handleClose} /></>
                  : null}
              </div>
              <div className='spacer' />
            </Instructions>
          )
          : null}
      </Main>
    )
  }
}

Editor.propTypes = {
}

export default Editor
