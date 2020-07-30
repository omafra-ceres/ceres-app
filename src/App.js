import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import styled, { ThemeProvider, css } from 'styled-components'

import DataIndex from './pages/DataIndex'
import DataCreate from './pages/DataCreate'
import DataShow from './pages/DataShow'
import Header from './components/Header'

import Modal from './components/Modal'

// set of styles to hide elements from sighted users
// they will still appear in the document flow for screen readers
const visiblyHiddenStyle = css`
  position:absolute;
  left:-10000px;
  top:auto;
  width:1px;
  height:1px;
  overflow:hidden;
`

// when added to a pseudo-element, will make that element the same size as it's parent
const pseudoFill = css`
  position: absolute;
  content: "";
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const theme = {
  blue: "#266DE0",
  green: "#0a0",
  red: "#ba2d0b",
  black: "#050505",
  text: "#444444",
  headerSize: "24px",
  visiblyHidden: visiblyHiddenStyle,
  pseudoFill
}

const Container = styled.div`
  margin: 70px 0 0;

  * {
    box-sizing: border-box;
  }
`

function App() {
  return (
    <Router>
      <ThemeProvider theme={ theme }>
        <Container>
          <Header />
          <Switch>
            <Route path="/" exact component={ DataIndex } />
            <Route path="/create" component={ DataCreate } />
            <Route path="/:dataset" component={ DataShow } />
          </Switch>
        </Container>
        <Modal />
      </ThemeProvider>
    </Router>
  )
}

export default App
