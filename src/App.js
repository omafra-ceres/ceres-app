import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import CollectionIndex from './pages/CollectionIndex'
import CollectionCreate from './pages/CollectionCreate'
import CollectionShow from './pages/CollectionShow'
import Header from './components/Header'
import styled, { ThemeProvider, css } from 'styled-components'

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

const theme = {
  blue: "#266DE0",
  red: "#ba2d0b",
  black: "#050505",
  text: "#444444",
  headerSize: "24px",
  visiblyHidden: visiblyHiddenStyle
}

const Container = styled.div`
  margin: 70px 0 0;
  padding: 20px 25px;

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
            <Route path="/" exact component={ CollectionIndex } />
            <Route path="/create" component={ CollectionCreate } />
            <Route path="/:collection" component={ CollectionShow } />
          </Switch>
        </Container>
      </ThemeProvider>
    </Router>
  )
}

export default App
