import React, { useState, useEffect, useRef, useMemo } from 'react'
import styled from 'styled-components'
import Select from 'react-select'
import { Link } from 'react-router-dom'

import { useAPI } from '../../customHooks'
import { Button } from '../../components'

const DatasetList = styled.table`
  th, td {
    text-align: left;
    padding: 5px 0;

    &:not(:last-child) {
      padding-right: 15px;
    }
  }
`

const CollabDisplay = styled.div`
  align-items: center;
  background: #BBDFFF;
  border-radius: 50%;
  cursor: default;
  display: flex;
  font-size: 12px;
  font-weight: bold;
  height: 25px;
  justify-content: center;
  margin-right: 5px;
  width: 25px;
`

const Collaborator = ({ user }) => {
  const { name, email } = user
  const initials = name.split(" ").map(str => str[0].toUpperCase())
  console.log(initials[0] + (initials.length > 1 ? initials[initials.length - 1] : ""))
  return (
    <CollabDisplay title={ email }>
      { initials[0] + (initials.length > 1 ? initials[initials.length - 1] : "") }
    </CollabDisplay>
  )
}

const selectStyles = {
  control: provided => ({
    ...provided,
    minHeight: '30px',
    height: '30px',
    width: '200px',
    fontSize: '14px'
  }),

  valueContainer: provided => ({
    ...provided,
    height: '30px',
    padding: '0 6px'
  }),

  input: provided => ({
    ...provided,
    margin: '0px',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  indicatorsContainer: provided => ({
    ...provided,
    height: '30px',
  }),
  menuList: provided => ({
    ...provided,
    fontSize: '12px'
  })
}

const DatasetListItem = ({ dataset, userList }) => {
  const [ collaborators, setCollaborators ] = useState(dataset.collaborators || [])
  const [ isAddOpen, setIsAddOpen ] = useState(false)
  const [ selectValue, setSelectValue ] = useState()
  const addSelectRef = useRef()
  const api = useAPI()

  useEffect(() => {
    if (isAddOpen) addSelectRef.current.focus()
  }, [ isAddOpen ])

  const userOptions = useMemo(() => userList.filter(user => (
    !collaborators.map(col => col.id).includes(user.value)
  )), [ userList, collaborators ])

  const created = new Date(dataset.created_at).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric'
  })

  const onBlur = () => {
    setIsAddOpen(false)
  }

  // const handleAdd = () => {
  //   const users = selected.map(user => user.data)
  //   api.post(`/data/${datasetId.slice(1)}/collaborators`, users)
  //   const edit = [...collaboratorList, ...users]
  //   setCollaboratorList(edit)
  //   setUserList(userList.filter(user => !selected.includes(user)))
  //   setSelected([])
  //   setAddOpen(false)
  //   onSubmit({ collaborators: edit })
  // }

  const onChange = value => {
    api.post(`/data/global/${dataset.id}/collaborators`, [value.data])
    setCollaborators([...collaborators, value.data])
    setSelectValue("")
  }

  return (
    <tr>
      <td><Link to={`/${dataset.id}`}>{ dataset.name }</Link></td>
      <td>{ created }</td>
      <td style={{ display: "flex", alignItems: "center" }}>
        { collaborators.map(col => <Collaborator user={ col } />) }
        { isAddOpen ? (
          <Select
            ref={ addSelectRef }
            options={ userOptions }
            value={ selectValue }
            onChange={ onChange }
            onBlur={ onBlur }
            styles={ selectStyles }
          />
        ) : (
          <Button buttonType="text" style={{ padding: 0 }} onClick={ () => setIsAddOpen(true) }>Add collaborator</Button>
        )}
      </td>
      {/* <DatasetAction datasetId={ data.id } /> */}
    </tr>
  )
}

const ManageGlobal = () => {
  const [ isLoading, setIsLoading ] = useState(true)
  const [ datasets, setDatasets ] = useState([])
  const [ userList, setUserList ] = useState([])
  const api = useAPI()

  useEffect(() => {
    api.get("/data/global")
      .then(res => {
        setIsLoading(false)
        setDatasets(res.data)
        console.log(res.data)
      }).catch(error => {
        setIsLoading(false)
        console.error(error)
      })
  },[ api ])

  useEffect(() => {
    api.get("/user/users")
      .then(res => {
        setUserList(res.data.map(user => ({
          value: user.id,
          label: user.email,
          data: user
        })))
      }).catch(error => {
        console.error(error)
      })
  }, [ api ])

  return (
    isLoading ? "Loading..." : (
      <DatasetList>
        <thead>
          <tr>
            <th>Name</th>
            <th>Created on</th>
            <th>Collaborators</th>
          </tr>
        </thead>
        <tbody>
          {
            datasets.map(dataset => (
              <DatasetListItem
                key={dataset.id}
                {...{ dataset, userList }}
              />
            ))
          }
        </tbody>
      </DatasetList>
    )
  )
}

export default ManageGlobal