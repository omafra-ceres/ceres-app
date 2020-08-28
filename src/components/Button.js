import React from 'react'
import styled, { css } from 'styled-components'

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
  min-width: 100px;
  padding: 5px;
  text-align: center;

  &:disabled {
    border-color: #aaa;
    color: #aaa;
  }

  &:focus {
    outline: none;
    border-color: #2684ff;
    box-shadow: 0 0 0 1px #2684ff;
  }
`

const textButtonStyle = css`
  background: none;
  border: none;
  box-shadow: none;
  min-width: none;
  padding: 5px 20px;
`

const fillButtonStyle = css`
  background: ${p => p.theme.blue};
  border-color: ${p => p.theme.blue};
  color: white;

  &:disabled {
    background: #ddd;
    border-color: #ddd;
    color: #aaa;
  }
`

const buttonsStyles = {
  fill: fillButtonStyle,
  text: textButtonStyle
}

const Button = styled.button.attrs(props => ({
  type: props.type || "button"
}))`
  ${ buttonStyle }
  ${ p => buttonsStyles[p.buttonType] || "" }

  &:active {
    box-shadow: inset 0px 2px 2px #8884;
  }
`

const AddField = styled(Button)`
  background: none;
  border-color: #0000;
  box-shadow: none;
  height: 30px;
  margin-top: 20px;
  min-width: unset;
  padding-left: 38px;
  position: relative;

  &::before {
    align-items: center;
    background: ${p => p.theme.blue};
    border-radius: 50%;
    color: white;
    content: "+";
    display: flex;
    font-size: 24px;
    font-weight: bolder;
    height: 30px;
    justify-content: center;
    left: 0;
    position: absolute;
    top: -1px;
    width: 30px;
  }
`

const ButtonGroupContainer = styled.div.attrs(p => ({
  classNames: `${p.classNames} button-group`,
}))`
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

export {
  Button as default,
  AddField,
  ButtonGroup
}