import React, { useState, useEffect, useLayoutEffect, useRef } from 'react'
import styled from 'styled-components'

import Button from '../Button'
import Input from '../InputContainer'

import useModal from '../../customHooks/useModal'

import { addFilter, removeFilter, getFilterList } from '../../utils'


////////////////////////////////////////
//////                            //////
//////      Component Styles      //////
//////                            //////

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
  cursor: default;
  display: flex;
  width: fit-content;
  
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
  color: #aaa;
  font-size: 20px;
  margin-right: 10px;

  *:hover > &, *:focus-within > & {
    background: #eee;
    color: #333;
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
  margin: 20px 0 0;
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

  &:nth-child(2) {
    margin-top: 0;
  }
`

const OpDisplay = styled.div`
  bottom: 1px;
  box-sizing: border-box;
  display: inline-block;
  font-weight: bold;
  left: 1px;
  position: relative;
  text-align: center;
  width: 20px;
`

const BuildContainer = styled.div`
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 10px;
  padding: 10px;

  > ${ModalTitle} {
    font-size: 16px;
    margin-bottom: 10px;
  }

  > .filter-option {
    margin-top: 5px;
  }

  > .filter-condition {
    display: inline-block;
    width: 175px;
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

  > ${FormToolbar} {
    margin-top: 15px;
  }
`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////


const ManageFilters = ({ template, filters={}, onSubmit }) => {
  const [ newFilters, setNewFilters ] = useState(filters)
  const [ buildIsOpen, setBuildIsOpen ] = useState(false)
  const { close } = useModal()[1]

  useEffect(() => {
    setNewFilters(filters)
    setBuildIsOpen(false)
    return () => {
      setNewFilters(filters)
      setBuildIsOpen(false)
    }
  }, [ filters, onSubmit ])

  const BuildFilter = ({ noClose }) => {
    const [column, setColumn] = useState()
    const [condition, setCondition] = useState()
    const [check, setCheck] = useState("")

    useEffect(() => { setCondition(null) }, [ column ])
    useEffect(() => { setCheck("") }, [ condition ])

    const numberConditions = [
      { value: { type: "query", op: ">" }, label: "is greater than" },
      { value: { type: "query", op: "<" }, label: "is less than" }
    ]
    
    const conditions = [
      { value: { type: "sort", op: "" }, label: "Sort column" },
      { value: { type: "projection", op: -1 }, label: "Hide column" },
      { value: { type: "query", op: "=" }, label: "is equal to" },
    ]

    const filterConditions = {
      string: [...conditions],
      boolean: [...conditions],
      number: [...conditions, ...numberConditions]
    }

    const sortOptions = {
      "string": [
        {value: 1, label: "A - Z"},
        {value: -1, label: "Z - A"}
      ],
      "number": [
        {value: 1, label: "1 - 9"},
        {value: -1, label: "9 - 1"}
      ],
      "boolean": [
        {value: 1, label: "F - T"},
        {value: -1, label: "T - F"}
      ]
    }

    const checkTypes = {
      "string": "text",
      "number": "number",
      "boolean": "select"
    }

    const checkBooleanOptions = [
      { value: "true", label: "TRUE" },
      { value: "false", label: "FALSE" }
    ]

    const columnType = column ? template.properties[column.value].type : ""
    const checkType = condition && condition.value.type === "sort" ? "select" : checkTypes[columnType]
    const checkOptions = condition && condition.value.type === "sort"
      ? sortOptions[columnType]
      : columnType === "boolean"
        ? checkBooleanOptions
        : null

    const checkOnChange = !checkOptions ? ({ target: { value }}) => setCheck(value) : setCheck
    
    const columns = Object.keys(template.properties).map(key => ({ value: key, label: template.properties[key].title }))

    const closeBuild = () => {
      setColumn()
      setCondition()
      setCheck("")
      setBuildIsOpen(false)
    }

    const handleAdd = () => {
      const filterType = condition.value.type
      const filterColumn = column.value
      const filterOp = ["sort", "projection"].includes(filterType)
        ? filterType === "sort" ? check.value : condition.value.op
        : `${condition.value.op} ${check.value ? check.value : check}`
      setNewFilters(addFilter(newFilters, filterType, filterColumn, filterOp))
      closeBuild()
    }
    
    return (
      <BuildContainer>
        <ModalTitle>Add Filter</ModalTitle>
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
        { condition && condition.value.type !== "projection" ?
          <>
            <OpDisplay>{ condition.value.op }</OpDisplay>
            <Input
              id="filter-check"
              value={ check }
              required={ true }
              className="filter-option filter-check"
              type={ checkType }
              onChange={ checkOnChange }
              { ...checkOptions && { options: checkOptions }}
            />
          </>
        : "" }
        <FormToolbar>
          <Button disabled={ !(column && condition && (condition.value.type === "projection" || check)) } buttonType="fill" onClick={ handleAdd }>Add</Button>
          { noClose ? "" : <Button buttonType="text" onClick={ closeBuild }>Cancel</Button> }
        </FormToolbar>
      </BuildContainer>
    )
  }

  const FilterDisplay = ({ filter }) => {
    const { type, column, html } = filter
    const onClick = () => setNewFilters(removeFilter(newFilters, type, column))
    const RemoveFilter = () => <FilterX {...{ onClick }}>✕</FilterX>
    
    return (
      <FilterItem {...{ onClick }}>
        <RemoveFilter />
        <Flag>{ html }</Flag>
      </FilterItem>
    )
  }

  const handleSave = () => {
    onSubmit(newFilters)
    close()
  }

  const list = getFilterList(newFilters, template, true).map((item, i) => <FilterDisplay key={ i } filter={ item } />)

  return (
    <Container>
      <ModalTitle>Manage Filters</ModalTitle>
      { list.length ? <FilterList>{ list }</FilterList> : "" }
      { buildIsOpen || !list.length
        ? <BuildFilter noClose={ !list.length } />
        : <AddButton onClick={ () => setBuildIsOpen(true) }><Plus />Add filter</AddButton>
      }
      <FormToolbar>
        <Button disabled={ newFilters === filters || buildIsOpen } buttonType="fill" onClick={ handleSave }>Save filters</Button>
        <Button buttonType="text" onClick={ close }>Cancel</Button>
      </FormToolbar>
    </Container>
  )
}

export default ManageFilters