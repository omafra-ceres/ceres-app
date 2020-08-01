import { useState, useEffect } from 'react'

let listeners = []
const menus = {}

const useContextMenu = (newMenu) => {
  const newListener = useState()[1]
  
  useEffect(() => {
    if (newMenu) Object.keys(newMenu).forEach(key => menus[key] = newMenu[key])
    listeners.forEach(listener => listener(menus))
    listeners.push(newListener)
    
    return () => {
      if (newMenu) Object.keys(newMenu).forEach(key => delete menus[key])
      listeners = listeners.filter(listener => listener !== newListener)
    }
  }, [newListener, newMenu])
  
  return menus
}

export default useContextMenu