// Converts array to string separated by tabs
// This allows a string to be copy pasted to a spreadsheet
const arrayToSpreadsheet = array => array.join("\t")

// Converts an array of arrays to a string to be copied and pasted into a spreadsheet
// This conversion preserves rows and columns of the matrix
const matrixToSpreadsheet = matrix => matrix.map(arrayToSpreadsheet).join("\n")

// returns empty matrix according to given row and column counts
const getEmptyMatrix = (rows, cols) => Array(rows).fill().map(() => Array(cols).fill())

export {
  arrayToSpreadsheet,
  matrixToSpreadsheet,
  getEmptyMatrix
}