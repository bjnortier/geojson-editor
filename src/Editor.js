import React, { Component } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { union } from 'lodash'
import geojsonExtent from '@mapbox/geojson-extent'
import { Button, HSpace } from 'minimui'

import {
  Toolbar, MapType, CreatPolygonTool, DeleteTool,
  AbortTool, UndoTool, FinishTool, Spacer
} from './tools'
import EditingPolygon from './EditingPolygon'
import FinishedPolygon from './FinishedPolygon'

const { maps } = window.google
const { LatLng } = maps

const Main = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`

const ToolButtons = styled.div`
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
  position: absolute;
  top: 52px;
  bottom: 0;
  left: 0;
  right: 0;
  .gm-style:first-of-type > div:nth-child(1) {
    cursor: ${({ drawing }) => drawing ? 'crosshair !important' : 'inherit'};
  }
`

const Error = styled.div`
  position: absolute;
  top: 64px;
  left: 0;
  right: 0;
  display: flex;
  > div {
    display: inline-block;
  }
  > div:first-child, > div:last-child {
    flex-grow: 1;
  }
  > div:nth-child(2) {
    background-color: white;
    color: red;
    padding: 8px;
    border-radius: 4px;
    > div {
      padding-bottom: 0;
    }
  }
`

class Editor extends Component {
  constructor (props) {
    super(props)
    this.state = {
      mapType: 'hybrid',
      mode: 'navigating',
      finishedPolygons: [],
      editingPolygon: null,
      selected: [],
      error: null
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

    const { geoJSON } = this.props
    if (geoJSON) {
      try {
        const paths = []
        if (geoJSON.features && geoJSON.features.length) {
          geoJSON.features.forEach(f => {
            if (f.geometry.type === 'Polygon') {
              const path = f.geometry.coordinates[0].map(([lng, lat]) => new LatLng(lat, lng))
              paths.push(path)
            }
          })
          const finishedPolygons = this.createFinishedPolygons(paths)
          this.setState({ finishedPolygons })
          const extents = geojsonExtent(this.props.geoJSON)
          const bounds = new maps.LatLngBounds(
            { lng: extents[0], lat: extents[1] },
            { lng: extents[2], lat: extents[3] }
          )
          map.fitBounds(bounds, {
            top: 21,
            bottom: 21,
            left: 21,
            right: 21
          })
        }
      } catch (e) {
        console.error(e.message)
        this.setState({ error: 'Could not parse GeoJSON :/' })
      }
    }
  }

  componentWillUnmount () {
    document.addEventListener('keyup', this.handleKeyUp)
    maps.event.clearInstanceListeners(this.map)
  }

  createFinishedPolygons (paths) {
    const { mapType, finishedPolygons: finishedPolygons0 } = this.state
    const finishedPolygons1 = finishedPolygons0.slice()
    paths.forEach(path => {
      const polygon = new FinishedPolygon(this.map, path, mapType)
      polygon.on('click', this.handlePolygonClick)
      finishedPolygons1.push(polygon)
    })
    return finishedPolygons1
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
    const { editingPolygon, finishedPolygons: finishedPolygons0 } = this.state
    const path = editingPolygon.close().getArray()
    editingPolygon.remove()
    finishedPolygons0.forEach(p => {
      p.generateMouseEvents = true
    })
    this.setState({
      mode: 'navigating',
      editingPolygon: null
    })
    let finishedPolygons1 = finishedPolygons0.slice()
    finishedPolygons1 = finishedPolygons1.concat(this.createFinishedPolygons([path]))
    this.setState({
      finishedPolygons: finishedPolygons1
    }, this.emitGeoJSON)
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

  handleChangeMapType (mapType) {
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
    }, this.emitGeoJSON)
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

  emitGeoJSON () {
    const { onGeoJSONChanged } = this.props
    const { finishedPolygons } = this.state
    const features = finishedPolygons.map(p => ({
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'Polygon',
        coordinates: [p.path.getArray().map(x => [x.lng(), x.lat()])]
      }
    }))
    const geoJSON = {
      type: 'FeatureCollection',
      features
    }
    onGeoJSONChanged(geoJSON)
  }

  render () {
    const { toolbarExtension } = this.props
    const { mapType, mode, editingPolygon, selected, error } = this.state
    return (
      <Main>
        <MapDiv ref={this.mapRef} drawing={mode === 'editing-polygon'} />
        <Toolbar>
          <ToolButtons>
            <DeleteTool
              onClick={this.handleDelete}
              disabled={selected.length === 0}
            />
            <CreatPolygonTool
              onClick={this.handleCreatePolygon}
              disabled={mode !== 'navigating'}
            />
            {mode === 'editing-polygon'
              ? (
                <>
                  <HSpace />
                  <UndoTool
                    onClick={this.handleUndo}
                    disabled={!editingPolygon || !editingPolygon.canUndo()}
                  />
                  <AbortTool
                    onClick={this.handleCancel}
                    disabled={!editingPolygon}
                  />
                  <FinishTool
                    onClick={this.handleClose}
                    disabled={!editingPolygon || !editingPolygon.canUndo()}
                  />
                </>
              )
              : null}
          </ToolButtons>
          <Spacer />
          {toolbarExtension}
        </Toolbar>
        <MapType mapType={mapType} onChangeMapType={this.handleChangeMapType} />
        {error
          ? (
            <Error>
              <div />
              <div>
                {error}
                <HSpace />
                <Button secondary label='Dismiss' onClick={() => this.setState({ error: null })} />
              </div>
              <div />
            </Error>
          )
          : null}
      </Main>
    )
  }
}

Editor.propTypes = {
  toolbarExtension: PropTypes.oneOfType([PropTypes.array, PropTypes.object]),
  onGeoJSONChanged: PropTypes.func.isRequired,
  geoJSON: PropTypes.object
}

export default Editor
