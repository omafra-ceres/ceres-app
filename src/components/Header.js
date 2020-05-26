import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

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

  h1 {
    font-size: 24px;
    margin: 0;
    text-transform: uppercase;
  }
  
  ul {
    list-style: none;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`

const Header = () => {
  return (
    <StyledHeader>
      <h1>Ceres (demo)</h1>
      <nav>
        <ul>
          <li><Link to="/" className="nav-link">Collections</Link></li>
        </ul>
      </nav>
    </StyledHeader>
  )
}

export default Header