import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { useAuth0 } from '@auth0/auth0-react'

import { Table, Button } from '../components'

import {
  AddItemForm,
  EditDetailsForm,
  DeletedItems,
  ManageFilters,
  Collaborators
} from '../components/modals'

import { useAPI, useModal } from '../customHooks'
import { getRange, getFilterFunctions, removeFilter, getFilterList } from '../utils'


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

const DataShow = ({ location: { pathname: datasetId }}) => {
  const [ {details, template}, setDataset ] = useState({})
  const [ items, setItems ] = useState()
  const [ hasDeleted, setHasDeleted ] = useState()
  const [ deleted, setDeleted ] = useState([])
  const [ filters, setFilters ] = useState({})
  const [ userRole, setUserRole ] = useState()
  const { user } = useAuth0()
  
  const api = useAPI()

  const [ getProjection, filterAndSortRows ] = useMemo(() => getFilterFunctions(filters || {}, template), [ filters, template ])

  useEffect(() => {
    const userId = user.sub.split("|")[1]
    api.get(`/data/${datasetId.slice(1)}`)
      .then(res => {
        const { dataset, items, template, hasDeleted } = res.data
        const { owner_id: owner, collaborator_ids: collaborators } = dataset
        const role = owner === userId ? "owner" : (collaborators || []).includes(userId) ? "collaborator" : "viewer"
        setDataset({ ...dataset, template })
        setItems(items)
        setHasDeleted(hasDeleted)
        setUserRole(role)
      }).catch(console.error)
    api.get(`/data/${datasetId.slice(1)}/deleted`)
      .then(res => {
        setDeleted(res.data.items)
      }).catch(error => {
        if (error.request.status !== 401) console.error(error)
      })
  },[ user, datasetId, api ])

  const tableHeaders = useMemo(() => {
    if (!template) return
    const columns = getProjection(template.properties)
    return Object.keys(columns).map(key => ({
      id: key,
      required: template.required.includes(key),
      ...template.properties[key]
    }))
  }, [template, getProjection])

  const tableItems = useMemo(() => {
    if (!tableHeaders || !items) return
    const itemArr = []
    filterAndSortRows(items)
      .forEach(item => {
        const rowArr = []
        tableHeaders.forEach(header => {
          rowArr.push(item.data_values[header.id])
        })
        itemArr.push(rowArr)
      })
    return itemArr
  }, [items, tableHeaders, filterAndSortRows])
  
  const modalActions = useModal({
    addItem: AddItemForm,
    editDetails: EditDetailsForm,
    viewDeleted: DeletedItems,
    manageFilters: ManageFilters,
    viewCollaborators: Collaborators
  })[1]
  
  const addItemAction = () => {
    const onSubmit = item => setItems([...items, item])
    const data = { onSubmit, template, datasetId }
    modalActions.open("addItem", data)
  }

  const editDetailsAction = (viewMode="edit") => {
    const onSubmit = edit => setDataset({ template, details: { ...details, ...edit }})
    const data = { onSubmit, datasetId, details, viewMode, userRole }
    modalActions.open("editDetails", data)
  }

  const viewDeleted = async () => {
    const onSubmit = recovered => {
      setItems([...items, ...recovered].sort((a, b) => a.created_on - b.created_on))
      setDeleted(deleted.filter(item => !recovered.includes(item)))
    }
    const data = { headers: tableHeaders, onSubmit, datasetId, deleted }
    modalActions.open("viewDeleted", data)
  }
  
  const viewCollaborators = async () => {
    const onSubmit = edit => {
      const newDetails = { ...details, ...edit }
      console.log(newDetails)
      setDataset({ template, details: newDetails })
    }
    const data = { collaborators: details.collaborators || [], onSubmit, datasetId }
    modalActions.open("viewCollaborators", data)
  }

  const manageFilters = () => {
    const onSubmit = newFilters => setFilters(newFilters)
    const data = { template, filters, onSubmit }
    modalActions.open("manageFilters", data)
  }

  const deleteRows = ([start, end]) => {
    const rows = getRange([start, end])
      .map(row => (items[row - 1] || {})._id)
      .filter(id => !!id)
    if (!rows.length) return
    api.post(`/data/${datasetId.slice(1)}/deleted`, { items: rows })
      .then(() => {
        if (!hasDeleted) setHasDeleted(true)
        const toDelete = items.filter(item => rows.includes(item._id))
        setDeleted([...deleted, ...toDelete.map(item => ({...item, deleted_on: Date.now()}))])
        setItems(items.filter(item => !toDelete.includes(item)))
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
    const { html, type, column } = filter
    
    const handleClick = () => setFilters(removeFilter(filters, type, column))
    return (
      <Flag onClick={ handleClick }><RemoveFlag>✕</RemoveFlag>{ html }</Flag>
    )
  }, [ filters ])

  const FilterBar = () => {
    return (
      <FilterContainer>
        <div>Filters</div>
        { getFilterList(filters, template).map((filter, i) => <FilterFlag key={ i } {...{ filter }} />) }
        <button className="add-filter" onClick={ manageFilters }><span>+</span> Add Filter</button>
      </FilterContainer>
    )
  }

  const ownerActions = userRole === "owner" ? [
    { label: "Edit Details", action: editDetailsAction },
    { label: "Edit Template", disabled: true },
    { label: "Collaborators", action: viewCollaborators },
  ] : []

  const restrictedActions = ["owner", "collaborator"].includes(userRole) ? [
    { label: "Add Item", action: addItemAction },
    { label: "Recover Deleted", action: viewDeleted, disabled: !hasDeleted },
  ] : []

  return details ? (
    <Page>
      <TitleBar title={ details.name } openDetails={ () => editDetailsAction("view") } />
      <ActionBar actions={[
        ...restrictedActions,
        ...ownerActions,
        { label: "Download", disabled: true },
        { label: "Share", disabled: true },
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