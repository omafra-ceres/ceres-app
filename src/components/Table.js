import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { VariableSizeGrid as Grid } from "react-window";

const tableBorder = "2px solid #fff";

const TableContainer = styled.div`
  display: grid;
  grid-auto-columns: fit-content(300px);
  list-style: none;

  > * {
    border: ${tableBorder};

    &:not(:nth-child(${p => p.columns}n)) {
      border-right: none;
    }
    
    &:nth-child(-n+${p => p.columns * 2}):not(:nth-child(-n+${p => p.columns})) {
      border-top: ${tableBorder};
    }
  }
`

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
  /* min-height: 52px;
  min-width: 150px; */
  padding: 16px 20px;
  
  &.data-number {
    text-align: right;
  }

  &.table-header {
    font-weight: bold;
    grid-row: 1;
    padding: 10px 20px;
    position: relative;
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

const Table = ({ schema={}, items=[], minItems=10, parentNode, size }) => {
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
    const gutter = 42
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

      if (width + gutter > widths[index]) {
        widths[index] = Math.ceil(width + gutter)
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
    
    return {
      width: tableWidth,
      height: tableHeight
    }
  }, [columnWidths, parentNode, rowHeights])

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const {label, dataType, details} = columns[columnIndex]
    const isHeader = !rowIndex
    const item = isHeader
      ? label
      : (tableRows[rowIndex - 1] || {})[label]

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

  return (
    <Grid
      className="Grid"
      columnCount={(columnWidths || []).length}
      columnWidth={index => columnWidths[index]}
      height={tableSize.height}
      rowCount={(rowHeights || []).length}
      rowHeight={index => rowHeights[index]}
      width={tableSize.width}
    >
      {Cell}
    </Grid>
  )
}

export default Table