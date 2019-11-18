import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDrawPolygon, faTimes, faUndoAlt, faCheck } from '@fortawesome/free-solid-svg-icons'
import { faTrashAlt } from '@fortawesome/free-regular-svg-icons'

import hybrid from './images/hybrid'
import terrain from './images/terrain'

const ToolButton = styled.div`
  display: inline-block;
  font-size: 16px;
  padding: 3px;
  cursor: ${({ disabled }) => disabled ? 'inherit' : 'pointer'};
  color: ${({ disabled, color }) => disabled ? 'grey' : color || 'black'};
`

const Tool = ({ onClick, disabled, icon, color }) => (
  <ToolButton
    onClick={() => {
      if (!disabled) {
        onClick()
      }
    }}
    disabled={disabled}
    color={color}
  >
    <FontAwesomeIcon icon={icon} />
  </ToolButton>
)

Tool.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  icon: PropTypes.object.isRequired,
  color: PropTypes.string
}

export const CreatPolygonTool = ({ onClick, disabled }) => (
  <Tool onClick={onClick} disabled={disabled} icon={faDrawPolygon} />
)

CreatPolygonTool.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
}

CreatPolygonTool.defaultProps = {
  disabled: false
}

export const DeleteTool = ({ onClick, disabled }) => (
  <Tool onClick={onClick} disabled={disabled} icon={faTrashAlt} color='#da1616' />
)

DeleteTool.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
}

DeleteTool.defaultProps = {
  disabled: true
}

export const AbortTool = ({ onClick, disabled }) => (
  <Tool onClick={onClick} disabled={disabled} icon={faTimes} color='#da1616' />
)

AbortTool.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
}

AbortTool.defaultProps = {
  disabled: true
}

export const FinishTool = ({ onClick, disabled }) => (
  <Tool onClick={onClick} disabled={disabled} icon={faCheck} color='#187b18' />
)

FinishTool.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
}

FinishTool.defaultProps = {
  disabled: true
}

export const UndoTool = ({ onClick, disabled }) => (
  <Tool onClick={onClick} disabled={disabled} icon={faUndoAlt} />
)

UndoTool.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired
}

UndoTool.defaultProps = {
  disabled: true
}

const MapTypeButton = styled.div`
  width: 80px;
  height: 80px;
  position: absolute;
  top: 64px;
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
        onChangeMapType(mapType === 'terrain' ? 'hybrid' : 'terrain')
      }}
    >
      <img src={mapType === 'terrain' ? hybrid : terrain} />
    </MapTypeButton>
  )
}

MapType.propTypes = {
  onChangeMapType: PropTypes.func.isRequired,
  mapType: PropTypes.string.isRequired
}

export const Toolbar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background-color: white;
  height: 36px;
  > div {
    margin-left: 4px;
  }
  > div:first-child {
    margin-left: 0;
  }
  display: flex;
`

export const Spacer = styled.div`
  flex-grow: 1;
`
