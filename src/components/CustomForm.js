import React from 'react'
import styled, { css } from 'styled-components'
import { withTheme } from '@rjsf/core'

import InputContainer, {
  Label,
  RequiredSpan,
  InputError,
  Description
} from '../components/InputContainer'


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
  margin-bottom: 15px;
  font-weight: 500;
`

const GroupLabel = styled(Label)`
  display: block;
  margin-bottom: 5px;

  #root > & {
    ${rootTitleStyle}
  }
`

const formGroupStyles = css`
  background: #eee;
  border-radius: 4px;
  padding: 12px 15px 15px;
  width: 100%;
`

const FormGroupWrapper = styled.div`
  display: grid;
  grid-gap: 10px;
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

const buttonStyle = css`
  background: white;
  border: 1px solid ${p => p.theme.text};
  border-radius: 4px;
  box-shadow: 0px 2px 2px #8888;
  box-sizing: border-box;
  color: ${p => p.theme.text};
  font-size: 12px;
  font-weight: bold;
  margin: 5px 0;
  padding: 5px;
  text-align: center;
  text-transform: uppercase;

  &:disabled {
    border-color: #aaa;
    color: #aaa;
  }
`

const Button = styled.button.attrs(props => ({
  type: "button"
}))`
  ${ buttonStyle }
  min-width: 100px;

  &:active {
    box-shadow: inset 0px 2px 2px #8884;
  }
`

const Submit = styled(Button).attrs(props => ({
  type: "submit"
}))`
  background: ${p => p.theme.text};
  color: white;
`

const Remove = styled(Button)`
  border: none;
  box-shadow: none;
  color: gray;
  font-size: 28px;
  font-weight: lighter;
  grid-row: 2;
  height: 30px;
  line-height: 0;
  width: 30px;
`

const ButtonGroupContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  margin: 10px 0;

  > div {
    color: ${p => p.theme.text};
  }

  button {
    min-width: unset;
  }

  > *:not(:first-child) {
    margin-left: 5px;
  }
`

const Toolbar = styled.div`
  display: flex;
  flex-direction: row;
  /* margin: 10px 0; */
  flex-grow: 1;

  ${ ButtonGroupContainer } {
    margin: 0;

    &:not(:first-child) {
      margin-left: 10px;
    }

    button {
      font-size: 10px;
      font-weight: 500;
      margin: 0;
      text-transform: unset;

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

//////                            //////
//////      Component Styles      //////
//////                            //////
////////////////////////////////////////


const ButtonGroup = ({ actions }) => {
  return actions.length > 1 ? (
    <ButtonGroupContainer>
      { actions.map(action => (
        <Button
          key={ action.label }
          disabled={ action.disabled }
          onClick={ action.value }
        >
          { action.label }
        </Button>
      ))}
    </ButtonGroupContainer>
  ) : (
    <ButtonGroupContainer>
      <Button
        disabled={ actions[0].disabled }
        onClick={ actions[0].value }
      >
        { actions[0].label }
      </Button>
    </ButtonGroupContainer>
  )
}

// This is required to allow our default fields to control their own labels, etc.
const FieldTemplate = props => props.children

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
          { title && required ? <RequiredSpan>(Required)</RequiredSpan> : "" }
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
    <Toolbar>
      <ButtonGroup actions={ moveActions } />
      <ButtonGroup actions={ addActions } />
      <ButtonGroup actions={ removeAction } />
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
        { required ? <RequiredSpan>(Required)</RequiredSpan> : "" }
      </GroupLabel>
      { rawErrors.map((err, i) => <InputError key={ i }>{ err }</InputError>) }
      <FormGroupWrapper
        isGroup={ !!uiSchema["ui:form-group"] }
        grid={ uiSchema["ui:grid-template"] }
      >
        { items.map(item => <ArrayFieldItem { ...item } />) }
      </FormGroupWrapper>
      { canAdd ? <Button onClick={ onAddClick }>Add Field</Button> : "" }
    </TemplateContainer>
  )
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
  const inputType = uiSchema["ui:widget"] === "textarea"
    ? "textarea"
    : schema.enum
      ? "select"
      : "text"
  return (
    <InputContainer
      id={ idSchema["$id"] }
      label={ schema.title }
      type={ inputType }
      value={ formData || "" }
      errors={ rawErrors }
      onChange={ e => onChange(e.target.value, errorSchema) }
      options={ schema.enum && schema.enum.map((el, i) => ({
        value: el,
        label: schema.enumNames ? schema.enumNames[i] : el
      })) }
      {...{ onBlur,onFocus, disabled, readonly, required }}
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
    value={ formData || "" }
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
const StyledForm = styled(FormWithTheme)`${formStyle}`
const Form = props => <StyledForm {...props}><Submit>Submit</Submit></StyledForm>

export default Form