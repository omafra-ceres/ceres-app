import React, { useState, useEffect, useCallback, useMemo } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import Table from '../components/Table'
import Button from '../components/Button'
import { AddItemForm, EditDetailsForm, DeletedItems, ManageFilters } from '../components/modals'

import useModal from '../customHooks/useModal'
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
  const [ filters, setFilters ] = useState({})

  const [ getProjection, filterAndSortRows ] = useMemo(() => getFilterFunctions(filters || {}, template), [ filters, template ])

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
    manageFilters: ManageFilters
  })[1]
  
  const addItemAction = () => {
    const onSubmit = item => setItems([...items, item])
    const data = { onSubmit, template, datasetId }
    modalActions.open("addItem", data)
  }

  const editDetailsAction = (viewMode="edit") => {
    const onSubmit = edit => setDataset({ template, details: { ...details, ...edit }})
    const data = { onSubmit, datasetId, details, viewMode }
    modalActions.open("editDetails", data)
  }

  const viewDeleted = async () => {
    const onSubmit = recovered => setItems([...items, ...recovered].sort((a, b) => a.created_on - b.created_on))
    const data = { headers: tableHeaders, onSubmit, datasetId }
    modalActions.open("viewDeleted", data)
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