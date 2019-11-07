import React from 'react'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faDrawPolygon } from '@fortawesome/free-solid-svg-icons'

export const Toolbar = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 8px;
  background-color: white;
  border-radius: 4px;
`

const ToolButton = styled.div`
  width: 20px;
  height: 20px;
  font-size: 20px;
  padding: 2px;
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
