import React, { useState, useEffect, useRef, useCallback } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import Table from '../components/Table'
import Form from '../components/CustomForm'
import Button, { AddField } from '../components/Button'

import useModal from '../customHooks/useModal'


////////////////////////////////////////
//////                            //////
//////      Component Styles      //////
//////                            //////

const Page = styled.div`
  margin: 0 auto;
  padding: 20px 50px;

  h1 {
    font-size: ${ p => p.theme.headerSize };
  }
`

const StyledForm = styled(Form)`
  min-width: 400px;
`

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 30px;
`

const AddRowButton = styled(AddField)`
  display: block;
  margin: 20px 0;
`

const TableWrap = styled.div`
  margin-left: -50px;
  overflow-x: auto;
  position: relative;
  padding: 0 50px;
  width: calc(100% + 100px);
`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////


const AddItemForm = ({ schema={}, pathname, onSubmit, closeModal }) => {
  const [newItem, setNewItem] = useState({})
  const addItemFormEl = useRef()

  useEffect(() => {
    if (!schema.properties) return

    const booleanFields = Object.keys(schema.properties)
      .filter(key => {
        return schema.properties[key].type === "boolean"
      })
    setNewItem(booleanFields.reduce((obj, field) => ({...obj, [field]: false}), {}))
    addItemFormEl.current.formElement[0].focus()
  }, [schema.properties])

  const handleSubmit = ({formData}) => {
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

const DataShow = ({ location: { pathname }}) => {
  const [dataStructure, setDataStructure] = useState({})
  const [items, setItems] = useState([])
  const modalActions = useModal()[1]
  
  const onSubmit = useCallback((newItem) => {
    setItems([...items, newItem])
    modalActions.close()
  }, [ items, setItems, modalActions ])

  useEffect(() => {
    modalActions.setContent((
      <AddItemForm
        closeModal={() => modalActions.close()}
        schema={dataStructure.schema}
        {...{pathname, onSubmit}}
      />
    ))
  }, [modalActions, dataStructure, onSubmit, pathname])

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
      onClick={() => modalActions.open()}
    >
      Add Item
    </AddRowButton>
  )

  return dataStructure.details ? (
    <Page>
      <h1>{ dataStructure.details ? dataStructure.details.name : "" }</h1>
      <div>{ dataStructure.details ? dataStructure.details.description : "" }</div>
      <AddRow />
      <TableWrap>
        <Table
          schema={ dataStructure.schema }
          items={ items }
          minItems={ 10 }
          showDetails={ true }
        />
      </TableWrap>
      <AddRow />
    </Page>
  ) : ""
}

export default DataShow