import React, { useState, useEffect, useRef, useCallback } from 'react'
import styled, { css } from 'styled-components'
import axios from 'axios'

import Form from '../components/CustomForm'
import Button, { AddField } from '../components/Button'

import useModal from '../customHooks/useModal'

const Page = styled.div`
  margin: 0 auto;

  h1 {
    font-size: ${ p => p.theme.headerSize };
  }
`

const AddRowButton = styled(AddField)`
  margin: 20px 0;
`

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

const numeralStyles = css`
  font-family: Courier, monospace;
  text-align: right;
`

const TableRowItem = styled.div`
  background: ${p => p.row % 2 === 1 ? "#ebebeb" : "white"};
  border-top: none;
  grid-column: ${p => p.column};
  grid-row: ${p => p.row};
  min-height: 52px;
  min-width: 150px;
  padding: 16px 20px;
  
  ${p => p.isNumeral ? numeralStyles : ""}
`

const Table = ({ schema={}, items=[] }) => {
  const tableItems = items.length < 10 ? [...items, ...new Array(10 - items.length).fill({})] : items
  const columns = Object.keys(schema.properties || {}).map(key => ({
    label: key,
    numeral: schema.properties[key].type === "number"
  }))
  return (
    <TableContainer columns={ schema ? columns.length : "" }>
      { schema ? columns.map((col, i) => (
        <TableColumnHeader
          column={ i+1 }
          columnTotal={columns.length}
          isNumeral={ col.numeral }
          key={`column-${i+1}-header`}
        >
          { col.label }
        </TableColumnHeader>
      )) : "" }
      
      { schema ? tableItems.map((item, itemIndex) => (
        <React.Fragment key={`row-${itemIndex+2}-items`}>
          { columns.map((col, colIndex) => (
            <TableRowItem
              key={`row-${itemIndex+2}-col-${colIndex+1}`}
              column={ colIndex + 1 }
              row={ itemIndex + 2 }
              isNumeral={ col.numeral }
            >
              { typeof item[col.label] === "string" ? item[col.label] : JSON.stringify(item[col.label]) }
            </TableRowItem>
          )) }
        </React.Fragment>
      )) : "" }
    </TableContainer>
  )
}

const StyledForm = styled(Form)`
  min-width: 400px;
`

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 30px;
`

const AddItemForm = ({ schema={}, pathname, onSubmit, closeModal }) => {
  const [newItem, setNewItem] = useState({})
  const addItemFormEl = useRef()

  useEffect(() => {
    const booleanFields = Object.keys(schema.properties)
      .filter(key => {
        return schema.properties[key].type === "boolean"
      })
    setNewItem(booleanFields.reduce((obj, field) => ({...obj, [field]: false}), {}))
    addItemFormEl.current.formElement[0].focus()
  }, [])

  const handleSubmit = ({formData}) => {
    console.log("submitting")
    axios.post(`http://localhost:4000/data/${pathname.slice(1)}`, formData)
      .then(res => {
        onSubmit(res.data.item)
      }).catch(console.error)
  }

  const handleChange = ({formData}) => {
    setNewItem(formData)
  }

  return (
    <StyledForm
      formData={ newItem }
      schema={ schema }
      onSubmit={ handleSubmit }
      onChange={ handleChange }
      uiSchema={{ "ui:title": "Add Item" }}
      ref={ addItemFormEl }
    >
      <FormToolbar>
        <Button buttonType="fill" type="submit">Submit</Button>
        <Button buttonType="text" onClick={ closeModal }>Cancel</Button>
      </FormToolbar>
    </StyledForm>
  )
}

const CollectionShow = ({ location: { pathname }}) => {
  const [dataStructure, setDataStructure] = useState({})
  const [items, setItems] = useState([])
  const setModalState = useModal()[1]
  
  const onSubmit = useCallback((newItem) => {
    setItems([...items, newItem])
    setModalState({ isOpen: false })
  }, [ items, setItems, setModalState ])

  useEffect(() => {
    setModalState({
      content: (
        <AddItemForm
          closeModal={() => setModalState({ isOpen: false })}
          schema={dataStructure.schema}
          {...{pathname, onSubmit}}
        />
      )
    })
  }, [setModalState, dataStructure, onSubmit, pathname])

  useEffect(() => {
    axios.get(`http://localhost:4000/data/${pathname.slice(1)}`)
      .then(res => {
        setDataStructure(res.data.dataStructure)
        setItems(res.data.items)
      })
      .catch(console.error)
  },[ pathname ])

  const AddRow = () => (
    <AddRowButton
      onClick={() => setModalState({isOpen: true})}
    >
      Add Item
    </AddRowButton>
  )

  return dataStructure.details ? (
    <Page>
      <h1>{ dataStructure.details ? dataStructure.details.name : "" }</h1>
      <div>{ dataStructure.details ? dataStructure.details.description : "" }</div>
      <AddRow />
      <Table
        {...{schema: dataStructure.schema, items}}
      />
      <AddRow />
    </Page>
  ) : ""
}

export default CollectionShow