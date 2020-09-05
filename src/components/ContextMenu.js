///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////
//////                                                           //////
//////    This component should only be used in App.js           //////
//////    All other files should use useContextMenu to update    //////
//////                                                           //////
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

import React, { useState, useEffect, useRef } from "react"
import styled from "styled-components"

import { useContextMenu } from "../customHooks"

import { callIfFunction } from "../utils"

const menuWidth = 175
const menuItemHeight = 30

const ActionsMenu = styled.ul.attrs(p => {
  const [x, y] = (p.position || [0, 0])
  return {
    style: {
      display: p.isOpen ? "block" : "none",
      left: x,
      top: y,
      width: menuWidth
    }
  }
})`
  background: white;
  border-radius: 1px;
  box-shadow: 0 2px 6px 2px #3c404326;
  list-style: none;
  margin: 0;
  padding: 5px 0;
  position: absolute;
  top: 5px;
  z-index: 2;
`

const ActionMenuItem = styled.button.attrs(() => ({
  onMouseOver: e => e.target.focus(),
  height: menuItemHeight
}))`
  background: white;
  border: none;
  display: block;
  line-height: 30px;
  padding: 0 10px 0 30px;
  text-align: left;
  width: 100%;

  &:focus {
    background: #BBDFFF;
    outline: none;
  }
`

const MenuBreak = styled.div.attrs(() => ({
  "aria-disabled": "true",
  role: "separator"
}))`
  border-top: 1px solid #ddd;
  margin: 8px 0 8px 30px;
  user-select: none;
`

const defaultState = {
  isOpen: false,
  position: [0, 0],
  actions: []
}

const MenuActionItem = ({ option }) => (
  <li {...option.disabled && {"aria-disabled": option.disabled}}>
    <ActionMenuItem
      disabled={ option.disabled }
      onMouseDown={ option.action }
    >
      { option.label }
    </ActionMenuItem>
  </li>
)

const ContextMenu = () => {
  const [ menuState, setMenuState ] = useState(defaultState)
  const menus = useContextMenu()
  const menuContainer = useRef()

  const closeMenu = () => {
    setMenuState({ isOpen: false })
  }

  useEffect(() => {
    const handleEvent = e => {
      const { target: { dataset }, clientX: x, clientY: y } = e
      const { contextmenu: menu, contextdata: data } = dataset

      if (menu) {
        e.preventDefault()
        const { options, onOpen } = menus[menu]

        const opAction = (op) => () => { closeMenu(); op.action(data) }
        const ops = options.map(op => op === "break" ? op : ({
          label: callIfFunction(op.label, data),
          action: opAction(op),
          disabled: callIfFunction(op.disabled, data)
        }))
        
        const { innerWidth: width, innerHeight: height } = window
        const minX = width - menuWidth
        const minY = height - (menuItemHeight * options.length + 20)
        const position = [
          x > minX ? x - menuWidth : x,
          y > minY ? minY : y
        ]

        if (onOpen) onOpen(data)
        
        setMenuState({
          isOpen: true,
          options: ops,
          position
        })
      }
    }
    document.addEventListener("contextmenu", handleEvent)
    return () => document.removeEventListener("contextmenu", handleEvent)
  }, [ menus ])

  useEffect(() => {
    if (menuState.isOpen) {
      menuContainer.current.firstChild.firstChild.focus()
    }
  }, [ menuState ])

  const handleMenuBlur = e => {
    if (!e.relatedTarget) closeMenu()
  }

  const handleMenuKeyDown = e => {
    if (e.key === "Escape") closeMenu()
    
    if (!["Tab", "ArrowDown", "ArrowUp"].includes(e.key)) return

    const children = Array.from(e.currentTarget.children)
      .filter(ch => ch.tagName === "LI" && !ch.attributes["aria-disabled"])
      .map(ch => ch.firstChild)
    const first = children[0]
    const last = children[children.length - 1]
    
    // trap focus inside menu while menu is open
    if (e.key === "Tab") {
      if (e.target === first && e.shiftKey) {
        e.preventDefault()
        last.focus()
      }
      if (e.target === last && !e.shiftKey) {
        e.preventDefault()
        first.focus()
      }
    }

    // allow arrow keys to navigate menu
    if (e.key === "ArrowDown") {
      if (e.target === last) {
        first.focus()
      } else {
        children[children.indexOf(e.target) + 1].focus()
      }
    }
    if (e.key === "ArrowUp") {
      if (e.target === first) {
        last.focus()
      } else {
        children[children.indexOf(e.target) - 1].focus()
      }
    }
  }

  return (
    <ActionsMenu
      {...menuState}
      ref={ menuContainer }
      onKeyDown={ handleMenuKeyDown }
      onBlur={ handleMenuBlur }
    >
      { (menuState.options || []).map((op, i) => op === "break" ? (
        <MenuBreak key={ i } />
      ) : (
        <MenuActionItem key={ i } option={ op } close={ closeMenu } />
      )) }
    </ActionsMenu>
  )
}

export default ContextMenu