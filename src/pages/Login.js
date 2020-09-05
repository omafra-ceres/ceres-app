import React from 'react'
import styled from 'styled-components'

import { LoginButton } from '../components'

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
  return (
    <Page>
      <h1>
        Welcome to Ceres!
      </h1>
      <p>
        Please click below to request a login email
      </p>
      <LoginButton />
    </Page>
  )
}

export default Login