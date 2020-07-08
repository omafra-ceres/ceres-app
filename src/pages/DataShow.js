import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
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
  display: flex;
  flex-direction: column;
  height: calc(100vh - 70px);
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
  display: inline-flex;
  margin: 20px 0;
  width: fit-content;
`

const TableWrap = styled.div`
  /* border: 1px solid #aaa; */
  /* border-radius: 1px; */
  flex-grow: 1;
  max-width: 100%;
  overflow: hidden;
  position: relative;
`

const DescriptionContainer = styled.div`

`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////

const Description = content => {

}

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
  const [{details, schema}, setDataStructure] = useState({})
  const [items, setItems] = useState()
  const modalActions = useModal()[1]
  // const [tableContainer, setTableContainer] = useState()
  const tableContainer = useRef()
  
  const onSubmit = useCallback((newItem) => {
    setItems([...items, newItem])
    modalActions.close()
  }, [ items, setItems, modalActions ])

  useEffect(() => {
    if (!schema) return
    modalActions.setContent((
      <AddItemForm
        closeModal={() => modalActions.close()}
        schema={schema}
        {...{pathname, onSubmit}}
      />
    ))
  }, [modalActions, schema, onSubmit, pathname])

  useEffect(() => {
    const start = performance.now()
    axios.get(`http://localhost:4000/data/${pathname.slice(1)}`)
      .then(res => {
        const {items, dataStructure} = res.data
        if (items.length < 10) {
          items.push(...Array(10 - items.length).fill(""))
        }
        setDataStructure(dataStructure)
        setItems(items)
        const end = performance.now()
        console.log(`time to fetch: ${Math.trunc((end - start) * 1000) / 1000}ms`)
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

  return details ? (
    <Page>
      <h1>{ details.name }</h1>
      <DescriptionContainer>{ details.description }</DescriptionContainer>
      <AddRow />
      <TableWrap
        ref={tableContainer}
      >
        { schema && items ? (
          <Table
            parentNode={ tableContainer.current }
            schema={ schema }
            items={ items }
            minItems={ 10 }
          />
        ) : "" }
      </TableWrap>
      {/* <AddRow /> */}
    </Page>
  ) : ""
}

export default DataShow