import React, { useState } from 'react'
import styled from 'styled-components'
import { useAuth0 } from '@auth0/auth0-react'

import { LoginButton, Form, Button } from '../components'

import { useAPI } from '../customHooks'

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 20px;
`

const Page = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 25px;

  h1 {
    font-size: ${ p => p.theme.headerSize };
  }

  p {
    font-size: 14px;
  }
`

const Login = () => {
  const [ requestOpen, setRequestOpen ] = useState(false)
  const { loginWithRedirect } = useAuth0()
  const api = useAPI(true)

  const onSubmit = ({ formData }) => {
    api.post(`/demo/create-user`, formData)
      .then(() => { loginWithRedirect() })
      .catch(console.error)
  }

  const handleCancel = () => {
    setRequestOpen(false)
  }
  
  return (
    <Page>
      <h1>
        Welcome to Ceres!
      </h1>
      { requestOpen ? (
        <Form
          schema={{
            type: "object",
            required: ["name", "email"],
            properties: {
              name: { type: "string", title: "Name" },
              email: { type: "string", title: "Email" }
            }
          }}
          uiSchema={{
            email: { "ui:widget": "email" }
          }}
          {...{ onSubmit }}
        >
          <FormToolbar>
            <Button buttonType="fill" type="submit">Create account</Button>
            <Button buttonType="text" onClick={ handleCancel }>Cancel</Button>
          </FormToolbar>
        </Form>
      ) : (
        <p>
          If you've already created an account you can <LoginButton /> otherwise create a <button onClick={ () => setRequestOpen(true) }>demo account</button>
        </p>
      ) }
    </Page>
  )
}

export default Login