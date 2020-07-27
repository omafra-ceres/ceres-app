import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { Select } from '../components/InputContainer'

const CreateDataStructureLink = styled(Link)`
  background: ${ p => p.theme.blue };
  border-radius: 4px;
  box-sizing: border-box;
  color: white;
  display: inline-block;
  padding: 10px 15px;
  text-decoration: none;
`

const DeleteDataStructureButton = styled.button`
  background: none;
  border: none;
  color: red;
  font-size: 14px;
  font-weight: bold;
  padding: 10px;
  width: 75px;

  &:hover {
    text-decoration: underline;
    text-underline-position: under;
  }
`

const DataStructureListContainer = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`

const ListColumns = styled.li`
  display: grid;
  font-weight: bold;
  grid-template-columns: auto 300px 150px 100px;
  padding: 5px 20px 10px;
`

const DataStructureListItem = styled.li`
  margin-top: 10px;

  a {
    align-items: center;
    border: 1px solid #aaa;
    border-radius: 1px;
    color: ${p => p.theme.text};
    display: grid;
    grid-template-columns: auto 300px 150px 100px;
    height: 58px;
    padding: 10px 20px;
    position: relative;
    text-decoration: none;

    *:last-child {
      justify-self: flex-end;
    }

    &::after {
      box-shadow: 0 5px 5px -3px #0008;
      bottom: -1px;
      content: "";
      opacity: 0;
      pointer-events: none;
      position: absolute;
      right: 0;
      top: 0;
      transition: opacity 0.1s;
      width: 100%;
    }
  }

  &:hover a {
    border-color: #666;
    
    &::after {
      opacity: 1;
    }
  }
`

const DatasetTitle = styled.span`
  overflow: hidden;
  padding-right: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: none;
`

const DatasetStatus = styled.span`
  background: #e8e8e8;
  border-radius: 1px;
  font-size: 10px;
  font-weight: bold;
  justify-self: flex-start;
  padding: 6px 10px;
`

const Page = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px 25px;

  h1 {
    font-size: ${ p => p.theme.headerSize };
    margin-bottom: 0;
  }

  ul {
    margin: 25px 0;
  }
`

const ListHeader = styled.div`
  border-bottom: 1px solid #ddd;
  box-shadow: 0 2px 2px -1px #ddd;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-bottom: 20px;
`

const StatusSelect = styled(Select)`
  align-self: flex-end;
  width: 200px;
`

const PlaceholderLiContainer = styled.div`
  &:not(:first-child) {
    margin-top: 10px;
  }

  align-items: center;
  background: #efefef;
  display: flex;
  height: 58px;
  padding: 10px 20px;

  div {
    background: #ddd;
    height: 18px;
  }
`

const PlaceholderLi = () => (
  <PlaceholderLiContainer>
    <div style={{ width: 100 + Math.ceil(Math.random() * 300) }} />
  </PlaceholderLiContainer>
)

const ActionsButton = styled.button`
  background: white;
  border: none;
  border-radius: 4px;
  color: #444;
  font-weight: bold;
  font-size: 20px;
  height: 26px;
  opacity: 0.4;
  padding: 0;
  text-align: center;
  width: 40px;

  *:hover > &, &:focus {
    opacity: 1;
  }

  &:hover {
    background: #f4f4f4;
  }

  &:active {
    background: #ddd;
  }
`

const ActionsMenu = styled.ul.attrs(p => ({
  style: {
    top: p.top - 25 || 0,
    left: p.right - 150 || 0,
    display: p.isOpen ? "block" : "none"
  }
}))`
  background: white;
  border-radius: 1px;
  box-shadow: 0 2px 6px 2px #3c404326;
  list-style: none;
  margin: 0;
  padding: 5px 0;
  position: absolute;
  width: 150px;
  z-index: 2;
`

const ActionMenuItem = styled.button.attrs(() => ({
  onMouseOver: e => e.target.focus()
}))`
  background: white;
  border: none;
  display: block;
  line-height: 30px;
  padding: 0 10px;
  text-align: left;
  width: 100%;

  &:focus {
    background: #0092ff44;
    outline: none;
  }
`

const statuses = {
  draft: { value: "draft", label: "Draft" },
  published: { value: "published", label: "Published" },
  archived: { value: "archived", label: "Archived" }
}

const statusStructures = {}

const DataIndex = () => {
  const [dataStructures, setDataStructures] = useState([])
  const [status, setStatus] = useState("published")
  const [ menuState, setMenuState ] = useState({})
  const menuContainer = useRef()

  useEffect(() => {
    if (menuState.isOpen) {
      menuContainer.current.firstChild.firstChild.focus()
    }
  }, [ menuState ])

  useEffect(() => {
    setDataStructures(statusStructures[status] || [])
    axios.get(`http://localhost:4000/data/?status=${status}`)
      .then(res => {
        setDataStructures(res.data)
      })
      .catch(console.error)
  },[ status ])

  const handleDelete = (e, dataStructure) => {
    e.preventDefault()
    axios.post("http://localhost:4000/data/delete", dataStructure)
      .then(res => setDataStructures(res.data))
      .catch(console.error)
  }

  const handleStatusSelect = ({ value }) => {
    statusStructures[status] = dataStructures
    setStatus(value)
  }

  const closeMenu = () => {
    setMenuState({ isOpen: false })
  }

  const handleMenuBlur = e => {
    if (!e.relatedTarget) closeMenu()
  }

  const handleMenuKeyDown = e => {
    if (e.key === "Escape") closeMenu()
    
    if (!["Tab", "ArrowDown", "ArrowUp"].includes(e.key)) return

    const children = Array.from(e.currentTarget.children)
      .map(ch => ch.firstChild)
      .filter(ch => !ch.attributes.disabled)
    const first = children[0]
    const last = children[children.length - 1]
    
    // trap focus inside menu while menu is open
    if (e.key === "Tab") {
      if (e.target === first && e.shiftKey) {
        e.preventDefault()
        last.focus()
      }
      if (e.target === last && !e.shiftKey) {
        e.preventDefault()
        first.focus()
      }
    }

    // allow arrow keys to navigate menu
    if (e.key === "ArrowDown") {
      if (e.target === last) {
        first.focus()
      } else {
        children[children.indexOf(e.target) + 1].focus()
      }
    }
    if (e.key === "ArrowUp") {
      if (e.target === first) {
        last.focus()
      } else {
        children[children.indexOf(e.target) - 1].focus()
      }
    }
  }

  const handleActionClick = (e, dataset) => {
    e.preventDefault()
    const { top, right } = e.target.getBoundingClientRect()
    setMenuState({
      isOpen: true,
      dataset,
      top,
      right
    })
  }

  const itemActions = {
    archive: () => {
      axios.post("http://localhost:4000/data/archive", menuState.dataset)
        .then(() => {
          setDataStructures(dataStructures.filter(set => set !== menuState.dataset))
        })
        .catch(console.error)
    }, unarchive: () => {
      axios.post("http://localhost:4000/data/unarchive", menuState.dataset)
        .then(() => {
          setDataStructures(dataStructures.filter(set => set !== menuState.dataset))
        })
        .catch(console.error)
    }
  }
  
  const handleActionItemClick = e => {
    e.preventDefault()
    closeMenu()
    itemActions[e.target.dataset.value]()
  }

  return (
    <Page>
      <ListHeader>
        <h1>Datasets</h1>
        <StatusSelect
          value={ statuses[status] }
          isSearchable={ false }
          onChange={ handleStatusSelect }
          options={[
            { value: "published", label: "Published" },
            { value: "archived", label: "Archived" },
            { value: "draft", label: "Drafts", isDisabled: true }
          ]}
        />
      </ListHeader>
      <DataStructureListContainer>
        <ListColumns>
          <div>Name</div>
          <div>Published</div>
          <div>Status</div>
          {/* <div>Actions</div> */}
        </ListColumns>
        { dataStructures.length ? dataStructures.map(data => {
          const created = new Date(data.created_at).toLocaleDateString(undefined, {
            month: 'short', day: 'numeric', year: 'numeric'
          })
          return (
            <DataStructureListItem key={data.path}>
              <Link to={`/${data.path}`}>
                <DatasetTitle>{ data.name }</DatasetTitle>
                <span>{ created }</span>
                <DatasetStatus>{ data.status }</DatasetStatus>
                <ActionsButton onClick={ (e) => handleActionClick(e, data) }>︙</ActionsButton>
                {/* <DeleteDataStructureButton onClick={(e) => handleDelete(e, data)}>Delete</DeleteDataStructureButton> */}
              </Link>
            </DataStructureListItem>
          )
        }) : [0,1,2,3,4].map((i) => <PlaceholderLi key={ i } />) }
      </DataStructureListContainer>
      <CreateDataStructureLink to="/create">Create Data Structure</CreateDataStructureLink>
      <ActionsMenu
        {...menuState}
        ref={ menuContainer }
        onKeyDown={ handleMenuKeyDown }
        onBlur={ handleMenuBlur }
      >
        { status === "archived"
          ? <li><ActionMenuItem data-value="unarchive" onClick={ handleActionItemClick }>Unarchive Dataset</ActionMenuItem></li>
          : <li><ActionMenuItem data-value="archive" onClick={ handleActionItemClick }>Archive Dataset</ActionMenuItem></li>
        }
        <li><ActionMenuItem disabled data-value="share" onClick={ handleActionItemClick }>Share Dataset</ActionMenuItem></li>
        <li><ActionMenuItem disabled data-value="export" onClick={ handleActionItemClick }>Export Dataset</ActionMenuItem></li>
        <li><ActionMenuItem disabled data-value="invite" onClick={ handleActionItemClick }>Invite Collaborator</ActionMenuItem></li>
      </ActionsMenu>
    </Page>
  )
}

export default DataIndex