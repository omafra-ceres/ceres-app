// Given an array of [start, end] returns array with numbers from start to end inclusive
const getRange = (range) => {
  if (range.length !== 2 || range.some(n => !Number.isInteger(n))) return
  
  const [start, end] = range
  const diff = Math.abs(end - start) + 1
  const mod = end > start ? 1 : -1
  return Array(diff).fill().map((_, i) => start + i * mod)
}

export {
  getRange,
}