import React from 'react'
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom'
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react"
import styled, { ThemeProvider, css } from 'styled-components'

import DataIndex from './pages/DataIndex'
import DataCreate from './pages/DataCreate'
import DataShow from './pages/DataShow'
import Login from './pages/Login'
import Header from './components/Header'

import Modal from './components/Modal'
import ContextMenu from './components/ContextMenu'

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

const PrivateRoute = ({ component: Page, ...innerProps }) => {
  const { isAuthenticated, isLoading } = useAuth0()
  return (
    <Route
      { ...innerProps }
      render={ props => isLoading
        ? "loading"
        : isAuthenticated
          ? <Page  {...props } />
          : <Redirect to={{ pathname: "/login", state: { from: props.location }}} />
      }
    />
  )
}

const LoginRoute = ({ component: Page, ...innerProps }) => {
  const { isAuthenticated, isLoading } = useAuth0()
  return (
    <Route
      { ...innerProps }
      render={ props => isLoading
        ? "loading"
        : isAuthenticated
          ? <Redirect to="/" />
          : <Page  {...props } />
      }
    />
  )
}

function App() {
  return (
    <Auth0Provider
      domain={ process.env.REACT_APP_AUTH_DOMAIN }
      clientId={ process.env.REACT_APP_AUTH_CLIENT_ID }
      redirectUri={ window.location.origin }
      audience={ process.env.REACT_APP_AUTH_AUDIENCE }
      scope="read:current_user update:current_user_metadata"
    >
      <Router>
        <ThemeProvider theme={ theme }>
          <Container>
            <Header />
            <Switch>
              <LoginRoute path="/login" component={ Login } />
              <PrivateRoute path="/" exact component={ DataIndex } />
              <PrivateRoute path="/create" component={ DataCreate } />
              <PrivateRoute path="/:dataset" component={ DataShow } />
            </Switch>
          </Container>
          <Modal />
          <ContextMenu />
        </ThemeProvider>
      </Router>
    </Auth0Provider>
  )
}

export default App
