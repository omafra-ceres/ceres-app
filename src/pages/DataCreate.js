import React, { useState, useEffect, useMemo, useRef, useCallback, forwardRef } from 'react'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import { useAuth0 } from '@auth0/auth0-react'

import { useAPI } from '../customHooks'
import {
  InputContainer,
  AddField,
  Button,
  Label,
  InputError,
  Description
} from '../components'


////////////////////////////////////////
//////                            //////
//////      Component Styles      //////
//////                            //////

const Page = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  
  padding: 20px 25px;

  h1 {
    font-size: 22px;
    margin: 0;
    font-weight: 500;
  }
`

const PageHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 50px;
  width: 100%;

  h1 {
    width: calc(50vw - 250px);
  }
`

const Container = styled.div`
  min-width: 400px;
  width: ${ p => p.isReview ? "fit-content" : "400px" };

  input, .select {
    max-width: 250px;
  }

  textarea {
    max-width: unset;
    resize: vertical;
  }

  > *:not(:last-child) {
    margin-bottom: 20px;
  }
`

const ToggleContainer = styled.div`
  > label {
    display: inline-flex;
    justify-content: center;

    input {
      margin-left: 0;
      margin-right: 5px;
    }

    &:not(:last-child) {
      margin-right: 10px;
    }
  }
  
  > label:first-of-type {
    display: block;
  }

  &.has-error {
    label:first-of-type {
      color: red;
    }
  }
`

const ButtonContainer = styled.div`
  margin-top: 30px;

  button {
    margin-left: 15px;

    &:first-child, &:last-child {
      margin-left: 0;
    }
  }
`

const StepContainer = styled.div`
  display: flex;
  justify-content: space-between;
  max-width: 450px;
  position: relative;
  width: 450px;

  &::after {
    ${ p => p.theme.pseudoFill }
    background: linear-gradient(to right, ${ p => p.theme.blue }, ${ p => p.theme.blue } ${ p => p.step * 50 }%, #aaa ${ p => p.step * 50 }%);
    height: 2px;
    top: calc(50% - 1px);
    z-index: 1;
  }

  > * {
    z-index: 2;
  }
`

const Step = styled.div.attrs(props => ({
  className: `${ props.complete ? "complete" : "" } ${ props.selected ? "selected" : "" }`
}))`
  align-items: center;
  background: white;
  border: 2px solid currentColor;
  border-radius: 50%;
  color: #aaa;
  cursor: default;
  display: flex;
  font-weight: bold;
  height: 30px;
  justify-content: center;
  width: 30px;

  &.complete {
    background: ${ p => p.theme.blue };
    border-color: ${ p => p.theme.blue };
  }

  &.selected {
    color: ${ p => p.theme.blue };
  }
`

const StepLabel = styled.div`
  bottom: -18px;
  color: #aaa;
  font-size: 12px;
  position: absolute;

  .selected > & {
    color: ${ p => p.theme.blue };
  }
`

const Check = styled.div`
  height: 15px;
  position: relative;
  width: 8px;

  &::after {
    ${ p => p.theme.pseudoFill }
    border: 2px solid white;
    border-top: none;
    border-left: none;
    transform: rotate(45deg) translate(-1px, -1px);
    transform-origin: center;
  }
`

const TemplateItemContainer = styled.div`
  border: 1px solid #aaa;
  border-radius: 4px;
  padding: 20px;

  > *:not(:last-child) {
    margin-bottom: 10px;
  }

  &:not(:first-of-type) {
    margin-top: 20px;
  }
`

const GlobalOptionsContainer = styled.div`
  > ${ Label } {
    display: block;
  }
`

const GlobalOption = styled.button.attrs(props => ({
  ...props.selected && { className: "selected" }
}))`
  align-items: center;
  background: white;
  border: 1px solid ${ p => p.theme.blue };
  border-radius: 4px;
  color: ${ p => p.theme.blue };
  display: inline-flex;
  font-size: 12px;
  font-weight: bold;
  margin-top: 5px;
  padding: 2px 4px;

  ::before {
    content: "";
    background: white;
    border: 1px solid ${ p => p.theme.blue };
    border-radius: 50%;
    box-sizing: border-box;
    display: inline-block;
    height: 10px;
    margin-right: 5px;
    width: 10px;
  }

  &:not(:last-child) {
    margin-right: 5px;
  }

  &.selected {
    background: ${ p => p.theme.blue };
    color: white;

    ::before {
      background: ${ p => p.theme.blue };
      border: 2px solid white;
    }
  }
`

const TemplateTable = styled.div`
  display: grid;
  grid-auto-columns: max-content;
  grid-gap: 10px;
  overflow-x: auto;

  & > * {
    font-size: 14px;
    padding: 5px 10px;
  }
`

const TemplateHeader = styled.div`
  background: white;
  font-weight: bold;
  grid-column: 1;
  left: 0;
  padding-left: 0;
  position: sticky;
`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////


const randomNum = () => parseInt(Array(4).fill("").map(() => Math.ceil(Math.random() * 9)).join(""))

const Toggle = ({ label, value, onChange, errors=[] }) => {
  const id = randomNum()

  const handleChange = e => {
    if (e.target.checked) {
      onChange(e.target.value)
    }
  }
  
  return (
    <ToggleContainer className={ errors.length ? "has-error" : "" }>
      <Label>{ label }</Label>
      <Label htmlFor="required-true">
        <input
          type="radio"
          id="required-true"
          name={ `is-required-${id}` }
          value="true"
          checked={ value === "true" }
          onChange={ handleChange }
        />
        yes
      </Label>
      <Label htmlFor="required-false">
        <input
          type="radio"
          id="required-false"
          name={ `is-required-${id}` }
          value="false"
          checked={ value === "false" }
          onChange={ handleChange }
        />
        no
      </Label>
      { errors.map((err, i) => <InputError key={ i }>{ err }</InputError>) }
    </ToggleContainer>
  )
}

const Stepper = ({ currentStep, changeStep }) => (
  <StepContainer step={ currentStep }>
    { ["Details", "Template", "Review"].map((step, i) => {
      const complete = i < currentStep
      const selected = i === currentStep
      return (
        <Step
          key={ i }
          onClick={ () => changeStep(i) }
          {...{ complete, selected }}
        >
          { complete ? <Check /> : i+1 }
          <StepLabel>{ step }</StepLabel>
        </Step>
      )
    })}
  </StepContainer>
)

const Header = ({ currentStep, changeStep }) => {
  return (
    <PageHeader>
      <h1>Create new dataset</h1>
      <Stepper {...{ currentStep, changeStep }} />
    </PageHeader>
  )
}

const handleCancel = () => window.location.pathname = "/"

const DetailsContainer = ({ details, setDetails, errors }) => {
  const firstInput = useRef()

  useEffect(() => {
    firstInput.current.focus()
  }, [])

  return (
    <>
      <InputContainer
        ref={ firstInput }
        required
        name="name"
        label="Name"
        type="text"
        errors={ errors[0] }
        value={ details.name || "" }
        onChange={ e => setDetails({ ...details, name: e.target.value }) }
      />
      <InputContainer
        required
        name="description"
        label="Description"
        type="textarea"
        errors={ errors[1] }
        value={ details.description || "" }
        onChange={ e => setDetails({ ...details, description: e.target.value }) }
      />
    </>
  )
}

const simpleDataTypes = [
  { label: "Text", value: "string" },
  { label: "Number", value: "number" },
  { label: "True/False", value: "boolean" },
]

const GlobalOptionsSelection = ({ options, selected, onChange }) => {
  const handleClick = op => {
    const isSelected = selected.includes(op)
    onChange(isSelected
      ? selected.filter(item => item !== op)
      : [...selected, op])
  }
  return (
    <GlobalOptionsContainer>
      <Label>Available options</Label>
      <Description>Click to select valid options for this column</Description>
      { options.map((op, i) => (
        <GlobalOption
          key={ i }
          selected={ selected.includes(op) }
          onClick={ () => handleClick(op) }
        >{ op }</GlobalOption>
      )) }
    </GlobalOptionsContainer>
  )
}

const TemplateItem = ({ item, dataTypes, updateItem, deleteItem, errors=[] }, ref) => {
  const [ globalOptions, setGlobalOptions ] = useState()
  const firstInput = useRef()
  const api = useAPI()

  useEffect(() => {
    firstInput.current.focus()
  }, [])

  useEffect(() => {
    if (item.type && item.type.value) {
      const { label, value } = item.type
      const [ type, datasetId ] = value.split("__")
      if (type === "global") {
        api.get(`/data/global/${datasetId}/options`)
          .then(res => {
            setGlobalOptions(res.data.ops)
          }).catch(console.error)
      } else {
        setGlobalOptions()
      }
    }
  }, [ api, item.type ])

  const handleChange = update => {
    const updater = {
      ...item,
      ...update
    }
    if (update.type && updater.options) delete updater.options
    updateItem(updater)
  }

  return (
    <TemplateItemContainer>
      <InputContainer
        ref={ firstInput }
        required
        name="name"
        label="Column name"
        type="text"
        errors={ errors[0] }
        value={ item.name || "" }
        onChange={ e => handleChange({ name: e.target.value }) }
      />
      <InputContainer
        required
        name="name"
        label="Data type"
        type="select"
        className="select"
        errors={ errors[1] }
        value={ item.type || "" }
        options={ dataTypes }
        onChange={ data => handleChange({ type: data }) }
      />
      { globalOptions ? <GlobalOptionsSelection
        options={ globalOptions }
        selected={ item.options || [] }
        onChange={ data => handleChange({ options: data })}
      /> : "" }
      <Toggle
        label="Column is required"
        errors={ errors[2] }
        value={ item.required || "" }
        onChange={ data => handleChange({ required: data }) }
      />
      <Button onClick={ deleteItem }>Remove column</Button>
    </TemplateItemContainer>
  )
}

const TemplateContainer = ({ template, setTemplate, dataTypes, errors }) => {

  const updateItem = index => newItem => {
    const newTemplate = JSON.parse(JSON.stringify(template))
    newTemplate[index] = newItem
    setTemplate(newTemplate)
  }

  const deleteItem = item => () => {
    setTemplate(template.filter(el => el !== item))
  }

  const handleAdd = () => {
    setTemplate([...template, {}])
  }

  return (
    <div>
      { template.map((item, i) => (
        <TemplateItem
          key={ i }
          updateItem={ updateItem(i) }
          deleteItem={ deleteItem(item) }
          errors={ errors[i] }
          {...{ item, dataTypes }}
        />
      )) }
      <AddField onClick={ handleAdd }>Add column</AddField>
    </div>
  )
}

const ReviewContainer = ({ details, template, changeStep }) => {
  return (
    <div>
      <Label>Name</Label>
      <h1>{ details.name }</h1>
      <p style={{ maxWidth: "400px" }}>
        <Label>Description</Label>
        <br />
        { details.description }
      </p>
      <Button onClick={ () => changeStep(0) }>Edit details</Button>
      <br />
      <br />
      <TemplateTable>
        <TemplateHeader>Column name</TemplateHeader>
        <TemplateHeader>Data type</TemplateHeader>
        <TemplateHeader>Is required</TemplateHeader>
        { template.map((prop, i) => (
          <>
            <div style={{ gridRow: 1, gridColumn: i + 2 }}>{ prop.name }</div>
            <div style={{ gridRow: 2, gridColumn: i + 2 }}>{ prop.type.label }</div>
            <div style={{ gridRow: 3, gridColumn: i + 2 }}>{ prop.required }</div>
          </>
        )) }
      </TemplateTable>
      <Button onClick={ () => changeStep(1) }>Edit template</Button>
    </div>
  )
}

const generateSchema = (details, template) => {
  const schemaObject = {
    title: details.name,
    type: "object",
    required: [],
    properties: {}
  }

  template.forEach(property => {
    const id = uuid()
    const { name, type, options } = property
    const isGlobal = type.value.split("__")[0] === "global"

    const schemaType = isGlobal ? "string" : type.value
    const dataType = isGlobal ? type.value : null
    
    if (property.required) schemaObject.required.push(id)
    schemaObject.properties[id] = {
      title: name,
      type: schemaType,
      ...isGlobal && { "data-type": dataType },
      ...options && { enum: options }
    }
  })

  return schemaObject
}

const DataCreate = () => {
  const [ step, setStep ] = useState(0)
  const [ details, setDetails ] = useState({})
  const [ template, setTemplate ] = useState([{}])
  const [ dataTypes, setDataTypes ] = useState(simpleDataTypes)
  const [ errors, setErrors ] = useState({ details: [], template: [] })
  
  const { user } = useAuth0()
  const api = useAPI()

  useEffect(() => {
    api.get("/data/global")
       .then(res => {
        setDataTypes([
          {
            label: "Simple types",
            options: simpleDataTypes
          },
          {
            label: "Global data",
            options: res.data.map(dataset => ({
              label: dataset.name,
              value: `global__${ dataset.id }`
            }))
          }
        ])
       }).catch(console.error)
  }, [ api ])

  const checkErrors = () => {
    const newErrors = { details: [], template: [] }
    
    if ([0, 2].includes(step)) {
      if (!details.name) newErrors.details[0] = ["name is required"]
      if (!details.description) newErrors.details[1] = ["description is required"]
    }

    if ([1, 2].includes(step)) {
      template.forEach((field, i) => {
        const fieldProps = ["name", "type", "required"]
        const fieldErrors = []
        fieldProps.forEach((prop, i) => {
          if (!field[prop]) fieldErrors[i] = [ "is required" ]
        })
        if (fieldErrors.length) newErrors.template[i] = fieldErrors
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).some(key => newErrors[key].length)
  }

  const save = async () => {
    const datasetDetails = JSON.parse(JSON.stringify(details))
    const { email, name } = user
    const schema = generateSchema(details, template)

    datasetDetails.owner = { name, email }

    const created = await api.post(`/user/create-dataset`, {
      details: datasetDetails,
      template: schema
    }).catch(console.error)
    
    if (created && created.data.id) window.location.pathname = `/${created.data.id}`
  }

  const changeStep = newStep => { if (!checkErrors()) setStep(newStep) }
  const next = () => { if (!checkErrors()) setStep(step + 1) }
  const back = () => setStep(step - 1)

  const stepContent = [
    <DetailsContainer {...{ details, setDetails, errors: errors.details }} />,
    <TemplateContainer {...{ template, setTemplate, dataTypes, errors: errors.template }} />,
    <ReviewContainer {...{ details, template, changeStep }} />
  ]

  return (
    <Page>
      <Header currentStep={ step } changeStep={ changeStep } />
      <Container isReview={ step === 2 }>
        { stepContent[step] }
        <ButtonContainer>
          <Button onClick={ step < 2 ? next : save } buttonType="fill">{ step < 2 ? "Next" : "Create" }</Button>
          { step ? <Button onClick={ back }>Back</Button> : "" }
          <Button buttonType="text" onClick={ handleCancel }>Cancel</Button>
        </ButtonContainer>
      </Container>
    </Page>
  )
}

export default DataCreate