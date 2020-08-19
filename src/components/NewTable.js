import React, { useCallback, useMemo, forwardRef, useRef, useState, useEffect } from 'react'
import styled from 'styled-components'

import useScrollLock from '../customHooks/useScrollLock'

import { getRange } from '../utils/numUtils'
import { getTextWidth } from '../utils/textUtils'

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

const Cell = styled.div.attrs(() => ({
  style: {
    height: rowHeight
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

  &.data-invalid {
    outline: 2px solid red;
    color: red;
  }

  &.format-number {
    font-family: 'Roboto Condensed', sans-serif;
    text-align: right;
  }

  &.format-boolean {
    text-transform: uppercase;
    text-align: center;
  }
`

const Header = styled(Cell)`
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
  style: {
    height: rowHeight,
    width: rowHeight
  }
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

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////


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

const getCellClass = (value, columnType, index) => {
  const valType = typeof value
  const isValid = valType === columnType
  const isEven = index % 2

  const classlist = []
  classlist.push(`format-${valType}`, isEven ? "row-even" : "row-odd")
  if (!isValid) classlist.push("data-invalid")
  if (valType === "boolean" && value) classlist.push("data-true")
  return classlist.join(" ")
}

const ColumnHeaders = forwardRef(({ headers, columnWidth, width, columnTemplates }, ref) => (
  <HeaderDisplay
    ref={ ref }
    columns={ columnTemplates }
    rows={ 1 }
    width={ width }
  >
    { headers.map((header, i) => (
      <Header
        key={ i }
        width={ columnWidth(i) }
        className={ `format-${header.type}` }
      >
        { header.title }
      </Header>
    )) }
  </HeaderDisplay>
))

const Rownums = forwardRef(({ rowCount, height }, ref) => (
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
  columnType,
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
  >
    { items.map((item, i) => (
      <Cell
        key={ i }
        width={ columnWidth(i % columnCount) }
        className={ getCellClass(item, columnType(i % columnCount), Math.trunc(i / columnCount)) }
      >
        { getCellValue(item) }
      </Cell>
    )) }
  </TableDisplay>
))

const Table = ({
  headers,
  items,
  columnCount,
  rowCount,
  style={}
}) => {
  const [addScroller, handleScroll] = useScrollLock()
  const [ tableSize, setTableSize ] = useState({ width: 0, height: 0 })
  const tableRef = useRef()

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
      const headerWidth = getTextWidth(header, "bold 16px Roboto, sans-serif")
      if (headerWidth > widths[i]) widths[i] = headerWidth
    })
    items.forEach((item, i) => {
      const value = getCellValue(item)
      const font = `normal 16px Roboto${typeof value === "number" ? " Condensed" : ""}, sans-serif`
      let itemWidth = getTextWidth(value, font)
      if (itemWidth > widths[i % columnCount]) widths[i % columnCount] = itemWidth
    })
    return widths.map(width => width + cellPadding + cellBorder)
  }, [headers, items, columnCount])

  const columnTemplates = useMemo(() => (
    getRange([0, columnCount], false)
      .map(num => columnWidths[num])
      .join("px ") + "px"
  ), [columnCount, columnWidths])

  return (
    <TableContainer ref={ measuredTable } {...{style}}>
      <ColumnHeaders
        ref={ addScroller("header", "x") }
        headers={ headers }
        columnTemplates={ columnTemplates }
        columnWidth={ index => columnWidths[index] }
        width={ tableSize.width - rownumWidth }
      />
      <Rownums
        ref={ addScroller("rownum", "y") }
        height={tableSize.height - rowHeight}
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
        columnType={ col => headers[col].type }
      />
    </TableContainer>
  )
}

export default Table