// Converts array to string separated by tabs
// This allows a string to be copy pasted to a spreadsheet
const arrayToSpreadsheet = array => array.join("\t")

// Converts an array of arrays to a string to be copied and pasted into a spreadsheet
// This conversion preserves rows and columns of the matrix
const matrixToSpreadsheet = matrix => matrix.map(arrayToSpreadsheet).join("\n")

// returns empty matrix according to given row and column counts
const getEmptyMatrix = (rows, cols) => Array(rows).fill().map(() => Array(cols).fill())

// Given an array of [start, end] returns array with numbers from start to end (inclusive by default)
const getRange = (range, incl=true) => {
  if (range.length !== 2 || range.some(n => !Number.isInteger(n))) return
  
  const [start, end] = range
  const diff = Math.abs(end - start) + (incl ? 1 : 0)
  const mod = end > start ? 1 : -1
  return Array(diff).fill().map((_, i) => start + i * mod)
}

export {
  arrayToSpreadsheet,
  matrixToSpreadsheet,
  getEmptyMatrix,
  getRange
}