import React from 'react'
import styled, { css } from 'styled-components'

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

const TableColumnHeader = styled.div`
  font-weight: bold;
  grid-row: 1;
  padding: 10px 20px;
  position: relative;

  text-align: ${p => p.isNumeral ? "right" : "left"};

  /* styling to highlight items in column when column header is hovered over */
  /* &:hover {
    background: #D9EAD9;

    & ~ *:nth-child(${p => p.columnTotal}n + ${p => p.column}) {
      position: relative;

      &::after {
        ${p => p.theme.pseudoFill}

        background: #0f01;
        pointer-events: none;
      }
    }
  } */
`

const HeaderDetails = styled.div`
  color: #444;
  font-size: 10px;
  font-weight: normal;
  margin-top: 2px;
`

const numeralStyles = css`
  font-family: Courier, monospace;
  text-align: right;
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

const booleanStyles = css`
  font-family: Courier, monospace;

  ${Check}, ${Ex} {
    margin-right: 10px;
  }
`

const TableRowItem = styled.div.attrs(props => ({
  style: {
    background: props.row % 2 === 1 ? "#ebebeb" : "#fafafa",
    gridColumn: props.column,
    gridRow: props.row
  }
}))`
  border-top: none;
  min-height: 52px;
  min-width: 150px;
  padding: 16px 20px;
  
  ${p => p.dataType === "number" ? numeralStyles : ""}
  ${p => p.dataType === "boolean" ? booleanStyles : ""}
`

const Table = ({ schema={}, items=[], minItems=1, showDetails=false }) => {
  const tableItems = items.length < minItems ? [...items, ...new Array(minItems - items.length).fill({})] : items
  const columns = Object.keys(schema.properties || {}).map(key => ({
    label: key,
    dataType: schema.properties[key].type,
    details: `type: ${schema.properties[key].type}${schema.required.includes(key) ? "" : " (optional)"}`
  }))
  return (
    <TableContainer
      className="table-container"
      columns={ schema ? columns.length : "" }
    >
      { schema ? columns.map((col, i) => (
        <TableColumnHeader
          column={ i+1 }
          columnTotal={columns.length}
          dataType={ col.dataType }
          key={`column-${i+1}-header`}
        >
          { col.label }
          { showDetails ? (
            <HeaderDetails>{ col.details }</HeaderDetails>
          ) : "" }
        </TableColumnHeader>
      )) : "" }
      
      { schema ? tableItems.map((item, itemIndex) => (
        <React.Fragment key={`row-${itemIndex+2}-items`}>
          { columns.map((col, colIndex) => (
            <TableRowItem
              key={`row-${itemIndex+2}-col-${colIndex+1}`}
              column={ colIndex + 1 }
              row={ itemIndex + 2 }
              dataType={ col.dataType }
              value={ item[col.label] }
            >
              { col.dataType === "boolean" && item[col.label] === true ? <Check /> : "" }
              { col.dataType === "boolean" && item[col.label] === false ? <Ex /> : "" }
              { typeof item[col.label] === "string" ? item[col.label] : JSON.stringify(item[col.label]) }
            </TableRowItem>
          )) }
        </React.Fragment>
      )) : "" }
    </TableContainer>
  )
}

export default Table