import React from 'react'
import styled, { css } from 'styled-components'

const inlineStyle = css`
  align-items: center;
  flex-direction: row-reverse;
  justify-self: flex-start;
  
  [direction="row"] > &:not(:first-child) {
    margin-left: 0;
  }
  
  label {
    font-weight: 500;
    margin-left: 5px;
    text-transform: unset;
  }
`

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* margin-bottom: 10px; */

  ${p => p.inline ? inlineStyle : ""}

  input, select, textarea {
    ${ p => p.hasError ? "border-color: red;" : "" }
  }

  label {
    ${ p => p.hasError ? "color: red;" : "" }
  }
`

const Label = styled.label`
  color: ${p => p.theme.text};
  font-size: 12px;
  font-weight: bold;
  line-height: 16px;
  text-transform: uppercase;

  ${ p => p.hasError ? "color: red;" : "" }

  ${InputWrapper}[disabled] & {
    color: #aaa;
  }
`

const Input = styled.input`
  border: 1px solid gray;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  height: 30px;
  margin: 5px 0 0;
  max-width: 200px;
  padding: 5px 10px;
  
  ${ p => p.hasError ? "border-color: red;" : "" }

  ${InputWrapper}[disabled] & {
    border-color: #aaa;
    color: #aaa;
  }
`

const Textarea = styled.textarea`
  border: 1px solid gray;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  height: 90px;
  margin: 5px 0 0;
  max-width: 200px;
  padding: 5px 10px;
  
  ${ p => p.hasError ? "border-color: red;" : "" }

  ${InputWrapper}[disabled] & {
    border-color: #aaa;
    color: #aaa;
  }
`

const Select = styled.select`
  border: 1px solid gray;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
  height: 30px;
  margin: 5px 0 0;
  max-width: 200px;
  padding: 5px 10px;
  
  ${ p => p.hasError ? "border-color: red;" : "" }

  ${InputWrapper}[disabled] & {
    border-color: #aaa;
    color: #aaa;
  }
`

const Checkbox = styled.input.attrs(props => ({
  type: "checkbox"
}))`
  height: 20px;
  margin: 0;
  position: relative;
  width: 20px;

  &::after {
    background: white;
    border: 1px solid gray;
    border-radius: 4px;
    bottom: 0;
    content: "";
    font-size: 16px;
    left: 0;
    line-height: 18px;
    pointer-events: none;
    position: absolute;
    right: 0;
    text-align: center;
    top: 0;
  }

  &:checked::after {
    content: "✓";
  }

  &:focus::after {
    outline: rgba(0, 103, 244, 0.247) auto 5px;
    outline-offset: -2px;
  }

  ${InputWrapper}[disabled] & {
    border-color: #aaa;
    color: #aaa;
  }
`

const InputError = styled.div`
  color: red;
  font-size: 12px;
  font-weight: bold;
  margin-left: 10px;
  position: relative;

  &::before {
    content: "•";
    left: -10px;
    position: absolute;
  }
`

const RequiredSpan = styled.span`
  font-size: 12px;
  font-weight: normal;
  margin-left: 5px;
  text-transform: initial;
`

const Description = styled.div`
  color: ${p => p.theme.text};
  font-size: 10px;
  font-weight: 500;

  ${InputWrapper}[disabled] & {
    color: #aaa;
  }
`

const inputs = {
  input: Input,
  checkbox: Checkbox,
  select: Select,
  textarea: Textarea
}

const getInputTag = type => {
  return Object.keys(inputs).includes(type)
    ? inputs[type]
    : Input
}

const InputContainer = ({
  id,
  label,
  value,
  onChange,
  type="text",
  errors=[],
  options,
  className="",
  required,
  readonly,
  description="",
  ...internalProps
}) => {
  let InputTag = getInputTag(type)
  return (
    <InputWrapper
      hasError={ !!errors.length }
      className={ className }
      disabled={ internalProps.disabled }
      inline={ type === "checkbox" }
    >
      <Label htmlFor={ id }>
        { label }
        { required ? <RequiredSpan>(Required)</RequiredSpan> : "" }
      </Label>
      <InputTag {...{id, value, onChange, type, readOnly: readonly, ...internalProps}}>
        { options ? options.map((op, i) => <option key={ i } value={op.value}>{ op.label }</option>) : null }
      </InputTag>
      { description ? <Description>{ description }</Description> : "" }
      { errors.map((err, i) => <InputError key={ i }>{ err }</InputError>) }
    </InputWrapper>
  )
}

export {
  InputContainer as default,
  Label,
  Input,
  Select,
  Textarea,
  Checkbox,
  RequiredSpan,
  InputError,
  Description
}