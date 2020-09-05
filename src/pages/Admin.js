import React, { useMemo, useState } from 'react'
import { Link, useRouteMatch } from 'react-router-dom'
import styled from 'styled-components'

import { CreateUser, ManageUsers } from './adminPages'

import { capitalize } from '../utils'

const Page = styled.div`
  display: flex;
  flex-direction: row;

  h1 {
    font-size: ${ p => p.theme.headerSize };
    font-weight: 500;
    margin: 0 0 30px;
  }

  p {
    font-size: 14px;
  }
`

const Sidebar = styled.nav`
  border-right: 2px solid #ddd;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 65px);
  margin-top: -5px;
  padding: 20px;
  width: 200px;

  a {
    padding: 4px 0;
  }
`

const ContentContainer = styled.div`
  height: calc(100vh - 70px);
  overflow-y: auto;
  padding: 17px 20px 20px;
`

const MainPanel = () => (
  <>
    <h1>Admin</h1>
    <p>this is the admin panel</p>
  </>
)

const pages = {
  default: MainPanel,
  users: {
    create: CreateUser,
    manage: ManageUsers
  }
}

const menuOptions = [
  { path: "users/create", label: "Create new user" },
  { path: "users/manage", label: "Manage users" }
]

const Admin = () => {
  const match = useRouteMatch("/admin/:page/:action")

  const Content = useMemo(() => {
    if (!match) return pages.default
    const { page, action } = match.params
    return pages[page][action]
  }, [ match ])

  const pageTitle = useMemo(() => {
    if (!match) return "Admin Panel"
    const { page, action } = match.params
    return capitalize(`${page} / ${action}`)
  }, [ match ])

  return (
    <Page>
      <Sidebar>
        { menuOptions.map(op => <Link key={ op.path } to={ `/admin/${op.path}` }>{ op.label }</Link>) }
      </Sidebar>
      <ContentContainer>
        <h1>{ pageTitle }</h1>
        <Content />
      </ContentContainer>
    </Page>
  )
}

export default Admin