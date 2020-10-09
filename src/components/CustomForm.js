import React from 'react'
import styled, { css } from 'styled-components'
import { withTheme } from '@rjsf/core'

import {
  InputContainer,
  Label,
  InputError,
  AddField,
  ButtonGroup
} from '../components'


////////////////////////////////////////
//////                            //////
//////      Component Styles      //////
//////                            //////

const formWidth = "450px"

const formStyle = css`
  max-width: ${formWidth};

  input, select, textarea {
    max-width: unset;
  }

  textarea {
    resize: vertical;
  }
`

const rootTitleStyle = css`
  font-size: 18px;
  margin-bottom: 30px;
  font-weight: 500;
`

const GroupLabel = styled(Label)`
  display: block;
  font-size: 14px;
  margin-bottom: 20px;

  #root > & {
    ${rootTitleStyle}
  }
`

const formGroupStyles = css`
  background: #EBEBEB;
  border-radius: 1px;
  padding: 15px 20px 20px;
  width: 100%;
`

const FormGroupWrapper = styled.div`
  display: grid;
  grid-gap: 15px;
  grid-template: ${p => p.grid || "auto"};

  ${p => p.gridAreas
    ? p.gridAreas.map((a, i) => (
      `> :nth-child(${i+1}) { grid-area: ${a}; }`
    )).join(" ")
    : "" }
  
  ${p => p.isGroup ? formGroupStyles : ""}
`

const TemplateContainer = styled.div`
  
`

const Toolbar = styled.div`
  border-top: 1px solid #aaa;
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  padding-top: 20px;

  .button-group {
    margin: 0;

    &:not(:first-child) {
      margin-left: 10px;
    }

    button {
      font-size: 12px;
      font-weight: 500;
      margin: 0;

      &:not(:disabled) + button {
        border-left: none;
      }
      
      &:not(:first-child):not(:last-child) {
        border-radius: 0;
      }

      &:first-child:not(:last-child) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      &:last-child:not(:first-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      &:disabled {
        &:not(:last-child) {
          border-right: none;
        }
      }
    }
  }
`

const formStepStyle = css`
  border-left: 2px solid #5B5B5B;
  margin-bottom: 20px;
  margin-left: 15px;
  padding-left: 40px;
  position: relative;

  &::before {
    background: #5B5B5B;
    border: 14px solid white;
    border-radius: 50%;
    color: white;
    content: "${p => p.step}";
    font-size: 14px;
    font-weight: bold;
    height: 30px;
    left: -29px;
    line-height: 30px;
    position: absolute;
    text-align: center;
    top: -22px;
    width: 30px;
  }
`

const FieldContainer = styled.div`
  ${p => p.step ? formStepStyle : ""}
`

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////


// This is required to allow our default fields to control their own labels, etc.
const FieldTemplate = ({uiSchema, children}) => (
  <FieldContainer step={ uiSchema["ui:form-step"] }>
    { children }
  </FieldContainer>
)

const ObjectFieldTemplate = ({
  title,
  properties,
  required,
  uiSchema,
  idSchema
}) => {
  return (
    <TemplateContainer
      id={ idSchema["$id"] }
      direction={ uiSchema["ui:flex-direction"] }
    >
      { title ? (
        <GroupLabel>
          { title }
          {/* { title && !required ? <RequiredSpan>(Optional)</RequiredSpan> : "" } */}
        </GroupLabel>
      ) : "" }
      <FormGroupWrapper
        isGroup={ !!uiSchema["ui:form-group"] }
        grid={ uiSchema["ui:grid-template"] }
        gridAreas={ uiSchema["ui:grid-areas"] }
      >
        { properties.map(prop => prop.content) }
      </FormGroupWrapper>
    </TemplateContainer>
  )
}

const ArrayFieldToolbar = ({
  index,
  actions,
  permissions
}) => {
  const moveUp = actions.onReorderClick(index, index - 1)
  const moveDown = actions.onReorderClick(index, index + 1)
  const removeItem = actions.onDropIndexClick(index)
  const addAbove = actions.onAddIndexClick(index)
  const addBelow = actions.onAddIndexClick(index + 1)
  
  const moveActions = [
    { label: "Move Up", value: moveUp, disabled: !permissions.hasMoveUp },
    { label: "Move Down", value: moveDown, disabled: !permissions.hasMoveDown }
  ]
  const addActions = [
    { label: "Add Above", value: addAbove },
    { label: "Add Below", value: addBelow }
  ]
  const removeAction = [
    { label: "Remove field", value: removeItem, disabled: !permissions.hasRemove }
  ]
  return (
    <Toolbar style={{ justifyContent: "space-between" }}>
      <ButtonGroup actions={ moveActions } />
      <ButtonGroup actions={ removeAction } />
      {/* <ButtonGroup actions={ addActions } /> */}
    </Toolbar>
  )
}

const ArrayFieldItem = ({
  children,
  hasMoveDown,
  hasMoveUp,
  hasRemove,
  hasToolbar,
  index,
  onAddIndexClick,
  onDropIndexClick,
  onReorderClick
}) => {
  const field = React.cloneElement(children, {
    uiSchema: {
      ...children.props.uiSchema,
      "ui:form-group": false
    }
  })
  const toolbarActions = {onAddIndexClick, onDropIndexClick, onReorderClick}
  const toolbarPermissions= {hasMoveDown, hasMoveUp, hasRemove}
  return (
    <FormGroupWrapper isGroup={ !!children.props.uiSchema["ui:form-group"] }>
      { field }
      { hasToolbar ? (
        <ArrayFieldToolbar
          {...{index}}
          actions={ toolbarActions }
          permissions={ toolbarPermissions }
        />
      ) : "" }
    </FormGroupWrapper>
  )
}

const ArrayFieldTemplate = ({
  title,
  items,
  required,
  canAdd,
  onAddClick,
  uiSchema,
  idSchema,
  rawErrors=[]
}) => {
  return (
    <TemplateContainer
      id={ idSchema["$id"] }
      direction={ uiSchema["ui:flex-direction"] }
    >
      <GroupLabel hasError={ rawErrors.length }>
        { title }
        {/* { !required ? <RequiredSpan>(Optional)</RequiredSpan> : "" } */}
      </GroupLabel>
      { rawErrors.map((err, i) => <InputError key={ i }>{ err }</InputError>) }
      <FormGroupWrapper
        isGroup={ !!uiSchema["ui:form-group"] }
        grid={ uiSchema["ui:grid-template"] }
      >
        { items.map(item => <ArrayFieldItem { ...item } />) }
      </FormGroupWrapper>
      { canAdd ? <AddField onClick={ onAddClick }>Add Field</AddField> : "" }
    </TemplateContainer>
  )
}

const formatEnum = schema => {
  return schema.enum.map((option, i) => ({
    value: option,
    label: schema.enumNames
      ? schema.enumNames[i]
      : option
  }))
}

const formatGroups = schema => {
  const groups = {}
  schema.anyOf.forEach(option => {
    let { title: label, enum: [ value ], group="options" } = option
    if (!label) label = value
    if (!groups[group]) groups[group] = []
    groups[group].push({ value, label })
  })
  return Object.keys(groups).map(key => ({
    label: key,
    options: groups[key]
  }))
}

const formatAnyOf = schema => {
  if (schema.anyOf[0].group) return formatGroups(schema)

  return schema.anyOf.map(option => {
    let { title: label, enum: [ value ] } = option
    if (!label) label = value
    return { value, label }
  })
}

const formatOptions = schema => {
  return schema.enum
    ? formatEnum(schema)
    : formatAnyOf(schema)
}

const getSelectedFromGroup = (options, formData) => {
  return options
    .reduce((ops, group) => [...ops, ...group.options], [])
    .find(op => op.value === formData)
}

const getSelected = (options, formData) => {
  if (options[0].options) return getSelectedFromGroup(options, formData)
  return options.find(op => op.value === formData)
}

const StringField = ({
  schema,
  uiSchema,
  idSchema,
  formData,
  errorSchema,
  onChange,
  rawErrors,
  required,
  disabled,
  readonly,
  onBlur,
  onFocus
}) => {
  const inputType = ["textarea", "email", "select"].includes(uiSchema["ui:widget"])
    ? uiSchema["ui:widget"]
    : schema.enum
      ? "select"
      : schema.type === "string"
        ? "text"
        : schema.type
    
  const selectOptions = inputType === "select"
    ? formatOptions(schema)
    : null
  
  const inputValue = inputType === "select"
    ? getSelected(selectOptions, formData)
    : formData || ""
  
  const handleChange = e => {
    const value = inputType === "select"
      ? e.value
      : e.target.value
    onChange(value, errorSchema)
  }
  return (
    <InputContainer
      id={ idSchema["$id"] }
      label={ schema.title }
      type={ inputType }
      value={ inputValue }
      errors={ rawErrors }
      onChange={ handleChange }
      options={ inputType === "select" && selectOptions }
      { ...{ onBlur,onFocus, disabled, readonly, required }}
      { ...schema.description && { description: schema.description }}
    />
  )
}

const BooleanField = ({
  schema,
  idSchema,
  formData,
  errorSchema,
  onChange,
  rawErrors,
  required,
  disabled,
  readonly,
  onBlur,
  onFocus,
  uiSchema
}) => (
  <InputContainer
    id={ idSchema["$id"] }
    label={ schema.title }
    type="checkbox"
    value={ formData || false }
    errors={ rawErrors }
    checked={ !!formData }
    onChange={ e => onChange(e.target.checked, errorSchema) }
    {...{ onBlur,onFocus, disabled, readonly, required }}
    { ...schema.description && { description: schema.description }}
  />
)

const theme = {
  showErrorList: false,
  ArrayFieldTemplate,
  ObjectFieldTemplate,
  FieldTemplate,
  fields: {
    StringField,
    BooleanField
  }
}

const FormWithTheme = withTheme(theme)
const Form = styled(FormWithTheme)`${formStyle}`

export default Form