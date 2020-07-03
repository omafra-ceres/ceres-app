import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import styled, { ThemeProvider, css } from 'styled-components'

import DataIndex from './pages/DataIndex'
import DataStructureCreate from './pages/DataStructureCreate'
import DataShow from './pages/DataShow'
import Header from './components/Header'

import useModal from './customHooks/useModal'

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

const ModalOverlay = styled.div`
  background: #4448;
  bottom: 0;
  display: none;
  justify-content: center;
  left: 0;
  overflow-y: scroll;
  padding: 20vh 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 9;

  body.modal-open & {
    display: flex;
  }
`

const ModalContentContainer = styled.div`
  align-self: flex-start;
  background: white;
  border: 1px solid gray;
  border-radius: 4px;
  padding: 30px 20px;
`

const Modal = ({modalState, modalActions}) => {
  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      modalActions.close()
    }
  }
  const handleKeyDown = e => {
    if (e.key === "Escape") {
      modalActions.close()
    }
  }
  return (
    <ModalOverlay
      onClick={ handleOverlayClick }
      onKeyDown={ handleKeyDown }
    >
      <ModalContentContainer>
        { modalState.content }
      </ModalContentContainer>
    </ModalOverlay>
  )
}

function App() {
  const [modalState, modalActions] = useModal()

  return (
    <Router>
      <ThemeProvider theme={ theme }>
        <Container>
          <Header />
          <Switch>
            <Route path="/" exact component={ DataIndex } />
            <Route path="/create" component={ DataStructureCreate } />
            <Route path="/:dataset" component={ DataShow } />
          </Switch>
        </Container>
        <Modal {...{modalState, modalActions}} />
      </ThemeProvider>
    </Router>
  )
}

export default App
