/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////
//////                                                     //////
//////    This component should only be used in App.js     //////
//////    All other files should use useModal to update    //////
//////                                                     //////
/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////

import React from "react"
import styled from "styled-components"

import useModal from "../customHooks/useModal"

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

const Modal = () => {
  const [modalState, modalActions] = useModal()

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
  const Content = modalState.content
  
  return (
    <ModalOverlay
      onClick={ handleOverlayClick }
      onKeyDown={ handleKeyDown }
    >
      <ModalContentContainer>
        { Content ? <Content {...(modalState.data || {})} /> : "" }
      </ModalContentContainer>
    </ModalOverlay>
  )
}

export default Modal