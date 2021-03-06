import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'

import Form from '../CustomForm'
import Button from '../Button'

import { useAPI, useModal } from '../../customHooks'

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

  &.hidden {
    display: none;
  }
`

const getFormData = details => ({
  ...details,
  created_at: new Date(details.created_at).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  })
})

const EditDetailsForm = ({ datasetId, onSubmit=(() => {}), details, viewMode, userRole }) => {
  const [ mode, setMode ] = useState(viewMode)
  const [newDetails, setNewDetails] = useState(details)
  const formEl = useRef()
  const api = useAPI()

  const { close } = useModal()[1]

  useLayoutEffect(() => {
    setMode(viewMode)
    return () => setMode(viewMode)
  }, [ viewMode, onSubmit ])

  useEffect(() => {
    setNewDetails(details)
    return () => {
      setNewDetails(details)
    }
  }, [ details, onSubmit ])

  useEffect(() => {
    [].filter.call(formEl.current.formElement, el => !el.hasAttribute("readonly"))[0].focus()
  }, [ onSubmit ])

  const handleSubmit = ({ formData: { name, description }}) => {
    if (mode === "view") {
      setMode("edit")
    } else if (mode === "edit") {
      const update = { details: { name, description }}
      api.put(`/data/${datasetId.slice(1)}`, update)
        .then(() => {
          onSubmit(newDetails)
          close()
        }).catch(console.error)
    }
  }

  const handleChange = ({ formData: { name, description }}) => {
    setNewDetails({ ...newDetails, name, description })
  }

  return (
    <StyledForm
      formData={ getFormData(newDetails) }
      schema={{
        type: "object",
        required: ["name", "created_at"],
        properties: {
          owner: {
            title: "",
            type: "object",
            required: ["email"],
            properties: {
              email: {
                title: "Dataset owner",
                type: "string",
                readOnly: true
              }
            }
          },
          created_at: {
            title: "Created on",
            type: "string",
            readOnly: true
          },
          name: {
            title: "Name",
            type: "string"
          },
          description: {
            title: "Description",
            type: "string"
          }
        }
      }}
      uiSchema={{
        "ui:title": mode === "view" ? "Details" : "Edit Details",
        name: {
          "ui:readonly": mode === "view"
        },
        description: {
          "ui:widget": "textarea",
          "ui:readonly": mode === "view"
        }
      }}
      onSubmit={ handleSubmit }
      onChange={ handleChange }
      ref={ formEl }
    >
      <FormToolbar className={ userRole === "viewer" ? "hidden" : "" }>
        <Button buttonType="fill" type="submit">{ mode === "view" ? "Edit" : "Submit" }</Button>
        <Button buttonType="text" onClick={ close }>Cancel</Button>
      </FormToolbar>
    </StyledForm>
  )
}

export default EditDetailsForm