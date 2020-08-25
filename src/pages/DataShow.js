import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import Table from '../components/Table'
import Form from '../components/CustomForm'
import Button from '../components/Button'

import useModal from '../customHooks/useModal'
import { getRange } from '../utils'


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

    &:hover:not(:disabled) {
      background: #efefef;
    }
  }
`

const TH = styled.th`
  background: #333;
  color: white;
  padding: 2px 4px;
`

const TD = styled.td`
  border: 1px solid #333;
  padding: 2px 4px;
`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////

const AddItemForm = ({ template={}, datasetId, onSubmit, closeModal }) => {
  const [newItem, setNewItem] = useState({})
  const addItemFormEl = useRef()

  useEffect(() => {
    if (!template.properties) return

    const booleanFields = Object.keys(template.properties)
      .filter(key => {
        return template.properties[key].type === "boolean"
      })
    setNewItem(booleanFields.reduce((obj, field) => ({...obj, [field]: false}), {}))
    addItemFormEl.current.formElement[0].focus()
  }, [template.properties])

  const handleSubmit = ({formData}) => {
    axios.post(`${process.env.REACT_APP_API_URL}/data/${datasetId.slice(1)}/addItem`, formData)
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
      schema={ template }
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

const EditDetailsForm = ({ datasetId, onSubmit, closeModal, details }) => {
  const { name, description } = details
  const [newDetails, setNewDetails] = useState({name, description})
  const formEl = useRef()

  useEffect(() => {
    formEl.current.formElement[0].focus()
  }, [])

  const handleSubmit = ({formData}) => {
    axios.post(`${process.env.REACT_APP_API_URL}/data/${datasetId.slice(1)}/update`, formData)
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

const ViewDeleted = ({ items, headers }) => (
  <div>
    <table>
      <thead>
        <tr>
          { headers.map(header => <TH>{ header.title }</TH>) }
          <th>Deleted On</th>
        </tr>
      </thead>
      <tbody>
        { items.map(item => (
          <tr>
            { headers.map(({ id }) => <TD>{ item.data_values[id] }</TD>) }
            <td>{ new Date(item.deleted_on).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric'
            }) }</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const DataShow = ({ location: { pathname: datasetId }}) => {
  const [{details, template}, setDataset] = useState({})
  const [items, setItems] = useState()
  const [hasDeleted, setHasDeleted] = useState()

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/data/${datasetId.slice(1)}`)
      .then(res => {
        const { details, items, template, hasDeleted } = res.data
        setDataset({ details, template })
        setItems(items)
        setHasDeleted(hasDeleted)
      }).catch(console.error)
  },[ datasetId ])

  const tableHeaders = useMemo(() => {
    if (!template) return
    const keys = Object.keys(template.properties)
    return keys.map(key => ({
      id: key,
      required: template.required.includes(key),
      ...template.properties[key]
    }))
  }, [template])

  const tableItems = useMemo(() => {
    if (!tableHeaders || !items) return
    const itemArr = []
    items.forEach(item => {
      const rowArr = []
      tableHeaders.forEach(header => {
        rowArr.push(item.data_values[header.id])
      })
      itemArr.push(rowArr)
    })
    return itemArr
  }, [items, tableHeaders])
  
  const modalActions = useModal({
    addItem: AddItemForm,
    editDetails: EditDetailsForm,
    viewDeleted: ViewDeleted
  })[1]
  
  const itemSubmit = useCallback((newItem) => {
    setItems([...items, newItem])
    modalActions.close()
  }, [ items, setItems, modalActions ])

  const addItemAction = () => {
    const data = {
      closeModal: () => modalActions.close(),
      onSubmit: itemSubmit,
      template,
      datasetId
    }
    modalActions.open("addItem", data)
  }

  const detailsSubmit = useCallback((newDetails) => {
    modalActions.close()
    setDataset({
      template,
      details: {
        ...details,
        ...newDetails
      }
    })
  }, [details, modalActions, template])
  
  const editDetailsAction = () => {
    const data = {
      closeModal: () => modalActions.close(),
      onSubmit: detailsSubmit,
      datasetId,
      details
    }
    modalActions.open("editDetails", data)
  }

  const viewDeleted = async () => {
    const deleted = await axios.get(`${process.env.REACT_APP_API_URL}/data/${datasetId.slice(1)}/deleted`)
      .catch(console.error)
    modalActions.open("viewDeleted", {
      items: deleted.data.items,
      headers: tableHeaders
    })
  }

  const deleteRows = ([start, end]) => {
    const rows = getRange([start, end]).map(row => items[row - 1]._id)
    axios.post(`${process.env.REACT_APP_API_URL}/data/delete-items`, { items: rows })
      .then(() => {
        if (!hasDeleted) setHasDeleted(true)
        setItems(items.filter(item => !rows.includes(item._id)))
      }).catch(console.error)
  }

  const ActionBar = ({ actions }) => (
    <ActionContainer>
      { actions.map((action, i) => (
        <button
          key={ i }
          onClick={ action.action }
          disabled={ action.disabled }
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
        { label: "Edit Details", action: editDetailsAction },
        { label: "Edit Template", disabled: true },
        { label: "Recover Deleted", action: viewDeleted, disabled: !hasDeleted },
      ]} />
      { tableHeaders && tableItems ? (
        <Table
          headers={ tableHeaders }
          items={ tableItems }
          deleteRows={ deleteRows }
          style={{
            borderTop: "2px solid #ddd",
            flexGrow: "1",
            maxWidth: "100%",
          }}
        />
      ) : "" }
    </Page>
  ) : ""
}

export default DataShow