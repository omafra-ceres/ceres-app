import React, { useState, useEffect, useRef, useReducer } from 'react'
import styled from 'styled-components'
import Select from 'react-select'
import { useAuth0 } from '@auth0/auth0-react'

import Button from '../Button'

import { useAPI, useModal } from '../../customHooks'

const Table = styled.table`
  th {
    text-align: left;
  }

  td, th {
    padding: 5px 10px;

    &:first-child {
      padding-left: 0;
    }
  }

  td:last-child {
    padding: 0;
  }
`

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 30px;
`

const Collaborators = ({ collaborators=[], onSubmit, datasetId }) => {
  const [ collaboratorList, setCollaboratorList ] = useState(collaborators)
  const [ userList, setUserList ] = useState([])
  const [ addOpen, setAddOpen ] = useState(false)
  const [ selected, setSelected ] = useState([])
  const userSelect = useRef()
  const { close } = useModal()[1]
  const { user } = useAuth0()
  const api = useAPI()

  useEffect(() => () => setSelected([]), [ onSubmit, collaborators ])

  useEffect(() => {
    (async () => {
      const res = await api.get(`/user/users`)
      const users = res.data.filter(authUser => authUser.id !== user.sub.split("|")[1] && !collaborators.map(col => col.id).includes(authUser.id))
      setUserList(users.map(user => ({ value: user.id, label: user.email, data: user })))
    })()
  }, [ api, collaborators, user ])

  useEffect(() => {
    if (addOpen) userSelect.current.focus()
  }, [ addOpen ])

  const handleRemove = user => {
    api.post(`/data/${datasetId.slice(1)}/collaborators/delete`, { id: user.id })
    const edit = collaboratorList.filter(col => col.id !== user.id)
    setCollaboratorList(edit)
    setUserList([...userList, { value: user.id, label: user.email, data: user }])
    onSubmit({ collaborators: edit })
  }

  const handleAdd = () => {
    const users = selected.map(user => user.data)
    api.post(`/data/${datasetId.slice(1)}/collaborators`, users)
    const edit = [...collaboratorList, ...users]
    setCollaboratorList(edit)
    setUserList(userList.filter(user => !selected.includes(user)))
    setSelected([])
    setAddOpen(false)
    onSubmit({ collaborators: edit })
  }

  return (
    <div style={{ minWidth: "400px" }}>
      { collaboratorList && collaboratorList.length ? (
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            { collaboratorList.map(col => (
              <tr key={ col.id }>
                <td>{ col.name }</td>
                <td>{ col.email }</td>
                <td><Button style={{ color: "red" }} buttonType="text" onClick={() => handleRemove(col)}>remove</Button></td>
              </tr>
            )) }
          </tbody>
        </Table>
      ) : (
        <div>No Collaborators</div>
      )}
      <div style={{
        width: "300px",
        margin: "10px 0",
        display: addOpen ? "block" : "none"
      }}>
        <Select
          isMulti
          value={ selected }
          ref={ userSelect }
          options={ userList }
          onChange={ value => setSelected(value) }
        />
      </div>
      <Button
        style={{ display: addOpen ? "inline-block" : "none" }}
        buttonType="fill"
        onClick={ handleAdd }
      >
        Add
      </Button>
      <Button
        style={{ padding: "5px 0" }}
        buttonType="text"
        onClick={ () => setAddOpen(!addOpen) }
      >
        { addOpen ? "Cancel" : "+ Add Collaborator" }
      </Button>
      <FormToolbar>
        <Button buttonType="fill" onClick={ close }>Close</Button>
      </FormToolbar>
    </div>
  )
}

export default Collaborators