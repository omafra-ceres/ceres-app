import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'

import Button from '../Button'
import Input from '../InputContainer'

import useModal from '../../customHooks/useModal'

const Container = styled.div`
  color: #333;
  width: 350px;
`

const ModalTitle = styled.h1`
  font-size: 18px;
  margin: 0 0 20px;
  font-weight: 500;
`

const FormToolbar = styled.div`
  display: flex;
  flex-direction: row;
  margin-top: 30px;
`

const FilterList = styled.div`
  display: flex;
  flex-direction: column;
`

const FilterItem = styled.div`
  display: flex;
  
  &:not(:last-child) {
    margin-bottom: 10px;
  }
`

const Flag = styled.div`
  background: #BBDFFF;
  border: 2px solid #BBDFFF;
  border-radius: 4px;
  color: #333;
  font-size: 14px;
  padding: 5px 10px;
  width: fit-content;

  *:hover > &, *:focus-within > & {
    border-color: #88cfff;
  }
`

const FilterX = styled.button`
  border: 1px solid transparent;
  background: none;
  border-radius: 4px;
  font-size: 20px;
  margin-right: 10px;

  *:hover > &, *:focus-within > & {
    background: #eee;
    outline: none;
  }

  &:active {
    background: #ddd;
  }
`

const Plus = styled.div`
  height: 14px;
  position: relative;
  width: 14px;

  &::before, &::after {
    background: currentColor;
    content: "";
    height: inherit;
    left: 0px;
    position: absolute;
    top: 0px;
    width: inherit;
  }

  &::before {
    left: 6px;
    width: 2px;
  }

  &::after {
    height: 2px;
    top: 6px;
  }
`

const AddButton = styled(Button).attrs(() => ({
  buttonType: "text"
}))`
  font-size: 14px;
  margin: 15px 0 0;
  min-width: unset;
  padding: 5px 5px 5px 40px;
  position: relative;
  text-align: left;

  > ${Plus} {
    position: absolute;
    left: 7px;
  }

  &:hover, &:focus {
    background: #eee;
    box-shadow: none;
  }

  &:active {
    background: #ddd;
  }
`

const BuildContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
  padding: 0 10px 10px;

  > .filter-option {
    margin-top: 5px;
  }

  > .filter-condition {
    display: inline-block;
    margin-right: 10px;
    width: 185px;
  }

  > .filter-check {
    display: inline-block;
    width: 133px;
    
    input {
      position: relative;
      top: -2px;
      width: 133px;
    }
  }
`

const queryOperators = {
  "=": "equal to",
  ">": "greater than",
  "<": "less than"
}

const ManageFilters = ({ template, filters=[], onSubmit }) => {
  const [ newFilters, setNewFilters ] = useState(filters)
  const [ buildIsOpen, setBuildIsOpen ] = useState(false)
  const { close } = useModal()[1]

  useEffect(() => {
    setNewFilters(filters)
    return () => setNewFilters(filters)
  }, [ filters, onSubmit ])

  const BuildFilter = () => {
    const [column, setColumn] = useState()
    const [condition, setCondition] = useState()
    const [check, setCheck] = useState("")

    useEffect(() => { setCondition(null) }, [ column ])
    useEffect(() => { setCheck("") }, [ condition ])

    const numberConditions = [
      { value: ">", label: "is greater than" },
      { value: "<", label: "is less than" }
    ]
    
    const conditions = [
      { value: -1, label: "Hide column" },
      { value: "=", label: "is equal to" },
    ]

    const filterConditions = {
      string: [...conditions],
      boolean: [...conditions],
      number: [...conditions, ...numberConditions]
    }

    const columnType = column ? template.properties[column.value].type : ""
    const checkType = {
      "string": "text",
      "number": "number",
      "boolean": "select"
    }
    const checkOnChange = columnType !== "boolean" ? ({ target: { value }}) => setCheck(value) : setCheck
    const checkBooleanOptions = [{ value: "true", label: "TRUE" }, { value: "false", label: "FALSE" }]
    
    const columns = Object.keys(template.properties).map(key => ({ value: key, label: template.properties[key].title }))

    const closeBuild = () => {
      setColumn()
      setCondition()
      setCheck("")
      setBuildIsOpen(false)
    }

    const handleAdd = () => {
      const newFilter = [
        column.value,
        condition.value === -1
          ? condition.value
          : `${condition.value} ${check.value ? check.value : check}`
      ]
      setNewFilters([...newFilters, newFilter])
      closeBuild()
    }
    
    return (
      <BuildContainer>
        <Input
          id="column-select"
          label="Column"
          value={ column }
          type="select"
          required={ true }
          className="filter-option"
          options={ columns }
          onChange={ setColumn }
        />
        { !!column ?
          <Input
            id="filter-condition"
            label="Condition"
            value={ condition }
            type="select"
            required={ true }
            className="filter-option filter-condition"
            options={ filterConditions[columnType] }
            onChange={ setCondition }
          />
        : "" }
        { condition && condition.value !== -1 ?
          <Input
            id="filter-check"
            value={ check }
            required={ true }
            className="filter-option filter-check"
            type={ checkType[columnType] }
            onChange={ checkOnChange }
            { ...columnType === "boolean" && { options: checkBooleanOptions }}
          />
        : "" }
        <FormToolbar style={{ marginTop: "5px" }}>
          <Button disabled={ !(column && condition && (condition.value === -1 || check)) } buttonType="fill" onClick={ handleAdd }>Save</Button>
          <Button buttonType="text" onClick={ closeBuild }>Cancel</Button>
        </FormToolbar>
      </BuildContainer>
    )
  }

  const removeFilter = item => setNewFilters(newFilters.filter(filter => filter !== item))

  const FilterDisplay = ({ filter }) => {
    const [ col, val ] = filter
    const { title } = template.properties[col] || {}
    const filterType = [1, -1].includes(val) ? "projection" : "query"
    let operator, check
    if (filterType === "query") {
      operator = queryOperators[val[0]]
      check = val.slice(2)
    }

    if (!title) return ""
    
    const FilterContents = () => {
      const action = filterType === "projection" ? val === 1 ? "Show column" : "Hide column" : "Filter"
      const column = <strong>{ title }</strong>
      const query = <> where {operator} <strong>{check}</strong></>
      return <Flag>{ action } { column }{ filterType === "query" ? query : "" }</Flag>
    }

    const onClick = () => removeFilter(filter)

    const RemoveFilter = () => (
      <FilterX {...{ onClick }}>✕</FilterX>
    )
    
    return (
      <FilterItem {...{ onClick }}><RemoveFilter /><FilterContents /></FilterItem>
    )
  }

  const handleSave = () => {
    onSubmit(newFilters)
    close()
  }

  return (
    <Container>
      <ModalTitle>Filters</ModalTitle>
      <FilterList>
        { newFilters.map(filter => <FilterDisplay {...{ filter }} />) }
      </FilterList>
      { buildIsOpen
        ? <BuildFilter />
        : <AddButton onClick={ () => setBuildIsOpen(true) }><Plus />Add Filter</AddButton>
      }
      <FormToolbar>
        <Button disabled={ newFilters === filters || buildIsOpen } buttonType="fill" onClick={ handleSave }>Save Filters</Button>
        <Button buttonType="text" onClick={ close }>Cancel</Button>
      </FormToolbar>
    </Container>
  )
}

export default ManageFilters