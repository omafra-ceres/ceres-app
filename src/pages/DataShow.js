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
  border-bottom: 1px solid #333;
  color: white;
  padding: 2px 4px;
  position: sticky;
  text-align: left;
  top: 0;
  white-space: nowrap;
  z-index: 1;

  &.deleted-on-header {
    padding-left: 10px;
    background: white;
    color: #333;
    left: 28px;
    z-index: 2;
  }

  &.empty-header {
    background: white;
    left: 0px;
    z-index: 2;
  }
`

const TD = styled.td`
  background: white;
  border: 1px solid #333;
  padding: 2px 4px;
  white-space: nowrap;

  &.sticky {
    border: none;
    left: 0px;
    position: sticky;
  }

  &.sticky-date {
    left: 28px;
    padding: 0 20px 0 10px;
    white-space: nowrap;
  }
`

const TR = styled.tr.attrs(props => ({
  style: { ...props.selected && { background: "#bbdfff" } }
}))`
  background: white;
`

const DeletedTableWrap = styled.div`
  max-height: 80vh;
  max-width: 80vw;
  overflow: auto;
`

const DeletedTable = styled.table`
  border-right: 1px solid #333;
  border-spacing: 0;
  border-collapse: collapse;
  table-layout: fixed;
`

const SelectAllLabel = styled.label`
  display: block;
  margin-top: 10px;
  padding: 5px 0;
  width: 152px;

  input {
    margin-right: 17px;
    margin-left: 8px;
  }
`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////

const AddItemForm = ({ template={}, datasetId, onSubmit, closeModal }) => {
  const [newItem, setNewItem] = useState({})
  const addItemFormEl = useRef()

  useEffect(() => () => setNewItem({}), [ closeModal ])

  useEffect(() => {
    if (!template.properties) return

    const booleanFields = Object.keys(template.properties)
      .filter(key => {
        return template.properties[key].type === "boolean"
      })
    setNewItem(booleanFields.reduce((obj, field) => ({...obj, [field]: false}), {}))
  }, [template.properties])

  useEffect(() => {
    addItemFormEl.current.formElement[0].focus()
  }, [ closeModal ])

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

  useEffect(() => () => setNewDetails({ name, description }), [ name, description, closeModal ])

  useEffect(() => {
    formEl.current.formElement[0].focus()
  }, [ closeModal ])

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

const ViewDeleted = ({ items, headers, recover, closeModal, datasetId }) => {
  const [selected, setSelected] = useState([])

  useEffect(() => () => setSelected([]), [ closeModal ])

  const toggleItemSelection = id => {
    const newSelected = selected.includes(id)
      ? selected.filter(itemId => itemId !== id)
      : [...selected, id]
    setSelected(newSelected)
  }

  const handleRecover = () => {
    axios.post(`${process.env.REACT_APP_API_URL}/data/${datasetId.slice(1)}/recover-deleted`, { items: selected })
    recover(items.filter(({ _id }) => selected.includes(_id)))
    closeModal()
  }
  
  const ItemCheck = ({ id }) => (
    <TD className="sticky">
      <input
        type="checkbox"
        checked={ selected.includes(id) }
        onChange={ () => toggleItemSelection(id) }
      />
    </TD>
  )
  const ItemDate = ({ date }) => (
    <TD className="sticky sticky-date">
      { new Date(date).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric'
      })}
    </TD>
  )
  const SelectAll = () => (
    <input
      type="checkbox"
      checked={ selected.length }
      onChange={ () => setSelected(selected.length ? [] : items.map(({_id}) => _id)) }
    />
  )
  return (
    <div>
      <DeletedTableWrap>
        <DeletedTable>
          <thead>
            <TR>
              <TH className="empty-header">
                <SelectAll />
              </TH>
              <TH className="deleted-on-header">Deleted On</TH>
              { headers.map(header => <TH key={ header.id }>{ header.title }</TH>) }
            </TR>
          </thead>
          <tbody>
            { items.map((item, rowIndex) => (
              <TR key={ rowIndex } selected={ selected.includes(item._id) }>
                <ItemCheck id={ item._id } />
                <ItemDate date={ item.deleted_on } />
                { headers.map(({ id }, colIndex) => <TD key={ `${rowIndex}/${colIndex}` }>{ JSON.stringify(item.data_values[id]) }</TD>) }
              </TR>
            ))}
          </tbody>
        </DeletedTable>
      </DeletedTableWrap>
      {/* <SelectAll /> */}
      <FormToolbar>
        <Button buttonType="fill" onClick={ handleRecover }>Recover { selected.length } items</Button>
        <Button buttonType="text" onClick={ closeModal }>Cancel</Button>
      </FormToolbar>
    </div>
  )
}

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
      closeModal: () => modalActions.close(),
      items: deleted.data.items,
      headers: tableHeaders,
      recover: recovered => setItems([...items, ...recovered].sort((a, b) => a.created_on - b.created_on)),
      datasetId
    })
  }

  const deleteRows = ([start, end]) => {
    const rows = getRange([start, end]).map(row => items[row - 1]._id)
    axios.post(`${process.env.REACT_APP_API_URL}/data/${datasetId.slice(1)}/delete-items`, { items: rows })
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