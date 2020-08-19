// Given an array of [start, end] returns array with numbers from start to end (inclusive by default)
const getRange = (range, incl=true) => {
  if (range.length !== 2 || range.some(n => !Number.isInteger(n))) return
  
  const [start, end] = range
  const diff = Math.abs(end - start) + (incl ? 1 : 0)
  const mod = end > start ? 1 : -1
  return Array(diff).fill().map((_, i) => start + i * mod)
}

export {
  getRange,
}