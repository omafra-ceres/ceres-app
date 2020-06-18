import React from 'react'
import styled from 'styled-components'
import axios from 'axios'

import Form from '../components/CustomForm'

const formSchema = {
  title: "New Data Structure",
  type: "object",
  // required: ["name", "fields"],
  properties: {
    details: {
      title: "Details",
      type: "object",
      required: [ "name", "fields" ],
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
      items: {
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
            default: "true",
            type: "boolean"
          }
        }
      }
    }
  }
}

const formUISchema = {
  details: {
    "ui:form-group": true,
    path: {
      "ui:disabled": "true"
    },
    description: {
      "ui:widget": "textarea"
    }
  },
  fields: {
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

// placeholder for page styles
const Page = styled.div`
  
`

const transformErrors = errors => errors.map(err => {
  if (err.property === ".fields" && err.name === "required") {
    err.message = "cannot be empty"
  }
  return err
})

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

const nameToPath = name => (
  name && name.toLowerCase()
    .replace(/[^a-z\d-_ ]/g, "")
    .trim()
    .replace(/[\s-_]+/g, "-")
)

const CollectionCreate = () => {
  const [formData, setFormData] = React.useState(initialFormData)

  // const handleSubmit = event => {
  //   event.preventDefault()
  //   if (validate()) {
  //     const schema = generateSchema(collectionName, collectionFields)
  //     const name = collectionName
  //     const description = collectionDescription
  //     axios.post(`http://localhost:4000/data/create`, { name, description, schema })
  //       .then(() => {
  //         window.location.pathname = `/${schema.title}`
  //       })
  //       .catch(err => console.error(err))
  //   }
  // }

  const handleChange = ({formData}) => {
    const path = nameToPath(formData.name)
    setFormData({...formData, path})
  }

  return (
    <Page>
      <Form
        schema={ formSchema }
        uiSchema={ formUISchema }
        formData={ formData }
        onSubmit={ ({formData}) => console.log("submit", formData) }
        onChange={ handleChange }
        transformErrors={ transformErrors }
      />
    </Page>
  )
}

export default CollectionCreate