import React, { useState, useEffect, useRef } from 'react'
import styled, { keyframes } from 'styled-components'
import { Link } from 'react-router-dom'

import { useAPI } from '../customHooks'
import { Button } from '../components'

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

const fade = keyframes`
  from { opacity: 1; }
  to { opacity: 0; }
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
    background: linear-gradient(to right, #ddd 75%, #efefef);
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

const DataIndex = ({ location }) => {
  const [ datasets, setDatasets ] = useState([])
  const api = useAPI()

  useEffect(() => {
    if (location.state && location.state.error) {
      console.error(location.state.error)
    }
  }, [ location ])

  useEffect(() => {
    api.get(`/user/datasets`)
      .then(res => {
        setDatasets(res.data)
      })
      .catch(console.error)
  },[ api ])

  const DeleteButton = ({ datasetId }) => {
    const handleClick = e => {
      e.preventDefault()
      setDatasets(datasets.filter(set => set.id !== datasetId))
      api.post(`/data/${datasetId}/archive`)
         .catch(console.error)
    }
    return (
      <Button
        buttonType="text"
        style={{ color: "red" }}
        onClick={ handleClick }
      >delete</Button>
    )
  }

  const Placeholder = () => [0,1,2,3,4].map((i) => <PlaceholderLi index={ i } key={ i } />)

  return (
    <Page>
      <ListHeader>
        <h1>Datasets</h1>
      </ListHeader>
      <DatasetListContainer>
        <ListColumns>
          <div>Name</div>
          <div>Created On</div>
        </ListColumns>
        {
          datasets.length ? datasets.map(data => {
            const created = new Date(data.created_at).toLocaleDateString(undefined, {
              month: 'short', day: 'numeric', year: 'numeric'
            })
            return (
              <DatasetListItem key={data.id}>
                <Link to={`/${data.id}`}>
                  <DatasetTitle>{ data.name }</DatasetTitle>
                  <span>{ created }</span>
                  <div />
                  <DeleteButton datasetId={ data.id } />
                </Link>
              </DatasetListItem>
            )
          }) : <Placeholder />
        }
      </DatasetListContainer>
      <CreateDatasetLink />
    </Page>
  )
}

export default DataIndex