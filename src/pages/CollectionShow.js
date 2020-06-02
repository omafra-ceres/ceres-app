import React from 'react'
import Form from '@rjsf/core'
import styled from 'styled-components'
import axios from 'axios'

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;

  input, select {
    ${ p => p.hasError ? "border-color: red;" : "" }
    margin-bottom: 5px;
  }

  label {
    ${ p => p.hasError ? "color: red" : "" }
  }
`

const InputError = styled.div`
  color: red;
  font-size: 12px;
  font-weight: bold;
  margin-left: 10px;
  position: relative;

  &::before {
    content: "•";
    left: -10px;
    position: absolute;
  }
`

const InputContainer = ({ id, label, value, onChange, type="text", error, options }) => (
  <InputWrapper hasError={ !!error }>
    <label htmlFor={ id }>{ label }</label>
    {
      type === "select"
        ? <select {...{id, value, onChange, type}}>
            { options.map((op, i) => <option key={ i } value={op.value}>{ op.label }</option>) }
          </select>
        : <input {...{id, value, onChange, type}} />
    }
    { error ? <InputError>{ error }</InputError> : "" }
  </InputWrapper>
)

const ObjectFieldTemplate = ({ properties, title, idSchema: { $id: id }}) => {
  return (
    <div>
      <label htmlFor={id}>{title}</label>
      { properties.map(({ content: { props: { schema: { title, type }, onChange, errorSchema, idSchema: { $id: id }}}}) => {
        const handleChange = e => {
          const value = ["number", "integer"].includes(type) ? parseFloat(e.target.value) : e.target.value
          onChange(value, errorSchema)
        }
        // console.log("field: ", item)
        return (
          <InputContainer
            key={ id }
            id={ id }
            label={ title }
            // value={ formData[item.name] || "" }
            onChange={ handleChange }
            type={ type }
          />
        )
      }) }
    </div>
  )
}

const AddItem = ({ schema, handleSubmit }) => {
  const onSubmit = ({formData}) => {
    handleSubmit(formData)
  }
  return (
    <Form
      {...{ schema, ObjectFieldTemplate, onSubmit }}
      uiSchema={{ "ui:title": "Add Item" }}
    />
  )
}

const CollectionShow = ({ location: { pathname }}) => {
  const [schema, setSchema] = React.useState({})
  const [items, setItems] = React.useState([])

  React.useEffect(() => {
    axios.get(`http://localhost:4000/data/${pathname.slice(1)}`)
      .then(res => {
        setSchema(res.data.schema)
        setItems(res.data.items)
      })
      .catch(console.error)
  },[ pathname ])

  const handleSubmit = formData => {
    axios.post(`http://localhost:4000/data/${pathname.slice(1)}`, formData)
      .then(res => {
        setItems([...items, res.data.item])
      }).catch(console.error)
  }

  return (
    <div>
      This is a single collection

      <ul>
        { items.map(item => (
          <li key={item._id}>
            {JSON.stringify(item)}
          </li>
        ))}
      </ul>

      <AddItem {...{schema, handleSubmit}} />
    </div>
  )
}

export default CollectionShow