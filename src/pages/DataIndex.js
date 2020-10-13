import React, { useState, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import { Link } from 'react-router-dom'

import { useAPI } from '../customHooks'
import { Button } from '../components'

const Page = styled.div`
  background: #efefef;
  height: calc(100vh - 65px);
  margin-top: -5px;
  overflow-y: auto;
  padding: 0 0 0 250px;
  position: relative;
  width: 100vw;
`

const SidebarContainer = styled.nav`
  background: white;
  border-right: 1px solid #aaa;
  height: calc(100vh - 65px);
  left: 0;
  overflow-y: auto;
  position: fixed;
  width: 250px;

  ul {
    list-style: none;
    margin: 0;
    padding: 112px 0 0;
  }

  hr {
    background: linear-gradient(to right, #ddd0, #dddf 10%, #dddf 90%, #ddd0);
    border: none;
    height: 1px;
    margin: 8px 10px;
  }
`

const SidebarButton = styled(Button)`
  border-radius: 0;
  font-size: 14px;
  font-weight: normal;
  height: 36px;
  margin: 0;
  padding: 0;
  padding-left: 45px;
  position: relative;
  text-align: left;
  width: 100%;

  &.selected {
    font-weight: bold;

    &::before {
      ${ props => props.theme.pseudoFill }
      content: ">";
      left: 20px;
      line-height: 36px;
    }

    :focus {
      box-shadow: none;
    }
  }

  &:not(:disabled) {
    cursor: pointer;

    :hover {
      background: #efefef;
    }
  }
`

const Content = styled.div`
  max-width: 1000px;
  margin-left: 50px;
  padding: 20px 25px;

  h1 {
    font-size: ${ p => p.theme.headerSize };
    margin-bottom: 0;
    margin-top: 15px;
  }

  ul {
    margin: 25px 0;
  }
`

const StyledCreateLink = styled(Link)`
  background: ${ p => p.theme.blue };
  border-radius: 4px;
  box-sizing: border-box;
  color: white;
  display: inline-block;
  padding: 10px 15px;
  text-decoration: none;
`

const CreateDatasetLink = () => <StyledCreateLink to="/create">New Dataset</StyledCreateLink>

const DatasetListContainer = styled.ul`
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

const DatasetListItem = styled.li`
  background: white;
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

const DatasetActionButton = styled(Button).attrs(() => ({
  buttonType: "text"
}))`
  border: 1px solid transparent;
  border-radius: 1px;
  cursor: pointer;
  height: 100%;
  margin: 0;
`

const DatasetDelete = styled(DatasetActionButton)`
  :hover {
    border-color: red;
    color: red;
  }
`

const DatasetRecover = styled(DatasetActionButton)`
  :hover {
    border-color: currentColor;
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

const fade = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
`

const PlaceholderLiContainer = styled.div`
  &:not(:first-child) {
    margin-top: 10px;
  }

  align-items: center;
  background: #f8f8f8;
  display: flex;
  height: 58px;
  padding: 10px 20px;

  div {
    background: linear-gradient(to right, #ddd 75%, #f8f8f8);
    height: 18px;
    position: relative;
    width: 340px;

    &::after {
      ${ props => props.theme.pseudoFill }
      animation: ${ fade } 1.5s ease-out infinite alternate;
      animation-delay: inherit;
      background: #ddd;
    }
  }
`

const PlaceholderLi = ({ index }) => (
  <PlaceholderLiContainer>
    <div style={{ animationDelay: `${ index * 200 }ms` }} />
  </PlaceholderLiContainer>
)

const navPaths = [
  [
    { label: "Search", path: "/data/search", disabled: true },
  ],[
    { label: "My datasets", path: "/user/datasets" },
    { label: "Favourites", path: "/user/favourites", disabled: true },
    { label: "Global datasets", path: "/data/global" },
  ],[
    { label: "Deleted", path: "/user/deleted" },
  ]
]

const DataIndex = ({ location }) => {
  const [ isLoading, setIsLoading ] = useState(true)
  const [ datasets, setDatasets ] = useState([])
  const [ navView, setNavView ] = useState(navPaths[1][0])
  const api = useAPI()

  useEffect(() => {
    if (location.state && location.state.error) {
      console.error(location.state.error)
    }
  }, [ location ])

  useEffect(() => {
    api.get(navView.path)
      .then(res => {
        console.log(res.data)
        setIsLoading(false)
        setDatasets(res.data)
      }).catch(error => {
        setIsLoading(false)
        console.error(error)
      })
  },[ api, navView ])
  
  const SidebarItem = ({ path }) => (
    <li>
      <SidebarButton
        buttonType="text"
        onClick={ () => {
          if (navView !== path) {
            setIsLoading(true)
            setNavView(path)
          }
        }}
        className={ navView === path ? "selected" : "" }
        disabled={ path.disabled }
      >
        { path.label }
      </SidebarButton>
    </li>
  )

  const SidebarLinks = () => <ul>{
    navPaths.reduce((links, group, index) => [
      ...links,
      ...(links.length ? [<hr key={ `break-${index}` } />] : []),
      ...group.map((path, i) => (
        <SidebarItem key={ `${index}-${i}` } {...{ path }} />
      ))
    ], [])
  }</ul>

  const DeleteButton = ({ datasetId }) => {
    const handleClick = e => {
      e.preventDefault()
      setDatasets(datasets.filter(set => set.id !== datasetId))
      api.post(`/data/${datasetId}/archive`)
         .catch(console.error)
    }
    return (
      <DatasetDelete onClick={ handleClick }>delete</DatasetDelete>
    )
  }
  
  const RecoverButton = ({ datasetId }) => {
    const handleClick = e => {
      e.preventDefault()
      setDatasets(datasets.filter(set => set.id !== datasetId))
      api.put(`/data/${datasetId}/archive`)
         .catch(console.error)
    }
    return (
      <DatasetRecover onClick={ handleClick }>recover</DatasetRecover>
    )
  }

  const DatasetAction = props => ({
    "/user/datasets": <DeleteButton {...props} />,
    "/user/deleted": <RecoverButton {...props} />
  })[navView.path] || ""

  const Placeholder = () => [0,1,2,3,4].map((i) => <PlaceholderLi index={ i } key={ i } />)

  return (
    <Page>
      <SidebarContainer>
        <SidebarLinks />
      </SidebarContainer>
      <Content>
        <ListHeader>
          <h1>{ navView.label }</h1>
        </ListHeader>
        <DatasetListContainer>
          <ListColumns>
            <div>Name</div>
            <div>Created On</div>
          </ListColumns>
          {
            isLoading || !datasets.length
              ? <Placeholder />
              : datasets.map(data => {
                const created = new Date(data.created_at).toLocaleDateString(undefined, {
                  month: 'short', day: 'numeric', year: 'numeric'
                })
                return (
                  <DatasetListItem key={data.id}>
                    <Link to={`/${data.id}`}>
                      <DatasetTitle>{ data.name }</DatasetTitle>
                      <span>{ created }</span>
                      <div />
                      <DatasetAction datasetId={ data.id } />
                    </Link>
                  </DatasetListItem>
                )
              })
          }
        </DatasetListContainer>
        { !isLoading && navView.path === "/user/datasets" ? <CreateDatasetLink /> : "" }
      </Content>
    </Page>
  )
}

export default DataIndex