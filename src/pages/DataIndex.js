import React, { useState, useEffect } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { Select } from '../components/InputContainer'

const CreateDataStructureLink = styled(Link)`
  background: ${ p => p.theme.blue };
  border-radius: 4px;
  box-sizing: border-box;
  color: white;
  display: inline-block;
  padding: 10px 15px;
  text-decoration: none;
`

const DeleteDataStructureButton = styled.button`
  background: none;
  border: none;
  color: red;
  font-size: 14px;
  font-weight: bold;
  padding: 10px;
  width: 75px;

  &:hover {
    text-decoration: underline;
    text-underline-position: under;
  }
`

const DataStructureListContainer = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const DataStructureListItem = styled.li`
  &:not(:first-child) {
    margin-top: 10px;
  }

  a {
    align-items: center;
    border: 1px solid #aaa;
    border-radius: 1px;
    color: ${p => p.theme.text};
    display: grid;
    grid-template-columns: auto 300px 150px 100px;
    padding: 10px 20px;
    position: relative;
    text-decoration: none;

    &::after {
      box-shadow: 0 5px 5px -3px #0008;
      bottom: -1px;
      content: "";
      opacity: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 0;
      transition: opacity 0.1s;
      width: 100%;
    }
  }

  &:hover a{
    border-color: #666;
    
    &::after {
      opacity: 1;
    }
  }
`

const Page = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 25px;

  h1 {
    font-size: ${ p => p.theme.headerSize };
    margin-bottom: 0;
  }

  ul {
    margin: 25px 0;
  }
`

const ListHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`

const StatusSelect = styled(Select)`
  align-self: flex-end;
  width: 200px;
`

const PlaceholderLiContainer = styled.div`
  &:not(:first-child) {
    margin-top: 10px;
  }

  align-items: center;
  background: #efefef;
  display: flex;
  height: 58px;
  padding: 10px 20px;

  div {
    background: #ddd;
    height: 18px;
  }
`

const PlaceholderLi = () => (
  <PlaceholderLiContainer>
    <div style={{ width: 100 + Math.ceil(Math.random() * 300) }} />
  </PlaceholderLiContainer>
)

const statuses = {
  draft: { value: "draft", label: "Draft" },
  published: { value: "published", label: "Published" },
  archived: { value: "archived", label: "Archived" }
}

const statusStructures = {}

const DataIndex = () => {
  const [dataStructures, setDataStructures] = useState([])
  const [status, setStatus] = useState("published")

  useEffect(() => {
    setDataStructures(statusStructures[status] || [])
    axios.get(`http://localhost:4000/data/?status=${status}`)
      .then(res => {
        setDataStructures(res.data)
      })
      .catch(console.error)
  },[ status ])

  const handleDelete = (e, dataStructure) => {
    e.preventDefault()
    axios.post("http://localhost:4000/data/delete", dataStructure)
      .then(res => setDataStructures(res.data))
      .catch(console.error)
  }

  const handleStatusSelect = ({ value }) => {
    statusStructures[status] = dataStructures
    setStatus(value)
  }

  return (
    <Page>
      <ListHeader>
        <h1>Datasets</h1>
        <StatusSelect
          value={ statuses[status] }
          isSearchable={ false }
          onChange={ handleStatusSelect }
          options={[
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
            { value: "draft", label: "Drafts", isDisabled: true }
          ]}
        />
      </ListHeader>
      <DataStructureListContainer>
        { dataStructures.length ? dataStructures.map(data => {
          const created = new Date(data.created_at).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
          })
          return (
            <DataStructureListItem key={data.path}>
              <Link to={`/${data.path}`}>
                <span>{ data.name }</span>
                <span>{ created }</span>
                <span>{ data.status }</span>
                <DeleteDataStructureButton onClick={(e) => handleDelete(e, data)}>Delete</DeleteDataStructureButton>
              </Link>
            </DataStructureListItem>
          )
        }) : Array(5).fill(<PlaceholderLi />) }
      </DataStructureListContainer>
      <CreateDataStructureLink to="/create">Create Data Structure</CreateDataStructureLink>
    </Page>
  )
}

export default DataIndex