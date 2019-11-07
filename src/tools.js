import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons'
import { Select } from 'minimui'

export const Toolbar = styled.div`
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
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
  width: 30px;
  height: 30px;
  font-size: 30px;
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

export const MapType = ({ mapType, onChangeMapType }) => (
  <Select value={mapType} onChange={onChangeMapType}>
    <option value='satellite'>Satellite</option>
    <option value='terrain'>Terrain</option>
  </Select>
)

MapType.propTypes = {
  mapType: PropTypes.string.isRequired,
  onChangeMapType: PropTypes.func.isRequired
}
