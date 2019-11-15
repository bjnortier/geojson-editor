import React from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'
import { Reset, Button } from 'minimui'

import Editor from '../../src/'

const Main = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const mapsKey = GOOGLE_MAPS_API_KEY // eslint-disable-line

render(
  <Main>
    <Reset />
    <Editor
      googleMapsAPIKey={mapsKey}
      toolbarExtension={<Button secondary label='Foo' onClick={() => {}} />}
    />
  </Main>,
  document.getElementById('root'))
