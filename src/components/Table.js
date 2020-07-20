import React, { useCallback, useMemo, forwardRef, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { VariableSizeGrid as Grid } from 'react-window'

import { Input } from './InputContainer'

const headerHeight = 65
const rowHeight = 52
const columnWidth = 150
const cellPadding = 40
const cellBorder = 2

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
  border-right: 2px solid white;
  color: black;
  font-family: sans-serif;
  padding: 16px 20px;

  &.row-end {
    border-right: none;
  }

  &.data-number {
    text-align: right;
  }

  &.table-header {
    background: white;
    font-weight: bold;
    grid-row: 1;
    z-index: 1;

    &:last-of-type {
      border-right: none;
    }
  }

  &.table-row {
    background: #ebebeb;
    border-top: none;

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

  input {
    background: inherit;
    border-color: transparent;
    color: inherit;
    font: inherit;
    height: unset;
    margin: 0;
    max-width: unset;
    padding: 0;
    text-align: inherit;
    width: 100%;

    &[disabled] {
      border-color: transparent;
      color: inherit;
    }

    &:focus {
      background: white;
      border-color: #2684ff;
      /* outline: none; */
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
  return Math.ceil(metrics.width)
}

const getCellClass = (dataType, rowIndex, isLastofRow) => {
  const isOdd = rowIndex % 2 === 1
  const dataClass = `data-${dataType}`
  const rowClass = isOdd ? "row-odd" : "row-even"
  const rowEnd = isLastofRow ? "row-end" : ""
  return `table-row ${dataClass} ${rowClass} ${rowEnd}`
}

const countEmpty = (tableSize, contentSize, fillSize) => {
  const diff = tableSize - contentSize
  return diff < 1 ? 0 : Math.ceil(diff / fillSize)
}

const addEmptyRows = (heights, parent) => {
  const { offsetHeight: height } = parent
  const contentHeight = (heights.length * rowHeight) + headerHeight

  const emptyRows = countEmpty(height - 15, contentHeight, rowHeight)
  if (emptyRows === 0) return heights

  return [
    ...heights,
    ...Array(emptyRows).fill(rowHeight)
  ]
}

const addEmptyColumns = (columns=[], parent) => {
  const { offsetWidth: width } = parent
  const contentWidth = columns.reduce((t, w) => t + w, 0)

  const emptyCols = countEmpty(width - 15, contentWidth, columnWidth)
  if (emptyCols === 0) return columns

  return [
    ...columns,
    ...Array(emptyCols).fill(columnWidth)
  ]
}

const getColumns = schema => {
  const labels = Object.keys(schema.properties || {})
  const columns = labels.map(key => {
    const label = key
    const dataType = schema.properties[key].type
    const details = `type: ${schema.properties[key].type}${schema.required.includes(key) ? "" : " (optional)"}`

    const labelWidth = getTextWidth(label, "bold 16px sans-serif")
    const detailsWidth = getTextWidth(details, "normal 10px sans-serif")
    let width = Math.max(labelWidth, detailsWidth, (columnWidth - cellPadding))
    width += cellPadding + cellBorder
    
    return { label, dataType, details, width }
  })

  return columns
}

const ColumnHeaders = forwardRef(({
  columnCount,
  columnWidth,
  width,
  headers,
  canEdit=true
}, ref) => {

  const HeaderCell = useCallback(({ columnIndex, style }) => {
    const { label, dataType, details } = headers[columnIndex] || {}
    const [ isEditing, setIsEditing ] = useState(false)
    const [ header, setHeader ] = useState(label)
    const inputEl = useRef()
    
    const handleClick = () => {
      console.log(inputEl.current.getBoundingClientRect())
      if (canEdit) setIsEditing(true)
    }

    const handleBlur = () => {
      setIsEditing(false)
    }
    
    const handleChange = e => {
      if (!canEdit) return null
      const { value } = e.target
      setHeader(value)
    }

    useEffect(() => {
      if (isEditing) inputEl.current.select()
    }, [isEditing])
    
    return label ? (
      <TableCell
        className={ `data-${dataType} table-header` }
        style={ style }
        onClick={ handleClick }
      >
        <Input
          ref={ inputEl }
          value={ header }
          disabled={ !isEditing }
          onChange={ handleChange }
          onBlur={ handleBlur }
        />
        <HeaderDetails>{ details }</HeaderDetails>
      </TableCell>
    ) : (
      <TableCell
        {...{style}}
        className="table-header"
      />
    )
  }, [ headers, canEdit ])
  
  return (
    <Grid
      ref={ ref }
      height={ headerHeight }
      rowCount={ 1 }
      rowHeight={ () => headerHeight }
      style={{
        boxShadow: "0 2px 3px #aaa8",
        overflowX: "hidden",
        overflowY: "scroll",
        position: "absolute",
        zIndex: 2
      }}
      {...{columnCount, columnWidth, width}}
    >
      { HeaderCell }
    </Grid>
  )
})

const Table = ({
  schema={},
  items=[],
  parentNode
}) => {
  const columns = useMemo(() => getColumns(schema), [schema])
  const columnWidths = useMemo(() => {
    let widths = columns.map(col => {
      let { label, dataType, width } = col
      
      if (!["boolean", "number"].includes(dataType)) {
        items.forEach(row => {
          const cellWidth = getTextWidth(row[label], "normal 16px sans-serif")
          width = Math.max(cellWidth, width)
        })
      }

      return width + cellPadding + cellBorder
    })

    widths = addEmptyColumns(widths, parentNode)
    widths[widths.length - 1] -= cellBorder
    return widths
  }, [items, columns, parentNode])

  const rowHeights = useMemo(() => {
    let heights = Array(items.length).fill(rowHeight)
    heights = addEmptyRows(heights, parentNode)
    return heights
  }, [items, parentNode])

  const tableSize = useMemo(() => {
    const { offsetWidth, offsetHeight } = parentNode

    return {
      width: offsetWidth,
      height: offsetHeight
    }
  }, [ parentNode ])

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const {label, dataType} = columns[columnIndex] || {}
    const item = (items[rowIndex] || {})[label]
    const isLastofRow = columnIndex + 1 === columnWidths.length

    return (
      <TableCell
        className={getCellClass(dataType, rowIndex, isLastofRow)}
        style={ style }
      >
        { dataType === "boolean" && typeof item === "boolean" ? item ? <Check /> : <Ex /> : "" }
        { typeof item === "string" ? item : JSON.stringify(item) }
      </TableCell>
    )
  }, [items, columns, columnWidths.length])

  const HeaderContainer = useRef()

  const handleScroll = useCallback(({ scrollLeft, scrollUpdateWasRequested }) => {
    if (!scrollUpdateWasRequested) {
      HeaderContainer.current.scrollTo({ scrollLeft })
    }
  }, [])

  return (
    <>
      <ColumnHeaders
        ref={ HeaderContainer }
        columnCount={ (columnWidths || []).length }
        columnWidth={ index => columnWidths[index] }
        width={ tableSize.width }
        headers={ columns }
      />
      <Grid
        onScroll={ handleScroll }
        className="Grid"
        columnCount={(columnWidths || []).length}
        columnWidth={index => columnWidths[index]}
        height={tableSize.height - headerHeight}
        rowCount={(rowHeights || []).length}
        rowHeight={() => rowHeight}
        width={tableSize.width}
        style={{
          overflow: "scroll",
          position: "absolute",
          top: headerHeight,
          zIndex: 1
        }}
      >
        {Cell}
      </Grid>
    </>
  )
}

export default Table