import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth0 } from '@auth0/auth0-react'

import LoginButton from './LoginButton'
import LogoutButton from './LogoutButton'

const StyledHeader = styled.header`
  align-items: center;
  background: white;
  box-shadow: 0 2px 3px #aaa8;
  box-sizing: border-box;
  color: ${p => p.theme.black};
  display: flex;
  height: 65px;
  justify-content: space-between;
  left: 0;
  padding: 0 25px;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1;

  h1 {
    font-size: ${ p => p.theme.headerSize };
    margin: 0;
    text-transform: uppercase;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`

const NavList = styled.ul`
  display: flex;
  flex-direction: row;
  list-style: none;

  > li {
    margin-right: 20px;

    &:last-child {
      margin-right: 0;
    }
  }
`

const Header = () => {
  const { user, isAuthenticated, isLoading } = useAuth0()
  return (
    <StyledHeader>
      <h1>Ceres (demo)</h1>
      <nav>
        <NavList>
          { isLoading ? "" : isAuthenticated ? (
            <>
              <li><Link to="/" className="nav-link">My Datasets</Link></li>
              <li><LogoutButton /></li>
            </>
          ) : (
            <li><LoginButton /></li>
          )}
        </NavList>
      </nav>
    </StyledHeader>
  )
}

export default Header