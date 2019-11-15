import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDrawPolygon, faTrashAlt } from '@fortawesome/free-solid-svg-icons'

import satellite from './satellite'
import terrain from './terrain'

export const Toolbar = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
  height: 40px;
  > div > div {
    padding-bottom: 0;
  }
  > div {
    margin-left: 4px;
  }
  > div:first-child {
    margin-left: 0;
  }
`

const ToolButton = styled.div`
  display: inline-block;
  font-size: 20px;
  padding: 3px;
  cursor: ${({ disabled }) => disabled ? 'inherit' : 'pointer'};
  color: ${({ disabled }) => disabled ? 'grey' : 'black'};
`

const Tool = ({ onClick, disabled, children }) => (
  <ToolButton
    onClick={() => {
      if (!disabled) {
        onClick()
      }
    }}
    disabled={disabled}
  >
    {children}
  </ToolButton>
)

Tool.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired
}

export const CreatPolygonTool = ({ onClick, disabled }) => (
  <Tool onClick={onClick} disabled={disabled}>
    <FontAwesomeIcon icon={faDrawPolygon} />
  </Tool>
)

CreatPolygonTool.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
}

CreatPolygonTool.defaultProps = {
  disabled: false
}

export const DeleteTool = ({ onClick, disabled }) => (
  <Tool onClick={onClick} disabled={disabled}>
    <FontAwesomeIcon icon={faTrashAlt} />
  </Tool>
)

DeleteTool.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
}

DeleteTool.defaultProps = {
  disabled: true
}

const MapTypeButton = styled.div`
  width: 80px;
  height: 80px;
  position: absolute;
  top: 72px;
  left: 8px;
  padding: 2px;
  background-color: white;
  > img {
    width: 80px;
    height: 80px;
  }
  cursor: pointer;
`

export const MapType = ({ onChangeMapType, mapType }) => {
  return (
    <MapTypeButton
      onClick={() => {
        onChangeMapType(mapType === 'terrain' ? 'satellite' : 'terrain')
      }}
    >
      <img src={mapType === 'terrain' ? terrain : satellite} />
    </MapTypeButton>
  )
}

MapType.propTypes = {
  onChangeMapType: PropTypes.func.isRequired,
  mapType: PropTypes.string.isRequired
}
