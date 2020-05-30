import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import CollectionIndex from './pages/CollectionIndex'
import CollectionCreate from './pages/CollectionCreate'
import CollectionShow from './pages/CollectionShow'
import Header from './components/Header'
import styled, { ThemeProvider } from 'styled-components'

const theme = {
  blue: "#004fff",
  red: "#ba2d0b",
  black: "#050505",
  headerSize: "24px"
}

const Container = styled.div`
  margin: 70px 0 0;
  padding: 20px 25px;
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
