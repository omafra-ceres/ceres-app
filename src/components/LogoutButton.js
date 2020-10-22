import React from "react";
import { useAuth0 } from "@auth0/auth0-react";

import Button from "./Button"

const LogoutButton = () => {
  const { logout } = useAuth0()
  
  const onClick = () => logout({ returnTo: window.location.origin })

  return <Button onClick={ onClick }>Log Out</Button>
};

export default LogoutButton;
