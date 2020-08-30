import React, { useState, useEffect, useRef } from 'react'
import styled from 'styled-components'
import axios from 'axios'

import Form from '../CustomForm'
import Button from '../Button'

import useModal from '../../customHooks/useModal'

const StyledForm = styled(Form)`
  min-width: 400px;

  input, textarea {
    margin-top: 0;
  }

  input:read-only, textarea:read-only {
    border: none;
    cursor: default;
    font: inherit;
    height: auto;
    padding-left: 0;
    resize: none;

    &:focus {
      box-shadow: none;
    }
  }
`

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 30px;
`

const AddItemForm = ({ template={}, datasetId, onSubmit=(() => {}) }) => {
  const [newItem, setNewItem] = useState({})
  const addItemFormEl = useRef()

  const { close } = useModal()[1]

  useEffect(() => () => setNewItem({}), [ close ])

  useEffect(() => {
    if (!template.properties) return

    const booleanFields = Object.keys(template.properties)
      .filter(key => {
        return template.properties[key].type === "boolean"
      })
    setNewItem(booleanFields.reduce((obj, field) => ({...obj, [field]: false}), {}))
  }, [template.properties])

  useEffect(() => {
    addItemFormEl.current.formElement[0].focus()
  }, [ close ])

  const handleSubmit = ({formData}) => {
    axios.post(`${process.env.REACT_APP_API_URL}/data/${datasetId.slice(1)}/addItem`, formData)
      .then(res => {
        onSubmit(res.data.item)
        close()
      }).catch(console.error)
  }

  const handleChange = ({formData}) => {
    setNewItem(formData)
  }

  return (
    <StyledForm
      formData={ newItem }
      schema={ template }
      onSubmit={ handleSubmit }
      onChange={ handleChange }
      uiSchema={{ "ui:title": "Add Item" }}
      ref={ addItemFormEl }
    >
      <FormToolbar>
        <Button buttonType="fill" type="submit">Submit</Button>
        <Button buttonType="text" onClick={ close }>Cancel</Button>
      </FormToolbar>
    </StyledForm>
  )
}

export default AddItemForm