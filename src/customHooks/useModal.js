import { useState, useEffect } from 'react'

let listeners = []
let state = {
  isOpen: false,
  content: ""
}

const modalContent = {}

const setState = (newState) => {
  state = { ...state, ...newState }
  listeners.forEach(listener => listener(state))
}

const open = (content, data) => {
  document.body.classList.add("modal-open")
  setState({
    isOpen: true,
    data,
    ...modalContent[content] && { content: modalContent[content] }
  })
}
const close = () => {
  document.body.classList.remove("modal-open")
  setState({ isOpen: false })
}

const actions = {
  open,
  close,
  setState
}

const useModal = (content) => {
  const newListener = useState()[1]
  
  useEffect(() => {
    if (content) Object.keys(content).forEach(key => modalContent[key] = content[key])
    listeners.push(newListener)
    return () => {
      if (content) Object.keys(content).forEach(key => delete modalContent[key])
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [newListener, content])
  
  return [state, actions]
}

export default useModal