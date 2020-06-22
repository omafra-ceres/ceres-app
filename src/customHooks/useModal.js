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

const useModal = () => {
  const newListener = useState()[1]
  useEffect(() => {
    listeners.push(newListener)
    return () => {
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [])
  return [state, setState]
}

export default useModal