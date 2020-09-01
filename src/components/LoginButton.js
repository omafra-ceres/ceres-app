import React from "react"
import styled from "styled-components"
import { useAuth0 } from "@auth0/auth0-react"

const LoginButton = ({ email }) => {
  // const [isOpen, setIsOpen] = React.useState(false)
  const { loginWithRedirect } = useAuth0()

  const onClick = () => {
    loginWithRedirect()
  }

  return <button disabled={ !!email } {...{onClick}}>Log In</button>
}

export default LoginButton