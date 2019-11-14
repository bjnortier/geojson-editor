import React, { Component } from 'react'
import styled from 'styled-components'
import { Button, HSpace } from 'minimui'
import { union } from 'lodash'

import { Toolbar, MapType, CreatPolygonTool, DeleteTool } from './tools'
import Polygon from './Polygon'

const { maps } = window.google

const Main = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const Controls = styled.div`
  display: inline-block;
  padding: 4px;
  > div {
    padding: 4px;
  }
  > div:first-child {
    padding-left: 0;
  }
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

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mapType: 'satellite',
      mode: 'navigating',
      polygons: [],
      selected: [],
      currentPolygon: null
    }
    this.mapRef = React.createRef()
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleMouseMove = this.handleMouseMove.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleMarkerClick = this.handleMarkerClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleUndo = this.handleUndo.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChangeMapType = this.handleChangeMapType.bind(this)
    this.handlePolygonClick = this.handlePolygonClick.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
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
    const { mode, currentPolygon } = this.state
    if (mode === 'drawing-polygon') {
      currentPolygon.updateLast(e.latLng)
    }
  }

  handleClick (e) {
    const { mode, currentPolygon, polygons, selected: selected0, mapType } = this.state
    if (mode === 'drawing-polygon' && currentPolygon) {
      currentPolygon.addCoordinate(e.latLng)
      // Trigger a state change so the "Finish" button will be
      // rendered
      this.setState({ currentPolygon })
    } else if (mode === 'navigating') {
      if (selected0.length) {
        polygons.forEach((polygon, i) => {
          if (selected0.indexOf(i) !== -1) {
            polygon.setColorScheme(colorSchemes[mapType])
          }
        })
        this.setState({
          selected: []
        })
      }
    }
  }

  handleCancel () {
    const { currentPolygon } = this.state
    currentPolygon.off('polygonMouseMove', this.handleMouseMove)
    currentPolygon.off('polygonClick', this.handleClick)
    currentPolygon.off('markerClick', this.handleMarkerClick)
    currentPolygon.remove()

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
    const { currentPolygon } = this.state
    if (index === 0 && currentPolygon.canClose()) {
      this.handleClose()
    }
  }

  handleChangeMapType (e, mapType) {
    const { currentPolygon, polygons, selected } = this.state
    if (currentPolygon) {
      currentPolygon.setColorScheme(colorSchemes[mapType])
    }
    polygons.forEach((polygon, i) => {
      if (selected.indexOf(i) === -1) {
        polygon.setColorScheme(colorSchemes[mapType])
      } else {
        polygon.setColorScheme(colorSchemes.selected[mapType])
      }
    })
    this.map.setMapTypeId(mapType)
    this.setState({ mapType })
  }

  handleUndo () {
    const { currentPolygon } = this.state
    currentPolygon.undo()
  }

  handleClose () {
    const { currentPolygon, polygons: polygons0 } = this.state
    currentPolygon.off('polygonMouseMove', this.handleMouseMove)
    currentPolygon.off('polygonClick', this.handleClick)
    currentPolygon.off('markerClick', this.handleMarkerClick)
    currentPolygon.close()

    currentPolygon.on('polygonClick', this.handlePolygonClick)
    const polygons1 = polygons0.slice()
    polygons1.push(currentPolygon)
    this.setState({
      mode: 'navigating',
      currentPolygon: null,
      polygons: polygons1
    })
  }

  handlePolygonClick (e, p) {
    const { mode, polygons, selected: selected0, mapType } = this.state
    if (mode === 'navigating') {
      let index
      polygons.forEach((polygon, i) => {
        if (polygon === p) {
          index = i
        }
      })
      if (index === undefined) {
        console.error('clicked polygon not found')
      } else {
        const selected1 = event.shiftKey ? union(selected0, [index]) : [index]
        polygons.forEach((polygon, i) => {
          if (selected1.indexOf(i) !== -1) {
            polygon.setColorScheme(colorSchemes.selected[mapType])
          } else {
            polygon.setColorScheme(colorSchemes[mapType])
          }
        })
        this.setState({
          selected: selected1
        })
      }
    }
  }

  handleDelete () {
    const { polygons: polygons0, selected } = this.state
    const polygons1 = polygons0.reduce((acc, polygon, i) => {
      if (selected.indexOf(i) !== -1) {
        polygon.remove()
      } else {
        acc.push(polygon)
      }
      return acc
    }, [])
    this.setState({
      polygons: polygons1,
      selected: []
    })
  }

  render () {
    const { mapType, mode, currentPolygon, selected } = this.state
    return (
      <Main onKeyUp={this.handleKeyUp}>
        <MapDiv ref={this.mapRef} drawing={mode === 'drawing-polygon'} />
        <Toolbar>
          <Controls>
            <MapType
              mapType={mapType} onChangeMapType={this.handleChangeMapType}
            />
            <CreatPolygonTool
              onClick={() => {
                const currentPolygon = new Polygon(this.map, [new maps.LatLng({ lat: 0, lng: 0 })], colorSchemes[mapType])
                currentPolygon.on('polygonMouseMove', this.handleMouseMove)
                currentPolygon.on('polygonClick', this.handleClick)
                currentPolygon.on('markerClick', this.handleMarkerClick)
                this.setState({
                  mode: 'drawing-polygon',
                  currentPolygon
                })
              }}
              disabled={mode !== 'navigating'}
            />
            <DeleteTool
              onClick={this.handleDelete}
              disabled={selected.length === 0}
            />
          </Controls>
          {mode === 'drawing-polygon'
            ? (
              <>
                <HSpace />
                {currentPolygon && currentPolygon.canUndo()
                  ? <Button secondary label='Undo' onClick={this.handleUndo} />
                  : null}
                <Button secondary label='Cancel' onClick={this.handleCancel} />
                {currentPolygon && currentPolygon.canClose()
                  ? <Button secondary label='Finish' onClick={this.handleClose} />
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
