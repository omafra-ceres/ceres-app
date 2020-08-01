import React, { useCallback, useMemo, forwardRef, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { VariableSizeGrid as Grid } from 'react-window'

import Form from '../components/CustomForm'
import { Input } from './InputContainer'

import useContextMenu from '../customHooks/useContextMenu'

const rowHeight = 52
const columnWidth = 150
const cellPadding = 40
const cellBorder = 2
const rowNumWidth = 52


////////////////////////////////////////
//////                            //////
//////      Component Styles      //////
//////                            //////

// const HeaderDetails = styled.div`
//   color: #444;
//   font-size: 10px;
//   font-weight: normal;
//   margin-top: 2px;
// `

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

const TableCell = styled.div.attrs(p => ({
  ...p.isSelected && { "data-cellselected": true }
}))`
  border-right: 2px solid white;
  color: black;
  font-family: sans-serif;
  padding: 16px 20px;
  position: relative;
  user-select: none;

  *.blur-cells & {
    filter: blur(2px);
  }

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

    &[data-cellselected] {
      background: #ddd;
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

    &[data-cellselected] {
      background: #BBDFFF;
    }

    &.row-num {
      border-right: none;
      cursor: default;
      display: flex;
      font-family: Courier, monospace;
      justify-content: center;
      user-select: none;

      &[data-cellselected] {
        background: #bbb;
      }
    }
  }
`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////


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
  const contentHeight = (heights.length * rowHeight) + rowHeight

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

const getDetails = (type, required) => `type: ${type}${required ? "" : " (optional)"}`

const getColumns = schema => {
  const columnIds = Object.keys(schema.properties || {})
  const columns = columnIds.map(id => {
    const { title: label, type: dataType } = schema.properties[id]
    const details = getDetails(dataType, schema.required.includes(id))

    const labelWidth = getTextWidth(label, "bold 16px sans-serif")
    const detailsWidth = getTextWidth(details, "normal 10px sans-serif")
    let width = Math.max(labelWidth, detailsWidth, (columnWidth - cellPadding - cellBorder))
    
    return { id, label, dataType, details, width }
  })

  return columns
}

const RowNums = forwardRef(({ rowCount, height, Cell }, ref) => {
  const NumCell = ({ rowIndex, style }) => (
    <Cell {...{ rowIndex, style }} type="rownum" />
  )

  return (
    <Grid
      ref={ ref }
      height={ height }
      width={ rowNumWidth }
      columnCount={ 1 }
      columnWidth={ () => rowNumWidth }
      rowCount={ rowCount }
      rowHeight={ () => rowHeight }
      style={{
        boxShadow: "2px 0 3px #aaa8, 0 -2px 0 #aaa",
        overflowX: "scroll",
        overflowY: "hidden",
        position: "absolute",
        top: rowHeight,
        zIndex: 2
      }}
    >
      { NumCell }
    </Grid>
  )
})

const ColumnHeaders = forwardRef(({
  columnCount,
  columnWidth,
  width,
  Cell
}, ref) => {
  
  const HeaderCell = ({ columnIndex, style }) => (
    <Cell {...{ columnIndex, style }} type="header" />
  )

  return (
    <Grid
      ref={ ref }
      height={ rowHeight }
      rowCount={ 1 }
      rowHeight={ () => rowHeight }
      style={{
        boxShadow: "0 2px 3px #aaa8, -2px 0 0 #aaa",
        left: rowNumWidth,
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

const copyText = text => {
  const el = document.createElement("textarea")
  el.value = text
  el.setAttribute('readonly', '')
  el.style.position = 'absolute'
  el.style.left = '-9999px'
  document.body.appendChild(el)
  el.select()
  document.execCommand('copy')
  document.body.removeChild(el)
}

const getRange = (start, end) => {
  const diff = Math.abs(end - start) + 1
  const mod = end > start ? 1 : -1
  return Array(diff).fill().map((_, i) => start + i * mod)
}

const Table = ({
  schema={},
  items=[],
  parentNode,
  permissions,
  editHeaderAction,
  deleteHeaderAction
}) => {
  const [ selected, setSelected ] = useState([])
  const columns = useMemo(() => getColumns(schema), [schema])
  const columnWidths = useMemo(() => {
    let widths = columns.map(col => {
      let { id, dataType, width } = col
      if (!["boolean", "number"].includes(dataType)) {
        items.forEach(row => {
          const cellWidth = getTextWidth(row[id], "normal 16px sans-serif")
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

  const copySelected = useCallback(() => {
    const rows = selected.map(sel => sel[1])
    const cols = selected.map(sel => sel[0])
    
    const minRow = Math.min(...rows)
    const maxRow = Math.max(...rows)
    const minCol = Math.min(...cols)
    const maxCol = Math.max(...cols)

    const rowDiff = maxRow - minRow + 1
    const colDiff = maxCol - minCol + 1

    const matrix = Array(rowDiff).fill().map(() => Array(colDiff).fill(""))

    selected.forEach(([x, y]) => {
      const item = items[y] || []
      const key = (columns[x] || {}).id
      if (key) matrix[y - minRow][x - minCol] = item[key]
    })
    
    const content = matrix.map(r => r.join("\t")).join("\n")
    copyText(content)
  }, [ selected, columns, items ])

  const checkSelected = useMemo(() => ({
    cell: cell => selected.findIndex(el => el[0] === cell[0] && el[1] === cell[1]) > -1,
    col: col => selected.findIndex(el => el[0] === col) > -1,
    row: row => selected.findIndex(el => el[1] === row) > -1,
  }), [ selected ])

  const handleFocus = useCallback((e, coords) => {
    const { shiftKey, metaKey } = e
    const type = shiftKey ? "range" : metaKey ? "add" : "new"
    const [x, y] = coords
    
    const handleRange = () => {
      const [colStart, rowStart] = selected[0] || coords
      const rows = getRange(rowStart, y)
      const cols = getRange(colStart, x)
      
      return rows.reduce((acc, row) => [...acc, ...cols.map(col => [col, row])], [])
    }
    const handleAdd = () => (
      checkSelected.cell(coords)
        ? selected
        : [...selected, coords]
    )
    const handleNew = () => (
      checkSelected.cell(coords)
        ? selected.length > 1
          ? [coords]
          : []
        : [coords]
    )
    
    const updates = {
      range: handleRange,
      add: handleAdd,
      new: handleNew
    }

    setSelected(updates[type]())
  }, [ selected, checkSelected ])

  const selectRow = useCallback((y, e = {}) => {
    const { shiftKey, metaKey } = e
    const type = shiftKey ? "range" : metaKey ? "add" : "new"

    const getRow = (row) => columnWidths.map((_, i) => [i, row])
    
    const handleRange = () => {
      const rowStart = (selected[0] || [])[1] || y
      const rows = getRange(rowStart, y)
      return rows.reduce((acc, row) => {
        return [...acc, ...getRow(row)]
      }, [])
    }
    const handleAdd = () => [...selected, ...getRow(y)]
    const handleNew = () => getRow(y)

    const updates = {
      range: handleRange,
      add: handleAdd,
      new: handleNew
    }

    setSelected(updates[type]())
  }, [ columnWidths, selected ])
  
  const selectCol = useCallback((x, e = {}) => {
    const { shiftKey, metaKey } = e
    const type = shiftKey ? "range" : metaKey ? "add" : "new"

    const getCol = (col) => rowHeights.map((_, i) => [col, i])
    
    const handleRange = () => {
      const colStart = (selected[0] || [])[0] || x
      const cols = getRange(colStart, x)
      const newSelection = cols.reduce((acc, col) => {
        return [...acc, ...getCol(col)]
      }, [])
      return(newSelection)
    }
    const handleAdd = () => [...selected, ...getCol(x)]
    const handleNew = () => getCol(x)

    const updates = {
      range: handleRange,
      add: handleAdd,
      new: handleNew
    }

    setSelected(updates[type]())
  }, [ rowHeights, selected ])

  const menuOptions = useMemo(() => {
    const headerNameAction = coords => editHeaderAction(columns[coords.split(",")[0]], "title")
    const headerTypeAction = coords => editHeaderAction(columns[coords.split(",")[0]], "type")
    const deleteAction = coords => deleteHeaderAction(columns[coords.split(",")[0]].id)
    return {
      header: {
        onOpen: coords => selectCol(Number.parseInt(coords.split(",")[0])),
        options: [
          { label: "Copy Column", action: copySelected },
          { label: "Edit Name", action: headerNameAction, disabled: () => !permissions.title },
          { label: "Edit Type", action: headerTypeAction, disabled: () => !permissions.type },
          { label: "Delete", action: deleteAction, disabled: () => !permissions.delete },
        ]
      },
      rownum: {
        onOpen: coords => selectRow(Number.parseInt(coords.split(",")[1])),
        options: [
          { label: "Copy Row", action: copySelected }
        ]
      },
      tablecell: [

      ]
    }
  }, [ columns, permissions, editHeaderAction, deleteHeaderAction, selectRow, selectCol, copySelected ])

  useContextMenu(menuOptions)

  useEffect(() => {
    const handleKeyDown = e => {
      const { key, metaKey, shiftKey } = e
      if (key === "c" && metaKey && !shiftKey) {
        e.preventDefault()
        copySelected()
      }
    }
    const handleClick = e => {
      if (!parentNode.contains(e.target)) console.log("outside")
    }
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("click", handleClick)
    }
  }, [ parentNode, selected, copySelected ])
  
  const Cell = useCallback(({ columnIndex=0, rowIndex=0, style={}, type }) => {
    const { id, label, dataType } = columns[columnIndex] || {}
    const isLastofRow = columnIndex + 1 === columnWidths.length

    let contextInfo = {
      "data-contextmenu": type,
      "data-contextdata": [columnIndex, rowIndex]
    }
    let content, className, isSelected, onMouseDown

    switch (type) {
      case "header":
        className = `data-${dataType} table-header`
        isSelected = checkSelected.col(columnIndex)
        content = label
        if (!label) delete contextInfo["data-contextmenu"]
        onMouseDown = (e) => selectCol(columnIndex, e)
        break
      case "rownum":
        className = `${selected.includes(rowIndex) ? "focus-cell" : ""} table-row row-num ${rowIndex % 2 ? "row-odd" : "row-even"}`
        isSelected = checkSelected.row(rowIndex)
        content = rowIndex + 1
        onMouseDown = (e) => selectRow(rowIndex, e)
        break
      default:
        const item = (items[rowIndex] || {})[id]
        className = `${selected.includes(rowIndex) ? "focus-cell" : ""} ${getCellClass(dataType, rowIndex, isLastofRow)}`
        isSelected = checkSelected.cell([columnIndex, rowIndex])
        content = (
          <>
            { dataType === "boolean" && typeof item === "boolean" ? item ? <Check /> : <Ex /> : "" }
            { typeof item === "string" ? item : JSON.stringify(item) }
          </>
        )
        onMouseDown = e => handleFocus(e, [columnIndex, rowIndex])
    }
    
    return (
      <TableCell {...{ ...contextInfo, className, style, isSelected, onMouseDown }}>
        { content }
      </TableCell>
    )
  }, [items, columns, columnWidths.length, selected, checkSelected, handleFocus, selectCol, selectRow])

  const HeaderContainer = useRef()
  const RowNumContainer = useRef()

  const handleScroll = useCallback(({ scrollLeft, scrollTop }) => {
    HeaderContainer.current.scrollTo({ scrollLeft })
    RowNumContainer.current.scrollTo({ scrollTop })
  }, [])

  return (
    <>
      <ColumnHeaders
        ref={ HeaderContainer }
        columnCount={ (columnWidths || []).length }
        columnWidth={ index => columnWidths[index] }
        width={ tableSize.width - rowNumWidth }
        Cell={ Cell }
      />
      <RowNums
        ref={ RowNumContainer }
        height={tableSize.height - rowHeight}
        rowCount={ (rowHeights || []).length }
        Cell={ Cell }
      />
      <Grid
        onScroll={ handleScroll }
        className="Grid"
        columnCount={(columnWidths || []).length}
        columnWidth={index => columnWidths[index]}
        height={tableSize.height - rowHeight}
        rowCount={(rowHeights || []).length}
        rowHeight={() => rowHeight}
        width={tableSize.width - rowNumWidth}
        style={{
          left: rowNumWidth,
          overflow: "scroll",
          position: "absolute",
          top: rowHeight,
          zIndex: 1
        }}
      >
        { Cell }
      </Grid>
    </>
  )
}

export default Table