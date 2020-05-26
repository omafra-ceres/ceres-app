import React from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const CollectionIndex = () => {
  const [collections, setCollections] = React.useState([])

  React.useEffect(() => {
    axios.get("http://localhost:4000/data/")
      .then(res => setCollections(res.data))
      .catch(console.error)
  },[])

  return (
    <div>
      This is the collection index

      <ul>
        { collections.map(col => (
          <li key={col}>
            <Link to={`/${col}`}>
              {col}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CollectionIndex