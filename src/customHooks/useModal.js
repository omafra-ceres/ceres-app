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

const open = () => {
  document.body.classList.add("modal-open")
  setState({ isOpen: true })
}
const close = () => {
  document.body.classList.remove("modal-open")
  setState({ isOpen: false })
}
const toggle = () => setState({ isOpen: !state.isOpen })
const setContent = (content="") => setState({ content })

const actions = {
  open,
  close,
  toggle,
  setContent
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