import React, { useCallback, useMemo, useState, useEffect } from 'react'
import styled from 'styled-components'
import { VariableSizeGrid as Grid } from "react-window";

const HeaderDetails = styled.div`
  color: #444;
  font-size: 10px;
  font-weight: normal;
  margin-top: 2px;
`

const Check = styled.span`
  border: 2px solid currentColor;
  border-right: none;
  border-top: none;
  display: inline-block;
  height: 6px;
  transform: rotate(-45deg);
  transform-origin: left;
  width: 12px;
`

const Ex = styled.span`
  display: inline-block;
  height: 12px;
  width: 12px;

  &::after {
    display: block;
    content: "✕";
  }
`

const TableCell = styled.div`
  border-top: none;
  font-family: sans-serif;
  padding: 16px 20px;
  
  &.data-number {
    text-align: right;
  }

  &.table-header {
    background: white;
    font-weight: bold;
    grid-row: 1;
    padding: 10px 20px;
    z-index: 1;
  }

  &.table-row {
    background: #ebebeb;
    border-top: none;
    min-height: 52px;
    min-width: 150px;
    padding: 16px 20px;

    &.row-odd {
      background: #fafafa;
    }

    &.data-number {
      font-family: Courier, monospace;
    }

    &.data-boolean {
      font-family: Courier, monospace;

      ${Check}, ${Ex} {
        margin-right: 10px;
      }
    }
  }
`

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
  return metrics.width
}

const getCellClass = (isHeader, dataType, rowIndex) => {
  const classNames = [`data-${dataType}`]
  classNames.push(isHeader ? "table-header" : "table-row")
  if (!isHeader && rowIndex % 2 === 1) classNames.push("row-odd")
  return classNames.join(" ")
}

const Table = ({ schema={}, items=[], minItems=10, parentNode }) => {
  const tableRows = useMemo(() => {
    if (items.length > minItems) return items
    return [
      ...items,
      ...Array(minItems - items.length).fill({

      })
    ]
  }, [items, minItems])
  
  const columns = useMemo(() => Object.keys(schema.properties || {}).map(key => ({
    label: key,
    dataType: schema.properties[key].type,
    details: `type: ${schema.properties[key].type}${schema.required.includes(key) ? "" : " (optional)"}`
  })), [schema])

  const columnWidths = useMemo(() => {
    const widths = Array(columns.length).fill(150)
    const cellPadding = 40
    columns.forEach((col, index) => {
      const {label, dataType, details} = col

      const labelWidth = getTextWidth(label, "bold 16px sans-serif")
      const detailsWidth = getTextWidth(details, "normal 10px sans-serif")
      let width = Math.max(labelWidth, detailsWidth)
      
      if (!["boolean", "number"].includes(dataType)) {
        tableRows.forEach(row => {
          const cellWidth = getTextWidth(row[label], "normal 16px sans-serif")
          if (cellWidth > width) {
            width = Math.ceil(cellWidth)
          }
        })
      }

      if (width + cellPadding > widths[index]) {
        widths[index] = Math.ceil(width + cellPadding)
      }
    })
    return widths
  }, [tableRows, columns])

  const rowHeights = useMemo(() => (
    [60, ...Array(tableRows.length).fill(52)]
  ), [tableRows])

  const tableSize = useMemo(() => {
    const contentWidth = (columnWidths || [0]).reduce((w, c) => w + c, 0)
    const contentHeight = (rowHeights || [0]).reduce((h, r) => h + r, 0)
    const { offsetWidth, offsetHeight } = parentNode

    const tableWidth = Math.min(contentWidth, offsetWidth)
    const tableHeight = Math.min(contentHeight, offsetHeight)

    const scrollX = Math.max(contentWidth - tableWidth + 15, 0)
    const scrollY = Math.max(contentHeight - tableHeight + 15, 0)
    
    return {
      width: tableWidth,
      height: tableHeight,
      scroll: {
        x: scrollX,
        y: scrollY
      }
    }
  }, [columnWidths, parentNode, rowHeights])

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const {label, dataType, details} = columns[columnIndex]
    const isHeader = !rowIndex
    const item = isHeader
      ? label
      : (tableRows[rowIndex - 1] || {})[label]

    if (isHeader) return null

    return (
      <TableCell
        className={getCellClass(isHeader, dataType, rowIndex)}
        style={ style }
      >
        { dataType === "boolean" && typeof item === "boolean" ? item ? <Check /> : <Ex /> : "" }
        { typeof item === "string" ? item : JSON.stringify(item) }
        { isHeader ? <HeaderDetails>{ details }</HeaderDetails> : "" }
      </TableCell>
    )
  }, [tableRows, columns])

  const innerElementType = React.forwardRef(({ children, ...innerProps }, ref) => {
    const headers = columns.map((col, i) => {
      const {label, dataType, details} = col
      return (
        <TableCell
          className={getCellClass(true, dataType, 0)}
          key={ i }
          style={{
            position: "absolute",
            top: 0,
            left: columnWidths.slice(0,i).reduce((w, c) => w + c, 0),
            width: columnWidths[i],
            height: rowHeights[0]
          }}
        >
          { label }
          <HeaderDetails>{ details }</HeaderDetails>
        </TableCell>
      )
    })
    return (
      <div ref={ ref } {...innerProps} >
        { headers }
        { children }
      </div>
    )
  })

  useEffect(() => {
    const grid = document.querySelector(".Grid")
    const headers = document.getElementsByClassName("table-header")
    grid.prepend(...headers)
  }, [])

  const HeaderContainer = React.useRef()
  const ContentContainer = React.useRef()
  const ScrollContainerX = React.useRef()
  const ScrollContainerY = React.useRef()

  const handleScrollX = ({ scrollLeft }) => {
    HeaderContainer.current.scrollTo({ scrollLeft })
    ContentContainer.current.scrollTo({ scrollLeft })
  }
  
  const handleScrollY = ({ scrollTop }) => {
    ContentContainer.current.scrollTo({ scrollTop })
  }

  const customWheel = ({ deltaX: x, deltaY: y }) => {
    const { scrollLeft: l, scrollTop: t } = ContentContainer.current.state
    const { x: sx, y: sy } = tableSize.scroll
    const scrollLeft = sx < l + x ? sx : l + x
    const scrollTop = sy < t + y ? sy : t + y

    HeaderContainer.current.scrollTo({ scrollLeft })
    ContentContainer.current.scrollTo({ scrollLeft, scrollTop })
    ScrollContainerX.current.scrollTo({ scrollLeft })
    ScrollContainerY.current.scrollTo({ scrollTop })
  }

  return (
    <div
      onWheel={ customWheel }
    >
      {/* <CustomScroll /> */}
      <Grid
        // onScroll={ handleScroll }
        ref={ HeaderContainer }
        className="Grid grid-headers-container"
        columnCount={(columnWidths || []).length}
        columnWidth={index => columnWidths[index]}
        height={rowHeights[0]}
        rowCount={1}
        rowHeight={index => rowHeights[index]}
        width={tableSize.width}
        // innerElementType={innerElementType}
        style={{
          boxShadow: "0 2px 3px #aaa8",
          overflow: "hidden",
          position: "absolute",
          zIndex: 2
        }}
      >
        {Cell}
      </Grid>
      <Grid
        ref={ ContentContainer }
        // onScroll={ handleScroll }
        className="Grid"
        columnCount={(columnWidths || []).length}
        columnWidth={index => columnWidths[index]}
        height={tableSize.height - 15}
        rowCount={(rowHeights || []).length}
        rowHeight={index => rowHeights[index]}
        width={tableSize.width}
        innerElementType={innerElementType}
        style={{
          overflow: "hidden",
          position: "absolute",
          zIndex: 1
        }}
      >
        {Cell}
      </Grid>
      <Grid
        ref={ ScrollContainerX }
        onScroll={ handleScrollX }
        className="Grid scroll-control"
        columnCount={ 1 }
        columnWidth={ () => (columnWidths || [0]).reduce((w, c) => w + c, 0) }
        height={15}
        rowCount={ 1 }
        rowHeight={ () => (rowHeights || [0]).reduce((h, r) => h + r, 0) }
        width={tableSize.width}
        style={{
          bottom: 0,
          position: "absolute",
          zIndex: 2,
          // pointerEvents: "none"
        }}
      >
        { () => <div /> }
      </Grid>
      <Grid
        ref={ ScrollContainerY }
        onScroll={ handleScrollY }
        className="Grid scroll-control"
        columnCount={ 1 }
        columnWidth={ () => (columnWidths || [0]).reduce((w, c) => w + c, 0) }
        height={tableSize.height}
        rowCount={ 1 }
        rowHeight={ () => (rowHeights || [0]).reduce((h, r) => h + r, 0) }
        width={15}
        style={{
          right: 0,
          position: "absolute",
          zIndex: 2,
          // pointerEvents: "none"
        }}
      >
        { () => <div /> }
      </Grid>
    </div>
  )
}

export default Table