import React, { useCallback, useMemo, forwardRef, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'

import useScrollLock from '../customHooks/useScrollLock'

// import { copyText, getTextWidth } from '../utils/textUtils'
import {
  matrixToSpreadsheet,
  getEmptyMatrix,
  getRange,
  copyText,
  getTextWidth
} from '../utils'

import useContextMenu from '../customHooks/useContextMenu'

const rowHeight = 52
const columnWidth = 150
const cellPadding = 40
const cellBorder = 2
const rownumWidth = 52


////////////////////////////////////////
//////                            //////
//////      Component Styles      //////
//////                            //////

const TableContainer = styled.div`
  overflow: hidden;
  position: relative;
`

const TableDisplay = styled.div.attrs(p => ({
  style: {
    height: p.height + "px",
    width: p.width + "px"
  }
}))`
  box-shadow: -2px -2px 0 0 #aaa;
  display: -ms-grid;
  display: grid;
  left: ${rownumWidth}px;
  overflow: scroll;
  position: absolute;
  top: ${rowHeight}px;
  width: fit-content;

  grid-template-columns: ${p => p.columns};
  -ms-grid-columns: ${p => p.columns};
  grid-template-rows: ${p => `repeat(${p.rows}, ${rowHeight}px)`};
  -ms-grid-rows: ${p => `(${rowHeight}px)[${p.rows}]`};
`

const HeaderDisplay = styled(TableDisplay).attrs(() => ({
  height: rowHeight
}))`
  box-shadow: -2px 0 0 0 #aaa;
  top: 0;
  overflow-x: hidden;
`

const RownumDisplay = styled(TableDisplay).attrs(() => ({
  width: rownumWidth
}))`
  box-shadow: 0 -2px 0 0 #aaa;
  left: 0;
  overflow-y: hidden;
`

const Cell = styled.div.attrs(p => ({
  "data-celltype": "cell",
  style: {
    gridColumn: p.column,
    MsGridColumn: p.column,
    gridRow: p.row,
    MsGridRow: p.row,
  }
}))`
  border: 1px solid #fff;
  color: black;
  font-family: 'Roboto', sans-serif;
  padding: 16px 20px;

  &.row-even {
    background: #ebebeb;
  }

  &.row-odd {
    background: #fafafa;
  }

  &.format-number {
    font-family: 'Roboto Condensed', sans-serif;
    text-align: right;
  }

  &.format-boolean {
    text-transform: uppercase;
    text-align: center;
  }

  &.selected {
    background: #555;
    color: white;
  }
`

const Header = styled(Cell).attrs(() => ({
  "data-celltype": "column",
}))`
  background: #f7f8f9;
  border-top: none;
  font-weight: bold;

  &:first-child {
    border-left-color: transparent;
  }

  &.format-number {
    font-family: 'Roboto', sans-serif;
  }

  &.format-boolean {
    text-transform: none;
  }
`

const Rownum = styled(Cell).attrs(() => ({
  "data-celltype": "row",
}))`
  background: #f7f8f9;
  border-left: none;
  font-family: 'Roboto Condensed', sans-serif;
  padding-left: 0;
  padding-right: 0;
  text-align: center;

  &:first-child {
    border-top-color: transparent;
  }
`

const ControlWrap = styled.div`
  overflow: hidden;
  position: absolute;
`

const ControlContainer = styled.div`
  overflow: scroll;
  position: absolute;
  top: 0;
  left: 0;
`

const Selection = styled.div.attrs(() => ({
  "data-selection": true
}))`
  background: #0e65eb11;
  border: 1px solid #0e65eb;
  position: absolute;
  top: -2px;
  left: -2px;

  &.highlight {
    background: #aaa4;
    border: none;
  }

  &.bulk-selector {
    background: transparent;
    border: none;
  }
`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////

const TableControl = forwardRef(({ position, containerSize, contentSize, selection, onClick, onScroll, hideScroll=true }, ref) => {
  const modX = hideScroll[0] ? 30 : 0
  const modY = hideScroll[1] ? 30 : 0
  return (
    <ControlWrap style={{
      left: (position.left || 0) + "px",
      top: (position.top || 0) + "px",
      height: containerSize.height + "px",
      width: containerSize.width + "px"
    }}>
      <ControlContainer
        {...{ ref, onScroll }}
        onMouseDown={ onClick }
        style={{
          height: containerSize.height + modX + "px",
          width: containerSize.width + modY + "px"
        }}
      >
        <div style={{
          height: (contentSize.height || containerSize.height - modX) + modX + "px",
          width: contentSize.width + modY + "px"
        }} />
        <Selection { ...selection } />
      </ControlContainer>
    </ControlWrap>
  )
})

const Control = ({
  tableSize,
  columnWidths,
  rowCount,
  onClick,
  selected,
  addScroller,
  handleScroll
}) => {
  const contentHeight = rowCount * rowHeight
  const contentWidth = columnWidths.reduce((acc, cur) => acc + cur)
  
  const headerProps = {
    position: { left: rownumWidth },
    containerSize: {
      height: rowHeight,
      width: tableSize.width - rownumWidth
    },
    contentSize: { width: contentWidth },
    hideScroll: [true, false]
  }
  
  const rownumProps = {
    position: { top: rowHeight },
    containerSize: {
      height: tableSize.height - rowHeight,
      width: rownumWidth
    },
    contentSize: { height: contentHeight },
    hideScroll: [false, true]
  }

  const tableProps = {
    position: {
      top: rowHeight,
      left: rownumWidth
    },
    containerSize: {
      height: tableSize.height - rowHeight,
      width: tableSize.width - rownumWidth
    },
    contentSize: {
      height: contentHeight,
      width: contentWidth
    },
    hideScroll: [false, false]
  }

  const getBounds = useCallback((colBounds, rowBounds) => {
    const left = columnWidths.slice(0, colBounds[0] - 1).reduce((acc, cur) => acc + cur, 0) + "px"
    const top = ((rowBounds[0] - 1) * rowHeight) + "px"
    const width = columnWidths.slice(colBounds[0] - 1, colBounds[1]).reduce((acc, cur) => acc + cur, 0) + "px"
    const height = (rowHeight * (rowBounds[1] - rowBounds[0] + 1)) + "px"
    return { left, top, width, height }
  }, [columnWidths])

  let colSelection, rowSelection, cellSelection
  if (selected.coords) {
    const [start, end] = selected.coords
    let colHighlight, rowHighlight, colBounds, rowBounds
    switch (selected.type) {
      case "cell":
        colBounds = [start[0], end[0]].sort((a, b) => a - b)
        rowBounds = [start[1], end[1]].sort((a, b) => a - b)
        colHighlight = true
        rowHighlight = true
        break
      case "row":
        colBounds = [1, columnWidths.length]
        rowBounds = [start, end].sort((a, b) => a - b)
        colHighlight = true
        break
      case "column":
        colBounds = [start, end].sort((a, b) => a - b)
        rowBounds = [1, rowCount]
        rowHighlight = true
        break
      default:
        break
    }
    const bounds = getBounds(colBounds, rowBounds)
    colSelection = {
      className: colHighlight ? "highlight" : "bulk-selector",
      style: {...bounds, top: "0px", height: rowHeight + "px"},
      "data-contextmenu": "columnselection",
      "data-contextdata": `${colBounds[0]}-${colBounds[1]}/${rowBounds[0]}-${rowBounds[1]}`
    }
    rowSelection = {
      className: rowHighlight ? "highlight" : "bulk-selector",
      style: {...bounds, left: "0px", width: rownumWidth + "px"},
      "data-contextmenu": "rowselection",
      "data-contextdata": `${colBounds[0]}-${colBounds[1]}/${rowBounds[0]}-${rowBounds[1]}`
    }
    cellSelection = {
      style: bounds,
      "data-contextmenu": "cellselection",
      "data-contextdata": `${colBounds[0]}-${colBounds[1]}/${rowBounds[0]}-${rowBounds[1]}`
    }
  }

  return (
    <>
      <TableControl
        ref={ addScroller("control-header") }
        onScroll={ handleScroll() }
        selection={ colSelection }
        {...{ onClick, ...headerProps }}
      />
      <TableControl
        ref={ addScroller("control-rownum") }
        onScroll={ handleScroll() }
        selection={ rowSelection }
        {...{ onClick, ...rownumProps }}
      />
      <TableControl
        ref={ addScroller("control-table") }
        onScroll={ handleScroll() }
        selection={ cellSelection }
        {...{ onClick, ...tableProps }}
      />
    </>
  )
}

const getCellValue = value => {
  if (value == null) return ""
  const type = typeof value
  switch (type) {
    case "string":
      return value
    case "number":
      return value
    case "boolean":
      return value.toString()
    default:
      return ""
  }
}

const getCellClass = (value, rowIndex) => {
  const valType = typeof value
  const isEven = rowIndex % 2
  const classlist = [`format-${valType}`, isEven ? "row-even" : "row-odd"]
  if (valType === "boolean" && value) classlist.push("data-true")
  return classlist.join(" ")
}

const ColumnHeaders = forwardRef(({
  headers,
  columnCount,
  columnWidth,
  width,
  selected,
  columnTemplates
}, ref) => {
  const selectedCols = selected.type === "column" ? getRange(selected.coords) : []
  const getClass = useCallback(colIndex => {
    const classlist = []
    classlist.push(`format-${(headers[colIndex] || []).type}`)
    if (selectedCols.includes(colIndex + 1)) classlist.push("selected")
    return classlist.join(" ")
  }, [headers, selectedCols])
  return (
    <HeaderDisplay
      ref={ ref }
      columns={ columnTemplates }
      rows={ 1 }
      width={ width }
    >
      { getRange([0, columnCount], false).map((colIndex) => (
        <Header
          key={ colIndex }
          width={ columnWidth(colIndex) }
          data-cellselector={ colIndex + 1 }
          className={ getClass(colIndex) }
          // data-contextmenu="header"
          // data-contextdata={ colIndex + 1 }
        >
          { (headers[colIndex] || []).title }
        </Header>
      )) }
    </HeaderDisplay>
  )
})

const Rownums = forwardRef(({ rowCount, height, selected }, ref) => (
  <RownumDisplay
    ref={ ref }
    columns={ `${ rownumWidth }px` }
    rows={ rowCount }
    height={ height }
  >
    { getRange([1, rowCount]).map(num => (
      <Rownum
        key={ num }
        width={ rownumWidth }
        data-cellselector={ num }
        className={ selected.type === "row" ? getRange(selected.coords).includes(num) ? "selected" : "" : "" }
        // data-contextmenu="rownum"
        // data-contextdata={ num }
      >
        { num }
      </Rownum>
    )) }
  </RownumDisplay>
))

const TableCells = forwardRef(({
  items,
  rowCount,
  columnCount,
  columnTemplates,
  columnWidth,
  height,
  width,
  onScroll
}, ref) => (
  <TableDisplay
    ref={ ref }
    columns={ columnTemplates }
    rows={ rowCount }
    onScroll={ onScroll }
    height={ height }
    width={ width }
  >{
    getEmptyMatrix(rowCount, columnCount)
      .map((row, rowIndex) => row.map((_,colIndex) => (
        <Cell
          key={ `${rowIndex + 1} / ${colIndex + 1}` }
          row={ rowIndex + 1 }
          column={ colIndex + 1 }
          width={ columnWidth(colIndex) }
          data-cellselector={ `${colIndex + 1}/${rowIndex + 1}` }
          className={ getCellClass((items[rowIndex] || [])[colIndex], rowIndex) }
          // data-contextmenu="tablecell"
          // data-contextdata={ `${colIndex + 1}/${rowIndex + 1}` }
        >
          { getCellValue((items[rowIndex] || [])[colIndex]) }
        </Cell>
      )))
  }</TableDisplay>
))

const Table = ({
  headers,
  items,
  defaultColumnCount=20,
  defaultRowCount=50,
  style={}
}) => {
  const [ selected, setSelected ] = useState({})
  const [ addScroller, handleScroll ] = useScrollLock()
  const [ tableSize, setTableSize ] = useState({ width: 0, height: 0 })
  const tableRef = useRef()

  const [columnCount, rowCount] = useMemo(() => ([
    Math.max(headers.length, defaultColumnCount),
    Math.max(items.length, defaultRowCount)
  ]), [defaultColumnCount, defaultRowCount, headers, items])

  const measuredTable = useCallback(node => {
    if (node !== null) {
      tableRef.current = node
      const { offsetWidth: width, offsetHeight: height } = node
      setTableSize({ width, height })
    }
  }, [])
  
  const columnWidths = useMemo(() => {
    const widths = getRange([0, columnCount], false).fill(columnWidth - cellBorder - cellPadding)
    headers.forEach(({title: header}, i) => {
      let width = getTextWidth(header, "bold 16px Roboto, sans-serif")
      items.forEach(row => {
        const item = getCellValue(row[i])
        const font = `normal 16px Roboto${typeof item === "number" ? " Condensed" : ""}, sans-serif`
        const itemWidth = getTextWidth(item, font)
        if (itemWidth > width) width = itemWidth
      })
      if (width > widths[i]) widths[i] = width
    })
    return widths.map(width => width + cellPadding + cellBorder)
  }, [headers, items, columnCount])

  const columnTemplates = useMemo(() => (
    getRange([0, columnCount], false)
      .map(num => columnWidths[num])
      .join("px ") + "px"
  ), [columnCount, columnWidths])

  const handleClick = useCallback(e => {
    if (e.target.dataset.selection && e.button === 2 && !e.target.className.split(" ").includes("highlight")) return
    
    const { pageX, pageY, shiftKey } = e
    const cell = document.elementsFromPoint(pageX, pageY).find(el => el.dataset.celltype)
    const { celltype: type, cellselector } = cell.dataset
    const selector = type === "cell"
      ? cellselector.split("/").map(num => parseInt(num, 10))
      : parseInt(cellselector, 10)
    let { coords } = selected
    if (!coords || !shiftKey) coords = [selector, selector]
    coords[1] = selector
    setSelected({ type, coords })
  }, [selected])

  const copySelected = useCallback(() => {
    if (!selected.type) return
    
    const { type, coords } = selected
    const getIndexes = arr => arr.map(n => n - 1).sort((a,b) => a - b)
    const rows = getIndexes(getRange(type === "cell" ? coords.map(co => co[1]) : type === "row" ? coords : [1, columnCount]))
    const cols = getIndexes(getRange(type === "cell" ? coords.map(co => co[0]) : type === "column" ? coords : [1, rowCount]))
  
    const matrix = getEmptyMatrix(rows.length, cols.length)
    matrix.forEach((row, rowIndex) => row.forEach((_, colIndex) => {
      matrix[rowIndex][colIndex] = items[rows[rowIndex]][cols[colIndex]]
    }))
  
    const content = matrixToSpreadsheet(matrix)
    copyText(content)
  }, [ selected, items, rowCount, columnCount ])
  
  useEffect(() => {
    const handleKeyDown = e => {
      const { key, metaKey, shiftKey } = e
      if (key === "c" && metaKey && !shiftKey) {
        e.preventDefault()
        copySelected()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [ copySelected ])

  const menuOptions = useMemo(() => {
    const getSelectedString = (data, type) => {
      const [cols, rows] = data.split("/").map(s=>s.split("-").map(n=>parseInt(n,10)).sort((a,b)=>a-b))
      const isSame = (a, b) => a === b
      const strings = {
        row: `row${isSame(...rows) ? "" : `s ${rows.join(" - ")}`}`,
        column: `column${isSame(...cols) ? "" : `s ${cols.join(" - ")}`}`
      }
      return strings[type]
    }
    return {
      cellselection: {
        options: [
          { label: "Copy selection", action: copySelected },
          "break",
          { label: data => `Delete ${getSelectedString(data, "row")}`, disabled: true },
          { label: data => `Delete ${getSelectedString(data, "column")}`, disabled: true },
        ]
      },
      columnselection: {
        options: [
          { label: data => `Copy ${getSelectedString(data, "column")}`, action: copySelected },
          "break",
          { label: data => `Delete ${getSelectedString(data, "column")}`, disabled: true },
        ]
      },
      rowselection: {
        options: [
          { label: data => `Copy ${getSelectedString(data, "row")}`, action: copySelected },
          "break",
          { label: data => `Delete ${getSelectedString(data, "row")}`, disabled: true },
        ]
      },
    }
  }, [ copySelected ])

  useContextMenu(menuOptions)

  return (
    <TableContainer ref={ measuredTable } {...{style}}>
      <ColumnHeaders
        ref={ addScroller("header", "x") }
        headers={ headers }
        columnCount={ columnCount }
        columnTemplates={ columnTemplates }
        columnWidth={ index => columnWidths[index] }
        selected={ selected }
        width={ tableSize.width - rownumWidth }
      />
      <Rownums
        ref={ addScroller("rownum", "y") }
        height={tableSize.height - rowHeight}
        selected={ selected }
        rowCount={ rowCount }
      />
      <TableCells
        ref={ addScroller("main") }
        onScroll={ handleScroll() }
        items={ items }
        height={tableSize.height - rowHeight}
        width={ tableSize.width - rownumWidth }
        rowCount={ rowCount }
        columnCount={ columnCount }
        columnTemplates={ columnTemplates }
        columnWidth={ col => columnWidths[col] }
      />
      <Control
        onClick={ handleClick }
        addScroller={ addScroller }
        handleScroll={ handleScroll }
        tableSize={ tableSize }
        columnWidths={ columnWidths }
        rowCount={ rowCount }
        selected={ selected }
      />
    </TableContainer>
  )
}

export default Table