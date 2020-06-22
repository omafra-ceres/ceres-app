import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import styled, { ThemeProvider, css } from 'styled-components'

import CollectionIndex from './pages/CollectionIndex'
import CollectionCreate from './pages/CollectionCreate'
import CollectionShow from './pages/CollectionShow'
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
  red: "#ba2d0b",
  black: "#050505",
  text: "#444444",
  headerSize: "24px",
  visiblyHidden: visiblyHiddenStyle,
  pseudoFill
}

const Container = styled.div`
  margin: 70px 0 0;
  padding: 20px 25px;

  * {
    box-sizing: border-box;
  }
`

const ModalOverlay = styled.div`
  align-content: center;
  background: #4448;
  bottom: 0;
  display: flex;
  justify-content: center;
  left: 0;
  position: fixed;
  right: 0;
  top: 0;
  z-index: 9;
`

const ModalContentContainer = styled.div`
  align-self: center;
  background: white;
  border: 1px solid gray;
  border-radius: 4px;
  padding: 30px 20px;
`

const Modal = ({modalState, setModalState}) => {
  const closeModal = () => {
    setModalState({isOpen: false})
  }
  const handleOverlayClick = e => {
    if (e.target === e.currentTarget) {
      closeModal()
    }
  }
  return modalState.isOpen ? (
    <ModalOverlay onClick={ handleOverlayClick }>
      <ModalContentContainer>
        { modalState.content }
      </ModalContentContainer>
    </ModalOverlay>
  ) : ""
}

function App() {
  const [modalState, setModalState] = useModal()
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
        <Modal {...{modalState, setModalState}} />
      </ThemeProvider>
    </Router>
  )
}

export default App
