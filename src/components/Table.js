import React, { useCallback, useMemo, forwardRef, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { VariableSizeGrid as Grid } from 'react-window'

import { getRange } from '../utils/numUtils'
import { copyText, getTextWidth } from '../utils/textUtils'
import { matrixToSpreadsheet, getEmptyMatrix } from '../utils/arrayUtils'

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

const TableContainer = styled.div`
  overflow: hidden;
  position: relative;
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

const addEmptyRows = (heights, parentHeight) => {
  const contentHeight = (heights.length * rowHeight) + rowHeight

  const emptyRows = countEmpty(parentHeight - 15, contentHeight, rowHeight)
  if (emptyRows === 0) return heights

  return [
    ...heights,
    ...Array(emptyRows).fill(rowHeight)
  ]
}

const addEmptyColumns = (columns=[], tableWidth) => {
  const contentWidth = columns.reduce((t, w) => t + w, 0)

  const emptyCols = countEmpty(tableWidth - 15, contentWidth, columnWidth)
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

const Table = ({
  schema={},
  items=[],
  permissions,
  editHeaderAction,
  deleteHeaderAction,
  style
}) => {
  const [ selected, setSelected ] = useState([])
  const [ tableSize, setTableSize ] = useState({ width: 0, height: 0 })
  const tableRef = useRef()

  const measuredTable = useCallback(node => {
    if (node !== null) {
      tableRef.current = node
      const { offsetWidth: width, offsetHeight: height } = node
      setTableSize({ width, height })
    }
  }, [])
  
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

    widths = addEmptyColumns(widths, tableSize.width)
    widths[widths.length - 1] -= cellBorder

    return widths
  }, [items, columns, tableSize])

  const rowHeights = useMemo(() => {
    let heights = Array(items.length).fill(rowHeight)
    heights = addEmptyRows(heights, tableSize.height)
    return heights
  }, [items, tableSize])

  const copySelected = useCallback(() => {
    const rows = selected.map(sel => sel[1]).sort((a, b) => a - b)
    const cols = selected.map(sel => sel[0]).sort((a, b) => a - b)

    const minRow = rows[0]
    const maxRow = rows[rows.length - 1]
    const minCol = cols[0]
    const maxCol = cols[cols.length - 1]

    const rowDiff = maxRow - minRow + 1
    const colDiff = maxCol - minCol + 1

    const matrix = getEmptyMatrix(rowDiff, colDiff)

    selected.forEach(([x, y]) => {
      const item = items[y] || []
      const key = (columns[x] || {}).id
      matrix[y - minRow][x - minCol] = item[key]
    })

    const content = matrixToSpreadsheet(matrix)
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
      const rows = getRange([rowStart, y])
      const cols = getRange([colStart, x])
      
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

  const focusBulk = useCallback((num, bulkType, e={}) => {
    const { shiftKey, metaKey } = e
    const type = shiftKey ? "range" : metaKey ? "add" : "new"

    const getRow = (row) => columnWidths.map((_, i) => [i, row])
    const getCol = (col) => rowHeights.map((_, i) => [col, i])

    const getters = {
      row: getRow,
      col: getCol
    }

    const getBulk = getters[bulkType]
    
    const handleRange = () => {
      let start = (selected[0] || [])[bulkType === "col" ? 0 : 1]
      const bulk = getRange([start, num])
      return bulk.reduce((acc, item) => [
        ...acc,
        ...getBulk(item)
      ], [])
    }
    const handleAdd = () => [...selected, ...getBulk(num)]
    const handleNew = () => getBulk(num)

    const updates = {
      range: handleRange,
      add: handleAdd,
      new: handleNew
    }

    setSelected(updates[type]())
  }, [ columnWidths, selected, rowHeights ])

  const menuOptions = useMemo(() => {
    const headerNameAction = coords => editHeaderAction(columns[coords.split(",")[0]], "title")
    const headerTypeAction = coords => editHeaderAction(columns[coords.split(",")[0]], "type")
    const deleteAction = coords => deleteHeaderAction(columns[coords.split(",")[0]].id)
    return {
      header: {
        onOpen: coords => focusBulk(Number.parseInt(coords.split(",")[0]), "col"),
        options: [
          { label: "Copy Column", action: copySelected },
          { label: "Edit Name", action: headerNameAction, disabled: () => !permissions.title },
          { label: "Edit Type", action: headerTypeAction, disabled: () => !permissions.type },
          { label: "Delete", action: deleteAction, disabled: () => !permissions.delete },
        ]
      },
      rownum: {
        onOpen: coords => focusBulk(Number.parseInt(coords.split(",")[1]), "row"),
        options: [
          { label: "Copy Row", action: copySelected }
        ]
      },
      tablecell: [

      ]
    }
  }, [ columns, permissions, editHeaderAction, deleteHeaderAction, focusBulk, copySelected ])

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
      if (!tableRef.current.contains(e.target)) console.log("outside")
    }
    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("click", handleClick)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("click", handleClick)
    }
  }, [ selected, copySelected ])
  
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
        onMouseDown = (e) => focusBulk(columnIndex, "col", e)
        break
      case "rownum":
        className = `${selected.includes(rowIndex) ? "focus-cell" : ""} table-row row-num ${rowIndex % 2 ? "row-odd" : "row-even"}`
        isSelected = checkSelected.row(rowIndex)
        content = rowIndex + 1
        onMouseDown = (e) => focusBulk(rowIndex, "row", e)
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
  }, [items, columns, columnWidths.length, selected, checkSelected, handleFocus, focusBulk ])

  const HeaderContainer = useRef()
  const RowNumContainer = useRef()

  const handleScroll = useCallback(({ scrollLeft, scrollTop }) => {
    HeaderContainer.current.scrollTo({ scrollLeft })
    RowNumContainer.current.scrollTo({ scrollTop })
  }, [])

  return (
    <TableContainer ref={ measuredTable } {...{ style }}>
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
    </TableContainer>
  )
}

export default Table