import React, { useState, useEffect } from 'react'

let listeners = []
let state = {
  isOpen: false,
  content: ""
}

const setState = (newState) => {
  state = { ...state, ...newState }
  listeners.forEach(listener => listener(state))
}

const open = (content) => {
  document.body.classList.add("modal-open")
  setState({
    isOpen: true,
    ...content && { content }
  })
}
const close = () => {
  document.body.classList.remove("modal-open")
  setState({ isOpen: false })
}
const toggle = () => setState({ isOpen: !state.isOpen })

const actions = {
  open,
  close,
  toggle,
  setState
}

const useModal = () => {
  const newListener = useState()[1]
  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [newListener])
  return [state, actions]
}

export default useModal