import React from 'react'
import axios from 'axios'

const CollectionShow = ({ location: { pathname }}) => {
  const [schema, setSchema] = React.useState([])
  const [data, setData] = React.useState([])

  React.useEffect(() => {
    axios.get(`http://localhost:4000/data/${pathname.slice(1)}`)
      .then(res => setData(res.data))
      .catch(console.error)
  },[ pathname ])

  return (
    <div>
      This is a single collection

      <ul>
        { data.map(item => (
          <li key={item._id}>
            {JSON.stringify(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default CollectionShow