import React, { useCallback, useMemo, forwardRef, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'
import { VariableSizeGrid as Grid } from 'react-window'

import Form from '../components/CustomForm'
import { Input } from './InputContainer'

const headerHeight = 65
const rowHeight = 52
const columnWidth = 150
const cellPadding = 40
const cellBorder = 2
const rowNumWidth = 52


////////////////////////////////////////
//////                            //////
//////      Component Styles      //////
//////                            //////

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
  position: relative;

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

    &.focus-row {
      background: #BBDFFF;
    }

    &.row-num {
      border-right: none;
      cursor: default;
      display: flex;
      font-family: Courier, monospace;
      justify-content: center;
      user-select: none;

      &.focus-row {
        background: #666;
        color: white;
      }
    }
  }
`

const HeaderActionsButton = styled.button`
  position: absolute;
  top: 5px;
  right: 0;
  
  background: white;
  border: none;
  border-radius: 4px;
  color: #444;
  font-weight: bold;
  font-size: 16px;
  height: 26px;
  opacity: 0.2;
  padding: 0;
  text-align: center;
  width: 20px;

  *:hover > &, &:focus {
    opacity: 1;
  }

  &:hover {
    background: #f4f4f4;
  }

  &:active {
    background: #ddd;
  }
`

const HeaderActionsMenu = styled.ul.attrs(p => ({
  style: {
    left: p.right - 120 || 0,
    display: p.isOpen ? "block" : "none"
  }
}))`
  background: white;
  border-radius: 1px;
  box-shadow: 0 2px 6px 2px #3c404326;
  list-style: none;
  margin: 0;
  padding: 5px 0;
  position: absolute;
  top: 5px;
  width: 120px;
  z-index: 2;
`

const ActionMenuItem = styled.button.attrs(() => ({
  onMouseOver: e => e.target.focus()
}))`
  background: white;
  border: none;
  display: block;
  line-height: 30px;
  padding: 0 10px;
  text-align: left;
  width: 100%;

  &:focus {
    background: #BBDFFF;
    outline: none;
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

const RowNums = forwardRef(({ rowCount, height, focusRows, focusAction }, ref) => {
  const NumCell = useCallback(({ rowIndex, style }) => {
    const cellEl = useRef()
    const handleClick = e => {
      focusAction(e, rowIndex)
    }
    return (
      <TableCell
        ref={ cellEl }
        className={`${focusRows.includes(rowIndex) ? "focus-row" : ""} table-row row-num ${rowIndex % 2 ? "row-odd" : "row-even"}`}
        onClick={ handleClick }
        style={ style }
      >
        { rowIndex + 1 }
      </TableCell>
    )
  }, [ focusAction, focusRows ])

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
        top: headerHeight,
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
  headers,
  permissions,
  editHeaderAction,
  deleteHeaderAction
}, ref) => {
  const [ menuState, setMenuState ] = useState({})
  const menuContainer = useRef()

  useEffect(() => {
    if (menuState.isOpen) {
      menuContainer.current.firstChild.firstChild.focus()
    }
  }, [ menuState ])

  const HeaderCell = useCallback(({ columnIndex, style }) => {
    const { label, dataType, details } = headers[columnIndex] || {}
    const cellEl = useRef()

    const handleActionsClick = () => {
      const { scrollLeft } = ref.current.state
      const { offsetLeft, offsetWidth } = cellEl.current
      const offsetRight = offsetLeft - scrollLeft + offsetWidth
      
      setMenuState({
        isOpen: true,
        index: columnIndex,
        right: offsetRight
      })
    }

    return label ? (
      <TableCell
        ref={ cellEl }
        className={ `data-${dataType} table-header` }
        style={ style }
      >
        { label }
        <HeaderDetails>{ details }</HeaderDetails>
        <HeaderActionsButton onClick={ handleActionsClick }>︙</HeaderActionsButton>
      </TableCell>
    ) : (
      <TableCell
        {...{style}}
        className="table-header"
      />
    )
  }, [ headers, ref ])

  const closeMenu = () => {
    setMenuState({ isOpen: false })
  }

  const handleMenuBlur = e => {
    if (!e.relatedTarget) closeMenu()
  }

  const handleMenuKeyDown = e => {
    if (e.key === "Escape") closeMenu()
    
    if (!["Tab", "ArrowDown", "ArrowUp"].includes(e.key)) return

    const children = Array.from(e.currentTarget.children)
      .map(ch => ch.firstChild)
      .filter(ch => !ch.attributes.disabled)
    const first = children[0]
    const last = children[children.length - 1]
    
    // trap focus inside menu while menu is open
    if (e.key === "Tab") {
      if (e.target === first && e.shiftKey) {
        e.preventDefault()
        last.focus()
      }
      if (e.target === last && !e.shiftKey) {
        e.preventDefault()
        first.focus()
      }
    }

    // allow arrow keys to navigate menu
    if (e.key === "ArrowDown") {
      if (e.target === last) {
        first.focus()
      } else {
        children[children.indexOf(e.target) + 1].focus()
      }
    }
    if (e.key === "ArrowUp") {
      if (e.target === first) {
        last.focus()
      } else {
        children[children.indexOf(e.target) - 1].focus()
      }
    }
  }

  const handleNameClick = () => {
    closeMenu()
    editHeaderAction(headers[menuState.index], "title")
  }
  
  const handleTypeClick = () => {
    closeMenu()
    editHeaderAction(headers[menuState.index], "type")
  }

  const handleDeleteClick = () => {
    closeMenu()
    deleteHeaderAction(headers[menuState.index].id)
  }

  return (
    <>
      <Grid
        ref={ ref }
        height={ headerHeight }
        rowCount={ 1 }
        rowHeight={ () => headerHeight }
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
      <HeaderActionsMenu
        {...menuState}
        ref={ menuContainer }
        onKeyDown={ handleMenuKeyDown }
        onBlur={ handleMenuBlur }
      >
        <li><ActionMenuItem disabled={ !permissions.title } onClick={ handleNameClick }>Edit Name</ActionMenuItem></li>
        <li><ActionMenuItem disabled={ !permissions.type } onClick={ handleTypeClick }>Edit Type</ActionMenuItem></li>
        <li><ActionMenuItem disabled={ !permissions.delete } onClick={ handleDeleteClick }>Delete</ActionMenuItem></li>
      </HeaderActionsMenu>
    </>
  )
})

const Table = ({
  schema={},
  items=[],
  parentNode,
  permissions,
  editHeaderAction,
  deleteHeaderAction
}) => {
  const [ focusRows, setFocusRows ] = useState([])
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

  const Cell = useCallback(({ columnIndex, rowIndex, style }) => {
    const {id, dataType} = columns[columnIndex] || {}
    const item = (items[rowIndex] || {})[id]
    const isLastofRow = columnIndex + 1 === columnWidths.length

    return (
      <TableCell
        className={`${focusRows.includes(rowIndex) ? "focus-row" : ""} ${getCellClass(dataType, rowIndex, isLastofRow)}`}
        style={ style }
      >
        { dataType === "boolean" && typeof item === "boolean" ? item ? <Check /> : <Ex /> : "" }
        { typeof item === "string" ? item : JSON.stringify(item) }
      </TableCell>
    )
  }, [items, columns, columnWidths.length, focusRows])

  const HeaderContainer = useRef()
  const RowNumContainer = useRef()

  const handleScroll = useCallback(({ scrollLeft, scrollTop }) => {
    HeaderContainer.current.scrollTo({ scrollLeft })
    RowNumContainer.current.scrollTo({ scrollTop })
  }, [])

  const handleFocus = (e, row) => {
    const { shiftKey, metaKey } = e
    const type = shiftKey
      ? "range"
      : metaKey 
        ? "add"
        : "new"
    
    let newFocusRows = [...focusRows]
    
    const handleRange = () => {
      const start = newFocusRows[0] || 0
      const diff = Math.abs(row - start) + 1
      const mod = row > start ? 1 : -1
      return Array(diff)
        .fill()
        .map((_, i) => (
          start + i * mod
        ))
    }
    const handleAdd = () => (
      newFocusRows.includes(row)
        ? newFocusRows.filter(r => r !== row)
        : [...newFocusRows, row]
    )
    const handleNew = () => (
      newFocusRows.includes(row)
        ? newFocusRows.length > 1
          ? [row]
          : []
        : [row]
    )
    
    const updates = {
      range: handleRange,
      add: handleAdd,
      new: handleNew
    }

    setFocusRows(updates[type]())
  }

  return (
    <>
      <ColumnHeaders
        ref={ HeaderContainer }
        columnCount={ (columnWidths || []).length }
        columnWidth={ index => columnWidths[index] }
        width={ tableSize.width - rowNumWidth }
        headers={ columns }
        permissions={ permissions }
        editHeaderAction={ editHeaderAction }
        deleteHeaderAction={ deleteHeaderAction }
      />
      <RowNums
        ref={ RowNumContainer }
        height={tableSize.height - headerHeight}
        rowCount={ (rowHeights || []).length }
        focusAction={ handleFocus }
        focusRows={ focusRows }
      />
      <Grid
        onScroll={ handleScroll }
        className="Grid"
        columnCount={(columnWidths || []).length}
        columnWidth={index => columnWidths[index]}
        height={tableSize.height - headerHeight}
        rowCount={(rowHeights || []).length}
        rowHeight={() => rowHeight}
        width={tableSize.width - rowNumWidth}
        style={{
          left: rowNumWidth,
          overflow: "scroll",
          position: "absolute",
          top: headerHeight,
          zIndex: 1
        }}
      >
        { Cell }
      </Grid>
    </>
  )
}

export default Table