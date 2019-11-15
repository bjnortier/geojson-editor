import React, { Component } from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'
import { Reset, Button } from 'minimui'

import Editor from '../../src/'
import krugerJSON from './kruger.json'

const Main = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const mapsKey = GOOGLE_MAPS_API_KEY // eslint-disable-line

class Test extends Component {
  constructor (props) {
    super(props)
    this.state = {
      geoJSON: null,
      iteration: Test.iteration++
    }
  }

  render () {
    const { geoJSON, iteration } = this.state
    return (
      <>
        <div>
          <Button
            label='Clear'
            secondary
            onClick={() => this.setState({
              geoJSON: null, iteration: Test.iteration++
            })}
          />
          <Button
            label='Kruger'
            secondary
            onClick={() => this.setState({
              geoJSON: krugerJSON, iteration: Test.iteration++
            })}
          />
        </div>
        <Editor
          key={iteration}
          geoJSON={geoJSON}
          googleMapsAPIKey={mapsKey}
          toolbarExtension={<Button secondary label='Foo' onClick={() => {}} />}
          onGeoJSONChanged={geoJSON => {
            console.log('>>', geoJSON)
            this.setState({ geoJSON })
          }}
        />
      </>
    )
  }
}

Test.iteration = 0

render(
  <Main>
    <Reset />
    <Test />
  </Main>,
  document.getElementById('root'))
