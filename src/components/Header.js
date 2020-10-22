import React, { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { useAuth0 } from '@auth0/auth0-react'

import logo from '../assets/logo_vertical.svg'

import LogoutButton from './LogoutButton'
import { useRoles } from '../customHooks'

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
  z-index: 5;

  h1 {
    font-size: ${ p => p.theme.headerSize };
    margin: 0;
    text-transform: uppercase;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  .logo_vertical {
    height: 50px;
  }
`

const NavList = styled.ul`
  align-items: center;
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

const Banner = styled.div`
  align-items: center;
  background: black;
  box-shadow: inherit;
  color: white;
  display: flex;
  left: 0;
  padding: 5px;
  padding-left: inherit;
  padding-right: inherit;
  position: absolute;
  right: 0;
  top: 100%;

  h1 {
    margin-right: 20px;
  }

  .close {
    cursor: pointer;
    font-size: 18px;
    margin-left: auto;
  }

  :hover .close {
    font-size: 22px;
    font-weight: bold;
  }
`

const AdminLink = ({ isAdmin }) => isAdmin ? <li><Link to="/admin" className="nav-link">Admin Panel</Link></li> : ""

const Header = () => {
  const { user, isAuthenticated, isLoading } = useAuth0()
  const roles = useRoles()
  const { state } = useLocation()
  const [ showBanner, setShowBanner ] = useState(true)

  useEffect(() => {
    console.log("state:", state)
  }, [state])

  return (
    <StyledHeader>
      { showBanner ? (
        <Banner onClick={ () => setShowBanner(false) }>
          <h1>ALPHA</h1>
          This is a prototype. It is likely to change as we test ideas.
          <span className="close">✕</span>
        </Banner>
      ): "" }
      <Link to="/"><img className="logo_vertical" src={ logo } alt="Ceres" /></Link>
      <nav>
        <NavList>
          { isLoading || !isAuthenticated
            ? ""
            : (
              <>
                <li><Link to="/" className="nav-link">My Datasets</Link></li>
                <AdminLink isAdmin={ roles && roles.includes("admin") } />
                <li><LogoutButton /></li>
              </>
            )
          }
        </NavList>
      </nav>
    </StyledHeader>
  )
}

export default Header