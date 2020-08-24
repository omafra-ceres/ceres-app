import React from 'react'
import styled from 'styled-components'
import axios from 'axios'
import { v4 as uuid } from 'uuid'

import Form from '../components/CustomForm'

const fieldItemSchema = {
  type: "object",
  required: ["name", "type"],
  properties: {
    name: {
      title: "Field Name",
      type: "string"
    },
    type: {
      title: "Field Type",
      type: "string",
      default: "string",
      enum: ["string", "number", "boolean"],
      enumNames: ["Text", "Number", "True/False"]
    },
    required: {
      title: "This field is required",
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
      required: [ "name", "path" ],
      properties: {
        name: {
          title: "Name",
          type: "string"
        },
        path: {
          title: "Path",
          type: "string",
          description: "this will be the url path for your dataset"
        },
        description: {
          title: "Description",
          type: "string"
        }
      }
    },
    fields: {
      title: "Fields",
      type: "array",
      minItems: 1,
      items: fieldItemSchema
    }
  }
}

const formUISchema = {
  details: {
    "ui:form-group": true,
    "ui:form-step": "1",
    path: {
      "ui:disabled": "true"
    },
    description: {
      "ui:widget": "textarea"
    }
  },
  fields: {
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
  fields: [{}]
}


////////////////////////////////////////
//////                            //////
//////      Component Styles      //////
//////                            //////

const Button = styled.button`
  background: white;
  border: 1px solid ${p => p.theme.text};
  border-radius: 4px;
  box-shadow: 0px 2px 2px #8888;
  box-sizing: border-box;
  color: ${p => p.theme.text};
  font-size: 12px;
  font-weight: bold;
  margin: 5px 0;
  min-width: 100px;
  padding: 5px 20px;
  text-align: center;

  &:disabled {
    border-color: #aaa;
    color: #aaa;
  }

  &:active {
    box-shadow: inset 0px 2px 2px #8884;
  }

  &:focus {
    outline: none;
    border-color: #2684ff;
    box-shadow: 0 0 0 1px #2684ff;
  }
`

const Submit = styled(Button).attrs(() => ({
  type: "submit"
}))`
  background: ${p => p.theme.blue};
  border-color: ${p => p.theme.blue};
  color: white;
`

const TextButton = styled(Button).attrs(() => ({
  type: "button"
}))`
  border-color: #0000;
  background: none;
  box-shadow: none;
  margin: 0 5px;
  padding: 5px;
`

const FormActionsContainer = styled.div`
  margin-left: 16px;
  margin-top: 5px;
  padding-left: 40px;
  position: relative;

  &::before {
    background: #5B5B5B;
    border: 14px solid white;
    border-radius: 50%;
    color: white;
    content: "3";
    font-size: 14px;
    font-weight: bold;
    height: 30px;
    left: -29px;
    line-height: 30px;
    position: absolute;
    text-align: center;
    top: -11px;
    width: 30px;
  }
`

const Page = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  padding: 20px 25px;
`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////


const transformErrors = errors => errors
  .filter(err => err.property !== ".details.path")
  .map(err => {
    if (err.property === ".fields" && err.name === "required") {
      err.message = "cannot be empty"
    }
    return err
  })

const generateTemplate = ({ details, fields }) => {
  const templateObject = {
    title: details.name,
    type: "object",
    required: [],
    properties: {}
  }

  fields.forEach(field => {
    const id = uuid()
    if (field.required) templateObject.required.push(id)
    templateObject.properties[id] = {
      title: field.name,
      type: field.type
    }
  })

  return templateObject
}

const nameToPath = name => (
  name && name.toLowerCase()
    .replace(/[^a-z\d-_ ]/g, "")
    .trim()
    .replace(/[\s-_]+/g, "-")
)

const DataCreate = () => {
  const [formData, setFormData] = React.useState(initialFormData)

  const handleSubmit = async ({formData}) => {
    const { details } = formData
    const template = generateTemplate(formData)
    const created = await axios.post(`http://localhost:4000/data/create`, {
      details,
      template
    }).catch(err => console.error(err))
    
    if (created.data.id) window.location.pathname = `/${created.data.id}`
  }

  const handleChange = ({formData}) => {
    const path = nameToPath(formData.details.name)
    setFormData({...formData, details: {...formData.details, path}})
  }

  return (
    <Page>
      <Form
        schema={ formSchema }
        uiSchema={ formUISchema }
        formData={ formData }
        onSubmit={ handleSubmit }
        onChange={ handleChange }
        transformErrors={ transformErrors }
      >
        <FormActionsContainer>
          <Submit>Publish</Submit>
          <TextButton>Cancel</TextButton>
        </FormActionsContainer>
      </Form>
    </Page>
  )
}

export default DataCreate