import React from "react"
import { useAuth0 } from "@auth0/auth0-react"

const LoginButton = () => {
  const { loginWithPopup } = useAuth0()

  const onClick = () => {
    loginWithPopup()
  }

  return <button {...{onClick}}>Log In</button>
}

export default LoginButton