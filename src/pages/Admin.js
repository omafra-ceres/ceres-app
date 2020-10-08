import React, { useMemo, useState } from 'react'
import { Link, useRouteMatch, Redirect } from 'react-router-dom'
import styled from 'styled-components'

import {
  CreateUser,
  ManageUsers,
  CreateGlobal,
  ManageGlobal
} from './adminPages'

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

  hr {
    background: #aaa;
    border: none;
    height: 1px;
    margin: 8px 0px;
  }
`

const Sidebar = styled.nav`
  border-right: 1px solid #aaa;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 65px);
  margin-top: -5px;
  padding: 20px;
  width: 250px;

  a {
    padding: 4px 0;
  }
`

const ContentContainer = styled.div`
  height: calc(100vh - 70px);
  overflow-y: auto;
  padding: 17px 20px 20px;
  width: 100%;
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
  },
  global: {
    create: CreateGlobal,
    manage: ManageGlobal
  }
}

const menuOptions = [
  [
    { path: "users/manage", label: "Manage users" },
    { path: "users/create", label: "Create new user" }
  ],[
    { path: "global/manage", label: "Manage global datasets" },
    { path: "global/create", label: "Create global dataset" }
  ]
]

const SidebarOptions = () => (
  <>
    {
      menuOptions.reduce((options, group) => [
        ...options,
        ...(options.length ? [<hr key={ `break-${options.length}` } />] : []),
        ...group.map(link => (
          <Link
            key={ link.path }
            to={ `/admin/${link.path}` }
          >{ link.label }</Link>
        ))
      ], [])
    }
  </>
)

const Admin = () => {
  const match = useRouteMatch("/admin/:page/:action")

  const Content = useMemo(() => {
    if (!match) return () => <Redirect to="/admin/users/manage" />
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
        <SidebarOptions />
      </Sidebar>
      <ContentContainer>
        <h1>{ pageTitle }</h1>
        <Content />
      </ContentContainer>
    </Page>
  )
}

export default Admin