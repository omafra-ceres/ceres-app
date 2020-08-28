import React, { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import Table from '../components/Table'
import Form from '../components/CustomForm'
import Button from '../components/Button'

import useModal from '../customHooks/useModal'
import { getRange, placeholderIfNull } from '../utils'


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
`

const TitleBarContainer = styled.div`
  display: flex;
  padding: 10px 25px 0;

  > h1 {
    font-size: ${ p => p.theme.headerSize };
    margin: 0;
  }

  > ${Button} {
    text-decoration: underline;

    &:focus, &:hover {
      border: none;
      box-shadow: none;
      color: #2684ff;
    }
  }
`

const StyledForm = styled(Form)`
  min-width: 400px;

  input, textarea {
    margin-top: 0;
  }

  input:read-only, textarea:read-only {
    border: none;
    cursor: default;
    font: inherit;
    height: auto;
    padding-left: 0;
    resize: none;

    &:focus {
      box-shadow: none;
    }
  }
`

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 30px;
`

const ActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  padding: 0 10px;

  & + & {
    border-top: 2px solid #ddd;
  }

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

const FilterContainer = styled(ActionContainer)`
  align-items: center;
  font-size: 13.33px;
  padding: 5px 15px 5px 26px;

  > :first-child {
    box-shadow: 2px 0 2px -1px #ddd;
    line-height: 20px;
    margin-right: 20px;
    padding-right: 10px;
  }
  
  > button {
    align-items: center;
    border: 1px solid transparent;
    border-radius: 4px;
    color: #333;
    display: flex;
    height: 22px;
    overflow: hidden;
    padding: 0 5px;
  
    > span {
      font-size: 20px;
      margin-right: 10px;
    }
  }
`

const Flag = styled.div`
  align-items: center;
  background: #eee;
  border: 1px solid #aaa;
  border-radius: 4px;
  color: #333;
  cursor: default;
  display: flex;
  font-size: 12px;
  height: 22px;
  margin-right: 10px;
  padding: 0 5px 0 0;

  &:hover, &:focus-within {
    border-color: #333;
  }
`

const RemoveFlag = styled.button`
  border: none;
  border-right: 1px solid transparent;
  border-top-left-radius: 3px;
  border-bottom-left-radius: 3px;
  color: inherit;
  height: 20px;
  margin-right: 5px;

  *:hover > &, &:hover, &:focus {
    border-color: inherit;
    font-weight: bold;
    outline: none;
  }

  &:active, *:active > & {
    background: #ddd;
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

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////


const TitleBar = ({ title, openDetails }) => {
  return (
    <TitleBarContainer>
      <h1>{ title }</h1>
      <Button
        buttonType="text"
        onClick={ openDetails }
      >
        view details
      </Button>
    </TitleBarContainer>
  )
}

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

const getFormData = details => ({
  ...details,
  created_at: new Date(details.created_at).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  })
})

const EditDetailsForm = ({ datasetId, onSubmit, closeModal, details, viewMode }) => {
  const [ mode, setMode ] = useState(viewMode)
  const [newDetails, setNewDetails] = useState(details)
  const formEl = useRef()

  useLayoutEffect(() => {
    setMode(viewMode)
    return () => setMode(viewMode)
  }, [ viewMode, closeModal ])

  useEffect(() => {
    setNewDetails(details)
    return () => {
      setNewDetails(details)
    }
  }, [ details, closeModal ])

  useEffect(() => {
    formEl.current.formElement[0].focus()
  }, [ closeModal ])

  const handleSubmit = ({ formData: { name, description }}) => {
    if (mode === "view") {
      setMode("edit")
    } else if (mode === "edit") {
      axios.post(`${process.env.REACT_APP_API_URL}/data/${datasetId.slice(1)}/update`, { name, description })
        .then(() => {
          onSubmit(newDetails)
        }).catch(console.error)
    }
  }

  const handleChange = ({ formData: { name, description }}) => {
    setNewDetails({ ...newDetails, name, description })
  }

  return (
    <StyledForm
      formData={ getFormData(newDetails) }
      schema={{
        type: "object",
        required: ["name", "description", "created_at"],
        properties: {
          created_at: {
            title: "Created on",
            type: "string",
            readOnly: true
          },
          name: {
            title: "Name",
            type: "string"
          },
          description: {
            title: "Description",
            type: "string"
          }
        }
      }}
      uiSchema={{
        "ui:title": mode === "view" ? "Details" : "Edit Details",
        name: {
          "ui:readonly": mode === "view"
        },
        description: {
          "ui:widget": "textarea",
          "ui:readonly": mode === "view"
        }
      }}
      onSubmit={ handleSubmit }
      onChange={ handleChange }
      ref={ formEl }
    >
      <FormToolbar>
        <Button buttonType="fill" type="submit">{ mode === "view" ? "Edit" : "Submit" }</Button>
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
      }) }
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

const demoFilters = [
  ["e732b6cd-2443-4f4a-bced-00727c68ca3f", -1],
  ["c390ea58-971d-4b54-9101-576fdb32be47", "> 0"],
  ["5656902a-3ab5-4304-a1e1-429bdc1cac82", "= true"]
]

const filterOperators = {
  "=": check => val => placeholderIfNull(val).toString() === check,
  ">": check => val => (placeholderIfNull(val, 1) * 1) > check,
  "<": check => val => (placeholderIfNull(val, 1) * 1) < check
}

const getFilterFunction = filtersArray => {
  const includes = []
  const excludes = []
  const query = {}
  filtersArray.forEach(filter => {
    const [col, val] = filter
    if ([1, -1].includes(val)) {
      (val === 1 ? includes : excludes).push(col)
    } else {
      const operator = val[0]
      const check = val.slice(2)
      query[col] = filterOperators[operator](check)
    }
  })

  const checkCol = col => {
    const checkIncludes = !includes.length || includes.includes(col)
    const checkExcludes = !excludes.length || !excludes.includes(col)
    return checkIncludes && checkExcludes
  }
  
  const checkRow = row => {
    const cols = Object.keys(query)
    const checkQuery = cols.map(col => query[col](row[col])).every(check => !!check)
    return checkQuery
  }
  return [ checkCol, checkRow ]
}

const DataShow = ({ location: { pathname: datasetId }}) => {
  const [ {details, template}, setDataset ] = useState({})
  const [ items, setItems ] = useState()
  const [ hasDeleted, setHasDeleted ] = useState()
  const [ filters, setFilters ] = useState(demoFilters)

  const [ filterCol, filterRow ] = useMemo(() => getFilterFunction(filters), [ filters ])

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
    const keys = Object.keys(template.properties).filter(filterCol)
    return keys.map(key => ({
      id: key,
      required: template.required.includes(key),
      ...template.properties[key]
    }))
  }, [template, filterCol])

  const tableItems = useMemo(() => {
    if (!tableHeaders || !items) return
    const itemArr = []
    items.filter(item => filterRow(item.data_values)).forEach(item => {
      const rowArr = []
      tableHeaders.forEach(header => {
        rowArr.push(item.data_values[header.id])
      })
      itemArr.push(rowArr)
    })
    return itemArr
  }, [items, tableHeaders, filterRow])
  
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
  
  const editDetailsAction = (viewMode="edit") => {
    const data = {
      closeModal: () => modalActions.close(),
      onSubmit: detailsSubmit,
      datasetId,
      details,
      viewMode
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
    const rows = getRange([start, end])
      .map(row => (items[row - 1] || {})._id)
      .filter(id => !!id)
    if (!rows.length) return
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

  const FilterFlag = useCallback(({ filter }) => {
    const [ col, val ] = filter
    const { title } = template.properties[col] || {}

    if (!title) return ""
    
    let filterString = [1, -1].includes(val)
      ? `${val === 1 ? "Show" : "Hide"} '${title}'`
      : `'${title}' ${val}`
    
    const handleClick = () => setFilters(filters.filter(f => f !== filter))
    return (
      <Flag onClick={ handleClick }><RemoveFlag>✕</RemoveFlag>{ filterString }</Flag>
    )
  }, [ template, filters ])

  const FilterBar = () => {
    return (
      <FilterContainer>
        <div>Filters</div>
        { filters.map((filter, i) => <FilterFlag key={ i } {...{ filter }} />) }
        <button className="add-filter"><span>+</span> Add Filter</button>
      </FilterContainer>
    )
  }

  return details ? (
    <Page>
      <TitleBar title={ details.name } openDetails={ () => editDetailsAction("view") } />
      <ActionBar actions={[
        { label: "Add Item", action: addItemAction },
        { label: "Edit Details", action: editDetailsAction },
        { label: "Edit Template", disabled: true },
        { label: "Recover Deleted", action: viewDeleted, disabled: !hasDeleted },
      ]} />
      <FilterBar />
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