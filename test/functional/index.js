import React, { Component } from 'react'
import { render } from 'react-dom'
import styled from 'styled-components'
import { Reset, Button, HSpace } from 'minimui'

import Editor from '../../src/'
import krugerJSON from './kruger.json'

const Main = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const Buttons = styled.div`
  padding: 4px 8px;
`

const Extension = styled.div`
  > div {
    padding: 0;
  }
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
        <Buttons>
          <Button
            label='Clear'
            secondary
            onClick={() => this.setState({
              geoJSON: null, iteration: Test.iteration++
            })}
          />
          <HSpace />
          <Button
            label='Kruger'
            secondary
            onClick={() => this.setState({
              geoJSON: krugerJSON, iteration: Test.iteration++
            })}
          />
          <HSpace />
          <Button
            label='Empty'
            secondary
            onClick={() => this.setState({
              geoJSON: {}, iteration: Test.iteration++
            })}
          />
          <HSpace />
          <Button
            label='0 Features'
            secondary
            onClick={() => this.setState({
              geoJSON: { features: [] }, iteration: Test.iteration++
            })}
          />
          <HSpace />
          <Button
            label='Error'
            secondary
            onClick={() => this.setState({
              geoJSON: { features: [null] }, iteration: Test.iteration++
            })}
          />
        </Buttons>
        <Editor
          key={iteration}
          geoJSON={geoJSON}
          googleMapsAPIKey={mapsKey}
          toolbarExtension={<Extension><Button secondary label='Foo' onClick={() => {}} /></Extension>}
          onGeoJSONChanged={geoJSON => {
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
