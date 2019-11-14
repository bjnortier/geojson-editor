import React, { Component } from 'react'
import styled from 'styled-components'
import { Button, HSpace } from 'minimui'
import { union } from 'lodash'

import { Toolbar, MapType, CreatPolygonTool, DeleteTool } from './tools'
import EditingPolygon from './EditingPolygon'
import FinishedPolygon from './FinishedPolygon'

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

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mapType: 'satellite',
      mode: 'navigating',
      finishedPolygons: [],
      editingPolygon: null,
      selected: []
    }
    this.mapRef = React.createRef()
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCoordinateAdded = this.handleCoordinateAdded.bind(this)
    this.handleUndo = this.handleUndo.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChangeMapType = this.handleChangeMapType.bind(this)
    this.handlePolygonClick = this.handlePolygonClick.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
  }

  componentDidMount () {
    document.addEventListener('keyup', this.handleKeyUp)
    const map = new maps.Map(this.mapRef.current, {
      zoom: 3,
      center: new maps.LatLng(0, 0),
      mapTypeId: this.state.mapType,
      disableDefaultUI: true
    })
    map.addListener('click', this.handleClick)
    this.map = map
    this.addPolygon([{ lat: 0, lng: 0 }, { lat: 10, lng: 0 }, { lat: 10, lng: 10 }, { lat: 0, lng: 10 }])
  }

  componentWillUnmount () {
    document.addEventListener('keyup', this.handleKeyUp)
    maps.event.clearInstanceListeners(this.map)
  }

  addPolygon (path) {
    const { mapType, finishedPolygons: finishedPolygons0 } = this.state
    const polygon = new FinishedPolygon(this.map, path, mapType)
    const finishedPolygons1 = finishedPolygons0.slice()
    finishedPolygons1.push(polygon)
    this.setState({ finishedPolygons: finishedPolygons1 })
  }

  handleClick (e) {
    const { mode, polygons, selected: selected0, mapType } = this.state
    if (mode === 'navigating') {
      if (selected0.length) {
        polygons.forEach((polygon, i) => {
          if (selected0.indexOf(i) !== -1) {
            polygon.setMapType(mapType)
          }
        })
        this.setState({
          selected: []
        })
      }
    }
  }

  handleCancel () {
    const { editingPolygon } = this.state
    editingPolygon.remove()
    this.setState({
      mode: 'navigating',
      editingPolygon: null
    })
  }

  handleKeyUp (e) {
    const { mode } = this.state
    // ESC cancels
    if (mode === 'drawing-polygon' && e.keyCode === 27) {
      this.handleCancel()
    }
  }

  handleChangeMapType (e, mapType) {
    const { editingPolygon, finishedPolygons } = this.state
    if (editingPolygon) {
      editingPolygon.setMapType(mapType)
    }
    finishedPolygons.forEach((polygon, i) => {
    //   if (selected.indexOf(i) === -1) {
      polygon.setMapType(mapType)
    //   } else {
    //     polygon.setColorScheme(colorSchemes.selected[mapType])
    //   }
    })
    this.map.setMapTypeId(mapType)
    this.setState({ mapType })
  }

  handleUndo () {
    this.state.editingPolygon.undo()
    this.setState({ editingPolygon: this.state.editingPolygon })
  }

  handleCoordinateAdded () {
    this.setState({ editingPolygon: this.state.editingPolygon })
  }

  handleClose () {
    const { editingPolygon, polygons: polygons0 } = this.state
    const path = editingPolygon.mapPolygon.getPaths().getAt(0)
    path.removeAt(path.getLength() - 1)
    editingPolygon.off('coordinateAdded', this.handleCoordinateAdded)
    editingPolygon.off('close', this.handleClose)
    editingPolygon.remove()

    const polygons1 = polygons0.slice()
    this.setState({
      mode: 'navigating',
      editingPolygon: null,
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
            // polygon.setMapType(colorSchemes.selected[mapType])
          } else {
            polygon.setMapType(mapType)
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
    const { mapType, mode, editingPolygon, selected } = this.state
    return (
      <Main>
        <MapDiv ref={this.mapRef} drawing={mode === 'drawing-polygon'} />
        <Toolbar>
          <Controls>
            <MapType
              mapType={mapType} onChangeMapType={this.handleChangeMapType}
            />
            <CreatPolygonTool
              onClick={() => {
                const editingPolygon = new EditingPolygon(this.map, mapType)
                editingPolygon.on('coordinateAdded', this.handleCoordinateAdded)
                editingPolygon.on('close', this.handleClose)
                this.setState({
                  mode: 'drawing-polygon',
                  editingPolygon
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
                {editingPolygon && editingPolygon.canUndo()
                  ? <Button secondary label='Undo' onClick={this.handleUndo} />
                  : null}
                <Button secondary label='Cancel' onClick={this.handleCancel} />
                {editingPolygon && editingPolygon.canClose()
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
