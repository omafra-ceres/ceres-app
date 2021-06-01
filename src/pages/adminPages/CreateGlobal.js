import React, { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useAuth0 } from '@auth0/auth0-react'
import { v4 as uuid } from 'uuid'
import { useHistory } from "react-router-dom"


import { useAPI } from '../../customHooks'

import { Form, Button } from '../../components'

const templateItemSchema = {
  type: "object",
  required: ["name", "type"],
  properties: {
    name: {
      title: "Column Name",
      type: "string"
    },
    type: {
      title: "Column Data Type",
      type: "string",
      default: "string",
      enum: ["string", "number", "boolean"],
      enumNames: ["Text", "Number", "True/False"]
    },
    required: {
      title: "This column is required",
      default: true,
      type: "boolean"
    }
  }
}

const formSchema = {
  title: "Create New Dataset",
  type: "object",
  properties: {
    details: {
      title: "Details",
      type: "object",
      required: [ "name" ],
      properties: {
        name: {
          title: "Name",
          type: "string"
        },
        description: {
          title: "Description",
          type: "string"
        }
      }
    },
    template: {
      title: "Template",
      type: "array",
      minItems: 1,
      items: templateItemSchema
    }
  }
}

const formUISchema = {
  details: {
    "ui:form-group": true,
    "ui:form-step": "1",
    description: {
      "ui:widget": "textarea"
    }
  },
  template: {
    "ui:form-step": "2",
    items: {
      "ui:form-group": true,
      "ui:grid-template": `
        "a b" 2fr
        "c c" 1fr / 1.25fr 1fr`,
      "ui:grid-areas": ["a", "b", "c"]
    }
  }
}

const initialFormData = {
  template: [{}]
}

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
`

const transformErrors = errors => errors
  .map(err => {
    if (err.property === ".fields" && err.name === "required") {
      err.message = "cannot be empty"
    }
    return err
  })

const generateTemplate = ({ details, template }) => {
  const templateObject = {
    title: details.name,
    type: "object",
    required: [],
    properties: {}
  }

  template.forEach(property => {
    const id = uuid()
    if (property.required) templateObject.required.push(id)
    templateObject.properties[id] = {
      title: property.name,
      type: property.type
    }
  })

  return templateObject
}

const CreateGlobal = () => {
  const [ datasetInfo, setDatasetInfo ] = useState(initialFormData)
  const { user } = useAuth0()
  const api = useAPI()
  const history = useHistory()
  
  const onSubmit = async ({ formData }) => {
    const { details } = formData
    const template = generateTemplate(formData)
    
    const created = await api.post(`/data/global`, {
      details,
      template
    }).catch(err => console.error(err))

    const userInfo = {
      id: user.sub.split("|")[1],
      name: user.name,
      email: user.email
    }

    if (created && created.data.id) {
      await api.post(`/data/global/${created.data.id}/collaborators`, [userInfo]).catch(console.error)
      history.push("/admin/global/manage")
    }
  }

  const onChange = ({ formData }) => {
    setDatasetInfo(formData)
  }

  const onCancel = () => {
    setDatasetInfo(initialFormData)
    history.push("/admin/global/manage")
  }

  return (
    <Form
      schema={ formSchema }
      uiSchema={ formUISchema }
      formData={ datasetInfo }
      onSubmit={ onSubmit }
      onChange={ onChange }
      transformErrors={ transformErrors }
    >
      <FormToolbar>
        <Button buttonType="fill" type="submit">Create</Button>
        <Button buttonType="text" onClick={ onCancel }>Cancel</Button>
      </FormToolbar>
    </Form>
  )
}

export default CreateGlobal