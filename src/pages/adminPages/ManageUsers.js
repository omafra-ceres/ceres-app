import React, { useState, useEffect } from 'react'
import styled from 'styled-components'

import { useAPI } from '../../customHooks'

// import { Form, Button } from '../../components'

// const FormToolbar = styled.div`
//   display: flex;
//   flex-direction: row;
//   margin-top: 20px;
// `

const StyledTable = styled.table`
  border-spacing: 0;
`

const TH = styled.th`
  background: white;
  border-bottom: 1px solid #333;
  padding: 5px 10px;
  position: sticky;
  text-align: left;
  top: 0;
`

const TD = styled.td`
  padding: 5px 10px;
`

const TR = styled.tr`
  background: #eee;

  &:nth-child(odd) {
    background: #fff;
  }
`

const Role = styled.span`
  background: white;
  border-color: currentColor;
  border-style: solid;
  border-width: 2px;
  border-radius: 4px;
  bottom: 2px;
  color: #333;
  font-size: 10px;
  font-weight: bold;
  margin-right: 5px;
  padding: 2px 4px;
  position: relative;

  &:last-child {
    margin-right: 0;
  }

  &.admin {
    background: #080;
    border-color: #080;
    color: #fff;
  }

  &.temporary {
    color: #d22;
  }
`

const AdminFlag = () => <Role className="admin">admin</Role>
const TempFlag = () => <Role className="temporary">temporary</Role>
const IntFlag = () => <Role className="internal">internal</Role>

const ManageUsers = () => {
  const [ users, setUsers ] = useState([])
  const api = useAPI()

  useEffect(() => {
    const getUsers = async () => {
      const response = await api.get(`/admin/users`)
      setUsers(response.data)
    }
    getUsers()
  }, [ api ])

  return (
    <div>
      <StyledTable>
        <thead>
          <tr>
            <TH>Name</TH>
            <TH>Email</TH>
            <TH colSpan="3" style={{ textAlign: "center" }}>Roles</TH>
            <TH>Joined on</TH>
          </tr>
        </thead>
        <tbody>
          { users.map((user, i) => {
            const roles = (user.app_metadata || {}).roles || []
            return (
              <TR key={ i }>
                <TD>{ user.name }</TD>
                <TD>{ user.email }</TD>
                <TD style={{ paddingRight: "2px" }}>{ roles.includes("admin") ? <AdminFlag /> : "" }</TD>
                <TD style={{ padding: "2px" }}>{ roles.includes("internal") ? <IntFlag /> : "" }</TD>
                <TD style={{ paddingLeft: "2px" }}>{ !roles.length ? <TempFlag /> : "" }</TD>
                <TD>{ new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) }</TD>
              </TR>
            )
          })}
        </tbody>
      </StyledTable>
    </div>
  )
}

export default ManageUsers