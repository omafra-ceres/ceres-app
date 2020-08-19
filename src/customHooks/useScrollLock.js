import {useState, useCallback} from 'react'

const useScrollLock = () => {
  const [xScrollers, setXScrollers] = useState({})
  const [yScrollers, setYScrollers] = useState({})
  
  const addScroller = useCallback((name, axis) => node => {
    if (node !== null) {
      if (axis !== 'y' && xScrollers[name] !== node) setXScrollers({...xScrollers, [name]: node})
      if (axis !== 'x' && yScrollers[name] !== node) setYScrollers({...yScrollers, [name]: node})
    }
  }, [xScrollers, yScrollers])

  const scrollX = useCallback(scrollLeft => {
    Object.keys(xScrollers).forEach(key => xScrollers[key].scrollLeft = scrollLeft)
  }, [xScrollers])

  const scrollY = useCallback(scrollTop => {
    Object.keys(yScrollers).forEach(key => yScrollers[key].scrollTop = scrollTop)
  }, [yScrollers])

  const handleScroll = useCallback(axis => e => {
    const {scrollLeft, scrollTop} = e.target
    if (axis !== 'y') scrollX(scrollLeft)
    if (axis !== 'x') scrollY(scrollTop)
  }, [scrollX, scrollY])

  return [addScroller, handleScroll]
}

export default useScrollLock