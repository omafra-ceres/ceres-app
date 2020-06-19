import React from 'react'
import styled, { css } from 'styled-components'
import Select from 'react-select'

const inlineStyle = css`
  align-items: center;
  flex-direction: row-reverse;
  justify-content: flex-end;
  
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

  > input, > textarea {
    ${ p => p.hasError ? "border-color: red;" : "" }

    &:focus {
      outline: none;
      border-color: #2684ff;
      box-shadow: 0 0 0 1px #2684ff;
    }
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

  ${ p => p.hasError ? "color: red;" : "" }

  ${InputWrapper}[disabled] & {
    color: #aaa;
  }
`

const Input = styled.input`
  border: 1px solid gray;
  border-radius: 1px;
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
  border-radius: 1px;
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

const StyledSelect = styled(Select).attrs(() => ({
  classNamePrefix: "styled-select"
}))`
  margin-top: 5px;

  .styled-select__control {
    border: 1px solid gray;
    border-radius: 1px;
    font-size: 16px;
    height: 30px;
    max-width: 200px;
    min-height: 30px;

    &:hover {
      border-color: gray;
    }
  }
  
  .styled-select__control--is-focused {
    border-color: #2684ff;
    box-shadow: 0 0 0 1px #2684ff;
  }

  .styled-select__value-container {
    height: 30px;
    padding: 0 0 0 10px;
  }
  
  .styled-select__input {
    margin: 0;
  }

  .styled-select__indicators-container {
    height: 30px;
  }
  
  .styled-select__indicator-separator {
    display: none;
  }
  
  .styled-select__dropdown-indicator {
    padding: 0 8px;
  }
  
  .styled-select__menu {
    border: 1px solid #2684ff;
    border-top: none;
    box-shadow: 0 -2px 0 -1px white, 0 0 0 1px #2684ff;
    border-radius: 1px;
    margin-top: -1px;
  }
`

const Checkbox = styled.input.attrs(() => ({
  type: "checkbox"
}))`
  height: 20px;
  margin: 0;
  position: relative;
  width: 20px;

  &::after {
    background: white;
    border: 1px solid gray;
    border-radius: 1px;
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

  &:focus {
    outline: none;

    ::after {
      border-color: #2684ff;
      box-shadow: 0 0 0 1px #2684ff;
    }
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
  select: StyledSelect,
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
        { !required ? <RequiredSpan>(Optional)</RequiredSpan> : "" }
      </Label>
      <InputTag
        {...{
          id,
          value,
          onChange,
          type,
          readOnly: readonly,
          ...internalProps
        }}
      />
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