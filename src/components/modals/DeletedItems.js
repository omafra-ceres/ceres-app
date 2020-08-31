import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import Button from '../Button'

import useAPI from '../../customHooks/useAPI'
import useModal from '../../customHooks/useModal'

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

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 30px;
`

const DeletedItems = ({ headers, onSubmit, datasetId }) => {
  const [items, setItems] = useState([])
  const [selected, setSelected] = useState([])
  const { close } = useModal()[1]
  const api = useAPI()

  useEffect(() => () => setSelected([]), [ onSubmit ])

  useEffect(() => {
    const url = `/data/${datasetId.slice(1)}/deleted`
    const getDeleted = async () => {
      const res = await api.get(url)
      setItems(res.data.items)
    }
    getDeleted()
  }, [ datasetId ])

  const toggleItemSelection = id => {
    const newSelected = selected.includes(id)
      ? selected.filter(itemId => itemId !== id)
      : [...selected, id]
    setSelected(newSelected)
  }

  const handleRecover = () => {
    api.post(`/data/${datasetId.slice(1)}/recover-deleted`, { items: selected })
    onSubmit(items.filter(({ _id }) => selected.includes(_id)))
    close()
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
      <FormToolbar>
        <Button buttonType="fill" onClick={ handleRecover }>Recover { selected.length } items</Button>
        <Button buttonType="text" onClick={ close }>Cancel</Button>
      </FormToolbar>
    </div>
  )
}

export default DeletedItems