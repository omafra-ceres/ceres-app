import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import Table from '../components/Table'
import Form from '../components/CustomForm'
import Button from '../components/Button'

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

const DeleteText = styled.div`
  color: #666;
  font-size: 14px;
  margin-bottom: 25px;
  width: 350px;
  text-align: center;

  h1 {
    color: #444;
    font-weight: bold;
    margin-bottom: 20px;
  }

  p {
    margin: 5px 0;
  }
`

const DeleteForm = styled(StyledForm)`
  margin: 0 auto;
  max-width: 250px;
  min-width: unset;

  input {
    margin-bottom: 5px;
  }
`

const CancelDeleteButton = styled(Button).attrs({
  buttonType: "fill"
})`
  border-color: #aaa;
  background-color: #aaa;
  color: white;
`

const DeleteButton = styled(Button).attrs({
  buttonType: "fill",
  type: "submit"
})`
  border-color: red;
  background-color: red;
  color: white;
  margin-left: 20px;
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

const EditHeaderForm = ({ pathname, onSubmit, closeModal, header, editType }) => {
  const { id, label: title, dataType: type } = header
  const [ newHeader, setNewHeader ] = useState({ title, type })
  const formEl = useRef()

  useEffect(() => {
    formEl.current.formElement[0].focus()
  }, [ header ])
  
  const handleSubmit = () => {
    axios.post(`http://localhost:4000/data/${pathname.slice(1)}/update`, {
      type: "schema",
      schema: {
        [id]: newHeader
      }
    }).then(() => {
      onSubmit({ ...newHeader, id })
    }).catch(err => {
      console.error(err)
    })
  }

  const handleChange = ({formData}) => {
    setNewHeader({
      ...newHeader,
      [editType]: formData
    })
  }

  const nameSchema = {
    title: "Field Name",
    type: "string"
  }

  const typeSchema = {
    title: "Field Type",
    type: "string",
    enum: ["string", "number", "boolean"],
    enumNames: ["Text", "Number", "True/False"]
  }

  const schema = {
    title: nameSchema,
    type: typeSchema
  }

  return (
    <StyledForm
      formData={ newHeader[editType] }
      schema={ schema[editType] }
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

const DeleteHeaderForm = ({closeModal, onSubmit, pathname, id, title}) => {
  const [ titleCheck, setTitleCheck ] = useState()

  useEffect(() => {
    setTitleCheck()
  }, [title])
  
  const handleChange = ({ formData }) => {
    setTitleCheck(formData)
  }

  const validate = (formData, errors) => {
    if (formData.delete !== title) {
      errors.delete.addError("Field names do not match")
    }
    return errors
  }

  return (
    <>
      <DeleteText>
        <h1>Are you sure?</h1>
        <p>Deleting field <b>{ title }</b> cannot be undone.</p>
        <p>Type the field name below to confirm.</p>
      </DeleteText>
      <DeleteForm
        formData={ titleCheck }
        schema={{
          required: [ "delete" ],
          properties: {
            delete: {
              title: "Field Name",
              type: "string"
            }
          }
        }}
        validate={ validate }
        onSubmit={ () => onSubmit(id) }
        onChange={ handleChange }
      >
        <FormToolbar style={{ justifyContent: "center", marginTop: "20px" }}>
          <CancelDeleteButton onClick={ closeModal }>Cancel</CancelDeleteButton>
          <DeleteButton>Delete</DeleteButton>
        </FormToolbar>
      </DeleteForm>
    </>
  )
}

const DataShow = ({ location: { pathname }}) => {
  const [{details, schema}, setDataStructure] = useState({})
  const [items, setItems] = useState()
  const modalActions = useModal()[1]
  const tableContainer = useRef()

  const permissions = useMemo(() => ({
    title: true,
    type: !(items || []).length,
    delete: !(items || []).length
  }), [items])
  
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
    const content = (
      <AddItemForm
        closeModal={() => modalActions.close()}
        schema={schema}
        onSubmit={itemSubmit}
        {...{pathname}}
      />
    )
    modalActions.open(content)
  }

  const detailsSubmit = useCallback((newDetails) => {
    modalActions.close()
    setDataStructure({schema, details: {
      ...details,
      ...newDetails
    }})
  }, [details, schema, modalActions])
  
  const editDetailsAction = () => {
    const content = (
      <EditDetailsForm
        closeModal={() => modalActions.close()}
        onSubmit={detailsSubmit}
        {...{pathname, details}}
      />
    )
    modalActions.open(content)
  }

  const headerSubmit = useCallback((newHeader) => {
    const { id, title, type } = newHeader
    modalActions.close()
    const newDataStructure = {
      details,
      schema: {
        ...schema,
        properties: {
          ...schema.properties,
          [id]: {
            ...schema.properties[id],
            title,
            type
          }
        }
      }
    }
    setDataStructure(newDataStructure)
  }, [ details, modalActions, schema ])

  const editHeaderAction = (header, editType) => {
    const content = (
      <EditHeaderForm
        closeModal={() => modalActions.close()}
        onSubmit={ headerSubmit }
        {...{pathname, header, editType}}
      />
    )
    modalActions.open(content)
  }
  
  const headerDelete = useCallback(id => {
    modalActions.close()
    if (items && items.length) return

    axios.post(`http://localhost:4000/data/${pathname.slice(1)}/delete`, {
      fields: [id]
    }).then(() => {
      const newProperties = Object.keys(schema.properties)
        .filter(key => key !== id)
        .reduce((acc, cur) => {
          acc[cur] = {...schema.properties[cur]}
          return acc
        }, {})
      const newDataStructure = {
        details,
        schema: {
          ...schema,
          properties: newProperties
        }
      }
      setDataStructure(newDataStructure)
    }).catch(console.error)
  }, [ details, modalActions, schema, items, pathname ])

  const deleteHeaderAction = id => {
    const { title } = schema.properties[id]
    const content = (
      <DeleteHeaderForm
        closeModal={() => modalActions.close()}
        onSubmit={ headerDelete }
        {...{pathname, id, title}}
      />
    )
    modalActions.open(content)
  }

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
            permissions={ permissions }
            editHeaderAction={ editHeaderAction }
            deleteHeaderAction={ deleteHeaderAction }
          />
        ) : "" }
      </TableWrap>
      {/* <AddRow /> */}
    </Page>
  ) : ""
}

export default DataShow