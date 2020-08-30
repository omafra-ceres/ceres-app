// If value passed is a function returns result of called function
// Passes arguments after 1st (value to be evaluated) to function call
// Else returns the original value
const callIfFunction = (value, ...args) => {
  if (typeof value !== "function") return value
  return value(...args)
}

const placeholderIfNull = (value, placeholder="") => {
  if (value == null) return placeholder
  return value
}

export {
  callIfFunction,
  placeholderIfNull
}