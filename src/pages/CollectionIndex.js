import React from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const CollectionList = styled.div`
  h1 {
    font-size: ${ p => p.theme.headerSize };
  }

  ul {
    margin: 25px 0;
  }
`

const CreateCollectionLink = styled(Link)`
  background: ${ p => p.theme.blue };
  border-radius: 4px;
  box-sizing: border-box;
  color: white;
  display: inline-block;
  padding: 10px 15px;
  text-decoration: none;
`

const DeleteCollectionButton = styled.button`
  border: none;
  background: none;
  color: red;
  font-size: 12px;
  font-weight: bold;
  margin-left: 25px;
`

const CollectionIndex = () => {
  const [collections, setCollections] = React.useState([])

  React.useEffect(() => {
    axios.get("http://localhost:4000/data/")
      .then(res => setCollections(res.data))
      .catch(console.error)
  },[])

  const handleDelete = collection => {
    axios.post("http://localhost:4000/data/delete", { collection })
      .then(res => setCollections(res.data))
      .catch(console.error)
  }

  return (
    <CollectionList>
      <h1>Collections</h1>
      <ul>
        { collections.map(col => (
          <li key={col}>
            <Link to={`/${col}`}>
              {col}
            </Link>
            <DeleteCollectionButton onClick={() => handleDelete(col)}>Delete</DeleteCollectionButton>
          </li>
        ))}
      </ul>
      <CreateCollectionLink to="/create">+ Add Collection</CreateCollectionLink>
    </CollectionList>
  )
}

export default CollectionIndex