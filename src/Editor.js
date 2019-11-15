import React, { Component } from 'react'
import styled from 'styled-components'
import { Button, HSpace } from 'minimui'
import { union } from 'lodash'

import { Toolbar, MapType, CreatPolygonTool, DeleteTool } from './tools'
import EditingPolygon from './EditingPolygon'
import FinishedPolygon from './FinishedPolygon'

const { maps } = window.google
const { LatLng } = maps

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
    this.handleMapClick = this.handleMapClick.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleCoordinateAdded = this.handleCoordinateAdded.bind(this)
    this.handleUndo = this.handleUndo.bind(this)
    this.handleCancel = this.handleCancel.bind(this)
    this.handleChangeMapType = this.handleChangeMapType.bind(this)
    this.handlePolygonClick = this.handlePolygonClick.bind(this)
    this.handleCreatePolygon = this.handleCreatePolygon.bind(this)
    this.handleDelete = this.handleDelete.bind(this)
    this.handlePolygonClick = this.handlePolygonClick.bind(this)
  }

  componentDidMount () {
    document.addEventListener('keyup', this.handleKeyUp)
    const map = new maps.Map(this.mapRef.current, {
      zoom: 3,
      center: new maps.LatLng(0, 0),
      mapTypeId: this.state.mapType,
      disableDefaultUI: true
    })
    map.addListener('click', this.handleMapClick)
    this.map = map
    this.addFinishedPolygons([
      [
        new LatLng({ lat: 0, lng: 0 }),
        new LatLng({ lat: 10, lng: 0 }),
        new LatLng({ lat: 10, lng: 10 }),
        new LatLng({ lat: 0, lng: 10 })
      ], [
        new LatLng({ lat: 0, lng: 20 }),
        new LatLng({ lat: 10, lng: 20 }),
        new LatLng({ lat: 10, lng: 30 }),
        new LatLng({ lat: 0, lng: 30 })
      ]
    ])
  }

  componentWillUnmount () {
    document.addEventListener('keyup', this.handleKeyUp)
    maps.event.clearInstanceListeners(this.map)
  }

  addFinishedPolygons (paths) {
    const { mapType, finishedPolygons: finishedPolygons0 } = this.state
    const finishedPolygons1 = finishedPolygons0.slice()
    paths.forEach(path => {
      const polygon = new FinishedPolygon(this.map, path, mapType)
      polygon.on('click', this.handlePolygonClick)
      finishedPolygons1.push(polygon)
    })
    this.setState({ finishedPolygons: finishedPolygons1 })
  }

  handleCancel () {
    const { editingPolygon, finishedPolygons } = this.state
    finishedPolygons.forEach(p => {
      p.generateMouseEvents = true
    })
    editingPolygon.remove()
    this.setState({
      mode: 'navigating',
      editingPolygon: null
    })
  }

  handleClose () {
    const { editingPolygon, finishedPolygons } = this.state
    const path = editingPolygon.close().getArray()
    editingPolygon.remove()
    finishedPolygons.forEach(p => {
      p.generateMouseEvents = true
    })
    this.setState({
      mode: 'navigating',
      editingPolygon: null
    })
    this.addFinishedPolygons([path])
  }

  // Undo & trigger a state update on coordinate added
  handleUndo () {
    this.state.editingPolygon.undo()
    this.setState({ editingPolygon: this.state.editingPolygon })
  }

  // Trigger a state update on coordinate added
  handleCoordinateAdded () {
    this.setState({ editingPolygon: this.state.editingPolygon })
  }

  // ESC cancels while editing
  handleKeyUp (e) {
    const { mode } = this.state
    if (mode === 'editing-polygon' && e.keyCode === 27) {
      this.handleCancel()
    }
  }

  handleChangeMapType (e, mapType) {
    const { editingPolygon, finishedPolygons } = this.state
    if (editingPolygon) {
      editingPolygon.mapType = mapType
    }
    finishedPolygons.forEach(polygon => {
      polygon.mapType = mapType
    })
    this.map.setMapTypeId(mapType)
    this.setState({ mapType })
  }

  handlePolygonClick (e, id) {
    const { mode, finishedPolygons, selected: selected0 } = this.state
    if (mode === 'navigating') {
      const selected1 = event.shiftKey ? union(selected0, [id]) : [id]
      finishedPolygons.forEach((polygon, i) => {
        polygon.selected = selected1.indexOf(polygon.id) !== -1
      })
      this.setState({
        selected: selected1
      })
    }
  }

  handleCreatePolygon () {
    const { finishedPolygons, mapType } = this.state
    const editingPolygon = new EditingPolygon(this.map, mapType)
    editingPolygon.on('coordinateAdded', this.handleCoordinateAdded)
    editingPolygon.on('close', this.handleClose)
    finishedPolygons.forEach(p => {
      p.generateMouseEvents = false
    })
    this.setState({
      mode: 'editing-polygon',
      editingPolygon
    })
  }

  handleDelete () {
    const { finishedPolygons: finishedPolygons0 } = this.state
    const finishedPolygons1 = finishedPolygons0.reduce((acc, polygon, i) => {
      if (polygon.selected) {
        polygon.remove()
      } else {
        acc.push(polygon)
      }
      return acc
    }, [])
    this.setState({
      finishedPolygons: finishedPolygons1,
      selected: []
    })
  }

  handleMapClick (e) {
    const { mode, finishedPolygons, selected: selected0 } = this.state
    if (mode === 'navigating') {
      if (selected0.length) {
        finishedPolygons.forEach((polygon, i) => {
          polygon.selected = false
        })
        this.setState({
          selected: []
        })
      }
    }
  }

  render () {
    const { mapType, mode, editingPolygon, selected } = this.state
    return (
      <Main>
        <MapDiv ref={this.mapRef} drawing={mode === 'editing-polygon'} />
        <Toolbar>
          <Controls>
            <MapType
              mapType={mapType} onChangeMapType={this.handleChangeMapType}
            />
            <CreatPolygonTool
              onClick={this.handleCreatePolygon}
              disabled={mode !== 'navigating'}
            />
            <DeleteTool
              onClick={this.handleDelete}
              disabled={selected.length === 0}
            />
          </Controls>
          {mode === 'editing-polygon'
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
