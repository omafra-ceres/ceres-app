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
  padding: 0;

  h1 {
    font-size: ${ p => p.theme.headerSize };
    margin-left: 25px;
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

const TableWrap = styled.div`
  border-top: 2px solid #ddd;
  flex-grow: 1;
  max-width: 100%;
  overflow: hidden;
  position: relative;
`

const DescriptionContainer = styled.div`
  max-width: 800px;
  margin-left: 25px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const ActionContainer = styled.div`
  border-top: 2px solid #ddd;
  display: flex;
  flex-direction: row;
  margin-top: 10px;
  padding: 0 10px;

  > button {
    border: none;
    border-radius: none;
    background: none;
    padding: 10px 16px;

    &:hover {
      background: #efefef;
    }
  }
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

const EditDetailsForm = ({ pathname, onSubmit, closeModal, details }) => {
  const { name, description } = details
  const [newDetails, setNewDetails] = useState({name, description})
  const formEl = useRef()

  useEffect(() => {
    formEl.current.formElement[0].focus()
  }, [])

  const handleSubmit = ({formData}) => {
    axios.post(`http://localhost:4000/data/${pathname.slice(1)}/update`, {
      type: "details",
      details: formData
    })
      .then(() => {
        onSubmit(newDetails)
      }).catch(console.error)
  }

  const handleChange = ({formData}) => {
    setNewDetails(formData)
  }

  return (
    <StyledForm
      formData={ newDetails }
      schema={{
        title: "Edit Details",
        type: "object",
        properties: {
          name: {
            title: "Name",
            type: "string"
          },
          description: {
            title: "Description",
            type: "string"
          },
        }
      }}
      uiSchema={{ description: { "ui:widget": "textarea" }}}
      onSubmit={ handleSubmit }
      onChange={ handleChange }
      ref={ formEl }
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
  const tableContainer = useRef()
  
  useEffect(() => {
    axios.get(`http://localhost:4000/data/${pathname.slice(1)}`)
      .then(res => {
        const {items, dataStructure} = res.data
        setDataStructure(dataStructure)
        setItems(items)
      })
      .catch(console.error)
  },[ pathname ])

  const itemSubmit = useCallback((newItem) => {
    setItems([...items, newItem])
    modalActions.close()
  }, [ items, setItems, modalActions ])

  const addItemAction = () => {
    modalActions.setContent((
      <AddItemForm
        closeModal={() => modalActions.close()}
        schema={schema}
        onSubmit={itemSubmit}
        {...{pathname}}
      />
    ))
    modalActions.open()
  }

  const detailsSubmit = useCallback((newDetails) => {
    modalActions.close()
    setDataStructure({schema, details: {
      ...details,
      ...newDetails
    }})
  }, [details, schema, modalActions])
  
  const editDetailsAction = () => {
    modalActions.setContent((
      <EditDetailsForm
        closeModal={() => modalActions.close()}
        onSubmit={detailsSubmit}
        {...{pathname, details}}
      />
    ))
    modalActions.open()
  }

  const editHeaderAction = useCallback((columnIndex, newHeader) => {
    const id = Object.keys(schema.properties)[columnIndex]
    const properties = Object.keys(schema.properties).reduce((obj, key) => {
      obj[key] = {...schema.properties[key]}
      return obj
    }, {})
    properties[id].title = newHeader

    const oldSchema = {...schema}
    const newSchema = {
      ...schema,
      properties
    }
    
    setDataStructure({ details, schema: newSchema })
    axios.post(`http://localhost:4000/data/${pathname.slice(1)}/update`, {
      type: "headers",
      headers: {
        [id]: {
          title: newHeader
        }
      }
    }).catch(err => {
        setDataStructure({ details, schema: oldSchema })
        console.error(err)
      })
  }, [ schema, details, pathname ])

  const ActionBar = ({ actions }) => (
    <ActionContainer>
      { actions.map((action, i) => (
        <button
          key={ i }
          onClick={ action.action }
        >
          { action.label }
        </button>
      )) }
    </ActionContainer>
  )

  return details ? (
    <Page>
      <h1>{ details.name }</h1>
      <DescriptionContainer>{ details.description }</DescriptionContainer>
      <ActionBar actions={[
        { label: "Add Item", action: addItemAction },
        { label: "Edit Details", action: editDetailsAction }
      ]} />
      <TableWrap
        ref={tableContainer}
      >
        { schema && items ? (
          <Table
            parentNode={ tableContainer.current }
            schema={ schema }
            items={ items }
            editHeader={ editHeaderAction }
          />
        ) : "" }
      </TableWrap>
      {/* <AddRow /> */}
    </Page>
  ) : ""
}

export default DataShow