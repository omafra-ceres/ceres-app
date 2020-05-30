import React from 'react'
import styled from 'styled-components'
import axios from 'axios'

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 500px;

  label {
    color: #444;
    font-size: 12px;
    font-weight: bold;
    text-transform: uppercase;
  }

  input {
    border: 1px solid gray;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    height: 30px;
    margin: 5px 0;
    max-width: 200px;
    padding: 5px 10px;
  }

  select {
    border: 1px solid gray;
    border-radius: 4px;
    box-sizing: border-box;
    font-size: 16px;
    height: 30px;
    margin: 5px 0 20px;
    max-width: 200px;
  }

  button {
    background: white;
    border: 1px solid ${ p => p.theme.blue };
    border-radius: 4px;
    box-shadow: 0px 2px 2px #8884;
    box-sizing: border-box;
    color: ${ p => p.theme.blue };
    font-size: 12px;
    font-weight: bold;
    margin: 5px 0;
    padding: 5px;
    text-transform: uppercase;
    width: 100px;

    &[type="submit"] {
      background: ${ p => p.theme.blue };
      color: white;
    }

    &.removefield {
      border: none;
      box-shadow: none;
      color: gray;
      font-size: 28px;
      font-weight: lighter;
      grid-row: 2;
      height: 30px;
      line-height: 0;
      width: 30px;
    }
  }
`

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

const FieldContainer = styled.div`
  border-left: 1px solid gray;
  display: flex;
  flex-direction: row;
  margin: 5px 0 10px;
  padding-left: 15px;

  > *:not(:first-child) {
    margin-left: 20px;
  }

  input[type="checkbox"] {
    height: 30px;
    align-self: center;
    width: 30px;
    position: relative;

    &::after {
      background: white;
      border: 1px solid gray;
      border-radius: 4px;
      bottom: 0;
      content: "";
      font-size: 20px;
      left: 0;
      line-height: 27px;
      pointer-events: none;
      position: absolute;
      right: 0;
      text-align: center;
      top: 0;
    }

    &[value="true"]::after {
      content: "✓";
    }
  }

  ${InputWrapper} {
    margin-bottom: 0;
  }

  button.removefield {
    align-self: flex-end;
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

const FieldInput = ({ field, fieldActions, index }) => {
  const handleUpdate = {
    name: e => fieldActions.update(index, "name", e.target.value),
    type: e => fieldActions.update(index, "type", e.target.value),
    required: e => fieldActions.update(index, "required", e.target.checked),
  }

  return (
    <FieldContainer>
      <InputContainer
        id={ `field-${index}-name` }
        label="Field Name"
        value={ field.name }
        onChange={ handleUpdate.name }
        error={ field.error }
      />
      <InputContainer
        id={ `field-${index}-type` }
        label="Field Type"
        value={ field.type }
        onChange={ handleUpdate.type }
        type="select"
        options={[
          { value: "string", label: "Text" },
          { value: "number", label: "Number" },
          { value: "integer", label: "Integer" },
          { value: "boolean", label: "True/False" },
        ]}
      />
      <InputContainer
        id={ `field-${index}-required` }
        label="Required"
        value={ field.required }
        onChange={ handleUpdate.required }
        type="checkbox"
      />
      <button type="button" className="removefield" onClick={ (e) => fieldActions.remove(e, index) }>✕</button>
    </FieldContainer>
  )
}

const generateSchema = (title, properties) => {
  const schemaObject = {
    title,
    type: "object",
    required: [],
    properties: {}
  }

  properties.forEach(prop => {
    if (prop.required) schemaObject.required.push(prop.name)
    schemaObject.properties[prop.name] = {
      title: prop.name,
      type: prop.type
    }
  })

  return schemaObject
}

const CollectionCreate = () => {
  const [collectionName, setCollectionName] = React.useState("")
  const [collectionFields, setCollectionFields] = React.useState([{ name: "field 0", type: "string", required: false }])
  const [nameError, setNameError] = React.useState(null)

  const validate = () => {
    var isValid = true
    
    const isNameError = collectionName.length < 1
    if (isNameError) isValid = false
    setNameError(collectionName.length < 1 ? "Your collection must have a name" : null)
    
    const newFields = collectionFields.map((field, index) => {
      const fieldError = field.name.length < 1 
      const newField = {
        ...field,
        error: fieldError
          ? "Your field must have a name"
          : null
      }
      if (fieldError) isValid = false
      return newField
    })
    setCollectionFields(newFields)
    return isValid
  }

  const handleSubmit = event => {
    event.preventDefault()
    const isValid = validate()
    // console.log(isValid ? "submit" : "error")
    if (isValid) {
      const schema = generateSchema(collectionName, collectionFields)
      axios.post(`http://localhost:4000/data/create`, { schema })
        .then(res => console.log(res))
        .catch(err => console.error(err))
    }
  }

  const handleName = React.useCallback(event => {
    if (nameError && event.target.value.length > 0) setNameError(null)
    setCollectionName(event.target.value)
  }, [ nameError ])

  const newFieldName = React.useCallback(() => {
    const defaultFields = collectionFields
      .filter(field => /^field\s\d+$/.test(field.name))
      .sort((a, b) => b.name.slice(5) - a.name.slice(5))
    const largestField = defaultFields.length > 0
      ? defaultFields[0].name.slice(5)
      : -1
    return `field ${largestField >= defaultFields.length ? Number.parseInt(largestField) + 1 : defaultFields.length}`
  }, [ collectionFields ])

  const addField = () => {
    setCollectionFields([...collectionFields, {name: newFieldName(), type: "string"}])
  }

  const updateField = (index, type, value) => {
    const newFields = [...collectionFields]
    newFields[index][type] = value
    setCollectionFields(newFields)
  }

  const removeField = (e, index) => {
    e.preventDefault()
    const newFields = [...collectionFields]
    newFields.splice(index, 1)
    setCollectionFields(newFields)
  }

  const fieldActions = {
    add: addField,
    update: updateField,
    remove: removeField
  }

  return (
    <div>
      <StyledForm
        onSubmit={ handleSubmit }
      >
        {/* <label htmlFor="collection-title">Collection Title</label>
        <input
          id="collection-name"
          value={ collectionName }
          onChange={ e => setCollectionName(e.target.value) }
        /> */}
        <InputContainer
          id="collection-title"
          label="Collection Title"
          value={ collectionName }
          onChange={ handleName }
          error={ nameError }
        />
        <label>Fields</label>
        {
          collectionFields.map((field, index) => (
            <FieldInput
              { ...{ field, fieldActions, index }}
              key={ `field-${index}` }
            />
          ))
        }
        <button type="button" onClick={ fieldActions.add }>Add Field</button>
        <button type="submit">Create</button>
      </StyledForm>
    </div>
  )
}

export default CollectionCreate