import React, { useState } from 'react'
import styled from 'styled-components'

import { useAPI } from '../../customHooks'

import { Form, Button } from '../../components'

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
`

const CreateUser = () => {
  const [ userInfo, setUserInfo ] = useState({})
  const api = useAPI()

  const onSubmit = ({ formData }) => {
    api.post(`/admin/create-user`, formData)
    setUserInfo({})
  }

  const onChange = ({ formData }) => {
    setUserInfo(formData)
  }

  return (
    <Form
      schema={{
        type: "object",
        required: ["name", "role", "email"],
        properties: {
          name: { type: "string", title: "Name" },
          email: { type: "string", title: "Email", pattern: "^.+@ontario.ca$" }
        }
      }}
      uiSchema={{
        email: { "ui:widget": "email" }
      }}
      formData={ userInfo }
      {...{ onSubmit, onChange }}
    >
      <FormToolbar>
        <Button buttonType="fill" type="submit">Create user</Button>
        <Button buttonType="text" onClick={ () => setUserInfo({})}>Cancel</Button>
      </FormToolbar>
    </Form>
  )
}

export default CreateUser