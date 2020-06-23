import React from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

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

  h1 {
    font-size: ${ p => p.theme.headerSize };
  }

  ul {
    margin: 25px 0;
  }
`

const CollectionIndex = () => {
  const [dataStructures, setDataStructures] = React.useState([])

  React.useEffect(() => {
    axios.get("http://localhost:4000/data/")
      .then(res => {
        console.log(res.data)
        setDataStructures(res.data)
      })
      .catch(console.error)
  },[])

  const handleDelete = (e, dataStructure) => {
    e.preventDefault()
    axios.post("http://localhost:4000/data/delete", dataStructure)
      .then(res => setDataStructures(res.data))
      .catch(console.error)
  }

  return (
    <Page>
      <h1>Datasets</h1>
      <DataStructureListContainer>
        { dataStructures.map(data => {
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
        })}
      </DataStructureListContainer>
      <CreateDataStructureLink to="/create">Create Data Structure</CreateDataStructureLink>
    </Page>
  )
}

export default CollectionIndex