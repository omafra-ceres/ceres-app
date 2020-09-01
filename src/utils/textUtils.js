const copyText = text => {
  const el = document.createElement("textarea")
  el.value = text || " "
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

// measure the width of text using a canvas
// without rendering anything to the DOM
// caches canvas for reuse for performance
const getTextWidth = (text, font="normal 16px sans-serif") => {
  if (!getTextWidth.canvas) {
    const canvas = document.createElement("canvas")
    getTextWidth.canvas = canvas
  }
  const context = getTextWidth.canvas.getContext("2d")
  context.font = font
  const metrics = context.measureText(text)
  return Math.ceil(metrics.width)
}

export {
  copyText,
  getTextWidth,
}